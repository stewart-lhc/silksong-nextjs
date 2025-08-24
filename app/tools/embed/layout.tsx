import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Embed Code Generator | Silksong Countdown Widget',
  description: 'Generate embeddable countdown widget for Hollow Knight: Silksong. Customize theme, language, layout and copy the embed code.',
  keywords: ['silksong embed', 'countdown widget', 'embed code', 'silksong countdown'],
  openGraph: {
    title: 'Silksong Embed Widget Generator',
    description: 'Create customizable countdown widgets for Hollow Knight: Silksong',
    type: 'website',
  }
};

export default function EmbedToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}