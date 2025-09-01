'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Performance Optimizer Component
 * Tracks font loading performance and animation frame rates
 * Automatically manages will-change properties for better performance
 */
export function PerformanceOptimizer() {
  const [metrics, setMetrics] = useState({
    fontLoadTime: 0,
    animationFPS: 0,
    isOptimized: false,
  });
  const observerRef = useRef<PerformanceObserver | null>(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    // Track font loading performance
    const trackFontLoading = () => {
      if ('fonts' in document) {
        const startTime = performance.now();
        
        document.fonts.ready.then(() => {
          const loadTime = performance.now() - startTime;
          setMetrics(prev => ({
            ...prev,
            fontLoadTime: Math.round(loadTime),
            isOptimized: loadTime < 300, // Target: under 300ms
          }));
        });
      }

      // Track font loading via Performance Observer
      if (typeof PerformanceObserver !== 'undefined') {
        try {
          observerRef.current = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              if (entry.name.includes('font') && process.env.NODE_ENV === 'development') {
                console.info(`Font loaded: ${entry.name} in ${Math.round(entry.duration)}ms`);
              }
            });
          });
          
          observerRef.current.observe({ entryTypes: ['resource'] });
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('PerformanceObserver not supported:', error);
          }
        }
      }
    };

    // Track animation performance
    const trackAnimationPerformance = () => {
      const measureFPS = (currentTime: number) => {
        frameCountRef.current++;
        
        if (currentTime - lastTimeRef.current >= 1000) {
          const fps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current));
          
          setMetrics(prev => ({
            ...prev,
            animationFPS: fps,
          }));
          
          frameCountRef.current = 0;
          lastTimeRef.current = currentTime;
        }
        
        requestAnimationFrame(measureFPS);
      };
      
      requestAnimationFrame((time) => {
        lastTimeRef.current = time;
        measureFPS(time);
      });
    };

    // Optimize animation performance
    const optimizeAnimations = () => {
      // Automatically reset will-change after animations complete
      const handleAnimationEnd = (event: AnimationEvent) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('animate-fade-in-up')) {
          target.classList.add('animation-complete');
        }
      };

      // Optimize transforms for touch devices
      const optimizeForTouch = () => {
        if ('ontouchstart' in window) {
          document.documentElement.style.setProperty('--transition-fast', 'transform 0.15s ease-out, opacity 0.1s ease-out');
        }
      };

      // Reduce animations on low-end devices
      const optimizeForDevice = () => {
        type NetworkInformation = {
          effectiveType?: string;
        };
        const connection = (navigator as typeof navigator & { connection?: NetworkInformation; mozConnection?: NetworkInformation; webkitConnection?: NetworkInformation }).connection || 
                          (navigator as typeof navigator & { connection?: NetworkInformation; mozConnection?: NetworkInformation; webkitConnection?: NetworkInformation }).mozConnection || 
                          (navigator as typeof navigator & { connection?: NetworkInformation; mozConnection?: NetworkInformation; webkitConnection?: NetworkInformation }).webkitConnection;
        
        if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
          document.body.classList.add('performance-reduced');
          
          // Add performance reduction CSS
          const style = document.createElement('style');
          style.textContent = `
            .performance-reduced .animate-silk-sway,
            .performance-reduced .animate-silk-breathe,
            .performance-reduced .animate-needle-gleam,
            .performance-reduced .animate-web-pulse {
              animation-duration: 6s !important;
            }
            .performance-reduced .mystical-glow {
              will-change: auto !important;
              contain: none !important;
            }
          `;
          document.head.appendChild(style);
        }
      };

      document.addEventListener('animationend', handleAnimationEnd);
      optimizeForTouch();
      optimizeForDevice();

      return () => {
        document.removeEventListener('animationend', handleAnimationEnd);
      };
    };

    trackFontLoading();
    trackAnimationPerformance();
    const cleanupAnimations = optimizeAnimations();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      cleanupAnimations();
    };
  }, []);

  // Development mode performance display
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg text-sm font-mono">
        <div>Font Load: {metrics.fontLoadTime}ms {metrics.isOptimized ? '✅' : '⚠️'}</div>
        <div>Animation FPS: {metrics.animationFPS}</div>
        <div className="text-xs text-gray-400 mt-1">Performance Monitor</div>
      </div>
    );
  }

  return null;
}

/**
 * Performance measurement utilities
 */
export const performanceUtils = {
  // Measure font load time
  measureFontLoad: async (fontFamily: string): Promise<number> => {
    const startTime = performance.now();
    
    if ('fonts' in document) {
      await document.fonts.load(`1em ${fontFamily}`);
      return performance.now() - startTime;
    }
    
    return 0;
  },

  // Measure animation performance
  measureAnimationPerformance: (callback: (fps: number) => void): (() => void) => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measure = (currentTime: number) => {
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        callback(fps);
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measure);
    };
    
    animationId = requestAnimationFrame(measure);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  },

  // Get performance metrics
  getPerformanceMetrics: () => {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      
      return {
      // Core Web Vitals approximation
      fcp: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
      lcp: navigation 
        ? (navigation.loadEventEnd - navigation.fetchStart) 
        : (paintEntries.find(entry => entry.name === 'largest-contentful-paint')?.startTime || 0),
      cls: 0, // Would need more complex measurement
      
      // Navigation timing metrics (using modern API)
      domContentLoaded: navigation ? (navigation.domContentLoadedEventEnd - navigation.fetchStart) : 0,
      loadComplete: navigation ? (navigation.loadEventEnd - navigation.fetchStart) : 0,
      ttfb: navigation ? (navigation.responseStart - navigation.requestStart) : 0, // Time to First Byte
      
      // Font metrics
      fontLoadTime: Array.from(document.fonts).length,
      
      // Memory usage (if available)
      memory: (performance as typeof performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory ? {
        used: Math.round((performance as typeof performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round((performance as typeof performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round((performance as typeof performance & { memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory.jsHeapSizeLimit / 1024 / 1024),
      } : null,
    };
    } catch (error) {
      console.warn('Failed to collect performance metrics:', error);
      return {
        fcp: 0,
        lcp: 0,
        cls: 0,
        domContentLoaded: 0,
        loadComplete: 0,
        ttfb: 0,
        fontLoadTime: 0,
        memory: null,
      };
    }
  },
};