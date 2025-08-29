/**
 * 使用Newsletter Kit重构的Hero Section
 * 保留原有设计，使用新的Newsletter Kit组件
 */

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Video } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { NewsletterKit, createNewsletterConfig } from '@/lib/newsletter-kit';
import { supabase } from '@/lib/supabase/client';

// Newsletter Kit Supabase适配器（复用上面的代码）
const createNewsletterSupabaseAdapter = () => ({
  async insert(data: any) {
    const { data: result, error } = await supabase
      .from('email_subscriptions')
      .insert({
        email: data.email,
        subscribed_at: new Date().toISOString(),
        status: 'active',
        source: data.source || 'hero-section',
        metadata: data.metadata || {},
        tags: data.tags || ['newsletter', 'hero'],
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async findByEmail(email: string) {
    const { data, error } = await supabase
      .from('email_subscriptions')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async count() {
    const { count, error } = await supabase
      .from('email_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (error) throw error;
    return (count || 0) as any;
  },

  // 其他必需的方法（简化版）
  async findById() { return null; },
  async update() { return null; },
  async delete() { return false; },
  async list() { return { items: [], total: 0, limit: 10, offset: 0, hasNext: false, hasPrevious: false }; },
  async healthCheck() {
    return {
      healthy: true,
      latency: 50,
      connections: { active: 1, idle: 0, total: 1 },
      lastCheck: new Date().toISOString() as any,
    };
  },
});

// Newsletter Kit配置
const newsletterConfig = createNewsletterConfig({
  database: {
    adapter: createNewsletterSupabaseAdapter(),
    tableName: 'email_subscriptions',
  },
  ui: {
    theme: 'dark', // 匹配Hero section的深色主题
    variant: 'minimal',
    size: 'md',
    showCount: false, // 在Hero中不显示，我们会自定义显示
  },
  messages: {
    placeholder: 'Enter your email',
    submitText: 'Notify Me',
    successText: 'Subscribed!',
    alreadySubscribed: 'Already subscribed!',
  },
});

// 背景视频组件（保持不变）
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
          height: '67.5vw',
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

// 倒计时组件（保持不变）
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
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

export function NewsletterKitHeroSection() {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  return (
    <section className="relative h-screen overflow-hidden" style={{ minHeight: '100dvh' }}>
      {/* Background Video */}
      <BackgroundVideo />
      
      {/* Newsletter Kit Provider */}
      <NewsletterKit.Provider config={newsletterConfig}>
        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 pt-20 pb-8 md:py-8 flex items-center justify-center" style={{ minHeight: 'calc(100dvh - 4rem)' }}>
          <div className="max-w-6xl mx-auto">
            {/* Hero Title Section */}
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
                    
                    {/* 使用Newsletter Kit表单 */}
                    <div className="space-y-3">
                      <NewsletterKit.Form
                        className="newsletter-hero-form"
                        variant="minimal"
                        size="sm"
                        placeholder="Enter your email"
                        submitText="Notify Me"
                        source="hero-section"
                        tags={['newsletter', 'hero', 'release-updates']}
                        onSuccess={(result) => {
                          console.log('Hero subscription success:', result);
                        }}
                        onError={(error) => {
                          console.error('Hero subscription error:', error);
                        }}
                      />
                    </div>
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

        {/* Toast容器 */}
        <NewsletterKit.ToastContainer position="top-right" />
      </NewsletterKit.Provider>
    </section>
  );
}