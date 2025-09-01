/**
 * API Route Tests: /api/subscribe
 * Comprehensive testing for email subscription endpoint
 * Covers POST, GET, and error handling scenarios
 */

import { NextRequest } from 'next/server';
import { POST, GET, PUT, DELETE, PATCH } from '@/app/api/subscribe/route';
import * as emailService from '@/lib/email-service';
import * as supabaseServer from '@/lib/supabase/server';

// Mock dependencies
jest.mock('@/lib/email-service');
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/env', () => ({
  rateLimit: {
    maxRequests: 5,
    windowMs: 60000
  }
}));
jest.mock('next/headers', () => ({
  headers: jest.fn().mockResolvedValue(new Map([
    ['x-forwarded-for', '192.168.1.100'],
    ['x-real-ip', '192.168.1.100'],
    ['content-type', 'application/json']
  ]))
}));

// Mock implementations
const mockEmailService = emailService as jest.Mocked<typeof emailService>;
const mockSupabaseServer = supabaseServer as jest.Mocked<typeof supabaseServer>;

// Test utilities
const createMockRequest = (body: any, headers: Record<string, string> = {}): NextRequest => {
  const request = {
    json: jest.fn().mockResolvedValue(body),
    headers: new Map(Object.entries({
      'content-type': 'application/json',
      ...headers
    })),
    url: 'http://localhost:3000/api/subscribe'
  } as any;
  return request as NextRequest;
};

// Mock Supabase client
const createMockSupabaseClient = () => {
  const mockClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn()
  };
  return mockClient;
};

