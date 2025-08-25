/**
 * Developer Documentation Layout
 * Provides consistent layout and metadata for developer pages
 */

import { Metadata } from 'next';
import { Breadcrumbs } from '@/components/breadcrumbs';

export const metadata: Metadata = {
  title: {
    template: '%s | Developer Documentation | Hollow Knight: Silksong',
    default: 'Developer Documentation | Hollow Knight: Silksong',
  },
  description: 'Complete API documentation for Hollow Knight: Silksong. Access game status, subscribe to updates, and integrate our RSS feed.',
  keywords: [
    'Hollow Knight Silksong API',
    'Game API documentation', 
    'REST API',
    'RSS feed',
    'Developer integration',
    'Team Cherry API',
    'Game development API',
    'Silksong status API'
  ],
  openGraph: {
    title: 'Silksong Developer Documentation',
    description: 'Integrate Hollow Knight: Silksong data into your applications with our comprehensive API.',
    type: 'website',
    siteName: 'Hollow Knight: Silksong',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Silksong API Documentation',
    description: 'Integrate Hollow Knight: Silksong data into your applications with our comprehensive API.',
  },
  alternates: {
    canonical: '/developers',
  },
};

const breadcrumbItems = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Developer Documentation',
    href: '/developers',
  },
];

export default function DevelopersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      {children}
    </div>
  );
}