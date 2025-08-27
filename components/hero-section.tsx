'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Video } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useEmailSubscription } from '@/hooks/use-email-subscription';

// Simple Background with Image and Video
function BackgroundVideo() {
  const [showVideo, setShowVideo] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowVideo(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="absolute inset-0 z-0">
      {/* Background Image */}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
          showVideo ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: 'url(/pressKit/Hornet_mid_shot.webp)',
          filter: 'brightness(0.6) contrast(1.1)'
        }}
      />
      
      {/* YouTube Video */}
      <iframe
        src="https://www.youtube.com/embed/0BqVbQ6nUXE?autoplay=1&mute=1&loop=1&playlist=0BqVbQ6nUXE&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&start=1&playsinline=1&enablejsapi=1"
        className="absolute pointer-events-none transition-opacity duration-1000"
        style={{
          filter: 'brightness(0.6) contrast(1.1)',
          opacity: showVideo ? 1 : 0,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120vw',
          height: '67.5vw', // 16:9 ratio
          minWidth: '213.3vh',
          minHeight: '120vh'
        }}
        allow="autoplay; fullscreen; encrypted-media; accelerometer; gyroscope; picture-in-picture"
        title="Hollow Knight Silksong Background Video"
        frameBorder="0"
      />
      
      {/* Overlay */}
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


  return (
    <section className="relative h-screen overflow-hidden" style={{ minHeight: '100dvh' }}>
      {/* Background Video */}
      <BackgroundVideo />
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-8 md:py-8 flex items-center justify-center" style={{ minHeight: 'calc(100dvh - 4rem)' }}>
        <div className="max-w-6xl mx-auto">
          {/* Hero Title Section - Organic Layout */}
          <div className="text-center mb-6 md:mb-12">
            <div className="space-y-3 md:space-y-6">
              <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight text-foreground leading-tight">
                HOLLOW KNIGHT
              </h1>
              <h2 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-wider fantasy-text leading-tight">
                SILKSONG
              </h2>
              <div className="relative max-w-3xl mx-auto">
                <p className="text-xs md:text-sm text-muted-foreground/80 leading-relaxed">
                  Step into Hornet&apos;s silk-woven world of Pharloom. Master the needle, weave through danger, 
                  and ascend to become the kingdom&apos;s protector in this long-awaited sequel.
                </p>
              </div>
            </div>
          </div>

          {/* Countdown and Updates Row */}
          <div className="grid lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto mb-4 md:mb-8 items-stretch">
            {/* Countdown - 2/3 */}
            <div className="lg:col-span-2">
              <div className="bg-card/20 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 w-full h-full flex flex-col justify-center">
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
              <div className="bg-card/20 backdrop-blur-sm border border-primary/20 rounded-2xl p-6 w-full h-full flex flex-col justify-center">
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
                  
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-row gap-2 sm:gap-4 justify-center items-center">
            <Dialog open={isTrailerOpen} onOpenChange={setIsTrailerOpen}>
              <DialogTrigger asChild>
                <button className="px-4 sm:px-8 py-3 font-semibold text-sm sm:text-lg min-w-[140px] sm:min-w-[200px] flex items-center justify-center gap-1 sm:gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors duration-200">
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
              <button className="px-4 sm:px-8 py-3 font-semibold text-sm sm:text-lg min-w-[140px] sm:min-w-[200px] flex items-center justify-center gap-1 sm:gap-2 bg-card/30 backdrop-blur-sm border-2 border-primary/40 text-primary hover:border-primary/70 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors duration-200">
                View Timeline
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}