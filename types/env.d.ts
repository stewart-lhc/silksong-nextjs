/**
 * TypeScript Environment Variables Declaration
 * PRD Day3 Implementation - Strict type definitions for environment variables
 * 
 * This file provides enhanced type safety for process.env access throughout the application.
 * All environment variables are strictly typed to prevent runtime errors.
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // === PRD Day3 Required Environment Variables ===
      
      // Node.js Environment (Required)
      readonly NODE_ENV: 'development' | 'production' | 'test';
      
      // Core Application Configuration (Required)
      readonly NEXT_PUBLIC_APP_URL: string;
      readonly NEXT_PUBLIC_APP_NAME: string;
      readonly NEXT_PUBLIC_APP_VERSION?: string;
      
      // Internationalization Configuration (Required)
      readonly SUPPORTED_LOCALES: string; // Format: "en,zh" - comma-separated ISO 639-1 codes
      readonly DEFAULT_LOCALE: string; // Format: "en" - single ISO 639-1 code
      
      // Silksong Release Configuration (Required)
      readonly SILKSONG_RELEASE_ISO: string; // Format: "2025-09-04T00:00:00Z" - ISO 8601 datetime
      
      // OpenGraph Font Configuration (Required)
      readonly OG_FONT_PRIMARY: string;
      readonly OG_FONT_FALLBACK?: string;
      readonly FAIL_ON_OG_FONT_MISSING?: 'true' | 'false';
      
      // Email Configuration (Required)
      readonly EMAIL_SENDER?: string; // Conditionally required when EMAIL_TRANSPORT !== 'mock'
      readonly EMAIL_TRANSPORT: 'mock' | 'smtp' | 'sendgrid' | 'ses';
      
      // Security Configuration (Required)
      readonly SITE_HASH_SALT: string; // Minimum 32 characters
      
      // Logging Configuration (Required)
      readonly LOG_STORAGE_MODE: 'ephemeral' | 'persistent' | 'file';
      readonly ENABLE_LOGGING?: 'true' | 'false';
      
      // Deployment Configuration (Optional)
      readonly DEPLOY_ENV?: 'local' | 'staging' | 'production';
      
      // === Legacy/Required Configuration ===
      
      // Supabase Configuration (Required for database functionality)
      readonly NEXT_PUBLIC_SUPABASE_URL: string;
      readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      readonly SUPABASE_SERVICE_ROLE_KEY?: string;
      
      // SEO Configuration (Required)
      readonly NEXT_PUBLIC_SITE_DESCRIPTION: string;
      readonly NEXT_PUBLIC_KEYWORDS: string;
      readonly NEXT_PUBLIC_CANONICAL_URL?: string;
      
      // === Optional Configuration ===
      
      // Analytics Configuration (Optional)
      readonly NEXT_PUBLIC_GA_ID?: string;
      readonly NEXT_PUBLIC_GTM_ID?: string;
      readonly VERCEL_ANALYTICS_ID?: string;
      readonly ENABLE_ANALYTICS?: 'true' | 'false';
      
      // Authentication Configuration (Optional)
      readonly NEXTAUTH_URL?: string;
      readonly NEXTAUTH_SECRET?: string; // Minimum 32 characters when used
      readonly NEXTAUTH_URL_INTERNAL?: string;
      
      // External APIs (Optional)
      readonly CMS_API_URL?: string;
      readonly CMS_API_TOKEN?: string;
      readonly STEAM_API_KEY?: string;
      readonly IGDB_CLIENT_ID?: string;
      readonly IGDB_CLIENT_SECRET?: string;
      
      // Legacy Email Configuration (Optional)
      readonly EMAIL_FROM?: string;
      readonly SMTP_HOST?: string;
      readonly SMTP_PORT?: string; // Numeric string
      readonly SMTP_USER?: string;
      readonly SMTP_PASSWORD?: string;
      
      // Social Media Links (Optional)
      readonly NEXT_PUBLIC_TWITTER_URL?: string;
      readonly NEXT_PUBLIC_DISCORD_URL?: string;
      readonly NEXT_PUBLIC_REDDIT_URL?: string;
      readonly NEXT_PUBLIC_STEAM_URL?: string;
      readonly NEXT_PUBLIC_YOUTUBE_URL?: string;
      
      // CDN and Media (Optional)
      readonly NEXT_PUBLIC_CDN_URL?: string;
      readonly CLOUDINARY_CLOUD_NAME?: string;
      readonly CLOUDINARY_API_KEY?: string;
      readonly CLOUDINARY_API_SECRET?: string;
      
      // Feature Flags (Optional with defaults)
      readonly ENABLE_PWA?: 'true' | 'false';
      readonly ENABLE_OFFLINE_MODE?: 'true' | 'false';
      readonly ENABLE_DARK_MODE?: 'true' | 'false';
      readonly ENABLE_MUSIC_PLAYER?: 'true' | 'false';
      readonly ENABLE_COMMENTS?: 'true' | 'false';
      readonly ENABLE_USER_ACCOUNTS?: 'true' | 'false';
      
      // Development Settings (Optional)
      readonly DEBUG_API_CALLS?: 'true' | 'false';
      readonly DEBUG_PERFORMANCE?: 'true' | 'false';
      readonly DEBUG_SEO?: 'true' | 'false';
      
      // Security (Optional)
      readonly CSRF_SECRET?: string; // Minimum 32 characters when used
      readonly SESSION_SECRET?: string; // Minimum 32 characters when used
      readonly RATE_LIMIT_WINDOW_MS?: string; // Numeric string
      readonly RATE_LIMIT_MAX_REQUESTS?: string; // Numeric string
      
      // Monitoring (Optional)
      readonly SENTRY_DSN?: string;
      readonly SENTRY_ORG?: string;
      readonly SENTRY_PROJECT?: string;
      readonly UPTIME_ROBOT_API_KEY?: string;
      
      // Performance (Optional)
      readonly ENABLE_BUNDLE_ANALYZER?: 'true' | 'false';
      readonly ENABLE_COMPRESSION?: 'true' | 'false';
      readonly ENABLE_IMAGE_OPTIMIZATION?: 'true' | 'false';
      readonly CACHE_MAX_AGE?: string; // Numeric string
      readonly STATIC_CACHE_MAX_AGE?: string; // Numeric string
      
      // External Service Endpoints (Optional)
      readonly NEWS_API_ENDPOINT?: string;
      readonly COMMUNITY_API_ENDPOINT?: string;
      readonly GAME_DATA_API_ENDPOINT?: string;
    }
  }
}

// Supported locale union type for type safety
export type SupportedLocale = 'en' | 'zh';

// Email transport type for type safety
export type EmailTransport = 'mock' | 'smtp' | 'sendgrid' | 'ses';

// Log storage mode type for type safety
export type LogStorageMode = 'ephemeral' | 'persistent' | 'file';

// Deploy environment type for type safety
export type DeployEnv = 'local' | 'staging' | 'production';

// Node environment type for type safety
export type NodeEnv = 'development' | 'production' | 'test';

// Boolean string type for environment variables
export type BooleanString = 'true' | 'false';

// Utility type for validating locale strings
export type LocaleString = `${SupportedLocale}` | `${SupportedLocale},${SupportedLocale}`;

/**
 * PRD Day3 Environment Variable Validation Rules
 * These types ensure compile-time safety for environment variable access
 */
