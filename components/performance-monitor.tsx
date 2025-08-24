'use client';

import { useEffect } from 'react';
import { initWebVitals, WebVitalMetric } from '@/lib/web-vitals';

export function PerformanceMonitor() {
  useEffect(() => {
    // Initialize web vitals monitoring
    initWebVitals((metric: WebVitalMetric) => {
      // Send to analytics service (example: Vercel Analytics, Google Analytics, etc.)
      if (typeof window !== 'undefined') {
        // Send to Google Analytics 4 (if available)
        if ((window as any).gtag) {
          (window as any).gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: metric.name,
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            custom_map: {
              metric_id: metric.id,
              metric_rating: metric.rating,
              metric_delta: metric.delta,
            },
          });
        }

        // Send to Vercel Analytics (if available)
        if ((window as any).va) {
          (window as any).va('track', 'Web Vital', {
            name: metric.name,
            value: Math.round(metric.value),
            rating: metric.rating,
            delta: Math.round(metric.delta),
            id: metric.id,
          });
        }

        // Custom analytics endpoint (optional)
        fetch('/api/analytics/web-vitals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            id: metric.id,
            url: window.location.pathname,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
          }),
        }).catch((error) => {
          console.warn('Failed to send web vitals to analytics:', error);
        });
      }
    });

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) { // Long task threshold
              console.warn(`🐌 Long task detected: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
              
              // Send long task data to analytics
              if (typeof window !== 'undefined' && (window as any).va) {
                (window as any).va('track', 'Long Task', {
                  duration: Math.round(entry.duration),
                  name: entry.name,
                  startTime: Math.round(entry.startTime),
                });
              }
            }
          });
        });

        observer.observe({ entryTypes: ['longtask'] });

        // Cleanup on unmount
        return () => {
          observer.disconnect();
        };
      } catch (error) {
        console.warn('Long task monitoring not supported:', error);
      }
    }

    // Monitor resource timing
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            const resource = entry as PerformanceResourceTiming;
            
            // Flag slow resources
            if (resource.duration > 1000) { // > 1s
              console.warn(`🐌 Slow resource: ${resource.name} (${resource.duration.toFixed(2)}ms)`);
            }
            
            // Monitor failed resources
            if (resource.transferSize === 0 && resource.decodedBodySize === 0) {
              console.error(`❌ Failed to load resource: ${resource.name}`);
            }
          });
        });

        resourceObserver.observe({ entryTypes: ['resource'] });

        return () => {
          resourceObserver.disconnect();
        };
      } catch (error) {
        console.warn('Resource timing monitoring not supported:', error);
      }
    }
  }, []);

  // This component doesn't render anything visible
  return null;
}