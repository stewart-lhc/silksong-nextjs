/**
 * Test Helper Utilities
 * Common utilities for testing Newsletter Kit components
 */

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Custom render function with providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  // Simplified version for testing - just return render for now
  // This will be enhanced when we add actual React component tests
  return {
    ...render(ui, options),
    queryClient: null,
  }
}

// Mock Supabase client for testing
export const createMockSupabaseClient = () => ({
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(),
  }),
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
  },
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
    }),
  },
})

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
    json: jest.fn().mockResolvedValue({ success: true, data }),
  }),
  error: (message: string, status = 400) => ({
    ok: false,
    status,
    json: jest.fn().mockResolvedValue({ success: false, error: message }),
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

// Form testing utilities
export const fillFormField = (
  getByRole: any,
  label: string,
  value: string
) => {
  const field = getByRole('textbox', { name: new RegExp(label, 'i') })
  field.focus()
  field.value = ''
  field.blur()
  field.focus()
  field.value = value
  field.dispatchEvent(new Event('input', { bubbles: true }))
  field.blur()
}

// Wait for loading states
export const waitForLoadingToFinish = async (getByTestId: any) => {
  const { waitForElementToBeRemoved } = await import('@testing-library/react')
  try {
    await waitForElementToBeRemoved(() => getByTestId('loading-spinner'), {
      timeout: 3000,
    })
  } catch {
    // Loading spinner might not exist, that's ok
  }
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

// Console error suppression for expected errors in tests
export const suppressConsoleError = (
  errorMessage: string | RegExp,
  callback: () => void
) => {
  const originalError = console.error
  console.error = jest.fn()
  
  try {
    callback()
  } finally {
    console.error = originalError
  }
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'