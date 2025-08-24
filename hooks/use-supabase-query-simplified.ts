/**
 * Simplified Supabase Query Hook
 * Provides basic data fetching for the email subscription functionality
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, executeQuery, SupabaseQueryError } from '@/lib/supabase/client';
import type { TablesInsert } from '@/types/supabase';

/**
 * Hook for fetching subscription count
 */
export function useSubscriptionCount() {
  return useQuery({
    queryKey: ['subscription-count'],
    queryFn: async (): Promise<number> => {
      try {
        const { data, error } = await supabase.rpc('get_subscription_count');
        
        if (error) {
          console.error('Error fetching subscriber count:', error);
          return 0;
        }
        
        return data || 0;
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
      const subscriptionData: TablesInsert<'email_subscriptions'> = {
        email: email.trim().toLowerCase(),
      };

      const { data, error } = await supabase
        .from('email_subscriptions')
        .insert([subscriptionData])
        .select();
      
      if (error) {
        throw new SupabaseQueryError(error.message, error.code, error.details, error.hint);
      }

      // Get updated count
      const { data: countData } = await supabase.rpc('get_subscription_count');
      const newCount = countData || 1;

      return {
        email: subscriptionData.email,
        count: newCount,
      };
    },
    onSuccess: (data) => {
      // Update cache with new count
      queryClient.setQueryData(['subscription-count'], data.count);
    },
  });
}