export interface PrdDay3EnvConfig {
  // Required variables (must be present)
  supportedLocales: string;
  defaultLocale: SupportedLocale;
  silksongReleaseIso: string;
  ogFontPrimary: string;
  emailTransport: EmailTransport;
  siteHashSalt: string;
  logStorageMode: LogStorageMode;
  
  // Conditionally required variables
  emailSender?: string; // Required when emailTransport !== 'mock'
  
  // Optional variables with defaults
  ogFontFallback?: string;
  failOnOgFontMissing?: BooleanString;
  enableLogging?: BooleanString;
  deployEnv?: DeployEnv;
}

/**
 * Environment variable validation error types
 */
export interface EnvValidationError {
  readonly variable: string;
  readonly message: string;
  readonly path: string[];
  readonly received?: unknown;
  readonly expected?: string;
}

export interface EnvValidationResult {
  readonly success: boolean;
  readonly errors: EnvValidationError[];
  readonly warnings: string[];
}

/**
 * Type guard for checking if a string is a supported locale
 */
export const isSupportedLocale = (locale: string): locale is SupportedLocale => {
  return ['en', 'zh'].includes(locale);
};

/**
 * Type guard for checking if a string is a valid email transport
 */
export const isEmailTransport = (transport: string): transport is EmailTransport => {
  return ['mock', 'smtp', 'sendgrid', 'ses'].includes(transport);
};

