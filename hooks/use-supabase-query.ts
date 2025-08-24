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
  options: SupabaseQueryConfig<TableRow<T>[]> & {
    select?: string;
    filter?: (query: any) => any;
    single?: false;
  }
): ReturnType<typeof useQuery<TableRow<T>[]>>;

export function useSupabaseQuery<T extends TableName>(
  table: T,
  options: SupabaseQueryConfig<TableRow<T> | null> & {
    select?: string;
    filter?: (query: any) => any;
    single: true;
  }
): ReturnType<typeof useQuery<TableRow<T> | null>>;

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
  options: SupabaseMutationConfig<TableRow<T>[], TableInsert<T>[]> = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TableInsert<T>[]) => {
      const result = await executeQuery(async () => 
        supabase.from(table).insert(data).select()
      );
      return result as TableRow<T>[];
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
  options: SupabaseMutationConfig<TableRow<T>[], { filter: (query: any) => any; data: TableUpdate<T> }> = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ filter, data }: { filter: (query: any) => any; data: TableUpdate<T> }) => {
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
  options: SupabaseMutationConfig<TableRow<T>[], (query: any) => any> = {}
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

// Export types for convenience
export type { TableRow, TableInsert, TableUpdate, SupabaseQueryConfig, SupabaseMutationConfig };