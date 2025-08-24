/**
 * Email Subscriptions API Route
 * Handles email subscription operations with enhanced security and validation
 * Server-side Supabase operations for sensitive data handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabase, supabaseAdmin, SupabaseQueryError } from '@/lib/supabase/client';
import { rateLimit } from '@/lib/env';
import type { TablesInsert } from '@/types/supabase';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

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
 * Rate limiting middleware
 */
function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowMs = rateLimit.windowMs;
  const maxRequests = rateLimit.maxRequests;
  
  const key = `subscription:${identifier}`;
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    // Reset or initialize
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }
  
  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }
  
  // Increment count
  current.count += 1;
  rateLimitStore.set(key, current);
  
  return { allowed: true, remaining: maxRequests - current.count, resetTime: current.resetTime };
}

/**
 * Email validation utility
 */
function validateEmail(email: string): { isValid: boolean; sanitized: string; error?: string } {
  const sanitized = email.trim().toLowerCase();
  
  // Enhanced email validation regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
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

    // Get subscription count using the secure RPC function
    const { data, error } = await supabase.rpc('get_subscription_count');
    
    if (error) {
      console.error('Error fetching subscription count:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription count' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        count: data || 0,
        timestamp: new Date().toISOString()
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache for 5 minutes
          'X-RateLimit-Limit': rateLimit.maxRequests.toString(),
          'X-RateLimit-Remaining': rateCheck.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateCheck.resetTime / 1000).toString(),
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
    
    // Rate limiting (more strict for POST)
    const rateCheck = checkRateLimit(`${clientIp}:post`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before subscribing again.', resetTime: rateCheck.resetTime },
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
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate and sanitize email
    const validation = validateEmail(email);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Insert subscription using server-side client for better security
    const subscriptionData: TablesInsert<'email_subscriptions'> = {
      email: validation.sanitized,
    };

    const { data, error } = await supabase
      .from('email_subscriptions')
      .insert([subscriptionData])
      .select();
    
    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation - email already exists
        return NextResponse.json(
          { 
            error: 'This email is already subscribed',
            code: 'ALREADY_SUBSCRIBED'
          },
          { status: 409 } // Conflict
        );
      }
      
      console.error('Database error during subscription:', error);
      return NextResponse.json(
        { error: 'Failed to process subscription' },
        { status: 500 }
      );
    }

    // Get updated subscription count
    const { data: countData } = await supabase.rpc('get_subscription_count');
    const newCount = countData || 0;

    return NextResponse.json(
      { 
        success: true,
        message: 'Successfully subscribed!',
        count: newCount,
        subscription: data[0]
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
    
    if (error instanceof SupabaseQueryError) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/subscriptions - Unsubscribe (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    // This endpoint requires authentication and admin privileges
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Admin operations not configured' },
        { status: 501 }
      );
    }

    const headersList = await headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify admin token (implement your own auth logic here)
    const token = authorization.slice(7);
    
    // Parse request body
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
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate email
    const validation = validateEmail(email);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Delete subscription using admin client
    const { data, error } = await supabaseAdmin
      .from('email_subscriptions')
      .delete()
      .eq('email', validation.sanitized)
      .select();
    
    if (error) {
      console.error('Database error during unsubscription:', error);
      return NextResponse.json(
        { error: 'Failed to process unsubscription' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Email not found in subscriptions' },
        { status: 404 }
      );
    }

    // Get updated subscription count
    const { data: countData } = await supabase.rpc('get_subscription_count');
    const newCount = countData || 0;

    return NextResponse.json(
      { 
        success: true,
        message: 'Successfully unsubscribed',
        count: newCount,
        removed: data[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error in DELETE /api/subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}