/**
 * Server-Side Supabase Client
 * For use in API routes, server components, and server actions only
 */

import { env } from '@/lib/env';
import type { Database } from '@/types/supabase';
import { createClient } from '@supabase/supabase-js';

// Server-side client with service role key (for API routes only)
export const supabaseAdmin = env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            'X-Client-Info': 'silk-song-archive-admin@1.0.0',
          },
        },
      }
    )
  : null;

// Re-export the SupabaseQueryError for server-side use
export { SupabaseQueryError, executeQuery } from './client';