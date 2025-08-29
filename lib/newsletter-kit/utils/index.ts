/**
 * Newsletter Kit - Utility Functions
 * Complete utility library for newsletter functionality
 * 
 * @version 1.0.0
 */

export { cn } from './cn';

import type {
  ValidatedEmail,
  SubscriptionError,
  EmailValidationResult,
  EmailSuggestion,
  ISOTimestamp,
  SubscriberCount,
} from '../types';

// ========================= EMAIL VALIDATION =========================

/**
 * Comprehensive email validation with domain checking and suggestions
 */
export const validateEmail = (
  email: string,
  options: {
    allowedDomains?: readonly string[];
    blockedDomains?: readonly string[];
    suggestCorrections?: boolean;
  } = {}
): EmailValidationResult => {
  const trimmed = email.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (trimmed.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }
  
  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    const suggestions = options.suggestCorrections 
      ? generateEmailSuggestions(trimmed)
      : [];
    
    return { 
      isValid: false, 
      error: 'Please enter a valid email address',
      suggestions: suggestions.map(s => s.suggested)
    };
  }
  
  const domain = trimmed.split('@')[1]?.toLowerCase();
  if (!domain) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  // Check blocked domains
  if (options.blockedDomains?.includes(domain)) {
    return { isValid: false, error: 'This email domain is not allowed' };
  }
  
  // Check allowed domains
  if (options.allowedDomains?.length && !options.allowedDomains.includes(domain)) {
    return { isValid: false, error: 'Please use an allowed email domain' };
  }
  
  return {
    isValid: true,
    sanitizedEmail: trimmed.toLowerCase() as ValidatedEmail,
  };
};

/**
 * Generate email suggestions for common typos
 */
export const generateEmailSuggestions = (email: string): EmailSuggestion[] => {
  const suggestions: EmailSuggestion[] = [];
  
  // Common domain typos
  const commonDomains = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yahoo.co': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmail.co': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outlook.co': 'outlook.com',
  };
  
  const [localPart, domain] = email.toLowerCase().split('@');
  if (!domain || !localPart) return suggestions;
  
  // Check for domain typos
  if (commonDomains[domain as keyof typeof commonDomains]) {
    const correctedDomain = commonDomains[domain as keyof typeof commonDomains];
    suggestions.push({
      original: email,
      suggested: `${localPart}@${correctedDomain}`,
      confidence: 0.9,
      reason: 'Common domain typo',
    });
  }
  
  return suggestions;
};

/**
 * Advanced email validation with disposable email detection
 */
export const isDisposableEmail = (email: string): boolean => {
  const disposableDomains = [
    '10minutemail.com',
    'mailinator.com',
    'guerrillamail.com',
    'tempmail.org',
    'yopmail.com',
    'throwaway.email',
    'maildrop.cc',
    'temp-mail.org',
    'sharklasers.com',
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? disposableDomains.includes(domain) : false;
};

// ========================= ERROR HANDLING =========================

/**
 * Create standardized subscription errors
 */
export const createSubscriptionError = (
  code: SubscriptionError['code'],
  message: string,
  options: {
    details?: Record<string, unknown>;
    retryable?: boolean;
    retryAfter?: number;
  } = {}
): SubscriptionError => ({
  code,
  message,
  details: options.details,
  retryable: options.retryable ?? false,
  retryAfter: options.retryAfter,
});

/**
 * Format error messages for display
 */
export const formatErrorMessage = (error: SubscriptionError): string => {
  switch (error.code) {
    case 'validation_email':
      return 'Please enter a valid email address';
    case 'rate_limit_exceeded':
      return `Too many requests. Please wait ${error.retryAfter || 60} seconds and try again.`;
    case 'database_duplicate':
      return "You're already subscribed to our newsletter!";
    case 'network_timeout':
      return 'Request timed out. Please check your connection and try again.';
    case 'server_error':
      return 'We\'re experiencing technical difficulties. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred';
  }
};

// ========================= FORMATTING UTILITIES =========================

/**
 * Format subscriber count for display
 */
export const formatSubscriberCount = (count: SubscriberCount): string => {
  if (count < 1000) {
    return count.toString();
  } else if (count < 1000000) {
    return `${Math.floor(count / 100) / 10}k`;
  } else {
    return `${Math.floor(count / 100000) / 10}M`;
  }
};

/**
 * Format date for display
 */
export const formatDate = (timestamp: ISOTimestamp): string => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (timestamp: ISOTimestamp): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
  
  return formatDate(timestamp);
};

// ========================= RATE LIMITING =========================

/**
 * Simple client-side rate limiting
 */
export class ClientRateLimit {
  private requests: number[] = [];
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(
      time => now - time < this.windowMs
    );
    
    return this.requests.length < this.maxRequests;
  }
  
  recordRequest(): void {
    this.requests.push(Date.now());
  }
  
  getRetryAfter(): number {
    if (this.requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    const retryAfter = Math.ceil((this.windowMs - (Date.now() - oldestRequest)) / 1000);
    
    return Math.max(0, retryAfter);
  }
}

// ========================= LOCAL STORAGE UTILITIES =========================

/**
 * Safe localStorage operations with error handling
 */
export const storage = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  remove(key: string): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
  
  clear(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.clear();
      return true;
    } catch {
      return false;
    }
  },
};

// ========================= DEBOUNCING =========================

/**
 * Debounce function for input validation
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// ========================= ANALYTICS UTILITIES =========================

/**
 * Track newsletter events
 */
export const trackEvent = (
  eventName: string,
  properties: Record<string, unknown> = {}
) => {
  if (typeof window === 'undefined') return;
  
  // Google Analytics 4
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, {
      event_category: 'Newsletter',
      ...properties,
    });
  }
  
  // Custom analytics
  window.dispatchEvent(
    new CustomEvent('newsletter:analytics', {
      detail: { eventName, properties },
    })
  );
};

// ========================= ACCESSIBILITY UTILITIES =========================

/**
 * Generate accessible IDs for form elements
 */
export const generateId = (prefix = 'newsletter'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Announce messages to screen readers
 */
export const announceToScreenReader = (message: string): void => {
  if (typeof document === 'undefined') return;
  
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.setAttribute('class', 'sr-only');
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// ========================= VALIDATION HELPERS =========================

/**
 * Check if string is a valid UUID v4
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Check if string is a valid ISO timestamp
 */
export const isValidISOTimestamp = (timestamp: string): boolean => {
  const date = new Date(timestamp);
  return !isNaN(date.getTime()) && date.toISOString() === timestamp;
};

/**
 * Sanitize HTML to prevent XSS
 */
export const sanitizeHtml = (html: string): string => {
  if (typeof document === 'undefined') return html;
  
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
};

// ========================= ENVIRONMENT HELPERS =========================

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Check if running in browser
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (!isBrowser()) return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// ========================= EXPORTS =========================
// All functions are already exported as export const above