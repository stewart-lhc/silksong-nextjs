/**
 * Enhanced Subscription API Route
 * Flexible API that can be easily ported to other Next.js projects
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { 
  SubscriptionRequest, 
  SubscriptionResponse,
  EmailSubscription 
} from '../../../types/email-subscription';
import { validateAndSanitizeEmail } from '../../../lib/email-validation';
import { getEnvironmentConfig } from '../../../config/email-subscription';

// This can be replaced with different database adapters
import { supabaseAdmin } from '@/lib/supabase/server';
import type { TablesInsert } from '@/types/supabase';

// Rate limiting store - replace with Redis in production
const rateLimitStore = new Map<string, { 
  count: number; 
  resetTime: number; 
  lastEmail?: string; 
  lastEmailTime?: number; 
}>();

// Clean up expired rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

/**
 * Database adapter interface - can be implemented for different databases
 */
interface DatabaseAdapter {
  insert: (data: SubscriptionRequest) => Promise<EmailSubscription>;
  count: () => Promise<number>;
  findByEmail: (email: string) => Promise<EmailSubscription | null>;
}

/**
 * Supabase database adapter
 */
const supabaseAdapter: DatabaseAdapter = {
  async insert(data: SubscriptionRequest): Promise<EmailSubscription> {
    if (!supabaseAdmin) {
      throw new Error('Database configuration error');
    }

    const subscriptionData: TablesInsert<'email_subscriptions'> = {
      email: data.email,
    };

    const { data: result, error } = await supabaseAdmin
      .from('email_subscriptions')
      .insert([subscriptionData])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('ALREADY_SUBSCRIBED');
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      id: result.id,
      email: result.email,
      subscribed_at: result.subscribed_at,
      source: data.source,
      metadata: data.metadata,
    };
  },

  async count(): Promise<number> {
    if (!supabaseAdmin) {
      throw new Error('Database configuration error');
    }

    const { count, error } = await supabaseAdmin
      .from('email_subscriptions')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Failed to get count: ${error.message}`);
    }

    return count || 0;
  },

  async findByEmail(email: string): Promise<EmailSubscription | null> {
    if (!supabaseAdmin) {
      throw new Error('Database configuration error');
    }

    const { data, error } = await supabaseAdmin
      .from('email_subscriptions')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database error: ${error.message}`);
    }

    return data ? {
      id: data.id,
      email: data.email,
      subscribed_at: data.subscribed_at,
    } : null;
  },
};

/**
 * Enhanced rate limiting with email-specific logic
 */
function checkRateLimit(identifier: string, email?: string): { 
  allowed: boolean; 
  remaining: number; 
  resetTime: number;
  reason?: string;
} {
  const config = getEnvironmentConfig();
  const now = Date.now();
  const windowMs = config.rateLimit.windowMs;
  const maxRequests = config.rateLimit.maxRequests;
  
  const key = `subscription:${identifier}`;
  const current = rateLimitStore.get(key);
  
  // Check for same email within specified time
  if (email && current?.lastEmail === email && current?.lastEmailTime) {
    const timeSinceLastEmail = now - current.lastEmailTime;
    if (timeSinceLastEmail < config.rateLimit.minTimeBetweenSubmissions) {
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: current.lastEmailTime + config.rateLimit.minTimeBetweenSubmissions,
        reason: 'Already subscribed recently'
      };
    }
  }
  
  if (!current || now > current.resetTime) {
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
  
  current.count += 1;
  if (email) {
    current.lastEmail = email;
    current.lastEmailTime = now;
  }
  rateLimitStore.set(key, current);
  
  return { allowed: true, remaining: maxRequests - current.count, resetTime: current.resetTime };
}

/**
 * GET /api/subscription - Get subscription count
 */
