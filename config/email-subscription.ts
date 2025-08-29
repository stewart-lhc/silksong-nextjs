/**
 * Email Subscription System Default Configuration
 * Provides sensible defaults that can be overridden per project
 */

import { SubscriptionConfig, SubscriptionTheme } from '@/types/email-subscription';

export const DEFAULT_SUBSCRIPTION_CONFIG: SubscriptionConfig = {
  endpoints: {
    subscribe: '/api/subscribe',
    count: '/api/subscriptions/count',
    unsubscribe: '/api/unsubscribe',
  },
  
  rateLimit: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    minTimeBetweenSubmissions: 5000, // 5 seconds
  },
  
  validation: {
    emailMaxLength: 254,
    requireConfirmation: false,
    allowedDomains: [],
    blockedDomains: [
      '10minutemail.com',
      'temp-mail.org',
      'guerrillamail.com',
      'mailinator.com',
      'yopmail.com',
    ],
  },
  
  ui: {
    showCount: true,
    showSuccessMessage: true,
    autoResetAfterSuccess: 3000,
    theme: 'auto',
  },
  
  messages: {
    success: 'Successfully subscribed! Thank you for joining us.',
    error: 'Something went wrong. Please try again.',
    alreadySubscribed: 'This email is already subscribed.',
    invalidEmail: 'Please enter a valid email address.',
    rateLimit: 'Please wait a moment before subscribing again.',
  },
};

export const DEFAULT_SUBSCRIPTION_THEME: SubscriptionTheme = {
  colors: {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    success: 'hsl(142, 76%, 36%)',
    error: 'hsl(var(--destructive))',
    background: 'hsl(var(--background))',
    text: 'hsl(var(--foreground))',
    border: 'hsl(var(--border))',
  },
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontSize: {
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      bold: '600',
    },
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
  },
};

// Environment-specific configurations
export const DEVELOPMENT_CONFIG: Partial<SubscriptionConfig> = {
  rateLimit: {
    maxRequests: 10,
    windowMs: 5 * 60 * 1000, // 5 minutes for development
    minTimeBetweenSubmissions: 1000, // 1 second
  },
  validation: {
    emailMaxLength: 254,
    blockedDomains: [], // Allow all domains in development
  },
};

export const PRODUCTION_CONFIG: Partial<SubscriptionConfig> = {
  rateLimit: {
    maxRequests: 3,
    windowMs: 20 * 60 * 1000, // 20 minutes
    minTimeBetweenSubmissions: 10000, // 10 seconds
  },
  validation: {
    emailMaxLength: 254,
    requireConfirmation: true,
  },
};

// Utility function to merge configurations
export function mergeConfigs(
  base: SubscriptionConfig,
  override: Partial<SubscriptionConfig>
): SubscriptionConfig {
  return {
    endpoints: { ...base.endpoints, ...override.endpoints },
    rateLimit: { ...base.rateLimit, ...override.rateLimit },
    validation: { ...base.validation, ...override.validation },
    ui: { ...base.ui, ...override.ui },
    messages: { ...base.messages, ...override.messages },
  };
}

// Get configuration based on environment
export function getEnvironmentConfig(): SubscriptionConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const baseConfig = DEFAULT_SUBSCRIPTION_CONFIG;
  const envConfig = isDevelopment ? DEVELOPMENT_CONFIG : PRODUCTION_CONFIG;
  
  return mergeConfigs(baseConfig, envConfig);
}