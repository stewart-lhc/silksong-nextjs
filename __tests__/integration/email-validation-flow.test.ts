/**
 * Email Validation and Processing Integration Test Suite
 * End-to-end testing for the complete email subscription flow
 * Tests validation, API integration, email service, and error handling
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/subscribe/route';
import { sendWelcomeEmail, getSubscriberCount } from '@/lib/email-service';
import { validateEmail } from '@/lib/email-service'; // We'll test validation logic through the API

// Mock dependencies for integration testing
const mockResendSend = jest.fn();
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockResendSend
    }
  }))
}));

const mockSupabaseAdmin = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      })),
      limit: jest.fn(),
      count: jest.fn()
    })),
    insert: jest.fn(() => ({
      select: jest.fn()
    }))
  }))
};

jest.mock('@/lib/supabase/server', () => ({
  supabaseAdmin: mockSupabaseAdmin
}));

jest.mock('next/headers', () => ({
  headers: jest.fn().mockResolvedValue({
    get: jest.fn((key: string) => {
      const headers: Record<string, string> = {
        'x-forwarded-for': '192.168.1.100',
        'x-real-ip': '192.168.1.100'
      };
      return headers[key] || null;
    })
  })
}));

jest.mock('@/lib/env', () => ({
  rateLimit: {
    windowMs: 900000,
    maxRequests: 10
  }
}));

// Mock template generation
jest.mock('@/lib/newsletter-kit/email/templates/silksong-gmail-optimized', () => ({
  generateSilksongTemplate: jest.fn().mockReturnValue('<html>Test Template</html>'),
  generateTextContent: jest.fn().mockReturnValue('Test text content')
}));

// Test utilities
function createTestRequest(body: any, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost:3000/api/subscribe', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  });
}

describe('Email Validation and Processing Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default successful responses
    mockResendSend.mockResolvedValue({
      data: { id: 'test-email-id-123' },
      error: null
    });

    mockSupabaseAdmin.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' } // Not found
          })
        })),
        limit: jest.fn().mockResolvedValue({
          count: 500,
          error: null
        })
      })),
      insert: jest.fn(() => ({
        select: jest.fn().mockResolvedValue({
          data: [{
            id: 'test-subscription-id',
            email: 'test@example.com',
            subscribed_at: new Date().toISOString()
          }],
          error: null
        })
      }))
    });
  });

  describe('Complete Subscription Flow', () => {
    it('should successfully process valid email subscription end-to-end', async () => {
      const request = createTestRequest({
        email: 'valid@example.com',
        source: 'integration-test'
      });

      const response = await POST(request);
      const data = await response.json();

      // Verify successful response
      expect(response.status).toBe(201);
      expect(data).toMatchObject({
        success: true,
        subscription: {
          email: 'valid@example.com'
        },
        emailSent: true,
        messageId: 'test-email-id-123',
        transactional: true
      });

      // Verify database operations
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('email_subscriptions');
      
      // Verify email was sent
      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['valid@example.com'],
          subject: expect.stringContaining('Silksong'),
          html: expect.stringContaining('Test Template'),
          text: expect.stringContaining('Test text content')
        })
      );
    });

    it('should handle email normalization throughout the flow', async () => {
      const request = createTestRequest({
        email: '  UPPERCASE@EXAMPLE.COM  ',
        source: 'normalization-test'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      
      // Email should be normalized in database check
      expect(mockSupabaseAdmin.from().select().eq).toHaveBeenCalledWith(
        'email', 
        'uppercase@example.com'
      );
      
      // Email should be normalized in email service
      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['uppercase@example.com']
        })
      );
      
      // Response should show normalized email
      expect(data.subscription.email).toBe('uppercase@example.com');
    });

    it('should maintain transactional integrity - fail on email error', async () => {
      // Mock email service failure
      mockResendSend.mockResolvedValue({
        data: null,
        error: { message: 'Email service unavailable' }
      });

      const request = createTestRequest({
        email: 'failtest@example.com',
        source: 'transactional-test'
      });

      const response = await POST(request);
      const data = await response.json();

      // Should fail with email error
      expect(response.status).toBe(503);
      expect(data).toMatchObject({
        error: 'Failed to send welcome email. Please try again or contact support.',
        code: 'EMAIL_DELIVERY_FAILED'
      });

      // Database insert should NOT have been called
      expect(mockSupabaseAdmin.from().insert).not.toHaveBeenCalled();
    });

    it('should handle database failure after successful email', async () => {
      // Email succeeds but database fails
      mockSupabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          }))
        }))
      }).mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' }
          })
        }))
      });

      const request = createTestRequest({
        email: 'dbfail@example.com',
        source: 'db-failure-test'
      });

      const response = await POST(request);
      const data = await response.json();

      // Should return critical error
      expect(response.status).toBe(500);
      expect(data).toMatchObject({
        error: 'Email sent but subscription storage failed. Please contact support.',
        code: 'DATABASE_STORAGE_FAILED',
        emailSent: true,
        messageId: 'test-email-id-123'
      });

      // Email should have been sent
      expect(mockResendSend).toHaveBeenCalled();
    });
  });

  describe('Email Validation Edge Cases', () => {
    const invalidEmailTestCases = [
      { email: '', expectedError: 'Email is required' },
      { email: 'invalid-email', expectedError: 'Please enter a valid email address' },
      { email: '@example.com', expectedError: 'Please enter a valid email address' },
      { email: 'test@', expectedError: 'Please enter a valid email address' },
      { email: 'test..test@example.com', expectedError: 'Please enter a valid email address' },
      { email: '.test@example.com', expectedError: 'Please enter a valid email address' },
      { email: 'test@example..com', expectedError: 'Please enter a valid email address' },
      { email: 'test@.example.com', expectedError: 'Please enter a valid email address' },
      { email: 'a'.repeat(250) + '@example.com', expectedError: 'Email is too long' },
    ];

    invalidEmailTestCases.forEach(({ email, expectedError }) => {
      it(`should reject invalid email: "${email}"`, async () => {
        const request = createTestRequest({
          email,
          source: 'validation-test'
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toContain(expectedError);

        // Should not attempt email or database operations
        expect(mockResendSend).not.toHaveBeenCalled();
        expect(mockSupabaseAdmin.from().insert).not.toHaveBeenCalled();
      });
    });

    const validEmailTestCases = [
      'test@example.com',
      'user+tag@example.com',
      'user.name@example.co.uk',
      'test123@example-domain.org',
      'a@b.co',
      'very.long.email.address@very-long-domain-name.com',
    ];

    validEmailTestCases.forEach((email) => {
      it(`should accept valid email: "${email}"`, async () => {
        const request = createTestRequest({
          email,
          source: 'valid-email-test'
        });

        const response = await POST(request);
        
        // Should not fail on validation
        expect(response.status).toBe(201);
        
        // Should attempt email operations
        expect(mockResendSend).toHaveBeenCalled();
      });
    });
  });

  describe('Duplicate Detection Integration', () => {
    it('should detect existing subscription before email processing', async () => {
      // Mock existing subscription
      mockSupabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'existing-123',
                email: 'existing@example.com',
                subscribed_at: '2023-01-01T00:00:00Z'
              },
              error: null
            })
          }))
        }))
      });

      const request = createTestRequest({
        email: 'existing@example.com',
        source: 'duplicate-test'
      });

      const response = await POST(request);
      const data = await response.json();

      // Should return conflict
      expect(response.status).toBe(409);
      expect(data).toMatchObject({
        error: 'Email already subscribed',
        code: 'ALREADY_SUBSCRIBED',
        subscription: {
          id: 'existing-123',
          email: 'existing@example.com'
        }
      });

      // Should not send email or insert
      expect(mockResendSend).not.toHaveBeenCalled();
      expect(mockSupabaseAdmin.from().insert).not.toHaveBeenCalled();
    });

    it('should handle race condition during insertion', async () => {
      // Initial check shows no subscription
      mockSupabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          }))
        }))
      });

      // But insertion fails with unique constraint violation
      mockSupabaseAdmin.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn().mockResolvedValue({
            data: null,
            error: { 
              code: '23505', 
              message: 'duplicate key value violates unique constraint'
            }
          })
        }))
      });

      const request = createTestRequest({
        email: 'racecondition@example.com',
        source: 'race-condition-test'
      });

      const response = await POST(request);
      const data = await response.json();

      // Should detect race condition
      expect(response.status).toBe(409);
      expect(data).toMatchObject({
        error: 'Email already subscribed (detected after email sent)',
        code: 'RACE_CONDITION_DETECTED',
        emailSent: true,
        messageId: 'test-email-id-123'
      });

      // Email should have been sent before race condition detected
      expect(mockResendSend).toHaveBeenCalled();
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should integrate rate limiting with the full flow', async () => {
      const email = 'ratelimit@example.com';
      
      // Make successful requests up to the limit
      for (let i = 0; i < 10; i++) {
        const request = createTestRequest({
          email: `user${i}@example.com`,
          source: 'rate-limit-test'
        });
        
        const response = await POST(request);
        expect(response.status).toBe(201);
      }

      // 11th request should be rate limited
      const rateLimitedRequest = createTestRequest({
        email,
        source: 'rate-limit-test'
      });

      const response = await POST(rateLimitedRequest);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('Rate limit exceeded');

      // Should not process email or database operations
      expect(mockSupabaseAdmin.from().select().eq).not.toHaveBeenCalledWith(
        'email', 
        email
      );
    });

    it('should detect duplicate email attempts within time window', async () => {
      const email = 'duplicate-quick@example.com';

      // First subscription
      const firstRequest = createTestRequest({
        email,
        source: 'duplicate-timing-test'
      });

      const firstResponse = await POST(firstRequest);
      expect(firstResponse.status).toBe(201);

      // Immediate second attempt (within rate limit window)
      const secondRequest = createTestRequest({
        email,
        source: 'duplicate-timing-test'
      });

      const secondResponse = await POST(secondRequest);
      const secondData = await secondResponse.json();

      // Should be blocked by rate limit logic for same email
      expect(secondResponse.status).toBe(409);
      expect(secondData.error).toBe('Already subscribed');
    });
  });

  describe('Error Recovery and Logging', () => {
    it('should log critical errors for manual intervention', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Email succeeds but database fails
      mockSupabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          }))
        }))
      }).mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Critical database error' }
          })
        }))
      });

      const request = createTestRequest({
        email: 'critical@example.com',
        source: 'logging-test'
      });

      await POST(request);

      // Should log critical error for manual intervention
      expect(consoleSpy).toHaveBeenCalledWith(
        'CRITICAL: Email sent but database storage failed:',
        expect.objectContaining({
          email: 'critical@example.com',
          emailMessageId: 'test-email-id-123',
          databaseError: expect.objectContaining({
            message: 'Critical database error'
          }),
          requiresManualIntervention: true
        })
      );

      consoleSpy.mockRestore();
    });

    it('should handle unexpected server errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock unexpected error
      mockSupabaseAdmin.from.mockImplementation(() => {
        throw new Error('Unexpected server error');
      });

      const request = createTestRequest({
        email: 'servererror@example.com',
        source: 'server-error-test'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');

      // Should log the error
      expect(consoleSpy).toHaveBeenCalledWith(
        'Unexpected error in POST /api/subscribe:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Email Service Integration', () => {
    it('should pass correct template variables to email service', async () => {
      const request = createTestRequest({
        email: 'template@example.com',
        source: 'template-test'
      });

      await POST(request);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.stringContaining('Hornet'),
          to: ['template@example.com'],
          subject: '🎉 You\'re In – Silksong Tracking Activated',
          html: '<html>Test Template</html>',
          text: 'Test text content',
          track_opens: false,
          track_clicks: false,
          headers: expect.objectContaining({
            'List-Unsubscribe': expect.any(String),
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
          }),
          tags: expect.arrayContaining([
            { name: 'type', value: 'welcome' },
            { name: 'source', value: 'template-test' },
            { name: 'template', value: 'silksong-professional' },
            { name: 'transactional', value: 'true' }
          ])
        })
      );
    });

    it('should include subscriber count in email context', async () => {
      // Mock specific subscriber count
      mockSupabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          }))
        }))
      }).mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({
          count: 1337,
          error: null
        })
      }).mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn().mockResolvedValue({
            data: [{
              id: 'count-test-id',
              email: 'count@example.com',
              subscribed_at: new Date().toISOString()
            }],
            error: null
          })
        }))
      });

      const request = createTestRequest({
        email: 'count@example.com',
        source: 'subscriber-count-test'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.subscriberCount).toBe(1338); // 1337 + 1 for the new subscriber
    });
  });
});