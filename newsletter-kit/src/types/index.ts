/**
 * TypeScript type definitions for Newsletter Kit
 */

export interface NewsletterConfig {
  // Supabase configuration
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceKey?: string;
  
  // Database configuration
  tableName?: string;
  
  // Rate limiting
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
    duplicateEmailWindowMs?: number;
  };
  
  // UI customization
  theme?: NewsletterTheme;
  
  // Validation
  validation?: {
    maxEmailLength?: number;
    customEmailRegex?: RegExp;
  };
  
  // Messages
  messages?: {
    success?: string;
    error?: string;
    alreadySubscribed?: string;
    rateLimit?: string;
    invalidEmail?: string;
    placeholder?: string;
    submitButton?: string;
    loadingButton?: string;
  };
}

export interface NewsletterTheme {
  // Color scheme
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    foreground?: string;
    muted?: string;
    border?: string;
    input?: string;
    ring?: string;
    destructive?: string;
  };
  
  // Typography
  fonts?: {
    sans?: string[];
    mono?: string[];
  };
  
  // Spacing and sizing
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  
  // Border radius
  radius?: {
    sm?: string;
    md?: string;
    lg?: string;
  };
  
  // Component variants
  variants?: {
    default?: string;
    minimal?: string;
    outlined?: string;
    ghost?: string;
  };
}

export interface SubscriptionData {
  email: string;
  source?: string;
  metadata?: Record<string, any>;
}

export interface NewsletterFormProps {
  // Core props
  config?: Partial<NewsletterConfig>;
  
  // UI customization
  className?: string;
  variant?: 'default' | 'minimal' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  
  // Layout
  layout?: 'vertical' | 'horizontal' | 'inline';
  
  // Behavior
  showCount?: boolean;
  autoFocus?: boolean;
  clearOnSuccess?: boolean;
  
  // Callbacks
  onSuccess?: (data: { email: string; count?: number }) => void;
  onError?: (error: string) => void;
  onSubmit?: (email: string) => void;
  
  // Custom content
  placeholder?: string;
  submitText?: string;
  loadingText?: string;
  successMessage?: string;
  
  // Advanced
  customValidation?: (email: string) => { isValid: boolean; error?: string };
  source?: string;
}

export interface NewsletterHookReturn {
  // State
  subscriberCount: number;
  isSubscribed: boolean;
  isSubmitting: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  subscribe: (email: string) => void;
  reset: () => void;
  
  // Utilities
  validateEmail: (email: string) => { isValid: boolean; sanitized: string; error?: string };
}

export interface DatabaseTable {
  id: string;
  email: string;
  subscribed_at: string;
  source?: string;
  metadata?: Record<string, any>;
}

export interface APIResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  code?: string;
}

export interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  reason?: string;
}

export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  error?: string;
}