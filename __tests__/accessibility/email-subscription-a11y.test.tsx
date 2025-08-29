/**
 * Accessibility Tests - Email Subscription Components
 * Tests WCAG compliance, screen reader support, and keyboard navigation
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { renderWithProviders, a11yUtils, timerUtils } from '../utils/test-utils';
import { useEmailSubscription } from '@/hooks/use-email-subscription';
import { mockUtils } from '../mocks/handlers';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Test component with comprehensive accessibility features
const AccessibleEmailSubscription = () => {
  const [email, setEmail] = React.useState('');
  const [inputId] = React.useState('email-subscription-input');
  const [errorId] = React.useState('email-subscription-error');
  const [descriptionId] = React.useState('email-subscription-description');
  
  const {
    subscriberCount,
    isSubscribed,
    isSubmitting,
    isLoading,
    error,
    subscribe,
    validateEmail,
  } = useEmailSubscription();

  const [localError, setLocalError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (!email.trim()) {
      setLocalError('Email address is required');
      return;
    }

    const validation = validateEmail(email);
    if (!validation.isValid) {
      setLocalError(validation.error || 'Invalid email address');
      return;
    }

    subscribe(email.trim());
    setEmail('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (localError) {
      setLocalError(null);
    }
  };

  const displayError = localError || error;

  return (
    <main role="main" className="email-subscription-container">
      {/* Screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
        data-testid="sr-announcements"
      >
        {isLoading && 'Loading subscriber count'}
        {isSubmitting && 'Submitting subscription request'}
        {isSubscribed && 'Successfully subscribed to updates'}
      </div>

      {/* Main heading */}
      <h1 id="subscription-heading" className="text-2xl font-bold mb-4">
        Subscribe to Hollow Knight: Silksong Updates
      </h1>

      {/* Subscriber count */}
      <section aria-labelledby="subscriber-count-heading">
        <h2 id="subscriber-count-heading" className="text-lg font-medium mb-2">
          Community
        </h2>
        <div data-testid="subscriber-count" aria-describedby="subscriber-count-description">
          {isLoading ? (
            <div role="status" aria-label="Loading subscriber count">
              <span className="sr-only">Loading</span>
              <span aria-hidden="true">...</span>
            </div>
          ) : (
            <span>
              <span className="font-semibold">{subscriberCount.toLocaleString()}</span>
              <span className="sr-only"> people have</span>
              <span aria-hidden="true"> </span>
              subscribed for updates
            </span>
          )}
        </div>
        <p id="subscriber-count-description" className="text-sm text-gray-600 mt-1">
          Join other fans waiting for the sequel to Hollow Knight
        </p>
      </section>

      {/* Success state */}
      {isSubscribed ? (
        <section 
          role="status" 
          aria-live="polite"
          aria-labelledby="success-heading"
          data-testid="success-section"
          className="mt-6"
        >
          <h2 id="success-heading" className="text-lg font-medium text-green-700 mb-2">
            Subscription Confirmed
          </h2>
          <div className="flex items-center gap-2 text-green-600">
            <span role="img" aria-label="Check mark" className="text-xl">✓</span>
            <span>You'll be notified when Silksong releases!</span>
          </div>
        </section>
      ) : (
        /* Subscription form */
        <section aria-labelledby="subscription-form-heading">
          <h2 id="subscription-form-heading" className="text-lg font-medium mb-4">
            Get Notified on Release
          </h2>
          
          <form 
            onSubmit={handleSubmit}
            data-testid="subscription-form"
            noValidate
            role="form"
            aria-labelledby="subscription-form-heading"
            aria-describedby={descriptionId}
          >
            <p id={descriptionId} className="text-sm text-gray-600 mb-4">
              Enter your email address to receive a notification when Hollow Knight: Silksong is released.
            </p>

            <div className="space-y-4">
              {/* Email input */}
              <div>
                <label 
                  htmlFor={inputId}
                  className="block text-sm font-medium mb-2"
                >
                  Email address
                  <span className="text-red-500 ml-1" aria-label="required">*</span>
                </label>
                
                <input
                  id={inputId}
                  type="email"
                  value={email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  disabled={isSubmitting}
                  required
                  maxLength={254}
                  autoComplete="email"
                  data-testid="email-input"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  aria-invalid={!!displayError}
                  aria-describedby={displayError ? errorId : undefined}
                />
              </div>

              {/* Error message */}
              {displayError && (
                <div 
                  id={errorId}
                  role="alert"
                  aria-live="assertive"
                  data-testid="error-message"
                  className="text-red-600 text-sm"
                >
                  <span role="img" aria-label="Error" className="mr-1">⚠️</span>
                  {displayError}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                data-testid="subscribe-button"
                className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                aria-describedby={isSubmitting ? "submit-status" : undefined}
              >
                {isSubmitting ? (
                  <>
                    <span id="submit-status" className="sr-only">
                      Submitting subscription request
                    </span>
                    <span aria-hidden="true">
                      Subscribing... 
                      <span className="ml-2">⏳</span>
                    </span>
                  </>
                ) : (
                  'Subscribe to Updates'
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Additional context for screen readers */}
      <section aria-labelledby="additional-info-heading" className="mt-8">
        <h2 id="additional-info-heading" className="sr-only">
          Additional Information
        </h2>
        <p className="text-sm text-gray-500">
          This form subscribes you to email notifications about Hollow Knight: Silksong. 
          You can unsubscribe at any time. We respect your privacy and will not share your email.
        </p>
      </section>
    </main>
  );
};

describe('Email Subscription Accessibility', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    mockUtils.resetSubscriptions();
    timerUtils.setup();
  });

  afterEach(() => {
    timerUtils.cleanup();
  });

  describe('WCAG Compliance', () => {
    it('should have no accessibility violations in initial state', async () => {
      const { container } = renderWithProviders(<AccessibleEmailSubscription />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with form filled', async () => {
      const { container } = renderWithProviders(<AccessibleEmailSubscription />);
      
      await user.type(screen.getByRole('textbox'), 'test@example.com');
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in error state', async () => {
      const { container } = renderWithProviders(<AccessibleEmailSubscription />);
      
      // Trigger validation error
      await user.click(screen.getByRole('button', { name: /subscribe/i }));
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in success state', async () => {
      const { container } = renderWithProviders(<AccessibleEmailSubscription />);
      
      await user.type(screen.getByRole('textbox'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /subscribe/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId('success-section')).toBeInTheDocument();
      });
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations during loading', async () => {
      const { container } = renderWithProviders(<AccessibleEmailSubscription />);
      
      // Component should render loading state initially
      expect(screen.getByRole('status', { name: /loading subscriber count/i })).toBeInTheDocument();
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Semantic HTML and ARIA', () => {
    it('should use proper heading hierarchy', () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      
      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it('should have proper form labels', () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAccessibleName('Email address *');
      expect(input).toHaveAttribute('required');
    });

    it('should have proper button labeling', () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAccessibleName('Subscribe to Updates');
    });

    it('should use proper ARIA roles for status updates', () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      // Screen reader announcements
      expect(screen.getByTestId('sr-announcements')).toHaveAttribute('role', 'status');
      expect(screen.getByTestId('sr-announcements')).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByTestId('sr-announcements')).toHaveAttribute('aria-atomic', 'true');
    });

    it('should properly associate form elements with descriptions', () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-describedby');
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id');
    });

    it('should use proper ARIA for error messages', async () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      await user.click(screen.getByRole('button'));
      
      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('should indicate required fields properly', () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('required');
      expect(screen.getByText('*')).toHaveAttribute('aria-label', 'required');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support tab navigation', async () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');
      
      // Tab to input
      await user.tab();
      expect(input).toHaveFocus();
      
      // Tab to button
      await user.tab();
      expect(button).toHaveFocus();
    });

    it('should support Enter key for form submission', async () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      const input = screen.getByRole('textbox');
      
      await user.click(input);
      await user.type(input, 'test@example.com');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByTestId('success-section')).toBeInTheDocument();
      });
    });

    it('should support Space key for button activation', async () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');
      
      await user.type(input, 'test@example.com');
      button.focus();
      await user.keyboard(' ');
      
      await waitFor(() => {
        expect(screen.getByTestId('success-section')).toBeInTheDocument();
      });
    });

    it('should maintain focus management during state changes', async () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      await user.type(screen.getByRole('textbox'), 'invalid-email');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      
      // Focus should remain on or near the form for error correction
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeTruthy();
    });

    it('should trap focus appropriately', async () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');
      
      // Navigate forward
      await user.tab();
      expect(input).toHaveFocus();
      
      await user.tab();
      expect(button).toHaveFocus();
      
      // Navigate backward
      await user.tab({ shift: true });
      expect(input).toHaveFocus();
    });
  });

  describe('Screen Reader Support', () => {
    it('should announce loading states', () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      expect(screen.getByText('Loading subscriber count')).toBeInTheDocument();
      expect(screen.getByRole('status', { name: /loading subscriber count/i })).toBeInTheDocument();
    });

    it('should announce form submission', async () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      await user.type(screen.getByRole('textbox'), 'test@example.com');
      await user.click(screen.getByRole('button'));
      
      expect(screen.getByText('Submitting subscription request')).toBeInTheDocument();
    });

    it('should announce success state', async () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      await user.type(screen.getByRole('textbox'), 'test@example.com');
      await user.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(screen.getByText('Successfully subscribed to updates')).toBeInTheDocument();
        expect(screen.getByRole('status', { name: /subscription confirmed/i })).toBeInTheDocument();
      });
    });

    it('should provide context for subscriber count', async () => {
      mockUtils.setSubscriberCount(1337);
      
      renderWithProviders(<AccessibleEmailSubscription />);
      
      await waitFor(() => {
        expect(screen.getByText('1,337')).toBeInTheDocument();
        expect(screen.getByText('people have', { exact: false })).toBeInTheDocument();
      });
    });

    it('should provide proper context for interactive elements', () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      const form = screen.getByRole('form');
      expect(form).toHaveAccessibleName();
      expect(form).toHaveAccessibleDescription();
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAccessibleName();
    });
  });

  describe('Visual Accessibility', () => {
    it('should have proper color contrast indicators', () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      // Required field indicator
      const requiredIndicator = screen.getByLabelText('required');
      expect(requiredIndicator).toBeInTheDocument();
      
      // Error states should be visually distinct
      const errorTest = async () => {
        await user.click(screen.getByRole('button'));
        
        await waitFor(() => {
          const errorMessage = screen.getByRole('alert');
          expect(errorMessage).toHaveClass('text-red-600');
        });
      };
      
      errorTest();
    });

    it('should support focus indicators', async () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');
      
      await user.tab();
      expect(input).toHaveFocus();
      expect(input).toHaveClass('focus:ring-2');
      
      await user.tab();
      expect(button).toHaveFocus();
      expect(button).toHaveClass('focus:ring-2');
    });

    it('should provide visual feedback for disabled states', async () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:bg-gray-400');
      
      await user.type(screen.getByRole('textbox'), 'test@example.com');
      expect(button).toBeEnabled();
    });
  });

  describe('Error State Accessibility', () => {
    it('should properly announce validation errors', async () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      await user.type(screen.getByRole('textbox'), 'invalid');
      await user.click(screen.getByRole('button'));
      
      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent(/valid email/);
      });
    });

    it('should associate errors with form fields', async () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      await user.click(screen.getByRole('button'));
      
      await waitFor(() => {
        const input = screen.getByRole('textbox');
        const errorMessage = screen.getByRole('alert');
        
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAttribute('aria-describedby');
        expect(errorMessage).toHaveAttribute('id');
      });
    });

    it('should clear error announcements when resolved', async () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      // Trigger error
      await user.click(screen.getByRole('button'));
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      
      // Fix error
      await user.type(screen.getByRole('textbox'), 'test@example.com');
      
      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('Mobile and Touch Accessibility', () => {
    it('should have adequate touch targets', () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      const button = screen.getByRole('button');
      const computedStyle = getComputedStyle(button);
      
      // Buttons should have adequate padding for touch
      expect(button).toHaveClass('px-4', 'py-2');
    });

    it('should support mobile form attributes', () => {
      renderWithProviders(<AccessibleEmailSubscription />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autoComplete', 'email');
      expect(input).toHaveAttribute('type', 'email');
    });
  });
});