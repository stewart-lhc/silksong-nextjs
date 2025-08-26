import { Metadata } from 'next';
import { DynamicMetadataGenerator } from '@/lib/dynamic-metadata';

export function generateMetadata(): Metadata {
  return DynamicMetadataGenerator.generateMetadata({
    title: 'OG Image Test - Hollow Knight: Silksong',
    description: 'Test page for dynamic OG image generation functionality.',
    lang: 'en',
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  });
}

export default function OGTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}