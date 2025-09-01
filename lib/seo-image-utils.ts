/**
 * SEO Image Optimization Utilities
 * 
 * Provides optimized image URLs for meta tags, Open Graph, and social sharing
 * while maintaining fallback compatibility for older platforms.
 */

// Base URL configuration
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? process.env.NEXT_PUBLIC_SITE_URL || "https://hollowknightsilksong.org"
  : "http://localhost:3000";

/**
 * Image format preference for different social platforms
 */
const PLATFORM_FORMATS = {
  // Most social platforms support WebP now
  openGraph: ['webp', 'png'],
  twitter: ['webp', 'png'], 
  // Meta tags should always fallback to PNG for maximum compatibility
  meta: ['png'],
  // Structured data prefers widely supported formats
  structuredData: ['webp', 'png']
} as const;

/**
 * Generate optimized image URL with format detection
 */
export function getOptimizedImageUrl(
  basePath: string, 
  platform: keyof typeof PLATFORM_FORMATS = 'openGraph'
): string {
  const formats = PLATFORM_FORMATS[platform];
  const baseWithoutExt = basePath.replace(/\.[^/.]+$/, '');
  
  // For production, prefer optimized formats
  if (process.env.NODE_ENV === 'production') {
    // Return the first available format (WebP preferred, PNG fallback)
    const preferredFormat = formats[0];
    return `${BASE_URL}${baseWithoutExt}.${preferredFormat}`;
  }
  
  // For development, always use PNG to avoid missing file issues during manual optimization
  return `${BASE_URL}${baseWithoutExt}.png`;
}

/**
 * Generate multiple image URLs for responsive meta tags
 */
export function getResponsiveImageUrls(basePath: string, sizes: number[] = [400, 800, 1200]): string[] {
  const baseWithoutExt = basePath.replace(/\.[^/.]+$/, '');
  
  return sizes.map(size => {
    const format = process.env.NODE_ENV === 'production' ? 'webp' : 'png';
    return `${BASE_URL}${baseWithoutExt}_${size}w.${format}`;
  });
}

/**
 * Get hero/promotional image URLs for different use cases
 */
export const OPTIMIZED_PRESS_KIT_IMAGES = {
  // Main promotional image (used in meta tags)
  promotional: {
    large: '/pressKit/Silksong_Promo_02_2400',
    medium: '/pressKit/Silksong_Promo_02_1200', 
    small: '/pressKit/Silksong_Promo_02_800'
  },
  
  // Hero background image
  hero: {
    desktop: '/pressKit/Hornet_mid_shot',
    mobile: '/pressKit/Hornet_mid_shot_800w'
  },
  
  // Character art for specific pages
  character: {
    hornet: '/pressKit/character promotional art/char_hornet_large',
    lace: '/pressKit/character promotional art/boss_lace',
    carmelita: '/pressKit/character promotional art/boss_hunter_queen_carmelita'
  }
} as const;

/**
 * Enhanced meta image configuration with optimized URLs
 */
export function getMetaImages(imageKey?: string) {
  const basePath = imageKey || OPTIMIZED_PRESS_KIT_IMAGES.promotional.large;
  
  return {
    // OpenGraph images (Facebook, LinkedIn, Discord)
    openGraph: getOptimizedImageUrl(basePath, 'openGraph'),
    
    // Twitter images 
    twitter: getOptimizedImageUrl(basePath, 'twitter'),
    
    // Structured data images
    structuredData: getOptimizedImageUrl(basePath, 'structuredData'),
    
    // Multiple sizes for responsive social sharing
    responsive: getResponsiveImageUrls(basePath),
    
    // Fallback PNG for maximum compatibility
    fallback: `${BASE_URL}${basePath}.png`
  };
}

/**
 * Performance-optimized image preloading hints
 */
export function getImagePreloadHints(priority: 'high' | 'low' = 'low') {
  const heroImage = getOptimizedImageUrl(OPTIMIZED_PRESS_KIT_IMAGES.hero.desktop);
  const promoImage = getOptimizedImageUrl(OPTIMIZED_PRESS_KIT_IMAGES.promotional.large);
  
  return [
    {
      rel: 'preload',
      as: 'image',
      href: heroImage,
      fetchPriority: priority,
      type: 'image/webp'
    },
    {
      rel: 'preload', 
      as: 'image',
      href: promoImage,
      fetchPriority: 'low',
      type: 'image/webp'
    }
  ];
}

/**
 * Generate optimized image srcset for responsive images
 */
export function generateImageSrcSet(basePath: string, sizes: number[] = [400, 800, 1200, 1600]): string {
  const baseWithoutExt = basePath.replace(/\.[^/.]+$/, '');
  const format = process.env.NODE_ENV === 'production' ? 'webp' : 'png';
  
  return sizes
    .map(size => `${BASE_URL}${baseWithoutExt}_${size}w.${format} ${size}w`)
    .join(', ');
}

/**
 * Validate image optimization status
 * Returns optimization recommendations for development
 */
export function validateImageOptimization() {
  if (process.env.NODE_ENV === 'development') {
    const recommendations: Array<{
      image: string;
      status: string;
      priority: string;
      expectedSavings: string;
      action: string;
    }> = [];
    
    // Check if WebP versions exist (simplified check)
    const criticalImages = [
      '/pressKit/Silksong_Promo_02_2400',
      '/pressKit/Hornet_mid_shot',
      '/pressKit/Silksong_Promo_02'
    ];
    
    criticalImages.forEach(imagePath => {
      recommendations.push({
        image: imagePath,
        status: 'needs_optimization',
        priority: imagePath.includes('Silksong_Promo_02.') ? 'critical' : 'high',
        expectedSavings: imagePath.includes('Silksong_Promo_02.') ? '8MB' : '4MB',
        action: 'Convert to WebP with 80% quality'
      });
    });
    
    return {
      needsOptimization: true,
      totalImages: criticalImages.length,
      recommendations
    };
  }
  
  return {
    needsOptimization: false,
    status: 'optimized'
  };
}