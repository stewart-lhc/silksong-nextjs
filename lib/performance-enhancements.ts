/**
 * Performance enhancement utilities specifically for image optimization and LCP improvements
 */

/**
 * Image loading performance metrics
 */
export interface ImagePerformanceMetrics {
  imageUrl: string;
  loadTime: number;
  format: 'webp' | 'avif' | 'png' | 'jpg' | 'gif';
  size: number;
  wasPreloaded: boolean;
  failedToLoad: boolean;
  fallbackUsed: boolean;
}

/**
 * Track image loading performance for LCP optimization
 */
export function trackImagePerformance(imageElement: HTMLImageElement): Promise<ImagePerformanceMetrics> {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const imageUrl = imageElement.src;
    const format = getImageFormat(imageUrl);
    
    const onLoad = () => {
      const loadTime = performance.now() - startTime;
      const wasPreloaded = checkIfPreloaded(imageUrl);
      
      resolve({
        imageUrl,
        loadTime,
        format,
        size: imageElement.naturalWidth * imageElement.naturalHeight,
        wasPreloaded,
        failedToLoad: false,
        fallbackUsed: false
      });
    };

    const onError = () => {
      const loadTime = performance.now() - startTime;
      
      resolve({
        imageUrl,
        loadTime,
        format,
        size: 0,
        wasPreloaded: checkIfPreloaded(imageUrl),
        failedToLoad: true,
        fallbackUsed: false
      });
    };

    if (imageElement.complete) {
      onLoad();
    } else {
      imageElement.addEventListener('load', onLoad, { once: true });
      imageElement.addEventListener('error', onError, { once: true });
    }
  });
}

/**
 * Get image format from URL
 */
function getImageFormat(url: string): 'webp' | 'avif' | 'png' | 'jpg' | 'gif' {
  if (url.includes('.webp')) return 'webp';
  if (url.includes('.avif')) return 'avif';
  if (url.includes('.png')) return 'png';
  if (url.includes('.gif')) return 'gif';
  return 'jpg';
}

/**
 * Check if image was preloaded
 */
function checkIfPreloaded(imageUrl: string): boolean {
  if (typeof document === 'undefined') return false;
  
  const preloadLinks = document.querySelectorAll('link[rel="preload"][as="image"]');
  return Array.from(preloadLinks).some(link => 
    (link as HTMLLinkElement).href.includes(imageUrl.split('/').pop() || '')
  );
}

/**
 * Optimize image loading order for better LCP
 */
export function optimizeImageLoadingOrder(images: HTMLImageElement[]): void {
  // Sort images by their position in viewport (closer to top = higher priority)
  const sortedImages = images.sort((a, b) => {
    const rectA = a.getBoundingClientRect();
    const rectB = b.getBoundingClientRect();
    return rectA.top - rectB.top;
  });

  // Apply loading priorities
  sortedImages.forEach((img, index) => {
    if (index === 0) {
      // First image gets highest priority (LCP candidate)
      img.loading = 'eager';
      img.fetchPriority = 'high';
    } else if (index < 3) {
      // Next few images get medium priority
      img.loading = 'eager';
      img.fetchPriority = 'auto';
    } else {
      // Rest get lazy loading
      img.loading = 'lazy';
      img.fetchPriority = 'low';
    }
  });
}

/**
 * Analyze LCP element and provide optimization suggestions
 */
export function analyzeLCPElement(): Promise<{
  element: Element | null;
  isImage: boolean;
  optimizationSuggestions: string[];
  currentMetrics: {
    url?: string;
    size?: string;
    format?: string;
    hasBlurPlaceholder?: boolean;
    isPrioritized?: boolean;
  };
}> {
  return new Promise((resolve) => {
    // Use the LCP API to identify the LCP element
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      
      if (lastEntry && lastEntry.element) {
        const element = lastEntry.element;
        const isImage = element.tagName === 'IMG' || element.style.backgroundImage;
        
        const suggestions: string[] = [];
        const currentMetrics: any = {};

        if (isImage) {
          if (element.tagName === 'IMG') {
            const img = element as HTMLImageElement;
            currentMetrics.url = img.src;
            currentMetrics.size = `${img.naturalWidth}x${img.naturalHeight}`;
            currentMetrics.format = getImageFormat(img.src);
            currentMetrics.hasBlurPlaceholder = !!img.getAttribute('placeholder');
            currentMetrics.isPrioritized = img.loading === 'eager' || img.fetchPriority === 'high';

            if (!currentMetrics.isPrioritized) {
              suggestions.push('Add priority="high" and loading="eager" to LCP image');
            }
            if (!currentMetrics.hasBlurPlaceholder) {
              suggestions.push('Add blur placeholder for better perceived performance');
            }
            if (!currentMetrics.format.includes('webp') && !currentMetrics.format.includes('avif')) {
              suggestions.push('Use modern image formats (WebP/AVIF) for better compression');
            }
          } else {
            // Background image
            const bgImage = element.style.backgroundImage;
            currentMetrics.url = bgImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
            suggestions.push('Consider using <img> with object-fit instead of background-image for better optimization');
          }
        }

        resolve({
          element,
          isImage,
          optimizationSuggestions: suggestions,
          currentMetrics
        });
      }
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });

    // Timeout after 10 seconds
    setTimeout(() => {
      observer.disconnect();
      resolve({
        element: null,
        isImage: false,
        optimizationSuggestions: ['Could not identify LCP element'],
        currentMetrics: {}
      });
    }, 10000);
  });
}

