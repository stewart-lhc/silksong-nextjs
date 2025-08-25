import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Silksong Development Timeline: Official Updates & History ⏰',
  description: 'Complete chronological timeline of Hollow Knight: Silksong development. Track Team Cherry announcements, media coverage & community milestones from 2017 to 2025.',
  keywords: [
    'silksong timeline',
    'hollow knight silksong development',
    'team cherry announcements',
    'silksong release history',
    'silksong updates timeline',
    'hornet dlc announcement',
    'silksong development progress',
    'team cherry blog posts',
    'silksong media coverage',
    'development milestones',
    'silksong news archive',
    'indie game development',
    'metroidvania timeline',
    'september 2025 announcement'
  ],
  openGraph: {
    title: 'Silksong Development Timeline: From DLC to Full Game',
    description: 'Comprehensive timeline of Hollow Knight: Silksong development from 2017 announcement to 2025 release. Track every major update and milestone.',
    type: 'article',
    images: ['/pressKit/Silksong_Promo_02_2400.png'],
    url: '/timeline'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Silksong Development Timeline 📅',
    description: 'Complete history of Hollow Knight: Silksong development. From Hornet DLC announcement to full game release!',
    images: ['/pressKit/Silksong_Promo_02_2400.png']
  },
  alternates: {
    canonical: '/timeline'
  }
};

export default function TimelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}