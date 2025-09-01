/**
 * Email Validation Test Example
 * Demonstrates how to use the test infrastructure for validation testing
 */

import { emailTestCases, testUtils } from '@/__tests__/utils/data-helpers'

describe('Email Validation Example', () => {
  describe('Valid Emails', () => {
    it.each(emailTestCases.valid)('should accept valid email: %s', (email) => {
      expect(testUtils.isValidEmail(email)).toBe(true)
    })
  })

  describe('Invalid Emails', () => {
    it.each(emailTestCases.invalid.filter(email => email != null))('should reject invalid email: %s', (email) => {
      expect(testUtils.isValidEmail(email)).toBe(false)
    })

    it('should handle null and undefined', () => {
      expect(testUtils.isValidEmail(null as any)).toBe(false)
      expect(testUtils.isValidEmail(undefined as any)).toBe(false)
    })
  })

  describe('Mock Data Creation', () => {
    it('should create mock subscription with defaults', () => {
      const subscription = testUtils.createMockSubscription()
      
      expect(subscription).toHaveProperty('id')
      expect(subscription).toHaveProperty('email', 'test@example.com')
      expect(subscription).toHaveProperty('status', 'active')
      expect(subscription).toHaveProperty('created_at')
      expect(subscription).toHaveProperty('updated_at')
    })

    it('should create mock subscription with overrides', () => {
      const subscription = testUtils.createMockSubscription({
        email: 'custom@example.com',
        status: 'pending_confirmation',
      })
      
      expect(subscription.email).toBe('custom@example.com')
      expect(subscription.status).toBe('pending_confirmation')
      expect(subscription.id).toBe('test-id-123') // default value
    })
  })

  describe('Global Test Utilities', () => {
    it('should have global testUtils available', () => {
      expect(global.testUtils).toBeDefined()
      expect(global.testUtils.createMockSubscription).toBeInstanceOf(Function)
    })

    it('should create consistent mock data', () => {
      const mockData = global.testUtils.createMockSubscription({ email: 'global@test.com' })
      expect(mockData.email).toBe('global@test.com')
      expect(mockData.status).toBe('active')
    })
  })
})