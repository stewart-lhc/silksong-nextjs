'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useGestureCarousel } from '@/hooks/use-gesture-carousel';
import { getOptimizedTransform, EASING_FUNCTIONS } from '@/lib/physics-animation';

interface Trailer {
  id: string;
  title: string;
  url: string;
}

const trailers: Trailer[] = [
  {
    id: "6XGeJwsUP9c",
    title: "Hollow Knight: Silksong - Release Trailer",
    url: "https://www.youtube.com/embed/6XGeJwsUP9c"
  },
  {
    id: "hHnI6nlfE2A",
    title: "Hollow Knight: Silksong - We've Played It! | gamescom 2025",
    url: "https://www.youtube.com/embed/hHnI6nlfE2A"
  },
  {
    id: "pFAknD_9U7c",
    title: "Hollow Knight: Silksong Reveal Trailer",
    url: "https://www.youtube.com/embed/pFAknD_9U7c"
  },
  {
    id: "Y8lvHT_IQbM",
    title: "Hollow Knight: Silksong Gameplay - Nintendo Treehouse: Live | E3 2019",
    url: "https://www.youtube.com/embed/Y8lvHT_IQbM?start=428"
  },
  {
    id: "Gv6CRPqkpuU",
    title: "Hollow Knight: Silksong - Details from Team Cherry",
    url: "https://www.youtube.com/embed/Gv6CRPqkpuU?start=9"
  }
];

