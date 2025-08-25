import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Developer Tools & Integration Hub | Hollow Knight: Silksong',
  description: 'Comprehensive developer tools for Hollow Knight: Silksong integration. Generate countdown widgets, access live APIs, subscribe to RSS feeds. Free tools for developers.',
  keywords: [
    'silksong developer tools',
    'hollow knight api',
    'silksong countdown widget',
    'silksong rss feed',
    'embed generator',
    'countdown timer widget',
    'silksong integration',
    'developer api',
    'game status api',
    'timeline api',
    'iframe embed code',
    'rss subscription',
    'discord bot api',
    'september 2025 countdown',
    'team cherry api',
    'real-time game data'
  ],
  openGraph: {
    title: 'Silksong Developer Tools & Integration Hub',
    description: 'Complete toolkit for developers: countdown widgets, REST API access, RSS feeds, and integration examples for Hollow Knight: Silksong.',
    type: 'website',
    images: ['/pressKit/Silksong_Promo_02_2400.png'],
    url: '/tools'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Silksong Developer Tools Hub 🛠️',
    description: 'Free developer tools: widgets, APIs, RSS feeds, and more for Hollow Knight: Silksong integration!',
    images: ['/pressKit/Silksong_Promo_02_2400.png']
  },
  alternates: {
    canonical: '/tools'
  }
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}