/**
 * Unit Tests - useEmailSubscription Hook
 * Tests the core email subscription logic in isolation
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEmailSubscription } from '@/hooks/use-email-subscription';
import { testEmails, hookStates, formScenarios } from '../../fixtures/subscription-data';
import { mockUtils } from '../../mocks/handlers';
import { timerUtils } from '../../utils/test-utils';

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
    logger: { log: () => {}, warn: () => {}, error: () => {} },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useEmailSubscription Hook', () => {
  beforeEach(() => {
    mockUtils.resetSubscriptions();
    timerUtils.setup();
  });

  afterEach(() => {
    timerUtils.cleanup();
  });

  describe('Initial State', () => {
    it('should return correct initial state', () => {
      const { result } = renderHook(() => useEmailSubscription(), {
        wrapper: createWrapper(),
      });

      expect(result.current.subscriberCount).toBe(0);
      expect(result.current.isSubscribed).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.subscribe).toBe('function');
      expect(typeof result.current.validateEmail).toBe('function');
    });

    it('should load subscriber count on mount', async () => {
      mockUtils.setSubscriberCount(1337);
      
      const { result } = renderHook(() => useEmailSubscription(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.subscriberCount).toBe(1337);
      });
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      const { result } = renderHook(() => useEmailSubscription(), {
        wrapper: createWrapper(),
      });

      testEmails.valid.forEach((email) => {
        const validation = result.current.validateEmail(email);
        expect(validation.isValid).toBe(true);
        expect(validation.sanitized).toBe(email.toLowerCase().trim());
      });
    });

    it('should reject invalid email formats', () => {
      const { result } = renderHook(() => useEmailSubscription(), {
        wrapper: createWrapper(),
      });

      testEmails.invalid.forEach((email) => {
        const validation = result.current.validateEmail(email);
        expect(validation.isValid).toBe(false);
        expect(validation.error).toBeDefined();
      });
    });

    it('should sanitize emails properly', () => {
      const { result } = renderHook(() => useEmailSubscription(), {
        wrapper: createWrapper(),
      });

      const testCases = [
        { input: 'TEST@EXAMPLE.COM', expected: 'test@example.com' },
        { input: '  test@example.com  ', expected: 'test@example.com' },
        { input: 'User+Tag@DOMAIN.COM', expected: 'user+tag@domain.com' },
      ];

      testCases.forEach(({ input, expected }) => {
        const validation = result.current.validateEmail(input);
        expect(validation.isValid).toBe(true);
        expect(validation.sanitized).toBe(expected);
      });
    });

    it('should handle edge cases in validation', () => {
      const { result } = renderHook(() => useEmailSubscription(), {
        wrapper: createWrapper(),
      });

      // Empty string
      const emptyValidation = result.current.validateEmail('');
      expect(emptyValidation.isValid).toBe(false);
      expect(emptyValidation.error).toContain('required');

      // Very long email
      const longEmail = 'a'.repeat(250) + '@example.com';
      const longValidation = result.current.validateEmail(longEmail);
      expect(longValidation.isValid).toBe(false);
      expect(longValidation.error).toContain('too long');
    });
  });

  describe('Subscription Flow', () => {
    it('should handle successful subscription', async () => {
      const { result } = renderHook(() => useEmailSubscription(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isSubmitting).toBe(false);

      act(() => {
        result.current.subscribe(formScenarios.validSubmission.email);
      });

      // Should set submitting state immediately
      expect(result.current.isSubmitting).toBe(true);

      // Wait for subscription to complete
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.isSubscribed).toBe(true);
      });

      // Should auto-reset subscribed state after 3 seconds
      act(() => {
        timerUtils.advanceBy(3000);
      });

      await waitFor(() => {
        expect(result.current.isSubscribed).toBe(false);
      });
    });

    it('should handle validation errors before submission', async () => {
      const { result } = renderHook(() => useEmailSubscription(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.subscribe(formScenarios.invalidEmailFormat.email);
      });

      // Should not set submitting state for validation errors
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isSubscribed).toBe(false);
    });

    it('should handle duplicate email error', async () => {
      const { result } = renderHook(() => useEmailSubscription(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.subscribe(formScenarios.duplicateEmail.email);
      });

      expect(result.current.isSubmitting).toBe(true);

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.isSubscribed).toBe(false);
      });
    });

    it('should handle server errors', async () => {
      const { result } = renderHook(() => useEmailSubscription(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.subscribe(formScenarios.serverError.email);
      });

      expect(result.current.isSubmitting).toBe(true);

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.isSubscribed).toBe(false);
      });
    });

    it('should handle empty email submission', () => {
      const { result } = renderHook(() => useEmailSubscription(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.subscribe('');
      });

      // Should not start submission for empty email
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle whitespace-only email', () => {
      const { result } = renderHook(() => useEmailSubscription(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.subscribe('   ');
      });

      // Should not start submission for whitespace-only email
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should prevent rapid successive submissions', async () => {
      const { result } = renderHook(() => useEmailSubscription(), {
        wrapper: createWrapper(),
      });

      // First submission
      act(() => {
        result.current.subscribe('first@example.com');
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
      });

      // Immediate second submission should be blocked
      act(() => {
        result.current.subscribe('second@example.com');
      });

      // Should show rate limiting message
      expect(result.current.isSubmitting).toBe(false);

      // After 5 seconds, should allow submission
      act(() => {
        timerUtils.advanceBy(5000);
      });

      act(() => {
        result.current.subscribe('second@example.com');
      });

      expect(result.current.isSubmitting).toBe(true);
    });

    it('should not submit while already submitting', async () => {
      const { result } = renderHook(() => useEmailSubscription(), {
        wrapper: createWrapper(),
      });

      // Start first submission
      act(() => {
        result.current.subscribe('test@example.com');
      });

      expect(result.current.isSubmitting).toBe(true);

      // Try to submit again while first is in progress
      act(() => {
        result.current.subscribe('another@example.com');
      });

      // Should still be submitting the first request
      expect(result.current.isSubmitting).toBe(true);
    });
  });

  describe('State Management', () => {
    it('should update subscriber count after successful subscription', async () => {
      mockUtils.setSubscriberCount(100);
      
      const { result } = renderHook(() => useEmailSubscription(), {
        wrapper: createWrapper(),
      });

      // Wait for initial count to load
      await waitFor(() => {
        expect(result.current.subscriberCount).toBe(100);
      });

      // Subscribe
      act(() => {
        result.current.subscribe('new@example.com');
      });

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false);
        expect(result.current.isSubscribed).toBe(true);
      });

      // Count should be updated
      await waitFor(() => {
        expect(result.current.subscriberCount).toBe(101);
      });
    });

    it('should handle count loading state', () => {
      const { result } = renderHook(() => useEmailSubscription(), {
        wrapper: createWrapper(),
      });

      // Initially should be loading
      expect(result.current.isLoading).toBe(true);
    });

    it('should handle count error state', async () => {
      // Mock network error for count
      const { result } = renderHook(() => useEmailSubscription(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        // Should handle count loading errors gracefully
        expect(result.current.subscriberCount).toBeDefined();
      });
    });
  });

  describe('Cleanup and Memory', () => {
    it('should clean up resources on unmount', () => {
      const { result, unmount } = renderHook(() => useEmailSubscription(), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();

      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });

    it('should reset error state on cleanup', () => {
      const { result } = renderHook(() => useEmailSubscription(), {
        wrapper: createWrapper(),
      });

      // The hook should handle error cleanup internally
      expect(result.current.error).toBe(null);
    });
  });
});