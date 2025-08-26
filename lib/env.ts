/**
 * Environment Variables Validation and Type-Safe Access
 * PRD Day3 Implementation with strict validation and type safety
 * 
 * This module provides comprehensive environment variable validation with:
 * - Strict type checking using Zod schemas
 * - Conditional validation logic for complex requirements
 * - Build-time validation to prevent runtime errors
 * - Enhanced error reporting with specific guidance
 * - Type-safe access throughout the application
 */

import { z } from 'zod';

// Define types locally to avoid import conflicts
type SupportedLocale = 'en' | 'zh';
type EmailTransport = 'mock' | 'smtp' | 'sendgrid' | 'ses';
type LogStorageMode = 'ephemeral' | 'persistent' | 'file';
type DeployEnv = 'local' | 'staging' | 'production';
type NodeEnv = 'development' | 'production' | 'test';

// Environment validation result types
interface EnvValidationError {
  variable: string;
  message: string;
  path: string[];
  received?: unknown;
  expected?: string;
}

interface EnvValidationResult {
  success: boolean;
  errors: EnvValidationError[];
  warnings: string[];
}

// Custom validators for specific patterns
const localeValidator = z.string().refine(
  (val) => /^[a-z]{2}(,[a-z]{2})*$/.test(val),
  { message: 'SUPPORTED_LOCALES must be comma-separated ISO 639-1 codes (e.g., "en,zh")' }
);

const isoDateValidator = z.string().refine(
  (val) => !isNaN(Date.parse(val)) && val.includes('T') && val.endsWith('Z'),
  { message: 'Must be a valid ISO 8601 datetime string (e.g., "2025-09-04T00:00:00Z")' }
);

const hashSaltValidator = z.string().min(32, 'SITE_HASH_SALT must be at least 32 characters');

const emailTransportValidator = z.enum(['mock', 'smtp', 'sendgrid', 'ses'], {
  errorMap: () => ({ message: 'EMAIL_TRANSPORT must be one of: mock, smtp, sendgrid, ses' })
});

const logStorageModeValidator = z.enum(['ephemeral', 'persistent', 'file'], {
  errorMap: () => ({ message: 'LOG_STORAGE_MODE must be one of: ephemeral, persistent, file' })
});

