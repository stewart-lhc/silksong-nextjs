import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platforms - Hollow Knight: Silksong',
  description: 'Complete platform availability information for Hollow Knight: Silksong including confirmed releases, Game Pass, and official store links.',
  keywords: ['Hollow Knight', 'Silksong', 'platforms', 'Steam', 'Xbox', 'Nintendo Switch', 'PlayStation', 'Game Pass'],
  openGraph: {
    title: 'Silksong Platforms & Availability',
    description: 'Check which platforms Hollow Knight: Silksong will be available on, including Game Pass day-one availability.',
    type: 'website',
    images: ['/pressKit/Silksong_Promo_02_2400.png']
  }
};

export default function PlatformsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}