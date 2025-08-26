/**
 * Email Subscriptions API Route
 * Handles email subscription management with proper error handling and rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/env';
import type { TablesInsert } from '@/types/supabase';

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

/**
 * Rate limiting implementation
 */
function checkRateLimit(clientIp: string, email?: string): { 
  allowed: boolean; 
  remaining: number; 
  resetTime: number; 
} {
  const now = Date.now();
  const windowMs = rateLimit.windowMs;
  const maxRequests = rateLimit.maxRequests;
  
  const key = clientIp;
  const current = rateLimitStore.get(key) || { 
    count: 0, 
    resetTime: now + windowMs,
    lastEmail: undefined,
    lastEmailTime: undefined
  };
  
  // Reset window if expired
  if (now > current.resetTime) {
    current.count = 0;
    current.resetTime = now + windowMs;
    current.lastEmail = undefined;
    current.lastEmailTime = undefined;
  }
  
  // Check for duplicate email within 60 seconds (additional protection)
  if (email && current.lastEmail === email && current.lastEmailTime && (now - current.lastEmailTime) < 60000) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
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
 * Email validation
 */
function validateEmail(email: string): { isValid: boolean; sanitized: string; error?: string } {
  const sanitized = email.trim().toLowerCase();
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!sanitized) {
    return { isValid: false, sanitized, error: "Email is required" };
  }
  
  if (sanitized.length > 254) {
    return { isValid: false, sanitized, error: "Email is too long" };
  }
  
  if (!emailRegex.test(sanitized)) {
    return { isValid: false, sanitized, error: "Please enter a valid email address" };
  }
  
  return { isValid: true, sanitized };
}

/**
 * GET /api/subscriptions - Get subscription count
 */
export async function GET(request: NextRequest) {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';
    
    // Rate limiting
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', resetTime: rateCheck.resetTime },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.maxRequests.toString(),
            'X-RateLimit-Remaining': rateCheck.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateCheck.resetTime / 1000).toString(),
          }
        }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      );
    }

    // Get subscription count using the secure RPC function
    const { data, error } = await supabaseAdmin.rpc('get_subscription_count');
    
    if (error) {
      console.error('Error fetching subscription count:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription count' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { count: data || 0 },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      }
    );
  } catch (error) {
    console.error('Unexpected error in GET /api/subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscriptions - Subscribe with email
 */
export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';
    
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { email } = body;
    
    // Validate required fields
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate email format
    const validation = validateEmail(email);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Rate limiting with email-specific check
    const rateCheck = checkRateLimit(clientIp, validation.sanitized);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.maxRequests.toString(),
            'X-RateLimit-Remaining': rateCheck.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateCheck.resetTime / 1000).toString(),
          }
        }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      );
    }

    // Insert subscription using server-side client
    const subscriptionData: TablesInsert<'email_subscriptions'> = {
      email: validation.sanitized,
    };

    const { data, error } = await supabaseAdmin
      .from('email_subscriptions')
      .insert([subscriptionData])
      .select();
    
    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation - email already exists
        return NextResponse.json(
          { 
            error: 'Email already subscribed',
            code: 'ALREADY_SUBSCRIBED'
          },
          { status: 409 }
        );
      }
      
      console.error('Database error during subscription:', error);
      return NextResponse.json(
        { error: 'Failed to process subscription' },
        { status: 500 }
      );
    }

    // Get updated subscription count
    let newCount = 0;
    const { data: countData } = await supabaseAdmin.rpc('get_subscription_count');
    newCount = countData || 0;

    return NextResponse.json(
      { 
        success: true,
        message: 'Successfully subscribed!',
        subscription: {
          id: data[0].id,
          email: data[0].email,
          subscribed_at: data[0].subscribed_at
        },
        count: newCount
      },
      { 
        status: 201,
        headers: {
          'X-RateLimit-Limit': rateLimit.maxRequests.toString(),
          'X-RateLimit-Remaining': rateCheck.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateCheck.resetTime / 1000).toString(),
        }
      }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}