export async function GET(): Promise<NextResponse> {
  try {
    const count = await supabaseAdapter.count();
    
    return NextResponse.json(
      { count },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        }
      }
    );
  } catch (error) {
    console.error('Error fetching subscription count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription count', count: 0 },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscription - Subscribe with email
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const config = getEnvironmentConfig();
  
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';
    
    // Parse and validate request body
    let body: SubscriptionRequest;
    try {
      const contentType = request.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return NextResponse.json(
          { error: 'Content-Type must be application/json' } as SubscriptionResponse,
          { status: 400 }
        );
      }
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' } as SubscriptionResponse,
        { status: 400 }
      );
    }

    const { email, source = 'web', metadata = {} } = body;
    
    // Validate required fields
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required and must be a string' } as SubscriptionResponse,
        { status: 400 }
      );
    }

    // Validate and sanitize email
    const validation = validateAndSanitizeEmail(email, {
      emailMaxLength: config.validation.emailMaxLength,
      allowedDomains: config.validation.allowedDomains,
      blockedDomains: config.validation.blockedDomains,
      messages: {
        invalidEmail: config.messages.invalidEmail,
      },
    });
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error } as SubscriptionResponse,
        { status: 400 }
      );
    }

    // Rate limiting check
    const rateCheck = checkRateLimit(clientIp, validation.sanitized);
    if (!rateCheck.allowed) {
      const statusCode = rateCheck.reason === 'Already subscribed recently' ? 409 : 429;
      
      return NextResponse.json(
        { 
          error: rateCheck.reason || config.messages.rateLimit,
          resetTime: rateCheck.resetTime 
        } as SubscriptionResponse,
        { 
          status: statusCode,
          headers: {
            'X-RateLimit-Limit': config.rateLimit.maxRequests.toString(),
            'X-RateLimit-Remaining': rateCheck.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateCheck.resetTime / 1000).toString(),
          }
        }
      );
    }

    // Prepare subscription data
    const subscriptionData: SubscriptionRequest = {
      email: validation.sanitized,
      source,
      metadata: {
        ...metadata,
        ip: clientIp,
        userAgent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
      },
    };

    // Insert subscription
    try {
      const subscription = await supabaseAdapter.insert(subscriptionData);
      
      // Send welcome email automatically after successful subscription
      try {
        const response = await fetch(`${request.nextUrl.origin}/api/newsletter/send-welcome`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: validation.sanitized,
            subscriptionId: subscription.id,
            source: source || 'web',
          }),
        });

        if (!response.ok) {
          console.error('Failed to send welcome email:', await response.text());
        } else {
          console.log('Welcome email sent to:', validation.sanitized);
        }
      } catch (emailError) {
        console.error('Error sending welcome email:', emailError);
        // Don't fail the subscription if email fails
      }
      
      return NextResponse.json(
        { 
          success: true,
          message: config.messages.success,
          subscription
        } as SubscriptionResponse,
        {
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': config.rateLimit.maxRequests.toString(),
            'X-RateLimit-Remaining': rateCheck.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateCheck.resetTime / 1000).toString(),
          }
        }
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'ALREADY_SUBSCRIBED') {
        return NextResponse.json(
          { 
            error: config.messages.alreadySubscribed,
            code: 'ALREADY_SUBSCRIBED'
          } as SubscriptionResponse,
          { status: 409 }
        );
      }
      
      throw error; // Re-throw for general error handling
    }
  } catch (error) {
    console.error('Unexpected error in POST /api/subscription:', error);
    return NextResponse.json(
      { 
        error: config.messages.error,
        success: false 
      } as SubscriptionResponse,
      { status: 500 }
    );
  }
}

/**
 * Handle unsupported HTTP methods
 */
const methodNotAllowed = (method: string) =>
  NextResponse.json(
    { error: `Method ${method} not allowed` } as SubscriptionResponse,
    { 
      status: 405,
      headers: { 'Allow': 'GET, POST' }
    }
  );

export const PUT = () => methodNotAllowed('PUT');
export const DELETE = () => methodNotAllowed('DELETE');
export const PATCH = () => methodNotAllowed('PATCH');