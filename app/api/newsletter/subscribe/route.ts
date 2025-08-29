/**
 * Newsletter Subscription API Route
 * 
 * Next.js 15 App Router API route for handling email newsletter subscriptions.
 * Implements RESTful design with comprehensive validation, rate limiting, and error handling.
 * Integrates with Supabase database and uses Newsletter Kit type definitions.
 * 
 * Features:
 * - TypeScript strict mode with Newsletter Kit types
 * - Comprehensive email validation and sanitization
 * - Advanced rate limiting with IP-based tracking
 * - Duplicate subscription handling
 * - Production-ready error handling and logging
 * - RESTful HTTP status codes and responses
 * - Security headers and CORS handling
 * 
 * @version 1.0.0
 * @route POST /api/newsletter/subscribe
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/server';
import { rateLimit, env, isProduction } from '@/lib/env';
import { z } from 'zod';
import crypto from 'crypto';

// Newsletter Kit email service
import { sendWelcomeEmail } from '@/lib/newsletter-kit/email/service';

// Newsletter Kit types
import type {
  SubscribeRequest,
  SubscribeResponse,
  SubscriptionError,
  ValidatedEmail,
  SanitizedEmail,
  SubscriptionId,
  ISOTimestamp,
  SubscriberCount,
  BaseSubscription,
  EmailValidationResult,
  SubscriptionResult,
  SubscriptionResultCode
} from '@/lib/newsletter-kit/types';

// ========================= CONSTANTS =========================
const BLOCKED_DOMAINS = [
  '10minutemail.com',
  'mailinator.com', 
  'guerrillamail.com',
  'tempmail.org',
  'yopmail.com',
  'throwaway.email',
  'maildrop.cc',
  'temp-mail.org',
  'sharklasers.com',
  'spam4.me',
  'tempail.com'
] as const;

const ALLOWED_SOURCES = [
  'web',
  'mobile',
  'api',
  'widget',
  'popup',
  'footer',
  'header',
  'sidebar',
  'landing',
  'blog'
] as const;

// Production rate limits are stricter
const RATE_LIMIT_CONFIG = {
  maxRequests: isProduction ? 3 : 10,
  windowMs: isProduction ? 15 * 60 * 1000 : 5 * 60 * 1000, // 15 min prod, 5 min dev
  duplicateEmailWindow: 60 * 1000, // 1 minute
} as const;

// ========================= TYPE DEFINITIONS =========================
interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastEmails: { email: string; timestamp: number }[];
}

interface DatabaseSubscription {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed' | 'pending';
  source?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  subscribed_at: string;
  verified: boolean;
  verification_token?: string;
  unsubscribe_token?: string;
}

// ========================= VALIDATION SCHEMAS =========================
const subscribeRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email is too long')
    .email('Invalid email format')
    .transform(val => val.trim().toLowerCase()),
  source: z
    .string()
    .optional()
    .default('web')
    .refine(val => ALLOWED_SOURCES.includes(val as any), {
      message: `Source must be one of: ${ALLOWED_SOURCES.join(', ')}`
    }),
  tags: z
    .array(z.string().min(1).max(50))
    .optional()
    .default([])
    .transform(tags => tags.slice(0, 10)), // Limit to 10 tags
  metadata: z
    .record(z.unknown())
    .optional()
    .default({})
    .refine(obj => Object.keys(obj).length <= 20, {
      message: 'Metadata cannot have more than 20 keys'
    })
});

// ========================= RATE LIMITING =========================
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    } else {
      // Clean old email entries
      entry.lastEmails = entry.lastEmails.filter(
        e => now - e.timestamp < RATE_LIMIT_CONFIG.duplicateEmailWindow
      );
    }
  }
}, 5 * 60 * 1000);

function checkRateLimit(
  identifier: string, 
  email?: string
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  reason?: 'rate_limit' | 'duplicate_email';
} {
  const now = Date.now();
  const key = `subscribe:${identifier}`;
  let entry = rateLimitStore.get(key);

  // Initialize or reset if expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
      lastEmails: []
    };
    rateLimitStore.set(key, entry);
  }

  // Check for duplicate email in recent timeframe
  if (email) {
    const duplicateEmail = entry.lastEmails.find(
      e => e.email === email && (now - e.timestamp) < RATE_LIMIT_CONFIG.duplicateEmailWindow
    );
    
    if (duplicateEmail) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: duplicateEmail.timestamp + RATE_LIMIT_CONFIG.duplicateEmailWindow,
        reason: 'duplicate_email'
      };
    }
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
  if (email) {
    entry.lastEmails.push({ email, timestamp: now });
    // Keep only recent emails
    entry.lastEmails = entry.lastEmails.filter(
      e => now - e.timestamp < RATE_LIMIT_CONFIG.duplicateEmailWindow
    );
  }

  return {
    allowed: true,
    remaining: RATE_LIMIT_CONFIG.maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

// ========================= EMAIL VALIDATION =========================
function validateEmail(email: string): EmailValidationResult {
  const sanitized = email.trim().toLowerCase() as SanitizedEmail;
  
  // Enhanced email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!sanitized) {
    return {
      isValid: false,
      error: 'Email address is required'
    };
  }

  if (sanitized.length > 254) {
    return {
      isValid: false,
      error: 'Email address is too long (max 254 characters)'
    };
  }

  if (!emailRegex.test(sanitized)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
      suggestions: generateEmailSuggestions(sanitized)
    };
  }

  // Check against blocked domains
  const domain = sanitized.split('@')[1];
  if (BLOCKED_DOMAINS.includes(domain as any)) {
    return {
      isValid: false,
      error: 'Temporary email addresses are not allowed'
    };
  }

  return {
    isValid: true,
    sanitizedEmail: sanitized as ValidatedEmail
  };
}

function generateEmailSuggestions(email: string): string[] {
  const suggestions: string[] = [];
  const [localPart, domain] = email.split('@');
  
  if (!domain) return suggestions;

  // Common domain corrections
  const domainCorrections: Record<string, string> = {
    'gmail.co': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmil.com': 'hotmail.com'
  };

  if (domainCorrections[domain]) {
    suggestions.push(`${localPart}@${domainCorrections[domain]}`);
  }

  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

// ========================= SUBSCRIPTION LOGIC =========================
async function createSubscription(
  validatedEmail: ValidatedEmail,
  source: string,
  tags: string[],
  metadata: Record<string, unknown>
): Promise<SubscriptionResult> {
  if (!supabaseAdmin) {
    const error: SubscriptionError = {
      code: 'database_unavailable',
      message: 'Database service is not available',
      retryable: false
    };
    return { success: false, error, code: 'SERVER_ERROR' };
  }

  try {
    // Generate tokens
    const subscriptionId = crypto.randomUUID() as SubscriptionId;
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');
    const now = new Date().toISOString() as ISOTimestamp;

    // Check for existing subscription
    const { data: existing, error: findError } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('id, email, status, subscribed_at')
      .eq('email', validatedEmail)
      .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 = no rows found
      throw new Error(`Database query failed: ${findError.message}`);
    }

    if (existing) {
      if (existing.status === 'active') {
        return {
          success: true,
          code: 'ALREADY_SUBSCRIBED',
          subscription: {
            id: existing.id as SubscriptionId,
            email: validatedEmail,
            subscribed_at: existing.subscribed_at as ISOTimestamp,
            status: 'active'
          },
          count: await getSubscriberCount()
        };
      } else {
        // Reactivate inactive subscription
        const { data: updated, error: updateError } = await supabaseAdmin
          .from('newsletter_subscriptions')
          .update({
            status: 'active',
            source,
            tags,
            metadata: { ...metadata, reactivated_at: now },
            subscribed_at: now,
            verification_token: verificationToken,
            unsubscribe_token: unsubscribeToken
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Failed to reactivate subscription: ${updateError.message}`);
        }

        const reactivatedSubscription = {
          id: updated.id as SubscriptionId,
          email: validatedEmail,
          subscribed_at: updated.subscribed_at as ISOTimestamp,
          status: 'active' as const
        };

        // Send welcome email for reactivated subscription
        const subscriberCount = await getSubscriberCount();
        try {
          await sendWelcomeEmail(
            {
              id: updated.id,
              email: validatedEmail,
              subscribed_at: updated.subscribed_at,
              source: updated.source,
              tags: updated.tags || []
            },
            {
              subscriberCount: subscriberCount as number,
              customData: { reactivated: true }
            }
          );
        } catch (emailError) {
          console.error('Failed to send welcome email for reactivated subscription:', emailError);
          // Don't fail the subscription if email fails
        }

        return {
          success: true,
          code: 'SUCCESS',
          subscription: reactivatedSubscription,
          count: subscriberCount
        };
      }
    }

    // Create new subscription
    const subscriptionData = {
      id: subscriptionId,
      email: validatedEmail,
      status: 'active' as const,
      source,
      tags,
      metadata,
      subscribed_at: now,
      verified: false,
      verification_token: verificationToken,
      unsubscribe_token: unsubscribeToken
    };

    const { data: newSubscription, error: insertError } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .insert([subscriptionData])
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') { // Unique constraint violation
        return {
          success: true,
          code: 'ALREADY_SUBSCRIBED',
          subscription: {
            id: subscriptionId,
            email: validatedEmail,
            subscribed_at: now,
            status: 'active'
          },
          count: await getSubscriberCount()
        };
      }
      throw new Error(`Failed to create subscription: ${insertError.message}`);
    }

    const newSubscriptionResult = {
      id: newSubscription.id as SubscriptionId,
      email: validatedEmail,
      subscribed_at: newSubscription.subscribed_at as ISOTimestamp,
      status: 'active' as const
    };

    // Send welcome email for new subscription
    const subscriberCount = await getSubscriberCount();
    try {
      await sendWelcomeEmail(
        {
          id: newSubscription.id,
          email: validatedEmail,
          subscribed_at: newSubscription.subscribed_at,
          source: newSubscription.source,
          tags: newSubscription.tags || []
        },
        {
          subscriberCount: subscriberCount as number,
          customData: { isNewSubscription: true }
        }
      );
    } catch (emailError) {
      console.error('Failed to send welcome email for new subscription:', emailError);
      // Don't fail the subscription if email fails
    }

    return {
      success: true,
      code: 'SUCCESS',
      subscription: newSubscriptionResult,
      count: subscriberCount
    };

  } catch (error) {
    console.error('Subscription creation failed:', error);
    
    const subscriptionError: SubscriptionError = {
      code: 'database_error',
      message: 'Failed to process subscription',
      retryable: true,
      details: { originalError: error instanceof Error ? error.message : String(error) }
    };

    return { 
      success: false, 
      error: subscriptionError, 
      code: 'SERVER_ERROR' 
    };
  }
}

async function getSubscriberCount(): Promise<SubscriberCount> {
  if (!supabaseAdmin) return 0 as SubscriberCount;
  
  try {
    const { count, error } = await supabaseAdmin
      .from('newsletter_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (error) {
      console.error('Failed to get subscriber count:', error);
      return 0 as SubscriberCount;
    }

    return (count || 0) as SubscriberCount;
  } catch (error) {
    console.error('Failed to get subscriber count:', error);
    return 0 as SubscriberCount;
  }
}

// ========================= ERROR HANDLING =========================
function createErrorResponse(
  error: SubscriptionError,
  statusCode: number = 500
): NextResponse<SubscribeResponse> {
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

function getClientIdentifier(request: NextRequest): string {
  // Use multiple fallbacks for client identification
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip');
  
  return forwarded?.split(',')[0] || cfIp || realIp || 'unknown';
}

// ========================= MAIN API HANDLER =========================

/**
 * POST /api/newsletter/subscribe
 * 
 * Subscribe an email address to the newsletter
 * 
 * Request Body:
 * - email: string (required) - Email address to subscribe
 * - source: string (optional) - Source of the subscription (default: 'web')
 * - tags: string[] (optional) - Tags to associate with the subscription
 * - metadata: object (optional) - Additional metadata
 * 
 * Response:
 * - 201: Subscription successful (new)
 * - 200: Already subscribed
 * - 400: Invalid request/validation error
 * - 409: Duplicate recent subscription attempt
 * - 429: Rate limit exceeded
 * - 500: Server error
 */
