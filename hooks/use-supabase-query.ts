/**
 * Generic Supabase Query Hook
 * Provides type-safe data fetching with React Query integration
 * Handles authentication, caching, and error states
 */

'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { supabase, executeQuery, SupabaseQueryError } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

// Generic types for table operations
type TableName = keyof Database['public']['Tables'];
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

// Query configuration options
interface SupabaseQueryConfig<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey?: readonly unknown[];
}

// Mutation configuration options
interface SupabaseMutationConfig<TData, TVariables> extends UseMutationOptions<TData, Error, TVariables> {}

/**
 * Hook for fetching data from a Supabase table
 */
export function useSupabaseQuery<T extends TableName>(
  table: T,
  options: SupabaseQueryConfig<any[]> & {
    select?: string;
    filter?: (query: any) => any;
    single?: false;
  }
): ReturnType<typeof useQuery<any[]>>;

export function useSupabaseQuery<T extends TableName>(
  table: T,
  options: SupabaseQueryConfig<any | null> & {
    select?: string;
    filter?: (query: any) => any;
    single: true;
  }
): ReturnType<typeof useQuery<any | null>>;

export function useSupabaseQuery<T extends TableName>(
  table: T,
  options: SupabaseQueryConfig<any> & {
    select?: string;
    filter?: (query: any) => any;
    single?: boolean;
  } = {}
) {
  const { select = '*', filter, single = false, queryKey, ...queryOptions } = options;
  
  const defaultQueryKey = ['supabase', table, { select, filter: filter?.toString(), single }];
  const finalQueryKey = queryKey || defaultQueryKey;

  return useQuery({
    queryKey: finalQueryKey,
    queryFn: async () => {
      let query = supabase.from(table).select(select);
      
      if (filter) {
        query = filter(query);
      }

      if (single) {
        return executeQuery(async () => query.maybeSingle());
      } else {
        return executeQuery(async () => query);
      }
    },
    ...queryOptions,
  });
}

/**
 * Hook for inserting data into a Supabase table
 */
export function useSupabaseInsert<T extends TableName>(
  table: T,
  options: SupabaseMutationConfig<any[], any[]> = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any[]) => {
      const result = await executeQuery(async () => 
        supabase.from(table).insert(data).select()
      );
      return result as any[];
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['supabase', table] });
    },
    ...options,
  });
}

/**
 * Hook for updating data in a Supabase table
 */
export function useSupabaseUpdate<T extends TableName>(
  table: T,
  options: SupabaseMutationConfig<any[], { filter: (query: any) => any; data: any }> = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ filter, data }: { filter: (query: any) => any; data: any }) => {
      let query = supabase.from(table).update(data);
      query = filter(query);
      
      return executeQuery(async () => query.select());
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['supabase', table] });
    },
    ...options,
  });
}

/**
 * Hook for deleting data from a Supabase table
 */
export function useSupabaseDelete<T extends TableName>(
  table: T,
  options: SupabaseMutationConfig<any[], (query: any) => any> = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filter: (query: any) => any) => {
      let query = supabase.from(table).delete();
      query = filter(query);
      
      return executeQuery(async () => query.select());
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['supabase', table] });
    },
    ...options,
  });
}

/**
 * Hook for calling Supabase RPC functions
 */
export function useSupabaseRpc<T = any>(
  functionName: string,
  args?: Record<string, any>,
  options: SupabaseQueryConfig<T> = {}
) {
  const { queryKey, ...queryOptions } = options;
  
  const defaultQueryKey = ['supabase', 'rpc', functionName, args];
  const finalQueryKey = queryKey || defaultQueryKey;

  return useQuery({
    queryKey: finalQueryKey,
    queryFn: async () => {
      const result = await executeQuery(async () => supabase.rpc(functionName as any, args));
      return result as T;
    },
    ...queryOptions,
  });
}

/**
 * Hook for subscribing to real-time changes
 */
