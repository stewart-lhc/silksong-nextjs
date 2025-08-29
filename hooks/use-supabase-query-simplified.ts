/**
 * Simplified Supabase Query Hook
 * Provides basic data fetching for the email subscription functionality
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook for fetching subscription count via API route
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
          console.error(`Failed to fetch subscription count: ${response.status}`);
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
 * Hook for inserting email subscriptions via API route
 */
export function useEmailSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string): Promise<{ email: string; count: number }> => {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          source: 'web',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Get updated subscription count via API
      const countResponse = await fetch('/api/subscriptions', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      let newCount = 1;
      if (countResponse.ok) {
        const countData = await countResponse.json();
        newCount = countData.count || 1;
      }

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