// Define the schema for environment variables with strict validation
const envSchema = z.object({
  // Node.js Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // === PRD Day3 Required Environment Variables ===
  
  // Internationalization (Required)
  SUPPORTED_LOCALES: localeValidator,
  DEFAULT_LOCALE: z.string().refine(
    (val) => /^[a-z]{2}$/.test(val),
    { message: 'DEFAULT_LOCALE must be a valid ISO 639-1 code (e.g., "en")' }
  ),
  
  // Silksong Release Configuration (Required)
  SILKSONG_RELEASE_ISO: isoDateValidator,
  
  // OpenGraph Font Configuration (Required)
  OG_FONT_PRIMARY: z.string().min(1, 'OG_FONT_PRIMARY is required'),
  OG_FONT_FALLBACK: z.string().optional(),
  FAIL_ON_OG_FONT_MISSING: z.enum(['true', 'false']).optional().default('false'),
  
  // Email Configuration (EMAIL_SENDER required if EMAIL_TRANSPORT is not 'mock')
  EMAIL_SENDER: z.string().email().optional(),
  EMAIL_TRANSPORT: emailTransportValidator,
  
  // Security (Required)
  SITE_HASH_SALT: hashSaltValidator,
  
  // Logging Configuration (Required)
  LOG_STORAGE_MODE: logStorageModeValidator,
  ENABLE_LOGGING: z.enum(['true', 'false']).optional().default('true'),
  
  // Deployment Configuration (Optional)
  DEPLOY_ENV: z.enum(['local', 'staging', 'production']).optional().default('local'),
  
  // === Legacy Application Configuration (Required) ===
  
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid APP_URL format'),
  NEXT_PUBLIC_APP_NAME: z.string().min(1, 'APP_NAME is required'),
  NEXT_PUBLIC_APP_VERSION: z.string().optional().default('1.0.0'),
  
  // Supabase Configuration (Required for database functionality)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL format'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  
  // SEO Configuration (Required for proper SEO)
  NEXT_PUBLIC_SITE_DESCRIPTION: z.string().min(50, 'Site description should be at least 50 characters'),
  NEXT_PUBLIC_KEYWORDS: z.string().min(1, 'Keywords are required for SEO'),
  NEXT_PUBLIC_CANONICAL_URL: z.string().url().optional(),
  
  // === Optional Configuration ===
  
  // Analytics (Optional)
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_GTM_ID: z.string().optional(),
  VERCEL_ANALYTICS_ID: z.string().optional(),
  ENABLE_ANALYTICS: z.enum(['true', 'false']).optional().default('false'),
  
  // Authentication (Optional)
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret should be at least 32 characters').optional(),
  NEXTAUTH_URL_INTERNAL: z.string().url().optional(),
  
  // External APIs (Optional)
  CMS_API_URL: z.string().url().optional(),
  CMS_API_TOKEN: z.string().optional(),
  STEAM_API_KEY: z.string().optional(),
  IGDB_CLIENT_ID: z.string().optional(),
  IGDB_CLIENT_SECRET: z.string().optional(),
  
  // Legacy Email Configuration (Optional)
  EMAIL_FROM: z.string().email().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().regex(/^\d+$/, 'SMTP_PORT must be a number').optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  
  // Social Media (Optional)
  NEXT_PUBLIC_TWITTER_URL: z.string().url().optional(),
  NEXT_PUBLIC_DISCORD_URL: z.string().url().optional(),
  NEXT_PUBLIC_REDDIT_URL: z.string().url().optional(),
  NEXT_PUBLIC_STEAM_URL: z.string().url().optional(),
  NEXT_PUBLIC_YOUTUBE_URL: z.string().url().optional(),
  
  // CDN and Media (Optional)
  NEXT_PUBLIC_CDN_URL: z.string().url().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Feature Flags (Optional with defaults)
  ENABLE_PWA: z.enum(['true', 'false']).optional().default('true'),
  ENABLE_OFFLINE_MODE: z.enum(['true', 'false']).optional().default('false'),
  ENABLE_DARK_MODE: z.enum(['true', 'false']).optional().default('true'),
  ENABLE_MUSIC_PLAYER: z.enum(['true', 'false']).optional().default('true'),
  ENABLE_COMMENTS: z.enum(['true', 'false']).optional().default('false'),
  ENABLE_USER_ACCOUNTS: z.enum(['true', 'false']).optional().default('false'),
  
  // Development Settings (Optional)
  DEBUG_API_CALLS: z.enum(['true', 'false']).optional().default('false'),
  DEBUG_PERFORMANCE: z.enum(['true', 'false']).optional().default('false'),
  DEBUG_SEO: z.enum(['true', 'false']).optional().default('false'),
  
  // Security (Optional)
  CSRF_SECRET: z.string().min(32).optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).optional().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).optional().default('100'),
  
  // Monitoring (Optional)
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  UPTIME_ROBOT_API_KEY: z.string().optional(),
  
  // Performance (Optional)
  ENABLE_BUNDLE_ANALYZER: z.enum(['true', 'false']).optional().default('false'),
  ENABLE_COMPRESSION: z.enum(['true', 'false']).optional().default('true'),
  ENABLE_IMAGE_OPTIMIZATION: z.enum(['true', 'false']).optional().default('true'),
  CACHE_MAX_AGE: z.string().regex(/^\d+$/).optional().default('3600'),
  STATIC_CACHE_MAX_AGE: z.string().regex(/^\d+$/).optional().default('31536000'),
  
  // External Service Endpoints (Optional)
  NEWS_API_ENDPOINT: z.string().url().optional(),
  COMMUNITY_API_ENDPOINT: z.string().url().optional(),
  GAME_DATA_API_ENDPOINT: z.string().url().optional(),
});

// Type definitions for environment variables
export type Env = z.infer<typeof envSchema>;

