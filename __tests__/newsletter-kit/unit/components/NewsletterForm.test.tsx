/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NewsletterForm, NewsletterProvider } from '@/lib/newsletter-kit/components';
import { createNewsletterConfig } from '@/lib/newsletter-kit/config';
import type { NewsletterConfig, DatabaseAdapter } from '@/lib/newsletter-kit/types';

// Mock fetch
global.fetch = jest.fn();

// Mock database adapter
const mockAdapter: DatabaseAdapter = {
  insert: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
  list: jest.fn(),
  healthCheck: jest.fn(),
};

// Test configuration
const testConfig: NewsletterConfig = createNewsletterConfig({
  database: {
    adapter: mockAdapter,
    tableName: 'test_subscriptions',
  },
  api: {
    baseUrl: 'http://localhost:3000',
    endpoints: {
      subscribe: '/api/newsletter/subscribe',
      unsubscribe: '/api/newsletter/unsubscribe',
      stats: '/api/newsletter/stats',
    },
  },
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <NewsletterProvider config={testConfig}>
        {children}
      </NewsletterProvider>
    </QueryClientProvider>
  );
};

describe('NewsletterForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockReset();
  });

  describe('Rendering', () => {
    it('renders with default props', () => {
      render(
        <TestWrapper>
          <NewsletterForm />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('Enter your email address')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
    });

    it('renders with custom placeholder and submit text', () => {
      render(
        <TestWrapper>
          <NewsletterForm 
            placeholder="Your email here" 
            submitText="Join Now" 
          />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('Your email here')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /join now/i })).toBeInTheDocument();
    });

    it('renders subscriber count when showCount is true', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { total: 1234 },
        }),
      });

      render(
        <TestWrapper>
          <NewsletterForm showCount={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/1,234 subscribers/i)).toBeInTheDocument();
      });
    });

    it('applies custom className', () => {
      render(
        <TestWrapper>
          <NewsletterForm className="custom-class" data-testid="newsletter-form" />
        </TestWrapper>
      );

      const form = screen.getByTestId('newsletter-form');
      expect(form).toHaveClass('custom-class');
    });
  });

  describe('Form Variants', () => {
    it('applies minimal variant styles', () => {
      render(
        <TestWrapper>
          <NewsletterForm variant="minimal" data-testid="newsletter-form" />
        </TestWrapper>
      );

      const form = screen.getByTestId('newsletter-form');
      expect(form).toHaveClass('newsletter-form--minimal');
    });

    it('applies modern variant styles', () => {
      render(
        <TestWrapper>
          <NewsletterForm variant="modern" data-testid="newsletter-form" />
        </TestWrapper>
      );

      const form = screen.getByTestId('newsletter-form');
      expect(form).toHaveClass('newsletter-form--modern');
    });

    it('applies correct size classes', () => {
      const { rerender } = render(
        <TestWrapper>
          <NewsletterForm size="sm" data-testid="newsletter-form" />
        </TestWrapper>
      );

      expect(screen.getByTestId('newsletter-form')).toHaveClass('newsletter-form--sm');

      rerender(
        <TestWrapper>
          <NewsletterForm size="lg" data-testid="newsletter-form" />
        </TestWrapper>
      );

      expect(screen.getByTestId('newsletter-form')).toHaveClass('newsletter-form--lg');
    });
  });

  describe('Email Validation', () => {
    it('shows error for invalid email format', async () => {
      render(
        <TestWrapper>
          <NewsletterForm />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('shows error for empty email', async () => {
      render(
        <TestWrapper>
          <NewsletterForm />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('accepts valid email', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            subscription: {
              id: 'test-id',
              email: 'test@example.com',
              subscribed_at: new Date().toISOString(),
            },
            count: 1,
          },
        }),
      });

      render(
        <TestWrapper>
          <NewsletterForm />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/successfully subscribed/i)).toBeInTheDocument();
      });
    });

    it('validates blocked domains', async () => {
      render(
        <TestWrapper>
          <NewsletterForm blockedDomains={['tempmail.org']} />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@tempmail.org');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/this email domain is not allowed/i)).toBeInTheDocument();
      });
    });

    it('validates allowed domains', async () => {
      render(
        <TestWrapper>
          <NewsletterForm allowedDomains={['gmail.com']} />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@yahoo.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/please use an allowed email domain/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('shows loading state during submission', async () => {
      // Mock a delayed response
      (fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({
              success: true,
              data: { subscription: {}, count: 1 },
            }),
          }), 100)
        )
      );

      render(
        <TestWrapper>
          <NewsletterForm loadingText="Subscribing..." />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      // Check loading state
      expect(screen.getByText(/subscribing/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText(/successfully subscribed/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('handles API errors gracefully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Server error',
        }),
      });

      render(
        <TestWrapper>
          <NewsletterForm />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });
    });

    it('handles network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(
        <TestWrapper>
          <NewsletterForm />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('handles already subscribed case', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          error: 'Already subscribed',
          code: 'ALREADY_SUBSCRIBED',
        }),
      });

      render(
        <TestWrapper>
          <NewsletterForm />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/already subscribed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Event Callbacks', () => {
    it('calls onSuccess when subscription succeeds', async () => {
      const onSuccess = jest.fn();
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            subscription: {
              id: 'test-id',
              email: 'test@example.com',
              subscribed_at: new Date().toISOString(),
            },
            count: 1,
          },
        }),
      });

      render(
        <TestWrapper>
          <NewsletterForm onSuccess={onSuccess} />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            subscription: expect.any(Object),
          })
        );
      });
    });

    it('calls onError when subscription fails', async () => {
      const onError = jest.fn();
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Server error',
        }),
      });

      render(
        <TestWrapper>
          <NewsletterForm onError={onError} />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            code: expect.any(String),
            message: expect.any(String),
          })
        );
      });
    });

    it('calls onStatusChange during form lifecycle', async () => {
      const onStatusChange = jest.fn();
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { subscription: {}, count: 1 },
        }),
      });

      render(
        <TestWrapper>
          <NewsletterForm onStatusChange={onStatusChange} />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(onStatusChange).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'validating' })
        );
        expect(onStatusChange).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'submitting' })
        );
        expect(onStatusChange).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'success' })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <TestWrapper>
          <NewsletterForm />
        </TestWrapper>
      );

      const form = screen.getByRole('form');
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      expect(form).toHaveAttribute('aria-label', 'Newsletter subscription');
      expect(emailInput).toHaveAttribute('aria-required', 'true');
      expect(emailInput).toHaveAttribute('aria-invalid', 'false');
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('updates aria-invalid on validation error', async () => {
      render(
        <TestWrapper>
          <NewsletterForm />
        </TestWrapper>
      );

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        expect(emailInput).toHaveAttribute('aria-describedby');
      });
    });

    it('has proper focus management', async () => {
      render(
        <TestWrapper>
          <NewsletterForm autoFocus />
        </TestWrapper>
      );

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      expect(emailInput).toHaveFocus();
    });
  });

  describe('Disabled State', () => {
    it('disables form when disabled prop is true', () => {
      render(
        <TestWrapper>
          <NewsletterForm disabled />
        </TestWrapper>
      );

      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const submitButton = screen.getByRole('button', { name: /subscribe/i });

      expect(emailInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it('prevents submission when disabled', async () => {
      const onSuccess = jest.fn();
      
      render(
        <TestWrapper>
          <NewsletterForm disabled onSuccess={onSuccess} />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /subscribe/i });
      await user.click(submitButton);

      expect(onSuccess).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    });
  });
});