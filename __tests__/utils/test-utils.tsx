/**
 * Test Utilities - Custom render functions and testing helpers
 * Provides wrapped components with necessary providers for testing
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';

// Custom render options
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  initialEntries?: string[];
}

// Create a test QueryClient with specific configuration
function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Disable retries for tests to avoid waiting
        retry: false,
        // Disable cache time for predictable tests
        gcTime: 0,
        // Disable stale time for fresh data
        staleTime: 0,
      },
      mutations: {
        // Disable retries for mutations
        retry: false,
      },
    },
    // Suppress error logging in tests
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
}

// Test wrapper component with all providers
function TestWrapper({ 
  children, 
  queryClient = createTestQueryClient(),
}: {
  children: ReactNode;
  queryClient?: QueryClient;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {children}
        <Toaster />
      </ToastProvider>
    </QueryClientProvider>
  );
}

// Custom render function with providers
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { queryClient: QueryClient } {
  const {
    queryClient = createTestQueryClient(),
    ...renderOptions
  } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <TestWrapper queryClient={queryClient}>{children}</TestWrapper>
  );

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...result,
    queryClient,
  };
}

// Utility to wait for React Query to settle
export async function waitForReactQuery(queryClient: QueryClient): Promise<void> {
  await queryClient.getQueryCache().getAll().forEach(query => {
    query.invalidate();
  });
}

// Mock timer utilities
export const timerUtils = {
  setup: () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
  },
  
  cleanup: () => {
    jest.useRealTimers();
  },
  
  advanceBy: (milliseconds: number) => {
    jest.advanceTimersByTime(milliseconds);
  },
  
  runAllTimers: () => {
    jest.runAllTimers();
  },
  
  runOnlyPendingTimers: () => {
    jest.runOnlyPendingTimers();
  },
};

// Form interaction utilities
export const formUtils = {
  fillEmail: async (user: any, email: string) => {
    const emailInput = await user.findByRole('textbox', { name: /email/i });
    await user.clear(emailInput);
    if (email) {
      await user.type(emailInput, email);
    }
    return emailInput;
  },
  
  submitForm: async (user: any) => {
    const submitButton = await user.findByRole('button', { name: /subscribe|notify/i });
    await user.click(submitButton);
    return submitButton;
  },
  
  fillAndSubmit: async (user: any, email: string) => {
    await formUtils.fillEmail(user, email);
    await formUtils.submitForm(user);
  },
};

// Accessibility test utilities
export const a11yUtils = {
  // Check if element has proper ARIA attributes
  checkARIA: (element: HTMLElement, expectedAttributes: Record<string, string>) => {
    Object.entries(expectedAttributes).forEach(([attr, value]) => {
      expect(element).toHaveAttribute(attr, value);
    });
  },
  
  // Check if element is properly labeled
  checkLabel: (element: HTMLElement) => {
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    const label = element.closest('form')?.querySelector(`label[for="${element.id}"]`);
    
    expect(
      ariaLabel || ariaLabelledBy || label
    ).toBeTruthy();
  },
  
  // Check keyboard navigation
  checkKeyboardNavigation: async (user: any, elements: HTMLElement[]) => {
    for (let i = 0; i < elements.length; i++) {
      await user.tab();
      expect(elements[i]).toHaveFocus();
    }
  },
};

// Performance testing utilities
export const performanceUtils = {
  measureRenderTime: async (renderFn: () => RenderResult): Promise<number> => {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    return endTime - startTime;
  },
  
  measureReRenders: (component: ReactElement): { renderCount: number; lastRender: RenderResult } => {
    let renderCount = 0;
    let lastRender: RenderResult;
    
    const TestComponent = () => {
      renderCount++;
      return component;
    };
    
    lastRender = renderWithProviders(<TestComponent />);
    
    return { renderCount, lastRender };
  },
  
  measureMemoryUsage: (): number => {
    // @ts-ignore - performance.memory is not in TypeScript types but exists in Chrome
    return performance.memory ? performance.memory.usedJSHeapSize : 0;
  },
};

// Mock component utilities
export const mockComponents = {
  // Mock toast component for testing
  MockToast: ({ title, description, variant }: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
  }) => (
    <div role="alert" data-testid={`toast-${variant || 'default'}`}>
      <div data-testid="toast-title">{title}</div>
      {description && <div data-testid="toast-description">{description}</div>}
    </div>
  ),
  
  // Mock loading component
  MockLoading: ({ children }: { children?: ReactNode }) => (
    <div data-testid="loading-spinner" role="status" aria-label="Loading">
      {children || 'Loading...'}
    </div>
  ),
  
  // Mock error boundary
  MockErrorBoundary: ({ children, onError }: {
    children: ReactNode;
    onError?: (error: Error) => void;
  }) => {
    try {
      return <>{children}</>;
    } catch (error) {
      onError?.(error as Error);
      return <div role="alert" data-testid="error-boundary">Something went wrong</div>;
    }
  },
};

// Re-export testing library utilities
export * from '@testing-library/react';
export { renderWithProviders as render };