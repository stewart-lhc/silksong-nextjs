/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Fix for workspace root warning
  outputFileTracingRoot: __dirname,
  
  // Server external packages (moved from experimental)
  serverExternalPackages: [],
  // Enable static exports if needed
  // output: 'export',
  // trailingSlash: true,
  
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
    ]
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Bundle optimization and code splitting
  experimental: {
    // Enable modern features for better performance
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Optimize server components
    serverComponentsExternalPackages: [],
  },
  
  // Webpack configuration for advanced optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Production optimizations
    if (!dev) {
      // Tree shaking optimization
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        // Advanced code splitting
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // React and React-DOM in separate chunk
            react: {
              name: 'react',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              priority: 20,
            },
            // UI components in separate chunk
            ui: {
              name: 'ui',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](@radix-ui)[\\/]/,
              priority: 15,
            },
            // Vendor libraries
            vendor: {
              name: 'vendors',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
            },
            // Common code
            common: {
              name: 'common',
              chunks: 'all',
              minChunks: 2,
              priority: 5,
            },
          },
        },
      };

      // Bundle analysis logging
      if (process.env.ANALYZE === 'true') {
        console.log('🔍 Bundle analysis enabled');
      }
    }

    // Custom module resolution for better tree shaking
    config.resolve.alias = {
      ...config.resolve.alias,
      // Optimize lodash imports
      'lodash': 'lodash-es',
    };

    return config;
  },
  
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

// Wrap config with bundle analyzer
module.exports = withBundleAnalyzer(nextConfig);