// Export types for external use
export type { SupportedLocale, EmailTransport, LogStorageMode, DeployEnv, NodeEnv };

/**
 * Enhanced environment validation with comprehensive error reporting
 * This function validates all environment variables and provides detailed feedback
 */
function validateEnv(): Env {
  const startTime = Date.now();
  const validationResult: EnvValidationResult = {
    success: true,
    errors: [],
    warnings: []
  };

  try {
    // First, validate the schema
    const parsed = envSchema.parse(process.env);
    
    // PRD Day3 Conditional Validation Rules
    const prdValidation = validatePrdDay3Requirements(parsed);
    validationResult.errors = validationResult.errors.concat(prdValidation.errors);
    validationResult.warnings = validationResult.warnings.concat(prdValidation.warnings);
    
    // Environment-specific validations
    if (parsed.NODE_ENV === 'production') {
      const productionValidation = validateProductionRequirements(parsed);
      validationResult.errors = validationResult.errors.concat(productionValidation.errors);
      validationResult.warnings = validationResult.warnings.concat(productionValidation.warnings);
    }
    
    // Security validations
    const securityValidation = validateSecurityRequirements(parsed);
    validationResult.warnings = validationResult.warnings.concat(securityValidation.warnings);
    
    // Performance validations in development
    if (parsed.NODE_ENV === 'development') {
      const devValidation = validateDevelopmentConfiguration(parsed);
      validationResult.warnings = validationResult.warnings.concat(devValidation.warnings);
    }
    
    // If there are errors, fail the validation
    if (validationResult.errors.length > 0) {
      validationResult.success = false;
      throw new ValidationError(validationResult);
    }
    
    // Log validation summary
    const validationTime = Date.now() - startTime;
    if (parsed.NODE_ENV === 'development') {
      console.log(`✅ Environment validation completed in ${validationTime}ms`);
      if (validationResult.warnings.length > 0) {
        console.warn(`⚠️  ${validationResult.warnings.length} warnings found:`);
        validationResult.warnings.forEach(warning => console.warn(`   - ${warning}`));
      }
    }
    
    return parsed;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors.map(err => ({
        variable: err.path.join('.') || 'unknown',
        message: err.message,
        path: err.path.map(String),
        received: (err as any).input || err.message,
        expected: err.code || 'valid value'
      }));
      
      const result: EnvValidationResult = {
        success: false,
        errors: formattedErrors,
        warnings: validationResult.warnings
      };
      
      throw new ValidationError(result);
    }
    
    // Unexpected error
    throw new Error(
      `❌ Unexpected error during environment validation: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Custom validation error class with enhanced error reporting
 */
class ValidationError extends Error {
  constructor(public readonly result: EnvValidationResult) {
    const errorCount = result.errors.length;
    const warningCount = result.warnings.length;
    
    const errorSection = result.errors.length > 0 
      ? `\n\n🚨 ERRORS (${errorCount}):\n${result.errors.map(err => 
          `   ${err.variable}: ${err.message}${err.received ? ` (received: ${err.received})` : ''}`
        ).join('\n')}`
      : '';
    
    const warningSection = result.warnings.length > 0
      ? `\n\n⚠️  WARNINGS (${warningCount}):\n${result.warnings.map(warning => `   ${warning}`).join('\n')}`
      : '';
    
    const helpSection = `\n\n📚 HELP:\n` +
      `   • Check your .env.local file\n` +
      `   • Refer to .env.example for all required variables\n` +
      `   • Ensure all required PRD Day3 variables are set\n` +
      `   • Validate conditional requirements (e.g., EMAIL_SENDER when EMAIL_TRANSPORT !== 'mock')`;
    
    super(
      `❌ Environment Validation Failed${errorSection}${warningSection}${helpSection}`
    );
    
    this.name = 'ValidationError';
  }
}

/**
 * PRD Day3 specific validation rules with comprehensive error tracking
 */
function validatePrdDay3Requirements(parsed: Env): EnvValidationResult {
  const errors = [];
  const warnings = [];
  
  // Validate DEFAULT_LOCALE is included in SUPPORTED_LOCALES
  const supportedLocales = parsed.SUPPORTED_LOCALES.split(',').map(l => l.trim());
  if (!supportedLocales.includes(parsed.DEFAULT_LOCALE)) {
    errors.push({
      variable: 'DEFAULT_LOCALE',
      message: `Must be included in SUPPORTED_LOCALES. Got "${parsed.DEFAULT_LOCALE}" but supported: [${supportedLocales.join(', ')}]`,
      path: ['DEFAULT_LOCALE'],
      received: parsed.DEFAULT_LOCALE,
      expected: `One of: ${supportedLocales.join(', ')}`
    });
  }
  
  // Validate SUPPORTED_LOCALES format and content
  const localePattern = /^[a-z]{2}(,[a-z]{2})*$/;
  if (!localePattern.test(parsed.SUPPORTED_LOCALES)) {
    errors.push({
      variable: 'SUPPORTED_LOCALES',
      message: 'Must be comma-separated ISO 639-1 language codes (e.g., "en,zh")',
      path: ['SUPPORTED_LOCALES'],
      received: parsed.SUPPORTED_LOCALES,
      expected: 'Format: "en,zh" (comma-separated 2-letter codes)'
    });
  }
  
  // Validate EMAIL_SENDER is required when EMAIL_TRANSPORT is not 'mock'
  if (parsed.EMAIL_TRANSPORT !== 'mock' && !parsed.EMAIL_SENDER) {
    errors.push({
      variable: 'EMAIL_SENDER',
      message: `Required when EMAIL_TRANSPORT is "${parsed.EMAIL_TRANSPORT}" (not "mock")`,
      path: ['EMAIL_SENDER'],
      expected: 'Valid email address'
    });
  }
  
  // Validate EMAIL_SENDER format if provided
  if (parsed.EMAIL_SENDER && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.EMAIL_SENDER)) {
    errors.push({
      variable: 'EMAIL_SENDER',
      message: 'Must be a valid email address',
      path: ['EMAIL_SENDER'],
      received: parsed.EMAIL_SENDER,
      expected: 'Valid email format (e.g., noreply@example.com)'
    });
  }
  
  // Validate SILKSONG_RELEASE_ISO format and value
  const releaseDate = new Date(parsed.SILKSONG_RELEASE_ISO);
  if (isNaN(releaseDate.getTime())) {
    errors.push({
      variable: 'SILKSONG_RELEASE_ISO',
      message: 'Must be a valid ISO 8601 datetime string',
      path: ['SILKSONG_RELEASE_ISO'],
      received: parsed.SILKSONG_RELEASE_ISO,
      expected: 'Format: "2025-09-04T00:00:00Z"'
    });
  } else {
    const now = new Date();
    if (releaseDate <= now) {
      warnings.push(
        `SILKSONG_RELEASE_ISO (${parsed.SILKSONG_RELEASE_ISO}) is in the past. ` +
        `Consider updating to a future date for countdown functionality.`
      );
    }
  }
  
  // Validate SITE_HASH_SALT strength
  if (parsed.SITE_HASH_SALT.length < 32) {
    errors.push({
      variable: 'SITE_HASH_SALT',
      message: `Must be at least 32 characters long. Current length: ${parsed.SITE_HASH_SALT.length}`,
      path: ['SITE_HASH_SALT'],
      received: `${parsed.SITE_HASH_SALT.length} characters`,
      expected: 'Minimum 32 characters'
    });
  }
  
  // Validate OG font configuration
  if (parsed.FAIL_ON_OG_FONT_MISSING === 'true' && !parsed.OG_FONT_FALLBACK) {
    warnings.push(
      'FAIL_ON_OG_FONT_MISSING is "true" but OG_FONT_FALLBACK is not set. ' +
      'Consider providing a fallback font for better reliability.'
    );
  }
  
  // Validate font names are not empty strings
  if (parsed.OG_FONT_PRIMARY.trim() === '') {
    errors.push({
      variable: 'OG_FONT_PRIMARY',
      message: 'Cannot be empty',
      path: ['OG_FONT_PRIMARY'],
      expected: 'Valid font family name (e.g., "Inter")'
    });
  }
  
  return { success: errors.length === 0, errors, warnings };
}

/**
 * Production-specific validation rules with comprehensive checks
 */
function validateProductionRequirements(parsed: Env): EnvValidationResult {
  const errors = [];
  const warnings = [];
  
  // Critical production requirements
  if (!parsed.NEXT_PUBLIC_CANONICAL_URL) {
    errors.push({
      variable: 'NEXT_PUBLIC_CANONICAL_URL',
      message: 'Required in production environment for SEO and OpenGraph',
      path: ['NEXT_PUBLIC_CANONICAL_URL'],
      expected: 'Full production URL (e.g., https://yoursite.com)'
    });
  }
  
  // Authentication security in production
  if (parsed.NEXTAUTH_URL && !parsed.NEXTAUTH_SECRET) {
    errors.push({
      variable: 'NEXTAUTH_SECRET',
      message: 'Required when NEXTAUTH_URL is set in production',
      path: ['NEXTAUTH_SECRET'],
      expected: 'Minimum 32 characters, cryptographically secure'
    });
  }
  
  if (parsed.NEXTAUTH_SECRET && parsed.NEXTAUTH_SECRET.length < 32) {
    errors.push({
      variable: 'NEXTAUTH_SECRET',
      message: `Too short for production use. Current: ${parsed.NEXTAUTH_SECRET.length} characters`,
      path: ['NEXTAUTH_SECRET'],
      received: `${parsed.NEXTAUTH_SECRET.length} characters`,
      expected: 'Minimum 32 characters'
    });
  }
  
  // Analytics configuration warnings
  if (parsed.ENABLE_ANALYTICS === 'true' && !parsed.NEXT_PUBLIC_GA_ID && !parsed.NEXT_PUBLIC_GTM_ID && !parsed.VERCEL_ANALYTICS_ID) {
    warnings.push(
      'Analytics is enabled but no analytics provider configured. ' +
      'Set NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_GTM_ID, or VERCEL_ANALYTICS_ID.'
    );
  }
  
  // Security recommendations for production
  if (parsed.SITE_HASH_SALT.length < 64) {
    warnings.push(
      `SITE_HASH_SALT is ${parsed.SITE_HASH_SALT.length} characters. ` +
      'Consider using 64+ characters for enhanced security in production.'
    );
  }
  
  // Logging configuration for production
  if (parsed.LOG_STORAGE_MODE === 'ephemeral') {
    warnings.push(
      'LOG_STORAGE_MODE is "ephemeral" which may not be suitable for production debugging. ' +
      'Consider "persistent" or "file" for better log retention.'
    );
  }
  
  // Email configuration for production
  if (parsed.EMAIL_TRANSPORT === 'mock') {
    warnings.push(
      'EMAIL_TRANSPORT is "mock" in production. Consider using a real email service.'
    );
  }
  
  // Database configuration
  if (!parsed.SUPABASE_SERVICE_ROLE_KEY) {
    warnings.push(
      'SUPABASE_SERVICE_ROLE_KEY not set. Some server-side operations may be limited.'
    );
  }
  
  return { success: errors.length === 0, errors, warnings };
}

/**
 * Security-specific validation rules
 */
function validateSecurityRequirements(parsed: Env): EnvValidationResult {
  const warnings = [];
  
  // Check for common weak salt patterns
  const weakPatterns = [
    'test', 'dev', '123', 'abc', 'password', 'secret',
    'your_salt_here', 'changeme', 'default'
  ];
  
  const saltLower = parsed.SITE_HASH_SALT.toLowerCase();
  const hasWeakPattern = weakPatterns.some(pattern => saltLower.includes(pattern));
  
  if (hasWeakPattern) {
    warnings.push(
      'SITE_HASH_SALT appears to contain common patterns. ' +
      'Use a cryptographically secure random string for better security.'
    );
  }
  
  // Check if salt is too simple (only alphanumeric)
  if (/^[a-zA-Z0-9]+$/.test(parsed.SITE_HASH_SALT)) {
    warnings.push(
      'SITE_HASH_SALT contains only alphanumeric characters. ' +
      'Consider including special characters for increased entropy.'
    );
  }
  
  return { success: true, errors: [], warnings };
}

/**
 * Development-specific configuration validation
 */
function validateDevelopmentConfiguration(parsed: Env): EnvValidationResult {
  const warnings = [];
  
  // Check for production URLs in development
  if (parsed.NEXT_PUBLIC_APP_URL && !parsed.NEXT_PUBLIC_APP_URL.includes('localhost') && !parsed.NEXT_PUBLIC_APP_URL.includes('127.0.0.1')) {
    warnings.push(
      `NEXT_PUBLIC_APP_URL (${parsed.NEXT_PUBLIC_APP_URL}) doesn't appear to be a local URL. ` +
      'Consider using localhost for development.'
    );
  }
  
  // Recommend enabling debug flags in development
  if (parsed.DEBUG_API_CALLS !== 'true' && parsed.DEBUG_PERFORMANCE !== 'true' && parsed.DEBUG_SEO !== 'true') {
    warnings.push(
      'No debug flags are enabled. Consider enabling DEBUG_API_CALLS, DEBUG_PERFORMANCE, or DEBUG_SEO for development.'
    );
  }
  
  return { success: true, errors: [], warnings };
}

