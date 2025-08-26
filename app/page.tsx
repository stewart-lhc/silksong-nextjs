import { Metadata } from 'next';
import { HeroSection } from '@/components/hero-section';
import { StorySection } from '@/components/story-section';
import { FeaturesSection } from '@/components/features-section';
import { TrailerSection } from '@/components/trailer-section';
import { SoundtrackSection } from '@/components/soundtrack-section';

export const metadata: Metadata = {
  title: 'Hollow Knight: Silksong - Official Release Tracker',
  description: 'The ultimate source for Hollow Knight: Silksong news, updates, release countdown, and comprehensive game information. Track the most anticipated Metroidvania sequel.',
  keywords: ['Hollow Knight', 'Silksong', 'Metroidvania', 'Team Cherry', 'indie game', 'release date'],
  openGraph: {
    title: 'Hollow Knight: Silksong - Official Release Tracker',
    description: 'The ultimate source for Hollow Knight: Silksong news, updates, release countdown, and comprehensive game information.',
    type: 'website',
    images: ['/pressKit/Silksong_Promo_02_2400.png']
  }
};

export default function HomePage() {
  return (
    <div className="-mt-20"> {/* Offset for fixed navigation */}
      <HeroSection />
      <StorySection />
      <FeaturesSection />
      <TrailerSection />
      <SoundtrackSection />
    </div>
  );
}