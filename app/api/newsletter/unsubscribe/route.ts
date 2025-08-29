/**
 * Newsletter Unsubscription API Route
 * 
 * Next.js 15 App Router API route for handling newsletter unsubscriptions.
 * Implements secure token-based unsubscription with comprehensive logging.
 * Integrates with Supabase database and uses Newsletter Kit type definitions.
 * 
 * Features:
 * - TypeScript strict mode with Newsletter Kit types
 * - Secure token-based unsubscription
 * - Comprehensive validation and sanitization
 * - Rate limiting for security
 * - Unsubscription reason tracking
 * - Audit logging and analytics
 * - Production-ready error handling
 * - RESTful HTTP status codes and responses
 * 
 * @version 1.0.0
 * @route POST /api/newsletter/unsubscribe
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/server';
import { rateLimit, env, isProduction } from '@/lib/env';
import { z } from 'zod';
import crypto from 'crypto';

// Newsletter Kit types
import type {
  UnsubscribeRequest,
  SubscriptionError,
  ValidatedEmail,
  SubscriptionId,
  ISOTimestamp,
  ApiResponse
} from '@/lib/newsletter-kit/types';

// ========================= CONSTANTS =========================
const RATE_LIMIT_CONFIG = {
  maxRequests: isProduction ? 5 : 20,
  windowMs: isProduction ? 10 * 60 * 1000 : 5 * 60 * 1000, // 10 min prod, 5 min dev
} as const;

const UNSUBSCRIBE_REASONS = [
  'too_frequent',
  'not_relevant',
  'never_signed_up',
  'privacy_concerns',
  'technical_issues',
  'content_quality',
  'other'
] as const;

// ========================= TYPE DEFINITIONS =========================
interface UnsubscribeResponse extends ApiResponse<{
  subscription_id: SubscriptionId;
  email: ValidatedEmail;
  unsubscribed_at: ISOTimestamp;
  reason?: string;
}> {}

interface DatabaseSubscription {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed' | 'pending';
  source?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  subscribed_at: string;
  unsubscribe_token?: string;
  verified: boolean;
}

interface UnsubscribeLog {
  id: string;
  subscription_id: string;
  email: string;
  reason?: string;
  user_agent?: string;
  ip_address?: string;
  unsubscribed_at: string;
  metadata?: Record<string, unknown>;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  tokens: Set<string>; // Track used tokens to prevent replay attacks
}

// ========================= VALIDATION SCHEMAS =========================
const unsubscribeRequestSchema = z.object({
  token: z
    .string()
    .min(1, 'Unsubscribe token is required')
    .max(128, 'Invalid token format')
    .regex(/^[a-f0-9]{64}$/, 'Invalid token format'),
  reason: z
    .enum(UNSUBSCRIBE_REASONS)
    .optional(),
  feedback: z
    .string()
    .max(1000, 'Feedback cannot exceed 1000 characters')
    .optional()
});

// Alternative schema for email-based unsubscription (fallback)
const emailUnsubscribeSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .transform(val => val.trim().toLowerCase()),
  confirm: z
    .literal(true, { errorMap: () => ({ message: 'Confirmation is required' }) })
});

// ========================= RATE LIMITING =========================
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

function checkRateLimit(identifier: string, token?: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  reason?: 'rate_limit' | 'token_reuse';
} {
  const now = Date.now();
  const key = `unsubscribe:${identifier}`;
  let entry = rateLimitStore.get(key);

  // Initialize or reset if expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
      tokens: new Set()
    };
    rateLimitStore.set(key, entry);
  }

  // Check for token reuse (security measure)
  if (token && entry.tokens.has(token)) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      reason: 'token_reuse'
    };
  }

  // Check rate limit
  if (entry.count >= RATE_LIMIT_CONFIG.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      reason: 'rate_limit'
    };
  }

  // Increment and track
  entry.count++;
  if (token) {
    entry.tokens.add(token);
  }

  return {
    allowed: true,
    remaining: RATE_LIMIT_CONFIG.maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

// ========================= UNSUBSCRIPTION LOGIC =========================
async function processUnsubscription(
  token: string,
  reason?: string,
  feedback?: string,
  clientInfo?: {
    userAgent?: string;
    ipAddress?: string;
  }
): Promise<{
  success: boolean;
  error?: SubscriptionError;
  data?: {
    subscription_id: SubscriptionId;
    email: ValidatedEmail;
    unsubscribed_at: ISOTimestamp;
    reason?: string;
  };
}> {
  if (!supabaseAdmin) {
    return {
      success: false,
      error: {
        code: 'database_unavailable',
        message: 'Database service is not available',
        retryable: false
      }
    };
  }

  try {
    // Find subscription by unsubscribe token
    const { data: subscription, error: findError } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('*')
      .eq('unsubscribe_token', token)
      .single();

    if (findError) {
      if (findError.code === 'PGRST116') { // No rows found
        return {
          success: false,
          error: {
            code: 'validation_token',
            message: 'Invalid or expired unsubscribe token',
            retryable: false
          }
        };
      }
      throw new Error(`Failed to find subscription: ${findError.message}`);
    }

    // Check if already unsubscribed
    if (subscription.status === 'unsubscribed') {
      return {
        success: true,
        data: {
          subscription_id: subscription.id as SubscriptionId,
          email: subscription.email as ValidatedEmail,
          unsubscribed_at: new Date().toISOString() as ISOTimestamp,
          reason
        }
      };
    }

    const now = new Date().toISOString() as ISOTimestamp;

    // Begin transaction-like operations
    // 1. Update subscription status
    const { error: updateError } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .update({
        status: 'unsubscribed',
        metadata: {
          ...(subscription.metadata || {}),
          unsubscribed_at: now,
          unsubscribe_reason: reason,
          unsubscribe_feedback: feedback
        }
      })
      .eq('id', subscription.id);

    if (updateError) {
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    // 2. Create unsubscription log entry
    const unsubscribeLogData: Omit<UnsubscribeLog, 'id'> = {
      subscription_id: subscription.id,
      email: subscription.email,
      reason,
      user_agent: clientInfo?.userAgent?.substring(0, 500), // Limit length
      ip_address: clientInfo?.ipAddress,
      unsubscribed_at: now,
      metadata: {
        original_source: subscription.source,
        original_tags: subscription.tags,
        feedback,
        subscription_duration: subscription.subscribed_at 
          ? Math.floor((new Date().getTime() - new Date(subscription.subscribed_at).getTime()) / (1000 * 60 * 60 * 24))
          : null
      }
    };

    const { error: logError } = await supabaseAdmin
      .from('unsubscription_logs')
      .insert([unsubscribeLogData]);

    if (logError) {
      console.error('Failed to create unsubscription log:', logError);
      // Don't fail the whole operation for logging errors
    }

    return {
      success: true,
      data: {
        subscription_id: subscription.id as SubscriptionId,
        email: subscription.email as ValidatedEmail,
        unsubscribed_at: now,
        reason
      }
    };

  } catch (error) {
    console.error('Unsubscription processing failed:', error);
    
    return {
      success: false,
      error: {
        code: 'database_error',
        message: 'Failed to process unsubscription',
        retryable: true,
        details: { 
          originalError: error instanceof Error ? error.message : String(error) 
        }
      }
    };
  }
}

async function processEmailUnsubscription(
  email: string,
  clientInfo?: {
    userAgent?: string;
    ipAddress?: string;
  }
): Promise<{
  success: boolean;
  error?: SubscriptionError;
  data?: {
    subscription_id: SubscriptionId;
    email: ValidatedEmail;
    unsubscribed_at: ISOTimestamp;
  };
}> {
  if (!supabaseAdmin) {
    return {
      success: false,
      error: {
        code: 'database_unavailable',
        message: 'Database service is not available',
        retryable: false
      }
    };
  }

  try {
    // Find active subscription by email
    const { data: subscription, error: findError } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email)
      .eq('status', 'active')
      .single();

    if (findError) {
      if (findError.code === 'PGRST116') { // No rows found
        return {
          success: false,
          error: {
            code: 'validation_email',
            message: 'No active subscription found for this email address',
            retryable: false
          }
        };
      }
      throw new Error(`Failed to find subscription: ${findError.message}`);
    }

    const now = new Date().toISOString() as ISOTimestamp;

    // Update subscription status
    const { error: updateError } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .update({
        status: 'unsubscribed',
        metadata: {
          ...(subscription.metadata || {}),
          unsubscribed_at: now,
          unsubscribe_method: 'email_confirmation'
        }
      })
      .eq('id', subscription.id);

    if (updateError) {
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    // Create log entry
    const { error: logError } = await supabaseAdmin
      .from('unsubscription_logs')
      .insert([{
        subscription_id: subscription.id,
        email: subscription.email,
        reason: 'other',
        user_agent: clientInfo?.userAgent?.substring(0, 500),
        ip_address: clientInfo?.ipAddress,
        unsubscribed_at: now,
        metadata: {
          method: 'email_confirmation',
          original_source: subscription.source,
          original_tags: subscription.tags
        }
      }]);

    if (logError) {
      console.error('Failed to create unsubscription log:', logError);
    }

    return {
      success: true,
      data: {
        subscription_id: subscription.id as SubscriptionId,
        email: email as ValidatedEmail,
        unsubscribed_at: now
      }
    };

  } catch (error) {
    console.error('Email unsubscription processing failed:', error);
    
    return {
      success: false,
      error: {
        code: 'database_error',
        message: 'Failed to process unsubscription',
        retryable: true,
        details: { 
          originalError: error instanceof Error ? error.message : String(error) 
        }
      }
    };
  }
}

// ========================= UTILITY FUNCTIONS =========================
function createErrorResponse(
  error: SubscriptionError,
  statusCode: number = 500
): NextResponse<UnsubscribeResponse> {
  const timestamp = new Date().toISOString() as ISOTimestamp;
  
  return NextResponse.json(
    {
      success: false,
      error: error.message,
      code: error.code,
      timestamp
    },
    { 
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Error-Code': error.code
      }
    }
  );
}

function getClientInfo(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip');
  const userAgent = request.headers.get('user-agent');
  
  return {
    ipAddress: forwarded?.split(',')[0] || cfIp || realIp || 'unknown',
    userAgent: userAgent || undefined
  };
}

// ========================= MAIN API HANDLER =========================

/**
 * POST /api/newsletter/unsubscribe
 * 
 * Unsubscribe from newsletter using token or email confirmation
 * 
 * Request Body (Token-based):
 * - token: string (required) - Unsubscribe token from email link
 * - reason: string (optional) - Reason for unsubscribing
 * - feedback: string (optional) - Additional feedback
 * 
 * Request Body (Email-based fallback):
 * - email: string (required) - Email address to unsubscribe
 * - confirm: boolean (required) - Must be true
 * 
 * Response:
 * - 200: Unsubscription successful
 * - 400: Invalid request/validation error
 * - 404: Subscription not found
 * - 429: Rate limit exceeded
 * - 500: Server error
 */
