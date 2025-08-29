/**
 * MSW Request Handlers
 * Mock API responses for email subscription testing
 */

import { http, HttpResponse } from 'msw';

// Mock subscription data
const mockSubscriptions = new Set<string>();
let mockSubscriberCount = 1337;

export const handlers = [
  // POST /api/subscribe - Email subscription endpoint
  http.post('/api/subscribe', async ({ request }) => {
    try {
      const body = await request.json() as { email: string; source?: string };
      const { email } = body;

      // Simulate validation errors
      if (!email) {
        return HttpResponse.json(
          { error: 'Email is required and must be a string' },
          { status: 400 }
        );
      }

      if (email === 'invalid-email') {
        return HttpResponse.json(
          { error: 'Please enter a valid email address' },
          { status: 400 }
        );
      }

      if (email.length > 254) {
        return HttpResponse.json(
          { error: 'Email is too long' },
          { status: 400 }
        );
      }

      // Simulate duplicate email
      if (mockSubscriptions.has(email) || email === 'existing@example.com') {
        return HttpResponse.json(
          { 
            error: 'Email already subscribed',
            code: 'ALREADY_SUBSCRIBED'
          },
          { status: 409 }
        );
      }

      // Simulate rate limiting
      if (email === 'ratelimited@example.com') {
        return HttpResponse.json(
          { 
            error: 'Rate limit exceeded. Please wait before subscribing again.',
            resetTime: Date.now() + 60000
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': '10',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.ceil((Date.now() + 60000) / 1000).toString(),
            }
          }
        );
      }

      // Simulate server error
      if (email === 'servererror@example.com') {
        return HttpResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }

      // Simulate network timeout
      if (email === 'timeout@example.com') {
        return new Promise(() => {
          // Never resolve to simulate timeout
        });
      }

      // Success case
      mockSubscriptions.add(email);
      mockSubscriberCount++;

      const subscription = {
        id: Math.random().toString(36).substr(2, 9),
        email: email.toLowerCase().trim(),
        subscribed_at: new Date().toISOString(),
      };

      return HttpResponse.json(
        {
          success: true,
          message: 'Successfully subscribed!',
          subscription,
        },
        { 
          status: 201,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '9',
            'X-RateLimit-Reset': Math.ceil((Date.now() + 3600000) / 1000).toString(),
          }
        }
      );
    } catch (error) {
      return HttpResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
  }),

  // GET /api/subscribe - Method not allowed
  http.get('/api/subscribe', () => {
    return HttpResponse.json(
      { error: 'Method not allowed' },
      { 
        status: 405,
        headers: { 'Allow': 'POST' }
      }
    );
  }),

  // GET /api/subscriptions - Get subscriber count
  http.get('/api/subscriptions', () => {
    return HttpResponse.json(
      { 
        count: mockSubscriberCount,
        total: mockSubscriberCount 
      },
      { status: 200 }
    );
  }),

  // Supabase Auth mock
  http.post('*/auth/v1/token*', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
    });
  }),

  // Supabase API mocks
  http.get('*/rest/v1/email_subscriptions*', () => {
    return HttpResponse.json([
      { count: mockSubscriberCount }
    ]);
  }),

  http.post('*/rest/v1/email_subscriptions*', async ({ request }) => {
    const body = await request.json() as { email: string };
    const { email } = body;

    if (mockSubscriptions.has(email)) {
      return new HttpResponse(null, {
        status: 409,
        statusText: 'Conflict'
      });
    }

    mockSubscriptions.add(email);
    mockSubscriberCount++;

    return HttpResponse.json([{
      id: Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase().trim(),
      subscribed_at: new Date().toISOString(),
    }]);
  }),
];

// Test utilities for manipulating mock state
export const mockUtils = {
  resetSubscriptions: () => {
    mockSubscriptions.clear();
    mockSubscriberCount = 1337;
  },
  
  addSubscription: (email: string) => {
    mockSubscriptions.add(email);
    mockSubscriberCount++;
  },
  
  removeSubscription: (email: string) => {
    if (mockSubscriptions.has(email)) {
      mockSubscriptions.delete(email);
      mockSubscriberCount--;
    }
  },
  
  getSubscriberCount: () => mockSubscriberCount,
  
  setSubscriberCount: (count: number) => {
    mockSubscriberCount = count;
  },
  
  hasSubscription: (email: string) => mockSubscriptions.has(email),
};