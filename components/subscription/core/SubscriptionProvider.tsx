/**
 * Subscription System Provider
 * Provides configuration context and global state management
 */

'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  SubscriptionConfig, 
  SubscriptionProviderProps, 
  SubscriptionContextValue 
} from '@/types/email-subscription';
import { getEnvironmentConfig, mergeConfigs } from '@/config/email-subscription';

// Create contexts
const SubscriptionConfigContext = createContext<SubscriptionContextValue | null>(null);

// Query client instance (can be shared or separate)
let queryClient: QueryClient | null = null;

function getQueryClient(): QueryClient {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000, // 5 minutes
          gcTime: 10 * 60 * 1000, // 10 minutes
          retry: 3,
          retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        },
        mutations: {
          retry: 1,
          retryDelay: 1000,
        },
      },
    });
  }
  return queryClient;
}

/**
 * Main provider component for the subscription system
 */
export function SubscriptionProvider({ 
  children, 
  config: configOverride 
}: SubscriptionProviderProps) {
  const contextValue = useMemo(() => {
    const baseConfig = getEnvironmentConfig();
    const finalConfig = configOverride 
      ? mergeConfigs(baseConfig, configOverride)
      : baseConfig;
    
    return {
      config: finalConfig,
      updateConfig: (updates: Partial<SubscriptionConfig>) => {
        // In a real implementation, you might want to use a reducer
        // or state management library for more complex config updates
        console.warn('Config updates not implemented in this version');
      },
      resetConfig: () => {
        console.warn('Config reset not implemented in this version');
      },
    };
  }, [configOverride]);
  
  return (
    <QueryClientProvider client={getQueryClient()}>
      <SubscriptionConfigContext.Provider value={contextValue}>
        {children}
      </SubscriptionConfigContext.Provider>
    </QueryClientProvider>
  );
}

/**
 * Hook to access subscription configuration
 */
export function useSubscriptionContext(): SubscriptionContextValue {
  const context = useContext(SubscriptionConfigContext);
  
  if (!context) {
    throw new Error(
      'useSubscriptionContext must be used within a SubscriptionProvider'
    );
  }
  
  return context;
}

/**
 * Higher-order component for wrapping components with subscription provider
 */
export function withSubscriptionProvider<P extends object>(
  Component: React.ComponentType<P>,
  config?: Partial<SubscriptionConfig>
) {
  const WrappedComponent = (props: P) => (
    <SubscriptionProvider config={config}>
      <Component {...props} />
    </SubscriptionProvider>
  );
  
  WrappedComponent.displayName = `withSubscriptionProvider(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Lightweight provider for when you already have a QueryClient
 */
export function SubscriptionConfigProvider({ 
  children, 
  config: configOverride 
}: Omit<SubscriptionProviderProps, 'children'> & { children: React.ReactNode }) {
  const contextValue = useMemo(() => {
    const baseConfig = getEnvironmentConfig();
    const finalConfig = configOverride 
      ? mergeConfigs(baseConfig, configOverride)
      : baseConfig;
    
    return {
      config: finalConfig,
      updateConfig: (updates: Partial<SubscriptionConfig>) => {
        console.warn('Config updates not implemented in this version');
      },
      resetConfig: () => {
        console.warn('Config reset not implemented in this version');
      },
    };
  }, [configOverride]);
  
  return (
    <SubscriptionConfigContext.Provider value={contextValue}>
      {children}
    </SubscriptionConfigContext.Provider>
  );
}