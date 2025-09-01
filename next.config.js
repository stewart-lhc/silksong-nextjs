/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix for workspace root warning
  outputFileTracingRoot: __dirname,

  // Enhanced image optimization for Core Web Vitals
  images: {
    // Prioritize modern formats for better compression
    formats: ['image/avif', 'image/webp'],
    
    // More granular device sizes for better responsive loading
    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200, 1440, 1600, 1920, 2048, 2560, 3840],
    
    // Comprehensive image sizes for icons, thumbnails, and UI elements
    imageSizes: [16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192, 256, 320, 384, 512, 640, 750],
    
    // Aggressive caching for better performance
    minimumCacheTTL: 31536000, // 1 year cache
    
    // Enable SVG with security
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // Optimize for various screen densities
    unoptimized: false,
    
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
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      },
    ],
    
  },

  // Basic performance optimizations
  compress: true,
  poweredByHeader: false,

  // TypeScript configuration - Gradual migration to strict checking
  typescript: {
    // SECURITY NOTE: Temporarily allowing builds while fixing type errors
    // TODO: Set to false once all TypeScript errors are resolved
    // Using explicit production check for Windows compatibility
    ignoreBuildErrors: process.env.NODE_ENV !== 'production',
  },

  // ESLint configuration - Allow warnings but block on errors
  eslint: {
    // Allow builds with warnings in development, strict in production
    // TODO: Set to false once all critical ESLint errors are resolved
    // Using explicit production check for Windows compatibility
    ignoreDuringBuilds: process.env.NODE_ENV !== 'production',
  },

  // Security headers configuration
  async headers() {
    return [
      {
        // Apply security headers to all routes except embed
        source: '/((?!embed).*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              // Base policy - self only
              "default-src 'self'",
              
              // Scripts - Allow analytics and necessary inline scripts
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://www.clarity.ms",
              
              // Styles - Allow inline styles and Google Fonts
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              
              // Fonts - Google Fonts CDN
              "font-src 'self' https://fonts.gstatic.com",
              
              // Images - Allow external images for content
              "img-src 'self' data: https: blob: https://i.ytimg.com https://img.youtube.com",
              
              // Videos - YouTube embedded content (including privacy-enhanced)
              "media-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://youtube-nocookie.com",
              
              // Frames - YouTube embeds only (including privacy-enhanced)
              "frame-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://youtube-nocookie.com",
              
              // Connections - Analytics and Supabase
              "connect-src 'self' https://www.google-analytics.com https://www.clarity.ms https://*.supabase.co https://analytics.google.com",
              
              // Child sources - Same as frame-src for legacy support (including privacy-enhanced)
              "child-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://youtube-nocookie.com",
              
              // Object sources - Block plugins
              "object-src 'none'",
              
              // Base URI - Prevent base tag hijacking
              "base-uri 'self'",
              
              // Form actions - Only self
              "form-action 'self'",
              
              // Frame ancestors - Prevent clickjacking
              "frame-ancestors 'none'",
              
              // Manifest - PWA support
              "manifest-src 'self'",
              
              // Worker sources - Service worker support
              "worker-src 'self' blob:"
            ].join('; '),
          },
        ],
      },
      {
        // Special headers for embed pages - Allow iframe embedding from same origin
        source: '/embed/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              // Base policy - self only
              "default-src 'self'",
              
              // Scripts - Allow inline scripts for embed widgets
              "script-src 'self' 'unsafe-inline'",
              
              // Styles - Allow inline styles
              "style-src 'self' 'unsafe-inline'",
              
              // Images - Allow data URLs and self
              "img-src 'self' data:",
              
              // Frames - Allow self embedding
              "frame-src 'self'",
              
              // Frame ancestors - Allow same origin
              "frame-ancestors 'self'",
              
              // Connections - Only self
              "connect-src 'self'",
              
              // Object sources - Block plugins
              "object-src 'none'",
              
              // Base URI - Prevent base tag hijacking
              "base-uri 'self'",
              
              // Form actions - Only self
              "form-action 'self'"
            ].join('; '),
          },
        ],
      },
      {
        // Optimize caching for static assets
        source: '/(_next/static|favicon.ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache API routes appropriately
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;