// Export validated environment variables
export const env = validateEnv();

// Utility functions for common environment checks
export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

// Feature flag helpers with type safety
export const features = {
  pwa: env.ENABLE_PWA === 'true',
  offlineMode: env.ENABLE_OFFLINE_MODE === 'true',
  darkMode: env.ENABLE_DARK_MODE === 'true',
  musicPlayer: env.ENABLE_MUSIC_PLAYER === 'true',
  comments: env.ENABLE_COMMENTS === 'true',
  userAccounts: env.ENABLE_USER_ACCOUNTS === 'true',
  analytics: env.ENABLE_ANALYTICS === 'true',
  bundleAnalyzer: env.ENABLE_BUNDLE_ANALYZER === 'true',
  compression: env.ENABLE_COMPRESSION === 'true',
  imageOptimization: env.ENABLE_IMAGE_OPTIMIZATION === 'true',
} as const;

// Debug flags
export const debug = {
  apiCalls: env.DEBUG_API_CALLS === 'true' && isDevelopment,
  performance: env.DEBUG_PERFORMANCE === 'true' && isDevelopment,
  seo: env.DEBUG_SEO === 'true' && isDevelopment,
} as const;

// Social media links with null safety
export const socialLinks = {
  twitter: env.NEXT_PUBLIC_TWITTER_URL,
  discord: env.NEXT_PUBLIC_DISCORD_URL,
  reddit: env.NEXT_PUBLIC_REDDIT_URL,
  steam: env.NEXT_PUBLIC_STEAM_URL,
  youtube: env.NEXT_PUBLIC_YOUTUBE_URL,
} as const;

