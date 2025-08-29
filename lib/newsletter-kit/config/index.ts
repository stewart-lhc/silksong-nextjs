/**
 * Newsletter Kit - Configuration Management System
 * Flexible, type-safe configuration with intelligent defaults
 * 
 * @version 1.0.0
 */

import type { 
  NewsletterConfig, 
  DatabaseAdapter, 
  DEFAULT_MESSAGES,
  DEFAULT_RATE_LIMIT,
  ISOTimestamp
} from '../types';

// ========================= DEFAULT CONFIGURATION =========================
export const createDefaultConfig = (): NewsletterConfig => ({
  database: {
    adapter: null as any, // Will be provided by user
    tableName: 'newsletter_subscriptions',
  },
  
  api: {
    baseUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    endpoints: {
      subscribe: '/api/newsletter/subscribe',
      unsubscribe: '/api/newsletter/unsubscribe',
      stats: '/api/newsletter/stats',
    },
    timeout: 10000, // 10 seconds
    retries: 3,
  },
  
  validation: {
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    allowedDomains: [], // Empty means all domains allowed
    blockedDomains: [
      '10minutemail.com',
      'mailinator.com',
      'guerrillamail.com',
      'tempmail.org',
      'yopmail.com',
    ],
    maxLength: 254,
  },
  
  rateLimit: {
    enabled: true,
    maxRequests: DEFAULT_RATE_LIMIT.maxRequests,
    windowMs: DEFAULT_RATE_LIMIT.windowMs,
    skipSuccessfulRequests: true,
  },
  
  ui: {
    theme: 'auto',
    variant: 'default',
    size: 'md',
    showCount: true,
  },
  
  messages: { ...DEFAULT_MESSAGES },
  
  analytics: {
    trackSubscriptions: true,
    trackErrors: true,
    customEvents: {},
  },
});

// ========================= ENVIRONMENT-SPECIFIC CONFIGS =========================
export const createDevelopmentConfig = (): Partial<NewsletterConfig> => ({
  api: {
    baseUrl: 'http://localhost:3000',
    timeout: 30000, // Longer timeout for development
    retries: 1,
    endpoints: {
      subscribe: '/api/dev/newsletter/subscribe',
      unsubscribe: '/api/dev/newsletter/unsubscribe', 
      stats: '/api/dev/newsletter/stats',
    },
  },
  rateLimit: {
    enabled: false, // Disable for development
    maxRequests: 100,
    windowMs: 60000,
  },
  analytics: {
    trackSubscriptions: false,
    trackErrors: true,
  },
});

export const createProductionConfig = (): Partial<NewsletterConfig> => ({
  api: {
    timeout: 5000, // Stricter timeout in production
    retries: 2,
  },
  rateLimit: {
    enabled: true,
    maxRequests: 3, // Stricter rate limiting
    windowMs: 300000, // 5 minutes
    skipSuccessfulRequests: false,
  },
  validation: {
    blockedDomains: [
      // Extended list for production
      '10minutemail.com',
      'mailinator.com',
      'guerrillamail.com',
      'tempmail.org',
      'yopmail.com',
      'throwaway.email',
      'maildrop.cc',
      'temp-mail.org',
    ],
  },
  analytics: {
    trackSubscriptions: true,
    trackErrors: true,
  },
});

// ========================= CONFIGURATION MERGER =========================
export const mergeConfigs = (
  base: NewsletterConfig,
  ...overrides: Partial<NewsletterConfig>[]
): NewsletterConfig => {
  return overrides.reduce((result, override) => {
    return {
      ...result,
      database: { ...result.database, ...override.database },
      api: {
        ...result.api,
        ...override.api,
        endpoints: {
          ...result.api.endpoints,
          ...override.api?.endpoints,
        },
      },
      validation: { ...result.validation, ...override.validation },
      rateLimit: { ...result.rateLimit, ...override.rateLimit },
      ui: { ...result.ui, ...override.ui },
      messages: { ...result.messages, ...override.messages },
      analytics: { ...result.analytics, ...override.analytics },
    };
  }, base);
};

// ========================= CONFIGURATION FACTORY =========================
export const createNewsletterConfig = (
  userConfig: Partial<NewsletterConfig> = {},
  environment: 'development' | 'production' | 'test' = 'production'
): NewsletterConfig => {
  const baseConfig = createDefaultConfig();
  
  const envConfig = environment === 'development' 
    ? createDevelopmentConfig()
    : environment === 'production'
    ? createProductionConfig()
    : {}; // test environment uses defaults
    
  return mergeConfigs(baseConfig, envConfig, userConfig);
};

