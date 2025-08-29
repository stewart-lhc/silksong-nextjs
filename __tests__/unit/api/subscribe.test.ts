/**
 * Unit Tests - /api/subscribe Route
 * Tests the API endpoint behavior and error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { POST, GET, PUT, DELETE, PATCH } from '@/app/api/subscribe/route';
import { testEmails, formScenarios } from '../../fixtures/subscription-data';

// Mock the dependencies
jest.mock('@/lib/supabase/server', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(),
      })),
    })),
  },
}));

jest.mock('@/lib/env', () => ({
  rateLimit: {
    windowMs: 60000,
    maxRequests: 10,
  },
}));

jest.mock('next/headers', () => ({
  headers: jest.fn(() => Promise.resolve(new Map([
    ['x-forwarded-for', '127.0.0.1'],
    ['x-real-ip', '127.0.0.1'],
  ]))),
}));

describe('/api/subscribe Route', () => {
  let mockSupabaseInsert: jest.Mock;
  let mockSupabaseSelect: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock implementations
    const { supabaseAdmin } = require('@/lib/supabase/server');
    mockSupabaseSelect = jest.fn();
    mockSupabaseInsert = jest.fn(() => ({
      select: mockSupabaseSelect,
    }));
    
    supabaseAdmin.from.mockReturnValue({
      insert: mockSupabaseInsert,
    });
  });

  describe('POST Method - Success Cases', () => {
    it('should successfully subscribe with valid email', async () => {
      // Mock successful database response
      mockSupabaseSelect.mockResolvedValue({
        data: [{
          id: 'test-id',
          email: 'test@example.com',
          subscribed_at: new Date().toISOString(),
        }],
        error: null,
      });

      const request = new NextRequest('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully subscribed!');
      expect(result.subscription).toBeDefined();
      expect(result.subscription.email).toBe('test@example.com');
    });

    it('should normalize email case and whitespace', async () => {
      mockSupabaseSelect.mockResolvedValue({
        data: [{
          id: 'test-id',
          email: 'test@example.com',
          subscribed_at: new Date().toISOString(),
        }],
        error: null,
      });

      const request = new NextRequest('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: '  TEST@EXAMPLE.COM  ' }),
      });

      await POST(request);

      expect(mockSupabaseInsert).toHaveBeenCalledWith([
        { email: 'test@example.com' }
      ]);
    });

    it('should include rate limit headers in success response', async () => {
      mockSupabaseSelect.mockResolvedValue({
        data: [{ id: 'test-id', email: 'test@example.com', subscribed_at: new Date().toISOString() }],
        error: null,
      });

      const request = new NextRequest('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
      expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
    });
  });

  describe('POST Method - Validation Errors', () => {
    it('should reject missing email', async () => {
      const request = new NextRequest('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Email is required and must be a string');
    });

    it('should reject non-string email', async () => {
      const request = new NextRequest('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 123 }),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Email is required and must be a string');
    });

    it('should reject invalid email formats', async () => {
      for (const invalidEmail of testEmails.invalid.slice(1)) { // Skip empty string
        const request = new NextRequest('http://localhost/api/subscribe', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email: invalidEmail }),
        });

        const response = await POST(request);
        const result = await response.json();

        expect(response.status).toBe(400);
        expect(result.error).toContain('valid email');
      }
    });

    it('should reject email that is too long', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      
      const request = new NextRequest('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: longEmail }),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Email is too long');
    });

    it('should reject invalid JSON', async () => {
      const request = new NextRequest('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{ invalid json',
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Invalid JSON in request body');
    });

    it('should reject non-JSON content type', async () => {
      const request = new NextRequest('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Content-Type must be application/json');
    });
  });

  describe('POST Method - Database Errors', () => {
    it('should handle duplicate email (409)', async () => {
      mockSupabaseSelect.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key violation' },
      });

      const request = new NextRequest('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'existing@example.com' }),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(409);
      expect(result.error).toBe('Email already subscribed');
      expect(result.code).toBe('ALREADY_SUBSCRIBED');
    });

    it('should handle database errors (500)', async () => {
      mockSupabaseSelect.mockResolvedValue({
        data: null,
        error: { code: 'XX000', message: 'database error' },
      });

      const request = new NextRequest('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Failed to process subscription');
    });

    it('should handle missing supabase admin client', async () => {
      // Mock supabaseAdmin as null
      const { supabaseAdmin } = require('@/lib/supabase/server');
      jest.mocked(supabaseAdmin).mockImplementation(() => null);
      
      const originalSupabaseAdmin = require('@/lib/supabase/server').supabaseAdmin;
      require('@/lib/supabase/server').supabaseAdmin = null;

      const request = new NextRequest('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Database configuration error');

      // Restore
      require('@/lib/supabase/server').supabaseAdmin = originalSupabaseAdmin;
    });
  });

  describe('POST Method - Rate Limiting', () => {
    it('should implement rate limiting per IP', async () => {
      mockSupabaseSelect.mockResolvedValue({
        data: [{ id: 'test-id', email: 'test@example.com', subscribed_at: new Date().toISOString() }],
        error: null,
      });

      const createRequest = (email: string) => new NextRequest('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 
          'content-type': 'application/json',
          'x-forwarded-for': '127.0.0.1',
        },
        body: JSON.stringify({ email }),
      });

      // Send multiple requests rapidly
      const requests = [];
      for (let i = 0; i < 12; i++) {
        requests.push(POST(createRequest(`test${i}@example.com`)));
      }

      const responses = await Promise.all(requests);
      
      // First 10 should succeed, rest should be rate limited
      const successCount = responses.filter(r => r.status === 201).length;
      const rateLimitedCount = responses.filter(r => r.status === 429).length;
      
      expect(successCount).toBeLessThanOrEqual(10);
      expect(rateLimitedCount).toBeGreaterThan(0);
    });
  });

  describe('Other HTTP Methods', () => {
    it('should return 405 for GET method', async () => {
      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(405);
      expect(result.error).toBe('Method not allowed');
      expect(response.headers.get('Allow')).toBe('POST');
    });

    it('should return 405 for PUT method', async () => {
      const response = await PUT();
      const result = await response.json();

      expect(response.status).toBe(405);
      expect(result.error).toBe('Method not allowed');
      expect(response.headers.get('Allow')).toBe('POST');
    });

    it('should return 405 for DELETE method', async () => {
      const response = await DELETE();
      const result = await response.json();

      expect(response.status).toBe(405);
      expect(result.error).toBe('Method not allowed');
      expect(response.headers.get('Allow')).toBe('POST');
    });

    it('should return 405 for PATCH method', async () => {
      const response = await PATCH();
      const result = await response.json();

      expect(response.status).toBe(405);
      expect(result.error).toBe('Method not allowed');
      expect(response.headers.get('Allow')).toBe('POST');
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      // Mock an unexpected error
      mockSupabaseInsert.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Internal server error');
    });

    it('should log errors appropriately', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      mockSupabaseSelect.mockResolvedValue({
        data: null,
        error: { code: 'XX000', message: 'database error' },
      });

      const request = new NextRequest('http://localhost/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Database error during subscription:',
        expect.any(Object)
      );

      consoleSpy.mockRestore();
    });
  });
});