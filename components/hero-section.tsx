'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Video } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useEmailSubscription } from '@/hooks/use-email-subscription';

// Animated countdown component (simplified version)
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Set target date to September 4, 2025
    const targetDate = new Date('2025-09-04T00:00:00');
    
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
    <div className="grid grid-cols-4 gap-4 text-center">
      <div className="bg-background/50 rounded-lg p-3 border border-primary/20">
        <div className="text-2xl font-bold text-primary">{timeLeft.days}</div>
        <div className="text-xs text-muted-foreground">Days</div>
      </div>
      <div className="bg-background/50 rounded-lg p-3 border border-primary/20">
        <div className="text-2xl font-bold text-primary">{timeLeft.hours}</div>
        <div className="text-xs text-muted-foreground">Hours</div>
      </div>
      <div className="bg-background/50 rounded-lg p-3 border border-primary/20">
        <div className="text-2xl font-bold text-primary">{timeLeft.minutes}</div>
        <div className="text-xs text-muted-foreground">Minutes</div>
      </div>
      <div className="bg-background/50 rounded-lg p-3 border border-primary/20">
        <div className="text-2xl font-bold text-primary">{timeLeft.seconds}</div>
        <div className="text-xs text-muted-foreground">Seconds</div>
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with video-like styling */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/10" />
        {/* Optional: Add a subtle pattern or animation */}
        <div className="absolute inset-0 bg-[url('/assets/hero-background.jpg')] bg-cover bg-center opacity-10" />
      </div>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-background/60" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tight">
              HOLLOW KNIGHT
            </h1>
            <h2 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-wider bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
              SILKSONG
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Discover the silk-woven world of Pharloom and ascend to the peak 
              in this sequel to the acclaimed Hollow Knight.
            </p>
          </div>

          {/* Countdown and Email Subscription */}
          <Card className="bg-background/40 backdrop-blur-sm border border-primary/20 p-6 max-w-2xl mx-auto">
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-foreground">
              Official countdown, platform details, and pre-launch prep
            </h3>
            
            <CountdownTimer />
            
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">Get Release Reminder</p>
              
              {isSubscribed ? (
                <div className="text-primary font-semibold flex items-center justify-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    ✓
                  </div>
                  Successfully subscribed!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-background/50 border-primary/30 text-foreground"
                    required
                    disabled={isSubmitting}
                    maxLength={254}
                  />
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 border-2 border-primary hover:border-primary/80 rounded-lg transition-all duration-200 shadow-lg hover:shadow-primary/20"
                    disabled={isSubmitting || !email.trim()}
                  >
                    {isSubmitting ? "..." : "Subscribe"}
                  </Button>
                </form>
              )}
              
              {!isLoading && typeof subscriberCount === 'number' && subscriberCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  Join {subscriberCount.toLocaleString()} other subscribers
                </p>
              )}
            </div>
          </Card>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Dialog open={isTrailerOpen} onOpenChange={setIsTrailerOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="min-w-40 bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Release Trailer
                </Button>
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
            
            <Button asChild variant="outline" size="lg" className="min-w-40">
              <Link href="/timeline">
                View Timeline
              </Link>
            </Button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto pt-8">
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-primary">165+</div>
              <div className="text-sm text-muted-foreground">New Enemies</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-primary">10+</div>
              <div className="text-sm text-muted-foreground">Areas to Explore</div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-primary">40+</div>
              <div className="text-sm text-muted-foreground">New Tools</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}