// Optimized video component with proper memoization
const VideoPlayer = memo(({ trailer, transform, isGesturing }: {
  trailer: Trailer;
  transform: number;
  isGesturing: boolean;
}) => {
  const videoStyle = useMemo(() => ({
    transform: getOptimizedTransform(transform),
    transition: isGesturing ? 'none' : `transform 0.3s ${EASING_FUNCTIONS.easeOutQuart}`,
    willChange: isGesturing ? 'transform' : 'auto',
  }), [transform, isGesturing]);

  return (
    <div 
      style={videoStyle}
      className="w-full h-full gesture-carousel-video"
    >
      <iframe 
        key={trailer.id}
        src={trailer.url} 
        className="w-full h-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowFullScreen
        title={trailer.title}
        loading="lazy"
      />
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export function TrailerSection() {
  const [currentTrailer, setCurrentTrailer] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Professional navigation handlers
  const handleNavigation = useCallback((direction: 'next' | 'prev') => {
    setCurrentTrailer((prev) => {
      if (direction === 'next') {
        return (prev + 1) % trailers.length;
      } else {
        return (prev - 1 + trailers.length) % trailers.length;
      }
    });
  }, []);

  const handleDirectNavigation = useCallback((index: number) => {
    setCurrentTrailer(index);
  }, []);

  // Advanced gesture configuration for optimal mobile experience
  const gestureConfig = useMemo(() => ({
    swipeThreshold: 60, // Slightly higher threshold for video content
    tapMaxDuration: 250, // Allow slightly longer taps for video controls
    tapMaxDistance: 15, // More forgiving tap detection
    momentumThreshold: 0.8, // Higher velocity requirement for momentum
    damping: 0.75, // Smooth but responsive damping
    snapStrength: 0.4, // Strong magnetic snap
  }), []);

  // Professional gesture handling
  const { gestureHandlers, transform, isGesturing, isAnimating } = useGestureCarousel({
    itemCount: trailers.length,
    currentIndex: currentTrailer,
    onNavigate: handleNavigation,
    config: gestureConfig,
    enabled: isMobile,
  });

  // Performance optimization - prevent unnecessary re-renders
  const currentTrailerData = useMemo(() => trailers[currentTrailer], [currentTrailer]);

  // Navigation button handlers with disabled state logic
  const canNavigatePrev = currentTrailer > 0;
  const canNavigateNext = currentTrailer < trailers.length - 1;

  const handlePrevClick = useCallback(() => {
    if (canNavigatePrev && !isAnimating) {
      handleNavigation('prev');
    }
  }, [canNavigatePrev, isAnimating, handleNavigation]);

  const handleNextClick = useCallback(() => {
    if (canNavigateNext && !isAnimating) {
      handleNavigation('next');
    }
  }, [canNavigateNext, isAnimating, handleNavigation]);

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold font-poppins text-foreground mb-6">
            Experience the World of Silksong
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Watch official trailers and gameplay footage from the highly anticipated sequel.
          </p>

          <div className="space-y-6">
            {/* Professional Video Carousel Container */}
            <div 
              className={`
                relative aspect-video bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 
                overflow-hidden card-enhanced gesture-carousel-container
                ${isGesturing ? 'cursor-grabbing' : isMobile ? 'cursor-grab' : ''}
                ${isAnimating ? 'pointer-events-none' : ''}
              `}
              {...gestureHandlers}
              role="region"
              aria-label="Video carousel"
              aria-live="polite"
            >
              {/* Professional Video Player with Physics */}
              <VideoPlayer 
                trailer={currentTrailerData}
                transform={transform}
                isGesturing={isGesturing}
              />
              
              {/* Elegant Navigation Arrows with Smart Visibility */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevClick}
                disabled={!canNavigatePrev || isAnimating}
                className={`
                  carousel-nav-button absolute z-30 left-4 top-1/2 -translate-y-1/2 
                  bg-black/40 hover:bg-black/60 text-white border-0 shadow-xl
                  backdrop-blur-sm
                  ${!canNavigatePrev ? 'opacity-30 cursor-not-allowed' : ''}
                  ${isMobile ? 'w-12 h-12' : 'w-10 h-10'}
                `}
                aria-label="Previous trailer"
                tabIndex={isMobile ? -1 : 0}
              >
                <ChevronLeft className={`${isMobile ? 'w-7 h-7' : 'w-6 h-6'}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextClick}
                disabled={!canNavigateNext || isAnimating}
                className={`
                  carousel-nav-button absolute z-30 right-4 top-1/2 -translate-y-1/2 
                  bg-black/40 hover:bg-black/60 text-white border-0 shadow-xl
                  backdrop-blur-sm
                  ${!canNavigateNext ? 'opacity-30 cursor-not-allowed' : ''}
                  ${isMobile ? 'w-12 h-12' : 'w-10 h-10'}
                `}
                aria-label="Next trailer"
                tabIndex={isMobile ? -1 : 0}
              >
                <ChevronRight className={`${isMobile ? 'w-7 h-7' : 'w-6 h-6'}`} />
              </Button>

              {/* Visual Gesture Feedback - Only visible during interaction */}
              {isMobile && isGesturing && (
                <div 
                  className="absolute inset-0 z-10 bg-black/10 pointer-events-none flex items-center justify-center gesture-feedback-overlay"
                  role="status" 
                  aria-label="Swiping"
                >
                  <div className="text-white/80 text-lg font-medium px-4 py-2 bg-black/40 rounded-full backdrop-blur-sm">
                    {transform > 10 ? '← Previous' : transform < -10 ? 'Next →' : 'Release to navigate'}
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Trailer Title with Smooth Transition */}
            <div className="text-center min-h-[3rem] flex items-center justify-center">
              <h3 
                className={`
                  text-xl md:text-2xl font-semibold text-foreground transition-all duration-300
                  ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
                `}
                key={currentTrailer}
              >
                {currentTrailerData.title}
              </h3>
            </div>

            {/* Professional Dots Indicator with Enhanced UX */}
            <div className="flex justify-center space-x-2" role="tablist" aria-label="Trailer selection">
              {trailers.map((trailer, index) => (
                <button
                  key={trailer.id}
                  onClick={() => handleDirectNavigation(index)}
                  disabled={isAnimating}
                  role="tab"
                  aria-selected={index === currentTrailer}
                  aria-label={`Switch to ${trailer.title}`}
                  className={`
                    carousel-dot w-3 h-3 focus:outline-none focus:ring-2 focus:ring-primary/50
                    ${index === currentTrailer 
                      ? 'bg-primary scale-125 shadow-lg shadow-primary/50' 
                      : 'bg-muted hover:bg-muted-foreground/50 hover:scale-110'
                    }
                    ${isAnimating ? 'pointer-events-none opacity-50' : ''}
                  `}
                />
              ))}
            </div>

            {/* Enhanced Additional Links */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button 
                variant="outline" 
                asChild 
                className="transition-all duration-200 hover:scale-105"
              >
                <a 
                  href={`https://www.youtube.com/watch?v=${currentTrailerData.id}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Watch on YouTube
                </a>
              </Button>
              <Button 
                variant="outline" 
                asChild 
                className="transition-all duration-200 hover:scale-105"
              >
                <a 
                  href="https://teamcherry.com.au/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Official Website
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}