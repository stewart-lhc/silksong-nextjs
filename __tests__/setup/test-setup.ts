/**
 * Global test setup for Newsletter Kit
 * This file configures the testing environment for all tests
 */

import '@testing-library/jest-dom';
import 'whatwg-fetch'; // Polyfill for fetch in Node.js
import { beforeAll, afterEach, afterAll } from '@jest/globals';
import { cleanup } from '@testing-library/react';

// ========================= GLOBAL MOCKS =========================

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    data: null,
    error: null,
  })),
}));

// Global fetch mock setup
global.fetch = jest.fn();

// Mock successful fetch by default
(global.fetch as jest.Mock).mockResolvedValue({
  ok: true,
  status: 200,
  statusText: 'OK',
  json: async () => ({
    success: true,
    data: {},
    timestamp: new Date().toISOString(),
  }),
  text: async () => 'OK',
  headers: new Headers(),
});

// Clean up after each test
afterEach(() => {
  // Clean up DOM after each test
  cleanup();
  
  // Clear all mocks after each test
  jest.clearAllMocks();
  
  // Reset fetch mock
  (global.fetch as jest.Mock).mockReset();
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ success: true, data: {} }),
  });
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
}));

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};

// Global test utilities
export const TEST_IDS = {
  EMAIL_SUBSCRIPTION_FORM: 'email-subscription-form',
  EMAIL_INPUT: 'email-input',
  SUBSCRIBE_BUTTON: 'subscribe-button',
  SUCCESS_MESSAGE: 'success-message',
  ERROR_MESSAGE: 'error-message',
  SUBSCRIBER_COUNT: 'subscriber-count',
  LOADING_SPINNER: 'loading-spinner',
} as const;

export const MOCK_EMAILS = {
  VALID: 'test@example.com',
  INVALID_FORMAT: 'invalid-email',
  LONG_EMAIL: 'a'.repeat(250) + '@example.com',
  EMPTY: '',
  EXISTING: 'existing@example.com',
} as const;