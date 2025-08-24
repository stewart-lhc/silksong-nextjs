import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * ESLint Configuration for Next.js + TypeScript
 */
const eslintConfig = [
  // Ignore patterns
  {
    ignores: [
      ".next/**/*",
      "out/**/*",
      "dist/**/*",
      "build/**/*",
      "node_modules/**/*",
      "*.tsbuildinfo",
      "next-env.d.ts",
      ".vercel/**/*",
      "coverage/**/*",
      "__mocks__/**/*",
      "*.log",
    ],
  },
  
  // Base configurations
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript"
  ),
  
  // Global configuration
  {
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { 
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      
      // React specific rules
      "react/prop-types": "off", // TypeScript handles this
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
      "react/display-name": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // General rules
      "prefer-const": "error",
      "no-var": "error",
      "no-console": [
        "warn", 
        { 
          allow: ["warn", "error", "info"],
        },
      ],
      "no-debugger": "error",
      "no-unused-expressions": [
        "error",
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
    },
  },
  
  // Configuration files overrides
  {
    files: [
      "next.config.js",
      "tailwind.config.js",
      "postcss.config.js",
      "*.config.ts",
      "*.config.js",
      "*.config.mjs",
    ],
    rules: {
      "@typescript-eslint/no-var-requires": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
];

export default eslintConfig;