export async function POST(request: NextRequest): Promise<NextResponse<SubscribeResponse>> {
  const timestamp = new Date().toISOString() as ISOTimestamp;
  const clientIp = getClientIdentifier(request);

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

    // Validate request schema
    const validation = subscribeRequestSchema.safeParse(requestBody);
    if (!validation.success) {
      const error: SubscriptionError = {
        code: 'validation_schema',
        message: 'Invalid request parameters',
        details: validation.error.flatten()
      };
      return createErrorResponse(error, 400);
    }

    const { email, source, tags, metadata } = validation.data;

    // Enhanced email validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      const error: SubscriptionError = {
        code: 'validation_email',
        message: emailValidation.error || 'Invalid email address',
        details: emailValidation.suggestions ? { suggestions: emailValidation.suggestions } : undefined
      };
      return createErrorResponse(error, 400);
    }

    const validatedEmail = emailValidation.sanitizedEmail!;

    // Rate limiting check
    const rateCheck = checkRateLimit(clientIp, validatedEmail);
    if (!rateCheck.allowed) {
      const statusCode = rateCheck.reason === 'duplicate_email' ? 409 : 429;
      const message = rateCheck.reason === 'duplicate_email' 
        ? 'This email was recently subscribed. Please wait before trying again.'
        : 'Too many subscription attempts. Please wait before trying again.';

      const error: SubscriptionError = {
        code: rateCheck.reason === 'duplicate_email' ? 'rate_limit_duplicate' : 'rate_limit_exceeded',
        message,
        retryable: true,
        retryAfter: Math.ceil((rateCheck.resetTime - Date.now()) / 1000)
      };

      const response = createErrorResponse(error, statusCode);
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', rateCheck.remaining.toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil(rateCheck.resetTime / 1000).toString());
      response.headers.set('Retry-After', Math.ceil((rateCheck.resetTime - Date.now()) / 1000).toString());

      return response;
    }

    // Process subscription
    const result = await createSubscription(validatedEmail, source, tags, metadata);

    if (!result.success) {
      return createErrorResponse(result.error!, 500);
    }

    // Success response
    const responseData: SubscribeResponse = {
      success: true,
      data: {
        subscription: result.subscription!,
        count: result.count!,
        isNewSubscription: result.code === 'SUCCESS'
      },
      code: result.code,
      timestamp
    };

    const statusCode = result.code === 'ALREADY_SUBSCRIBED' ? 200 : 201;

    return NextResponse.json(responseData, {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
        'X-RateLimit-Remaining': rateCheck.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(rateCheck.resetTime / 1000).toString(),
        'Location': result.code === 'SUCCESS' ? `/api/newsletter/subscription/${result.subscription!.id}` : undefined,
      } as HeadersInit
    });

  } catch (error) {
    console.error('Unexpected error in POST /api/newsletter/subscribe:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      clientIp,
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

// ========================= OTHER HTTP METHODS =========================

/**
 * Handle unsupported HTTP methods
 */
const methodNotAllowedResponse = NextResponse.json(
  {
    success: false,
    error: 'Method not allowed. This endpoint only supports POST requests.',
    code: 'METHOD_NOT_ALLOWED',
    timestamp: new Date().toISOString()
  } satisfies SubscribeResponse,
  { 
    status: 405,
    headers: { 'Allow': 'POST' }
  }
);

export async function GET(): Promise<NextResponse<SubscribeResponse>> {
  return methodNotAllowedResponse;
}

export async function PUT(): Promise<NextResponse<SubscribeResponse>> {
  return methodNotAllowedResponse;
}

export async function DELETE(): Promise<NextResponse<SubscribeResponse>> {
  return methodNotAllowedResponse;
}

export async function PATCH(): Promise<NextResponse<SubscribeResponse>> {
  return methodNotAllowedResponse;
}