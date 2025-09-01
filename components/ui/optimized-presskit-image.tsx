'use client';

/**
 * Optimized Press Kit Image Component
 * 
 * This component provides WebP/AVIF support with PNG fallbacks,
 * responsive sizing, and performance optimizations for press kit images.
 * 
 * Features:
 * - Modern format support (AVIF -> WebP -> PNG)
 * - Responsive sizing with proper aspect ratios
 * - Loading optimization with blur placeholders
 * - Automatic format detection
 * - Performance monitoring
 */

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { generateBlurPlaceholder, preloadCriticalImages } from '@/lib/image-utils';

interface OptimizedPressKitImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  loading?: 'lazy' | 'eager';
  responsive?: boolean;
  backgroundImage?: boolean;
}

// Supported formats in order of preference
const SUPPORTED_FORMATS = ['avif', 'webp', 'png'] as const;
type ImageFormat = typeof SUPPORTED_FORMATS[number];

// Responsive breakpoints for press kit images
const RESPONSIVE_SIZES = {
  hero: '(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw',
  promotional: '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px',
  character: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px'
};

export function OptimizedPressKitImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = RESPONSIVE_SIZES.promotional,
  quality = 85,
  loading = 'lazy',
  responsive = true,
  backgroundImage = false
}: OptimizedPressKitImageProps) {
  const [currentFormat, setCurrentFormat] = useState<ImageFormat>('png');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate optimized src paths for different formats
  const generateSrc = useCallback((format: ImageFormat) => {
    const basePath = src.replace(/\.[^/.]+$/, '');
    return `${basePath}.${format}`;
  }, [src]);

  // Check if a format is supported and file exists
  const checkFormatSupport = useCallback(async (format: ImageFormat): Promise<boolean> => {
    try {
      const response = await fetch(generateSrc(format), { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }, [generateSrc]);

  // Determine the best format to use
  useEffect(() => {
    const determineBestFormat = async () => {
      for (const format of SUPPORTED_FORMATS) {
        if (await checkFormatSupport(format)) {
          setCurrentFormat(format);
          break;
        }
      }
    };

    determineBestFormat();
  }, [checkFormatSupport]);

  // Preload critical images
  useEffect(() => {
    if (priority && currentFormat !== 'png') {
      preloadCriticalImages([generateSrc(currentFormat)]);
    }
  }, [priority, currentFormat, generateSrc]);

  const optimizedSrc = generateSrc(currentFormat);
  const blurDataURL = generateBlurPlaceholder();

  const handleLoad = () => {
    setIsLoading(false);
    if (priority && process.env.NODE_ENV === 'development') {
      // Report performance metrics for critical images
      if (typeof window !== 'undefined' && 'performance' in window) {
        const now = performance.now();
        console.info(`Critical image loaded in ${now.toFixed(2)}ms: ${alt}`);
      }
    }
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    
    // Fallback to PNG if modern format fails
    if (currentFormat !== 'png') {
      setCurrentFormat('png');
      setHasError(false);
    }
  };

  // For background images
  if (backgroundImage) {
    return (
      <div
        className={cn(
          'bg-cover bg-center bg-no-repeat transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        style={{
          backgroundImage: `url(${optimizedSrc})`,
          width,
          height,
        }}
        onLoad={handleLoad}
        aria-label={alt}
        role="img"
      />
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading blur placeholder */}
      {isLoading && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 animate-pulse"
          style={{
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      
      {/* Main optimized image */}
      <Image
        src={hasError ? src : optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        loading={priority ? 'eager' : loading}
        sizes={responsive ? sizes : undefined}
        placeholder="blur"
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-500',
          isLoading ? 'opacity-0' : 'opacity-100',
          responsive && 'w-full h-auto'
        )}
      />

      {/* Format indicator for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {currentFormat.toUpperCase()}
        </div>
      )}

      {/* Performance metrics for critical images */}
      {priority && process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          Critical
        </div>
      )}
    </div>
  );
}

// Specialized components for different press kit use cases
export function HeroBackgroundImage({
  src,
  alt,
  className,
  ...props
}: Omit<OptimizedPressKitImageProps, 'width' | 'height' | 'backgroundImage'>) {
  return (
    <OptimizedPressKitImage
      src={src}
      alt={alt}
      width={1920}
      height={1080}
      className={className}
      priority={true}
      sizes={RESPONSIVE_SIZES.hero}
      backgroundImage={true}
      {...props}
    />
  );
}

export function PromotionalImage({
  src,
  alt,
  className,
  ...props
}: Omit<OptimizedPressKitImageProps, 'width' | 'height'>) {
  return (
    <OptimizedPressKitImage
      src={src}
      alt={alt}
      width={1200}
      height={800}
      className={className}
      priority={false}
      sizes={RESPONSIVE_SIZES.promotional}
      {...props}
    />
  );
}

export function CharacterArtImage({
  src,
  alt,
  className,
  ...props
}: Omit<OptimizedPressKitImageProps, 'width' | 'height'>) {
  return (
    <OptimizedPressKitImage
      src={src}
      alt={alt}
      width={400}
      height={600}
      className={className}
      priority={false}
      sizes={RESPONSIVE_SIZES.character}
      {...props}
    />
  );
}