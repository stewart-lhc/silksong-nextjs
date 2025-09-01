/**
 * Error Handling and Edge Cases Test Suite
 * Simplified version focusing on core error scenarios
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/newsletter/subscribe/route';
import { HeroSection } from '@/components/hero-section';
import { cn, formatError, delay, generateId } from '@/lib/utils';

// Mock fetch globally for component tests
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock dependencies
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
    get: jest.fn().mockReturnValue('192.168.1.1')
  })
}));

// Mock UI components for hero section tests
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type }: any) => (
    <button type={type} onClick={onClick} disabled={disabled} data-testid="button">
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, disabled }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      data-testid="email-input"
    />
  )
}));

jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

jest.mock('lucide-react', () => ({
  Video: () => <svg data-testid="video-icon" />,
}));

describe('Error Handling and Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSupabaseAdmin.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { code: 'PGRST116' }
          })
        })),
        limit: jest.fn().mockResolvedValue({
          count: 100,
          error: null
        })
      })),
      insert: jest.fn(() => ({
        select: jest.fn().mockResolvedValue({
          data: [{ id: 'test-id', email: 'test@example.com', subscribed_at: new Date().toISOString() }],
          error: null
        })
      }))
    });

    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      status: 201,
      json: jest.fn().mockResolvedValue({
        success: true,
        subscription: { email: 'test@example.com' },
        messageId: 'test-id'
      }),
      headers: new Headers(),
      statusText: 'Created'
    } as Response);

    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('API Route Error Boundaries', () => {
    function createMockRequest(body: any): NextRequest {
      return new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });
    }

    it('should handle malformed JSON gracefully', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
        headers: new Map([['content-type', 'application/json']]),
        url: 'http://localhost:3000/api/newsletter/subscribe'
      } as any;

      const response = await POST(request as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid JSON in request body');
    });

    it('should handle missing content-type header', async () => {
      const request = createMockRequest({ email: 'test@example.com' });
      request.headers.delete('content-type');

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Content-Type must be application/json');
    });

    it('should handle database connection timeouts', async () => {
      // Mock database timeout
      mockSupabaseAdmin.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockRejectedValue(new Error('connection timeout'))
          }))
        }))
      });

      const request = createMockRequest({
        email: 'timeout@example.com',
        source: 'timeout-test'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle memory exhaustion scenarios', async () => {
      // Mock out of memory error
      mockSupabaseAdmin.from.mockImplementation(() => {
        const error = new Error('JavaScript heap out of memory');
        error.name = 'RangeError';
        throw error;
      });

      const request = createMockRequest({
        email: 'memory@example.com',
        source: 'memory-test'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('Component Error Boundaries', () => {
    it('should handle network failures gracefully in HeroSection', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(
        new Error('Network connection failed')
      );

      const user = userEvent.setup();
      render(<HeroSection />);

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByText('Notify Me');

      await user.type(emailInput, 'network@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });

      // Should not be in loading state after error
      expect(screen.queryByText('Sending...')).not.toBeInTheDocument();
    });

    it('should handle malformed server responses', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token'))
      } as any);

      const user = userEvent.setup();
      render(<HeroSection />);

      const emailInput = screen.getByTestId('email-input');
      const submitButton = screen.getByText('Notify Me');

      await user.type(emailInput, 'malformed@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });
  });

  describe('Utility Function Edge Cases', () => {
    describe('cn() function resilience', () => {
      it('should handle circular references', () => {
        const circular: any = { a: 'class1' };
        circular.self = circular;
        
        // Should not crash
        expect(() => cn('base', circular)).not.toThrow();
      });

      it('should handle function values', () => {
        const func = () => 'dynamic-class';
        const result = cn('base', func);
        expect(typeof result).toBe('string');
      });

      it('should handle deeply nested arrays', () => {
        const deepArray = ['level1', ['level2', ['level3', 'deep-class']]];
        const result = cn('base', deepArray);
        expect(result).toContain('base');
        expect(result).toContain('deep-class');
      });
    });

    describe('formatError() edge cases', () => {
      it('should handle errors with circular references', () => {
        const error: any = new Error('Test error');
        error.circular = error;
        
        const result = formatError(error);
        expect(result).toBe('Test error');
      });

      it('should handle custom error objects', () => {
        const customError = {
          name: 'CustomError',
          message: 'Custom message',
          stack: 'Custom stack'
        };
        
        const result = formatError(customError);
        expect(result).toBe('[object Object]');
      });
    });

    describe('generateId() edge cases', () => {
      it('should handle negative length', () => {
        const result = generateId(-5);
        expect(result).toBe('');
      });

      it('should handle very large length', () => {
        const result = generateId(1000000);
        expect(result.length).toBeLessThanOrEqual(1000000);
      });

      it('should handle fractional length', () => {
        const result = generateId(5.7);
        expect(result.length).toBe(5); // Should truncate
      });
    });

    describe('delay() function resilience', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('should handle negative delay', async () => {
        const promise = delay(-1000);
        jest.advanceTimersByTime(0);
        await expect(promise).resolves.toBeUndefined();
      });

      it('should handle NaN delay', async () => {
        const promise = delay(NaN);
        jest.advanceTimersByTime(0);
        await expect(promise).resolves.toBeUndefined();
      });
    });
  });

  describe('Security Edge Cases', () => {
    it('should handle XSS attempts in email addresses', async () => {
      const xssEmail = '<script>alert("xss")</script>@example.com';
      const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: xssEmail })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/valid email/i);
    });

    it('should handle SQL injection attempts', async () => {
      const sqlInjectionEmail = "'; DROP TABLE email_subscriptions; --@example.com";
      const request = new NextRequest('http://localhost:3000/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: sqlInjectionEmail })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/valid email/i);
    });
  });
});