/**
 * Type guard for checking if a string is a valid log storage mode
 */
export const isLogStorageMode = (mode: string): mode is LogStorageMode => {
  return ['ephemeral', 'persistent', 'file'].includes(mode);
};

/**
 * Type guard for checking if a string is a valid deploy environment
 */
export const isDeployEnv = (env: string): env is DeployEnv => {
  return ['local', 'staging', 'production'].includes(env);
};

/**
 * Type guard for checking if a string is a valid boolean string
 */
export const isBooleanString = (value: string): value is BooleanString => {
  return value === 'true' || value === 'false';
};

/**
 * Utility type for extracting environment variable names
 */
export type EnvVarName = keyof NodeJS.ProcessEnv;

/**
 * Environment variable categories for better organization
 */
export const EnvCategories = {
  CORE: ['NODE_ENV', 'NEXT_PUBLIC_APP_URL', 'NEXT_PUBLIC_APP_NAME'] as const,
  I18N: ['SUPPORTED_LOCALES', 'DEFAULT_LOCALE'] as const,
  RELEASE: ['SILKSONG_RELEASE_ISO'] as const,
  OG_FONTS: ['OG_FONT_PRIMARY', 'OG_FONT_FALLBACK', 'FAIL_ON_OG_FONT_MISSING'] as const,
  EMAIL: ['EMAIL_SENDER', 'EMAIL_TRANSPORT'] as const,
  SECURITY: ['SITE_HASH_SALT', 'CSRF_SECRET', 'SESSION_SECRET'] as const,
  LOGGING: ['LOG_STORAGE_MODE', 'ENABLE_LOGGING'] as const,
  DEPLOYMENT: ['DEPLOY_ENV'] as const,
  DATABASE: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'] as const,
  SEO: ['NEXT_PUBLIC_SITE_DESCRIPTION', 'NEXT_PUBLIC_KEYWORDS', 'NEXT_PUBLIC_CANONICAL_URL'] as const,
  ANALYTICS: ['NEXT_PUBLIC_GA_ID', 'NEXT_PUBLIC_GTM_ID', 'VERCEL_ANALYTICS_ID', 'ENABLE_ANALYTICS'] as const,
  AUTH: ['NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL_INTERNAL'] as const,
  FEATURES: ['ENABLE_PWA', 'ENABLE_OFFLINE_MODE', 'ENABLE_DARK_MODE', 'ENABLE_MUSIC_PLAYER'] as const,
  SOCIAL: ['NEXT_PUBLIC_TWITTER_URL', 'NEXT_PUBLIC_DISCORD_URL', 'NEXT_PUBLIC_REDDIT_URL'] as const,
  PERFORMANCE: ['ENABLE_BUNDLE_ANALYZER', 'ENABLE_COMPRESSION', 'ENABLE_IMAGE_OPTIMIZATION'] as const,
} as const;

export {};