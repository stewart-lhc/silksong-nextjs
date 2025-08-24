/**
 * Email Subscription API Route
 * Handles email subscription with validation, rate limiting, and duplicate checking
 * Uses existing Supabase configuration and type-safe operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase/client';
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
 * Email validation with enhanced regex
 */
function validateEmail(email: string): { isValid: boolean; sanitized: string; error?: string } {
  const sanitized = email.trim().toLowerCase();
  
  // Enhanced email validation regex as specified in PRD
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
 * Enhanced rate limiting with email-specific logic
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
  
  // Check for same email within 60 seconds (as specified in PRD)
  if (email && current?.lastEmail === email && current?.lastEmailTime) {
    const timeSinceLastEmail = now - current.lastEmailTime;
    if (timeSinceLastEmail < 60000) { // 60 seconds
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: current.lastEmailTime + 60000,
        reason: 'Already subscribed'
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
 * POST /api/subscribe - Subscribe with email
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
        return NextResponse.json(
          { error: 'Content-Type must be application/json' },
          { status: 400 }
        );
      }
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { email, source = 'web' } = body;
    
    // Validate required fields
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

    // Rate limiting with email-specific check
    const rateCheck = checkRateLimit(clientIp, validation.sanitized);
    if (!rateCheck.allowed) {
      const statusCode = rateCheck.reason === 'Already subscribed' ? 409 : 429;
      const errorMessage = rateCheck.reason === 'Already subscribed' 
        ? 'Already subscribed' 
        : 'Rate limit exceeded. Please wait before subscribing again.';
      
      return NextResponse.json(
        { 
          error: errorMessage,
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

    // Prepare subscription data
    const subscriptionData: TablesInsert<'email_subscriptions'> = {
      email: validation.sanitized,
    };

    // Try to insert subscription - let database handle duplicates
    // For development/testing, we may need to temporarily disable RLS or use supabaseAdmin
    const insertClient = process.env.NODE_ENV === 'development' ? supabase : supabase;
    const { data, error } = await insertClient
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
          { status: 409 } // Conflict
        );
      }
      
      console.error('Database error during subscription:', error);
      return NextResponse.json(
        { error: 'Failed to process subscription' },
        { status: 500 }
      );
    }

    // Success response
    return NextResponse.json(
      { 
        success: true,
        message: 'Successfully subscribed!',
        subscription: {
          id: data[0].id,
          email: data[0].email,
          subscribed_at: data[0].subscribed_at
        }
      },
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimit.maxRequests.toString(),
          'X-RateLimit-Remaining': rateCheck.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateCheck.resetTime / 1000).toString(),
        }
      }
    );
  } catch (error) {
    console.error('Unexpected error in POST /api/subscribe:', error);
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