/**
 * Image optimization utilities for better Core Web Vitals performance
 */

/**
 * Generate optimized blur placeholder for hero images
 * @param width - Image width (optional)
 * @param height - Image height (optional)
 * @returns Data URL for blur placeholder
 */
export function generateBlurPlaceholder(width = 10, height = 6): string {
  // Create a tiny gradient that matches the Silksong aesthetic
  const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null;
  
  if (!canvas) {
    // Server-side fallback - optimized base64 placeholder
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAGAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAGAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';
  }

  // Create a gradient that matches Silksong's dark, moody aesthetic
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1a1a2e'); // Dark purple-blue
  gradient.addColorStop(0.5, '#16213e'); // Darker blue
  gradient.addColorStop(1, '#0f1419'); // Very dark

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

/**
 * Preload critical images for better LCP
 * @param images - Array of image URLs to preload
 */
export function preloadCriticalImages(images: string[]): void {
  if (typeof window === 'undefined') return;

  images.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.crossOrigin = 'anonymous';
    
    // Add formats hint for modern browsers
    if (src.includes('.webp')) {
      link.type = 'image/webp';
    } else if (src.includes('.avif')) {
      link.type = 'image/avif';
    }
    
    document.head.appendChild(link);
  });
}

/**
 * Generate responsive image sizes string
 * @param breakpoints - Object with breakpoints and sizes
 * @returns Sizes string for responsive images
 */
export function generateSizes(breakpoints: Record<string, string> = {
  '(max-width: 640px)': '100vw',
  '(max-width: 1024px)': '100vw',
  '(max-width: 1536px)': '100vw'
}): string {
  const entries = Object.entries(breakpoints);
  const sizesArray = entries.map(([breakpoint, size]) => `${breakpoint} ${size}`);
  sizesArray.push('100vw'); // Fallback
  return sizesArray.join(', ');
}

/**
 * Optimize image quality based on connection speed
 * @returns Optimal quality setting
 */
export function getOptimalQuality(): number {
  if (typeof window === 'undefined') return 85;
  
  // Check for slow connection
  const connection = (navigator as any)?.connection;
  if (connection) {
    if (connection.effectiveType === '2g' || connection.saveData) {
      return 70; // Lower quality for slow connections
    }
    if (connection.effectiveType === '3g') {
      return 80;
    }
  }
  
  return 85; // Default quality
}

/**
 * Check if browser supports modern image formats
 * @param format - Image format to check
 * @returns Boolean indicating support
 */
export function supportsImageFormat(format: 'webp' | 'avif'): boolean {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL(`image/${format}`).indexOf(`data:image/${format}`) === 0;
}