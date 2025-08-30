'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';

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

export function TrailerSection() {
  const [currentTrailer, setCurrentTrailer] = useState(0);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextTrailer = () => {
    setCurrentTrailer((prev) => (prev + 1) % trailers.length);
  };

  const prevTrailer = () => {
    setCurrentTrailer((prev) => (prev - 1 + trailers.length) % trailers.length);
  };

  // Touch event handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const dx = currentX - touchStartX.current;
    const dy = currentY - touchStartY.current;

    // Only mark as dragging if there's significant movement
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      isDragging.current = true;
    }

    // Prevent vertical scrolling if horizontal swipe is detected
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      e.preventDefault();
    }

    touchEndX.current = currentX;
  };

  const handleTouchEnd = () => {
    // Only process swipe if there was significant dragging movement
    if (!isDragging.current) {
      // This was a tap/click, not a swipe - let it pass through to the iframe
      return;
    }
    
    const deltaX = touchStartX.current - touchEndX.current;

    // Higher threshold for mobile swipe
    const minSwipeDistance = isMobile ? 80 : 60;

    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        nextTrailer();
      } else {
        prevTrailer();
      }
    }

    isDragging.current = false;
  };

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
            {/* Video Player with Carousel */}
            <div 
              ref={containerRef}
              className="relative aspect-video bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 overflow-hidden card-enhanced"
              onTouchStart={isMobile ? handleTouchStart : undefined}
              onTouchMove={isMobile ? handleTouchMove : undefined}
              onTouchEnd={isMobile ? handleTouchEnd : undefined}
            >
              <iframe 
                key={trailers[currentTrailer].id}
                src={trailers[currentTrailer].url} 
                className="w-full h-full rounded-lg transition-opacity duration-300"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                title={trailers[currentTrailer].title}
              />
              
              {/* Navigation Arrows */}
              <Button
                variant="ghost"
                size="icon"
                onClick={prevTrailer}
                className="absolute z-20 left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 shadow-lg"
                aria-label="Previous trailer"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={nextTrailer}
                className="absolute z-20 right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 shadow-lg"
                aria-label="Next trailer"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>

            {/* Trailer Title */}
            <div className="text-center">
              <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
                {trailers[currentTrailer].title}
              </h3>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2">
              {trailers.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTrailer(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentTrailer 
                      ? 'bg-primary scale-125' 
                      : 'bg-muted hover:bg-muted-foreground/50 hover:scale-110'
                  }`}
                  aria-label={`Go to trailer ${index + 1}`}
                />
              ))}
            </div>

            {/* Additional Links */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button variant="outline" asChild>
                <a 
                  href={`https://www.youtube.com/watch?v=${trailers[currentTrailer].id}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Watch on YouTube
                </a>
              </Button>
              <Button variant="outline" asChild>
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