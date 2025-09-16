import { Footer } from '@/components/footer';
import { Navigation } from '@/components/navigation';
import { PerformanceMonitor } from '@/components/performance-monitor';
import { PWAInstaller } from '@/components/pwa-installer';
import { StructuredData } from '@/components/structured-data';
import { organizationSchema, websiteSchema } from '@/lib/structured-data';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { JetBrains_Mono, Poppins } from 'next/font/google';
import Script from 'next/script';
import { Providers } from './providers';

import './globals.css';

// Optimized font loading with strategic weight prioritization
// Performance: Load only critical weights initially, defer others
const fontSans = Poppins({
  subsets: ['latin'],
  weight: ['400', '600'], // Critical weights only - 500ms faster load
  variable: '--font-sans',
  display: 'optional', // Faster than swap - prevents layout shift
  preload: true, // Preload critical font
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  adjustFontFallback: true,
});

// Secondary font weights loaded separately for non-critical content
const fontSansExtended = Poppins({
  subsets: ['latin'], 
  weight: ['500', '700'], // Extended weights
  variable: '--font-sans-extended',
  display: 'swap', // Allow swap for non-critical
  preload: false, // Don't block render
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  adjustFontFallback: false, // Prevent duplicate adjustments
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono', 
  display: 'optional', // Fast loading for code elements
  preload: false, // Load only when needed
  fallback: ['Menlo', 'Monaco', 'Consolas', 'monospace'],
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://www.hollowknightsilksong.org'
      : 'http://localhost:3000'
  ),
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
    url:
      process.env.NODE_ENV === 'production'
        ? 'https://www.hollowknightsilksong.org'
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
    canonical:
      process.env.NODE_ENV === 'production'
        ? 'https://www.hollowknightsilksong.org'
        : 'http://localhost:3000',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_MEASUREMENT_ID = 'G-JX8QN87GNC';
  const CLARITY_PROJECT_ID = 'szb9sqbb55';

  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontSansExtended.variable, 
          fontMono.variable
        )}
        suppressHydrationWarning={true}
      >
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
          `}
        </Script>

        {/* Ahrefs Analytics */}
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="YegS9mkxDCL7K6GaQz3p/Q"
          async
          strategy="afterInteractive"
        />

        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2180978564190653"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        
        
        <Providers>
          <PerformanceMonitor />
          <PWAInstaller />
          <StructuredData data={[websiteSchema, organizationSchema]} />
          <div className='min-h-screen bg-background'>
            <Navigation />

            <main className='pt-20'>{children}</main>

            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
