#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * PRD Day3 Implementation - Standalone validation for CI/CD and pre-build checks
 * 
 * This script can be run independently to validate environment variables
 * without starting the Next.js application. Useful for:
 * - CI/CD pipeline validation
 * - Pre-deployment checks
 * - Development environment setup verification
 * 
 * Usage:
 *   node scripts/validate-env.js
 *   npm run validate:env
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const symbols = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  bullet: '•',
  arrow: '→',
};

/**
 * Load environment variables from .env files
 */
function loadEnvironmentFiles() {
  const envFiles = ['.env.local', '.env', '.env.example'];
  const envVars = {};

  // Load from process.env first
  Object.assign(envVars, process.env);

  // Try to load from .env files
  for (const file of envFiles) {
    const filePath = path.join(process.cwd(), file);
    
    if (fs.existsSync(filePath)) {
      console.log(`${colors.cyan}${symbols.info} Loading environment from: ${file}${colors.reset}`);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
              const value = valueParts.join('=').replace(/^["']|["']$/g, '');
              // Don't overwrite already set environment variables
              if (!envVars[key.trim()]) {
                envVars[key.trim()] = value;
              }
            }
          }
        }
      } catch (error) {
        console.warn(`${colors.yellow}${symbols.warning} Failed to load ${file}: ${error.message}${colors.reset}`);
      }
    }
  }

  return envVars;
}

/**
 * PRD Day3 Environment Variable Requirements
 */
const PRD_DAY3_REQUIREMENTS = {
  // Required variables
  required: {
    NODE_ENV: {
      description: 'Node.js environment',
      validator: (val) => ['development', 'production', 'test'].includes(val),
      example: 'development',
      errorMessage: 'Must be one of: development, production, test'
    },
    NEXT_PUBLIC_APP_URL: {
      description: 'Application base URL',
      validator: (val) => /^https?:\/\/.+/.test(val),
      example: 'http://localhost:3000',
      errorMessage: 'Must be a valid URL starting with http:// or https://'
    },
    NEXT_PUBLIC_APP_NAME: {
      description: 'Application name',
      validator: (val) => val.length > 0,
      example: 'Hollow Knight: Silksong',
      errorMessage: 'Cannot be empty'
    },
    SUPPORTED_LOCALES: {
      description: 'Comma-separated list of supported locale codes',
      validator: (val) => /^[a-z]{2}(,[a-z]{2})*$/.test(val),
      example: 'en,zh',
      errorMessage: 'Must be comma-separated ISO 639-1 language codes (e.g., "en,zh")'
    },
    DEFAULT_LOCALE: {
      description: 'Default locale code',
      validator: (val) => /^[a-z]{2}$/.test(val),
      example: 'en',
      errorMessage: 'Must be a 2-letter ISO 639-1 language code'
    },
    SILKSONG_RELEASE_ISO: {
      description: 'Silksong release date in ISO 8601 format',
      validator: (val) => !isNaN(Date.parse(val)) && val.includes('T') && val.endsWith('Z'),
      example: '2025-09-04T00:00:00Z',
      errorMessage: 'Must be a valid ISO 8601 datetime string'
    },
    OG_FONT_PRIMARY: {
      description: 'Primary font for OpenGraph images',
      validator: (val) => val.trim().length > 0,
      example: 'Inter',
      errorMessage: 'Cannot be empty'
    },
    EMAIL_TRANSPORT: {
      description: 'Email transport method',
      validator: (val) => ['mock', 'smtp', 'sendgrid', 'ses'].includes(val),
      example: 'mock',
      errorMessage: 'Must be one of: mock, smtp, sendgrid, ses'
    },
    SITE_HASH_SALT: {
      description: 'Salt for hashing operations (minimum 32 characters)',
      validator: (val) => val.length >= 32,
      example: 'your_random_32_character_salt_string_here_abcdef123456789',
      errorMessage: 'Must be at least 32 characters long'
    },
    LOG_STORAGE_MODE: {
      description: 'Log storage mode',
      validator: (val) => ['ephemeral', 'persistent', 'file'].includes(val),
      example: 'ephemeral',
      errorMessage: 'Must be one of: ephemeral, persistent, file'
    }
  },

  // Conditionally required variables
  conditional: {
    EMAIL_SENDER: {
      description: 'Email sender address (required when EMAIL_TRANSPORT is not "mock")',
      condition: (envVars) => envVars.EMAIL_TRANSPORT !== 'mock',
      validator: (val) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(val),
      example: 'noreply@site.com',
      errorMessage: 'Must be a valid email address'
    }
  },

  // Optional variables with defaults
  optional: {
    NEXT_PUBLIC_APP_VERSION: {
      description: 'Application version',
      default: '1.0.0',
      example: '1.0.0'
    },
    OG_FONT_FALLBACK: {
      description: 'Fallback font for OpenGraph images',
      example: 'Noto Sans'
    },
    FAIL_ON_OG_FONT_MISSING: {
      description: 'Whether to fail if OpenGraph font is missing',
      default: 'false',
      validator: (val) => ['true', 'false'].includes(val),
      example: 'false',
      errorMessage: 'Must be "true" or "false"'
    },
    ENABLE_LOGGING: {
      description: 'Whether to enable logging',
      default: 'true',
      validator: (val) => ['true', 'false'].includes(val),
      example: 'true',
      errorMessage: 'Must be "true" or "false"'
    },
    DEPLOY_ENV: {
      description: 'Deployment environment',
      default: 'local',
      validator: (val) => ['local', 'staging', 'production'].includes(val),
      example: 'local',
      errorMessage: 'Must be one of: local, staging, production'
    }
  }
};

