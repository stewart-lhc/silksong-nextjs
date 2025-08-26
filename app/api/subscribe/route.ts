/**
 * Secure Double Opt-in Email Subscription API Route
 * 
 * SECURITY FEATURES:
 * - Double opt-in confirmation process
 * - Secure token generation with SHA256 + salt
 * - Atomic file operations to prevent race conditions
 * - 48-hour token expiration
 * - Email normalization and validation
 * - Rate limiting with IP and email tracking
 * - No sensitive information in error responses or logs
 * - Duplicate prevention for pending subscriptions
 * 
 * OWASP Security References:
 * - A07:2021 – Identification and Authentication Failures
 * - A04:2021 – Insecure Design
 * - A02:2021 – Cryptographic Failures
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/env';
import { 
  validateEmailFormat, 
  createPendingToken, 
  secureLog 
} from '@/lib/double-optin-security';
import { sendConfirmationEmail } from '@/lib/email-transport';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number; lastEmail?: string; lastEmailTime?: number }>();

// Clean up expired rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Email validation is now handled by double-optin-security module

/**
 * Enhanced rate limiting with email-specific logic for double opt-in
 * Prevents abuse while allowing legitimate subscription attempts
 */
function checkRateLimit(identifier: string, email?: string): { 
  allowed: boolean; 
  remaining: number; 
  resetTime: number;
  reason?: string;
} {
  const now = Date.now();
  const windowMs = rateLimit.windowMs;
  const maxRequests = rateLimit.maxRequests;
  
  const key = `subscribe:${identifier}`;
  const current = rateLimitStore.get(key);
  
  // Check for same email within 60 seconds (prevents spam)
  if (email && current?.lastEmail === email && current?.lastEmailTime) {
    const timeSinceLastEmail = now - current.lastEmailTime;
    if (timeSinceLastEmail < 60000) { // 60 seconds
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: current.lastEmailTime + 60000,
        reason: 'Too frequent requests'
      };
    }
  }
  
  if (!current || now > current.resetTime) {
    // Reset or initialize
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { 
      count: 1, 
      resetTime,
      lastEmail: email,
      lastEmailTime: email ? now : undefined
    });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }
  
  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }
  
  // Increment count and update email info
  current.count += 1;
  if (email) {
    current.lastEmail = email;
    current.lastEmailTime = now;
  }
  rateLimitStore.set(key, current);
  
  return { allowed: true, remaining: maxRequests - current.count, resetTime: current.resetTime };
}

/**
 * POST /api/subscribe - Secure Double Opt-in Email Subscription
 * 
 * Process:
 * 1. Validate and normalize email address
 * 2. Check rate limits to prevent abuse
 * 3. Check for existing pending tokens
 * 4. Generate secure token and create pending subscription
 * 5. Send confirmation email
 * 6. Return success response without sensitive information
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';
    
    // Parse and validate request body
    let body;
    try {
      const contentType = request.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        secureLog('invalid_content_type', 'unknown', { 
          contentType,
          clientIp 
        });
        return NextResponse.json(
          { error: 'Content-Type must be application/json' },
          { status: 400 }
        );
      }
      body = await request.json();
    } catch {
      secureLog('invalid_json', 'unknown', { clientIp });
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { email, source = 'web' } = body;
    
    // Validate required fields
    if (!email || typeof email !== 'string') {
      secureLog('missing_email', 'unknown', { 
        hasEmail: !!email, 
        emailType: typeof email,
        clientIp 
      });
      return NextResponse.json(
        { error: 'Email is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate and sanitize email using security module
    const validation = validateEmailFormat(email);
    if (!validation.success) {
      secureLog('email_validation_failed', email, { 
        code: validation.code,
        clientIp 
      });
      return NextResponse.json(
        { 
          error: validation.error,
          code: validation.code 
        },
        { status: 400 }
      );
    }

    const normalizedEmail = validation.data!;

    // Rate limiting with email-specific check
    const rateCheck = checkRateLimit(clientIp, normalizedEmail);
    if (!rateCheck.allowed) {
      const statusCode = rateCheck.reason === 'Too frequent requests' ? 429 : 429;
      const errorMessage = rateCheck.reason === 'Too frequent requests' 
        ? 'Please wait before subscribing again' 
        : 'Rate limit exceeded';
      
      secureLog('rate_limit_exceeded', normalizedEmail, { 
        reason: rateCheck.reason,
        clientIp,
        resetTime: rateCheck.resetTime 
      });
      
      return NextResponse.json(
        { 
          error: errorMessage,
          code: 'RATE_LIMITED',
          resetTime: rateCheck.resetTime 
        },
        { 
          status: statusCode,
          headers: {
            'X-RateLimit-Limit': rateLimit.maxRequests.toString(),
            'X-RateLimit-Remaining': rateCheck.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateCheck.resetTime / 1000).toString(),
          }
        }
      );
    }

    // Create pending token (includes duplicate check)
    const tokenResult = await createPendingToken(normalizedEmail);
    if (!tokenResult.success) {
      if (tokenResult.code === 'ALREADY_PENDING') {
        secureLog('already_pending', normalizedEmail, { clientIp });
        return NextResponse.json(
          { 
            error: 'Confirmation email already sent',
            message: 'Please check your email and click the confirmation link',
            code: 'ALREADY_PENDING'
          },
          { status: 409 } // Conflict
        );
      }
      
      secureLog('token_creation_failed', normalizedEmail, { 
        code: tokenResult.code,
        clientIp 
      });
      return NextResponse.json(
        { error: 'Failed to process subscription request' },
        { status: 500 }
      );
    }

    const token = tokenResult.data!;

    // Send confirmation email
    const emailResult = await sendConfirmationEmail(normalizedEmail, token);
    if (!emailResult.success) {
      secureLog('email_send_failed', normalizedEmail, { 
        code: emailResult.code,
        clientIp 
      });
      // Don't expose email sending errors to client
      return NextResponse.json(
        { error: 'Failed to send confirmation email' },
        { status: 500 }
      );
    }

    secureLog('subscription_request_created', normalizedEmail, { 
      messageId: emailResult.messageId,
      clientIp,
      source 
    });

    // Success response (no sensitive information exposed)
    return NextResponse.json(
      { 
        success: true,
        message: 'Confirmation email sent! Please check your inbox and click the confirmation link to complete your subscription.',
        code: 'EMAIL_SENT'
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimit.maxRequests.toString(),
          'X-RateLimit-Remaining': rateCheck.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateCheck.resetTime / 1000).toString(),
        }
      }
    );
  } catch (error) {
    secureLog('unexpected_error', 'unknown', { 
      error: (error as Error).message,
      stack: (error as Error).stack 
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle other HTTP methods with 405 Method Not Allowed
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        'Allow': 'POST',
      },
    }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        'Allow': 'POST',
      },
    }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        'Allow': 'POST',
      },
    }
  );
}

export async function PATCH(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { 
      status: 405,
      headers: {
        'Allow': 'POST',
      },
    }
  );
}