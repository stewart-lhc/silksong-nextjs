import { Footer } from '@/components/footer';
import { Navigation } from '@/components/navigation';
import { PerformanceMonitor } from '@/components/performance-monitor';
import { PWAInstaller } from '@/components/pwa-installer';
import { StructuredData } from '@/components/structured-data';
import { organizationSchema, websiteSchema } from '@/lib/structured-data';
import { cn } from '@/lib/utils';
import { i18nConfig, isValidLocale, type Locale } from '@/i18n/config';
import type { Metadata } from 'next';
import { JetBrains_Mono, Poppins } from 'next/font/google';
import { Providers } from '../providers';
import { notFound } from 'next/navigation';

import '../globals.css';

// Optimized font loading with preload and fallbacks
const fontSans = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
  adjustFontFallback: true,
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  preload: false,
  fallback: ['Menlo', 'Monaco', 'Consolas', 'monospace'],
  adjustFontFallback: true,
});

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export async function generateStaticParams() {
  return i18nConfig.locales.map((locale) => ({
    locale,
  }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  // Validate locale
  if (!isValidLocale(locale)) {
    return {};
  }

  const isZh = locale === 'zh';
  
  return {
    title: {
      default: isZh 
        ? '空洞骑士：丝之歌 - 官方发布追踪器' 
        : 'Hollow Knight: Silksong - Official Release Tracker',
      template: isZh 
        ? '%s | 空洞骑士：丝之歌' 
        : '%s | Hollow Knight: Silksong',
    },
    description: isZh
      ? '《空洞骑士：丝之歌》终极粉丝网站 - 追踪开发进度，探索功能特色，为获奖作品《空洞骑士》的续作做好准备。'
      : 'The ultimate source for Hollow Knight: Silksong news, updates, release countdown, and comprehensive game information. Track the most anticipated Metroidvania sequel.',
    keywords: isZh
      ? ['空洞骑士丝之歌', 'Team Cherry', '大黄蜂', '法鲁姆', '独立游戏', '银河战士恶魔城', 'Nintendo Switch', 'PC游戏']
      : ['Hollow Knight', 'Silksong', 'Team Cherry', 'Metroidvania', 'Indie Game', 'Hornet', 'release date', 'September 2025'],
    authors: [{ name: isZh ? '空洞骑士丝之歌档案馆' : 'Hollow Knight Silksong Archive' }],
    creator: isZh ? '空洞骑士丝之歌档案馆' : 'Hollow Knight Silksong Archive',
    openGraph: {
      type: 'website',
      locale: isZh ? 'zh_CN' : 'en_US',
      url: process.env.NODE_ENV === 'production'
        ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hollowknightsilksong.org'}/${locale}`
        : `http://localhost:3000/${locale}`,
      siteName: isZh ? '空洞骑士：丝之歌发布追踪器' : 'Hollow Knight: Silksong Release Tracker',
      title: isZh ? '空洞骑士：丝之歌 - 官方发布追踪器' : 'Hollow Knight: Silksong - Official Release Tracker',
      description: isZh
        ? '《空洞骑士：丝之歌》终极粉丝网站 - 追踪开发进度，探索功能特色。'
        : 'The ultimate source for Hollow Knight: Silksong news, updates, release countdown, and comprehensive game information.',
      images: [
        {
          url: '/pressKit/Silksong_Promo_02_2400.png',
          width: 1200,
          height: 630,
          alt: isZh ? '空洞骑士：丝之歌' : 'Hollow Knight: Silksong',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: isZh ? '空洞骑士：丝之歌 - 官方发布追踪器' : 'Hollow Knight: Silksong - Official Release Tracker',
      description: isZh
        ? '《空洞骑士：丝之歌》终极粉丝网站 - 追踪开发进度，探索功能特色。'
        : 'The ultimate source for Hollow Knight: Silksong news, updates, release countdown, and comprehensive game information.',
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
        ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hollowknightsilksong.org'}/${locale}`
        : `http://localhost:3000/${locale}`,
      languages: {
        'en': process.env.NODE_ENV === 'production'
          ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hollowknightsilksong.org'}/en`
          : 'http://localhost:3000/en',
        'zh': process.env.NODE_ENV === 'production'
          ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hollowknightsilksong.org'}/zh`
          : 'http://localhost:3000/zh',
      },
    },
  };
}

export default function LocaleLayout({ children, params: { locale } }: LocaleLayoutProps) {
  // Validate locale
  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontMono.variable
        )}
        suppressHydrationWarning={true}
      >
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