/**
 * Newsletter Kit - Core React Hooks
 * Reusable hooks for email subscription functionality
 * 
 * @version 1.0.0
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  SubscriptionStatus,
  SubscriptionResult,
  SubscriptionError,
  ValidatedEmail,
  SubscriberCount,
  UseSubscriptionOptions,
  UseSubscriptionReturn,
  UseSubscriptionStatsReturn,
  NewsletterConfig,
  EmailValidationResult,
  isValidatedEmail,
} from '../types';

// ========================= VALIDATION UTILITIES =========================
const validateEmail = (
  email: string,
  config: NewsletterConfig
): EmailValidationResult => {
  const trimmed = email.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Email is required' };
  }
  
  if (trimmed.length > config.validation.maxLength) {
    return { isValid: false, error: `Email is too long (max ${config.validation.maxLength} characters)` };
  }
  
  if (!config.validation.emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  const domain = trimmed.split('@')[1]?.toLowerCase();
  if (!domain) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  // Check blocked domains
  if (config.validation.blockedDomains.includes(domain)) {
    return { isValid: false, error: 'This email domain is not allowed' };
  }
  
  // Check allowed domains (if specified)
  if (config.validation.allowedDomains.length > 0 && !config.validation.allowedDomains.includes(domain)) {
    return { isValid: false, error: 'Please use an allowed email domain' };
  }
  
  return {
    isValid: true,
    sanitizedEmail: trimmed.toLowerCase() as ValidatedEmail,
  };
};

// ========================= API CLIENT =========================
class NewsletterApiClient {
  constructor(private config: NewsletterConfig) {}
  
  async subscribe(
    email: ValidatedEmail,
    options: { source?: string; tags?: readonly string[]; metadata?: Record<string, unknown> } = {}
  ): Promise<SubscriptionResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.api.timeout);
    
    try {
      const response = await fetch(this.config.api.endpoints.subscribe, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: options.source,
          tags: options.tags,
          metadata: options.metadata,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        const code: SubscriptionResult['code'] = response.status === 409 
          ? 'ALREADY_SUBSCRIBED'
          : response.status === 429 
          ? 'RATE_LIMITED'
          : response.status >= 500 
          ? 'SERVER_ERROR'
          : 'NETWORK_ERROR';
          
        return {
          success: false,
          error: {
            code: `api_${response.status}` as SubscriptionError['code'],
            message: errorData.error || this.config.messages.serverError,
            details: errorData,
            retryable: response.status >= 500 || response.status === 429,
            retryAfter: response.status === 429 ? 60 : undefined,
          },
          code,
        };
      }
      
      const data = await response.json();
      return {
        success: true,
        subscription: data.subscription,
        count: data.count,
        code: 'SUCCESS',
      };
      
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: {
            code: 'network_timeout',
            message: this.config.messages.networkError,
            retryable: true,
          },
          code: 'NETWORK_ERROR',
        };
      }
      
      return {
        success: false,
        error: {
          code: 'network_error',
          message: this.config.messages.networkError,
          details: { originalError: String(error) },
          retryable: true,
        },
        code: 'NETWORK_ERROR',
      };
    }
  }
  
  async getStats(): Promise<UseSubscriptionStatsReturn['data']> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.api.timeout);
    
    try {
      const response = await fetch(this.config.api.endpoints.stats, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}

// ========================= CORE SUBSCRIPTION HOOK =========================
export const useNewsletter = (options: UseSubscriptionOptions = {}): UseSubscriptionReturn => {
  const [status, setStatus] = useState<SubscriptionStatus>({ type: 'idle' });
  const [subscriberCount, setSubscriberCount] = useState<SubscriberCount>(0 as SubscriberCount);
  
  const configRef = useRef(options.config);
  const apiClientRef = useRef<NewsletterApiClient | null>(null);
  
  // Initialize API client when config changes
  useEffect(() => {
    if (options.config) {
      configRef.current = options.config;
      apiClientRef.current = new NewsletterApiClient(options.config as NewsletterConfig);
    }
  }, [options.config]);
  
  // Retry mechanism
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = configRef.current?.api?.retries || 3;
  
  const subscribe = useCallback(async (
    email: string,
    subscribeOptions: { source?: string; tags?: readonly string[]; metadata?: Record<string, unknown> } = {}
  ): Promise<SubscriptionResult> => {
    if (!configRef.current || !apiClientRef.current) {
      const error: SubscriptionError = {
        code: 'validation_config',
        message: 'Newsletter configuration is required',
      };
      setStatus({ type: 'error', error });
      return { success: false, error, code: 'SERVER_ERROR' };
    }
    
    // Validation phase
    setStatus({ type: 'validating', email });
    
    const validation = validateEmail(email, configRef.current);
    if (!validation.isValid) {
      const error: SubscriptionError = {
        code: 'validation_email',
        message: validation.error || configRef.current.messages.invalidEmail,
      };
      setStatus({ type: 'error', error, email });
      options.onError?.(error);
      return { success: false, error, code: 'INVALID_EMAIL' };
    }
    
    // Submission phase
    setStatus({ type: 'submitting', email: validation.sanitizedEmail! });
    
    try {
      let lastError: SubscriptionError | null = null;
      
      // Retry logic
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const result = await apiClientRef.current.subscribe(validation.sanitizedEmail!, subscribeOptions);
        
        if (result.success) {
          const successStatus: SubscriptionStatus = {
            type: 'success',
            subscription: result.subscription!,
            count: result.count!,
          };
          setStatus(successStatus);
          setSubscriberCount(result.count!);
          setRetryCount(0);
          options.onSuccess?.(result);
          
          // Track analytics if enabled
          if (configRef.current.analytics?.trackSubscriptions && typeof window !== 'undefined') {
            // Custom event for analytics
            window.dispatchEvent(new CustomEvent('newsletter:subscribed', {
              detail: { email: validation.sanitizedEmail, source: subscribeOptions.source }
            }));
          }
          
          return result;
        }
        
        lastError = result.error!;
        
        // Don't retry certain errors
        if (['ALREADY_SUBSCRIBED', 'INVALID_EMAIL'].includes(result.code!)) {
          break;
        }
        
        // Don't retry if not retryable
        if (!lastError.retryable) {
          break;
        }
        
        // Wait before retry
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          setRetryCount(attempt + 1);
        }
      }
      
      // All retries failed
      const errorStatus: SubscriptionStatus = {
        type: 'error',
        error: lastError!,
        email,
      };
      setStatus(errorStatus);
      options.onError?.(lastError!);
      
      // Track error analytics if enabled
      if (configRef.current.analytics?.trackErrors && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('newsletter:error', {
          detail: { error: lastError, email }
        }));
      }
      
      return { success: false, error: lastError!, code: 'SERVER_ERROR' };
      
    } catch (unexpectedError) {
      const error: SubscriptionError = {
        code: 'server_unexpected',
        message: configRef.current.messages.serverError,
        details: { originalError: String(unexpectedError) },
        retryable: false,
      };
      
      const errorStatus: SubscriptionStatus = { type: 'error', error, email };
      setStatus(errorStatus);
      options.onError?.(error);
      return { success: false, error, code: 'SERVER_ERROR' };
    }
  }, [options, maxRetries]);
  
  const reset = useCallback(() => {
    setStatus({ type: 'idle' });
    setRetryCount(0);
  }, []);
  
  // Status change callback
  useEffect(() => {
    options.onStatusChange?.(status);
  }, [status, options]);
  
  return {
    status,
    isLoading: status.type === 'validating' || status.type === 'submitting',
    isSuccess: status.type === 'success',
    isError: status.type === 'error',
    error: status.type === 'error' ? status.error : null,
    subscriberCount,
    subscribe,
    reset,
  };
};

// ========================= SUBSCRIPTION STATS HOOK =========================
export const useNewsletterStats = (
  config: NewsletterConfig,
  options: { 
    enabled?: boolean; 
    refetchInterval?: number;
    staleTime?: number;
  } = {}
): UseSubscriptionStatsReturn => {
  const apiClient = new NewsletterApiClient(config);
  const queryClient = useQueryClient();
  
  const {
    data,
    isLoading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ['newsletter-stats', config.api.endpoints.stats],
    queryFn: () => apiClient.getStats(),
    enabled: options.enabled !== false,
    refetchInterval: options.refetchInterval || 300000, // 5 minutes
    staleTime: options.staleTime || 60000, // 1 minute
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors
      if (failureCount < 3 && error instanceof Error) {
        return true;
      }
      return false;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  const error: SubscriptionError | null = queryError ? {
    code: 'api_stats',
    message: 'Failed to load statistics',
    details: { originalError: String(queryError) },
    retryable: true,
  } : null;
  
  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['newsletter-stats'] });
    await refetch();
  }, [queryClient, refetch]);
  
  return {
    data: data || null,
    isLoading,
    error,
    refresh,
  };
};

// ========================= EMAIL VALIDATION HOOK =========================
export const useEmailValidation = (config: NewsletterConfig) => {
  const validateEmailDebounced = useCallback(
    (email: string): EmailValidationResult => {
      return validateEmail(email, config);
    },
    [config]
  );
  
  return { validateEmail: validateEmailDebounced };
};

// ========================= SUBSCRIPTION STATE PERSISTENCE =========================
export const useNewsletterPersistence = (key = 'newsletter-state') => {
  const [persistedState, setPersistedState] = useState<{
    hasSubscribed: boolean;
    lastEmail: string;
    timestamp: number;
  } | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          setPersistedState(JSON.parse(stored));
        }
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [key]);
  
  const saveState = useCallback((email: string, subscribed = true) => {
    if (typeof window !== 'undefined') {
      try {
        const state = {
          hasSubscribed: subscribed,
          lastEmail: email,
          timestamp: Date.now(),
        };
        localStorage.setItem(key, JSON.stringify(state));
        setPersistedState(state);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [key]);
  
  const clearState = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(key);
        setPersistedState(null);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [key]);
  
  return {
    persistedState,
    saveState,
    clearState,
    hasSubscribed: persistedState?.hasSubscribed || false,
    lastEmail: persistedState?.lastEmail || '',
  };
};