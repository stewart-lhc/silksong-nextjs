/**
 * Jest Configuration for Newsletter Kit Testing
 * Optimized for Next.js 15 with comprehensive test coverage
 */

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/test-setup.ts'],
  
  // Test patterns
  testMatch: [
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/*.(test|spec).{js,jsx,ts,tsx}'
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/__tests__/setup/',
    '<rootDir>/__tests__/mocks/',
    '<rootDir>/__tests__/fixtures/',
    '<rootDir>/__tests__/utils/',
  ],
  
  // Module name mapping for path aliases
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/config/(.*)$': '<rootDir>/config/$1',
    '^@/data/(.*)$': '<rootDir>/data/$1',
  },
  
  // Coverage configuration
  collectCoverageFrom: [
    // Newsletter Kit components
    'lib/newsletter-kit/**/*.{js,jsx,ts,tsx}',
    
    // API routes
    'app/api/newsletter/**/*.{js,ts}',
    
    // Main components that use newsletter kit
    'components/**/*.{js,jsx,ts,tsx}',
    
    // Hooks related to newsletter
    'hooks/**/*.{js,jsx,ts,tsx}',
    
    // Exclude files
    '!**/*.d.ts',
    '!**/*.config.{js,ts}',
    '!**/*.stories.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!lib/newsletter-kit/database/migrations/**',
    '!lib/newsletter-kit/database/scripts/**',
    '!lib/newsletter-kit/examples/**',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    // Specific thresholds for Newsletter Kit
    'lib/newsletter-kit/components/**': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'lib/newsletter-kit/hooks/**': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    'app/api/newsletter/**': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json',
    'clover',
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/(?!(.*\\.mjs$|@supabase|@tanstack))',
  ],
  
  // Global variables
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  
  // Custom reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        suiteName: 'Newsletter Kit Tests',
        outputDirectory: 'test-results',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
    [
      'jest-html-reporters',
      {
        publicPath: 'test-results',
        filename: 'report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'Newsletter Kit Test Report',
      },
    ],
  ],
  
  // Max workers for parallel execution
  maxWorkers: '50%',
  
  // Cache directory
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  
  // Snapshot serializers
  snapshotSerializers: [
    'enzyme-to-json/serializer',
  ],
  
  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>/'],
  
  // Roots
  roots: ['<rootDir>'],
  
  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  
  // Force exit after tests
  forceExit: false,
  
  // Detect open handles
  detectOpenHandles: false,
}

// Create and export the Jest config
module.exports = createJestConfig(customJestConfig)