// ========================= CONFIGURATION VALIDATION =========================
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateConfig = (config: NewsletterConfig): ConfigValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Database validation
  if (!config.database.adapter) {
    errors.push('Database adapter is required');
  }
  
  if (!config.database.tableName) {
    errors.push('Database table name is required');
  }
  
  // API validation
  if (!config.api.baseUrl) {
    errors.push('API base URL is required');
  }
  
  if (config.api.timeout < 1000) {
    warnings.push('API timeout is very low (< 1 second)');
  }
  
  if (config.api.retries < 0 || config.api.retries > 10) {
    warnings.push('API retries should be between 0-10');
  }
  
  // Validation rules
  if (!config.validation.emailRegex) {
    errors.push('Email validation regex is required');
  }
  
  if (config.validation.maxLength < 5 || config.validation.maxLength > 1000) {
    warnings.push('Email max length should be between 5-1000 characters');
  }
  
  // Rate limiting validation
  if (config.rateLimit.enabled) {
    if (config.rateLimit.maxRequests < 1) {
      errors.push('Rate limit max requests must be >= 1');
    }
    
    if (config.rateLimit.windowMs < 1000) {
      errors.push('Rate limit window must be >= 1 second');
    }
  }
  
  // Messages validation
  const requiredMessages = [
    'placeholder', 'submitText', 'loadingText', 'successText',
    'alreadySubscribed', 'invalidEmail', 'networkError', 'serverError'
  ];
  
  for (const key of requiredMessages) {
    if (!config.messages[key as keyof typeof config.messages]) {
      warnings.push(`Missing message: ${key}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

// ========================= CONFIGURATION PRESETS =========================
export const configPresets = {
  // Minimal setup for quick starts
  minimal: (): Partial<NewsletterConfig> => ({
    ui: {
      theme: 'light',
      variant: 'minimal',
      size: 'sm',
      showCount: false,
    },
    messages: {
      placeholder: 'Email',
      submitText: 'Join',
      loadingText: '...',
      successText: 'Done!',
      alreadySubscribed: 'Already joined!',
      invalidEmail: 'Invalid email',
      networkError: 'Try again',
      serverError: 'Error',
      rateLimitExceeded: 'Wait a moment',
    },
  }),
  
  // Professional/business setup
  professional: (): Partial<NewsletterConfig> => ({
    ui: {
      theme: 'light',
      variant: 'outlined',
      size: 'lg',
      showCount: true,
    },
    validation: {
      blockedDomains: [
        '10minutemail.com', 'mailinator.com', 'guerrillamail.com',
        'tempmail.org', 'yopmail.com', 'throwaway.email',
      ],
    },
    messages: {
      placeholder: 'Enter your professional email',
      submitText: 'Subscribe to Newsletter',
      loadingText: 'Processing...',
      successText: 'Welcome! Check your email for confirmation.',
      alreadySubscribed: 'You\'re already part of our community!',
      invalidEmail: 'Please provide a valid email address',
      networkError: 'Connection issue. Please try again.',
      serverError: 'We\'re experiencing technical difficulties.',
      rateLimitExceeded: 'Please wait before submitting again.',
    },
  }),
  
  // Modern/trendy setup
  modern: (): Partial<NewsletterConfig> => ({
    ui: {
      theme: 'dark',
      variant: 'modern',
      size: 'md',
      showCount: true,
    },
    messages: {
      placeholder: '✨ Your email here',
      submitText: '🚀 Join the crew',
      loadingText: '⏳ Magic happening...',
      successText: '🎉 You\'re in! Welcome aboard!',
      alreadySubscribed: '👋 Hey there, you\'re already with us!',
      invalidEmail: '🤔 That doesn\'t look like an email',
      networkError: '📡 Connection hiccup, try again?',
      serverError: '🔧 We\'re fixing this, hang tight!',
      rateLimitExceeded: '⏸️ Slow down there, try again in a moment',
    },
  }),
  
  // High-security setup
  secure: (): Partial<NewsletterConfig> => ({
    rateLimit: {
      enabled: true,
      maxRequests: 2,
      windowMs: 600000, // 10 minutes
      skipSuccessfulRequests: false,
    },
    validation: {
      allowedDomains: [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
        'protonmail.com', 'icloud.com', 'fastmail.com',
      ],
      blockedDomains: [
        '10minutemail.com', 'mailinator.com', 'guerrillamail.com',
        'tempmail.org', 'yopmail.com', 'throwaway.email',
        'maildrop.cc', 'temp-mail.org', 'sharklasers.com',
      ],
    },
    api: {
      timeout: 3000, // Shorter timeout
      retries: 1,
    },
  }),
} as const;

// ========================= CONFIGURATION UTILITIES =========================
export const getConfigForEnvironment = (
  env: string = process.env.NODE_ENV || 'development'
): Partial<NewsletterConfig> => {
  switch (env) {
    case 'development':
      return createDevelopmentConfig();
    case 'production':
      return createProductionConfig();
    case 'test':
      return {
        api: { baseUrl: 'http://localhost:3000' },
        rateLimit: { enabled: false },
        analytics: { trackSubscriptions: false, trackErrors: false },
      };
    default:
      return {};
  }
};

export const applyPreset = (
  config: Partial<NewsletterConfig>,
  presetName: keyof typeof configPresets
): Partial<NewsletterConfig> => {
  const preset = configPresets[presetName]();
  return mergeConfigs(createDefaultConfig(), preset, config);
};

// ========================= ENVIRONMENT VARIABLES INTEGRATION =========================
export const loadConfigFromEnv = (): Partial<NewsletterConfig> => {
  const env = process.env;
  
  return {
    api: {
      baseUrl: env.NEXT_PUBLIC_NEWSLETTER_API_URL,
      timeout: env.NEWSLETTER_API_TIMEOUT ? parseInt(env.NEWSLETTER_API_TIMEOUT) : undefined,
    },
    validation: {
      maxLength: env.NEWSLETTER_EMAIL_MAX_LENGTH ? parseInt(env.NEWSLETTER_EMAIL_MAX_LENGTH) : undefined,
    },
    rateLimit: {
      enabled: env.NEWSLETTER_RATE_LIMIT_ENABLED !== 'false',
      maxRequests: env.NEWSLETTER_RATE_LIMIT_MAX ? parseInt(env.NEWSLETTER_RATE_LIMIT_MAX) : undefined,
      windowMs: env.NEWSLETTER_RATE_LIMIT_WINDOW ? parseInt(env.NEWSLETTER_RATE_LIMIT_WINDOW) : undefined,
    },
    ui: {
      theme: (env.NEXT_PUBLIC_NEWSLETTER_THEME as any) || 'auto',
      showCount: env.NEXT_PUBLIC_NEWSLETTER_SHOW_COUNT !== 'false',
    },
    analytics: {
      trackSubscriptions: env.NEWSLETTER_ANALYTICS_TRACK_SUBSCRIPTIONS !== 'false',
      trackErrors: env.NEWSLETTER_ANALYTICS_TRACK_ERRORS !== 'false',
    },
  };
};

// ========================= CONFIG BUILDER CLASS =========================
export class NewsletterConfigBuilder {
  private config: Partial<NewsletterConfig> = {};
  
  // Database configuration
  withDatabase(adapter: DatabaseAdapter, tableName = 'newsletter_subscriptions') {
    this.config.database = { adapter, tableName };
    return this;
  }
  
  // API configuration
  withApi(baseUrl: string, endpoints?: Partial<NewsletterConfig['api']['endpoints']>) {
    this.config.api = {
      baseUrl,
      endpoints: { ...createDefaultConfig().api.endpoints, ...endpoints },
      timeout: 10000,
      retries: 3,
    };
    return this;
  }
  
  // UI configuration
  withUI(
    theme: NewsletterConfig['ui']['theme'] = 'auto',
    variant: NewsletterConfig['ui']['variant'] = 'default',
    size: NewsletterConfig['ui']['size'] = 'md'
  ) {
    this.config.ui = { theme, variant, size, showCount: true };
    return this;
  }
  
  // Apply preset
  withPreset(presetName: keyof typeof configPresets) {
    const preset = configPresets[presetName]();
    this.config = mergeConfigs(createDefaultConfig(), this.config, preset);
    return this;
  }
  
  // Custom messages
  withMessages(messages: Partial<NewsletterConfig['messages']>) {
    this.config.messages = { ...createDefaultConfig().messages, ...messages };
    return this;
  }
  
  // Rate limiting
  withRateLimit(maxRequests: number, windowMs: number) {
    this.config.rateLimit = { enabled: true, maxRequests, windowMs, skipSuccessfulRequests: true };
    return this;
  }
  
  // Build final config
  build(environment: 'development' | 'production' | 'test' = 'production'): NewsletterConfig {
    return createNewsletterConfig(this.config, environment);
  }
}

// ========================= EXPORTS =========================
// Functions and types are already exported above

// Convenience builder
export const config = () => new NewsletterConfigBuilder();

// ========================= TYPE ASSERTIONS =========================
export const isValidConfig = (config: any): config is NewsletterConfig => {
  try {
    const validation = validateConfig(config);
    return validation.valid;
  } catch {
    return false;
  }
};