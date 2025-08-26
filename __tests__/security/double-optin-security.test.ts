/**
 * Comprehensive Security Tests for Double Opt-in Email Subscription System
 * 
 * Tests cover:
 * - Token generation security and uniqueness
 * - Token replay attack prevention
 * - Race condition protection
 * - Input validation and sanitization
 * - Email normalization
 * - Atomic file operations
 * - Expiration handling
 * - Error handling without information leakage
 * 
 * OWASP Testing Guidelines Applied:
 * - WSTG-ATHN-04: Testing for Bypassing Authentication Schema
 * - WSTG-SESS-01: Testing for Session Management Schema
 * - WSTG-INPV-05: Testing for SQL Injection
 * - WSTG-CRYP-01: Testing for Weak Cryptography
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import {
  generateSecureToken,
  normalizeEmail,
  validateEmailFormat,
  createPendingToken,
  validateToken,
  confirmSubscription,
  atomicWrite,
  cleanupExpiredTokens,
  secureLog
} from '@/lib/double-optin-security';

// Test setup
const TEST_EMAIL = 'test@example.com';
const TEST_EMAIL_VARIANTS = [
  'Test@Example.com',
  '  test@example.com  ',
  'TEST@EXAMPLE.COM'
];
const INVALID_EMAILS = [
  '',
  'invalid',
  '@example.com',
  'test@',
  'test@.com',
  'test..test@example.com',
  'a'.repeat(255) + '@example.com' // Too long
];

const TEST_PENDING_DIR = path.join(process.cwd(), 'data', 'pending-test');
const TEST_SUBSCRIBERS_FILE = path.join(process.cwd(), 'data', 'subscribers-test.csv');

// Mock environment for testing
const originalEnv = process.env;
beforeAll(() => {
  process.env.SITE_HASH_SALT = 'test-salt-for-security-testing';
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  process.env = originalEnv;
});

// Clean up test files before and after tests
beforeEach(async () => {
  try {
    await fs.rm(TEST_PENDING_DIR, { recursive: true, force: true });
    await fs.unlink(TEST_SUBSCRIBERS_FILE);
  } catch {
    // Files might not exist, ignore
  }
  await fs.mkdir(TEST_PENDING_DIR, { recursive: true });
});

afterEach(async () => {
  try {
    await fs.rm(TEST_PENDING_DIR, { recursive: true, force: true });
    await fs.unlink(TEST_SUBSCRIBERS_FILE);
  } catch {
    // Ignore cleanup errors
  }
});

describe('Double Opt-in Security Tests', () => {
  
  describe('Token Generation Security', () => {
    
    test('generates unique tokens for same email at different times', () => {
      const token1 = generateSecureToken(TEST_EMAIL);
      
      // Wait a millisecond to ensure different timestamp
      return new Promise<void>(resolve => {
        setTimeout(() => {
          const token2 = generateSecureToken(TEST_EMAIL);
          
          expect(token1).not.toBe(token2);
          expect(token1).toHaveLength(32);
          expect(token2).toHaveLength(32);
          expect(/^[a-f0-9]{32}$/.test(token1)).toBe(true);
          expect(/^[a-f0-9]{32}$/.test(token2)).toBe(true);
          resolve();
        }, 1);
      });
    });
    
    test('generates different tokens for different emails', () => {
      const token1 = generateSecureToken('user1@example.com');
      const token2 = generateSecureToken('user2@example.com');
      
      expect(token1).not.toBe(token2);
      expect(token1).toHaveLength(32);
      expect(token2).toHaveLength(32);
    });
    
    test('token generation is deterministic with same input and timestamp', () => {
      // Mock Date.now to return consistent timestamp
      const originalDateNow = Date.now;
      const fixedTimestamp = 1640995200000; // Fixed timestamp
      Date.now = jest.fn(() => fixedTimestamp);
      
      const token1 = generateSecureToken(TEST_EMAIL);
      const token2 = generateSecureToken(TEST_EMAIL);
      
      expect(token1).toBe(token2); // Same inputs should produce same token
      
      // Restore Date.now
      Date.now = originalDateNow;
    });
    
    test('tokens contain no predictable patterns', () => {
      const tokens = Array.from({ length: 100 }, () => generateSecureToken(TEST_EMAIL));
      
      // Check for uniqueness (should be unique due to timestamp)
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBeGreaterThan(95); // Allow for some collision in rapid generation
      
      // Check that tokens don't contain sequential patterns
      for (const token of tokens) {
        expect(token).not.toMatch(/012345|abcdef|fedcba|543210/);
      }
    });
  });

  describe('Email Validation and Normalization', () => {
    
    test('normalizes valid email variants correctly', () => {
      TEST_EMAIL_VARIANTS.forEach(variant => {
        const normalized = normalizeEmail(variant);
        expect(normalized).toBe('test@example.com');
      });
    });
    
    test('validates legitimate email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'user+tag@example.org',
        'user123@example123.com'
      ];
      
      validEmails.forEach(email => {
        const result = validateEmailFormat(email);
        expect(result.success).toBe(true);
        expect(result.data).toBe(normalizeEmail(email));
      });
    });
    
    test('rejects invalid email addresses with appropriate error codes', () => {
      const testCases = [
        { email: '', expectedCode: 'EMAIL_REQUIRED' },
        { email: 'invalid', expectedCode: 'EMAIL_INVALID' },
        { email: '@example.com', expectedCode: 'EMAIL_INVALID' },
        { email: 'test@', expectedCode: 'EMAIL_INVALID' },
        { email: 'a'.repeat(255) + '@example.com', expectedCode: 'EMAIL_TOO_LONG' }
      ];
      
      testCases.forEach(({ email, expectedCode }) => {
        const result = validateEmailFormat(email);
        expect(result.success).toBe(false);
        expect(result.code).toBe(expectedCode);
      });
    });
  });

  describe('Atomic File Operations', () => {
    
    test('atomic write creates file successfully', async () => {
      const testFile = path.join(TEST_PENDING_DIR, 'atomic-test.json');
      const testContent = JSON.stringify({ test: 'data' });
      
      const result = await atomicWrite(testFile, testContent);
      
      expect(result.success).toBe(true);
      
      const content = await fs.readFile(testFile, 'utf8');
      expect(content).toBe(testContent);
    });
    
    test('atomic write cleans up temp file on failure', async () => {
      const invalidPath = '/invalid/path/that/does/not/exist/file.json';
      const testContent = 'test content';
      
      const result = await atomicWrite(invalidPath, testContent);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('WRITE_FAILED');
      
      // Verify temp file doesn't exist
      const tempPath = `${invalidPath}.tmp`;
      await expect(fs.access(tempPath)).rejects.toThrow();
    });
    
    test('concurrent atomic writes do not corrupt data', async () => {
      const testFile = path.join(TEST_PENDING_DIR, 'concurrent-test.json');
      
      // Start multiple concurrent writes
      const writes = Array.from({ length: 10 }, (_, i) => 
        atomicWrite(testFile, JSON.stringify({ id: i, data: `content-${i}` }))
      );
      
      const results = await Promise.all(writes);
      
      // All writes should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      
      // Final file should contain valid JSON
      const finalContent = await fs.readFile(testFile, 'utf8');
      const parsedContent = JSON.parse(finalContent);
      
      expect(parsedContent).toHaveProperty('id');
      expect(parsedContent).toHaveProperty('data');
    });
  });

  describe('Token Lifecycle Management', () => {
    
    test('creates pending token successfully', async () => {
      const result = await createPendingToken(TEST_EMAIL);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(32);
      expect(/^[a-f0-9]{32}$/.test(result.data!)).toBe(true);
      
      // Verify token file was created
      const tokenFile = path.join(TEST_PENDING_DIR, `${result.data}.json`);
      const fileContent = await fs.readFile(tokenFile, 'utf8');
      const tokenData = JSON.parse(fileContent);
      
      expect(tokenData.email).toBe(TEST_EMAIL);
      expect(tokenData.token).toBe(result.data);
      expect(new Date(tokenData.created)).toBeInstanceOf(Date);
    });
    
    test('prevents duplicate pending tokens for same email', async () => {
      // Create first token
      const result1 = await createPendingToken(TEST_EMAIL);
      expect(result1.success).toBe(true);
      
      // Attempt to create second token for same email
      const result2 = await createPendingToken(TEST_EMAIL);
      expect(result2.success).toBe(false);
      expect(result2.code).toBe('ALREADY_PENDING');
    });
    
    test('validates token correctly', async () => {
      // Create a token first
      const createResult = await createPendingToken(TEST_EMAIL);
      const token = createResult.data!;
      
      // Validate the token
      const validateResult = await validateToken(token);
      
      expect(validateResult.success).toBe(true);
      expect(validateResult.data!.email).toBe(TEST_EMAIL);
      expect(validateResult.data!.token).toBe(token);
    });
    
    test('rejects invalid token formats', async () => {
      const invalidTokens = [
        '', // Empty
        'short', // Too short
        '12345678901234567890123456789012g', // Invalid character
        '1234567890123456789012345678901234567890', // Too long
        'ABCDEF1234567890123456789012345678' // Uppercase
      ];
      
      for (const token of invalidTokens) {
        const result = await validateToken(token);
        expect(result.success).toBe(false);
        expect(result.code).toBe('TOKEN_INVALID');
      }
    });
    
    test('rejects non-existent tokens', async () => {
      const fakeToken = 'abcdef1234567890123456789012345678'.substring(0, 32);
      
      const result = await validateToken(fakeToken);
      
      expect(result.success).toBe(false);
      expect(result.code).toBe('TOKEN_NOT_FOUND');
    });
  });

  describe('Token Expiration Security', () => {
    
    test('validates unexpired tokens', async () => {
      const createResult = await createPendingToken(TEST_EMAIL);
      const token = createResult.data!;
      
      const validateResult = await validateToken(token);
      
      expect(validateResult.success).toBe(true);
    });
    
    test('rejects expired tokens and cleans them up', async () => {
      // Create token with manipulated timestamp (expired)
      const expiredTimestamp = new Date(Date.now() - 48 * 60 * 60 * 1000 - 1000).toISOString();
      const token = generateSecureToken(TEST_EMAIL);
      
      const tokenData = {
        email: TEST_EMAIL,
        created: expiredTimestamp,
        token
      };
      
      const tokenFile = path.join(TEST_PENDING_DIR, `${token}.json`);
      await fs.writeFile(tokenFile, JSON.stringify(tokenData));
      
      // Validate expired token
      const validateResult = await validateToken(token);
      
      expect(validateResult.success).toBe(false);
      expect(validateResult.code).toBe('TOKEN_EXPIRED');
      
      // Verify token file was cleaned up
      await expect(fs.access(tokenFile)).rejects.toThrow();
    });
    
    test('cleanup removes only expired tokens', async () => {
      // Create valid token
      const validResult = await createPendingToken('valid@example.com');
      const validToken = validResult.data!;
      
      // Create expired token
      const expiredToken = generateSecureToken('expired@example.com');
      const expiredData = {
        email: 'expired@example.com',
        created: new Date(Date.now() - 48 * 60 * 60 * 1000 - 1000).toISOString(),
        token: expiredToken
      };
      const expiredFile = path.join(TEST_PENDING_DIR, `${expiredToken}.json`);
      await fs.writeFile(expiredFile, JSON.stringify(expiredData));
      
      // Run cleanup
      const cleanupResult = await cleanupExpiredTokens();
      
      expect(cleanupResult.success).toBe(true);
      expect(cleanupResult.data).toBe(1); // One token cleaned up
      
      // Verify valid token still exists
      const validFile = path.join(TEST_PENDING_DIR, `${validToken}.json`);
      await expect(fs.access(validFile)).resolves.not.toThrow();
      
      // Verify expired token was removed
      await expect(fs.access(expiredFile)).rejects.toThrow();
    });
  });

  describe('Subscription Confirmation Security', () => {
    
    test('confirms subscription successfully', async () => {
      // Create pending token
      const createResult = await createPendingToken(TEST_EMAIL);
      const token = createResult.data!;
      
      // Confirm subscription
      const confirmResult = await confirmSubscription(token);
      
      expect(confirmResult.success).toBe(true);
      expect(confirmResult.data).toBe('Subscription confirmed');
      
      // Verify token was cleaned up
      const tokenFile = path.join(TEST_PENDING_DIR, `${token}.json`);
      await expect(fs.access(tokenFile)).rejects.toThrow();
      
      // Verify subscriber was added
      const subscribersContent = await fs.readFile(TEST_SUBSCRIBERS_FILE, 'utf8');
      expect(subscribersContent).toContain(TEST_EMAIL);
    });
    
    test('handles idempotent confirmation (already subscribed)', async () => {
      // Create and confirm first subscription
      const createResult = await createPendingToken(TEST_EMAIL);
      const token = createResult.data!;
      await confirmSubscription(token);
      
      // Create second token for same email
      const createResult2 = await createPendingToken(TEST_EMAIL);
      expect(createResult2.success).toBe(false); // Should be prevented
      
      // Try confirming with original token again (should be cleaned up)
      const confirmResult2 = await confirmSubscription(token);
      expect(confirmResult2.success).toBe(false);
      expect(confirmResult2.code).toBe('TOKEN_NOT_FOUND');
    });
    
    test('prevents token replay attacks', async () => {
      // Create and confirm subscription
      const createResult = await createPendingToken(TEST_EMAIL);
      const token = createResult.data!;
      
      const confirmResult1 = await confirmSubscription(token);
      expect(confirmResult1.success).toBe(true);
      
      // Try to use same token again (replay attack)
      const confirmResult2 = await confirmSubscription(token);
      expect(confirmResult2.success).toBe(false);
      expect(confirmResult2.code).toBe('TOKEN_NOT_FOUND');
    });
  });

  describe('Error Handling and Information Disclosure', () => {
    
    test('secure logging never exposes email addresses', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      secureLog('test_operation', TEST_EMAIL, { someData: 'value' });
      
      // Verify console.log was called but email is not in the output
      expect(consoleSpy).toHaveBeenCalled();
      const logCall = consoleSpy.mock.calls[0][0];
      expect(logCall).not.toContain(TEST_EMAIL);
      expect(logCall).toContain('emailHash');
      expect(logCall).toContain('test_operation');
      
      consoleSpy.mockRestore();
    });
    
    test('error responses do not leak sensitive information', async () => {
      // Test with invalid token
      const result = await validateToken('invalid-token-format');
      
      expect(result.success).toBe(false);
      expect(result.error).not.toContain('file');
      expect(result.error).not.toContain('path');
      expect(result.error).not.toContain('ENOENT');
      expect(result.error).toBe('Invalid token format');
    });
    
    test('file system errors do not expose internal paths', async () => {
      // Mock fs.readFile to throw an error
      const originalReadFile = fs.readFile;
      fs.readFile = jest.fn().mockRejectedValue(new Error('EACCES: permission denied, open \'/secret/path/file.json\''));
      
      const result = await validateToken('abcdef1234567890123456789012345678'.substring(0, 32));
      
      expect(result.success).toBe(false);
      expect(result.error).not.toContain('/secret/path');
      expect(result.error).not.toContain('EACCES');
      
      // Restore original function
      fs.readFile = originalReadFile;
    });
  });

  describe('Race Condition Protection', () => {
    
    test('concurrent token creation for same email is handled safely', async () => {
      // Start multiple concurrent token creation attempts
      const promises = Array.from({ length: 5 }, () => createPendingToken(TEST_EMAIL));
      
      const results = await Promise.all(promises);
      
      // Only one should succeed, others should fail with ALREADY_PENDING
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      expect(successful).toHaveLength(1);
      expect(failed).toHaveLength(4);
      
      failed.forEach(result => {
        expect(result.code).toBe('ALREADY_PENDING');
      });
    });
    
    test('concurrent confirmation attempts are handled safely', async () => {
      // Create token
      const createResult = await createPendingToken(TEST_EMAIL);
      const token = createResult.data!;
      
      // Start multiple concurrent confirmation attempts
      const promises = Array.from({ length: 3 }, () => confirmSubscription(token));
      
      const results = await Promise.all(promises);
      
      // First one should succeed, others should fail
      const successful = results.filter(r => r.success);
      expect(successful).toHaveLength(1);
      
      // Check subscribers file has only one entry
      const subscribersContent = await fs.readFile(TEST_SUBSCRIBERS_FILE, 'utf8');
      const lines = subscribersContent.split('\n').filter(line => line.includes(TEST_EMAIL));
      expect(lines).toHaveLength(1);
    });
  });

  describe('Input Validation and Injection Prevention', () => {
    
    test('handles malicious email inputs safely', async () => {
      const maliciousEmails = [
        'test@example.com; DROP TABLE users;--',
        'test@example.com\n\nBCC: evil@attacker.com',
        'test@example.com<script>alert("xss")</script>',
        'test@example.com\r\n\r\nThis is injection content',
        '../../../etc/passwd@example.com'
      ];
      
      for (const maliciousEmail of maliciousEmails) {
        const result = validateEmailFormat(maliciousEmail);
        expect(result.success).toBe(false);
      }
    });
    
    test('prevents path traversal in token handling', async () => {
      const maliciousTokens = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        'normal-token/../../../etc/passwd'
      ];
      
      for (const maliciousToken of maliciousTokens) {
        const result = await validateToken(maliciousToken);
        expect(result.success).toBe(false);
        expect(result.code).toBe('TOKEN_INVALID');
      }
    });
  });
});