/**
 * Generate comprehensive image optimization report
 */
export async function generateImageOptimizationReport(): Promise<{
  totalImages: number;
  optimizedImages: number;
  unoptimizedImages: string[];
  averageLoadTime: number;
  largestImage: { url: string; size: number };
  recommendations: string[];
}> {
  const images = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];
  const report = {
    totalImages: images.length,
    optimizedImages: 0,
    unoptimizedImages: [] as string[],
    averageLoadTime: 0,
    largestImage: { url: '', size: 0 },
    recommendations: [] as string[]
  };

  const loadTimes: number[] = [];
  
  for (const img of images) {
    try {
      const metrics = await trackImagePerformance(img);
      loadTimes.push(metrics.loadTime);
      
      // Check if image is optimized
      const isModernFormat = metrics.format === 'webp' || metrics.format === 'avif';
      const hasAppropriateSize = metrics.size < 2000000; // Less than 2MP
      const loadedQuickly = metrics.loadTime < 1000;
      
      if (isModernFormat && hasAppropriateSize && loadedQuickly) {
        report.optimizedImages++;
      } else {
        report.unoptimizedImages.push(img.src);
      }

      // Track largest image
      if (metrics.size > report.largestImage.size) {
        report.largestImage = { url: img.src, size: metrics.size };
      }
    } catch (error) {
      report.unoptimizedImages.push(img.src);
    }
  }

  // Calculate average load time
  report.averageLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length || 0;

  // Generate recommendations
  if (report.unoptimizedImages.length > 0) {
    report.recommendations.push(`${report.unoptimizedImages.length} images need optimization`);
  }
  if (report.averageLoadTime > 500) {
    report.recommendations.push('Average image load time is above 500ms - consider preloading critical images');
  }
  if (report.largestImage.size > 1000000) {
    report.recommendations.push('Largest image is over 1MB - consider compression or responsive sizing');
  }

  return report;
}

/**
 * Development-only function to log optimization report
 */
export async function logImageOptimizationReport(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return;
  
  try {
    const report = await generateImageOptimizationReport();
    const lcpAnalysis = await analyzeLCPElement();
    
    console.group('🖼️ Image Optimization Report');
    console.log(`📊 Total Images: ${report.totalImages}`);
    console.log(`✅ Optimized: ${report.optimizedImages} (${Math.round(report.optimizedImages / report.totalImages * 100)}%)`);
    console.log(`⚡ Average Load Time: ${Math.round(report.averageLoadTime)}ms`);
    
    if (report.unoptimizedImages.length > 0) {
      console.warn('🚨 Unoptimized Images:', report.unoptimizedImages.slice(0, 5));
    }
    
    if (report.recommendations.length > 0) {
      console.log('💡 Recommendations:', report.recommendations);
    }
    
    if (lcpAnalysis.element) {
      console.group('🎯 LCP Element Analysis');
      console.log('Element:', lcpAnalysis.element);
      console.log('Is Image:', lcpAnalysis.isImage);
      console.log('Current Metrics:', lcpAnalysis.currentMetrics);
      if (lcpAnalysis.optimizationSuggestions.length > 0) {
        console.log('Suggestions:', lcpAnalysis.optimizationSuggestions);
      }
      console.groupEnd();
    }
    
    console.groupEnd();
  } catch (error) {
    console.error('Failed to generate image optimization report:', error);
  }
}