export async function POST(request: NextRequest): Promise<NextResponse<UnsubscribeResponse>> {
  const timestamp = new Date().toISOString() as ISOTimestamp;
  const clientInfo = getClientInfo(request);

  try {
    // Validate Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const error: SubscriptionError = {
        code: 'validation_content_type',
        message: 'Content-Type must be application/json'
      };
      return createErrorResponse(error, 400);
    }

    // Parse request body
    let requestBody: unknown;
    try {
      requestBody = await request.json();
    } catch {
      const error: SubscriptionError = {
        code: 'validation_json',
        message: 'Invalid JSON in request body'
      };
      return createErrorResponse(error, 400);
    }

    // Rate limiting check
    const rateCheck = checkRateLimit(
      clientInfo.ipAddress, 
      typeof requestBody === 'object' && requestBody !== null && 'token' in requestBody 
        ? (requestBody as any).token 
        : undefined
    );
    
    if (!rateCheck.allowed) {
      const statusCode = 429;
      const message = rateCheck.reason === 'token_reuse' 
        ? 'This unsubscribe token has already been used.'
        : 'Too many unsubscribe attempts. Please wait before trying again.';

      const error: SubscriptionError = {
        code: rateCheck.reason === 'token_reuse' ? 'security_token_reuse' : 'rate_limit_exceeded',
        message,
        retryable: rateCheck.reason !== 'token_reuse',
        retryAfter: Math.ceil((rateCheck.resetTime - Date.now()) / 1000)
      };

      const response = createErrorResponse(error, statusCode);
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', rateCheck.remaining.toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil(rateCheck.resetTime / 1000).toString());
      if (rateCheck.reason === 'rate_limit') {
        response.headers.set('Retry-After', Math.ceil((rateCheck.resetTime - Date.now()) / 1000).toString());
      }

      return response;
    }

    // Try token-based unsubscription first
    let tokenValidation = unsubscribeRequestSchema.safeParse(requestBody);
    
    if (tokenValidation.success) {
      const { token, reason, feedback } = tokenValidation.data;

      const result = await processUnsubscription(
        token, 
        reason, 
        feedback, 
        clientInfo
      );

      if (!result.success) {
        return createErrorResponse(result.error!, 
          result.error!.code === 'validation_token' ? 404 : 500
        );
      }

      // Success response
      const responseData: UnsubscribeResponse = {
        success: true,
        data: result.data!,
        timestamp
      };

      return NextResponse.json(responseData, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
          'X-RateLimit-Remaining': rateCheck.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateCheck.resetTime / 1000).toString(),
        }
      });
    }

    // Try email-based unsubscription as fallback
    const emailValidation = emailUnsubscribeSchema.safeParse(requestBody);
    
    if (emailValidation.success) {
      const { email } = emailValidation.data;

      const result = await processEmailUnsubscription(email, clientInfo);

      if (!result.success) {
        return createErrorResponse(result.error!,
          result.error!.code === 'validation_email' ? 404 : 500
        );
      }

      // Success response
      const responseData: UnsubscribeResponse = {
        success: true,
        data: result.data!,
        timestamp
      };

      return NextResponse.json(responseData, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
          'X-RateLimit-Remaining': rateCheck.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateCheck.resetTime / 1000).toString(),
        }
      });
    }

    // Neither validation succeeded
    const error: SubscriptionError = {
      code: 'validation_schema',
      message: 'Invalid request. Provide either a valid token or email with confirmation.',
      details: {
        tokenErrors: tokenValidation.error?.flatten(),
        emailErrors: emailValidation.error?.flatten()
      }
    };
    
    return createErrorResponse(error, 400);

  } catch (error) {
    console.error('Unexpected error in POST /api/newsletter/unsubscribe:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      clientIp: clientInfo.ipAddress,
      timestamp
    });

    const subscriptionError: SubscriptionError = {
      code: 'server_internal',
      message: 'An unexpected error occurred. Please try again later.',
      retryable: true
    };

    return createErrorResponse(subscriptionError, 500);
  }
}