// Rate limiting configuration
export const rateLimit = {
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
  maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
} as const;

// Cache configuration
export const cache = {
  maxAge: parseInt(env.CACHE_MAX_AGE, 10),
  staticMaxAge: parseInt(env.STATIC_CACHE_MAX_AGE, 10),
} as const;

// PRD Day3 Configuration Objects

// Silksong release configuration
export const silksongRelease = {
  isoString: env.SILKSONG_RELEASE_ISO,
  date: new Date(env.SILKSONG_RELEASE_ISO),
  timestamp: new Date(env.SILKSONG_RELEASE_ISO).getTime(),
} as const;

// OpenGraph font configuration
export const ogFont = {
  primary: env.OG_FONT_PRIMARY,
  fallback: env.OG_FONT_FALLBACK,
  failOnMissing: env.FAIL_ON_OG_FONT_MISSING === 'true',
} as const;

// Email configuration
export const emailConfig = {
  sender: env.EMAIL_SENDER,
  transport: env.EMAIL_TRANSPORT as EmailTransport,
  isMockMode: env.EMAIL_TRANSPORT === 'mock',
} as const;

// Security configuration
export const security = {
  hashSalt: env.SITE_HASH_SALT,
  csrfSecret: env.CSRF_SECRET,
  sessionSecret: env.SESSION_SECRET,
} as const;

