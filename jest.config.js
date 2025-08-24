/**
 * Jest Configuration for Silk Song Archive Next.js
 * Comprehensive testing setup with TypeScript and React Testing Library
 */

const nextJest = require('next/jest');

// Create Jest configuration with Next.js setup
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  // ===== ENVIRONMENT SETUP =====
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // ===== MODULE RESOLUTION =====
  
  // Module name mapping for path aliases
  moduleNameMapper: {
    // Handle path aliases (must match tsconfig.json paths)
    '^@/(.*)$': '<rootDir>/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/utils/(.*)$': '<rootDir>/lib/utils/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/styles/(.*)$': '<rootDir>/styles/$1',
    '^@/config/(.*)$': '<rootDir>/config/$1',
    '^@/data/(.*)$': '<rootDir>/data/$1',
    '^@/assets/(.*)$': '<rootDir>/public/assets/$1',
    '^@/public/(.*)$': '<rootDir>/public/$1',
    
    // Handle CSS modules and static assets
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>/'],
  
  // ===== TEST PATTERNS =====
  
  // Test file patterns
  testMatch: [
    '<rootDir>/**/__tests__/**/*.(ts|tsx|js|jsx)',
    '<rootDir>/**/*.(test|spec).(ts|tsx|js|jsx)',
  ],
  
  // Files to ignore
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/coverage/',
    '<rootDir>/dist/',
    '<rootDir>/out/',
    '<rootDir>/build/',
    '<rootDir>/e2e/',
  ],
  
  // Transform ignore patterns (process these node_modules)
  transformIgnorePatterns: [
    '/node_modules/(?!(.*\\.mjs$|@supabase|@hookform|@tanstack))',
  ],
  
  // ===== COVERAGE CONFIGURATION =====
  
  // Collect coverage information
  collectCoverage: false, // Enable via CLI flag
  
  // Coverage directory
  coverageDirectory: '<rootDir>/coverage',
  
  // Coverage providers
  coverageProvider: 'v8',
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'src/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.config.{ts,js}',
    '!**/*.stories.{ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/out/**',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  
  // ===== REPORTING =====
  
  // Test reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/coverage',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
  ],
  
  // ===== PERFORMANCE =====
  
  // Max worker processes
  maxWorkers: '50%',
  
  // Cache directory
  cacheDirectory: '<rootDir>/.jest/cache',
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // ===== TIMING =====
  
  // Test timeout
  testTimeout: 10000,
  
  // Setup timeout (removed deprecated option)
  // setupFilesAfterEnvTimeout: 30000,
  
  // ===== ERROR HANDLING =====
  
  // Error on deprecated features
  errorOnDeprecated: true,
  
  // Verbose output
  verbose: false,
  
  // ===== WATCH MODE =====
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  
  // ===== GLOBALS =====
  
  // Global variables
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  
  // ===== EXTENSIONS =====
  
  // Preset (handled by next/jest)
  // preset: undefined,
  
  // Transform configuration (handled by next/jest)
  // transform: {},
  
  // ===== CUSTOM MATCHERS =====
  
  // Custom matchers are set up in jest.setup.js
};

// Export Jest configuration created by next/jest
module.exports = createJestConfig(customJestConfig);