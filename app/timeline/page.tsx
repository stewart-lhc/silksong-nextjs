'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calendar, Clock } from 'lucide-react';
import timelineData from '@/data/timeline.json';

// Metadata moved to layout or parent component for client component

interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'Official' | 'Media' | 'Community';
  source: string;
  category: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

const getBadgeVariant = (type: string) => {
  switch (type) {
    case 'Official':
      return 'default';
    case 'Media':
      return 'secondary';
    case 'Community':
      return 'outline';
    default:
      return 'outline';
  }
};

export default function TimelinePage() {
  // Sort timeline data by date (newest first)
  const sortedTimeline = [...timelineData].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const openExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold fantasy-text mb-4 text-foreground">
              Silksong Timeline
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive timeline of Hollow Knight: Silksong announcements, 
              updates, and community moments
            </p>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Timeline Legend */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <Badge variant="default" className="px-4 py-2">
              <span className="mr-2">🏢</span> Official
            </Badge>
            <Badge variant="secondary" className="px-4 py-2">
              <span className="mr-2">📺</span> Media
            </Badge>
            <Badge variant="outline" className="px-4 py-2 text-foreground border-muted">
              <span className="mr-2">👥</span> Community
            </Badge>
          </div>

          {/* Timeline Items */}
          <div className="relative">
            {/* Vertical line - Made more visible with stronger colors */}
            <div className="absolute left-4 md:left-8 top-0 bottom-0 w-2 bg-gradient-to-b from-primary to-accent opacity-90 shadow-lg"></div>

            <div className="space-y-16">
              {sortedTimeline.map((item, index) => {
                const timelineItem = item as TimelineItem;
                return (
                  <div key={timelineItem.id} className="relative">
                    {/* Timeline dot with better contrast */}
                    <div className="absolute left-2 md:left-6 w-5 h-5 bg-primary rounded-full border-2 border-background shadow-lg z-10 ring-2 ring-primary/30"></div>

                    {/* Date positioned left of timeline to avoid overlap */}
                    <div className="absolute left-[-120px] md:left-[-140px] top-0 w-28 md:w-32">
                      <div className="bg-card/90 backdrop-blur-sm border border-accent/30 rounded-lg px-2 py-1.5 shadow-md hover:shadow-lg transition-shadow">
                        <div className="text-xs font-semibold text-primary whitespace-nowrap">
                          {formatDate(timelineItem.date)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">
                          {getRelativeTime(timelineItem.date)}
                        </div>
                      </div>
                      {/* Small arrow pointing to timeline dot */}
                      <div className="absolute top-2 -right-1 w-2 h-2 bg-card/90 border-r border-b border-accent/30 rotate-45"></div>
                    </div>

                    {/* Content */}
                    <div className="ml-12 md:ml-20 flex-1 mt-6">
                      <Card className="card-enhanced hover:border-primary/50 transition-all duration-300 group">
                        <CardHeader className="pb-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <Badge 
                                variant={getBadgeVariant(timelineItem.type)}
                                className="shrink-0"
                              >
                                {timelineItem.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs text-muted-foreground border-muted">
                                {timelineItem.category}
                              </Badge>
                            </div>
                          </div>
                          <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                            {timelineItem.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-muted-foreground text-base leading-relaxed mb-4">
                            {timelineItem.description}
                          </CardDescription>
                          <button
                            onClick={() => openExternalLink(timelineItem.source)}
                            className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors group/link"
                          >
                            <ExternalLink className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                            <span className="underline">View Source</span>
                          </button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-16 text-center">
            <Card className="card-enhanced max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  This timeline is maintained by the community and may not include every announcement. 
                  For the most up-to-date information, follow{' '}
                  <button
                    onClick={() => openExternalLink('https://teamcherry.com.au/')}
                    className="text-primary hover:text-accent underline"
                  >
                    Team Cherry's official website
                  </button>.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}