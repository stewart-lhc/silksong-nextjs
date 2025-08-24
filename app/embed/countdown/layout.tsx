import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Silksong Countdown Widget',
  description: 'Embeddable countdown widget for Hollow Knight: Silksong release',
  robots: 'noindex, nofollow',
};

export default function EmbedCountdownLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}