/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix for workspace root warning
  outputFileTracingRoot: __dirname,

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