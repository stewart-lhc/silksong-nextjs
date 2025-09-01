/**
 * Email Service Test Suite (Simplified)
 * Basic testing for email service functionality
 */

import { sendWelcomeEmail, getSubscriberCount } from '@/lib/email-service';
import { EmailSubscription } from '@/types/email-subscription';

// Mock Resend email service
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn()
    }
  }))
}));

// Mock template generation
jest.mock('@/lib/newsletter-kit/email/templates/silksong-gmail-optimized', () => ({
  generateSilksongTemplate: jest.fn().mockReturnValue('<html>Test Template</html>'),
  generateTextContent: jest.fn().mockReturnValue('Test text content')
}));

// Mock Supabase server
const mockSupabaseAdmin = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      count: 500,
      error: null
    }))
  }))
};

jest.mock('@/lib/supabase/server', () => ({
  supabaseAdmin: mockSupabaseAdmin
}));

describe('Email Service - Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default successful response
    mockResendSend.mockResolvedValue({
      data: { id: 'test-email-id-123' },
      error: null
    });

    // Mock console.error to reduce noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
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

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['subscriber@example.com'],
          subject: expect.stringContaining('Silksong'),
          html: '<html>Test Template</html>',
          text: 'Test text content'
        })
      );
    });

    it('should handle email service errors', async () => {
      mockResendSend.mockResolvedValue({
        data: null,
        error: { message: 'Invalid API key' }
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
          error: { message: 'Connection timeout' }
        })
      });

      const result = await getSubscriberCount();

      expect(result).toBe(0);
    });
  });
});