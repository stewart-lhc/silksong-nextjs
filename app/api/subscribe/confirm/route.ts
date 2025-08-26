/**
 * Email Subscription Confirmation API Route
 * 
 * Handles GET /api/subscribe/confirm?token=... endpoint for double opt-in confirmation
 * 
 * SECURITY FEATURES:
 * - Token validation with format and expiration checks
 * - Protection against token replay attacks  
 * - Atomic confirmation process (token cleanup + subscriber addition)
 * - Idempotent operations (safe to call multiple times)
 * - No sensitive information in error responses
 * - Secure logging without email exposure
 * 
 * HTTP Status Codes:
 * - 200: Successfully confirmed (or already confirmed)
 * - 400: Invalid token format
 * - 404: Token not found
 * - 410: Token expired (Gone)
 * - 500: Internal server error
 * 
 * OWASP Security References:
 * - A07:2021 – Identification and Authentication Failures
 * - A04:2021 – Insecure Design
 * - A02:2021 – Cryptographic Failures
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { validateToken, confirmSubscription, secureLog } from '@/lib/double-optin-security';

/**
 * GET /api/subscribe/confirm - Confirm email subscription with token
 * 
 * Process:
 * 1. Extract and validate token from query parameters
 * 2. Validate token format and existence
 * 3. Check token expiration (48 hours)
 * 4. Add email to subscribers list (idempotent)
 * 5. Clean up pending token
 * 6. Return appropriate response
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';
    
    // Extract token from query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    // Validate token parameter presence
    if (!token) {
      secureLog('confirmation_missing_token', 'unknown', { clientIp });
      return NextResponse.json(
        { 
          success: false,
          error: 'Confirmation token is required',
          code: 'TOKEN_REQUIRED'
        },
        { status: 400 }
      );
    }
    
    // Basic token format validation
    if (typeof token !== 'string' || !/^[a-f0-9]{32}$/.test(token)) {
      secureLog('confirmation_invalid_token_format', 'unknown', { 
        tokenLength: token.length,
        clientIp 
      });
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid confirmation token format',
          code: 'TOKEN_INVALID_FORMAT'
        },
        { status: 400 }
      );
    }
    
    // Validate token (includes expiration check)
    const validation = await validateToken(token);
    if (!validation.success) {
      // Log validation failure (token is safe to log as it's not email)
      secureLog('confirmation_token_validation_failed', 'unknown', { 
        code: validation.code,
        token: token.substring(0, 8), // Only log first 8 chars
        clientIp 
      });
      
      // Handle different validation failure types
      switch (validation.code) {
        case 'TOKEN_NOT_FOUND':
          return NextResponse.json(
            { 
              success: false,
              error: 'Confirmation token not found',
              message: 'The token may have already been used or is invalid',
              code: 'TOKEN_NOT_FOUND'
            },
            { status: 404 }
          );
          
        case 'TOKEN_EXPIRED':
          return NextResponse.json(
            { 
              success: false,
              error: 'Confirmation token expired',
              message: 'Confirmation links expire after 48 hours for security. Please subscribe again.',
              code: 'TOKEN_EXPIRED'
            },
            { status: 410 } // 410 Gone - resource no longer available
          );
          
        case 'TOKEN_MISMATCH':
        case 'TOKEN_INVALID':
          return NextResponse.json(
            { 
              success: false,
              error: 'Invalid confirmation token',
              code: 'TOKEN_INVALID'
            },
            { status: 400 }
          );
          
        default:
          return NextResponse.json(
            { 
              success: false,
              error: 'Token validation failed',
              code: 'TOKEN_VALIDATION_FAILED'
            },
            { status: 500 }
          );
      }
    }
    
    const tokenData = validation.data!;
    const email = tokenData.email;
    
    // Attempt to confirm subscription (includes idempotency check)
    const confirmation = await confirmSubscription(token);
    if (!confirmation.success) {
      secureLog('confirmation_failed', email, { 
        code: confirmation.code,
        clientIp 
      });
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to confirm subscription',
          code: confirmation.code || 'CONFIRMATION_FAILED'
        },
        { status: 500 }
      );
    }
    
    // Successful confirmation
    const isAlreadyConfirmed = confirmation.data === 'Already subscribed';
    
    secureLog('confirmation_success', email, { 
      alreadyConfirmed: isAlreadyConfirmed,
      clientIp 
    });
    
    return NextResponse.json(
      { 
        success: true,
        message: isAlreadyConfirmed 
          ? 'Email subscription already confirmed' 
          : 'Email subscription confirmed successfully',
        code: isAlreadyConfirmed ? 'ALREADY_CONFIRMED' : 'CONFIRMED'
      },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          // Cache control to prevent caching of confirmation responses
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    secureLog('confirmation_unexpected_error', 'unknown', { 
      error: (error as Error).message,
      stack: (error as Error).stack 
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle other HTTP methods with 405 Method Not Allowed
 * Only GET is allowed for confirmation endpoint
 */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed. Use GET with token parameter.',
      code: 'METHOD_NOT_ALLOWED'
    },
    { 
      status: 405,
      headers: {
        'Allow': 'GET',
      },
    }
  );
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed. Use GET with token parameter.',
      code: 'METHOD_NOT_ALLOWED'
    },
    { 
      status: 405,
      headers: {
        'Allow': 'GET',
      },
    }
  );
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed. Use GET with token parameter.',
      code: 'METHOD_NOT_ALLOWED'
    },
    { 
      status: 405,
      headers: {
        'Allow': 'GET',
      },
    }
  );
}

export async function PATCH(): Promise<NextResponse> {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed. Use GET with token parameter.',
      code: 'METHOD_NOT_ALLOWED'
    },
    { 
      status: 405,
      headers: {
        'Allow': 'GET',
      },
    }
  );
}