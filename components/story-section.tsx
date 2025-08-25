'use client';

import { memo, useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Optimized Image component with lazy loading and intersection observer
const LazyImage = memo(({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", className)}>
      {isInView && (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-muted/60 animate-pulse" />
          )}
          <Image
            src={src}
            alt={alt}
            fill
            className={cn(
              "object-cover transition-opacity duration-500",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={handleLoad}
            loading="lazy"
          />
        </>
      )}
      {!isInView && (
        <div className="w-full h-full bg-gradient-to-br from-background/40 to-muted/20" />
      )}
    </div>
  );
});

LazyImage.displayName = "LazyImage";

export const StorySection = memo(() => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Main Title */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold font-poppins text-foreground">
            Ascend to the Peak of a Haunted Kingdom
          </h2>
        </div>
        
        {/* Story Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Image */}
          <div className="relative">
            <LazyImage
              src="/assets/story-image.jpg"
              alt="Hornet character"
              className="aspect-[4/3] rounded-lg shadow-2xl"
            />
          </div>
          
          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold fantasy-text">
                Captured and Taken to a Distant Land
              </h3>
              
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Hornet, princess-protector of Hallownest, finds herself alone in a vast, unfamiliar world.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  She must battle foes, seek out allies, and solve mysteries as she ascends on a deadly pilgrimage to the kingdom's peak.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Bound by her lineage and guided by echoes of her past, Hornet will adventure through mossy grottos, coral forests and shining citadels to unravel a deadly thread that threatens this strange new land.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

StorySection.displayName = "StorySection";