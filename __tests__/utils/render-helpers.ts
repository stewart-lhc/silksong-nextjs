/**
 * Render Helper Utilities
 * React testing utilities without test hooks
 */

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

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