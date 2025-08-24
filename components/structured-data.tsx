'use client';

import { usePathname } from 'next/navigation';
import { getSEOConfig } from '../config/seo';

interface StructuredDataProps {
  data?: Record<string, any>[];
}

export function StructuredData({ data }: StructuredDataProps) {
  const pathname = usePathname();
  
  // Get structured data from SEO config if not provided
  const structuredData = data || getSEOConfig(pathname).structuredData || [];
  
  if (!structuredData.length) {
    return null;
  }

  return (
    <>
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 0),
          }}
        />
      ))}
    </>
  );
}