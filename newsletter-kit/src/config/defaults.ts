/**
 * 默认配置和常量
 */

import type { NewsletterConfig } from '../types';

export const DEFAULT_CONFIG: NewsletterConfig = {
  // Database
  tableName: 'email_subscriptions',
  
  // Rate limiting
  rateLimit: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    duplicateEmailWindowMs: 60 * 1000, // 1 minute
  },
  
  // Validation
  validation: {
    maxEmailLength: 254,
    customEmailRegex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  },
  
  // Theme
  theme: {
    colors: {
      primary: 'hsl(221.2 83.2% 53.3%)',
      secondary: 'hsl(210 40% 98%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(222.2 84% 4.9%)',
      muted: 'hsl(210 40% 96%)',
      border: 'hsl(214.3 31.8% 91.4%)',
      input: 'hsl(214.3 31.8% 91.4%)',
      ring: 'hsl(221.2 83.2% 53.3%)',
      destructive: 'hsl(0 84.2% 60.2%)',
    },
    fonts: {
      sans: ['system-ui', 'sans-serif'],
      mono: ['Consolas', 'monospace'],
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
    },
    variants: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      minimal: 'bg-transparent border border-input hover:bg-accent hover:text-accent-foreground',
      outlined: 'border border-primary text-primary hover:bg-primary hover:text-primary-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
    },
  },
  
  // Messages
  messages: {
    success: 'Successfully subscribed! Thank you for joining.',
    error: 'An error occurred. Please try again.',
    alreadySubscribed: 'This email is already subscribed.',
    rateLimit: 'Too many requests. Please wait before trying again.',
    invalidEmail: 'Please enter a valid email address.',
    placeholder: 'Enter your email address',
    submitButton: 'Subscribe',
    loadingButton: 'Subscribing...',
  },
};

export const SUPPORTED_FRAMEWORKS = {
  'next.js': {
    name: 'Next.js',
    versions: ['^13.0.0', '^14.0.0', '^15.0.0'],
    features: ['app-router', 'pages-router', 'api-routes'],
  },
  'react': {
    name: 'React',
    versions: ['^18.0.0', '^19.0.0'],
    features: ['hooks', 'context'],
  },
} as const;

export const SUPPORTED_DATABASES = {
  supabase: {
    name: 'Supabase',
    icon: '🔗',
    features: ['realtime', 'auth', 'storage'],
    envVars: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
  },
  planetscale: {
    name: 'PlanetScale',
    icon: '🌍',
    features: ['mysql', 'branching'],
    envVars: ['DATABASE_URL'],
  },
  neon: {
    name: 'Neon',
    icon: '⚡',
    features: ['postgresql', 'serverless'],
    envVars: ['DATABASE_URL'],
  },
} as const;

export const COMPONENT_VARIANTS = {
  form: {
    name: 'Newsletter Form',
    description: 'Basic subscription form with validation',
    props: ['showCount', 'variant', 'size'],
  },
  minimal: {
    name: 'Minimal Form',
    description: 'Clean, minimal design with essential features',
    props: ['placeholder', 'submitText'],
  },
  inline: {
    name: 'Inline Form',
    description: 'Horizontal layout for headers/footers',
    props: ['layout', 'alignment'],
  },
  modal: {
    name: 'Modal Form',
    description: 'Popup/modal subscription form',
    props: ['trigger', 'title', 'description'],
  },
  hero: {
    name: 'Hero Form',
    description: 'Large form for landing pages',
    props: ['size', 'showCount', 'background'],
  },
  count: {
    name: 'Subscriber Count',
    description: 'Display current subscriber count',
    props: ['format', 'prefix', 'suffix'],
  },
} as const;

export const API_ENDPOINTS = {
  subscribe: '/api/newsletter/subscribe',
  count: '/api/newsletter/count',
  unsubscribe: '/api/newsletter/unsubscribe',
} as const;

export const ERROR_CODES = {
  INVALID_EMAIL: 'INVALID_EMAIL',
  ALREADY_SUBSCRIBED: 'ALREADY_SUBSCRIBED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
} as const;