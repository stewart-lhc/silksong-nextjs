import type { Metadata } from 'next';
import { JetBrains_Mono, Poppins } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Providers } from './providers';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { PerformanceMonitor } from '@/components/performance-monitor';
import { PWAInstaller } from '@/components/pwa-installer';
import { StructuredData } from '@/components/structured-data';
import { websiteSchema, organizationSchema } from '@/lib/structured-data';

import './globals.css';

// Optimized font loading with preload and fallbacks
// 限制字体数量以优化性能 - 主要使用Poppins作为sans字体
const fontSans = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap', // 性能优化：启用font-display:swap
  preload: true, // 预加载关键字体
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  adjustFontFallback: true,
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap', // 性能优化：启用font-display:swap
  preload: false, // 仅在需要时加载等宽字体
  fallback: ['Menlo', 'Monaco', 'Consolas', 'monospace'],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: {
    default: 'Hollow Knight: Silksong - Official Release Tracker',
    template: '%s | Hollow Knight: Silksong',
  },
  description: 
    'The ultimate source for Hollow Knight: Silksong news, updates, release countdown, and comprehensive game information. Track the most anticipated Metroidvania sequel.',
  keywords: [
    'Hollow Knight',
    'Silksong',
    'Team Cherry',
    'Metroidvania',
    'Indie Game',
    'Hornet',
    'release date',
    'September 2025',
  ],
  authors: [{ name: 'Hollow Knight Silksong Archive' }],
  creator: 'Hollow Knight Silksong Archive',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_SITE_URL || 'https://hollowknightsilksong.org'
      : 'http://localhost:3000',
    siteName: 'Hollow Knight: Silksong Release Tracker',
    title: 'Hollow Knight: Silksong - Official Release Tracker',
    description:
      'The ultimate source for Hollow Knight: Silksong news, updates, release countdown, and comprehensive game information.',
    images: [
      {
        url: '/pressKit/Silksong_Promo_02_2400.png',
        width: 1200,
        height: 630,
        alt: 'Hollow Knight: Silksong',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hollow Knight: Silksong - Official Release Tracker',
    description:
      'The ultimate source for Hollow Knight: Silksong news, updates, release countdown, and comprehensive game information.',
    images: ['/pressKit/Silksong_Promo_02_2400.png'],
    site: '@teamcherry',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_SITE_URL || 'https://hollowknightsilksong.org'
      : 'http://localhost:3000',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontMono.variable
        )}
      >
        <Providers>
          <PerformanceMonitor />
          <PWAInstaller />
          <StructuredData data={[websiteSchema, organizationSchema]} />
          <div className="min-h-screen bg-background">
            <Navigation />
            
            <main className="pt-20">
              {children}
            </main>
            
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}