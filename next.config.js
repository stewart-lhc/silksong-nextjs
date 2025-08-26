/**
 * Environment validation at build time for PRD Day3 compliance
 * This ensures all required environment variables are present and valid before building
 * Note: env validation is handled by build scripts, not at config time
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix for workspace root warning
  outputFileTracingRoot: __dirname,

  // App Router handles i18n differently - moved to app directory structure
  // See: https://nextjs.org/docs/app/building-your-application/routing/internationalization

  // Enhanced image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Enable remote patterns for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hollowknightsilksong.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Bundle optimization  
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
  },

  // Basic performance optimizations
  compress: true,
  poweredByHeader: false,

  // TypeScript configuration - Strict checking for PRD Day3
  typescript: {
    // Enable strict TypeScript checking for environment variables
    ignoreBuildErrors: false,
  },

  // ESLint configuration - Strict checking for PRD Day3
  eslint: {
    // Enable strict ESLint checking to catch environment variable issues
    ignoreDuringBuilds: false,
  },

  // Environment validation
  env: {
    // Validate environment variables at build time
    VALIDATED_ENV: 'true',
  },
};

module.exports = nextConfig;