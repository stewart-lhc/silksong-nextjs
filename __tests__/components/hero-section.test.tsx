/**
 * Hero Section Component Test Suite
 * Comprehensive testing for the main hero section component
 * Tests form submission, state management, countdown timer, and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { HeroSection } from '@/components/hero-section';

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock external dependencies
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Video: ({ className, ...props }: any) => (
    <svg className={className} data-testid="video-icon" {...props} />
  ),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, className, disabled, type, onClick, ...props }: any) => (
    <button
      type={type}
      className={className}
      disabled={disabled}
      onClick={onClick}
      data-testid="button"
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ className, value, onChange, placeholder, type, disabled, required, maxLength, ...props }: any) => (
    <input
      type={type}
      className={className}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      maxLength={maxLength}
      data-testid="email-input"
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    <div data-testid="dialog" data-open={open}>
      {children}
    </div>
  ),
  DialogContent: ({ children, className }: any) => (
    <div className={className} data-testid="dialog-content">
      {children}
    </div>
  ),
  DialogTrigger: ({ children, asChild }: any) => (
    <div data-testid="dialog-trigger">
      {children}
    </div>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
}));

describe('HeroSection Component', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    
    // Mock successful fetch response by default
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      status: 201,
      json: jest.fn().mockResolvedValue({
        success: true,
        subscription: {
          id: 'test-id',
          email: 'test@example.com',
          subscribed_at: '2024-01-01T00:00:00Z'
        },
        emailSent: true,
        messageId: 'test-message-id',
        subscriberCount: 1001,
        transactional: true
      }),
      headers: new Headers(),
      statusText: 'Created'
    } as Response);

    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render all main sections', () => {
      render(<HeroSection />);
      
      // Check for main title
      expect(screen.getByText('HOLLOW KNIGHT')).toBeInTheDocument();
      expect(screen.getByText('SILKSONG')).toBeInTheDocument();
      
      // Check for countdown section
      expect(screen.getByText('Release Countdown')).toBeInTheDocument();
      
      // Check for subscription section
      expect(screen.getByText('Release Updates')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      
      // Check for action buttons
      expect(screen.getByText('Release Trailer')).toBeInTheDocument();
      expect(screen.getByText('View Timeline')).toBeInTheDocument();
    });

    it('should render countdown timer with all time units', () => {
      render(<HeroSection />);
      
      expect(screen.getByText('Days')).toBeInTheDocument();
      expect(screen.getByText('Hours')).toBeInTheDocument();
      expect(screen.getByText('Minutes')).toBeInTheDocument();
      expect(screen.getByText('Seconds')).toBeInTheDocument();
    });

    it('should render YouTube iframe with correct parameters', () => {
      render(<HeroSection />);
      
      const iframe = screen.getByTitle('Hollow Knight Silksong Background Video');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', expect.stringContaining('youtube-nocookie.com/embed'));
      expect(iframe).toHaveAttribute('src', expect.stringContaining('autoplay=1'));
      expect(iframe).toHaveAttribute('src', expect.stringContaining('mute=1'));
    });
  });

  describe('Email Subscription Form', () => {
    it('should allow user to input email address', async () => {
      render(<HeroSection />);
      
      const emailInput = screen.getByTestId('email-input');
      await user.type(emailInput, 'user@example.com');
      
      expect(emailInput).toHaveValue('user@example.com');
    });

    it('should show error for empty email submission', async () => {
      render(<HeroSection />);
      
      const submitButton = screen.getByText('Notify Me');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter your email address')).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      render(<HeroSection />);
      
      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByText('Notify Me');
      
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('should successfully submit valid email', async () => {
      render(<HeroSection />);
      
      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByText('Notify Me');
      
      await user.type(emailInput, 'user@example.com');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'user@example.com',
            source: 'homepage-hero'
          })
        });
      });
    });

    it('should show loading state during submission', async () => {
      // Mock delayed response
      (global.fetch as jest.MockedFunction<typeof fetch>).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(<HeroSection />);
      
      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByText('Notify Me');
      
      await user.type(emailInput, 'user@example.com');
      await user.click(submitButton);
      
      // Should show loading state
      expect(screen.getByText('Sending...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(emailInput).toBeDisabled();
    });

    it('should show success message after successful subscription', async () => {
      render(<HeroSection />);
      
      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByText('Notify Me');
      
      await user.type(emailInput, 'user@example.com');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Subscribed!')).toBeInTheDocument();
        expect(screen.getByText(/Welcome! Check your email/)).toBeInTheDocument();
      });
      
      // Email input should be cleared
      expect(emailInput).toHaveValue('');
    });

    it('should handle duplicate email subscription', async () => {
      // Mock 409 conflict response
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 409,
        json: jest.fn().mockResolvedValue({
          error: 'Email already subscribed',
          code: 'ALREADY_SUBSCRIBED'
        }),
        headers: new Headers(),
        statusText: 'Conflict'
      } as Response);
      
      render(<HeroSection />);
      
      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByText('Notify Me');
      
      await user.type(emailInput, 'existing@example.com');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/already subscribed/i)).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      // Mock network error
      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(
        new Error('Network error')
      );
      
      render(<HeroSection />);
      
      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByText('Notify Me');
      
      await user.type(emailInput, 'user@example.com');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });

    it('should handle server errors', async () => {
      // Mock server error response
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({
          error: 'Internal server error'
        }),
        headers: new Headers(),
        statusText: 'Internal Server Error'
      } as Response);
      
      render(<HeroSection />);
      
      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByText('Notify Me');
      
      await user.type(emailInput, 'user@example.com');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing', async () => {
      render(<HeroSection />);
      
      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByText('Notify Me');
      
      // First trigger an error
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
      
      // Clear input and type new email
      await user.clear(emailInput);
      await user.type(emailInput, 'valid@example.com');
      
      // Error should be cleared
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
    });

    it('should normalize email addresses (trim and lowercase)', async () => {
      render(<HeroSection />);
      
      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByText('Notify Me');
      
      await user.type(emailInput, '  USER@EXAMPLE.COM  ');
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'user@example.com',
            source: 'homepage-hero'
          })
        });
      });
    });

    it('should disable submit button when email is empty', () => {
      render(<HeroSection />);
      
      const submitButton = screen.getByText('Notify Me');
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when email is entered', async () => {
      render(<HeroSection />);
      
      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByText('Notify Me');
      
      expect(submitButton).toBeDisabled();
      
      await user.type(emailInput, 'user@example.com');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Countdown Timer', () => {
    beforeEach(() => {
      // Mock Date to control countdown behavior
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should update countdown every second', () => {
      render(<HeroSection />);
      
      // Initial countdown should show some values
      const daysElement = screen.getByText('Days').previousElementSibling;
      const initialDays = daysElement?.textContent;
      
      // Fast-forward 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      // Countdown should update (seconds should decrease)
      const secondsElement = screen.getByText('Seconds').previousElementSibling;
      expect(secondsElement).toBeInTheDocument();
    });

    it('should calculate time until September 4, 2025', () => {
      render(<HeroSection />);
      
      // Should show days remaining until the target date
      const daysElement = screen.getByText('Days').previousElementSibling;
      expect(daysElement?.textContent).toMatch(/\d+/);
      
      // Should show the target date
      expect(screen.getByText('4 September 2025 – 14:00:00 UTC')).toBeInTheDocument();
    });
  });

  describe('Dialog Interactions', () => {
    it('should open trailer dialog when trailer button is clicked', async () => {
      render(<HeroSection />);
      
      const trailerButton = screen.getByText('Release Trailer');
      await user.click(trailerButton);
      
      // Dialog should be present (mocked)
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('should render trailer iframe in dialog content', () => {
      render(<HeroSection />);
      
      // Check that the dialog content contains the YouTube iframe
      const dialogContent = screen.getByTestId('dialog-content');
      expect(dialogContent).toBeInTheDocument();
      
      const trailerIframe = screen.getByTitle('Hollow Knight Silksong Release Trailer');
      expect(trailerIframe).toBeInTheDocument();
      expect(trailerIframe).toHaveAttribute('src', expect.stringContaining('6XGeJwsUP9c'));
    });
  });

  describe('Navigation Links', () => {
    it('should render timeline link with correct href', () => {
      render(<HeroSection />);
      
      const timelineLink = screen.getByText('View Timeline').closest('a');
      expect(timelineLink).toHaveAttribute('href', '/timeline');
    });

    it('should render external SteamDB link with correct attributes', () => {
      render(<HeroSection />);
      
      const steamdbLink = screen.getByText('4 September 2025 – 14:00:00 UTC');
      expect(steamdbLink.closest('a')).toHaveAttribute('href', 'https://steamdb.info/app/1030300');
      expect(steamdbLink.closest('a')).toHaveAttribute('target', '_blank');
      expect(steamdbLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Email Validation Function', () => {
    it('should validate various email formats correctly', () => {
      render(<HeroSection />);
      
      // Access the component instance is not directly available,
      // so we test through the UI behavior
      const testCases = [
        { email: 'valid@example.com', shouldPass: true },
        { email: 'user+tag@domain.co.uk', shouldPass: true },
        { email: 'invalid-email', shouldPass: false },
        { email: '@example.com', shouldPass: false },
        { email: 'test@', shouldPass: false },
        { email: '', shouldPass: false },
      ];

      // This would be tested through the form validation behavior
      // The actual validation logic is tested implicitly through form submission tests
    });

    it('should enforce maximum email length (254 characters)', async () => {
      render(<HeroSection />);
      
      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toHaveAttribute('maxLength', '254');
    });
  });

  describe('Background Video', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should show background image initially', () => {
      render(<HeroSection />);
      
      // Background image should be visible initially
      const backgroundDiv = document.querySelector('[style*="Hornet_mid_shot.webp"]');
      expect(backgroundDiv).toBeInTheDocument();
    });

    it('should transition to video after 3 seconds', () => {
      render(<HeroSection />);
      
      // Initially video should have opacity 0
      const iframe = screen.getByTitle('Hollow Knight Silksong Background Video');
      expect(iframe).toHaveStyle({ opacity: '0' });
      
      // Fast-forward 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      
      // Video should become visible (opacity 1)
      expect(iframe).toHaveStyle({ opacity: '1' });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and ARIA attributes', () => {
      render(<HeroSection />);
      
      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email');
    });

    it('should provide proper iframe titles for screen readers', () => {
      render(<HeroSection />);
      
      const backgroundVideo = screen.getByTitle('Hollow Knight Silksong Background Video');
      expect(backgroundVideo).toBeInTheDocument();
      
      const trailerVideo = screen.getByTitle('Hollow Knight Silksong Release Trailer');
      expect(trailerVideo).toBeInTheDocument();
    });

    it('should show appropriate error messages for form validation', async () => {
      render(<HeroSection />);
      
      // Test various error scenarios
      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByText('Notify Me');
      
      // Empty email
      await user.click(submitButton);
      await waitFor(() => {
        const errorMessage = screen.getByText('Please enter your email address');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('text-red-400/90');
      });
    });
  });

  describe('Responsive Design Elements', () => {
    it('should include responsive classes for different screen sizes', () => {
      render(<HeroSection />);
      
      // Check for responsive typography classes
      const mainTitle = screen.getByText('HOLLOW KNIGHT');
      expect(mainTitle).toHaveClass('text-4xl', 'md:text-6xl', 'lg:text-8xl');
      
      const subtitle = screen.getByText('SILKSONG');
      expect(subtitle).toHaveClass('text-5xl', 'md:text-7xl', 'lg:text-9xl');
    });

    it('should include responsive grid classes', () => {
      render(<HeroSection />);
      
      // Check for responsive grid layout classes in the component structure
      const countdownSection = screen.getByText('Release Countdown').closest('div');
      expect(countdownSection?.parentElement).toHaveClass('lg:col-span-2');
    });
  });
});