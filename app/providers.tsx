/**
 * Application Providers
 * Centralizes all context providers for the Next.js application
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { I18nProvider } from '@/components/providers/i18n-provider';
import { useState } from 'react';

/**
 * Query client configuration for optimal performance and UX
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 5 minutes
        staleTime: 5 * 60 * 1000,
        // Keep data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests up to 2 times
        retry: 2,
        // Don't refetch on window focus by default
        refetchOnWindowFocus: false,
        // Don't refetch on reconnect by default
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
      },
    },
  });
}

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Main providers component that wraps the entire application
 */
export function Providers({ children }: ProvidersProps) {
  // Create a stable query client instance
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        {children}
        
        {/* Toast notifications */}
        <Toaster />
        
        {/* React Query DevTools - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools
            initialIsOpen={false}
          />
        )}
      </I18nProvider>
    </QueryClientProvider>
  );
}