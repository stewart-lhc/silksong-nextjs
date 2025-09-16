import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'When Was Silksong Announced? Complete History & Development Timeline',
  description: 'Discover when Hollow Knight: Silksong was first announced in 2017 and track every major development milestone. Complete official announcement history from Team Cherry.',
  keywords: [
    'when was silksong announced',
    'silksong announcement date',
    'hollow knight silksong first announced',
    'team cherry announcements',
    'silksong announcement history',
    'hornet dlc announcement 2017',
    'silksong development timeline',
    'team cherry blog posts',
    'silksong reveal history',
    'development milestones',
    'silksong official announcements',
    'indie game development',
    'metroidvania announcement',
    'september 2025 release announcement'
  ],
  openGraph: {
    title: 'When Was Silksong Announced? Official Development Timeline',
    description: 'Silksong was first announced as Hornet DLC in 2017, then became a full game. Complete timeline of Team Cherry announcements and development milestones.',
    type: 'article',
    images: ['/pressKit/Silksong_Promo_02_2400.png'],
    url: 'https://www.hollowknightsilksong.org/announcement'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'When Was Silksong Announced? 📅',
    description: 'Silksong was first announced in 2017! Complete announcement timeline from Hornet DLC to full game release.',
    images: ['/pressKit/Silksong_Promo_02_2400.png']
  },
  alternates: {
    canonical: 'https://www.hollowknightsilksong.org/announcement'
  }
};

export default function AnnouncementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}