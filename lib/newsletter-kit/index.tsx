/**
 * Newsletter Kit - Complete Email Subscription System
 * A comprehensive, reusable, and type-safe newsletter subscription component library
 * 
 * @version 1.0.0
 * @author Your Name
 * @license MIT
 * 
 * Features:
 * - ✅ Complete React component library with hooks
 * - ✅ Multiple database adapters (Supabase, PostgreSQL, MySQL, SQLite)
 * - ✅ Type-safe API with full TypeScript support  
 * - ✅ Flexible configuration management
 * - ✅ Built-in validation and error handling
 * - ✅ Rate limiting and security features
 * - ✅ Analytics and monitoring
 * - ✅ Comprehensive testing suite
 * - ✅ Accessibility compliant (WCAG 2.1)
 * - ✅ Production ready
 */

'use client';

import React from 'react';

// ========================= MAIN EXPORTS =========================

// Types
export type {
  // Core types
  NewsletterConfig,
  BaseSubscription,
  ExtendedSubscription,
  SubscriptionStatus,
  SubscriptionResult,
  SubscriptionError,
  ValidatedEmail,
  SubscriberCount,
  
  // Component props
  SubscriptionFormProps,
  SubscriptionModalProps,
  SubscriptionToastProps,
  NewsletterProviderProps,
  
  // Hook returns
  UseSubscriptionReturn,
  UseSubscriptionStatsReturn,
  UseNewsletterModalReturn,
  UseNewsletterToastReturn,
  
  // Database types
  DatabaseAdapter,
  PaginatedSubscriptions,
  DatabaseHealthStatus,
  
  // API types
  SubscribeRequest,
  SubscribeResponse,
  StatsResponse,
  
  // Utility types
  EmailValidationResult,
  EmailSuggestion,
} from './types';

// Configuration
export {
  createNewsletterConfig,
  createDefaultConfig,
  validateConfig,
  configPresets,
  NewsletterConfigBuilder,
  config,
} from './config';

// Components
export {
  NewsletterKit,
  NewsletterProvider,
  NewsletterForm,
  NewsletterModal,
  NewsletterToast,
  NewsletterFormMinimal,
  NewsletterFormModern,
  NewsletterFormOutlined,
  NewsletterModalSimple,
  NewsletterModalModern,
  NewsletterModalPromo,
  NewsletterModalTrigger,
  NewsletterToastSuccess,
  NewsletterToastError,
  NewsletterToastContainer,
} from './components';

// Hooks
export {
  useNewsletter,
  useNewsletterStats,
  useEmailValidation,
  useNewsletterPersistence,
  useNewsletterConfig,
  useNewsletterModal,
  useNewsletterToast,
} from './hooks';

// Utilities
export {
  cn,
  validateEmail,
  generateEmailSuggestions,
  isDisposableEmail,
  createSubscriptionError,
  formatErrorMessage,
  formatSubscriberCount,
  formatDate,
  formatRelativeTime,
  ClientRateLimit,
  storage,
  debounce,
  trackEvent,
  generateId,
  announceToScreenReader,
  isValidUUID,
  isValidISOTimestamp,
  sanitizeHtml,
  isDevelopment,
  isBrowser,
  prefersReducedMotion,
} from './utils';

// Database
export {
  createSupabaseClient,
  createPostgreSQLClient,
  createMySQLClient,
  createSQLiteClient,
  NewsletterDatabaseClient,
  runMigrations,
  createBackup,
  monitorDatabase,
  healthCheck,
} from './database';

// ========================= QUICK START PRESETS =========================

/**
 * Quick start configuration for common use cases
 */
export const QuickStart = {
  /**
   * Minimal setup - Perfect for simple newsletters
   * 
   * @example
   * ```tsx
   * import { QuickStart } from '@/lib/newsletter-kit';
   * 
   * export default function Newsletter() {
   *   return <QuickStart.Simple supabaseUrl="..." supabaseKey="..." />;
   * }
   * ```
   */
  Simple: ({ supabaseUrl, supabaseKey, ...props }: {
    supabaseUrl: string;
    supabaseKey: string;
  } & Partial<SubscriptionFormProps>) => {
    const { NewsletterKit, createNewsletterConfig, createSupabaseClient } = require('./index');
    
    const config = createNewsletterConfig({
      database: {
        adapter: createSupabaseClient(supabaseUrl, supabaseKey),
      },
      ui: {
        variant: 'minimal',
        size: 'sm',
        showCount: false,
      },
    });
    
    return (
      <NewsletterKit.Provider config={config}>
        <NewsletterKit.Form {...props} />
      </NewsletterKit.Provider>
    );
  },
  
  /**
   * Professional setup - Great for business websites
   */
  Professional: ({ supabaseUrl, supabaseKey, ...props }: {
    supabaseUrl: string;
    supabaseKey: string;
  } & Partial<SubscriptionFormProps>) => {
    const { NewsletterKit, configPresets, createNewsletterConfig, createSupabaseClient } = require('./index');
    
    const config = createNewsletterConfig({
      database: {
        adapter: createSupabaseClient(supabaseUrl, supabaseKey),
      },
      ...configPresets.professional(),
    });
    
    return (
      <NewsletterKit.Provider config={config}>
        <NewsletterKit.Form showCount {...props} />
        <NewsletterKit.ToastContainer />
      </NewsletterKit.Provider>
    );
  },
  
  /**
   * Modern setup - Trendy design with emojis
   */
  Modern: ({ supabaseUrl, supabaseKey, ...props }: {
    supabaseUrl: string;
    supabaseKey: string;
  } & Partial<SubscriptionFormProps>) => {
    const { NewsletterKit, configPresets, createNewsletterConfig, createSupabaseClient } = require('./index');
    
    const config = createNewsletterConfig({
      database: {
        adapter: createSupabaseClient(supabaseUrl, supabaseKey),
      },
      ...configPresets.modern(),
    });
    
    return (
      <NewsletterKit.Provider config={config}>
        <NewsletterKit.FormModern showCount {...props} />
        <NewsletterKit.ToastContainer />
      </NewsletterKit.Provider>
    );
  },
};

// ========================= VERSION INFO =========================

export const VERSION = '1.0.0';
export const BUILD_TIME = new Date().toISOString();

// ========================= DEFAULT EXPORT =========================

/**
 * Default export provides the complete Newsletter Kit bundle
 * 
 * @example
 * ```tsx
 * import NewsletterKit from '@/lib/newsletter-kit';
 * 
 * // Use the complete kit
 * const { Provider, Form, Modal, Toast } = NewsletterKit;
 * 
 * // Or use quick start
 * const { QuickStart } = NewsletterKit;
 * ```
 */
export default {
  // All named exports
  ...require('./types'),
  ...require('./config'),
  ...require('./components'),
  ...require('./hooks'),
  ...require('./utils'),
  ...require('./database'),
  
  // Quick start presets
  QuickStart,
  
  // Version info
  VERSION,
  BUILD_TIME,
  
  // Main bundle
  NewsletterKit: require('./components').NewsletterKit,
};