/**
 * Validate a single environment variable
 */
function validateVariable(name, value, config, envVars) {
  const result = {
    name,
    value,
    valid: true,
    errors: [],
    warnings: []
  };

  // Check if variable exists
  if (value === undefined || value === null || value === '') {
    result.valid = false;
    result.errors.push(`Missing required variable: ${name}`);
    return result;
  }

  // Run validator if provided
  if (config.validator && !config.validator(value)) {
    result.valid = false;
    result.errors.push(config.errorMessage || `Invalid value for ${name}`);
  }

  return result;
}

/**
 * Validate conditional requirements
 */
function validateConditionalRequirements(envVars) {
  const results = [];

  for (const [name, config] of Object.entries(PRD_DAY3_REQUIREMENTS.conditional)) {
    if (config.condition && config.condition(envVars)) {
      const value = envVars[name];
      const result = validateVariable(name, value, config, envVars);
      results.push(result);
    }
  }

  return results;
}

/**
 * Validate cross-variable consistency
 */
function validateConsistency(envVars) {
  const results = [];

  // Validate DEFAULT_LOCALE is in SUPPORTED_LOCALES
  if (envVars.SUPPORTED_LOCALES && envVars.DEFAULT_LOCALE) {
    const supportedLocales = envVars.SUPPORTED_LOCALES.split(',').map(l => l.trim());
    if (!supportedLocales.includes(envVars.DEFAULT_LOCALE)) {
      results.push({
        name: 'DEFAULT_LOCALE',
        value: envVars.DEFAULT_LOCALE,
        valid: false,
        errors: [`DEFAULT_LOCALE "${envVars.DEFAULT_LOCALE}" must be included in SUPPORTED_LOCALES "${envVars.SUPPORTED_LOCALES}"`],
        warnings: []
      });
    }
  }

  // Validate Silksong release date
  if (envVars.SILKSONG_RELEASE_ISO) {
    const releaseDate = new Date(envVars.SILKSONG_RELEASE_ISO);
    const now = new Date();
    if (releaseDate <= now) {
      results.push({
        name: 'SILKSONG_RELEASE_ISO',
        value: envVars.SILKSONG_RELEASE_ISO,
        valid: true,
        errors: [],
        warnings: [`Release date (${envVars.SILKSONG_RELEASE_ISO}) is in the past. Consider updating for countdown functionality.`]
      });
    }
  }

  return results;
}

/**
 * Main validation function
 */
