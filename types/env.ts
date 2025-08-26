/**
 * Advanced TypeScript type definitions for environment variables
 * PRD Day3 implementation with comprehensive type safety
 */

import type { 
  Env, 
  SupportedLocale, 
  EmailTransport, 
  LogStorageMode, 
  DeployEnv 
} from '@/lib/env';

// === Core Environment Types ===

/**
 * Environment variable validation result with detailed type information
 */
export interface EnvValidationResult<T = unknown> {
  readonly isValid: boolean;
  readonly value: T;
  readonly errors: string[];
  readonly warnings: string[];
}

/**
 * Strongly typed environment configuration with computed properties
 */
export interface EnvironmentConfig {
  readonly env: Env;
  readonly computed: {
    readonly isDevelopment: boolean;
    readonly isProduction: boolean;
    readonly isTest: boolean;
    readonly isLocal: boolean;
    readonly isStaging: boolean;
    readonly isMockEmail: boolean;
    readonly isMultiLanguage: boolean;
    readonly isSilksongReleased: boolean;
    readonly timeUntilRelease: number;
  };
}

// === PRD Day3 Specific Types ===

/**
 * Localization configuration with type-safe locale handling
 */
export interface LocalizationConfig {
  readonly defaultLocale: SupportedLocale;
  readonly supportedLocales: readonly SupportedLocale[];
  readonly isMultiLanguage: boolean;
  readonly rtlLocales: readonly SupportedLocale[];
  readonly fallbackChain: Record<SupportedLocale, SupportedLocale>;
}

/**
 * Release configuration with temporal utilities
 */
export interface ReleaseConfig {
  readonly isoString: string;
  readonly date: Date;
  readonly timestamp: number;
  readonly isReleased: boolean;
  readonly timeUntil: number;
  readonly countdown: {
    readonly days: number;
    readonly hours: number;
    readonly minutes: number;
    readonly seconds: number;
  };
}

/**
 * OpenGraph font configuration with validation
 */
export interface OGFontConfig {
  readonly primary: string;
  readonly fallback: string | undefined;
  readonly failOnMissing: boolean;
  readonly fontStack: readonly string[];
  readonly isValid: boolean;
}

/**
 * Email transport configuration with provider-specific types
 */
export interface EmailConfig {
  readonly transport: EmailTransport;
  readonly sender: string | undefined;
  readonly isMockMode: boolean;
  readonly isConfigured: boolean;
  readonly smtpConfig?: SMTPConfig;
  readonly sendgridConfig?: SendGridConfig;
  readonly sesConfig?: SESConfig;
}

/**
 * SMTP configuration for email transport
 */
export interface SMTPConfig {
  readonly host: string;
  readonly port: number;
  readonly user: string;
  readonly password: string;
  readonly secure: boolean;
}

/**
 * SendGrid configuration for email transport
 */
export interface SendGridConfig {
  readonly apiKey: string;
  readonly fromEmail: string;
  readonly templateIds?: Record<string, string>;
}

/**
 * Amazon SES configuration for email transport
 */
export interface SESConfig {
  readonly region: string;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly fromEmail: string;
}

/**
 * Security configuration with crypto utilities
 */
export interface SecurityConfig {
  readonly hashSalt: string;
  readonly csrfSecret: string | undefined;
  readonly sessionSecret: string | undefined;
  readonly saltLength: number;
  readonly isSecure: boolean;
  readonly recommendations: readonly string[];
}

/**
 * Logging configuration with storage options
 */
export interface LoggingConfig {
  readonly enabled: boolean;
  readonly storageMode: LogStorageMode;
  readonly isEphemeral: boolean;
  readonly isPersistent: boolean;
  readonly isFile: boolean;
  readonly retentionPolicy?: {
    readonly maxAge: number;
    readonly maxSize: number;
    readonly rotationInterval: number;
  };
}

/**
 * Deployment configuration with environment-specific settings
 */
export interface DeploymentConfig {
  readonly environment: DeployEnv;
  readonly isLocal: boolean;
  readonly isStaging: boolean;
  readonly isProduction: boolean;
  readonly features: {
    readonly debugMode: boolean;
    readonly analytics: boolean;
    readonly monitoring: boolean;
    readonly compression: boolean;
  };
}

