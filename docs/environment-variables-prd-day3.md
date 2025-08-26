# Environment Variables - PRD Day3 Implementation

## Overview

This document outlines the enhanced environment variable system implemented for PRD Day3, featuring strict validation, comprehensive type safety, and advanced configuration management.

## Architecture

### Core Components

1. **`lib/env.ts`** - Main environment validation and configuration
2. **`types/env.ts`** - Advanced TypeScript type definitions
3. **`.env.example`** - Complete environment variable reference
4. **`scripts/validate-env.js`** - Standalone validation script

### Key Features

- ✅ **Strict Validation** - Zod-based schema validation with detailed error messages
- ✅ **Type Safety** - Comprehensive TypeScript types for all environment variables
- ✅ **Conditional Requirements** - Smart validation based on configuration context
- ✅ **Production Warnings** - Environment-specific validation rules
- ✅ **Utility Functions** - Helper functions for common operations
- ✅ **Development Insights** - Rich logging for development environment

## PRD Day3 Required Variables

### Internationalization (Required)

```bash
# Comma-separated ISO 639-1 locale codes
SUPPORTED_LOCALES="en,zh"

# Default locale must be included in SUPPORTED_LOCALES
DEFAULT_LOCALE="en"
```

**Validation Rules:**
- `SUPPORTED_LOCALES` must match pattern: `/^[a-z]{2}(,[a-z]{2})*$/`
- `DEFAULT_LOCALE` must match pattern: `/^[a-z]{2}$/`
- `DEFAULT_LOCALE` must be included in `SUPPORTED_LOCALES`

### Silksong Release Configuration (Required)

```bash
# ISO 8601 datetime string for release date
SILKSONG_RELEASE_ISO="2025-09-04T00:00:00Z"
```

**Validation Rules:**
- Must be valid ISO 8601 format with 'T' and 'Z' suffix
- Warning if date is in the past
- Used for countdown functionality

### OpenGraph Font Configuration (Required)

```bash
# Primary font for OpenGraph images
OG_FONT_PRIMARY="Inter"

# Fallback font (optional)
OG_FONT_FALLBACK="Noto Sans"

# Whether to fail build if fonts are missing
FAIL_ON_OG_FONT_MISSING="false"
```

**Validation Rules:**
- `OG_FONT_PRIMARY` is required and must not be empty
- `OG_FONT_FALLBACK` is optional
- Warning if `FAIL_ON_OG_FONT_MISSING` is true but no fallback is provided

### Email Configuration (Conditionally Required)

```bash
# Email transport method
EMAIL_TRANSPORT="mock"

# Sender email (required if EMAIL_TRANSPORT != "mock")
EMAIL_SENDER="noreply@site.com"
```

**Validation Rules:**
- `EMAIL_TRANSPORT` must be one of: `mock`, `smtp`, `sendgrid`, `ses`
- `EMAIL_SENDER` is required when `EMAIL_TRANSPORT` is not `mock`
- `EMAIL_SENDER` must be valid email format

### Security (Required)

```bash
# Site hash salt (minimum 32 characters)
SITE_HASH_SALT="your-random-32-character-salt-here-change-me-in-production"
```

**Validation Rules:**
- Must be at least 32 characters long
- Warning if less than 64 characters in production
- Used for generating secure hashes

### Logging Configuration (Required)

```bash
# Log storage mode
LOG_STORAGE_MODE="ephemeral"

# Enable/disable logging
ENABLE_LOGGING="true"
```

**Validation Rules:**
- `LOG_STORAGE_MODE` must be one of: `ephemeral`, `persistent`, `file`
- `ENABLE_LOGGING` must be `true` or `false`
- Warning if using `ephemeral` in production

### Deployment Configuration (Optional)

```bash
# Deployment environment
DEPLOY_ENV="local"
```

**Validation Rules:**
- Must be one of: `local`, `staging`, `production`
- Defaults to `local`
- Affects validation behavior and feature flags

## TypeScript Integration

### Basic Usage

```typescript
import { env, localization, silksongRelease } from '@/lib/env';

// Type-safe access to environment variables
const appUrl = env.NEXT_PUBLIC_APP_URL; // string
const supportedLocales = localization.supportedLocales; // SupportedLocale[]
const releaseDate = silksongRelease.date; // Date
```

### Configuration Objects

```typescript
import { 
  emailConfig, 
  security, 
  logging, 
  deployment 
} from '@/lib/env';

// Email configuration
if (!emailConfig.isMockMode) {
  // Send real email
}

// Security utilities
const hashedValue = utils.hashWithSalt(input);

// Logging configuration
if (logging.enabled && logging.isPersistent) {
  // Store logs persistently
}

// Environment-specific behavior
if (deployment.isProduction) {
  // Production-only logic
}
```

### Utility Functions

```typescript
import { utils, validators } from '@/lib/env';

// Time utilities
const timeUntilRelease = utils.getTimeUntilRelease(); // number (ms)
const isReleased = utils.isSilksongReleased(); // boolean
const envName = utils.getEnvironmentDisplayName(); // string

// Validators
const isValidLocale = validators.isValidLocale('en'); // boolean
const isValidTransport = validators.isValidEmailTransport('mock'); // boolean
```

