/**
 * Integration tests for Newsletter Subscribe API
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/newsletter/subscribe/route';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  data: null,
  error: null,
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);

// Mock rate limiting storage
const rateLimit = new Map();

describe('Newsletter Subscribe API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    rateLimit.clear();
    mockSupabase.data = null;
    mockSupabase.error = null;
    
    // Reset all chain methods
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.insert.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
  });

  const createMockRequest = (body: any, headers: Record<string, string> = {}): NextRequest => {
    const url = 'http://localhost:3000/api/newsletter/subscribe';
    return new NextRequest(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
        ...headers,
      },
      body: JSON.stringify(body),
    });
  };

  describe('Successful Subscription', () => {
    it('creates new subscription with valid email', async () => {
      // Mock database responses
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }, // Not found
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'sub-123',
          email: 'test@example.com',
          status: 'active',
          subscribed_at: '2024-01-01T00:00:00.000Z',
          unsubscribe_token: 'token-123',
        },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: { total: 1 },
        error: null,
      });

      const request = createMockRequest({
        email: 'test@example.com',
        source: 'web',
        tags: ['newsletter'],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.subscription.email).toBe('test@example.com');
      expect(data.data.isNewSubscription).toBe(true);
      expect(mockSupabase.insert).toHaveBeenCalled();
    });

    it('handles already subscribed user', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'sub-123',
          email: 'test@example.com',
          status: 'active',
        },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: { total: 1 },
        error: null,
      });

      const request = createMockRequest({
        email: 'test@example.com',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.isNewSubscription).toBe(false);
      expect(mockSupabase.insert).not.toHaveBeenCalled();
    });

    it('includes subscriber count in response', async () => {
      mockSupabase.single
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' },
        })
        .mockResolvedValueOnce({
          data: {
            id: 'sub-123',
            email: 'test@example.com',
          },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { total: 1234 },
          error: null,
        });

      const request = createMockRequest({
        email: 'test@example.com',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.count).toBe(1234);
    });
  });

  describe('Email Validation', () => {
    it('rejects invalid email format', async () => {
      const request = createMockRequest({
        email: 'invalid-email',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('valid email');
    });

    it('rejects empty email', async () => {
      const request = createMockRequest({
        email: '',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('required');
    });

    it('rejects blocked domains', async () => {
      const request = createMockRequest({
        email: 'test@tempmail.org',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not allowed');
    });

    it('sanitizes email (converts to lowercase)', async () => {
      mockSupabase.single
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' },
        })
        .mockResolvedValueOnce({
          data: {
            id: 'sub-123',
            email: 'test@example.com',
          },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { total: 1 },
          error: null,
        });

      const request = createMockRequest({
        email: 'Test@EXAMPLE.COM',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.subscription.email).toBe('test@example.com');
    });
  });

  describe('Rate Limiting', () => {
    it('enforces rate limits per IP', async () => {
      const headers = { 'x-forwarded-for': '192.168.1.100' };

      // Make multiple requests rapidly
      for (let i = 0; i < 5; i++) {
        const request = createMockRequest(
          { email: `test${i}@example.com` },
          headers
        );
        await POST(request);
      }

      // 6th request should be rate limited
      const request = createMockRequest(
        { email: 'test6@example.com' },
        headers
      );
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toContain('rate limit');
      expect(response.headers.get('Retry-After')).toBeTruthy();
    });

    it('allows requests from different IPs', async () => {
      // Mock successful database operations
      mockSupabase.single
        .mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        })
        .mockResolvedValue({
          data: { id: 'sub-123' },
          error: null,
        })
        .mockResolvedValue({
          data: { total: 1 },
          error: null,
        });

      const request1 = createMockRequest(
        { email: 'test1@example.com' },
        { 'x-forwarded-for': '192.168.1.100' }
      );
      const request2 = createMockRequest(
        { email: 'test2@example.com' },
        { 'x-forwarded-for': '192.168.1.101' }
      );

      const response1 = await POST(request1);
      const response2 = await POST(request2);

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
    });
  });

  describe('Source and Tags', () => {
    it('accepts and stores source parameter', async () => {
      mockSupabase.single
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' },
        })
        .mockResolvedValueOnce({
          data: {
            id: 'sub-123',
            email: 'test@example.com',
            source: 'homepage',
          },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { total: 1 },
          error: null,
        });

      const request = createMockRequest({
        email: 'test@example.com',
        source: 'homepage',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.subscription.source).toBe('homepage');
    });

    it('accepts and stores tags', async () => {
      mockSupabase.single
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' },
        })
        .mockResolvedValueOnce({
          data: {
            id: 'sub-123',
            email: 'test@example.com',
            tags: ['newsletter', 'updates'],
          },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { total: 1 },
          error: null,
        });

      const request = createMockRequest({
        email: 'test@example.com',
        tags: ['newsletter', 'updates'],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.subscription.tags).toEqual(['newsletter', 'updates']);
    });

    it('accepts metadata', async () => {
      mockSupabase.single
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' },
        })
        .mockResolvedValueOnce({
          data: {
            id: 'sub-123',
            email: 'test@example.com',
            metadata: { campaign: 'winter-2024' },
          },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { total: 1 },
          error: null,
        });

      const request = createMockRequest({
        email: 'test@example.com',
        metadata: { campaign: 'winter-2024' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.subscription.metadata).toEqual({ campaign: 'winter-2024' });
    });
  });

  describe('Database Errors', () => {
    it('handles database connection errors', async () => {
      mockSupabase.single.mockRejectedValueOnce(
        new Error('Connection failed')
      );

      const request = createMockRequest({
        email: 'test@example.com',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('server error');
    });

    it('handles database constraint violations', async () => {
      mockSupabase.single
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' },
        })
        .mockResolvedValueOnce({
          data: null,
          error: {
            code: '23505', // Unique constraint violation
            message: 'duplicate key value',
          },
        });

      const request = createMockRequest({
        email: 'test@example.com',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toContain('already subscribed');
    });
  });

  describe('Request Validation', () => {
    it('rejects non-JSON content type', async () => {
      const url = 'http://localhost:3000/api/newsletter/subscribe';
      const request = new NextRequest(url, {
        method: 'POST',
        headers: {
          'content-type': 'text/plain',
        },
        body: 'not json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('JSON');
    });

    it('rejects malformed JSON', async () => {
      const url = 'http://localhost:3000/api/newsletter/subscribe';
      const request = new NextRequest(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: '{ invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid JSON');
    });

    it('rejects requests without email field', async () => {
      const request = createMockRequest({
        source: 'web',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('email');
    });
  });

  describe('Response Format', () => {
    it('returns consistent response structure on success', async () => {
      mockSupabase.single
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' },
        })
        .mockResolvedValueOnce({
          data: {
            id: 'sub-123',
            email: 'test@example.com',
            status: 'active',
            subscribed_at: '2024-01-01T00:00:00.000Z',
          },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { total: 1 },
          error: null,
        });

      const request = createMockRequest({
        email: 'test@example.com',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('subscription');
      expect(data.data).toHaveProperty('count');
      expect(data.data).toHaveProperty('isNewSubscription');
      expect(data).toHaveProperty('timestamp');
      expect(data).not.toHaveProperty('error');
    });

    it('returns consistent response structure on error', async () => {
      const request = createMockRequest({
        email: 'invalid-email',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('code');
      expect(data).toHaveProperty('timestamp');
      expect(data).not.toHaveProperty('data');
    });

    it('includes proper headers', async () => {
      mockSupabase.single
        .mockResolvedValueOnce({
          data: null,
          error: { code: 'PGRST116' },
        })
        .mockResolvedValueOnce({
          data: { id: 'sub-123' },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { total: 1 },
          error: null,
        });

      const request = createMockRequest({
        email: 'test@example.com',
      });

      const response = await POST(request);

      expect(response.headers.get('content-type')).toContain('application/json');
      expect(response.headers.get('x-ratelimit-limit')).toBeTruthy();
      expect(response.headers.get('x-ratelimit-remaining')).toBeTruthy();
    });
  });
});