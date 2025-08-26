'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Video } from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';
import gameInfo from '@/data/gameInfo.json';

// Email validation and sanitization utility
const validateAndSanitizeEmail = (email: string, t: (key: string) => string): { isValid: boolean; sanitized: string; error?: string } => {
  // Basic sanitization - trim whitespace and convert to lowercase
  const sanitized = email.trim().toLowerCase();
  
  // Enhanced email validation regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!sanitized) {
    return { isValid: false, sanitized, error: t('common.emailRequired') };
  }
  
  if (sanitized.length > 254) {
    return { isValid: false, sanitized, error: t('common.emailTooLong') };
  }
  
  if (!emailRegex.test(sanitized)) {
    return { isValid: false, sanitized, error: t('common.emailInvalid') };
  }
  
  return { isValid: true, sanitized };
};

// Simple countdown component
function CountdownDisplay({ endDate }: { endDate: Date }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +endDate - +new Date();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());
    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex justify-center gap-4 md:gap-8">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="text-center">
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/20 min-w-[80px] md:min-w-[100px] w-[80px] md:w-[100px]">
            <div className="text-2xl md:text-4xl font-bold text-white font-mono">
              {value.toString().padStart(2, '0')}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">
              {unit}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function OptimizedHeroSection() {
  const { t } = useI18n();
  const [isStreamOpen, setIsStreamOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    // Initialize subscriber count from gameInfo
    setSubscriberCount(gameInfo.subscribers);
  }, []);

  // Optimize video loading without DOM manipulation
  useEffect(() => {
    // Use requestIdleCallback to defer video loading until browser is idle
    const loadVideo = () => {
      setVideoLoaded(true);
    };

    // Use requestIdleCallback or fallback to setTimeout
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(loadVideo, { timeout: 1000 });
    } else {
      setTimeout(loadVideo, 100);
    }
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting - prevent spam submissions
    const now = Date.now();
    const minTimeBetweenSubmissions = 5000; // 5 seconds
    
    if (now - lastSubmissionTime < minTimeBetweenSubmissions) {
      alert(t('common.rateLimitExceeded'));
      return;
    }
    
    if (isSubmitting) return;
    
    // Validate and sanitize email
    const validation = validateAndSanitizeEmail(email, t);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }
    
    setIsSubmitting(true);
    setLastSubmissionTime(now);
    
    try {
      // Simulate subscription (replace with actual implementation)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubscriberCount(prev => prev + 1);
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
      alert(t('common.subscribedSuccess'));
    } catch (error) {
      console.error('Subscription error:', error);
      alert(t('common.subscriptionFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full">
        {/* Fallback background image while video loads */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(/pressKit/Hornet_mid_shot.webp)`,
            opacity: videoLoaded ? 0 : 1,
            transition: 'opacity 0.5s ease-in-out'
          }}
        />
        
        {/* Loading skeleton */}
        {!videoLoaded && !videoError && (
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-primary/20 animate-pulse">
            <div className="absolute inset-0 bg-primary/10 animate-pulse" />
          </div>
        )}
        
        {/* Optimized YouTube iframe */}
        <iframe 
          src="https://www.youtube.com/embed/0BqVbQ6nUXE?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playlist=0BqVbQ6nUXE" 
          className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{
            aspectRatio: '16/9',
            minWidth: '100vw',
            minHeight: '100vh',
            width: '177.78vh',
            height: '100vh',
            left: '50%',
            transform: 'translateX(-50%)'
          }} 
          allow="autoplay; encrypted-media" 
          allowFullScreen
          loading="lazy"
          title="Hollow Knight Silksong Background Video"
        />
      </div>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-6">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="font-poppins text-4xl md:text-7xl font-bold text-white">{t('hero.title')}</h1>
          <h2 className="font-poppins text-6xl md:text-9xl font-bold fantasy-text tracking-wider">
            SILKSONG
          </h2>
        </div>

        {/* Countdown and Email Subscription */}
        <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-white text-xl md:text-2xl font-bold mb-4">
            {t('hero.subtitle')}
          </h3>
          <div className="mb-6">
            <CountdownDisplay endDate={new Date("2025-09-04T00:00:00")} />
          </div>
          <p className="text-muted-foreground text-sm mb-4">{t('hero.subscribe')}</p>
          
          {isSubscribed ? (
            <div className="text-primary font-semibold">✓ {t('common.ok')} {t('hero.subscribe')}!</div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input 
                type="email" 
                placeholder={t('common.email', 'Enter your email')} 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="flex-1 bg-white/10 border-white/30 text-white placeholder-white/70" 
                required 
                disabled={isSubmitting}
                maxLength={254}
              />
              <Button 
                type="submit" 
                className="btn-fantasy" 
                disabled={isSubmitting || !email.trim()}
              >
                {isSubmitting ? "..." : t('hero.subscribe')}
              </Button>
            </form>
          )}
        </div>
        
        {/* Live Stream Button */}
        <div className="mt-8 flex justify-center">
          <Dialog open={isStreamOpen} onOpenChange={setIsStreamOpen}>
            <DialogTrigger asChild>
              <Button className="btn-fantasy px-8 py-3 text-lg font-semibold flex items-center gap-2">
                <Video className="w-5 h-5" />
                {t('hero.watchTrailer')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
              <div className="w-full h-full">
                <iframe
                  src="https://www.youtube.com/embed/6XGeJwsUP9c?autoplay=1"
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="Hollow Knight Silksong Live Stream"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}