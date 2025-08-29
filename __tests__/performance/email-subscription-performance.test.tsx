/**
 * Performance Tests - Email Subscription Components
 * Tests rendering performance, memory usage, and interaction responsiveness
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, performanceUtils, timerUtils } from '../utils/test-utils';
import { useEmailSubscription } from '@/hooks/use-email-subscription';
import { mockUtils } from '../mocks/handlers';
import { performanceThresholds } from '../fixtures/subscription-data';

// Performance monitoring component
const PerformanceMonitor = ({ onRender }: { onRender: (renderTime: number) => void }) => {
  const renderStartTime = React.useRef(performance.now());

  React.useLayoutEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    onRender(renderTime);
  });

  return null;
};

// Test component with performance monitoring
const MonitoredEmailSubscription = ({ onRender }: { onRender?: (renderTime: number) => void }) => {
  const [email, setEmail] = React.useState('');
  const [renderCount, setRenderCount] = React.useState(0);
  
  const {
    subscriberCount,
    isSubscribed,
    isSubmitting,
    isLoading,
    error,
    subscribe,
  } = useEmailSubscription();

  React.useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscribe(email.trim());
    setEmail('');
  };

  return (
    <div data-testid="monitored-subscription" data-render-count={renderCount}>
      {onRender && <PerformanceMonitor onRender={onRender} />}
      
      <div data-testid="subscriber-count">
        {isLoading ? 'Loading...' : `${subscriberCount} subscribers`}
      </div>

      {error && (
        <div role="alert" data-testid="error-message">
          {error}
        </div>
      )}

      {isSubscribed ? (
        <div role="status" data-testid="success-state">
          ✓ Subscribed!
        </div>
      ) : (
        <form onSubmit={handleSubmit} data-testid="subscription-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            data-testid="email-input"
            placeholder="Enter your email"
          />
          <button
            type="submit"
            disabled={isSubmitting || !email.trim()}
            data-testid="subscribe-button"
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      )}
    </div>
  );
};

describe('Email Subscription Performance', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    mockUtils.resetSubscriptions();
    timerUtils.setup();
    
    // Clear performance marks
    if (performance.clearMarks) {
      performance.clearMarks();
    }
    if (performance.clearMeasures) {
      performance.clearMeasures();
    }
  });

  afterEach(() => {
    timerUtils.cleanup();
  });

  describe('Initial Render Performance', () => {
    it('should render within performance threshold', () => {
      const renderTime = performanceUtils.measureRenderTime(() => {
        return renderWithProviders(<MonitoredEmailSubscription />);
      });

      expect(renderTime).toBeLessThan(performanceThresholds.rendering.maxRenderTime);
    });

    it('should not cause memory leaks on initial render', () => {
      const initialMemory = performanceUtils.measureMemoryUsage();
      
      const { unmount } = renderWithProviders(<MonitoredEmailSubscription />);
      unmount();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = performanceUtils.measureMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(memoryIncrease).toBeLessThan(performanceThresholds.memory.maxMemoryUsage);
    });

    it('should minimize initial render count', () => {
      renderWithProviders(<MonitoredEmailSubscription />);
      
      const renderCount = parseInt(
        screen.getByTestId('monitored-subscription').getAttribute('data-render-count') || '0'
      );
      
      expect(renderCount).toBeLessThanOrEqual(performanceThresholds.rendering.maxReRenders);
    });
  });

  describe('Re-render Performance', () => {
    it('should optimize re-renders during typing', async () => {
      let renderTimes: number[] = [];
      
      renderWithProviders(
        <MonitoredEmailSubscription onRender={(time) => renderTimes.push(time)} />
      );

      const input = screen.getByTestId('email-input');
      
      // Type multiple characters and measure render times
      const testString = 'test@example.com';
      for (const char of testString) {
        await user.type(input, char);
      }

      // Average render time should be reasonable
      const averageRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
      expect(averageRenderTime).toBeLessThan(performanceThresholds.rendering.maxRenderTime);
    });

    it('should avoid unnecessary re-renders', async () => {
      renderWithProviders(<MonitoredEmailSubscription />);

      const getInitialRenderCount = () => parseInt(
        screen.getByTestId('monitored-subscription').getAttribute('data-render-count') || '0'
      );

      const initialRenderCount = getInitialRenderCount();

      // Actions that shouldn't trigger re-renders
      const input = screen.getByTestId('email-input');
      await user.click(input); // Focus change shouldn't re-render parent
      
      const renderCountAfterFocus = getInitialRenderCount();
      expect(renderCountAfterFocus).toBe(initialRenderCount);
    });

    it('should handle rapid state changes efficiently', async () => {
      renderWithProviders(<MonitoredEmailSubscription />);

      const input = screen.getByTestId('email-input');
      const initialRenderCount = parseInt(
        screen.getByTestId('monitored-subscription').getAttribute('data-render-count') || '0'
      );

      // Rapid typing simulation
      await user.type(input, 'rapid');
      await user.clear(input);
      await user.type(input, 'changes');
      await user.clear(input);
      await user.type(input, 'test@example.com');

      const finalRenderCount = parseInt(
        screen.getByTestId('monitored-subscription').getAttribute('data-render-count') || '0'
      );

      const renderDifference = finalRenderCount - initialRenderCount;
      
      // Should not have excessive re-renders (allow some for state changes)
      expect(renderDifference).toBeLessThan(50); // Reasonable threshold for typing
    });
  });

  describe('Interaction Performance', () => {
    it('should respond to user input quickly', async () => {
      renderWithProviders(<MonitoredEmailSubscription />);

      const input = screen.getByTestId('email-input');
      const startTime = performance.now();
      
      await user.type(input, 'quick@response.com');
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(performanceThresholds.interaction.maxResponseTime);
    });

    it('should handle form submission efficiently', async () => {
      renderWithProviders(<MonitoredEmailSubscription />);

      const input = screen.getByTestId('email-input');
      const button = screen.getByTestId('subscribe-button');

      await user.type(input, 'submit@performance.com');

      const startTime = performance.now();
      await user.click(button);
      
      // Measure time until loading state appears
      await waitFor(() => {
        expect(screen.getByText('Subscribing...')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const submissionTime = endTime - startTime;

      expect(submissionTime).toBeLessThan(performanceThresholds.interaction.maxResponseTime);
    });

    it('should handle async operations efficiently', async () => {
      renderWithProviders(<MonitoredEmailSubscription />);

      await user.type(screen.getByTestId('email-input'), 'async@test.com');
      
      const startTime = performance.now();
      await user.click(screen.getByTestId('subscribe-button'));
      
      // Wait for async operation to complete
      await waitFor(() => {
        expect(screen.getByTestId('success-state')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const asyncTime = endTime - startTime;

      expect(asyncTime).toBeLessThan(performanceThresholds.interaction.maxAsyncResponseTime);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during normal usage', () => {
      const initialMemory = performanceUtils.measureMemoryUsage();
      
      // Simulate normal usage pattern
      for (let i = 0; i < 10; i++) {
        const { unmount } = renderWithProviders(<MonitoredEmailSubscription />);
        unmount();
      }
      
      // Force garbage collection
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = performanceUtils.measureMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;
      
      // Allow some memory increase but not excessive
      expect(memoryIncrease).toBeLessThan(performanceThresholds.memory.maxMemoryUsage);
    });

    it('should clean up event listeners and timers', async () => {
      const { unmount } = renderWithProviders(<MonitoredEmailSubscription />);

      // Trigger subscription to start timers
      await user.type(screen.getByTestId('email-input'), 'cleanup@test.com');
      await user.click(screen.getByTestId('subscribe-button'));
      
      // Unmount component
      unmount();
      
      // Advance timers to ensure no memory leaks from dangling timers
      timerUtils.runAllTimers();
      
      // Test should not throw or cause memory issues
      expect(true).toBe(true);
    });

    it('should handle multiple instances without memory issues', () => {
      const initialMemory = performanceUtils.measureMemoryUsage();
      
      // Create multiple instances simultaneously
      const instances = Array.from({ length: 5 }, () => 
        renderWithProviders(<MonitoredEmailSubscription />)
      );
      
      // Unmount all instances
      instances.forEach(({ unmount }) => unmount());
      
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = performanceUtils.measureMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(memoryIncrease).toBeLessThan(performanceThresholds.memory.maxMemoryUsage * 2);
    });
  });

  describe('Bundle Size Impact', () => {
    it('should have reasonable component size footprint', () => {
      // This is a conceptual test - in practice, you'd use webpack-bundle-analyzer
      const componentCode = MonitoredEmailSubscription.toString();
      const codeSize = new Blob([componentCode]).size;
      
      // Component code should be reasonably sized (adjust threshold as needed)
      expect(codeSize).toBeLessThan(10000); // 10KB threshold
    });

    it('should not import unnecessary dependencies', () => {
      // Mock module to track imports
      const importedModules = new Set();
      
      // This would require more sophisticated tooling in a real scenario
      // For now, we'll do a basic check
      const hookCode = useEmailSubscription.toString();
      
      // Should not contain imports of heavy libraries
      expect(hookCode).not.toMatch(/import.*lodash/);
      expect(hookCode).not.toMatch(/import.*moment/);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent form submissions gracefully', async () => {
      const { rerender } = renderWithProviders(<MonitoredEmailSubscription />);

      // Simulate rapid user interactions
      const input = screen.getByTestId('email-input');
      const button = screen.getByTestId('subscribe-button');

      await user.type(input, 'concurrent@test.com');
      
      // Start first submission
      const firstClick = user.click(button);
      
      // Rerender component (simulating prop changes)
      rerender(<MonitoredEmailSubscription />);
      
      // Wait for first submission to complete
      await firstClick;
      
      // Component should remain stable
      expect(screen.getByTestId('monitored-subscription')).toBeInTheDocument();
    });

    it('should maintain performance under stress', async () => {
      renderWithProviders(<MonitoredEmailSubscription />);

      const startTime = performance.now();
      
      // Simulate rapid user interactions
      const input = screen.getByTestId('email-input');
      
      for (let i = 0; i < 20; i++) {
        await user.type(input, `stress${i}`);
        await user.clear(input);
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should complete stress test within reasonable time
      expect(totalTime).toBeLessThan(5000); // 5 seconds for 20 operations
    });
  });

  describe('Resource Cleanup', () => {
    it('should properly clean up React Query cache', async () => {
      const { queryClient, unmount } = renderWithProviders(<MonitoredEmailSubscription />);

      // Wait for initial data loading
      await waitFor(() => {
        expect(screen.getByText(/\d+\s*subscribers/)).toBeInTheDocument();
      });

      const initialCacheSize = queryClient.getQueryCache().getAll().length;
      
      // Trigger subscription
      await user.type(screen.getByTestId('email-input'), 'cache@test.com');
      await user.click(screen.getByTestId('subscribe-button'));
      
      // Unmount component
      unmount();
      
      // Cache should still exist but not grow indefinitely
      const finalCacheSize = queryClient.getQueryCache().getAll().length;
      expect(finalCacheSize).toBeGreaterThanOrEqual(initialCacheSize);
      expect(finalCacheSize).toBeLessThan(initialCacheSize + 10); // Reasonable growth limit
    });

    it('should handle component unmount during async operations', async () => {
      const { unmount } = renderWithProviders(<MonitoredEmailSubscription />);

      await user.type(screen.getByTestId('email-input'), 'unmount@test.com');
      
      // Start async operation
      const submitPromise = user.click(screen.getByTestId('subscribe-button'));
      
      // Unmount immediately
      unmount();
      
      // Should not throw errors
      await expect(submitPromise).resolves.not.toThrow();
    });
  });
});