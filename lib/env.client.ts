/**
 * Client-Side Environment Variables
 * Provides safe access to environment variables in browser context
 * Only includes NEXT_PUBLIC_ variables that are safe for client-side use
 */

// Client-safe environment variables - these are automatically injected by Next.js
export const clientEnv = {
  // Application Configuration
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '',
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || '',
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // SEO Configuration
  NEXT_PUBLIC_SITE_DESCRIPTION: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '',
  NEXT_PUBLIC_KEYWORDS: process.env.NEXT_PUBLIC_KEYWORDS || '',
  NEXT_PUBLIC_CANONICAL_URL: process.env.NEXT_PUBLIC_CANONICAL_URL || '',
  
  // Analytics (Optional)
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID || '',
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID || '',
  
  // Social Media
  NEXT_PUBLIC_TWITTER_URL: process.env.NEXT_PUBLIC_TWITTER_URL || '',
  NEXT_PUBLIC_DISCORD_URL: process.env.NEXT_PUBLIC_DISCORD_URL || '',
  NEXT_PUBLIC_REDDIT_URL: process.env.NEXT_PUBLIC_REDDIT_URL || '',
  NEXT_PUBLIC_STEAM_URL: process.env.NEXT_PUBLIC_STEAM_URL || '',
  NEXT_PUBLIC_YOUTUBE_URL: process.env.NEXT_PUBLIC_YOUTUBE_URL || '',
  
  // CDN and Media
  NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || '',
} as const;

// Validation function that runs only if needed (with fallbacks)
function validateClientEnv() {
  const required = [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_APP_NAME', 
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SITE_DESCRIPTION',
    'NEXT_PUBLIC_KEYWORDS'
  ];
  
  const missing = required.filter(key => !clientEnv[key as keyof typeof clientEnv]);
  
  if (missing.length > 0) {
    console.warn('Missing client environment variables:', missing);
    console.warn('This may cause functionality issues. Please check your .env.local file.');
  }
}

// Only validate in development mode to help developers
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  validateClientEnv();
}

// Export commonly used values
export const isClientSide = typeof window !== 'undefined';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';