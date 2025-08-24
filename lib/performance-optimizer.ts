// Next.js Performance Optimization Utilities
// Adapted for React Server Components and Next.js specific features

import { cache } from 'react';

// Enhanced task scheduling for Next.js client components
export class NextJSTaskScheduler {
  private taskQueue: Array<() => void> = [];
  private isRunning = false;
  private readonly timeSlice: number;
  
  constructor(timeSlice = 5) {
    this.timeSlice = timeSlice;
  }
  
  // Schedule a task to run during idle time
  scheduleTask(task: () => void): void {
    this.taskQueue.push(task);
    
    if (!this.isRunning) {
      this.runTasks();
    }
  }
  
  // Schedule multiple tasks
  scheduleTasks(tasks: Array<() => void>): void {
    this.taskQueue.push(...tasks);
    
    if (!this.isRunning) {
      this.runTasks();
    }
  }
  
  private runTasks(): void {
    this.isRunning = true;
    
    const runTasksUntilDeadline = (deadline: IdleDeadline) => {
      while (this.taskQueue.length > 0 && deadline.timeRemaining() > this.timeSlice) {
        const task = this.taskQueue.shift();
        if (task) {
          try {
            task();
          } catch (error) {
            console.error('Task execution failed:', error);
          }
        }
      }
      
      if (this.taskQueue.length > 0) {
        this.requestIdleCallback(runTasksUntilDeadline);
      } else {
        this.isRunning = false;
      }
    };
    
    this.requestIdleCallback(runTasksUntilDeadline);
  }
  
  private requestIdleCallback(callback: (deadline: IdleDeadline) => void): void {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(callback, { timeout: 1000 });
    } else if (typeof window !== 'undefined') {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        const start = performance.now();
        callback({
          didTimeout: false,
          timeRemaining: () => Math.max(0, 16 - (performance.now() - start)),
        } as IdleDeadline);
      }, 0);
    }
  }
  
  // Get queue status
  getQueueStatus(): { pending: number; running: boolean } {
    return {
      pending: this.taskQueue.length,
      running: this.isRunning,
    };
  }
  
  // Clear all pending tasks
  clearQueue(): void {
    this.taskQueue = [];
  }
}

// Global task scheduler instance for client-side usage
export const nextJSTaskScheduler = typeof window !== 'undefined' ? new NextJSTaskScheduler() : null;

// Enhanced debounce utility with React.useCallback compatibility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  immediate = false
): T & { cancel: () => void; flush: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: ThisParameterType<T>;
  let result: ReturnType<T>;
  
  const debounced = function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    lastArgs = args;
    lastThis = this;
    
    const callNow = immediate && !timeoutId;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate && lastArgs) {
        result = func.apply(lastThis, lastArgs);
      }
    }, delay);
    
    if (callNow) {
      result = func.apply(this, args);
    }
    
    return result;
  } as T & { cancel: () => void; flush: () => void };
  
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  debounced.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      result = func.apply(lastThis, lastArgs);
      timeoutId = null;
    }
    return result;
  };
  
  return debounced;
}

// Enhanced throttle utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T & { cancel: () => void; flush: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: ThisParameterType<T>;
  let result: ReturnType<T>;
  
  const { leading = true, trailing = true } = options;
  
  const throttled = function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    const now = Date.now();
    lastArgs = args;
    lastThis = this;
    
    const timeSinceLastExec = now - lastExecTime;
    
    const shouldExecute = () => {
      lastExecTime = now;
      result = func.apply(lastThis, args);
      return result;
    };
    
    if (!lastExecTime && !leading) {
      lastExecTime = now;
    }
    
    const remaining = delay - timeSinceLastExec;
    
    if (remaining <= 0 || remaining > delay) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      return shouldExecute();
    } else if (!timeoutId && trailing) {
      timeoutId = setTimeout(() => {
        lastExecTime = leading ? Date.now() : 0;
        timeoutId = null;
        result = func.apply(lastThis, lastArgs!);
      }, remaining);
    }
    
    return result;
  } as T & { cancel: () => void; flush: () => void };
  
  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastExecTime = 0;
  };
  
  throttled.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      timeoutId = null;
      lastExecTime = Date.now();
      result = func.apply(lastThis, lastArgs);
    }
    return result;
  };
  
  return throttled;
}

// React Server Component compatible caching - alias for React's cache function
export const serverMemoize = cache;

// Client-side memory management for components
export class ComponentMemoryManager {
  private componentCache = new WeakMap<React.ComponentType, any>();
  private renderCache = new Map<string, any>();
  private maxCacheSize = 100;
  
  // Cache component props for performance
  cacheComponentData<T>(component: React.ComponentType, data: T): void {
    this.componentCache.set(component, data);
  }
  
  // Get cached component data
  getCachedComponentData<T>(component: React.ComponentType): T | undefined {
    return this.componentCache.get(component);
  }
  
  // Cache render results with key
  cacheRenderResult(key: string, result: any): void {
    if (this.renderCache.size >= this.maxCacheSize) {
      // Remove oldest entries (FIFO)
      const firstKey = this.renderCache.keys().next().value;
      if (firstKey !== undefined) {
        this.renderCache.delete(firstKey);
      }
    }
    this.renderCache.set(key, result);
  }
  
  // Get cached render result
  getCachedRenderResult(key: string): any {
    return this.renderCache.get(key);
  }
  
  // Clear all caches
  clearCache(): void {
    this.renderCache.clear();
    // WeakMap will be garbage collected automatically
  }
  
  // Get cache statistics
  getCacheStats(): { renderCacheSize: number; maxSize: number } {
    return {
      renderCacheSize: this.renderCache.size,
      maxSize: this.maxCacheSize,
    };
  }
}

