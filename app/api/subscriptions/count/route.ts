/**
 * Subscription Count API Route
 * Returns the total number of email subscriptions
 */

import { NextResponse } from 'next/server';
import { getSubscriberCount } from '@/lib/email-service';

/**
 * GET /api/subscriptions/count - Get subscriber count
 */
export async function GET(): Promise<NextResponse> {
  try {
    const count = await getSubscriberCount();
    
    return NextResponse.json(
      { 
        count,
        success: true
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
        }
      }
    );
  } catch (error) {
    console.error('Error getting subscriber count:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get subscriber count',
        count: 0 
      },
      { status: 500 }
    );
  }
}

/**
 * Handle unsupported HTTP methods
 */
const methodNotAllowedResponse = NextResponse.json(
  { error: 'Method not allowed. This endpoint only supports GET requests.' },
  { 
    status: 405,
    headers: { 'Allow': 'GET' }
  }
);

export async function POST(): Promise<NextResponse> {
  return methodNotAllowedResponse;
}

export async function PUT(): Promise<NextResponse> {
  return methodNotAllowedResponse;
}

export async function DELETE(): Promise<NextResponse> {
  return methodNotAllowedResponse;
}

export async function PATCH(): Promise<NextResponse> {
  return methodNotAllowedResponse;
}