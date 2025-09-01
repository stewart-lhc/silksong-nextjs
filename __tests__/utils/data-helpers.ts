/**
 * Data Helper Utilities
 * Non-React testing utilities for data validation and mocking
 */

// Email validation helpers
export const emailTestCases = {
  valid: [
    'test@example.com',
    'user.name@domain.co.uk',
    'firstname+lastname@example.com',
    'test123@example-domain.com',
  ],
  invalid: [
    'invalid-email',
    '@example.com',
    'test@',
    'test..test@example.com',
    'test@example',
    '',
    null,
    undefined,
  ],
}

// API response mock factories
export const createApiMockResponse = {
  success: (data: any) => ({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true, data }),
  }),
  error: (message: string, status = 400) => ({
    ok: false,
    status,
    json: () => Promise.resolve({ success: false, error: message }),
  }),
  network: () => Promise.reject(new Error('Network error')),
}

// Newsletter subscription mock data
export const mockSubscriptionData = {
  active: {
    id: 'sub_123',
    email: 'test@example.com',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  pending: {
    id: 'sub_456',
    email: 'pending@example.com',
    status: 'pending_confirmation',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  unsubscribed: {
    id: 'sub_789',
    email: 'unsubscribed@example.com',
    status: 'unsubscribed',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
}

// Custom matchers
export const customMatchers = {
  toBeValidEmail: (received: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const pass = emailRegex.test(received)
    return {
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be a valid email`,
      pass,
    }
  },
}

// Utility functions
export const testUtils = {
  // Helper to create mock newsletter subscription data
  createMockSubscription: (overrides = {}) => ({
    id: 'test-id-123',
    email: 'test@example.com',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),

  // Helper to wait for async operations
  waitFor: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper to validate email format
  isValidEmail: (email: string) => {
    if (!email || typeof email !== 'string') return false
    // Basic email validation with some common restrictions
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    // Check for consecutive dots and other common issues
    return emailRegex.test(email) && 
           !email.includes('..') && 
           !email.startsWith('.') && 
           !email.endsWith('.') &&
           !email.includes('@.')
  },
}