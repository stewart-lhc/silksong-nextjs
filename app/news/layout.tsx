import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Silksong News: Latest Updates & Official Announcements 2025',
  description: 'Latest Hollow Knight: Silksong news, updates, and official announcements from Team Cherry. Released September 4, 2025 with ongoing post-launch updates.',
  keywords: [
    'silksong news',
    'hollow knight silksong news', 
    'team cherry updates',
    'silksong latest news',
    'silksong 2025 news',
    'hollow knight silksong updates',
    'silksong post launch updates',
    'team cherry announcements',
    'silksong development news',
    'metroidvania news',
    'indie game news',
    'silksong patch notes',
    'hollow knight news',
    'silksong community updates'
  ],
  openGraph: {
    title: 'Latest Silksong News & Updates',
    description: 'Stay updated with the latest Hollow Knight: Silksong news, official Team Cherry announcements, and post-launch updates.',
    type: 'website',
    images: ['/pressKit/Silksong_Promo_02_2400.png'],
    url: '/news'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Silksong News 📰',
    description: 'Latest news and updates for Hollow Knight: Silksong. Stay informed with official announcements!',
    images: ['/pressKit/Silksong_Promo_02_2400.png']
  },
  alternates: {
    canonical: '/news'
  }
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}