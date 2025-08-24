'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  showLoadingPlaceholder?: boolean;
  loadingClassName?: string;
  errorClassName?: string;
}

export function OptimizedImage({
  src,
  alt,
  className,
  fallbackSrc,
  showLoadingPlaceholder = true,
  loadingClassName,
  errorClassName,
  priority = false,
  quality = 90,
  placeholder = 'blur',
  blurDataURL,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Generate blur placeholder if not provided
  const defaultBlurDataURL = 
    blurDataURL || 
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    }
  };

  return (
    <div className="relative">
      {/* Loading placeholder */}
      {isLoading && showLoadingPlaceholder && (
        <div
          className={cn(
            'absolute inset-0 bg-muted animate-pulse rounded',
            loadingClassName
          )}
        />
      )}

      {/* Error state */}
      {hasError && !fallbackSrc && (
        <div
          className={cn(
            'absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground',
            errorClassName
          )}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      <Image
        src={currentSrc}
        alt={alt}
        className={cn(
          className,
          isLoading && showLoadingPlaceholder ? 'opacity-0' : 'opacity-100',
          'transition-opacity duration-300'
        )}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={defaultBlurDataURL}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}