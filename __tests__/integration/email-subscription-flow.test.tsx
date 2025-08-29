/**
 * Integration Tests - Email Subscription Flow
 * Tests the complete integration between components, hooks, and API
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, formUtils, timerUtils } from '../utils/test-utils';
import { useEmailSubscription } from '@/hooks/use-email-subscription';
import { mockUtils } from '../mocks/handlers';
import { testEmails, formScenarios } from '../fixtures/subscription-data';

// Full subscription component that integrates hook with UI
const FullEmailSubscriptionComponent = () => {
  const [email, setEmail] = React.useState('');
  
  const {
    subscriberCount,
    isSubscribed,
    isSubmitting,
    isLoading,
    error,
    subscribe,
  } = useEmailSubscription();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscribe(email.trim());
    setEmail('');
  };

  return (
    <div data-testid="full-subscription-component">
      {/* Subscriber Count Display */}
      <div data-testid="subscriber-count">
        {isLoading ? (
          <span data-testid="loading-count">Loading...</span>
        ) : (
          <span>{subscriberCount} subscribers</span>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div 
          role="alert" 
          data-testid="error-message"
          aria-live="assertive"
        >
          {error}
        </div>
      )}

      {/* Success State */}
      {isSubscribed ? (
        <div 
          role="status" 
          data-testid="success-state"
          aria-live="polite"
        >
          <div className="text-green-600 font-semibold">
            ✓ Successfully subscribed!
          </div>
        </div>
      ) : (
        /* Subscription Form */
        <form onSubmit={handleSubmit} data-testid="subscription-form">
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              maxLength={254}
              required
              data-testid="email-input"
              aria-label="Email address"
            />
            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              data-testid="subscribe-button"
              aria-label="Subscribe to updates"
            >
              {isSubmitting ? (
                <span data-testid="submitting-text">Subscribing...</span>
              ) : (
                'Subscribe'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Toast Messages Container */}
      <div data-testid="toast-container" />
    </div>
  );
};

describe('Email Subscription Flow Integration', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    mockUtils.resetSubscriptions();
    timerUtils.setup();
  });

  afterEach(() => {
    timerUtils.cleanup();
  });

  describe('Complete Subscription Flow', () => {
    it('should complete successful subscription flow', async () => {
      mockUtils.setSubscriberCount(100);
      
      renderWithProviders(<FullEmailSubscriptionComponent />);

      // Initial state
      await waitFor(() => {
        expect(screen.getByText('100 subscribers')).toBeInTheDocument();
      });

      // Fill and submit form
      await formUtils.fillAndSubmit(user, 'test@example.com');

      // Should show submitting state
      expect(screen.getByTestId('submitting-text')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();

      // Should show success state
      await waitFor(() => {
        expect(screen.getByTestId('success-state')).toBeInTheDocument();
        expect(screen.getByText('✓ Successfully subscribed!')).toBeInTheDocument();
      });

      // Should update subscriber count
      await waitFor(() => {
        expect(screen.getByText('101 subscribers')).toBeInTheDocument();
      });

      // Should return to form after timeout
      timerUtils.advanceBy(3000);
      
      await waitFor(() => {
        expect(screen.queryByTestId('success-state')).not.toBeInTheDocument();
        expect(screen.getByTestId('subscription-form')).toBeInTheDocument();
      });
    });

    it('should handle duplicate email subscription', async () => {
      mockUtils.addSubscription('existing@example.com');
      
      renderWithProviders(<FullEmailSubscriptionComponent />);

      await formUtils.fillAndSubmit(user, 'existing@example.com');

      // Should show submitting state first
      expect(screen.getByTestId('submitting-text')).toBeInTheDocument();

      // Should not show success state
      await waitFor(() => {
        expect(screen.queryByTestId('success-state')).not.toBeInTheDocument();
      });

      // Form should remain visible
      expect(screen.getByTestId('subscription-form')).toBeInTheDocument();
    });

    it('should handle validation errors before API call', async () => {
      renderWithProviders(<FullEmailSubscriptionComponent />);

      // Try to submit invalid email
      await formUtils.fillAndSubmit(user, 'invalid-email');

      // Should not show submitting state for validation errors
      expect(screen.queryByTestId('submitting-text')).not.toBeInTheDocument();
      expect(screen.getByTestId('subscription-form')).toBeInTheDocument();
    });

    it('should handle server errors gracefully', async () => {
      renderWithProviders(<FullEmailSubscriptionComponent />);

      await formUtils.fillAndSubmit(user, 'servererror@example.com');

      // Should show submitting state first
      expect(screen.getByTestId('submitting-text')).toBeInTheDocument();

      // Should handle error and return to form
      await waitFor(() => {
        expect(screen.queryByTestId('submitting-text')).not.toBeInTheDocument();
        expect(screen.getByTestId('subscription-form')).toBeInTheDocument();
      });
    });
  });

  describe('Form State Management', () => {
    it('should clear form after successful submission', async () => {
      renderWithProviders(<FullEmailSubscriptionComponent />);

      const emailInput = screen.getByTestId('email-input');
      
      await user.type(emailInput, 'test@example.com');
      expect(emailInput).toHaveValue('test@example.com');

      await user.click(screen.getByTestId('subscribe-button'));

      // Form should be cleared
      await waitFor(() => {
        expect(emailInput).toHaveValue('');
      });
    });

    it('should disable form elements during submission', async () => {
      renderWithProviders(<FullEmailSubscriptionComponent />);

      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.click(screen.getByTestId('subscribe-button'));

      // Elements should be disabled during submission
      expect(screen.getByTestId('email-input')).toBeDisabled();
      expect(screen.getByTestId('subscribe-button')).toBeDisabled();
    });

    it('should re-enable form elements after submission completes', async () => {
      renderWithProviders(<FullEmailSubscriptionComponent />);

      await formUtils.fillAndSubmit(user, 'test@example.com');

      // Wait for submission to complete and success state to show
      await waitFor(() => {
        expect(screen.getByTestId('success-state')).toBeInTheDocument();
      });

      // Fast forward to return to form state
      timerUtils.advanceBy(3000);
      
      await waitFor(() => {
        expect(screen.getByTestId('subscription-form')).toBeInTheDocument();
      });

      // Elements should be enabled again
      expect(screen.getByTestId('email-input')).toBeEnabled();
      expect(screen.getByTestId('subscribe-button')).toBeEnabled();
    });

    it('should update button state based on input validity', async () => {
      renderWithProviders(<FullEmailSubscriptionComponent />);

      const input = screen.getByTestId('email-input');
      const button = screen.getByTestId('subscribe-button');

      // Button starts disabled
      expect(button).toBeDisabled();

      // Enable after typing valid email
      await user.type(input, 'test@example.com');
      expect(button).toBeEnabled();

      // Disable again after clearing
      await user.clear(input);
      expect(button).toBeDisabled();
    });
  });

  describe('Loading States', () => {
    it('should show loading state for subscriber count', () => {
      renderWithProviders(<FullEmailSubscriptionComponent />);

      // Initial render should show loading
      expect(screen.getByTestId('loading-count')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show proper loading state during submission', async () => {
      renderWithProviders(<FullEmailSubscriptionComponent />);

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-count')).not.toBeInTheDocument();
      });

      await user.type(screen.getByTestId('email-input'), 'test@example.com');
      await user.click(screen.getByTestId('subscribe-button'));

      // Should show submitting state
      expect(screen.getByTestId('submitting-text')).toBeInTheDocument();
      expect(screen.getByText('Subscribing...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error messages appropriately', async () => {
      renderWithProviders(<FullEmailSubscriptionComponent />);

      // Submit form that will trigger rate limiting
      await formUtils.fillAndSubmit(user, 'ratelimited@example.com');

      // Wait for error to be processed
      await waitFor(() => {
        expect(screen.queryByTestId('submitting-text')).not.toBeInTheDocument();
      });

      // Error message should not be displayed in this component
      // (since useEmailSubscription handles it via toast)
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('should handle network timeouts gracefully', async () => {
      renderWithProviders(<FullEmailSubscriptionComponent />);

      await formUtils.fillAndSubmit(user, 'timeout@example.com');

      // Should show submitting state
      expect(screen.getByTestId('submitting-text')).toBeInTheDocument();

      // After timeout, should return to form
      timerUtils.advanceBy(10000); // Advance past timeout
      
      await waitFor(() => {
        expect(screen.queryByTestId('submitting-text')).not.toBeInTheDocument();
        expect(screen.getByTestId('subscription-form')).toBeInTheDocument();
      }, { timeout: 15000 });
    });
  });

  describe('Counter Updates', () => {
    it('should increment counter after successful subscription', async () => {
      mockUtils.setSubscriberCount(999);
      
      renderWithProviders(<FullEmailSubscriptionComponent />);

      // Wait for initial count to load
      await waitFor(() => {
        expect(screen.getByText('999 subscribers')).toBeInTheDocument();
      });

      await formUtils.fillAndSubmit(user, 'new@example.com');

      // Should show updated count
      await waitFor(() => {
        expect(screen.getByText('1000 subscribers')).toBeInTheDocument();
      });
    });

    it('should not increment counter for duplicate subscriptions', async () => {
      mockUtils.setSubscriberCount(500);
      mockUtils.addSubscription('existing@example.com');
      
      renderWithProviders(<FullEmailSubscriptionComponent />);

      await waitFor(() => {
        expect(screen.getByText('501 subscribers')).toBeInTheDocument();
      });

      await formUtils.fillAndSubmit(user, 'existing@example.com');

      // Count should remain the same
      await waitFor(() => {
        expect(screen.getByText('501 subscribers')).toBeInTheDocument();
      });
    });
  });

  describe('Email Sanitization', () => {
    it('should handle email case normalization', async () => {
      renderWithProviders(<FullEmailSubscriptionComponent />);

      await formUtils.fillAndSubmit(user, 'TEST@EXAMPLE.COM');

      await waitFor(() => {
        expect(screen.getByTestId('success-state')).toBeInTheDocument();
      });

      // Verify the email was processed (check mock state)
      expect(mockUtils.hasSubscription('test@example.com')).toBe(true);
    });

    it('should handle email whitespace trimming', async () => {
      renderWithProviders(<FullEmailSubscriptionComponent />);

      await formUtils.fillAndSubmit(user, '  test@example.com  ');

      await waitFor(() => {
        expect(screen.getByTestId('success-state')).toBeInTheDocument();
      });

      // Verify the trimmed email was processed
      expect(mockUtils.hasSubscription('test@example.com')).toBe(true);
    });
  });

  describe('Multiple Email Formats', () => {
    it('should handle various valid email formats', async () => {
      renderWithProviders(<FullEmailSubscriptionComponent />);

      for (const email of testEmails.valid.slice(0, 3)) { // Test first 3
        // Reset for each test
        mockUtils.resetSubscriptions();
        
        await formUtils.fillAndSubmit(user, email);

        await waitFor(() => {
          expect(screen.getByTestId('success-state')).toBeInTheDocument();
        });

        // Wait for auto-reset
        timerUtils.advanceBy(3000);
        
        await waitFor(() => {
          expect(screen.getByTestId('subscription-form')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Component Lifecycle', () => {
    it('should properly cleanup on unmount', () => {
      const { unmount } = renderWithProviders(<FullEmailSubscriptionComponent />);
      
      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid mount/unmount cycles', () => {
      for (let i = 0; i < 5; i++) {
        const { unmount } = renderWithProviders(<FullEmailSubscriptionComponent />);
        unmount();
      }
    });
  });
});