/**
 * GET /api/newsletter/unsubscribe?token=...
 * 
 * HTML page for unsubscribe confirmation (for email links)
 * This provides a user-friendly interface for users clicking unsubscribe links
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing unsubscribe token',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }

  // Validate token format
  const tokenValidation = z.string().regex(/^[a-f0-9]{64}$/).safeParse(token);
  if (!tokenValidation.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid token format',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      },
      { status: 400 }
    );
  }

  // For GET requests, we'll return a simple JSON response
  // In a real application, you might want to return an HTML page
  return NextResponse.json(
    {
      success: true,
      message: 'To complete unsubscription, send a POST request with this token',
      data: {
        token,
        endpoint: '/api/newsletter/unsubscribe',
        method: 'POST',
        required_fields: {
          token: 'The unsubscribe token',
          reason: 'Optional reason for unsubscribing',
          feedback: 'Optional feedback'
        }
      },
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}

// ========================= OTHER HTTP METHODS =========================
const methodNotAllowedResponse = NextResponse.json(
  {
    success: false,
    error: 'Method not allowed. This endpoint supports GET and POST requests only.',
    code: 'METHOD_NOT_ALLOWED',
    timestamp: new Date().toISOString()
  } satisfies UnsubscribeResponse,
  { 
    status: 405,
    headers: { 'Allow': 'GET, POST' }
  }
);

export async function PUT(): Promise<NextResponse<UnsubscribeResponse>> {
  return methodNotAllowedResponse;
}

export async function DELETE(): Promise<NextResponse<UnsubscribeResponse>> {
  return methodNotAllowedResponse;
}

export async function PATCH(): Promise<NextResponse<UnsubscribeResponse>> {
  return methodNotAllowedResponse;
}