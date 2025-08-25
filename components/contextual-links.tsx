import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ContextualLink {
  href: string;
  title: string;
  description: string;
  variant?: 'default' | 'outline' | 'secondary';
  icon?: boolean;
  external?: boolean;
}

interface ContextualLinksProps {
  links: ContextualLink[];
  title?: string;
  description?: string;
  className?: string;
  variant?: 'grid' | 'list' | 'inline';
}

export function ContextualLinks({ 
  links, 
  title = "Related Information",
  description,
  className = "",
  variant = "grid" 
}: ContextualLinksProps) {
  
  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {links.map((link, index) => (
          <Button
            key={index}
            variant={link.variant || 'outline'}
            size="sm"
            asChild
          >
            <Link href={link.href}>
              {link.title}
              {link.icon && <ArrowRight className="ml-1 w-3 h-3" />}
              {link.external && <ExternalLink className="ml-1 w-3 h-3" />}
            </Link>
          </Button>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={`space-y-2 ${className}`}>
        {title && <h3 className="text-lg font-semibold mb-3 text-hornet-700 dark:text-hornet-300">{title}</h3>}
        {description && <p className="text-hornet-neutral-600 dark:text-hornet-neutral-400 mb-4">{description}</p>}
        {links.map((link, index) => (
          <div key={index} className="border-l-2 border-primary/20 pl-4">
            <Link 
              href={link.href}
              className="block p-3 rounded-lg hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-hornet-700 dark:text-hornet-300 group-hover:text-hornet-500 transition-colors">
                    {link.title}
                  </h4>
                  {link.description && (
                    <p className="text-sm text-hornet-neutral-600 dark:text-hornet-neutral-400 mt-1">
                      {link.description}
                    </p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-hornet-neutral-600 group-hover:text-hornet-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        ))}
      </div>
    );
  }

  // Default grid variant
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-2 text-hornet-700 dark:text-hornet-300">{title}</h3>
          {description && (
            <p className="text-hornet-neutral-600 dark:text-hornet-neutral-400 max-w-2xl mx-auto">{description}</p>
          )}
        </div>
      )}
      <div className={`grid ${links.length === 2 ? 'md:grid-cols-2' : links.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
        {links.map((link, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow group">
            <Link href={link.href} className="block">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  {link.title}
                  <ArrowRight className="w-4 h-4 text-hornet-neutral-600 group-hover:text-hornet-500 group-hover:translate-x-1 transition-all" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="group-hover:text-hornet-700 dark:group-hover:text-hornet-300 transition-colors text-hornet-neutral-600 dark:text-hornet-neutral-400">
                  {link.description}
                </CardDescription>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Pre-defined link sets for different pages
export const homePageLinks: ContextualLink[] = [
  {
    href: '/compare-hollow-knight',
    title: 'Game Differences',
    description: 'See how Silksong differs from the original Hollow Knight with detailed feature comparisons'
  },
  {
    href: '/platforms',
    title: 'Platform Availability', 
    description: 'Check which platforms Silksong will be available on, including Game Pass info'
  },
  {
    href: '/checklist',
    title: 'Launch Preparation',
    description: 'Prepare for release day with our comprehensive readiness checklist'
  },
  {
    href: '/timeline',
    title: 'Development Timeline',
    description: 'Track every official announcement and update from Team Cherry'
  }
];

export const comparisonPageLinks: ContextualLink[] = [
  {
    href: '/timeline',
    title: 'Development Timeline',
    description: 'See when these features were announced and confirmed by Team Cherry'
  },
  {
    href: '/checklist',
    title: 'Preparation Guide',
    description: 'Get ready for Silksong with our comprehensive launch day checklist'
  },
  {
    href: '/platforms',
    title: 'Platform Details',
    description: 'Check system requirements and platform-specific features'
  }
];

export const platformsPageLinks: ContextualLink[] = [
  {
    href: '/checklist',
    title: 'System Requirements Check',
    description: 'Ensure your setup meets Silksong requirements for optimal performance'
  },
  {
    href: '/faq',
    title: 'Platform FAQ',
    description: 'Get answers to common questions about platform compatibility and features'
  },
  {
    href: '/timeline',
    title: 'Platform Announcements',
    description: 'Track when each platform was officially confirmed by Team Cherry'
  }
];

export const faqPageLinks: ContextualLink[] = [
  {
    href: '/platforms',
    title: 'Detailed Platform Info',
    description: 'In-depth platform availability and system requirements information'
  },
  {
    href: '/timeline',
    title: 'Official Announcements',
    description: 'See the source timeline for all answers provided in our FAQ'
  },
  {
    href: '/compare-hollow-knight',
    title: 'Feature Comparisons',
    description: 'Detailed breakdown of gameplay differences and new features'
  }
];

export const timelinePageLinks: ContextualLink[] = [
  {
    href: '/platforms',
    title: 'Platform Details',
    description: 'See current platform availability and confirmed release details'
  },
  {
    href: '/compare-hollow-knight',
    title: 'Feature Analysis',
    description: 'Understand what each announcement revealed about gameplay changes'
  },
  {
    href: '/checklist',
    title: 'Launch Preparation',
    description: 'Use our checklist to prepare for the confirmed September 4th release'
  }
];

export const checklistPageLinks: ContextualLink[] = [
  {
    href: '/platforms',
    title: 'System Requirements',
    description: 'Verify your platform meets the technical requirements for Silksong'
  },
  {
    href: '/compare-hollow-knight',
    title: 'Gameplay Refresher',
    description: 'Review key differences to better prepare for new mechanics'
  },
  {
    href: '/timeline',
    title: 'Development History',
    description: 'Understand the full development journey leading to release'
  }
];