// === Validation and Utility Types ===

/**
 * Environment variable validator function type
 */
export type EnvValidator<T> = (value: string | undefined) => EnvValidationResult<T>;

/**
 * Environment variable transformer function type
 */
export type EnvTransformer<T, R> = (value: T) => R;

/**
 * Environment feature flag configuration
 */
export interface FeatureFlags {
  readonly pwa: boolean;
  readonly offlineMode: boolean;
  readonly darkMode: boolean;
  readonly musicPlayer: boolean;
  readonly comments: boolean;
  readonly userAccounts: boolean;
  readonly analytics: boolean;
  readonly bundleAnalyzer: boolean;
  readonly compression: boolean;
  readonly imageOptimization: boolean;
}

/**
 * Debug configuration flags
 */
export interface DebugConfig {
  readonly apiCalls: boolean;
  readonly performance: boolean;
  readonly seo: boolean;
}

/**
 * Social media links configuration
 */
export interface SocialLinks {
  readonly twitter: string | undefined;
  readonly discord: string | undefined;
  readonly reddit: string | undefined;
  readonly steam: string | undefined;
  readonly youtube: string | undefined;
}

/**
 * Rate limiting configuration
 */
export interface RateLimit {
  readonly windowMs: number;
  readonly maxRequests: number;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  readonly maxAge: number;
  readonly staticMaxAge: number;
}

// === Advanced Type Utilities ===

/**
 * Extract required environment variables from schema
 */
export type RequiredEnvVars = {
  [K in keyof Env]-?: Env[K] extends string | number | boolean 
    ? Env[K] 
    : never;
};

/**
 * Extract optional environment variables from schema
 */
export type OptionalEnvVars = {
  [K in keyof Env]?: Env[K];
};

/**
 * Environment variable names as literal types
 */
export type EnvVarName = keyof Env;

/**
 * PRD Day3 specific required environment variables
 */
export type PrdDay3RequiredVars = Pick<Env, 
  | 'SUPPORTED_LOCALES'
  | 'DEFAULT_LOCALE' 
  | 'SILKSONG_RELEASE_ISO'
  | 'OG_FONT_PRIMARY'
  | 'EMAIL_TRANSPORT'
  | 'SITE_HASH_SALT'
  | 'LOG_STORAGE_MODE'
>;

/**
 * Environment variable validation error with context
 */
export interface EnvValidationError {
  readonly variable: EnvVarName;
  readonly message: string;
  readonly code: 'MISSING' | 'INVALID_FORMAT' | 'INVALID_VALUE' | 'CONDITIONAL_REQUIRED';
  readonly suggestions?: readonly string[];
}

/**
 * Complete environment validation report
 */
export interface EnvValidationReport {
  readonly isValid: boolean;
  readonly errors: readonly EnvValidationError[];
  readonly warnings: readonly string[];
  readonly config: EnvironmentConfig;
  readonly summary: {
    readonly totalVars: number;
    readonly requiredVars: number;
    readonly optionalVars: number;
    readonly missingRequired: number;
    readonly invalidValues: number;
  };
}

// === Export all types for external use ===

export type {
  Env,
  SupportedLocale,
  EmailTransport,
  LogStorageMode,
  DeployEnv,
} from '@/lib/env';

/**
 * Utility type to ensure exhaustive handling of environment modes
 */
export type ExhaustiveEnvCheck<T extends EnvVarName> = {
  readonly [K in T]: (value: Env[K]) => boolean;
};

/**
 * Type-safe environment variable getter with fallbacks
 */
export type SafeEnvGetter = <K extends keyof Env>(
  key: K,
  fallback?: Env[K]
) => NonNullable<Env[K]>;

/**
 * Environment-specific configuration override type
 */
export type EnvironmentOverrides = {
  readonly development?: Partial<Env>;
  readonly staging?: Partial<Env>;
  readonly production?: Partial<Env>;
  readonly test?: Partial<Env>;
};