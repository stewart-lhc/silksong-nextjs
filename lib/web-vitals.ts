import { onCLS, onFCP, onLCP, onINP, onTTFB, type Metric } from 'web-vitals';

// Core Web Vitals thresholds
export const WEB_VITALS_THRESHOLDS = {
  FCP: { good: 1800, needsImprovement: 3000 },
  LCP: { good: 2500, needsImprovement: 4000 },
  INP: { good: 200, needsImprovement: 500 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  TTFB: { good: 800, needsImprovement: 1800 },
} as const;

// Enhanced metric interface
export interface WebVitalMetric extends Metric {
  rating: 'good' | 'needs-improvement' | 'poor';
}

// Rate a performance metric
function rateMetric(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const key = name as keyof typeof WEB_VITALS_THRESHOLDS;
  const thresholds = WEB_VITALS_THRESHOLDS[key];
  
  if (!thresholds) return 'poor';
  
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
}

// Process and enhance metric with rating
function processMetric(metric: Metric, callback?: (metric: WebVitalMetric) => void) {
  const enhancedMetric = metric as WebVitalMetric;
  enhancedMetric.rating = rateMetric(metric.name, metric.value);
  
  // Send to callback if provided
  if (callback) {
    callback(enhancedMetric);
  }
}

/**
 * Initialize Web Vitals monitoring
 * Simplified version that only tracks Core Web Vitals and sends to callback
 */
export function initWebVitals(callback?: (metric: WebVitalMetric) => void) {
  try {
    onFCP((metric) => processMetric(metric, callback));
    onLCP((metric) => processMetric(metric, callback));
    onINP((metric) => processMetric(metric, callback));
    onCLS((metric) => processMetric(metric, callback));
    onTTFB((metric) => processMetric(metric, callback));
  } catch (error) {
    // Silent error handling in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to initialize Web Vitals:', error);
    }
  }
}

// Re-export web-vitals functions for direct usage
export { onCLS, onFCP, onLCP, onINP, onTTFB };

// Hook for React components
export function useWebVitals(callback?: (metric: WebVitalMetric) => void) {
  if (typeof window !== 'undefined') {
    initWebVitals(callback);
  }
}