function validateEnvironment() {
  console.log(`${colors.bright}${colors.blue}🔧 PRD Day3 Environment Validation${colors.reset}\\n`);

  const envVars = loadEnvironmentFiles();
  const allResults = [];
  let hasErrors = false;
  let hasWarnings = false;

  // Validate required variables
  console.log(`${colors.bright}Checking Required Variables:${colors.reset}`);
  for (const [name, config] of Object.entries(PRD_DAY3_REQUIREMENTS.required)) {
    const value = envVars[name];
    const result = validateVariable(name, value, config, envVars);
    allResults.push(result);

    if (result.valid) {
      console.log(`  ${colors.green}${symbols.success} ${name}${colors.reset}`);
    } else {
      hasErrors = true;
      console.log(`  ${colors.red}${symbols.error} ${name}${colors.reset}`);
      result.errors.forEach(error => {
        console.log(`    ${colors.red}${symbols.arrow} ${error}${colors.reset}`);
        console.log(`    ${colors.cyan}${symbols.bullet} Example: ${config.example}${colors.reset}`);
      });
    }
  }

  // Validate conditional variables
  console.log(`\\n${colors.bright}Checking Conditional Variables:${colors.reset}`);
  const conditionalResults = validateConditionalRequirements(envVars);
  allResults.push(...conditionalResults);

  if (conditionalResults.length === 0) {
    console.log(`  ${colors.cyan}${symbols.info} No conditional requirements apply${colors.reset}`);
  } else {
    conditionalResults.forEach(result => {
      if (result.valid) {
        console.log(`  ${colors.green}${symbols.success} ${result.name}${colors.reset}`);
      } else {
        hasErrors = true;
        console.log(`  ${colors.red}${symbols.error} ${result.name}${colors.reset}`);
        result.errors.forEach(error => {
          console.log(`    ${colors.red}${symbols.arrow} ${error}${colors.reset}`);
        });
      }
    });
  }

  // Validate consistency
  console.log(`\\n${colors.bright}Checking Variable Consistency:${colors.reset}`);
  const consistencyResults = validateConsistency(envVars);
  allResults.push(...consistencyResults);

  if (consistencyResults.length === 0) {
    console.log(`  ${colors.green}${symbols.success} All variables are consistent${colors.reset}`);
  } else {
    consistencyResults.forEach(result => {
      if (result.errors.length > 0) {
        hasErrors = true;
        console.log(`  ${colors.red}${symbols.error} ${result.name}${colors.reset}`);
        result.errors.forEach(error => {
          console.log(`    ${colors.red}${symbols.arrow} ${error}${colors.reset}`);
        });
      }
      
      if (result.warnings.length > 0) {
        hasWarnings = true;
        console.log(`  ${colors.yellow}${symbols.warning} ${result.name}${colors.reset}`);
        result.warnings.forEach(warning => {
          console.log(`    ${colors.yellow}${symbols.arrow} ${warning}${colors.reset}`);
        });
      }
    });
  }

  // Check optional variables
  console.log(`\\n${colors.bright}Optional Variables (with defaults):${colors.reset}`);
  for (const [name, config] of Object.entries(PRD_DAY3_REQUIREMENTS.optional)) {
    const value = envVars[name];
    
    if (value) {
      if (config.validator && !config.validator(value)) {
        hasWarnings = true;
        console.log(`  ${colors.yellow}${symbols.warning} ${name}: Invalid value "${value}"${colors.reset}`);
        console.log(`    ${colors.yellow}${symbols.arrow} ${config.errorMessage}${colors.reset}`);
      } else {
        console.log(`  ${colors.green}${symbols.success} ${name}: "${value}"${colors.reset}`);
      }
    } else {
      const defaultValue = config.default || 'undefined';
      console.log(`  ${colors.cyan}${symbols.info} ${name}: Using default "${defaultValue}"${colors.reset}`);
    }
  }

  // Summary
  console.log(`\\n${colors.bright}Validation Summary:${colors.reset}`);
  
  const totalVariables = Object.keys(PRD_DAY3_REQUIREMENTS.required).length + conditionalResults.length;
  const validVariables = allResults.filter(r => r.valid).length;
  const errorCount = allResults.reduce((count, r) => count + r.errors.length, 0);
  const warningCount = allResults.reduce((count, r) => count + r.warnings.length, 0);

  console.log(`  ${colors.cyan}${symbols.info} Total Variables Checked: ${totalVariables}${colors.reset}`);
  console.log(`  ${colors.green}${symbols.success} Valid: ${validVariables}${colors.reset}`);
  
  if (errorCount > 0) {
    console.log(`  ${colors.red}${symbols.error} Errors: ${errorCount}${colors.reset}`);
  }
  
  if (warningCount > 0) {
    console.log(`  ${colors.yellow}${symbols.warning} Warnings: ${warningCount}${colors.reset}`);
  }

  // Final result
  if (hasErrors) {
    console.log(`\\n${colors.red}${colors.bright}${symbols.error} Environment validation FAILED${colors.reset}`);
    console.log(`${colors.red}Please fix the errors above before proceeding.${colors.reset}`);
    console.log(`${colors.cyan}${symbols.info} Refer to .env.example for correct variable formats${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`\\n${colors.green}${colors.bright}${symbols.success} Environment validation PASSED${colors.reset}`);
    if (hasWarnings) {
      console.log(`${colors.yellow}Consider addressing the warnings above for optimal configuration.${colors.reset}`);
    }
    console.log(`${colors.cyan}${symbols.info} All PRD Day3 requirements are satisfied${colors.reset}`);
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  try {
    validateEnvironment();
  } catch (error) {
    console.error(`${colors.red}${symbols.error} Validation failed with error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

module.exports = {
  validateEnvironment,
  PRD_DAY3_REQUIREMENTS,
  loadEnvironmentFiles
};