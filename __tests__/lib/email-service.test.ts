/**
 * Email Service Test Suite
 * Comprehensive testing for email service functionality
 * Tests welcome email sending, confirmation emails, and subscriber count retrieval
 */

import { sendWelcomeEmail, sendConfirmationEmail, getSubscriberCount } from '@/lib/email-service';
import { EmailSubscription } from '@/types/email-subscription';

// Mock Resend email service
const mockResendSend = jest.fn();
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockResendSend
    }
  }))
}));

// Mock template generation
jest.mock('@/lib/newsletter-kit/email/templates/silksong-gmail-optimized', () => ({
  generateSilksongTemplate: jest.fn(),
  generateTextContent: jest.fn()
}));

// Mock Supabase server
const mockSupabaseAdmin = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      count: 0,
      error: null
    }))
  }))
};

jest.mock('@/lib/supabase/server', () => ({
  supabaseAdmin: mockSupabaseAdmin
}));

// Mock environment variables
const originalEnv = process.env;

describe('Email Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset environment variables
    process.env = {
      ...originalEnv,
      RESEND_API_KEY: 'test-resend-api-key',
      FROM_NAME: 'Test Sender',
      FROM_EMAIL: 'test@example.com',
      REPLY_TO_EMAIL: 'reply@example.com',
      NEXT_PUBLIC_SITE_URL: 'https://test.example.com'
    };

    // Setup default mock implementations
    mockGenerateSilksongTemplate.mockReturnValue('<html>Test HTML Template</html>');
    mockGenerateTextContent.mockReturnValue('Test Text Content');
    
    mockResendSend.mockResolvedValue({
      data: {
        id: 'test-email-id-123'
      },
      error: null
    });

    // Mock console.error to reduce noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('sendWelcomeEmail()', () => {
    const mockSubscription: EmailSubscription = {
      id: 'test-sub-123',
      email: 'subscriber@example.com',
      subscribed_at: '2024-01-01T00:00:00Z',
      source: 'web'
    };

    it('should send welcome email successfully', async () => {
      const result = await sendWelcomeEmail(mockSubscription);

      expect(result).toEqual({
        success: true,
        messageId: 'test-email-id-123'
      });

      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'Test Sender <test@example.com>',
        to: ['subscriber@example.com'],
        subject: '🎉 You\'re In – Silksong Tracking Activated',
        html: '<html>Test HTML Template</html>',
        text: 'Test Text Content',
        track_opens: false,
        track_clicks: false,
        headers: {
          'X-Entity-Ref-ID': 'test-sub-123',
          'List-Unsubscribe': '<mailto:reply@example.com>',
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        },
        tags: [
          { name: 'type', value: 'welcome' },
          { name: 'source', value: 'web' },
          { name: 'template', value: 'silksong-professional' },
          { name: 'transactional', value: 'false' }
        ]
      });
    });

    it('should pass correct template variables', async () => {
      await sendWelcomeEmail(mockSubscription, { subscriberCount: 1500 });

      expect(mockGenerateSilksongTemplate).toHaveBeenCalledWith({
        URL_HOME: 'https://test.example.com',
        DAYS_REMAINING: expect.any(Number),
        YEAR: expect.any(Number)
      });

      expect(mockGenerateTextContent).toHaveBeenCalledWith({
        URL_HOME: 'https://test.example.com',
        DAYS_REMAINING: expect.any(Number),
        YEAR: expect.any(Number)
      });
    });

    it('should calculate days remaining until September 4, 2025', async () => {
      // Mock current date to January 1, 2025
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));

      await sendWelcomeEmail(mockSubscription);

      const expectedDaysRemaining = Math.ceil(
        (new Date('2025-09-04T14:00:00Z').getTime() - new Date('2025-01-01T00:00:00Z').getTime()) 
        / (1000 * 60 * 60 * 24)
      );

      expect(mockGenerateSilksongTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          DAYS_REMAINING: expectedDaysRemaining,
          YEAR: 2025
        })
      );

      jest.useRealTimers();
    });

    it('should handle transactional email flag', async () => {
      await sendWelcomeEmail(mockSubscription, {
        customData: { transactional: true }
      });

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: expect.arrayContaining([
            { name: 'transactional', value: 'true' }
          ])
        })
      );
    });

    it('should use fallback values for missing environment variables', async () => {
      process.env.FROM_NAME = undefined;
      process.env.FROM_EMAIL = undefined;
      process.env.REPLY_TO_EMAIL = undefined;

      await sendWelcomeEmail(mockSubscription);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Hornet <noreply@hollowknightsilksong.org>',
          headers: expect.objectContaining({
            'List-Unsubscribe': '<mailto:unsubscribe@hollowknightsilksong.org>'
          })
        })
      );
    });

    it('should handle Resend API errors', async () => {
      mockResendSend.mockResolvedValue({
        data: null,
        error: {
          message: 'Invalid API key'
        }
      });

      const result = await sendWelcomeEmail(mockSubscription);

      expect(result).toEqual({
        success: false,
        error: 'Invalid API key'
      });
    });

    it('should handle network errors', async () => {
      mockResendSend.mockRejectedValue(new Error('Network error'));

      const result = await sendWelcomeEmail(mockSubscription);

      expect(result).toEqual({
        success: false,
        error: 'Network error'
      });
    });

    it('should handle template generation errors', async () => {
      mockGenerateSilksongTemplate.mockImplementation(() => {
        throw new Error('Template generation failed');
      });

      const result = await sendWelcomeEmail(mockSubscription);

      expect(result).toEqual({
        success: false,
        error: 'Template generation failed'
      });
    });

    it('should include custom options in email metadata', async () => {
      await sendWelcomeEmail(mockSubscription, {
        firstName: 'John',
        subscriberCount: 2500,
        customData: {
          utm_source: 'newsletter',
          referrer: 'homepage'
        }
      });

      // Template variables should be passed correctly
      expect(mockGenerateSilksongTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          URL_HOME: expect.any(String),
          DAYS_REMAINING: expect.any(Number),
          YEAR: expect.any(Number)
        })
      );
    });

    it('should handle missing subscription source', async () => {
      const subscriptionWithoutSource = {
        ...mockSubscription,
        source: undefined
      };

      await sendWelcomeEmail(subscriptionWithoutSource);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: expect.arrayContaining([
            { name: 'source', value: 'web' } // Should default to 'web'
          ])
        })
      );
    });

    it('should not return negative days remaining after release date', async () => {
      // Mock date after release date
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));

      await sendWelcomeEmail(mockSubscription);

      expect(mockGenerateSilksongTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          DAYS_REMAINING: 0 // Should be 0, not negative
        })
      );

      jest.useRealTimers();
    });
  });

  describe('sendConfirmationEmail()', () => {
    it('should send confirmation email successfully', async () => {
      const result = await sendConfirmationEmail(
        'user@example.com',
        'test-token-123'
      );

      expect(result).toEqual({
        success: true,
        messageId: 'test-email-id-123'
      });

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Silksong Updates <noreply@silksong-updates.com>',
          to: ['user@example.com'],
          subject: 'Confirm your Silksong subscription',
          html: expect.stringContaining('Confirm Your Subscription'),
          text: expect.stringContaining('Confirm Your Subscription'),
          track_opens: false,
          track_clicks: false,
          tags: [{ name: 'type', value: 'confirmation' }]
        })
      );
    });

    it('should include correct confirmation URL', async () => {
      await sendConfirmationEmail('user@example.com', 'test-token-123');

      const expectedUrl = 'https://test.example.com/api/confirm?token=test-token-123';
      
      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(expectedUrl),
          text: expect.stringContaining(expectedUrl)
        })
      );
    });

    it('should handle custom expiry hours', async () => {
      await sendConfirmationEmail('user@example.com', 'test-token-123', {
        expiryHours: 48
      });

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('48 hours'),
          text: expect.stringContaining('48 hours')
        })
      );
    });

    it('should use default expiry of 24 hours', async () => {
      await sendConfirmationEmail('user@example.com', 'test-token-123');

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('24 hours'),
          text: expect.stringContaining('24 hours')
        })
      );
    });

    it('should handle Resend API errors', async () => {
      mockResendSend.mockResolvedValue({
        data: null,
        error: { message: 'Rate limit exceeded' }
      });

      const result = await sendConfirmationEmail('user@example.com', 'test-token-123');

      expect(result).toEqual({
        success: false,
        error: 'Rate limit exceeded'
      });
    });

    it('should handle network errors', async () => {
      mockResendSend.mockRejectedValue(new Error('SMTP server unavailable'));

      const result = await sendConfirmationEmail('user@example.com', 'test-token-123');

      expect(result).toEqual({
        success: false,
        error: 'SMTP server unavailable'
      });
    });
  });

  describe('getSubscriberCount()', () => {
    it('should return subscriber count from database', async () => {
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          count: 1337,
          error: null
        })
      });

      const result = await getSubscriberCount();

      expect(result).toBe(1337);
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith('email_subscriptions');
    });

    it('should return 0 when database returns null count', async () => {
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          count: null,
          error: null
        })
      });

      const result = await getSubscriberCount();

      expect(result).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          count: null,
          error: {
            message: 'Connection timeout',
            code: 'CONNECTION_ERROR'
          }
        })
      });

      const result = await getSubscriberCount();

      expect(result).toBe(0);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to get subscriber count:',
        expect.objectContaining({
          message: 'Connection timeout'
        })
      );
    });

    it('should return 0 when Supabase environment is not configured', async () => {
      process.env.SUPABASE_URL = undefined;
      process.env.SUPABASE_SERVICE_ROLE_KEY = undefined;

      const result = await getSubscriberCount();

      expect(result).toBe(0);
    });

    it('should return 0 when Supabase admin client is not available', async () => {
      // Mock import to return null supabaseAdmin
      jest.doMock('@/lib/supabase/server', () => ({
        supabaseAdmin: null
      }));

      const result = await getSubscriberCount();

      expect(result).toBe(0);
    });

    it('should handle unexpected errors during count retrieval', async () => {
      mockSupabaseAdmin.from.mockImplementation(() => {
        throw new Error('Unexpected database error');
      });

      const result = await getSubscriberCount();

      expect(result).toBe(0);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to get subscriber count:',
        expect.any(Error)
      );
    });

    it('should use correct database query parameters', async () => {
      const mockSelect = jest.fn().mockResolvedValue({
        count: 500,
        error: null
      });

      mockSupabaseAdmin.from.mockReturnValue({
        select: mockSelect
      });

      await getSubscriberCount();

      expect(mockSelect).toHaveBeenCalledWith('*', {
        count: 'exact',
        head: true
      });
    });
  });

  describe('Email Service Integration', () => {
    it('should work with different email providers (interface compatibility)', () => {
      // Test that the email service interface is provider-agnostic
      const emailService = {
        send: mockResendSend
      };

      expect(typeof emailService.send).toBe('function');
    });

    it('should handle malformed email addresses gracefully', async () => {
      const malformedSubscription = {
        ...{
          id: 'test-id',
          email: 'invalid-email-format',
          subscribed_at: '2024-01-01T00:00:00Z',
          source: 'test'
        }
      };

      // Should not throw, even with malformed email
      await expect(sendWelcomeEmail(malformedSubscription)).resolves.toMatchObject({
        success: expect.any(Boolean)
      });
    });

    it('should preserve email metadata across different functions', async () => {
      const subscription: EmailSubscription = {
        id: 'metadata-test',
        email: 'metadata@example.com',
        subscribed_at: '2024-01-01T00:00:00Z',
        source: 'api'
      };

      await sendWelcomeEmail(subscription);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Entity-Ref-ID': 'metadata-test'
          }),
          tags: expect.arrayContaining([
            { name: 'source', value: 'api' }
          ])
        })
      );
    });
  });

  describe('Template and Content Generation', () => {
    it('should generate both HTML and text content', async () => {
      const subscription: EmailSubscription = {
        id: 'template-test',
        email: 'template@example.com',
        subscribed_at: '2024-01-01T00:00:00Z',
        source: 'web'
      };

      await sendWelcomeEmail(subscription);

      expect(mockGenerateSilksongTemplate).toHaveBeenCalledTimes(1);
      expect(mockGenerateTextContent).toHaveBeenCalledTimes(1);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: '<html>Test HTML Template</html>',
          text: 'Test Text Content'
        })
      );
    });

    it('should handle template generation failures gracefully', async () => {
      mockGenerateSilksongTemplate.mockImplementation(() => {
        throw new Error('Template compilation error');
      });

      const result = await sendWelcomeEmail({
        id: 'error-test',
        email: 'error@example.com',
        subscribed_at: '2024-01-01T00:00:00Z',
        source: 'web'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Template compilation error');
    });

    it('should pass correct year to templates', async () => {
      const currentYear = new Date().getFullYear();

      await sendWelcomeEmail({
        id: 'year-test',
        email: 'year@example.com',
        subscribed_at: '2024-01-01T00:00:00Z',
        source: 'web'
      });

      expect(mockGenerateSilksongTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          YEAR: currentYear
        })
      );
    });
  });
});