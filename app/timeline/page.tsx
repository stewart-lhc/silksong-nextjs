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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-poppins text-white mb-4">
              Silksong Timeline
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
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
            <Badge variant="outline" className="px-4 py-2 text-white border-white/30">
              <span className="mr-2">👥</span> Community
            </Badge>
          </div>

          {/* Timeline Items */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 via-blue-400 to-purple-400"></div>

            <div className="space-y-8">
              {sortedTimeline.map((item, index) => {
                const timelineItem = item as TimelineItem;
                return (
                  <div key={timelineItem.id} className="relative flex items-start">
                    {/* Timeline dot */}
                    <div className="absolute left-2 md:left-6 w-4 h-4 bg-purple-400 rounded-full border-4 border-slate-900 z-10"></div>

                    {/* Content */}
                    <div className="ml-12 md:ml-20 flex-1">
                      <Card className="bg-black/40 backdrop-blur-sm border-white/20 hover:border-purple-400/50 transition-all duration-300 group">
                        <CardHeader className="pb-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <Badge 
                                variant={getBadgeVariant(timelineItem.type)}
                                className="shrink-0"
                              >
                                {timelineItem.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                                {timelineItem.category}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(timelineItem.date)}</span>
                              <Clock className="w-4 h-4 ml-2" />
                              <span>{getRelativeTime(timelineItem.date)}</span>
                            </div>
                          </div>
                          <CardTitle className="text-xl text-white group-hover:text-purple-300 transition-colors">
                            {timelineItem.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-gray-300 text-base leading-relaxed mb-4">
                            {timelineItem.description}
                          </CardDescription>
                          <button
                            onClick={() => openExternalLink(timelineItem.source)}
                            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors group/link"
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
            <Card className="bg-black/20 backdrop-blur-sm border-white/10 max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <p className="text-gray-400 text-sm leading-relaxed">
                  This timeline is maintained by the community and may not include every announcement. 
                  For the most up-to-date information, follow{' '}
                  <button
                    onClick={() => openExternalLink('https://teamcherry.com.au/')}
                    className="text-purple-400 hover:text-purple-300 underline"
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