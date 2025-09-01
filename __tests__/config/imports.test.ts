/**
 * Import Resolution Test
 * Test actual imports from path aliases to verify moduleNameMapper works
 */

describe('Import Resolution', () => {
  it('should import from @/lib/utils', async () => {
    // Test importing from lib utils
    const { cn } = await import('@/lib/utils')
    expect(cn).toBeInstanceOf(Function)
  })

  it('should import types', async () => {
    // Test importing types
    const types = await import('@/types/email-subscription')
    expect(types).toBeDefined()
  })

  it('should import data helpers', async () => {
    // Test importing data helper utilities
    const { emailTestCases, testUtils, createApiMockResponse } = await import('@/__tests__/utils/data-helpers')
    expect(emailTestCases).toBeDefined()
    expect(emailTestCases.valid).toBeInstanceOf(Array)
    expect(emailTestCases.invalid).toBeInstanceOf(Array)
    expect(testUtils).toBeDefined()
    expect(testUtils.createMockSubscription).toBeInstanceOf(Function)
    expect(createApiMockResponse.success).toBeInstanceOf(Function)
  })

  it('should import test fixtures', async () => {
    // Test importing test fixtures
    const fixtures = await import('@/__tests__/fixtures/newsletter-data')
    expect(fixtures.validEmailAddresses).toBeInstanceOf(Array)
    expect(fixtures.mockSubscriptions).toBeDefined()
    expect(fixtures.mockApiResponses).toBeDefined()
  })

  it('should import mocks', async () => {
    // Test importing mocks
    const { mockSupabaseClient } = await import('@/__tests__/mocks/supabase')
    expect(mockSupabaseClient).toBeDefined()
    expect(typeof mockSupabaseClient.from).toBe('function')
    expect(mockSupabaseClient.auth).toBeDefined()
  })
})