describe('/api/subscribe API Route', () => {
  let mockSupabaseClient: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockSupabaseClient = createMockSupabaseClient();
    mockSupabaseServer.supabaseAdmin = mockSupabaseClient as any;
    
    mockEmailService.getSubscriberCount.mockResolvedValue(1500);
    mockEmailService.sendWelcomeEmail.mockResolvedValue({
      success: true,
      messageId: 'test-message-id-123',
      data: {}
    });
  });

  describe('POST /api/subscribe', () => {
    describe('Successful Subscriptions', () => {
      it('should successfully subscribe a new email', async () => {
        // Mock no existing subscription
        mockSupabaseClient.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' } // Not found
        });

        // Mock successful insertion
        mockSupabaseClient.select.mockResolvedValue({
          data: [{
            id: 'sub_123',
            email: 'test@example.com',
            subscribed_at: '2024-01-01T00:00:00.000Z'
          }],
          error: null
        });

        const request = createMockRequest({
          email: 'test@example.com',
          source: 'web'
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.subscription.email).toBe('test@example.com');
        expect(data.emailSent).toBe(true);
        expect(data.messageId).toBe('test-message-id-123');
        expect(data.subscriberCount).toBe(1501);
        expect(data.transactional).toBe(true);
      });

      it('should handle email case sensitivity and trimming', async () => {
        mockSupabaseClient.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        });

        mockSupabaseClient.select.mockResolvedValue({
          data: [{
            id: 'sub_124',
            email: 'test@example.com',
            subscribed_at: '2024-01-01T00:00:00.000Z'
          }],
          error: null
        });

        const request = createMockRequest({
          email: '  TEST@EXAMPLE.COM  ',
          source: 'newsletter'
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.subscription.email).toBe('test@example.com');
        expect(mockSupabaseClient.eq).toHaveBeenCalledWith('email', 'test@example.com');
      });

      it('should default source to "web" when not provided', async () => {
        mockSupabaseClient.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        });

        mockSupabaseClient.select.mockResolvedValue({
          data: [{
            id: 'sub_125',
            email: 'test@example.com',
            subscribed_at: '2024-01-01T00:00:00.000Z'
          }],
          error: null
        });

        const request = createMockRequest({
          email: 'test@example.com'
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.subscription.source).toBe('web');
      });
    });

    describe('Email Validation', () => {
      it('should reject missing email', async () => {
        const request = createMockRequest({});
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Email is required and must be a string');
      });

      it('should reject non-string email', async () => {
        const request = createMockRequest({ email: 123 });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Email is required and must be a string');
      });

      it('should reject empty email', async () => {
        const request = createMockRequest({ email: '' });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Email is required');
      });

      it('should reject invalid email formats', async () => {
        const invalidEmails = [
          'invalid-email',
          '@example.com',
          'test@',
          'test..test@example.com',
          'test@example',
          'test@.example.com',
          'test@example..com'
        ];

        for (const email of invalidEmails) {
          const request = createMockRequest({ email });
          const response = await POST(request);
          const data = await response.json();

          expect(response.status).toBe(400);
          expect(data.error).toBe('Please enter a valid email address');
        }
      });

      it('should reject email that is too long', async () => {
        const longEmail = 'a'.repeat(250) + '@example.com'; // Over 254 chars
        const request = createMockRequest({ email: longEmail });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Email is too long');
      });
    });

    describe('Duplicate Email Handling', () => {
      it('should reject already subscribed email', async () => {
        mockSupabaseClient.single.mockResolvedValue({
          data: {
            id: 'existing_123',
            email: 'test@example.com',
            subscribed_at: '2023-01-01T00:00:00.000Z'
          },
          error: null
        });

        const request = createMockRequest({
          email: 'test@example.com'
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(409);
        expect(data.error).toBe('Email already subscribed');
        expect(data.code).toBe('ALREADY_SUBSCRIBED');
        expect(data.subscription.id).toBe('existing_123');
      });
    });

    describe('Transactional Email Flow', () => {
      it('should fail when email service is unavailable', async () => {
        mockSupabaseClient.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        });

        mockEmailService.sendWelcomeEmail.mockResolvedValue({
          success: false,
          error: 'Email service unavailable'
        });

        const request = createMockRequest({
          email: 'test@example.com'
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data.error).toBe('Failed to send welcome email. Please try again or contact support.');
        expect(data.code).toBe('EMAIL_DELIVERY_FAILED');
        
        // Should not insert into database if email fails
        expect(mockSupabaseClient.insert).not.toHaveBeenCalled();
      });

      it('should handle critical error when email sent but database fails', async () => {
        mockSupabaseClient.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        });

        // Email succeeds
        mockEmailService.sendWelcomeEmail.mockResolvedValue({
          success: true,
          messageId: 'email-sent-123'
        });

        // Database fails after email
        mockSupabaseClient.select.mockResolvedValue({
          data: null,
          error: { code: 'database_error', message: 'Database connection failed' }
        });

        const request = createMockRequest({
          email: 'test@example.com'
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Email sent but subscription storage failed. Please contact support.');
        expect(data.code).toBe('DATABASE_STORAGE_FAILED');
        expect(data.emailSent).toBe(true);
        expect(data.messageId).toBe('email-sent-123');
      });

      it('should handle race condition when unique constraint violated after email sent', async () => {
        mockSupabaseClient.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        });

        mockEmailService.sendWelcomeEmail.mockResolvedValue({
          success: true,
          messageId: 'race-condition-email-123'
        });

        // Unique constraint violation (race condition)
        mockSupabaseClient.select.mockResolvedValue({
          data: null,
          error: { code: '23505', message: 'duplicate key value violates unique constraint' }
        });

        const request = createMockRequest({
          email: 'test@example.com'
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(409);
        expect(data.error).toBe('Email already subscribed (detected after email sent)');
        expect(data.code).toBe('RACE_CONDITION_DETECTED');
        expect(data.emailSent).toBe(true);
        expect(data.messageId).toBe('race-condition-email-123');
      });
    });

    describe('Rate Limiting', () => {
      it('should apply rate limiting to subscription attempts', async () => {
        mockSupabaseClient.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        });

        mockSupabaseClient.select.mockResolvedValue({
          data: [{
            id: 'sub_rate_test',
            email: 'test@example.com',
            subscribed_at: '2024-01-01T00:00:00.000Z'
          }],
          error: null
        });

        // Make 5 successful requests (should be allowed)
        for (let i = 0; i < 5; i++) {
          const request = createMockRequest({
            email: `test${i}@example.com`
          });
          const response = await POST(request);
          expect(response.status).toBe(201);
        }

        // 6th request should be rate limited
        const rateLimitedRequest = createMockRequest({
          email: 'test6@example.com'
        });
        const rateLimitedResponse = await POST(rateLimitedRequest);
        const rateLimitedData = await rateLimitedResponse.json();

        expect(rateLimitedResponse.status).toBe(429);
        expect(rateLimitedData.error).toBe('Rate limit exceeded. Please wait before subscribing again.');
        expect(rateLimitedResponse.headers.get('X-RateLimit-Limit')).toBe('5');
        expect(rateLimitedResponse.headers.get('X-RateLimit-Remaining')).toBe('0');
      });

      it('should prevent duplicate subscription attempts within 60 seconds', async () => {
        mockSupabaseClient.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        });

        mockSupabaseClient.select.mockResolvedValue({
          data: [{
            id: 'sub_duplicate_test',
            email: 'test@example.com',
            subscribed_at: '2024-01-01T00:00:00.000Z'
          }],
          error: null
        });

        // First subscription
        const firstRequest = createMockRequest({
          email: 'test@example.com'
        });
        const firstResponse = await POST(firstRequest);
        expect(firstResponse.status).toBe(201);

        // Second subscription attempt with same email (should be blocked)
        const secondRequest = createMockRequest({
          email: 'test@example.com'
        });
        const secondResponse = await POST(secondRequest);
        const secondData = await secondResponse.json();

        expect(secondResponse.status).toBe(409);
        expect(secondData.error).toBe('Already subscribed');
        expect(secondData.reason).toBe('Already subscribed');
      });
    });

    describe('Request Validation', () => {
      it('should reject non-JSON content type', async () => {
        const request = createMockRequest({}, {
          'content-type': 'text/plain'
        });
        
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Content-Type must be application/json');
      });

      it('should handle malformed JSON', async () => {
        const request = {
          json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
          headers: new Map([['content-type', 'application/json']]),
          url: 'http://localhost:3000/api/subscribe'
        } as any;

        const response = await POST(request as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid JSON in request body');
      });
    });

    describe('Database Configuration', () => {
      it('should handle missing Supabase admin client', async () => {
        mockSupabaseServer.supabaseAdmin = null as any;

        const request = createMockRequest({
          email: 'test@example.com'
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Database configuration error');
      });

      it('should handle database connection errors during duplicate check', async () => {
        mockSupabaseClient.single.mockResolvedValue({
          data: null,
          error: { code: 'connection_error', message: 'Database connection failed' }
        });

        const request = createMockRequest({
          email: 'test@example.com'
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to process subscription');
      });
    });

    describe('Error Handling', () => {
      it('should handle unexpected errors gracefully', async () => {
        mockSupabaseClient.single.mockRejectedValue(new Error('Unexpected error'));

        const request = createMockRequest({
          email: 'test@example.com'
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Internal server error');
      });
    });
  });

  describe('GET /api/subscribe', () => {
    it('should return subscription count successfully', async () => {
      mockEmailService.getSubscriberCount.mockResolvedValue(2500);

      const response = await GET({} as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.count).toBe(2500);
      expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=300, stale-while-revalidate=600');
    });

    it('should handle rate limiting on GET requests', async () => {
      mockEmailService.getSubscriberCount.mockResolvedValue(1000);

      // Make multiple requests to trigger rate limit
      for (let i = 0; i < 5; i++) {
        const response = await GET({} as NextRequest);
        expect(response.status).toBe(200);
      }

      // 6th request should be rate limited
      const rateLimitedResponse = await GET({} as NextRequest);
      const data = await rateLimitedResponse.json();

      expect(rateLimitedResponse.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded');
    });

    it('should handle database errors gracefully', async () => {
      mockEmailService.getSubscriberCount.mockRejectedValue(new Error('Database error'));

      const response = await GET({} as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to get subscriber count');
      expect(data.count).toBe(0);
    });

    it('should handle missing Supabase admin client', async () => {
      mockSupabaseServer.supabaseAdmin = null as any;

      const response = await GET({} as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database configuration error');
    });
  });

  describe('HTTP Method Restrictions', () => {
    it('should reject PUT requests', async () => {
      const response = await PUT();
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error).toBe('Method not allowed');
      expect(response.headers.get('Allow')).toBe('GET, POST');
    });

    it('should reject DELETE requests', async () => {
      const response = await DELETE();
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error).toBe('Method not allowed');
      expect(response.headers.get('Allow')).toBe('GET, POST');
    });

    it('should reject PATCH requests', async () => {
      const response = await PATCH();
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error).toBe('Method not allowed');
      expect(response.headers.get('Allow')).toBe('GET, POST');
    });
  });
});
