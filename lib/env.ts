/**
 * Environment Variables Validation and Type-Safe Access
 * Provides runtime validation and type safety for environment variables
 */

import { z } from 'zod';

// Define the schema for environment variables with strict validation
const envSchema = z.object({
  // Node.js Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Application Configuration (Required)
  NEXT_PUBLIC_APP_URL: z.string().url('Invalid APP_URL format').optional().default('https://hollowknightsilksong.org'),
  NEXT_PUBLIC_APP_NAME: z.string().min(1, 'APP_NAME is required').optional().default('Silk Song Archive'),
  NEXT_PUBLIC_APP_VERSION: z.string().optional().default('1.0.0'),
  
  // Supabase Configuration (Required for database functionality)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL format'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  
  // SEO Configuration (Required for proper SEO)
  NEXT_PUBLIC_SITE_DESCRIPTION: z.string().min(50, 'Site description should be at least 50 characters').optional().default('Official archive site for Hollow Knight: Silksong. Get the latest news, media, and release information for Team Cherry\'s highly anticipated sequel.'),
  NEXT_PUBLIC_KEYWORDS: z.string().min(1, 'Keywords are required for SEO').optional().default('Hollow Knight,Silksong,Team Cherry,Metroidvania,indie games,video games,gaming news'),
  NEXT_PUBLIC_CANONICAL_URL: z.string().url().optional(),
  
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
  
  // Email Configuration (Optional)
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
  
  // Localization (Optional)
  DEFAULT_LOCALE: z.string().optional().default('en'),
  SUPPORTED_LOCALES: z.string().optional().default('en,es,fr,de,ja,pt'),
  
  // External Service Endpoints (Optional)
  NEWS_API_ENDPOINT: z.string().url().optional(),
  COMMUNITY_API_ENDPOINT: z.string().url().optional(),
  GAME_DATA_API_ENDPOINT: z.string().url().optional(),
});

// Type definition for validated environment variables
export type Env = z.infer<typeof envSchema>;

// Validate environment variables and throw detailed errors if invalid
function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env);
    
    // Additional runtime validations
    if (parsed.NODE_ENV === 'production') {
      // Production-specific validations
      if (!parsed.NEXT_PUBLIC_CANONICAL_URL) {
        throw new Error('NEXT_PUBLIC_CANONICAL_URL is required in production');
      }
      
      if (!parsed.NEXTAUTH_SECRET && parsed.NEXTAUTH_URL) {
        throw new Error('NEXTAUTH_SECRET is required when NEXTAUTH_URL is set in production');
      }
      
      if (parsed.ENABLE_ANALYTICS === 'true' && !parsed.NEXT_PUBLIC_GA_ID && !parsed.NEXT_PUBLIC_GTM_ID) {
        console.warn('Analytics is enabled but no GA_ID or GTM_ID provided');
      }
    }
    
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      
      const isVercel = process.env.VERCEL === '1';
      const envSource = isVercel 
        ? 'Vercel environment variables dashboard' 
        : '.env.local file';
      
      throw new Error(
        `Environment validation failed:\n${errorMessages.join('\n')}\n\n` +
        `Please check your ${envSource} and ensure all required variables are set correctly.`
      );
    }
    
    throw error;
  }
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

// Localization configuration
export const localization = {
  defaultLocale: env.DEFAULT_LOCALE,
  supportedLocales: env.SUPPORTED_LOCALES.split(',').map(locale => locale.trim()),
} as const;

// Development helper to log environment status
if (isDevelopment) {
  console.log('Environment Configuration:', {
    nodeEnv: env.NODE_ENV,
    appUrl: env.NEXT_PUBLIC_APP_URL,
    appName: env.NEXT_PUBLIC_APP_NAME,
    features: Object.entries(features)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature),
    debug: Object.entries(debug)
      .filter(([, enabled]) => enabled)
      .map(([flag]) => flag),
  });
}