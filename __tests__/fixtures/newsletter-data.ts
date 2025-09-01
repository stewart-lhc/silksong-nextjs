/**
 * Test Fixtures for Newsletter Kit
 * Static test data for consistent testing
 */

export const validEmailAddresses = [
  'test@example.com',
  'user.name@domain.co.uk',
  'firstname+lastname@example.com',
  'test123@example-domain.com',
  'user_name@example.org',
  'test.email.with+symbol@example.com',
  'x@example.com',
  'example@s.example',
]

export const invalidEmailAddresses = [
  'plainaddress',
  '@missingemail.com',
  'missing@.com',
  'missing@domain',
  'spaces in@email.com',
  'email@',
  '@domain.com',
  'email..double.dot@example.com',
  'email@domain..com',
  '',
  null,
  undefined,
  'email@domain',
  '.email@example.com',
  'email.@example.com',
  'email@-domain.com',
  'email@domain-.com',
]

export const mockSubscriptions = {
  active: {
    id: 'sub_active_123',
    email: 'active@example.com',
    status: 'active',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
    confirmed_at: '2024-01-01T10:30:00Z',
    unsubscribed_at: null,
  },
  pending: {
    id: 'sub_pending_456',
    email: 'pending@example.com',
    status: 'pending_confirmation',
    created_at: '2024-01-02T11:00:00Z',
    updated_at: '2024-01-02T11:00:00Z',
    confirmed_at: null,
    unsubscribed_at: null,
  },
  unsubscribed: {
    id: 'sub_unsubscribed_789',
    email: 'unsubscribed@example.com',
    status: 'unsubscribed',
    created_at: '2024-01-03T12:00:00Z',
    updated_at: '2024-01-03T15:00:00Z',
    confirmed_at: '2024-01-03T12:30:00Z',
    unsubscribed_at: '2024-01-03T15:00:00Z',
  },
}

export const mockApiResponses = {
  subscribe: {
    success: {
      status: 200,
      data: {
        success: true,
        data: {
          id: 'new_sub_123',
          email: 'new@example.com',
          status: 'pending_confirmation',
        },
        message: 'Successfully subscribed. Please check your email for confirmation.',
      },
    },
    duplicate: {
      status: 409,
      data: {
        success: false,
        error: 'Email already subscribed',
        code: 'DUPLICATE_EMAIL',
      },
    },
    invalidEmail: {
      status: 400,
      data: {
        success: false,
        error: 'Invalid email format',
        code: 'INVALID_EMAIL',
      },
    },
    serverError: {
      status: 500,
      data: {
        success: false,
        error: 'Internal server error',
        code: 'SERVER_ERROR',
      },
    },
  },
  unsubscribe: {
    success: {
      status: 200,
      data: {
        success: true,
        message: 'Successfully unsubscribed',
      },
    },
    notFound: {
      status: 404,
      data: {
        success: false,
        error: 'Subscription not found',
        code: 'NOT_FOUND',
      },
    },
  },
  status: {
    active: {
      status: 200,
      data: {
        success: true,
        data: {
          status: 'active',
          subscribed_at: '2024-01-01T10:00:00Z',
        },
      },
    },
    pending: {
      status: 200,
      data: {
        success: true,
        data: {
          status: 'pending_confirmation',
          subscribed_at: '2024-01-01T10:00:00Z',
        },
      },
    },
    unsubscribed: {
      status: 200,
      data: {
        success: true,
        data: {
          status: 'unsubscribed',
          subscribed_at: '2024-01-01T10:00:00Z',
          unsubscribed_at: '2024-01-01T15:00:00Z',
        },
      },
    },
    notFound: {
      status: 404,
      data: {
        success: false,
        error: 'Email not found',
        code: 'NOT_FOUND',
      },
    },
  },
}

export const formTestData = {
  validSubmissions: [
    { email: 'test1@example.com' },
    { email: 'user@domain.co.uk' },
    { email: 'test+tag@example.org' },
  ],
  invalidSubmissions: [
    { email: 'invalid-email', expectedError: 'Invalid email format' },
    { email: '', expectedError: 'Email is required' },
    { email: 'test@', expectedError: 'Invalid email format' },
    { email: '@example.com', expectedError: 'Invalid email format' },
  ],
}

export const databaseErrorScenarios = {
  networkError: new Error('Network request failed'),
  timeoutError: new Error('Request timeout'),
  serverError: {
    message: 'Internal server error',
    status: 500,
    statusText: 'Internal Server Error',
  },
  validationError: {
    message: 'Validation failed',
    status: 400,
    statusText: 'Bad Request',
    details: ['Email format is invalid'],
  },
}

export const emailTemplateTestData = {
  confirmation: {
    subject: 'Confirm your subscription to Silksong Updates',
    recipient: 'test@example.com',
    confirmationUrl: 'https://example.com/confirm?token=abc123',
    unsubscribeUrl: 'https://example.com/unsubscribe?token=abc123',
  },
  welcome: {
    subject: 'Welcome to Silksong Updates!',
    recipient: 'test@example.com',
    unsubscribeUrl: 'https://example.com/unsubscribe?token=abc123',
  },
  newsletter: {
    subject: 'Silksong News Update',
    recipient: 'test@example.com',
    content: 'Latest news about Hollow Knight: Silksong',
    unsubscribeUrl: 'https://example.com/unsubscribe?token=abc123',
  },
}