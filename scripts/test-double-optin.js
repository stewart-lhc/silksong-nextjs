#!/usr/bin/env node
/**
 * Simple Manual Test Script for Double Opt-in Security System
 * 
 * This script tests the core functionality without Jest setup complexity
 */

const fs = require('fs/promises');
const path = require('path');

// Set environment variables for testing
process.env.SITE_HASH_SALT = 'test-salt-for-manual-testing-change-in-production';
process.env.NODE_ENV = 'test';
process.env.EMAIL_TRANSPORT = 'mock';

// Import the modules we want to test
const {
  generateSecureToken,
  normalizeEmail,
  validateEmailFormat,
  createPendingToken,
  validateToken,
  confirmSubscription,
  cleanupExpiredTokens
} = require('../lib/double-optin-security.ts');

const { sendConfirmationEmail } = require('../lib/email-transport.ts');

async function runTests() {
  console.log('🔐 Double Opt-in Security System Manual Test\n');

  // Test 1: Token Generation
  console.log('1. Testing Token Generation:');
  const testEmail = 'test@example.com';
  const token1 = generateSecureToken(testEmail);
  
  await new Promise(resolve => setTimeout(resolve, 2)); // Small delay
  const token2 = generateSecureToken(testEmail);
  
  console.log(`   ✓ Token 1: ${token1}`);
  console.log(`   ✓ Token 2: ${token2}`);
  console.log(`   ✓ Tokens are different: ${token1 !== token2}`);
  console.log(`   ✓ Token length: ${token1.length} chars`);
  console.log(`   ✓ Token format: ${/^[a-f0-9]{32}$/.test(token1) ? 'Valid' : 'Invalid'}`);
  console.log('');

  // Test 2: Email Validation
  console.log('2. Testing Email Validation:');
  const validEmails = ['test@example.com', 'User.Name@Example.COM', '  test@example.com  '];
  const invalidEmails = ['invalid', '', '@example.com', 'test@'];

  validEmails.forEach(email => {
    const result = validateEmailFormat(email);
    console.log(`   ✓ "${email}" -> ${result.success ? 'Valid' : 'Invalid'} (${result.data || result.code})`);
  });

  invalidEmails.forEach(email => {
    const result = validateEmailFormat(email);
    console.log(`   ✗ "${email}" -> ${result.success ? 'Valid' : 'Invalid'} (${result.code})`);
  });
  console.log('');

  // Test 3: Pending Token Creation
  console.log('3. Testing Pending Token Creation:');
  try {
    const result = await createPendingToken(testEmail);
    if (result.success) {
      console.log(`   ✓ Token created: ${result.data}`);
      
      // Test duplicate prevention
      const duplicateResult = await createPendingToken(testEmail);
      console.log(`   ✓ Duplicate prevention: ${!duplicateResult.success ? 'Working' : 'Failed'} (${duplicateResult.code})`);
      
      // Test token validation
      const validation = await validateToken(result.data);
      console.log(`   ✓ Token validation: ${validation.success ? 'Valid' : 'Invalid'}`);
      
      if (validation.success) {
        console.log(`   ✓ Email in token: ${validation.data.email}`);
        console.log(`   ✓ Created timestamp: ${validation.data.created}`);
      }
    } else {
      console.log(`   ✗ Token creation failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`   ✗ Error: ${error.message}`);
  }
  console.log('');

  // Test 4: Email Transport
  console.log('4. Testing Email Transport (Mock Mode):');
  try {
    const emailResult = await sendConfirmationEmail(testEmail, 'mock-token-for-testing');
    console.log(`   ✓ Email transport: ${emailResult.success ? 'Success' : 'Failed'}`);
    if (emailResult.success) {
      console.log(`   ✓ Message ID: ${emailResult.messageId}`);
    }
  } catch (error) {
    console.log(`   ✗ Email transport error: ${error.message}`);
  }
  console.log('');

  // Test 5: Token Expiration
  console.log('5. Testing Token Expiration:');
  const invalidToken = 'abcdef1234567890123456789012345678'.substring(0, 32);
  const expiredValidation = await validateToken(invalidToken);
  console.log(`   ✓ Non-existent token rejection: ${!expiredValidation.success ? 'Working' : 'Failed'} (${expiredValidation.code})`);
  console.log('');

  // Test 6: Security Features
  console.log('6. Testing Security Features:');
  const maliciousInputs = [
    '../../../etc/passwd',
    '<script>alert("xss")</script>',
    'DROP TABLE users;--'
  ];

  maliciousInputs.forEach(input => {
    const result = validateEmailFormat(input);
    console.log(`   ✓ Malicious input "${input}" -> ${!result.success ? 'Blocked' : 'SECURITY ISSUE!'}`);
  });

  console.log('');
  console.log('🎉 Manual Tests Complete!\n');
  
  // Clean up test files
  try {
    const pendingDir = path.join(process.cwd(), 'data', 'pending');
    const files = await fs.readdir(pendingDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        await fs.unlink(path.join(pendingDir, file));
      }
    }
    console.log('✓ Cleaned up test files');
  } catch (error) {
    console.log('ℹ️  No test files to clean up');
  }
}

// Handle TypeScript imports in Node.js
async function setupTSNode() {
  try {
    const tsNode = require('ts-node');
    tsNode.register({
      transpileOnly: true,
      compilerOptions: {
        module: 'commonjs',
        target: 'es2020'
      }
    });
  } catch (error) {
    console.error('Please install ts-node to run this test: npm install -D ts-node');
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  setupTSNode().then(() => runTests()).catch(console.error);
}

module.exports = { runTests };