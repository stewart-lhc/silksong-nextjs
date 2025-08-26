import { Metadata } from 'next';
import { OptimizedHeroSection } from '@/components/optimized-hero-section';
import { StorySection } from '@/components/story-section';
import { FeaturesSection } from '@/components/features-section';
import { TrailerSection } from '@/components/trailer-section';
import { SoundtrackSection } from '@/components/soundtrack-section';
import { DynamicMetadataGenerator } from '@/lib/dynamic-metadata';
import { isValidLocale, type Locale } from '@/i18n/config';
import { notFound } from 'next/navigation';

interface HomePageProps {
  params: { locale: string };
}

export function generateMetadata({ params: { locale } }: HomePageProps): Metadata {
  // Validate locale
  if (!isValidLocale(locale)) {
    return {};
  }

  return DynamicMetadataGenerator.generatePageMetadata('home', {
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    lang: locale,
    releaseDate: process.env.GAME_RELEASE_DATE || '2025-12-31',
  });
}

export default function HomePage({ params: { locale } }: HomePageProps) {
  // Validate locale
  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <div className="-mt-20"> {/* Offset for fixed navigation */}
      <OptimizedHeroSection />
      <StorySection />
      <FeaturesSection />
      <TrailerSection />
      <SoundtrackSection />
    </div>
  );
}