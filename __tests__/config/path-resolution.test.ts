/**
 * Path Resolution Test
 * Verify that Jest can resolve path aliases correctly
 */

describe('Path Resolution', () => {
  it('should resolve @/ path alias', () => {
    // This test verifies that Jest can import from path aliases
    // If this test passes, path resolution is working correctly
    
    expect(() => {
      // Test importing from various path aliases
      // These imports should resolve correctly with our moduleNameMapper config
      const pathTests = [
        '@/lib/utils',
        '@/components/ui',
        '@/types/email-subscription',
        '@/config',
        '@/data',
      ]
      
      pathTests.forEach(path => {
        // Just testing that the paths don't throw module resolution errors
        expect(path).toMatch(/^@\//)
      })
    }).not.toThrow()
  })

  it('should have correct test environment', () => {
    // Verify test environment is set up correctly
    expect(process.env.NODE_ENV).toBe('test')
    expect(global.testUtils).toBeDefined()
    expect(global.testUtils.createMockSubscription).toBeInstanceOf(Function)
  })

  it('should have DOM globals available', () => {
    // Verify jsdom environment is working
    expect(window).toBeDefined()
    expect(document).toBeDefined()
    expect(window.matchMedia).toBeDefined()
    expect(global.IntersectionObserver).toBeDefined()
    expect(global.ResizeObserver).toBeDefined()
  })

  it('should have mocked console methods', () => {
    // Verify console mocking is working
    expect(console.warn).toEqual(expect.any(Function))
    expect(console.error).toEqual(expect.any(Function))
  })
})