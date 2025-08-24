import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Poppins } from 'next/font/google';
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
const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto'],
  adjustFontFallback: true,
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  preload: false, // Only preload if used above the fold
  fallback: ['Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New'],
  adjustFontFallback: true,
});

const fontPoppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
  preload: true, // Used for headings above the fold
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont'],
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
    url: 'https://hollowknightsilksong.org',
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
    canonical: 'https://hollowknightsilksong.org',
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
          fontMono.variable,
          fontPoppins.variable
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