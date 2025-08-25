import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, Users, Gamepad2, Download, HelpCircle, Calendar, CheckSquare } from 'lucide-react';

// Site taxonomy and categorization
export const siteArchitecture = {
  primaryCategories: {
    gameInfo: {
      label: 'Game Information',
      description: 'Core information about Hollow Knight: Silksong',
      icon: Gamepad2,
      pages: [
        {
          path: '/',
          title: 'Homepage',
          description: 'Release countdown and game overview',
          priority: 'primary',
          userIntent: 'discovery',
          keywords: ['silksong release', 'countdown', 'hollow knight sequel']
        },
        {
          path: '/compare-hollow-knight', 
          title: 'Game Comparison',
          description: 'Detailed feature comparison with original',
          priority: 'high',
          userIntent: 'research',
          keywords: ['hollow knight vs silksong', 'differences', 'new features']
        }
      ]
    },
    releaseInfo: {
      label: 'Release Information',
      description: 'Release dates, platforms, and availability',
      icon: Calendar,
      pages: [
        {
          path: '/platforms',
          title: 'Platform Availability',
          description: 'Where and when to play Silksong', 
          priority: 'high',
          userIntent: 'planning',
          keywords: ['silksong platforms', 'xbox game pass', 'pc steam']
        },
        {
          path: '/timeline',
          title: 'Development Timeline', 
          description: 'Official announcements and updates',
          priority: 'high',
          userIntent: 'tracking',
          keywords: ['silksong timeline', 'team cherry updates', 'development news']
        }
      ]
    },
    preparation: {
      label: 'Launch Preparation',
      description: 'Tools and guides to prepare for release',
      icon: CheckSquare,
      pages: [
        {
          path: '/checklist',
          title: 'Readiness Checklist',
          description: 'Comprehensive launch preparation guide',
          priority: 'medium',
          userIntent: 'preparation', 
          keywords: ['silksong checklist', 'launch preparation', 'system requirements']
        },
        {
          path: '/tools/embed',
          title: 'Embed Tools',
          description: 'Countdown widgets and embeddable content',
          priority: 'low',
          userIntent: 'utility',
          keywords: ['silksong widget', 'countdown embed', 'website tools']
        }
      ]
    },
    support: {
      label: 'Help & Support',
      description: 'Questions, answers, and community resources',
      icon: HelpCircle,
      pages: [
        {
          path: '/faq',
          title: 'Frequently Asked Questions',
          description: 'Common questions and official answers',
          priority: 'high', 
          userIntent: 'problem-solving',
          keywords: ['silksong faq', 'questions answers', 'help guide']
        }
      ]
    }
  },
  
  userJourneys: {
    newVisitor: [
      { step: 1, page: '/', action: 'Discover countdown and overview' },
      { step: 2, page: '/platforms', action: 'Check platform availability' }, 
      { step: 3, page: '/faq', action: 'Get answers to questions' },
      { step: 4, page: '/checklist', action: 'Prepare for launch' }
    ],
    returningFan: [
      { step: 1, page: '/', action: 'Check countdown progress' },
      { step: 2, page: '/timeline', action: 'Review latest updates' },
      { step: 3, page: '/compare-hollow-knight', action: 'Research new features' }
    ],
    embedUser: [
      { step: 1, page: '/tools/embed', action: 'Generate countdown widget' },
      { step: 2, page: '/', action: 'Reference main countdown' }
    ]
  },

  contentClusters: {
    cluster1: {
      pillarPage: '/',
      supportingPages: ['/platforms', '/checklist'],
      topicalTheme: 'Silksong Release Preparation',
      internalLinks: [
        { from: '/', to: '/platforms', anchor: 'platform availability' },
        { from: '/', to: '/checklist', anchor: 'launch preparation' },
        { from: '/platforms', to: '/checklist', anchor: 'system requirements' }
      ]
    },
    cluster2: {
      pillarPage: '/compare-hollow-knight',
      supportingPages: ['/timeline', '/faq'],
      topicalTheme: 'Game Features & Development',
      internalLinks: [
        { from: '/compare-hollow-knight', to: '/timeline', anchor: 'feature announcements' },
        { from: '/compare-hollow-knight', to: '/faq', anchor: 'gameplay questions' },
        { from: '/timeline', to: '/faq', anchor: 'development updates' }
      ]
    }
  }
};

