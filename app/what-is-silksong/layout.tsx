import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'What is Hollow Knight: Silksong? Complete Beginner Guide 2025',
  description: 'Discover what Hollow Knight: Silksong is - the sequel to Hollow Knight featuring Hornet. Learn about the story, gameplay, and why you should play it. Released September 2025.',
  keywords: [
    'what is silksong',
    'hollow knight silksong',
    'silksong explained',
    'is silksong a sequel',
    'is silksong a prequel', 
    'silksong story',
    'hollow knight sequel',
    'hornet game',
    'silksong beginner guide',
    'metroidvania games',
    'team cherry games',
    'silksong gameplay',
    'hollow knight vs silksong',
    'should i play silksong'
  ],
  openGraph: {
    title: 'What is Hollow Knight: Silksong? Complete Guide',
    description: 'Everything you need to know about Hollow Knight: Silksong - the highly anticipated sequel featuring Hornet. Story, gameplay, and release info.',
    type: 'article',
    images: ['/pressKit/Silksong_Promo_02_2400.png'],
    url: '/what-is-silksong'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What is Silksong? 🕷️',
    description: 'Complete guide to Hollow Knight: Silksong - the sequel everyone\'s been waiting for!',
    images: ['/pressKit/Silksong_Promo_02_2400.png']
  },
  alternates: {
    canonical: '/what-is-silksong'
  }
};

export default function WhatIsSilksongLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}