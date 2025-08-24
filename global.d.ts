// Global TypeScript declarations for Next.js Silk Song Archive

/// <reference types="next" />
/// <reference types="next/image-types/global" />

// Environment Variables with Strict Types
declare namespace NodeJS {
  interface ProcessEnv {
    // Next.js Environment
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly NEXT_PUBLIC_APP_URL: string;
    readonly NEXT_PUBLIC_APP_NAME: string;
    
    // Supabase Configuration
    readonly NEXT_PUBLIC_SUPABASE_URL: string;
    readonly NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    readonly SUPABASE_SERVICE_ROLE_KEY?: string;
    
    // Analytics and Monitoring
    readonly NEXT_PUBLIC_GA_ID?: string;
    readonly NEXT_PUBLIC_GTM_ID?: string;
    readonly VERCEL_ANALYTICS_ID?: string;
    
    // Authentication
    readonly NEXTAUTH_URL?: string;
    readonly NEXTAUTH_SECRET?: string;
    readonly NEXTAUTH_URL_INTERNAL?: string;
    
    // External APIs
    readonly CMS_API_URL?: string;
    readonly CMS_API_TOKEN?: string;
    
    // Email Configuration
    readonly EMAIL_FROM?: string;
    readonly SMTP_HOST?: string;
    readonly SMTP_PORT?: string;
    readonly SMTP_USER?: string;
    readonly SMTP_PASSWORD?: string;
    
    // Social Media
    readonly NEXT_PUBLIC_TWITTER_URL?: string;
    readonly NEXT_PUBLIC_DISCORD_URL?: string;
    readonly NEXT_PUBLIC_REDDIT_URL?: string;
    readonly NEXT_PUBLIC_STEAM_URL?: string;
    
    // SEO Configuration
    readonly NEXT_PUBLIC_SITE_DESCRIPTION: string;
    readonly NEXT_PUBLIC_KEYWORDS: string;
    readonly NEXT_PUBLIC_CANONICAL_URL?: string;
    
    // Feature Flags
    readonly ENABLE_ANALYTICS?: 'true' | 'false';
    readonly ENABLE_PWA?: 'true' | 'false';
    readonly ENABLE_OFFLINE_MODE?: 'true' | 'false';
  }
}

// Module Declarations for Static Assets
declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.avif' {
  const content: string;
  export default content;
}

declare module '*.mp3' {
  const content: string;
  export default content;
}

declare module '*.mp4' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const value: Record<string, unknown>;
  export default value;
}

// Web APIs and Browser Extensions
interface Window {
  // Web Vitals
  gtag?: (
    command: 'config' | 'event',
    targetId: string,
    config?: Record<string, unknown>
  ) => void;
  
  // Performance monitoring
  webVitals?: {
    getCLS: (callback: (metric: unknown) => void) => void;
    getFID: (callback: (metric: unknown) => void) => void;
    getFCP: (callback: (metric: unknown) => void) => void;
    getLCP: (callback: (metric: unknown) => void) => void;
    getTTFB: (callback: (metric: unknown) => void) => void;
  };
  
  // Service Worker
  workbox?: {
    addEventListener: (event: string, handler: (event: unknown) => void) => void;
    messageSkipWaiting: () => void;
  };
  
  // PWA Install Prompt
  deferredPrompt?: BeforeInstallPromptEvent;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Utility Types for Application Domain
type GameStatus = 
  | 'announced' 
  | 'in-development' 
  | 'coming-soon' 
  | 'released' 
  | 'delayed' 
  | 'cancelled';

type Platform = 
  | 'pc' 
  | 'steam' 
  | 'gog' 
  | 'epic' 
  | 'playstation' 
  | 'xbox' 
  | 'nintendo-switch' 
  | 'mobile';

type MediaType = 
  | 'screenshot' 
  | 'artwork' 
  | 'trailer' 
  | 'music' 
  | 'press-kit';

// Application-specific types
interface GameInfo {
  title: string;
  developer: string;
  publisher?: string;
  status: GameStatus;
  releaseDate?: string;
  platforms: Platform[];
  description: string;
  features: string[];
  systemRequirements?: {
    minimum: Record<string, string>;
    recommended: Record<string, string>;
  };
}

interface MediaAsset {
  id: string;
  type: MediaType;
  title: string;
  url: string;
  thumbnail?: string;
  description?: string;
  createdAt: string;
}

interface NewsItem {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  publishedAt: string;
  author?: string;
  tags: string[];
  featured: boolean;
}

// API Response Types
type ApiResponse<T = unknown> = 
  | { success: true; data: T }
  | { success: false; error: string };

type AsyncApiResponse<T = unknown> = Promise<ApiResponse<T>>;

// Component Props with Strict Typing
interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
}

// Theme and Styling
type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  accentColor: string;
  borderRadius: string;
}

// Error Boundary
interface ErrorInfo {
  componentStack: string;
}

// Form Types
interface FormFieldError {
  message: string;
  type: string;
}

type FormErrors<T> = Partial<Record<keyof T, FormFieldError>>;

// Analytics Events
interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, string | number>;
}

// Performance Metrics
interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
}

export {};