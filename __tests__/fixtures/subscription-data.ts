/**
 * Test Fixtures - Email Subscription Data
 * Mock data and test scenarios for email subscription testing
 */

import type { TablesInsert, Tables } from '@/types/supabase';

// Mock subscription data
export const mockSubscription: Tables<'email_subscriptions'> = {
  id: 'test-subscription-id-123',
  email: 'test@example.com',
  subscribed_at: '2024-01-01T00:00:00.000Z',
  is_active: true,
  source: 'web',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const mockSubscriptionInsert: TablesInsert<'email_subscriptions'> = {
  email: 'test@example.com',
  source: 'web',
};

// Test email scenarios
export const testEmails = {
  valid: [
    'test@example.com',
    'user123@gmail.com',
    'hello.world@company.co.uk',
    'test+tag@subdomain.example.org',
    'user_name@test-domain.com',
  ],
  invalid: [
    '', // Empty
    ' ', // Whitespace only
    'invalid', // No @ symbol
    '@example.com', // Missing username
    'user@', // Missing domain
    'user@.com', // Invalid domain
    'user..double@example.com', // Double dots
    'user@example..com', // Double dots in domain
    'a'.repeat(250) + '@example.com', // Too long
    'user@' + 'a'.repeat(250) + '.com', // Domain too long
  ],
  edge: [
    'a@b.co', // Minimal valid email
    'test+multiple+tags@example.com', // Multiple plus signs
    'test.email.with.dots@example.com', // Multiple dots
    'Test@EXAMPLE.COM', // Mixed case (should be normalized)
    '  test@example.com  ', // Leading/trailing whitespace
  ],
};

// Mock API responses
export const mockApiResponses = {
  success: {
    success: true,
    message: 'Successfully subscribed!',
    subscription: mockSubscription,
  },
  alreadySubscribed: {
    error: 'Email already subscribed',
    code: 'ALREADY_SUBSCRIBED',
  },
  invalidEmail: {
    error: 'Please enter a valid email address',
  },
  serverError: {
    error: 'Internal server error',
  },
  rateLimit: {
    error: 'Rate limit exceeded. Please wait before subscribing again.',
    resetTime: Date.now() + 60000,
  },
  subscriptionCount: {
    count: 1337,
    total: 1337,
  },
};

// Hook state scenarios
export const hookStates = {
  initial: {
    subscriberCount: 0,
    isSubscribed: false,
    isSubmitting: false,
    isLoading: false,
    error: null,
  },
  loading: {
    subscriberCount: 1337,
    isSubscribed: false,
    isSubmitting: false,
    isLoading: true,
    error: null,
  },
  submitting: {
    subscriberCount: 1337,
    isSubscribed: false,
    isSubmitting: true,
    isLoading: false,
    error: null,
  },
  subscribed: {
    subscriberCount: 1338,
    isSubscribed: true,
    isSubmitting: false,
    isLoading: false,
    error: null,
  },
  error: {
    subscriberCount: 1337,
    isSubscribed: false,
    isSubmitting: false,
    isLoading: false,
    error: 'An error occurred',
  },
};

// Form interaction scenarios
export const formScenarios = {
  validSubmission: {
    email: 'valid@example.com',
    expectedResult: 'success',
  },
  invalidEmailFormat: {
    email: 'invalid-email',
    expectedError: 'Please enter a valid email address',
  },
  duplicateEmail: {
    email: 'existing@example.com',
    expectedError: 'Email already subscribed',
  },
  emptyEmail: {
    email: '',
    expectedError: 'Email is required',
  },
  rateLimited: {
    email: 'ratelimited@example.com',
    expectedError: 'Rate limit exceeded',
  },
  serverError: {
    email: 'servererror@example.com',
    expectedError: 'Internal server error',
  },
};

// Accessibility test data
export const a11yTestCases = {
  form: {
    role: 'form',
    ariaLabel: 'Email subscription form',
  },
  input: {
    type: 'email',
    required: true,
    ariaLabel: 'Email address',
    ariaDescribedBy: 'email-error',
  },
  button: {
    type: 'submit',
    ariaLabel: 'Subscribe to email updates',
  },
  successMessage: {
    role: 'status',
    ariaLive: 'polite',
  },
  errorMessage: {
    role: 'alert',
    ariaLive: 'assertive',
  },
};

// Performance test thresholds
export const performanceThresholds = {
  rendering: {
    maxRenderTime: 100, // milliseconds
    maxReRenders: 3,
  },
  interaction: {
    maxResponseTime: 50, // milliseconds
    maxAsyncResponseTime: 1000, // milliseconds for API calls
  },
  memory: {
    maxMemoryUsage: 10 * 1024 * 1024, // 10MB
  },
};