// Global memory manager for client components
export const componentMemoryManager = typeof window !== 'undefined' ? new ComponentMemoryManager() : null;

// Performance measurement utility for Next.js
export class NextJSPerformanceMonitor {
  private measurements = new Map<string, number[]>();
  
  // Start measuring with performance.mark (works in both client and server)
  startMeasure(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`);
    }
  }
  
  // End measuring
  endMeasure(name: string): number {
    if (typeof performance === 'undefined') {
      return 0;
    }
    
    const endMark = `${name}-end`;
    const startMark = `${name}-start`;
    
    performance.mark(endMark);
    
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      const duration = measure?.duration || 0;
      
      // Store measurement
      if (!this.measurements.has(name)) {
        this.measurements.set(name, []);
      }
      
      const measurements = this.measurements.get(name)!;
      measurements.push(duration);
      
      // Keep only last 100 measurements
      if (measurements.length > 100) {
        measurements.shift();
      }
      
      // Clean up performance entries
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(name);
      
      return duration;
    } catch (error) {
      console.warn('Performance measurement failed:', error);
      return 0;
    }
  }
  
  // Get performance statistics
  getStats(name: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    latest: number;
  } | null {
    const measurements = this.measurements.get(name);
    if (!measurements || measurements.length === 0) {
      return null;
    }
    
    return {
      count: measurements.length,
      average: measurements.reduce((a, b) => a + b, 0) / measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      latest: measurements[measurements.length - 1],
    };
  }
  
  // Get all measurements
  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [name] of this.measurements) {
      stats[name] = this.getStats(name);
    }
    
    return stats;
  }
  
  // Clear measurements
  clearMeasurements(name?: string): void {
    if (name) {
      this.measurements.delete(name);
    } else {
      this.measurements.clear();
    }
  }
}

// Global performance monitor
export const nextJSPerformanceMonitor = new NextJSPerformanceMonitor();

// Performance decorator for functions (works in both client and server)
export function measurePerformance<T extends (...args: any[]) => any>(
  name: string,
  func: T
): T {
  return ((...args: Parameters<T>) => {
    nextJSPerformanceMonitor.startMeasure(name);
    
    try {
      const result = func(...args);
      
      if (result instanceof Promise) {
        return result.finally(() => {
          nextJSPerformanceMonitor.endMeasure(name);
        });
      } else {
        nextJSPerformanceMonitor.endMeasure(name);
        return result;
      }
    } catch (error) {
      nextJSPerformanceMonitor.endMeasure(name);
      throw error;
    }
  }) as T;
}

// Async iterator for processing large datasets efficiently
export async function* processInChunks<T>(
  array: T[],
  chunkSize = 10
): AsyncGenerator<T[], void, unknown> {
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    yield chunk;
    
    // Yield control back to the browser/event loop
    await new Promise<void>(resolve => {
      if (typeof window !== 'undefined' && nextJSTaskScheduler) {
        nextJSTaskScheduler.scheduleTask(() => resolve());
      } else {
        setTimeout(() => resolve(), 0);
      }
    });
  }
}

// Break long tasks for better performance
export function breakLongTask<T>(
  array: T[],
  processor: (item: T, index: number) => void,
  chunkSize = 10
): Promise<void> {
  return new Promise((resolve) => {
    let index = 0;
    
    const processChunk = () => {
      const endIndex = Math.min(index + chunkSize, array.length);
      
      for (let i = index; i < endIndex; i++) {
        processor(array[i], i);
      }
      
      index = endIndex;
      
      if (index < array.length) {
        if (typeof window !== 'undefined' && nextJSTaskScheduler) {
          nextJSTaskScheduler.scheduleTask(processChunk);
        } else {
          setTimeout(processChunk, 0);
        }
      } else {
        resolve();
      }
    };
    
    processChunk();
  });
}

// Initialize performance optimizations for Next.js
export function initNextJSPerformanceOptimizations(): void {
  if (typeof window === 'undefined') {
    // Server-side optimizations
    console.log('✅ Server-side performance optimizations initialized');
    return;
  }
  
  // Client-side optimizations
  if ('requestIdleCallback' in window) {
    console.log('✅ Client performance optimizations initialized with requestIdleCallback support');
  } else {
    console.log('⚠️ Client performance optimizations initialized with setTimeout fallback');
  }
  
  // Monitor long tasks (client-side only)
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // Long task threshold
            console.warn(`🐌 Long task detected: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
          }
        });
      });
      
      observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Long task monitoring not supported:', error);
    }
  }
  
  // Monitor largest contentful paint
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          const lcp = entry as PerformanceNavigationTiming;
          if (lcp.loadEventEnd && lcp.loadEventEnd > 2500) {
            console.warn(`⚠️ Slow page load detected: ${lcp.loadEventEnd.toFixed(2)}ms`);
          }
        });
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP monitoring not supported:', error);
    }
  }
}

// Resource preloader specifically for Next.js
export function preloadNextJSResource(href: string, as: string = 'fetch'): void {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  
  if (as === 'script') {
    link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
}

// Prefetch Next.js pages
export function prefetchNextJSPage(href: string): void {
  if (typeof document === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  
  document.head.appendChild(link);
}

// Export commonly used utilities
export {
  cache as serverCache,
};

// Type definitions for better TypeScript support
export interface PerformanceStats {
  count: number;
  average: number;
  min: number;
  max: number;
  latest: number;
}

export interface CacheStats {
  renderCacheSize: number;
  maxSize: number;
}

export interface TaskQueueStatus {
  pending: number;
  running: boolean;
}