// Logging configuration
export const logging = {
  enabled: env.ENABLE_LOGGING === 'true',
  storageMode: env.LOG_STORAGE_MODE as LogStorageMode,
  isEphemeral: env.LOG_STORAGE_MODE === 'ephemeral',
  isPersistent: env.LOG_STORAGE_MODE === 'persistent',
  isFile: env.LOG_STORAGE_MODE === 'file',
} as const;

// Deployment configuration
export const deployment = {
  environment: env.DEPLOY_ENV as DeployEnv,
  isLocal: env.DEPLOY_ENV === 'local',
  isStaging: env.DEPLOY_ENV === 'staging',
  isProduction: env.DEPLOY_ENV === 'production',
} as const;

// Enhanced localization configuration
export const localization = {
  defaultLocale: env.DEFAULT_LOCALE as SupportedLocale,
  supportedLocales: env.SUPPORTED_LOCALES.split(',').map(locale => locale.trim()) as SupportedLocale[],
  isMultiLanguage: env.SUPPORTED_LOCALES.split(',').length > 1,
} as const;

// Type-safe environment validation helpers
export const validators = {
  isValidLocale: (locale: string): locale is SupportedLocale => {
    return localization.supportedLocales.includes(locale as SupportedLocale);
  },
  
  isValidEmailTransport: (transport: string): transport is EmailTransport => {
    return ['mock', 'smtp', 'sendgrid', 'ses'].includes(transport);
  },
  
  isValidLogStorageMode: (mode: string): mode is LogStorageMode => {
    return ['ephemeral', 'persistent', 'file'].includes(mode);
  },
  
  isValidDeployEnv: (deployEnv: string): deployEnv is DeployEnv => {
    return ['local', 'staging', 'production'].includes(deployEnv);
  },
} as const;

