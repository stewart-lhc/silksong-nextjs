/**
 * Email Subscription Hook
 * Manages email subscriptions with Supabase integration
 * Migrated from original Vite project with Next.js optimizations
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSubscriptionCount, useEmailSubscriptionMutation } from './use-supabase-query-simplified';
import { SupabaseQueryError } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';

// Types
interface EmailSubscriptionState {
  isSubscribed: boolean;
  isSubmitting: boolean;
  error: string | null;
  lastSubmissionTime: number;
}

interface SubscriptionData {
  email: string;
  count: number;
}

interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  error?: string;
}

// Email validation and sanitization utility
const validateAndSanitizeEmail = (email: string): ValidationResult => {
  // Basic sanitization - trim whitespace and convert to lowercase
  const sanitized = email.trim().toLowerCase();
  
  // Enhanced email validation regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!sanitized) {
    return { isValid: false, sanitized, error: "Email is required" };
  }
  
  if (sanitized.length > 254) {
    return { isValid: false, sanitized, error: "Email is too long" };
  }
  
  if (!emailRegex.test(sanitized)) {
    return { isValid: false, sanitized, error: "Please enter a valid email address" };
  }
  
  return { isValid: true, sanitized };
};

// Query keys
const QUERY_KEYS = {
  subscriptionCount: ['subscription-count'] as const,
} as const;

/**
 * Hook for managing email subscriptions
 */
export function useEmailSubscription() {
  const queryClient = useQueryClient();
  
  // Local state
  const [state, setState] = useState<EmailSubscriptionState>({
    isSubscribed: false,
    isSubmitting: false,
    error: null,
    lastSubmissionTime: 0,
  });

  // Fetch subscription count
  const {
    data: subscriberCount = 0,
    isLoading: isCountLoading,
    error: countError,
  } = useSubscriptionCount();

  // Subscribe mutation
  const subscribeMutation = useEmailSubscriptionMutation();

  // Handle subscription success/error
  useEffect(() => {
    if (subscribeMutation.isSuccess && subscribeMutation.data) {
      setState(prev => ({ ...prev, isSubscribed: true, isSubmitting: false, error: null }));
      
      toast({
        title: "Successfully subscribed!",
        description: "You'll be notified when Silksong releases.",
      });

      // Reset subscription state after 3 seconds
      setTimeout(() => {
        setState(prev => ({ ...prev, isSubscribed: false }));
      }, 3000);
    }
  }, [subscribeMutation.isSuccess, subscribeMutation.data]);

  useEffect(() => {
    if (subscribeMutation.isError && subscribeMutation.error) {
      const error = subscribeMutation.error;
      
      setState(prev => ({ ...prev, isSubmitting: false }));
      
      if (error instanceof SupabaseQueryError && error.code === '23505') {
        toast({
          title: "Already subscribed",
          description: "This email is already on our list!",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || 'An unexpected error occurred. Please try again.',
          variant: "destructive",
        });
      }
    }
  }, [subscribeMutation.isError, subscribeMutation.error]);

  useEffect(() => {
    if (subscribeMutation.isPending) {
      setState(prev => ({ 
        ...prev, 
        isSubmitting: true, 
        error: null, 
        lastSubmissionTime: Date.now() 
      }));
    }
  }, [subscribeMutation.isPending]);

  // Subscribe function
  const subscribe = useCallback(
    (email: string) => {
      if (!email.trim()) {
        toast({
          title: "Invalid email",
          description: "Email is required",
          variant: "destructive",
        });
        return;
      }

      // Validate email
      const validation = validateAndSanitizeEmail(email);
      if (!validation.isValid) {
        toast({
          title: "Invalid email",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      // Rate limiting check
      const now = Date.now();
      const minTimeBetweenSubmissions = 5000; // 5 seconds
      
      if (now - state.lastSubmissionTime < minTimeBetweenSubmissions) {
        toast({
          title: "Please wait",
          description: "Please wait a moment before subscribing again.",
          variant: "destructive",
        });
        return;
      }

      if (subscribeMutation.isPending) {
        return;
      }

      subscribeMutation.mutate(validation.sanitized);
    },
    [subscribeMutation, state.lastSubmissionTime]
  );

  // Reset error when component unmounts or key changes
  useEffect(() => {
    return () => {
      setState(prev => ({ ...prev, error: null }));
    };
  }, []);

  // Return hook interface
  return {
    // State
    subscriberCount,
    isSubscribed: state.isSubscribed,
    isSubmitting: state.isSubmitting,
    isLoading: isCountLoading,
    error: state.error || (countError ? 'Failed to load subscription count' : null),
    
    // Actions
    subscribe,
    
    // Utils
    validateEmail: validateAndSanitizeEmail,
  };
}

