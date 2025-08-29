/**
 * Newsletter Kit - Provider Component
 * Context provider for newsletter subscription functionality
 * 
 * @version 1.0.0
 */

'use client';

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { NewsletterConfig } from '../types';
import { createNewsletterConfig, validateConfig } from '../config';

// ========================= CONTEXT DEFINITION =========================
interface NewsletterContextValue {
  config: NewsletterConfig;
  isConfigValid: boolean;
  configErrors: string[];
  configWarnings: string[];
}

const NewsletterContext = createContext<NewsletterContextValue | null>(null);

// ========================= PROVIDER PROPS =========================
export interface NewsletterProviderProps {
  children: ReactNode;
  config?: Partial<NewsletterConfig>;
  environment?: 'development' | 'production' | 'test';
  queryClient?: QueryClient;
  onConfigError?: (errors: string[], warnings: string[]) => void;
}

// ========================= DEFAULT QUERY CLIENT =========================
const createDefaultQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry client errors (4xx)
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error) => {
        // Only retry server errors (5xx) and network errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// ========================= PROVIDER COMPONENT =========================
export const NewsletterProvider: React.FC<NewsletterProviderProps> = ({
  children,
  config: userConfig = {},
  environment = process.env.NODE_ENV as 'development' | 'production' | 'test' || 'production',
  queryClient,
  onConfigError,
}) => {
  // Create or use provided QueryClient
  const finalQueryClient = useMemo(() => {
    return queryClient || createDefaultQueryClient();
  }, [queryClient]);

  // Generate final configuration
  const finalConfig = useMemo(() => {
    try {
      return createNewsletterConfig(userConfig, environment);
    } catch (error) {
      console.error('Newsletter Kit: Failed to create configuration:', error);
      // Return minimal fallback config
      return createNewsletterConfig({}, environment);
    }
  }, [userConfig, environment]);

  // Validate configuration
  const configValidation = useMemo(() => {
    return validateConfig(finalConfig);
  }, [finalConfig]);

  // Handle configuration errors
  React.useEffect(() => {
    if (!configValidation.valid || configValidation.warnings.length > 0) {
      onConfigError?.(configValidation.errors, configValidation.warnings);
      
      if (process.env.NODE_ENV === 'development') {
        if (configValidation.errors.length > 0) {
          console.error('Newsletter Kit Configuration Errors:', configValidation.errors);
        }
        if (configValidation.warnings.length > 0) {
          console.warn('Newsletter Kit Configuration Warnings:', configValidation.warnings);
        }
      }
    }
  }, [configValidation, onConfigError]);

  // Context value
  const contextValue = useMemo<NewsletterContextValue>(() => ({
    config: finalConfig,
    isConfigValid: configValidation.valid,
    configErrors: configValidation.errors,
    configWarnings: configValidation.warnings,
  }), [finalConfig, configValidation]);

  return (
    <QueryClientProvider client={finalQueryClient}>
      <NewsletterContext.Provider value={contextValue}>
        {children}
      </NewsletterContext.Provider>
    </QueryClientProvider>
  );
};

// ========================= CONTEXT HOOK =========================
export const useNewsletterContext = (): NewsletterContextValue => {
  const context = useContext(NewsletterContext);
  
  if (!context) {
    throw new Error(
      'useNewsletterContext must be used within a NewsletterProvider. ' +
      'Make sure to wrap your component with <NewsletterProvider>.'
    );
  }
  
  if (!context.isConfigValid) {
    console.error('Newsletter configuration is invalid:', context.configErrors);
  }
  
  return context;
};

// ========================= CONDITIONAL PROVIDER =========================
export interface ConditionalNewsletterProviderProps extends NewsletterProviderProps {
  condition?: boolean;
  fallback?: ReactNode;
}

/**
 * Conditional provider that only renders the newsletter context if condition is true
 * Useful for feature flags or conditional functionality
 */
export const ConditionalNewsletterProvider: React.FC<ConditionalNewsletterProviderProps> = ({
  condition = true,
  fallback = null,
  children,
  ...props
}) => {
  if (!condition) {
    return <>{fallback}</>;
  }

  return (
    <NewsletterProvider {...props}>
      {children}
    </NewsletterProvider>
  );
};

// ========================= HIGH-ORDER COMPONENT =========================
export interface WithNewsletterProps {
  newsletterConfig?: Partial<NewsletterConfig>;
}

/**
 * Higher-order component that provides newsletter context
 */
export const withNewsletter = <P extends object>(
  Component: React.ComponentType<P>,
  defaultConfig?: Partial<NewsletterConfig>
) => {
  const WrappedComponent = React.forwardRef<
    any,
    P & WithNewsletterProps
  >((props, ref) => {
    const { newsletterConfig, ...componentProps } = props;
    const finalConfig = { ...defaultConfig, ...newsletterConfig };

    return (
      <NewsletterProvider config={finalConfig}>
        <Component {...(componentProps as P)} ref={ref} />
      </NewsletterProvider>
    );
  });

  WrappedComponent.displayName = `withNewsletter(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// ========================= CONFIGURATION UTILITIES =========================
/**
 * Hook to access only the configuration part of the context
 */
export const useNewsletterConfig = (): NewsletterConfig => {
  const { config } = useNewsletterContext();
  return config;
};

/**
 * Hook to check if configuration is valid
 */
export const useNewsletterConfigStatus = () => {
  const { isConfigValid, configErrors, configWarnings } = useNewsletterContext();
  
  return {
    isValid: isConfigValid,
    errors: configErrors,
    warnings: configWarnings,
    hasErrors: configErrors.length > 0,
    hasWarnings: configWarnings.length > 0,
  };
};

// ========================= DEVELOPMENT HELPERS =========================
if (process.env.NODE_ENV === 'development') {
  NewsletterProvider.displayName = 'NewsletterProvider';
  ConditionalNewsletterProvider.displayName = 'ConditionalNewsletterProvider';
}

// ========================= EXPORTS =========================
export type {
  NewsletterProviderProps,
  ConditionalNewsletterProviderProps,
  WithNewsletterProps,
  NewsletterContextValue,
};