export function useSupabaseSubscription<T extends TableName>(
  table: T,
  callback: (payload: any) => void,
  options: {
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: string;
    schema?: string;
  } = {}
) {
  const { event = '*', filter, schema = 'public' } = options;

  return useQuery({
    queryKey: ['supabase', 'subscription', table, { event, filter, schema }],
    queryFn: async () => {
      const subscription = supabase
        .channel(`realtime:${table}`)
        .on('postgres_changes', {
          event,
          schema,
          table,
          filter,
        } as any, callback)
        .subscribe();

      return subscription;
    },
    staleTime: Infinity, // Subscriptions don't need refetching
    gcTime: 0, // Don't cache subscriptions
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

/**
 * Hook for authenticated operations
 */
export function useSupabaseAuth() {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ['supabase', 'auth', 'session'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw new SupabaseQueryError(error.message);
      return data.session;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const userQuery = useQuery({
    queryKey: ['supabase', 'auth', 'user'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw new SupabaseQueryError(error.message);
      return data.user;
    },
    enabled: !!sessionQuery.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw new SupabaseQueryError(error.message);
    },
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.invalidateQueries({ queryKey: ['supabase', 'auth'] });
    },
  });

  return {
    session: sessionQuery.data,
    user: userQuery.data,
    isLoading: sessionQuery.isLoading || userQuery.isLoading,
    isAuthenticated: !!sessionQuery.data,
    signOut: signOutMutation.mutate,
    isSigningOut: signOutMutation.isPending,
  };
}

/**
 * Simplified wrapper hooks for common use cases
 * These provide the same interface as the simplified version while using the full system
 */

/**
 * Hook for fetching subscription count via API route
 * Simplified interface compatible with use-supabase-query-simplified
 */
export function useSubscriptionCount() {
  return useQuery({
    queryKey: ['subscription-count'],
    queryFn: async (): Promise<number> => {
      try {
        const response = await fetch('/api/subscribe', {
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
 * Simplified interface compatible with use-supabase-query-simplified
 */
export function useEmailSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string): Promise<{ email: string; count: number }> => {
      const response = await fetch('/api/subscribe', {
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
      
      // The unified endpoint already provides the updated count
      return {
        email: data.subscription.email,
        count: data.subscriberCount || data.count || 1,
      };
    },
    onSuccess: (data) => {
      // Update cache with new count
      queryClient.setQueryData(['subscription-count'], data.count);
    },
  });
}

/**
 * Convenience wrapper for basic table queries
 * Provides a simple interface for common read operations
 */
export function useSimpleQuery<T extends TableName>(
  table: T,
  options: {
    select?: string;
    filter?: Record<string, any>;
    single?: boolean;
    enabled?: boolean;
  } = {}
) {
  const { select = '*', filter, single = false, enabled = true } = options;
  
  if (single) {
    return useSupabaseQuery(table, {
      select: select as any,
      filter: filter ? (query: any) => {
        let q = query;
        Object.entries(filter).forEach(([key, value]) => {
          q = q.eq(key, value);
        });
        return q;
      } : undefined,
      single: true,
      enabled,
    } as any);
  } else {
    return useSupabaseQuery(table, {
      select: select as any,
      filter: filter ? (query: any) => {
        let q = query;
        Object.entries(filter).forEach(([key, value]) => {
          q = q.eq(key, value);
        });
        return q;
      } : undefined,
      single: false,
      enabled,
    });
  }
}

/**
 * Convenience wrapper for basic table mutations
 * Provides a simple interface for common write operations
 */
export function useSimpleMutation<T extends TableName>(
  table: T,
  operation: 'insert' | 'update' | 'delete' = 'insert'
) {
  switch (operation) {
    case 'insert':
      return useSupabaseInsert(table);
    case 'update':
      return useSupabaseUpdate(table);
    case 'delete':
      return useSupabaseDelete(table);
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}

/**
 * Convenience hook for fetching data with loading and error states
 * Provides a unified interface similar to the simplified version
 */
export function useApiQuery<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST';
    body?: any;
    queryKey?: readonly unknown[];
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    retry?: number;
  } = {}
) {
  const {
    method = 'GET',
    body,
    queryKey,
    enabled = true,
    staleTime = 5 * 60 * 1000,
    gcTime = 10 * 60 * 1000,
    retry = 2,
  } = options;

  const defaultQueryKey = ['api', endpoint, method, body];
  const finalQueryKey = queryKey || defaultQueryKey;

  return useQuery({
    queryKey: finalQueryKey,
    queryFn: async (): Promise<T> => {
      try {
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          ...(body && method !== 'GET' ? { body: JSON.stringify(body) } : {}),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error(`API query error for ${endpoint}:`, error);
        throw error;
      }
    },
    enabled,
    staleTime,
    gcTime,
    refetchOnWindowFocus: false,
    retry,
  });
}

/**
 * Convenience hook for API mutations
 * Provides a unified interface for API calls with mutations
 */
export function useApiMutation<TData = any, TVariables = any>(
  endpoint: string,
  options: {
    method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
  } = {}
) {
  const { method = 'POST', onSuccess, onError } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(variables),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate related API queries
      queryClient.invalidateQueries({ queryKey: ['api'] });
      onSuccess?.(data, variables);
    },
    onError,
  });
}

// Export types for convenience
export type { TableRow, TableInsert, TableUpdate, SupabaseQueryConfig, SupabaseMutationConfig };