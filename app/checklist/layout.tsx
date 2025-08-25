import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Silksong Readiness Checklist: Complete Preparation Guide ✓',
  description: 'Ultimate preparation checklist for Hollow Knight: Silksong release. Track your progress through lore, hardware, community & gameplay readiness. Interactive & printable!',
  keywords: [
    'silksong checklist',
    'silksong preparation guide',
    'hollow knight silksong readiness',
    'silksong release preparation',
    'what to do before silksong',
    'hollow knight lore recap',
    'silksong system requirements',
    'prepare for silksong',
    'silksong community guide',
    'interactive checklist',
    'silksong countdown checklist',
    'team cherry game prep',
    'metroidvania preparation',
    'september 2025 checklist'
  ],
  openGraph: {
    title: 'Silksong Readiness Checklist: Are You Prepared?',
    description: 'Complete preparation guide for Hollow Knight: Silksong. Track your readiness across lore knowledge, hardware, and community engagement.',
    type: 'website',
    images: ['/pressKit/Silksong_Promo_02_2400.png'],
    url: '/checklist'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Silksong Readiness Checklist ✅',
    description: 'Are you ready for Hollow Knight: Silksong? Use our comprehensive checklist to prepare for the September 2025 release!',
    images: ['/pressKit/Silksong_Promo_02_2400.png']
  },
  alternates: {
    canonical: '/checklist'
  }
};

export default function ChecklistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}