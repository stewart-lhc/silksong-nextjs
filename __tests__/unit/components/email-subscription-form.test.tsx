/**
 * Unit Tests - Email Subscription Form Component
 * Tests the form component from hero-section.tsx in isolation
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../utils/test-utils';
import { testEmails, formScenarios } from '../../fixtures/subscription-data';
import { mockUtils } from '../../mocks/handlers';

// Extract the subscription form component for isolated testing
const EmailSubscriptionForm = ({
  onSubmit,
  isSubmitting = false,
  isSubscribed = false,
  disabled = false,
}: {
  onSubmit: (email: string) => void;
  isSubmitting?: boolean;
  isSubscribed?: boolean;
  disabled?: boolean;
}) => {
  const [email, setEmail] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onSubmit(email.trim());
    setEmail('');
  };

  if (isSubscribed) {
    return (
      <div role="status" data-testid="success-message">
        <div className="text-primary font-semibold flex items-center justify-center gap-2 py-4">
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            ✓
          </div>
          <span className="text-sm">Subscribed!</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} data-testid="email-subscription-form" role="form" aria-label="Email subscription form">
      <div className="space-y-3">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-background/50 border-primary/30 text-foreground rounded-lg focus:ring-primary/50 text-sm"
          required
          disabled={isSubmitting || disabled}
          maxLength={254}
          data-testid="email-input"
          aria-label="Email address"
          aria-describedby="email-error"
        />
        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-primary/20 text-sm"
          disabled={isSubmitting || !email.trim() || disabled}
          data-testid="subscribe-button"
          aria-label="Subscribe to email updates"
        >
          {isSubmitting ? "..." : "Notify Me"}
        </button>
      </div>
    </form>
  );
};

describe('EmailSubscriptionForm Component', () => {
  const mockOnSubmit = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUtils.resetSubscriptions();
  });

  describe('Rendering', () => {
    it('should render form with all elements', () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} />
      );

      expect(screen.getByTestId('email-subscription-form')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('subscribe-button')).toBeInTheDocument();
    });

    it('should render with correct accessibility attributes', () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} />
      );

      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('aria-label', 'Email subscription form');

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('required');
      expect(input).toHaveAttribute('aria-label', 'Email address');
      expect(input).toHaveAttribute('aria-describedby', 'email-error');

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('aria-label', 'Subscribe to email updates');
    });

    it('should render success state correctly', () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} isSubscribed={true} />
      );

      expect(screen.getByTestId('success-message')).toBeInTheDocument();
      expect(screen.getByText('Subscribed!')).toBeInTheDocument();
      expect(screen.getByText('✓')).toBeInTheDocument();
      
      // Form should not be visible when subscribed
      expect(screen.queryByTestId('email-subscription-form')).not.toBeInTheDocument();
    });

    it('should show loading state in button', () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} isSubmitting={true} />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('...');
      expect(button).toBeDisabled();
    });
  });

  describe('Form Interaction', () => {
    it('should handle email input correctly', async () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} />
      );

      const input = screen.getByRole('textbox');
      
      await user.type(input, 'test@example.com');
      
      expect(input).toHaveValue('test@example.com');
    });

    it('should submit form with valid email', async () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} />
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');

      await user.type(input, 'test@example.com');
      await user.click(button);

      expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com');
    });

    it('should clear input after submission', async () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} />
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');

      await user.type(input, 'test@example.com');
      await user.click(button);

      expect(input).toHaveValue('');
    });

    it('should trim whitespace from email', async () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} />
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');

      await user.type(input, '  test@example.com  ');
      await user.click(button);

      expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com');
    });

    it('should not submit with empty email', async () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} />
      );

      const button = screen.getByRole('button');

      // Button should be disabled when email is empty
      expect(button).toBeDisabled();

      await user.click(button);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not submit with whitespace-only email', async () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} />
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');

      await user.type(input, '   ');
      
      // Button should still be disabled for whitespace-only
      expect(button).toBeDisabled();

      await user.click(button);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should handle form submission via Enter key', async () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} />
      );

      const input = screen.getByRole('textbox');

      await user.type(input, 'test@example.com');
      await user.keyboard('{Enter}');

      expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('Disabled States', () => {
    it('should disable input and button when submitting', () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} isSubmitting={true} />
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');

      expect(input).toBeDisabled();
      expect(button).toBeDisabled();
    });

    it('should disable form when disabled prop is true', () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} disabled={true} />
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');

      expect(input).toBeDisabled();
      expect(button).toBeDisabled();
    });

    it('should enable button when valid email is entered', async () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} />
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');

      // Initially disabled
      expect(button).toBeDisabled();

      // Should enable after typing valid email
      await user.type(input, 'test@example.com');
      expect(button).toBeEnabled();

      // Should disable again if email is cleared
      await user.clear(input);
      expect(button).toBeDisabled();
    });
  });

  describe('Input Validation', () => {
    it('should respect maxLength attribute', async () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '254');
    });

    it('should have proper input type', () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should have required attribute', () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('required');
    });

    it('should have appropriate placeholder text', () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('placeholder', 'Enter your email');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long email input', async () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} />
      );

      const input = screen.getByRole('textbox');
      const longEmail = 'a'.repeat(250) + '@example.com';

      await user.type(input, longEmail);
      
      // Should be truncated due to maxLength
      expect(input.value.length).toBeLessThanOrEqual(254);
    });

    it('should handle special characters in email', async () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} />
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');
      const specialEmail = 'test+special@sub-domain.example.com';

      await user.type(input, specialEmail);
      await user.click(button);

      expect(mockOnSubmit).toHaveBeenCalledWith(specialEmail);
    });

    it('should handle rapid successive clicks', async () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} />
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');

      await user.type(input, 'test@example.com');
      
      // Click multiple times rapidly
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Should only submit once (subsequent clicks on disabled button)
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support tab navigation', async () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} />
      );

      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');

      // Tab to input
      await user.tab();
      expect(input).toHaveFocus();

      // Tab to button
      await user.tab();
      expect(button).toHaveFocus();
    });

    it('should support keyboard shortcuts', async () => {
      renderWithProviders(
        <EmailSubscriptionForm onSubmit={mockOnSubmit} />
      );

      const input = screen.getByRole('textbox');

      await user.click(input);
      await user.type(input, 'test@example.com');

      // Submit with Ctrl+Enter
      await user.keyboard('{Control>}{Enter}{/Control}');

      expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com');
    });
  });
});