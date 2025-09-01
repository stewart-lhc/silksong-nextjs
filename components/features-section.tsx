'use client';

import { memo, useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Reusable Optimized Image component with lazy loading
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

export const FeaturesSection = memo(() => {
  return (
    <section className="py-24 relative bg-gradient-to-br from-background via-card to-secondary/20">
      {/* Subtle background pattern for depth */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary) / 0.05) 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, hsl(var(--accent) / 0.03) 1px, transparent 1px)`,
          backgroundSize: '50px 50px, 30px 30px'
        }} />
      </div>
      
      <div className="container mx-auto px-6 max-w-6xl space-y-24 relative">
        
        {/* Combat Feature */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div className="space-y-4 card-enhanced p-8">
            <h3 className="text-2xl md:text-3xl font-bold fantasy-text">
              Lethal Acrobatic Action
            </h3>
            <div className="space-y-4">
              <p className="text-lg text-foreground/90 leading-relaxed">
                Hornet must master a whole new suite of powerful moves to survive. She&apos;ll unleash devastating attacks, learn incredible silken abilities, and craft deadly tools in order to overcome the kingdom&apos;s challenges.
              </p>
              <p className="text-lg text-foreground/90 leading-relaxed">
                Over 150 all-new foes stand between Hornet and the shining citadel crowning the kingdom. Beasts and hunters, assassins and kings, monsters and knights - Hornet must face them all with bravery and skill!
              </p>
            </div>
          </div>
          
          <div className="relative">
            <LazyImage
              src="/assets/features-image.jpg"
              alt="Combat gameplay"
              className="aspect-video rounded-lg shadow-2xl"
            />
          </div>
        </div>
        
        {/* World Beauty Feature */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div className="relative lg:order-first order-last">
            <LazyImage
              src="/assets/world-beauty-new.jpg"
              alt="Beautiful game world"
              className="aspect-video rounded-lg shadow-2xl"
            />
          </div>
          
          <div className="space-y-4 lg:order-last order-first card-enhanced p-8">
            <h3 className="text-2xl md:text-3xl font-bold fantasy-text">
              Beauty and Wonder in a Haunted World
            </h3>
            <div className="space-y-4">
              <p className="text-lg text-foreground/90 leading-relaxed">
                The vast inter-connected world of Hollow Knight: Silksong is brought vividly to life in a traditional, hand-crafted, 2D style. Gilded cities, Lakes of fire, and misted moors are illustrated in exquisite detail and accompanied by a vibrant orchestral score.
              </p>
              <p className="text-lg text-foreground/90 leading-relaxed">
                In her search for the truth behind her capture, Hornet will befriend surprising strangers, discover shocking secrets and solve ancient mysteries in a kingdom full of wonders.
              </p>
            </div>
          </div>
        </div>
        
        {/* PRD Required CTA Links */}
        <div className="text-center space-y-8 card-enhanced p-8 mx-auto max-w-4xl">
          <div className="space-y-4">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              Dive Deeper Into Silksong
            </h3>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
              Discover detailed comparisons, platform availability, and tools to share your excitement for the most anticipated Metroidvania sequel.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="/compare-hollow-knight" 
              className="btn-fantasy"
            >
              Compare Differences
              <span className="ml-2">→</span>
            </a>
            
            <a 
              href="/platforms" 
              className="btn-outline-fantasy"
            >
              Platforms & Game Pass
              <span className="ml-2">→</span>
            </a>
          </div>
        </div>
        
      </div>
    </section>
  );
});

FeaturesSection.displayName = "FeaturesSection";