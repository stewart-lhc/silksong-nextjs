/**
 * Advanced Subscription System Hook
 * Reusable hook that can be configured for different projects and databases
 */

'use client';

import { useState, useCallback, useEffect, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  SubscriptionConfig, 
  UseSubscriptionReturn, 
  ValidationResult,
  EmailSubscription,
  SubscriptionRequest,
  SubscriptionResponse 
} from '../types/email-subscription';
import { getEnvironmentConfig } from '../config/email-subscription';
import { toast } from '@/hooks/use-toast';

// Context for configuration sharing
import { createContext } from 'react';

export const SubscriptionConfigContext = createContext<SubscriptionConfig | null>(null);

// Enhanced validation with domain filtering
export function validateAndSanitizeEmail(
  email: string, 
  config: SubscriptionConfig
): ValidationResult {
  const sanitized = email.trim().toLowerCase();
  
  if (!sanitized) {
    return { isValid: false, sanitized, error: config.messages.invalidEmail };
  }
  
  if (sanitized.length > config.validation.emailMaxLength) {
    return { isValid: false, sanitized, error: 'Email is too long' };
  }
  
  // Enhanced email validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(sanitized)) {
    return { isValid: false, sanitized, error: config.messages.invalidEmail };
  }
  
  // Check blocked domains
  const domain = sanitized.split('@')[1];
  if (config.validation.blockedDomains?.includes(domain)) {
    return { isValid: false, sanitized, error: 'This email domain is not allowed' };
  }
  
  // Check allowed domains (if specified)
  if (config.validation.allowedDomains?.length > 0 && 
      !config.validation.allowedDomains.includes(domain)) {
    return { isValid: false, sanitized, error: 'This email domain is not allowed' };
  }
  
  return { isValid: true, sanitized };
}

// Custom hook for subscription functionality
export function useSubscriptionSystem(
  overrideConfig?: Partial<SubscriptionConfig>
): UseSubscriptionReturn {
  const contextConfig = useContext(SubscriptionConfigContext);
  const config = contextConfig || getEnvironmentConfig();
  const finalConfig = overrideConfig ? 
    { ...config, ...overrideConfig } : config;
  
  const queryClient = useQueryClient();
  
  // State management
  const [state, setState] = useState({
    subscriberCount: 0,
    isSubscribed: false,
    isSubmitting: false,
    isLoading: false,
    error: null as string | null,
    lastSubmissionTime: 0,
  });
  
  // Fetch subscriber count
  const fetchSubscriberCount = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch(finalConfig.endpoints.count);
      if (!response.ok) {
        throw new Error('Failed to fetch subscriber count');
      }
      
      const data = await response.json();
      setState(prev => ({ 
        ...prev, 
        subscriberCount: data.count || 0,
        isLoading: false 
      }));
    } catch (error) {
      console.error('Error fetching subscriber count:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load subscriber count',
        isLoading: false 
      }));
    }
  }, [finalConfig.endpoints.count]);
  
  // Subscribe function
  const subscribe = useCallback(async (email: string) => {
    // Rate limiting check
    const now = Date.now();
    const timeSinceLastSubmission = now - state.lastSubmissionTime;
    
    if (timeSinceLastSubmission < finalConfig.rateLimit.minTimeBetweenSubmissions) {
      toast({
        title: "Please wait",
        description: finalConfig.messages.rateLimit,
        variant: "destructive",
      });
      return;
    }
    
    // Validate email
    const validation = validateAndSanitizeEmail(email, finalConfig);
    if (!validation.isValid) {
      toast({
        title: "Invalid email",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }
    
    // Check if already submitting
    if (state.isSubmitting) {
      return;
    }
    
    setState(prev => ({ 
      ...prev, 
      isSubmitting: true, 
      error: null,
      lastSubmissionTime: now 
    }));
    
    try {
      const requestData: SubscriptionRequest = {
        email: validation.sanitized,
        source: 'web',
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          url: window.location.href,
        }
      };
      
      const response = await fetch(finalConfig.endpoints.subscribe, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      const data: SubscriptionResponse = await response.json();
      
      if (!response.ok) {
        if (response.status === 409) {
          // Already subscribed
          toast({
            title: "Already subscribed",
            description: finalConfig.messages.alreadySubscribed,
          });
        } else {
          throw new Error(data.error || 'Subscription failed');
        }
        return;
      }
      
      // Success
      setState(prev => ({ 
        ...prev, 
        isSubscribed: true, 
        subscriberCount: prev.subscriberCount + 1 
      }));
      
      toast({
        title: "Success!",
        description: finalConfig.messages.success,
      });
      
      // Auto-reset after success
      if (finalConfig.ui.autoResetAfterSuccess > 0) {
        setTimeout(() => {
          setState(prev => ({ ...prev, isSubscribed: false }));
        }, finalConfig.ui.autoResetAfterSuccess);
      }
      
      // Invalidate and refetch count
      queryClient.invalidateQueries({ queryKey: ['subscription-count'] });
      
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : finalConfig.messages.error,
        variant: "destructive",
      });
      
      setState(prev => ({ ...prev, error: 'Subscription failed' }));
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [
    finalConfig, 
    state.isSubmitting, 
    state.lastSubmissionTime, 
    queryClient
  ]);
  
  // Reset function
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      isSubscribed: false,
      error: null,
    }));
  }, []);
  
  // Load initial subscriber count
  useEffect(() => {
    if (finalConfig.ui.showCount) {
      fetchSubscriberCount();
    }
  }, [fetchSubscriberCount, finalConfig.ui.showCount]);
  
  return {
    subscriberCount: state.subscriberCount,
    isSubscribed: state.isSubscribed,
    isSubmitting: state.isSubmitting,
    isLoading: state.isLoading,
    error: state.error,
    subscribe,
    reset,
    validateEmail: (email: string) => validateAndSanitizeEmail(email, finalConfig),
  };
}

// Hook for managing configuration
export function useSubscriptionConfig(initialConfig?: Partial<SubscriptionConfig>) {
  const [config, setConfig] = useState(() => {
    const baseConfig = getEnvironmentConfig();
    return initialConfig ? { ...baseConfig, ...initialConfig } : baseConfig;
  });
  
  const updateConfig = useCallback((updates: Partial<SubscriptionConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);
  
  const resetConfig = useCallback(() => {
    setConfig(getEnvironmentConfig());
  }, []);
  
  return {
    config,
    updateConfig,
    resetConfig,
  };
}