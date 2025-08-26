'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Video } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useEmailSubscription } from '@/hooks/use-email-subscription';

// Background Video Component
function BackgroundVideo({ onVideoReady }: { onVideoReady: (loaded: boolean) => void }) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  
  useEffect(() => {
    // Start loading video after a short delay
    const loadTimer = setTimeout(() => {
      setVideoLoaded(true);
    }, 1000);

    // Assume video is playing after additional delay
    const playTimer = setTimeout(() => {
      setVideoPlaying(true);
      onVideoReady(true);
    }, 3000); // 3 seconds for video to start playing
    
    return () => {
      clearTimeout(loadTimer);
      clearTimeout(playTimer);
    };
  }, [onVideoReady]);

  if (!videoLoaded) {
    return null;
  }

  return (
    <div className={`absolute inset-0 overflow-hidden transition-opacity duration-1000 ${videoPlaying ? 'opacity-100' : 'opacity-0'}`}>
      <iframe
        src="https://www.youtube.com/embed/0BqVbQ6nUXE?autoplay=1&mute=1&loop=1&playlist=0BqVbQ6nUXE&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&start=1"
        className="absolute inset-0 w-full h-full object-cover scale-125 pointer-events-none"
        style={{
          filter: 'brightness(0.6) contrast(1.1)',
        }}
        allow="autoplay; encrypted-media"
        title="Hollow Knight Silksong Background Video"
        frameBorder="0"
      />
      {/* Lighter overlay for readability */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}

// Animated countdown component (simplified version)
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Set target date to September 4, 2025 at 14:00:00 UTC
    const targetDate = new Date('2025-09-04T14:00:00Z');
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-3 text-center max-w-lg mx-auto">
      <div className="bg-background/30 backdrop-blur-sm rounded-lg p-4 border border-primary/20 min-w-0">
        <div className="text-3xl md:text-4xl lg:text-6xl font-bold text-white">{timeLeft.days}</div>
        <div className="text-sm text-muted-foreground mt-1">Days</div>
      </div>
      <div className="bg-background/30 backdrop-blur-sm rounded-lg p-4 border border-primary/20 min-w-0">
        <div className="text-3xl md:text-4xl lg:text-6xl font-bold text-white">{timeLeft.hours}</div>
        <div className="text-sm text-muted-foreground mt-1">Hours</div>
      </div>
      <div className="bg-background/30 backdrop-blur-sm rounded-lg p-4 border border-primary/20 min-w-0">
        <div className="text-3xl md:text-4xl lg:text-6xl font-bold text-white">{timeLeft.minutes}</div>
        <div className="text-sm text-muted-foreground mt-1">Minutes</div>
      </div>
      <div className="bg-background/30 backdrop-blur-sm rounded-lg p-4 border border-primary/20 min-w-0">
        <div className="text-3xl md:text-4xl lg:text-6xl font-bold text-white">{timeLeft.seconds}</div>
        <div className="text-sm text-muted-foreground mt-1">Seconds</div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [videoReady, setVideoReady] = useState(false);
  
  const {
    subscriberCount,
    isSubscribed,
    isSubmitting,
    isLoading,
    error,
    subscribe,
    validateEmail,
  } = useEmailSubscription();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      return;
    }

    subscribe(email.trim());
    setEmail(''); // Clear email field on successful submission
  };

  const handleVideoReady = (ready: boolean) => {
    setVideoReady(ready);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <BackgroundVideo onVideoReady={handleVideoReady} />
      
      {/* Silk Background Flow - Hidden when video loads */}
      <div className="silk-flow-bg transition-opacity duration-1000" style={{ opacity: videoReady ? 0.1 : 0.8 }} />
      
      {/* Web Pattern Overlay - Reduced when video loads */}
      <div className="web-pattern animate-web-pulse transition-opacity duration-1000" style={{ opacity: videoReady ? 0.05 : 0.3 }} />
      
      {/* Animated Silk Threads - Reduced when video loads */}
      <div className="silk-thread animate-silk-sway left-[10%] transition-opacity duration-1000" style={{ opacity: videoReady ? 0.1 : 0.6, animationDelay: '0s' }} />
      <div className="silk-thread silk-thread-gold animate-silk-sway left-[25%] transition-opacity duration-1000" style={{ opacity: videoReady ? 0.08 : 0.4, animationDelay: '1s' }} />
      <div className="silk-thread silk-thread-silver animate-silk-sway left-[75%] transition-opacity duration-1000" style={{ opacity: videoReady ? 0.08 : 0.5, animationDelay: '2s' }} />
      <div className="silk-thread animate-silk-sway right-[15%] transition-opacity duration-1000" style={{ opacity: videoReady ? 0.05 : 0.3, animationDelay: '3s' }} />
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Title Section - Organic Layout */}
          <div className="text-center mb-12 animate-silk-weave">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight text-foreground animate-silk-breathe">
                HOLLOW KNIGHT
              </h1>
              <h2 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-wider silk-woven-text animate-needle-gleam">
                SILKSONG
              </h2>
              <div className="relative max-w-3xl mx-auto">
                <p className="text-sm md:text-base text-muted-foreground/80 leading-relaxed">
                  Step into Hornet's silk-woven world of Pharloom. Master the needle, weave through danger, 
                  and ascend to become the kingdom's protector in this long-awaited sequel.
                </p>
                {/* Decorative silk lines */}
                <div className="absolute -left-8 top-1/2 w-16 h-px bg-gradient-to-r from-transparent to-primary/40 transform -translate-y-1/2" />
                <div className="absolute -right-8 top-1/2 w-16 h-px bg-gradient-to-l from-transparent to-primary/40 transform -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Countdown and Updates Row */}
          <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8 items-stretch">
            {/* Countdown - 2/3 */}
            <div className="lg:col-span-2">
              <div className="bg-card/20 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 w-full h-full flex flex-col justify-center animate-silk-breathe transition-all duration-500 hover:bg-card/30" style={{ animationDelay: '0.5s' }}>
                <div className="text-center mb-6">
                  <h3 className="text-2xl md:text-3xl font-bold text-primary/90 mb-2">
                    Release Countdown
                  </h3>
                  <a 
                    href="https://steamdb.info/app/1030300" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground/80 hover:text-primary/70 transition-colors duration-300 hover:underline"
                  >
                    4 September 2025 – 14:00:00 UTC
                  </a>
                </div>
                <CountdownTimer />
              </div>
            </div>

            {/* Release Updates - 1/3 */}
            <div className="lg:col-span-1">
              <div className="bg-card/20 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 w-full h-full flex flex-col justify-center animate-silk-breathe transition-all duration-500 hover:bg-card/30" style={{ animationDelay: '1s' }}>
                <div className="flex-grow flex flex-col justify-center">
                  <h3 className="text-lg font-bold mb-4 text-primary/90 text-center">
                    Release Updates
                  </h3>
                  
                  {isSubscribed ? (
                    <div className="text-primary font-semibold flex items-center justify-center gap-2 py-4">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        ✓
                      </div>
                      <span className="text-sm">Subscribed!</span>
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribe} className="space-y-3">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-background/50 border-primary/30 text-foreground rounded-lg focus:ring-primary/50 text-sm"
                        required
                        disabled={isSubmitting}
                        maxLength={254}
                      />
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-primary/20 text-sm"
                        disabled={isSubmitting || !email.trim()}
                      >
                        {isSubmitting ? "..." : "Notify Me"}
                      </Button>
                    </form>
                  )}
                  
                  {!isLoading && typeof subscriberCount === 'number' && subscriberCount > 0 && (
                    <p className="text-xs text-muted-foreground/80 text-center mt-3">
                      {subscriberCount.toLocaleString()} waiting
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Dialog open={isTrailerOpen} onOpenChange={setIsTrailerOpen}>
              <DialogTrigger asChild>
                <button className="needle-button px-8 py-3 font-semibold text-lg min-w-[200px] flex items-center justify-center gap-2">
                  <Video className="w-5 h-5" />
                  Release Trailer
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
                <div className="w-full h-full">
                  <iframe
                    src="https://www.youtube.com/embed/6XGeJwsUP9c?autoplay=1"
                    className="w-full h-full rounded-lg"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title="Hollow Knight Silksong Release Trailer"
                  />
                </div>
              </DialogContent>
            </Dialog>
            
            <Link href="/timeline">
              <button className="relative overflow-hidden px-8 py-3 font-semibold text-lg min-w-[200px] flex items-center justify-center gap-2 bg-card/30 backdrop-blur-sm border-2 border-primary/40 text-primary hover:border-primary/70 hover:bg-primary/10 hover:text-primary rounded-lg transition-all duration-300" style={{ clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)' }}>
                View Timeline
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}