import { onCLS, onFCP, onLCP, onINP, onTTFB, Metric } from 'web-vitals';

// Performance thresholds for Core Web Vitals
export const WEB_VITALS_THRESHOLDS = {
  FCP: { good: 1800, needs_improvement: 3000 }, // First Contentful Paint
  LCP: { good: 2500, needs_improvement: 4000 }, // Largest Contentful Paint
  INP: { good: 200, needs_improvement: 500 },   // Interaction to Next Paint
  CLS: { good: 0.1, needs_improvement: 0.25 },  // Cumulative Layout Shift
  TTFB: { good: 800, needs_improvement: 1800 }, // Time to First Byte
} as const;

// Enhanced performance analytics interface
export interface WebVitalMetric extends Metric {
  rating: 'good' | 'needs-improvement' | 'poor';
}

// Rate the performance metric
function rateMetric(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const key = name as keyof typeof WEB_VITALS_THRESHOLDS;
  const thresholds = WEB_VITALS_THRESHOLDS[key];
  
  if (!thresholds) return 'poor';
  
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needs_improvement) return 'needs-improvement';
  return 'poor';
}

// Enhanced metric processing with detailed analytics
function processMetric(metric: Metric, callback?: (metric: WebVitalMetric) => void) {
  const enhancedMetric = metric as WebVitalMetric;
  enhancedMetric.rating = rateMetric(metric.name, metric.value);
  
  // Log performance issues in development
  if (process.env.NODE_ENV === 'development') {
    const color = enhancedMetric.rating === 'good' ? '🟢' : 
                  enhancedMetric.rating === 'needs-improvement' ? '🟡' : '🔴';
    console.log(`${color} ${enhancedMetric.name}: ${enhancedMetric.value.toFixed(2)}ms (${enhancedMetric.rating})`);
    
    // Provide specific optimization hints
    if (enhancedMetric.rating !== 'good') {
      switch (enhancedMetric.name) {
        case 'FCP':
          console.warn('📋 FCP Optimization: Consider reducing render-blocking resources, optimizing critical CSS, or implementing resource preloading');
          break;
        case 'LCP':
          console.warn('📋 LCP Optimization: Optimize largest contentful element (images, text blocks), implement lazy loading, or use next/image optimization');
          break;
        case 'INP':
          console.warn('📋 INP Optimization: Reduce JavaScript execution time, break up long tasks, or implement code splitting');
          break;
        case 'CLS':
          console.warn('📋 CLS Optimization: Set size attributes on images/videos, avoid inserting content above existing content, or use CSS transform');
          break;
        case 'TTFB':
          console.warn('📋 TTFB Optimization: Optimize server response time, implement CDN, or use Next.js caching');
          break;
      }
    }
  }
  
  // Send to analytics or callback
  if (callback) {
    callback(enhancedMetric);
  }
  
  // Send to Vercel Analytics (if available)
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('track', 'Web Vital', {
      name: enhancedMetric.name,
      value: Math.round(enhancedMetric.value),
      rating: enhancedMetric.rating,
      delta: Math.round(enhancedMetric.delta),
      id: enhancedMetric.id,
    });
  }
  
  // Store in session storage for debugging
  if (typeof window !== 'undefined') {
    try {
      const existingMetrics = JSON.parse(sessionStorage.getItem('webVitals') || '[]');
      existingMetrics.push({
        ...enhancedMetric,
        timestamp: Date.now(),
        url: window.location.pathname,
        userAgent: navigator.userAgent,
      });
      
      // Keep only the last 50 metrics
      sessionStorage.setItem('webVitals', JSON.stringify(existingMetrics.slice(-50)));
    } catch (error) {
      console.error('Failed to store web vital metric:', error);
    }
  }
}

// Initialize Web Vitals monitoring for Next.js
export function initWebVitals(callback?: (metric: WebVitalMetric) => void) {
  try {
    // Monitor all Core Web Vitals
    onFCP((metric) => processMetric(metric, callback));
    onLCP((metric) => processMetric(metric, callback));
    onINP((metric) => processMetric(metric, callback));
    onCLS((metric) => processMetric(metric, callback));
    onTTFB((metric) => processMetric(metric, callback));

    console.log('🚀 Web Vitals monitoring initialized for Next.js');
  } catch (error) {
    console.error('Failed to initialize Web Vitals:', error);
  }
}

// Get current performance metrics synchronously
export function getCurrentWebVitals(): Promise<WebVitalMetric[]> {
  return new Promise((resolve) => {
    const metrics: WebVitalMetric[] = [];
    let completed = 0;
    const total = 5;
    
    const checkComplete = () => {
      completed++;
      if (completed >= total) {
        resolve(metrics);
      }
    };
    
    // Collect all current metrics using the on* functions
    onFCP((metric) => {
      const enhancedMetric = metric as WebVitalMetric;
      enhancedMetric.rating = rateMetric(metric.name, metric.value);
      metrics.push(enhancedMetric);
      checkComplete();
    });
    
    onLCP((metric) => {
      const enhancedMetric = metric as WebVitalMetric;
      enhancedMetric.rating = rateMetric(metric.name, metric.value);
      metrics.push(enhancedMetric);
      checkComplete();
    });
    
    onINP((metric) => {
      const enhancedMetric = metric as WebVitalMetric;
      enhancedMetric.rating = rateMetric(metric.name, metric.value);
      metrics.push(enhancedMetric);
      checkComplete();
    });
    
    onCLS((metric) => {
      const enhancedMetric = metric as WebVitalMetric;
      enhancedMetric.rating = rateMetric(metric.name, metric.value);
      metrics.push(enhancedMetric);
      checkComplete();
    });
    
    onTTFB((metric) => {
      const enhancedMetric = metric as WebVitalMetric;
      enhancedMetric.rating = rateMetric(metric.name, metric.value);
      metrics.push(enhancedMetric);
      checkComplete();
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      resolve(metrics);
    }, 5000);
  });
}

// Performance budget checker adapted for Next.js
export async function checkPerformanceBudget(): Promise<boolean> {
  try {
    const metrics = await getCurrentWebVitals();
    const issues: string[] = [];
    
    metrics.forEach((metric) => {
      if (metric.rating === 'poor') {
        issues.push(`${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
      }
    });
    
    if (issues.length > 0) {
      console.warn('⚠️ Performance Budget Exceeded:', issues);
      return false;
    } else {
      console.log('✅ Performance Budget: All metrics within acceptable range');
      return true;
    }
  } catch (error) {
    console.error('Error checking performance budget:', error);
    return false;
  }
}

// Export for Next.js app integration
export { onCLS, onFCP, onLCP, onINP, onTTFB };

// Hook for React components to monitor web vitals
export function useWebVitals(callback?: (metric: WebVitalMetric) => void) {
  if (typeof window !== 'undefined') {
    initWebVitals(callback);
  }
}