// Related content recommendations component
interface RelatedContentProps {
  currentPage: string;
  maxSuggestions?: number;
}

export function RelatedContent({ currentPage, maxSuggestions = 3 }: RelatedContentProps) {
  const allPages = Object.values(siteArchitecture.primaryCategories)
    .flatMap(category => category.pages)
    .filter(page => page.path !== currentPage);

  // Get related pages based on category and priority
  const currentPageData = Object.values(siteArchitecture.primaryCategories)
    .flatMap(category => category.pages)
    .find(page => page.path === currentPage);

  const currentCategory = Object.values(siteArchitecture.primaryCategories)
    .find(category => category.pages.some(page => page.path === currentPage));

  // Prioritize pages from same category, then by priority
  const relatedPages = allPages
    .sort((a, b) => {
      const aInCategory = currentCategory?.pages.includes(a) ? 1 : 0;
      const bInCategory = currentCategory?.pages.includes(b) ? 1 : 0;
      
      if (aInCategory !== bInCategory) return bInCategory - aInCategory;
      
      const priorityOrder = { primary: 3, high: 2, medium: 1, low: 0 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - 
             priorityOrder[a.priority as keyof typeof priorityOrder];
    })
    .slice(0, maxSuggestions);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Related Information</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedPages.map((page) => (
          <Card key={page.path} className="hover:shadow-lg transition-shadow group">
            <Link href={page.path}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  {page.title}
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary-glow group-hover:translate-x-1 transition-all" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm group-hover:text-foreground transition-colors">
                  {page.description}
                </CardDescription>
                <div className="flex flex-wrap gap-1 mt-2">
                  {page.keywords.slice(0, 2).map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

// User journey progress indicator
export function UserJourneyIndicator({ currentPage }: { currentPage: string }) {
  const journeys = siteArchitecture.userJourneys;
  
  // Determine which journey this page belongs to
  const currentJourney = Object.entries(journeys).find(([, steps]) =>
    steps.some(step => step.page === currentPage)
  );

  if (!currentJourney) return null;

  const [journeyName, steps] = currentJourney;
  const currentStepIndex = steps.findIndex(step => step.page === currentPage);
  
  return (
    <div className="bg-accent/30 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">
          {journeyName === 'newVisitor' ? 'New to Silksong?' : 
           journeyName === 'returningFan' ? 'Welcome Back!' : 
           'Using Embed Tools'}
        </h4>
        <Badge variant="outline" className="text-xs">
          Step {currentStepIndex + 1} of {steps.length}
        </Badge>
      </div>
      
      <div className="flex items-center space-x-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full ${
                index === currentStepIndex
                  ? 'bg-primary-glow'
                  : index < currentStepIndex
                  ? 'bg-green-500'
                  : 'bg-muted-foreground/30'
              }`}
            />
            {index < steps.length - 1 && (
              <div className={`w-8 h-0.5 ${
                index < currentStepIndex ? 'bg-green-500' : 'bg-muted-foreground/30'
              }`} />
            )}
          </div>
        ))}
      </div>
      
      {currentStepIndex < steps.length - 1 && (
        <div className="mt-3 text-xs text-muted-foreground">
          Next: <Link 
            href={steps[currentStepIndex + 1].page}
            className="text-primary-glow hover:underline"
          >
            {steps[currentStepIndex + 1].action}
          </Link>
        </div>
      )}
    </div>
  );
}

// Site taxonomy display
export function SiteMap() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Site Architecture</h2>
        <p className="text-muted-foreground">
          Comprehensive information architecture for Hollow Knight: Silksong
        </p>
      </div>
      
      {Object.entries(siteArchitecture.primaryCategories).map(([key, category]) => {
        const Icon = category.icon;
        return (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-primary-glow" />
                {category.label}
              </CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {category.pages.map((page) => (
                  <div key={page.path} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Link 
                        href={page.path}
                        className="font-medium hover:text-primary-glow transition-colors"
                      >
                        {page.title}
                      </Link>
                      <Badge 
                        variant={page.priority === 'primary' ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {page.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {page.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {page.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}