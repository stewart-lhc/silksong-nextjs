/**
 * Email Subscription System Types
 * Simplified core types for the unified subscription system based on email_subscriptions table
 */

import { ReactNode } from 'react';

// Core subscription data types - Based on email_subscriptions table structure
export interface EmailSubscription {
  id: string;
  email: string;
  subscribed_at: string;
  source?: string;
  metadata?: Record<string, any>;
  // Additional fields for enhanced functionality
  confirmed_at?: string;
  unsubscribed_at?: string;
  status?: 'pending' | 'confirmed' | 'unsubscribed';
}

// API types
export interface SubscriptionRequest {
  email: string;
  source?: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionResponse {
  success: boolean;
  message: string;
  subscription?: EmailSubscription;
  error?: string;
  code?: string;
  // Transactional email fields
  emailSent?: boolean;
  messageId?: string;
  subscriberCount?: number;
  transactional?: boolean;
}

export interface SubscriptionCountResponse {
  count: number;
  error?: string;
}

// Email service types
export interface EmailSendOptions {
  firstName?: string;
  subscriberCount?: number;
  customData?: Record<string, any>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface TransactionalEmailResult extends EmailResult {
  transactional: boolean;
  deliveryGuarantee: 'email_first' | 'database_first';
}


// Configuration types
export interface SubscriptionConfig {
  // API configuration
  endpoints: {
    subscribe: string;
    count: string;
    unsubscribe?: string;
  };
  
  // Rate limiting
  rateLimit: {
    maxRequests: number;
    windowMs: number;
    minTimeBetweenSubmissions: number;
  };
  
  // Validation
  validation: {
    emailMaxLength: number;
    requireConfirmation?: boolean;
    allowedDomains?: string[];
    blockedDomains?: string[];
  };
  
  // UI configuration
  ui: {
    showCount: boolean;
    showSuccessMessage: boolean;
    autoResetAfterSuccess: number; // milliseconds
    theme: 'light' | 'dark' | 'auto';
  };
  
  // Messages
  messages: {
    success: string;
    error: string;
    alreadySubscribed: string;
    invalidEmail: string;
    rateLimit: string;
  };
}

// Component prop types
export interface BaseSubscriptionProps {
  config?: Partial<SubscriptionConfig>;
  onSuccess?: (subscription: EmailSubscription) => void;
  onError?: (error: string) => void;
  className?: string;
  children?: ReactNode;
}

export interface SubscriptionFormProps extends BaseSubscriptionProps {
  variant?: 'default' | 'compact' | 'minimal';
  placeholder?: string;
  buttonText?: string;
  showCount?: boolean;
}

export interface ModalSubscriptionProps extends BaseSubscriptionProps {
  trigger?: ReactNode;
  title?: string;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface SidebarSubscriptionProps extends BaseSubscriptionProps {
  position?: 'left' | 'right';
  title?: string;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface FloatingSubscriptionProps extends BaseSubscriptionProps {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  delay?: number; // milliseconds before showing
  hideAfter?: number; // milliseconds to auto-hide
  trigger?: 'scroll' | 'time' | 'manual';
}

// Hook return types
export interface UseSubscriptionReturn {
  // State
  subscriberCount: number;
  isSubscribed: boolean;
  isSubmitting: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  subscribe: (email: string) => void;
  reset: () => void;
  
  // Utils
  validateEmail: (email: string) => ValidationResult;
}

export interface UseSubscriptionConfigReturn {
  config: SubscriptionConfig;
  updateConfig: (updates: Partial<SubscriptionConfig>) => void;
  resetConfig: () => void;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  error?: string;
}

// Provider context types
export interface SubscriptionContextValue {
  config: SubscriptionConfig;
  updateConfig: (updates: Partial<SubscriptionConfig>) => void;
  resetConfig: () => void;
}

export interface SubscriptionProviderProps {
  config?: Partial<SubscriptionConfig>;
  children: ReactNode;
}

// Database integration types (for projects using different databases)
export interface DatabaseAdapter {
  insert: (data: SubscriptionRequest) => Promise<EmailSubscription>;
  count: () => Promise<number>;
  findByEmail: (email: string) => Promise<EmailSubscription | null>;
  unsubscribe?: (email: string) => Promise<boolean>;
}

// Analytics and tracking types
export interface SubscriptionAnalytics {
  trackSubscription: (email: string, source: string) => void;
  trackError: (error: string, email?: string) => void;
  trackView: (component: string) => void;
}

// Theme customization types
export interface SubscriptionTheme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    error: string;
    background: string;
    text: string;
    border: string;
  };
  spacing: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontSize: {
      sm: string;
      md: string;
      lg: string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      bold: string;
    };
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Export utility type for merging configurations
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};