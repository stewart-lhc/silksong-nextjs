/**
 * Basic Email Service Tests
 * Simple tests without complex mocking
 */

describe('Email Service Module', () => {
  it('should be importable', async () => {
    // Test that the module can be imported without errors
    expect(() => {
      require('@/lib/email-service');
    }).not.toThrow();
  });

  it('should export required functions', () => {
    const emailService = require('@/lib/email-service');
    
    expect(typeof emailService.sendWelcomeEmail).toBe('function');
    expect(typeof emailService.getSubscriberCount).toBe('function');
    expect(typeof emailService.sendConfirmationEmail).toBe('function');
  });
});