## Advanced Types

### Environment Variable Types

```typescript
import type { 
  SupportedLocale, 
  EmailTransport, 
  LogStorageMode, 
  DeployEnv,
  EnvValidationResult,
  EnvironmentConfig
} from '@/types/env';

// Use in your components
function LocaleSwitcher({ locale }: { locale: SupportedLocale }) {
  // Type-safe locale handling
}
```

### Validation Types

```typescript
import type { 
  EnvValidationError, 
  EnvValidationReport 
} from '@/types/env';

// Custom validation logic
function validateCustomEnv(): EnvValidationReport {
  // Implementation
}
```

## Validation Scripts

### Standalone Validation

```bash
# Run environment validation
node scripts/validate-env.js
```

### Build-time Validation

Environment variables are automatically validated during:
- Next.js build process
- Development server startup
- TypeScript compilation

### Validation Output Example

```
🔧 PRD Day3 Environment Variable Validation

=== PRD Day3 Required Variables ===
✅ SUPPORTED_LOCALES: en,zh
   Description: Comma-separated ISO 639-1 locale codes

✅ DEFAULT_LOCALE: en
   Description: Default locale (ISO 639-1 code)

...

=== Conditional Validations ===
✅ Email configuration is valid
✅ Locale configuration is valid
✅ Silksong releases in 9 days

=== Validation Summary ===
✅ All environment variables are valid!
```

## Development Features

### Rich Console Output

In development mode, the environment system provides detailed logging:

```
🔧 Environment Configuration (PRD Day3):
{
  environment: "💻 Local Development",
  localization: {
    default: "en",
    supported: ["en", "zh"],
    isMultiLanguage: true
  },
  silksongRelease: {
    date: "9/4/2025",
    isReleased: false,
    timeUntil: "9 days"
  },
  email: {
    transport: "mock",
    isMockMode: true,
    hasSender: true
  }
}
```

### Error Messages

Validation errors provide clear, actionable feedback:

```
❌ Environment validation failed:

SUPPORTED_LOCALES: SUPPORTED_LOCALES must be comma-separated ISO 639-1 codes (e.g., "en,zh")
EMAIL_SENDER: EMAIL_SENDER is required when EMAIL_TRANSPORT is "smtp" (not "mock")

Please check your .env.local file and ensure all required variables are set correctly.
Refer to .env.example for required variables.
```

## Production Considerations

### Security Recommendations

1. **Hash Salt**: Use at least 64 characters in production
2. **Secrets**: Never commit real secrets to version control
3. **Email Transport**: Use proper SMTP/SendGrid/SES in production
4. **Logging**: Use `persistent` or `file` storage mode

### Performance Optimizations

1. **Validation Caching**: Environment validation occurs once at startup
2. **Type Inference**: TypeScript types are computed at compile time
3. **Tree Shaking**: Unused configuration objects are eliminated

### Monitoring

The system provides warnings for:
- Weak security configurations
- Suboptimal production settings
- Missing optional but recommended variables

## Migration Guide

### From Legacy System

1. Add PRD Day3 variables to your `.env.local`:

```bash
# Copy from .env.example and customize
SUPPORTED_LOCALES="en,zh"
DEFAULT_LOCALE="en"
SILKSONG_RELEASE_ISO="2025-09-04T00:00:00Z"
OG_FONT_PRIMARY="Inter"
EMAIL_TRANSPORT="mock"
SITE_HASH_SALT="your-secure-salt-here"
LOG_STORAGE_MODE="ephemeral"
```

2. Update imports in your code:

```typescript
// Before
import { env } from '@/lib/env';

// After (more features available)
import { 
  env, 
  localization, 
  silksongRelease, 
  utils 
} from '@/lib/env';
```

3. Run validation:

```bash
npm run validate-env
```

### Breaking Changes

- `SUPPORTED_LOCALES` format changed from legacy to PRD Day3 format
- New required variables must be added
- Some utility functions have new signatures

## Troubleshooting

### Common Issues

1. **Validation Errors**: Check `.env.local` format and required variables
2. **Type Errors**: Ensure you're importing from the correct paths
3. **Build Failures**: Run standalone validation script first

### Debug Commands

```bash
# Validate environment variables
node scripts/validate-env.js

# Test TypeScript integration
npm run type-check

# Check development server logs
npm run dev
```

## API Reference

### Core Exports

- `env` - Validated environment variables
- `localization` - Internationalization configuration
- `silksongRelease` - Release date configuration
- `emailConfig` - Email transport configuration
- `security` - Security configuration
- `logging` - Logging configuration
- `deployment` - Deployment configuration
- `utils` - Utility functions
- `validators` - Type-safe validators

### Type Exports

- `SupportedLocale` - Valid locale codes
- `EmailTransport` - Email transport options
- `LogStorageMode` - Log storage options
- `DeployEnv` - Deployment environments
- `EnvValidationResult` - Validation result type
- `EnvironmentConfig` - Complete environment configuration

---

*This documentation is part of the PRD Day3 implementation. For questions or issues, refer to the project README or create an issue in the repository.*