// Utility functions for PRD Day3 features
export const utils = {
  /**
   * Get time remaining until Silksong release
   */
  getTimeUntilRelease: () => {
    const now = Date.now();
    const releaseTime = silksongRelease.timestamp;
    return Math.max(0, releaseTime - now);
  },
  
  /**
   * Check if Silksong has been released
   */
  isSilksongReleased: () => {
    return Date.now() >= silksongRelease.timestamp;
  },
  
  /**
   * Generate a hash using the site salt
   * Note: This is a simple implementation. For production, consider using crypto.createHash()
   */
  hashWithSalt: (input: string): string => {
    if (!input || typeof input !== 'string') {
      throw new Error('hashWithSalt: input must be a non-empty string');
    }
    
    // Simple hash implementation - replace with crypto.createHash() for production
    try {
      const combined = input + security.hashSalt;
      return btoa(combined).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
    } catch (error) {
      throw new Error(`Failed to generate hash: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
  
  /**
   * Validate environment variable format
   */
  validateLocale: (locale: string): locale is SupportedLocale => {
    return validators.isValidLocale(locale);
  },
  
  /**
   * Get formatted release countdown
   */
  getFormattedCountdown: (): string => {
    if (utils.isSilksongReleased()) {
      return '🎉 Silksong has been released!';
    }
    
    const timeRemaining = utils.getTimeUntilRelease();
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} days, ${hours} hours remaining`;
    if (hours > 0) return `${hours} hours, ${minutes} minutes remaining`;
    return `${minutes} minutes remaining`;
  },
  
  /**
   * Get current environment display name
   */
  getEnvironmentDisplayName: (): string => {
    if (deployment.isProduction) return '🚀 Production';
    if (deployment.isStaging) return '🧪 Staging';
    return '💻 Local Development';
  },
} as const;

// Enhanced development logging with PRD Day3 compliance status
if (isDevelopment) {
  const enabledFeatures = Object.entries(features)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature);
  
  const enabledDebug = Object.entries(debug)
    .filter(([, enabled]) => enabled)
    .map(([flag]) => flag);
  
  // PRD Day3 compliance check
  const prdCompliance = {
    hasAllRequired: !!(
      env.SUPPORTED_LOCALES &&
      env.DEFAULT_LOCALE &&
      env.SILKSONG_RELEASE_ISO &&
      env.OG_FONT_PRIMARY &&
      env.EMAIL_TRANSPORT &&
      env.SITE_HASH_SALT &&
      env.LOG_STORAGE_MODE
    ),
    conditionalChecks: {
      emailSender: env.EMAIL_TRANSPORT === 'mock' || !!env.EMAIL_SENDER,
      localeConsistency: localization.supportedLocales.includes(localization.defaultLocale),
    }
  };
  
  const complianceStatus = prdCompliance.hasAllRequired && 
    Object.values(prdCompliance.conditionalChecks).every(Boolean) 
    ? '✅ COMPLIANT' 
    : '❌ NON-COMPLIANT';
  
  console.log('🔧 Environment Configuration (PRD Day3):', {
    complianceStatus,
    environment: utils.getEnvironmentDisplayName(),
    nodeEnv: env.NODE_ENV,
    appUrl: env.NEXT_PUBLIC_APP_URL,
    appName: env.NEXT_PUBLIC_APP_NAME,
    version: env.NEXT_PUBLIC_APP_VERSION,
    
    // PRD Day3 Core Configuration
    localization: {
      default: localization.defaultLocale,
      supported: localization.supportedLocales,
      isMultiLanguage: localization.isMultiLanguage,
      isValid: prdCompliance.conditionalChecks.localeConsistency,
    },
    
    silksongRelease: {
      isoString: silksongRelease.isoString,
      date: silksongRelease.date.toLocaleDateString(),
      time: silksongRelease.date.toLocaleTimeString(),
      isReleased: utils.isSilksongReleased(),
      timeUntil: utils.isSilksongReleased() 
        ? '🎉 Released!' 
        : `${Math.ceil(utils.getTimeUntilRelease() / (1000 * 60 * 60 * 24))} days`,
      timestamp: silksongRelease.timestamp,
    },
    
    email: {
      transport: emailConfig.transport,
      isMockMode: emailConfig.isMockMode,
      hasSender: !!emailConfig.sender,
      isValid: prdCompliance.conditionalChecks.emailSender,
    },
    
    ogFont: {
      primary: ogFont.primary,
      fallback: ogFont.fallback || 'none',
      failOnMissing: ogFont.failOnMissing,
    },
    
    logging: {
      enabled: logging.enabled,
      storageMode: logging.storageMode,
      isEphemeral: logging.isEphemeral,
      isPersistent: logging.isPersistent,
      isFile: logging.isFile,
    },
    
    security: {
      hasSalt: !!security.hashSalt,
      saltLength: security.hashSalt.length,
      isSecure: security.hashSalt.length >= 32,
      hasCSRF: !!security.csrfSecret,
      hasSession: !!security.sessionSecret,
    },
    
    deployment: {
      environment: deployment.environment,
      isLocal: deployment.isLocal,
      isStaging: deployment.isStaging,
      isProduction: deployment.isProduction,
    },
    
    features: enabledFeatures.length > 0 ? enabledFeatures : ['none'],
    debug: enabledDebug.length > 0 ? enabledDebug : ['none'],
    
    prdDay3Compliance: prdCompliance,
  });
  
  // Additional compliance warnings
  if (!prdCompliance.hasAllRequired) {
    console.warn('⚠️  Some required PRD Day3 environment variables may be missing.');
  }
  
  if (!Object.values(prdCompliance.conditionalChecks).every(Boolean)) {
    console.warn('⚠️  Some conditional PRD Day3 requirements are not met.');
  }
}