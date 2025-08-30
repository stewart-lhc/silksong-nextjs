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

  // TypeScript configuration
  typescript: {
    // Dangerously allow production builds to successfully complete even if your project has TypeScript errors
    ignoreBuildErrors: true,
  },

  // ESLint configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if your project has ESLint errors
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;