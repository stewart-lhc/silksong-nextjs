/**
 * Supabase Client Configuration for Next.js
 * Provides type-safe database access with proper error handling
 */

import { clientEnv } from '@/lib/env.client';
import type { Database } from '@/types/supabase';
import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client with enhanced configuration
export const supabase = createClient<Database>(
  clientEnv.NEXT_PUBLIC_SUPABASE_URL,
  clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      // Enhanced auth configuration for Next.js
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // Use PKCE flow for enhanced security

      // Custom storage for SSR compatibility
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },

    // Database configuration
    db: {
      schema: 'public',
    },

    // Global configuration
    global: {
      headers: {
        'X-Client-Info': 'silk-song-archive@1.0.0',
      },
    },

    // Realtime configuration
    realtime: {
      params: {
        eventsPerSecond: 10, // Rate limit for realtime events
      },
    },
  }
);

// Server-side admin client is now in @/lib/supabase/server for API routes

// Type-safe query helpers with error handling
export class SupabaseQueryError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: string,
    public readonly hint?: string
  ) {
    super(message);
    this.name = 'SupabaseQueryError';
  }
}

// Enhanced query wrapper with automatic error handling
export async function executeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<T> {
  try {
    const { data, error } = await queryFn();

    if (error) {
      throw new SupabaseQueryError(
        error.message || 'Database query failed',
        error.code,
        error.details,
        error.hint
      );
    }

    if (data === null) {
      throw new SupabaseQueryError('Query returned null data');
    }

    return data;
  } catch (error) {
    if (error instanceof SupabaseQueryError) {
      throw error;
    }

    throw new SupabaseQueryError(
      `Unexpected error during database query: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Type-safe subscription helper
export function createRealtimeSubscription<T extends Record<string, any>>(
  table: string,
  options: {
    filter?: string;
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    schema?: string;
  } = {}
) {
  const { filter, event = '*', schema = 'public' } = options;

  const subscription = supabase.channel(`realtime:${table}`).on(
    'postgres_changes',
    {
      event,
      schema,
      table,
      filter,
    } as any,
    (payload: any) => {
      // Type-safe payload handling
      return payload;
    }
  );

  return {
    subscribe: (callback: (payload: any) => void) => {
      return subscription
        .on(
          'postgres_changes',
          {
            event,
            schema,
            table,
            filter,
          } as any,
          callback
        )
        .subscribe();
    },
    unsubscribe: () => subscription.unsubscribe(),
  };
}

// Database health check function
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  latency?: number;
  error?: string;
}> {
  try {
    const startTime = Date.now();

    // Simple health check query
    const { error } = await supabase
      .from('email_subscriptions')
      .select('count')
      .limit(1)
      .maybeSingle();

    const latency = Date.now() - startTime;

    if (error) {
      return {
        isHealthy: false,
        error: error.message,
        latency,
      };
    }

    return {
      isHealthy: true,
      latency,
    };
  } catch (error) {
    return {
      isHealthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Authentication helpers
export const auth = {
  // Get current session with error handling
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw new SupabaseQueryError(error.message);
      return data.session;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  },

  // Get current user with error handling
  async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw new SupabaseQueryError(error.message);
      return data.user;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  },

  // Sign out with error handling
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new SupabaseQueryError(error.message);
      return true;
    } catch (error) {
      console.error('Failed to sign out:', error);
      return false;
    }
  },
};

// Export types for convenience
export type { Database } from '@/types/supabase';
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
