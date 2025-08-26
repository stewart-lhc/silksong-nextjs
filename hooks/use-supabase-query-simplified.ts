/**
 * Simplified Supabase Query Hook
 * Provides basic data fetching for the email subscription functionality
 * Updated to use server-side API endpoints instead of direct Supabase calls
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseQueryError } from '@/lib/supabase/client';

/**
 * Hook for fetching subscription count
 */
export function useSubscriptionCount() {
  return useQuery({
    queryKey: ['subscription-count'],
    queryFn: async (): Promise<number> => {
      try {
        const response = await fetch('/api/subscriptions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error('Error fetching subscriber count:', response.statusText);
          return 0;
        }

        const data = await response.json();
        return data.count || 0;
      } catch (error) {
        console.error('Unexpected error fetching subscriber count:', error);
        return 0;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

/**
 * Hook for inserting email subscriptions
 */
export function useEmailSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string): Promise<{ email: string; count: number }> => {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific error cases
        if (response.status === 409 && errorData.code === 'ALREADY_SUBSCRIBED') {
          throw new SupabaseQueryError(
            errorData.error || 'Email already subscribed',
            '23505', // Unique constraint violation code
            null,
            null
          );
        }
        
        if (response.status === 429) {
          throw new SupabaseQueryError(
            errorData.error || 'Rate limit exceeded',
            'RATE_LIMIT_EXCEEDED',
            null,
            null
          );
        }

        throw new SupabaseQueryError(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          'API_ERROR',
          null,
          null
        );
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new SupabaseQueryError(
          data.error || 'Subscription failed',
          'SUBSCRIPTION_FAILED',
          null,
          null
        );
      }

      // Use the count returned from the API response
      const newCount = data.count || 1;

      return {
        email: data.subscription.email,
        count: newCount,
      };
    },
    onSuccess: (data) => {
      // Update cache with new count
      queryClient.setQueryData(['subscription-count'], data.count);
    },
  });
}