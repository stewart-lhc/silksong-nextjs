/**
 * Prettier Configuration for Silk Song Archive Next.js
 * Enforces consistent code formatting across the project
 */

/** @type {import('prettier').Config} */
const prettierConfig = {
  // ===== CORE SETTINGS =====
  
  // Line length and wrapping
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  
  // Semicolons and quotes
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  
  // JSX specific
  jsxSingleQuote: true,
  
  // Trailing commas for better diffs
  trailingComma: 'es5',
  
  // Bracket spacing
  bracketSpacing: true,
  bracketSameLine: false,
  
  // Arrow functions
  arrowParens: 'avoid',
  
  // ===== PROSE AND MARKDOWN =====
  
  // Prose wrapping for better readability
  proseWrap: 'preserve',
  
  // HTML formatting
  htmlWhitespaceSensitivity: 'css',
  
  // Vue files (if needed in future)
  vueIndentScriptAndStyle: true,
  
  // End of line normalization
  endOfLine: 'lf',
  
  // Embedded language formatting
  embeddedLanguageFormatting: 'auto',
  
  // Single attribute per line in JSX (when exceeds print width)
  singleAttributePerLine: false,
  
  // ===== PLUGIN CONFIGURATIONS =====
  
  // Tailwind CSS plugin configuration
  tailwindConfig: './tailwind.config.ts',
  tailwindAttributes: ['className'],
  tailwindFunctions: ['clsx', 'cn', 'cva'],
  
  // ===== FILE TYPE OVERRIDES =====
  
  overrides: [
    // JSON files
    {
      files: '*.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
    
    // Markdown files
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always',
        tabWidth: 2,
      },
    },
    
    // YAML files
    {
      files: ['*.yml', '*.yaml'],
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    
    // CSS/SCSS files
    {
      files: ['*.css', '*.scss'],
      options: {
        singleQuote: false,
        tabWidth: 2,
      },
    },
    
    // JSX/TSX files
    {
      files: ['*.jsx', '*.tsx'],
      options: {
        jsxSingleQuote: true,
        bracketSameLine: false,
        htmlWhitespaceSensitivity: 'ignore',
      },
    },
    
    // Configuration files
    {
      files: [
        '*.config.js',
        '*.config.ts',
        '*.config.mjs',
        '.eslintrc.*',
        'next.config.js',
        'tailwind.config.*',
      ],
      options: {
        printWidth: 120,
        singleQuote: true,
      },
    },
    
    // Package.json for better readability
    {
      files: 'package.json',
      options: {
        printWidth: 120,
        tabWidth: 2,
      },
    },
    
    // Environment files
    {
      files: '.env*',
      options: {
        printWidth: 120,
      },
    },
    
    // SQL files (for migrations)
    {
      files: '*.sql',
      options: {
        printWidth: 120,
        tabWidth: 2,
        singleQuote: true,
      },
    },
  ],
  
  // ===== PLUGIN LIST =====
  plugins: [
    'prettier-plugin-tailwindcss', // Must be last for proper ordering
  ],
};

module.exports = prettierConfig;