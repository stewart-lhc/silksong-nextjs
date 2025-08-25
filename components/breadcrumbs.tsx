import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { Fragment } from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  // Add home as the first item if not already present
  const breadcrumbItems = items[0]?.href === '/' ? items : [
    { label: 'Home', href: '/' },
    ...items
  ];

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-2 text-sm text-muted-foreground mb-6 ${className}`}
    >
      {breadcrumbItems.map((item, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground/60" aria-hidden="true" />
          )}
          {item.current || !item.href ? (
            <span 
              className="text-foreground font-medium" 
              aria-current="page"
            >
              {index === 0 && <Home className="w-4 h-4 inline mr-1" aria-hidden="true" />}
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-primary-glow transition-colors"
            >
              {index === 0 && <Home className="w-4 h-4 inline mr-1" aria-hidden="true" />}
              {item.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

// Structured data for breadcrumbs
export function BreadcrumbStructuredData({ items }: { items: BreadcrumbItem[] }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items
      .filter(item => item.href)
      .map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.label,
        "item": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hollowknightsilksong.org'}${item.href}`
      }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
}

// Helper function to generate breadcrumbs based on current path
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const pathMap: Record<string, string> = {
    '/': 'Home',
    '/compare-hollow-knight': 'HK vs Silksong',
    '/platforms': 'Platforms & Availability',
    '/tools': 'Developer Tools',
    '/tools/embed': 'Embed Tools',
    '/developers': 'Developer Resources',
    '/timeline': 'Development Timeline',
    '/checklist': 'Launch Checklist',
    '/faq': 'Frequently Asked Questions'
  };

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    breadcrumbs.push({
      label: pathMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: isLast ? undefined : currentPath,
      current: isLast
    });
  });

  // Remove home if it's the only item
  return breadcrumbs.length === 1 ? [] : breadcrumbs;
}