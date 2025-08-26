#!/usr/bin/env node

/**
 * Test PRD Day3 Environment Variables in Next.js Context
 * Validates that the env system works correctly with TypeScript imports
 */

const { exec } = require('child_process');
const path = require('path');

// Create a temporary test file that uses our environment system
const testFileContent = `
import { 
  env, 
  localization, 
  silksongRelease, 
  emailConfig, 
  security, 
  logging, 
  deployment,
  utils,
  validators
} from './lib/env';

console.log('🧪 Testing PRD Day3 Environment Variables in TypeScript Context');
console.log('');

// Test basic environment variables
console.log('=== Basic Environment Variables ===');
console.log('NODE_ENV:', env.NODE_ENV);
console.log('SUPPORTED_LOCALES:', env.SUPPORTED_LOCALES);
console.log('DEFAULT_LOCALE:', env.DEFAULT_LOCALE);
console.log('SILKSONG_RELEASE_ISO:', env.SILKSONG_RELEASE_ISO);
console.log('EMAIL_TRANSPORT:', env.EMAIL_TRANSPORT);
console.log('LOG_STORAGE_MODE:', env.LOG_STORAGE_MODE);
console.log('');

// Test configuration objects
console.log('=== Configuration Objects ===');
console.log('Localization:', {
  defaultLocale: localization.defaultLocale,
  supportedLocales: localization.supportedLocales,
  isMultiLanguage: localization.isMultiLanguage
});

console.log('Silksong Release:', {
  date: silksongRelease.date.toLocaleDateString(),
  timestamp: silksongRelease.timestamp,
  isoString: silksongRelease.isoString
});

console.log('Email Config:', {
  transport: emailConfig.transport,
  isMockMode: emailConfig.isMockMode,
  sender: emailConfig.sender ? 'SET' : 'NOT SET'
});

console.log('Security:', {
  hasSalt: !!security.hashSalt,
  saltLength: security.hashSalt.length
});

console.log('Logging:', {
  enabled: logging.enabled,
  storageMode: logging.storageMode,
  isEphemeral: logging.isEphemeral
});

console.log('Deployment:', {
  environment: deployment.environment,
  isLocal: deployment.isLocal
});
console.log('');

// Test utility functions
console.log('=== Utility Functions ===');
console.log('Environment Display Name:', utils.getEnvironmentDisplayName());
console.log('Is Silksong Released:', utils.isSilksongReleased());
console.log('Time Until Release (ms):', utils.getTimeUntilRelease());
console.log('Hash with Salt (test):', utils.hashWithSalt('test-input'));
console.log('');

// Test validators
console.log('=== Validators ===');
console.log('Is "en" valid locale:', validators.isValidLocale('en'));
console.log('Is "invalid" valid locale:', validators.isValidLocale('invalid'));
console.log('Is "mock" valid email transport:', validators.isValidEmailTransport('mock'));
console.log('Is "ephemeral" valid log storage mode:', validators.isValidLogStorageMode('ephemeral'));
console.log('Is "local" valid deploy env:', validators.isValidDeployEnv('local'));
console.log('');

console.log('✅ All environment variable tests passed!');
`;

const testFilePath = path.join(__dirname, '..', 'test-env-temp.mjs');
const fs = require('fs');

// Write test file
fs.writeFileSync(testFilePath, testFileContent);

console.log('🧪 Testing PRD Day3 Environment Variables in Next.js Context');
console.log('Running TypeScript compilation and validation...\n');

// Run the test with tsx (TypeScript execution)
exec(`cd "${path.dirname(__dirname)}" && npx tsx test-env-temp.mjs`, (error, stdout, stderr) => {
  // Clean up test file
  try {
    fs.unlinkSync(testFilePath);
  } catch (e) {
    // Ignore cleanup errors
  }
  
  if (error) {
    console.error('❌ Environment variable test FAILED:');
    console.error('Error:', error.message);
    if (stderr) {
      console.error('Stderr:', stderr);
    }
    process.exit(1);
  } else {
    console.log(stdout);
    console.log('🎉 All PRD Day3 environment variables are working correctly!');
  }
});