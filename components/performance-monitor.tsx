'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onLCP, onINP, onTTFB, type Metric } from 'web-vitals';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    va?: (...args: any[]) => void;
  }
}

/**
 * Simplified Performance Monitor
 * - Zero console output in production
 * - Direct integration with Google Analytics and Vercel Analytics
 * - Only tracks Core Web Vitals
 * - No complex batching or custom APIs
 */
export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Send metric to analytics services
    function sendToAnalytics(metric: Metric) {
      // Send to Google Analytics if available
      if (window.gtag) {
        window.gtag('event', 'web_vitals', {
          event_category: 'Web Vitals',
          event_label: metric.name,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          custom_map: {
            metric_id: metric.id,
            metric_delta: metric.delta,
          },
        });
      }

      // Send to Vercel Analytics if available
      if (window.va) {
        window.va('track', 'Web Vital', {
          name: metric.name,
          value: Math.round(metric.value),
          delta: Math.round(metric.delta),
          id: metric.id,
        });
      }

      // Development-only logging
      if (process.env.NODE_ENV === 'development') {
        const rating = getRating(metric.name, metric.value);
        const color = rating === 'good' ? '🟢' : rating === 'needs-improvement' ? '🟡' : '🔴';
        console.log(`${color} ${metric.name}: ${metric.value.toFixed(2)}${getUnit(metric.name)} (${rating})`);
      }
    }

    // Initialize Web Vitals monitoring
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onINP(sendToAnalytics);
    onCLS(sendToAnalytics);
    onTTFB(sendToAnalytics);

    // Development-only initialization log
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Performance Monitor initialized - tracking Core Web Vitals');
    }
  }, []);

  // This component doesn't render anything
  return null;
}

// Helper functions for development logging
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, { good: number; needsImprovement: number }> = {
    FCP: { good: 1800, needsImprovement: 3000 },
    LCP: { good: 2500, needsImprovement: 4000 },
    INP: { good: 200, needsImprovement: 500 },
    CLS: { good: 0.1, needsImprovement: 0.25 },
    TTFB: { good: 800, needsImprovement: 1800 },
  };

  const threshold = thresholds[name];
  if (!threshold) return 'poor';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

function getUnit(name: string): string {
  return name === 'CLS' ? '' : 'ms';
}