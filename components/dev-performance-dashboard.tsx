'use client';

import { useEffect, useState } from 'react';
import { 
  generateImageOptimizationReport, 
  analyzeLCPElement,
  logImageOptimizationReport 
} from '@/lib/performance-enhancements';
import { useWebVitals, WebVitalMetric } from '@/lib/web-vitals';

interface PerformanceData {
  webVitals: WebVitalMetric[];
  imageReport?: {
    totalImages: number;
    optimizedImages: number;
    averageLoadTime: number;
    recommendations: string[];
  };
  lcpAnalysis?: {
    isImage: boolean;
    optimizationSuggestions: string[];
  };
}

/**
 * Development-only performance dashboard
 * Shows real-time performance metrics and optimization suggestions
 */
export function DevPerformanceDashboard() {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    webVitals: []
  });
  const [isVisible, setIsVisible] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Track Web Vitals - always call hooks unconditionally
  useWebVitals((metric) => {
    if (!isDevelopment) return;
    
    setPerformanceData(prev => ({
      ...prev,
      webVitals: [...prev.webVitals.filter(m => m.name !== metric.name), metric]
    }));
  });

  // Load performance reports
  useEffect(() => {
    if (!isDevelopment) return;

    const loadReports = async () => {
      try {
        const [imageReport, lcpAnalysis] = await Promise.all([
          generateImageOptimizationReport(),
          analyzeLCPElement()
        ]);

        setPerformanceData(prev => ({
          ...prev,
          imageReport: {
            totalImages: imageReport.totalImages,
            optimizedImages: imageReport.optimizedImages,
            averageLoadTime: imageReport.averageLoadTime,
            recommendations: imageReport.recommendations
          },
          lcpAnalysis: {
            isImage: lcpAnalysis.isImage,
            optimizationSuggestions: lcpAnalysis.optimizationSuggestions
          }
        }));

        // Log comprehensive report to console
        await logImageOptimizationReport();
      } catch (error) {
        console.error('Failed to load performance reports:', error);
      }
    };

    // Load reports after page is interactive
    if (document.readyState === 'complete') {
      setTimeout(loadReports, 2000);
    } else {
      window.addEventListener('load', () => setTimeout(loadReports, 2000));
    }
  }, [isDevelopment]);

  // Keyboard shortcut to toggle dashboard
  useEffect(() => {
    if (!isDevelopment) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible, isDevelopment]);

  // Only show in development - moved after all hooks
  if (!isDevelopment) {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-purple-600 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-mono hover:bg-purple-700 transition-colors"
          title="Open Performance Dashboard (Ctrl+Shift+P)"
        >
          📊 Perf
        </button>
      </div>
    );
  }

  const getVitalRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-400';
      case 'needs-improvement': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getVitalEmoji = (rating: string) => {
    switch (rating) {
      case 'good': return '🟢';
      case 'needs-improvement': return '🟡';
      case 'poor': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 max-w-md w-80 font-mono text-xs text-white shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-purple-400">🚀 Performance Dashboard</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Web Vitals */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-blue-400 mb-2">Core Web Vitals</h4>
        {performanceData.webVitals.length > 0 ? (
          <div className="space-y-1">
            {performanceData.webVitals.map((vital) => (
              <div key={vital.name} className="flex items-center justify-between">
                <span className="text-gray-300">{vital.name}</span>
                <span className={`flex items-center gap-1 ${getVitalRatingColor(vital.rating)}`}>
                  {getVitalEmoji(vital.rating)}
                  {Math.round(vital.value)}{vital.name === 'CLS' ? '' : 'ms'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">Loading vitals...</div>
        )}
      </div>

      {/* Image Performance */}
      {performanceData.imageReport && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-green-400 mb-2">🖼️ Image Performance</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-300">Total Images</span>
              <span>{performanceData.imageReport.totalImages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Optimized</span>
              <span className="text-green-400">
                {performanceData.imageReport.optimizedImages}/
                {performanceData.imageReport.totalImages}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Avg Load Time</span>
              <span className={
                performanceData.imageReport.averageLoadTime > 1000 ? 'text-red-400' :
                performanceData.imageReport.averageLoadTime > 500 ? 'text-yellow-400' :
                'text-green-400'
              }>
                {Math.round(performanceData.imageReport.averageLoadTime)}ms
              </span>
            </div>
          </div>
        </div>
      )}

      {/* LCP Analysis */}
      {performanceData.lcpAnalysis && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-orange-400 mb-2">🎯 LCP Analysis</h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-300">LCP is Image</span>
              <span className={performanceData.lcpAnalysis.isImage ? 'text-green-400' : 'text-gray-400'}>
                {performanceData.lcpAnalysis.isImage ? 'Yes' : 'No'}
              </span>
            </div>
            {performanceData.lcpAnalysis.optimizationSuggestions.length > 0 && (
              <div>
                <div className="text-gray-300 mb-1">Suggestions:</div>
                <div className="text-yellow-400 text-xs space-y-1">
                  {performanceData.lcpAnalysis.optimizationSuggestions.slice(0, 2).map((suggestion, i) => (
                    <div key={i}>• {suggestion}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {performanceData.imageReport?.recommendations && performanceData.imageReport.recommendations.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-red-400 mb-2">⚠️ Recommendations</h4>
          <div className="space-y-1 text-red-300">
            {performanceData.imageReport.recommendations.slice(0, 3).map((rec, i) => (
              <div key={i} className="text-xs">• {rec}</div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-500">
        Press Ctrl+Shift+P to toggle • Check console for detailed logs
      </div>
    </div>
  );
}