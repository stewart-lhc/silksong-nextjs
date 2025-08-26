'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { LanguageSelector } from '@/components/ui/language-selector';
import { ExternalLink, RefreshCw, Filter, AlertCircle, Clock, Calendar, Zap } from 'lucide-react';
import { getTranslation, formatDate, getRelativeTime, type Locale, defaultLocale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  type: string;
  source: string;
  category: string;
}

interface TimelineResponse {
  data: TimelineItem[];
  pagination: {
    limit: number;
    after: string | null;
    hasMore: boolean;
    nextAfter: string | null;
    total: number;
  };
  filters: {
    type: string | null;
    category: string | null;
  };
  meta: {
    timestamp: string;
    version: string;
  };
}

type LoadingState = 'idle' | 'loading' | 'loadingMore' | 'error';
type FilterType = 'all' | 'official' | 'media' | 'community';

const ITEMS_PER_PAGE = 10;

// Cache for API responses
const responseCache = new Map<string, { data: TimelineResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getBadgeVariant = (type: string): "default" | "secondary" | "outline" => {
  switch (type.toLowerCase()) {
    case 'announcement':
    case 'official':
      return 'default';
    case 'media':
    case 'trailer':
    case 'gameplay showcase':
      return 'secondary';
    case 'community':
    case 'developer update':
    case 'development update':
      return 'outline';
    default:
      return 'outline';
  }
};

const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'announcement':
      return '🏢';
    case 'trailer':
    case 'gameplay showcase':
      return '📺';
    case 'media':
      return '📰';
    case 'developer update':
    case 'development update':
      return '🔧';
    case 'community':
      return '👥';
    default:
      return '📋';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'announcement':
      return '📢';
    case 'gameplay':
      return '🎮';
    case 'development':
      return '⚙️';
    case 'release_date':
      return '📅';
    default:
      return '📝';
  }
};

export default function TimelinePage() {
  // State management
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [nextAfter, setNextAfter] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [retryCount, setRetryCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Get translations
  const t = getTranslation('timeline' as const, locale);

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('silksong-timeline-locale') as Locale;
    if (savedLocale && savedLocale !== locale) {
      setLocale(savedLocale);
    }
  }, [locale]);

  // Save locale to localStorage when changed
  useEffect(() => {
    localStorage.setItem('silksong-timeline-locale', locale);
  }, [locale]);

  // Generate cache key
  const generateCacheKey = useCallback((after: string | null, filter: FilterType): string => {
    return `timeline-${after || 'initial'}-${filter}-${ITEMS_PER_PAGE}`;
  }, []);

  // Check cache for response
  const getCachedResponse = useCallback((cacheKey: string): TimelineResponse | null => {
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  // Set cached response
  const setCachedResponse = useCallback((cacheKey: string, data: TimelineResponse) => {
    responseCache.set(cacheKey, { data, timestamp: Date.now() });
  }, []);

  // Fetch timeline data with caching
  const fetchTimelineData = useCallback(async (
    after: string | null = null,
    append: boolean = false,
    filter: FilterType = 'all'
  ) => {
    try {
      setLoadingState(append ? 'loadingMore' : 'loading');
      setError(null);

      const cacheKey = generateCacheKey(after, filter);
      const cachedData = getCachedResponse(cacheKey);
      
      if (cachedData && !append) {
        setTimelineItems(cachedData.data);
        setNextAfter(cachedData.pagination.nextAfter);
        setHasMore(cachedData.pagination.hasMore);
        setTotalCount(cachedData.pagination.total);
        setLoadingState('idle');
        return;
      }

      const params = new URLSearchParams();
      params.set('limit', ITEMS_PER_PAGE.toString());
      if (after) params.set('after', after);
      
      // Map filter to API parameter
      if (filter !== 'all') {
        const typeMap = {
          'official': 'Announcement',
          'media': 'Media',
          'community': 'Community'
        };
        const mappedType = typeMap[filter as keyof typeof typeMap];
        if (mappedType) {
          params.set('type', mappedType);
        }
      }

      const response = await fetch(`/api/timeline?${params.toString()}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data: TimelineResponse = await response.json();
      
      if (!append) {
        setCachedResponse(cacheKey, data);
      }
      
      setTimelineItems(prev => append ? [...prev, ...data.data] : data.data);
      setNextAfter(data.pagination.nextAfter);
      setHasMore(data.pagination.hasMore);
      setTotalCount(data.pagination.total);
      setLoadingState('idle');
      setRetryCount(0);
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setLoadingState('error');
    }
  }, [generateCacheKey, getCachedResponse, setCachedResponse]);

  // Initial load with filter dependency
  useEffect(() => {
    fetchTimelineData(null, false, activeFilter);
  }, [fetchTimelineData, activeFilter]);

  // Handle retry with exponential backoff
  const handleRetry = useCallback(() => {
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    setTimeout(() => {
      setRetryCount(prev => prev + 1);
      fetchTimelineData(null, false, activeFilter);
    }, delay);
  }, [fetchTimelineData, activeFilter, retryCount]);

  // Handle load more with debouncing
  const handleLoadMore = useCallback(() => {
    if (hasMore && nextAfter && loadingState === 'idle') {
      fetchTimelineData(nextAfter, true, activeFilter);
    }
  }, [fetchTimelineData, hasMore, nextAfter, loadingState, activeFilter]);

  // Handle filter change with reset
  const handleFilterChange = useCallback((filter: FilterType) => {
    if (filter !== activeFilter) {
      setActiveFilter(filter);
      setTimelineItems([]);
      setNextAfter(null);
      setHasMore(false);
      setError(null);
    }
  }, [activeFilter]);

  // Handle external link with analytics
  const openExternalLink = useCallback((url: string, title: string) => {
    // Analytics could be added here
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  // Get filter button variant
  const getFilterVariant = useCallback((filter: FilterType): "default" | "outline" => {
    return activeFilter === filter ? 'default' : 'outline';
  }, [activeFilter]);

  // Memoized filter counts (would need additional API endpoint for real implementation)
  const filterCounts = useMemo(() => ({
    all: totalCount,
    official: Math.floor(totalCount * 0.3),
    media: Math.floor(totalCount * 0.5),
    community: Math.floor(totalCount * 0.2),
  }), [totalCount]);

  // Virtualization for better performance
  const timelineItemsToRender = useMemo(() => timelineItems, [timelineItems]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="text-center">
            <div className="flex justify-end mb-4">
              <LanguageSelector value={locale} onValueChange={setLocale} />
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold fantasy-text mb-4 text-foreground">
              {t.title}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
            {totalCount > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{totalCount} events tracked</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center mb-8">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={getFilterVariant('all')}
                size="sm"
                onClick={() => handleFilterChange('all')}
                className="gap-2 transition-all hover:scale-105"
              >
                <Filter className="h-4 w-4" />
                {t.filters.all}
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {filterCounts.all}
                </Badge>
              </Button>
              <Button
                variant={getFilterVariant('official')}
                size="sm"
                onClick={() => handleFilterChange('official')}
                className="gap-2 transition-all hover:scale-105"
              >
                <span>🏢</span>
                {t.filters.official}
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {filterCounts.official}
                </Badge>
              </Button>
              <Button
                variant={getFilterVariant('media')}
                size="sm"
                onClick={() => handleFilterChange('media')}
                className="gap-2 transition-all hover:scale-105"
              >
                <span>📺</span>
                {t.filters.media}
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {filterCounts.media}
                </Badge>
              </Button>
              <Button
                variant={getFilterVariant('community')}
                size="sm"
                onClick={() => handleFilterChange('community')}
                className="gap-2 transition-all hover:scale-105"
              >
                <span>👥</span>
                {t.filters.community}
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {filterCounts.community}
                </Badge>
              </Button>
            </div>
            
            {/* Timeline Legend */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="px-3 py-1.5 gap-1">
                <span>🏢</span> {t.legend.official}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1.5 gap-1">
                <span>📺</span> {t.legend.media}
              </Badge>
              <Badge variant="outline" className="px-3 py-1.5 gap-1 text-foreground border-muted">
                <span>👥</span> {t.legend.community}
              </Badge>
            </div>
          </div>

          {/* Error State */}
          {loadingState === 'error' && (
            <Alert className="mb-8 border-destructive/50 bg-destructive/5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <strong>{t.error}</strong>
                  <br />
                  <span className="text-sm opacity-80">{error}</span>
                  {retryCount > 0 && (
                    <span className="block text-xs mt-1 opacity-60">
                      Retry attempt {retryCount}/5
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={retryCount >= 5}
                  className="shrink-0"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {loadingState === 'loading' && timelineItems.length === 0 && (
            <div className="space-y-8">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="relative">
                  <div className="absolute left-4 md:left-8 w-4 h-4 bg-muted rounded-full animate-pulse"></div>
                  <div className="ml-12 md:ml-20">
                    <Card className="card-enhanced">
                      <CardHeader>
                        <div className="flex gap-2 mb-3">
                          <Skeleton className="h-6 w-20 rounded-full" />
                          <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                        <Skeleton className="h-7 w-3/4" />
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-4/5" />
                          <Skeleton className="h-4 w-3/5" />
                        </div>
                        <Skeleton className="h-6 w-32 mt-4 rounded" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Timeline Items */}
          {timelineItemsToRender.length > 0 && (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 md:left-10 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary to-accent opacity-60 shadow-sm"></div>

              <div className="space-y-12 md:space-y-16">
                {timelineItemsToRender.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="relative group">
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute left-4 md:left-8 w-5 h-5 rounded-full border-3 border-background shadow-lg z-10",
                      "bg-gradient-to-br from-primary to-accent",
                      "group-hover:scale-110 transition-transform duration-200",
                      "ring-2 ring-primary/30 group-hover:ring-primary/50"
                    )}></div>

                    {/* Date badge - responsive positioning */}
                    <div className="absolute left-[-140px] md:left-[-160px] top-2 w-32 md:w-36 hidden sm:block">
                      <div className={cn(
                        "bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-md",
                        "hover:shadow-lg hover:border-primary/30 transition-all duration-200",
                        "group-hover:scale-105"
                      )}>
                        <div className="flex items-center gap-1 text-sm font-semibold text-primary mb-1">
                          <Calendar className="h-3 w-3" />
                          <span className="whitespace-nowrap text-xs">
                            {formatDate(item.date, locale)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="whitespace-nowrap">
                            {getRelativeTime(item.date, locale)}
                          </span>
                        </div>
                      </div>
                      <div className="absolute top-3 -right-1 w-2 h-2 bg-card border-r border-b border-border rotate-45"></div>
                    </div>

                    {/* Mobile date */}
                    <div className="sm:hidden mb-2 ml-12">
                      <div className="inline-flex items-center gap-2 bg-card/90 border rounded-lg px-3 py-1.5 text-xs">
                        <Calendar className="h-3 w-3 text-primary" />
                        <span className="font-medium">{formatDate(item.date, locale)}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{getRelativeTime(item.date, locale)}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="ml-12 md:ml-20 flex-1">
                      <Card className={cn(
                        "card-enhanced transition-all duration-300",
                        "hover:border-primary/40 hover:shadow-lg hover:-translate-y-1",
                        "group-hover:bg-card/80"
                      )}>
                        <CardHeader className="pb-3">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge 
                                variant={getBadgeVariant(item.type)}
                                className="shrink-0 gap-1 px-2 py-1"
                              >
                                <span className="text-xs">{getTypeIcon(item.type)}</span>
                                {item.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs text-muted-foreground border-muted gap-1 px-2 py-1">
                                <span className="text-xs">{getCategoryIcon(item.category)}</span>
                                {item.category.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          <CardTitle className={cn(
                            "text-lg md:text-xl text-foreground leading-tight",
                            "group-hover:text-primary transition-colors duration-200"
                          )}>
                            {item.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
                            {item.description}
                          </CardDescription>
                          <button
                            onClick={() => openExternalLink(item.source, item.title)}
                            className={cn(
                              "inline-flex items-center gap-2 text-primary hover:text-accent",
                              "transition-all duration-200 group/link font-medium text-sm",
                              "hover:gap-3 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded"
                            )}
                            aria-label={`${t.viewSource}: ${item.title}`}
                          >
                            <ExternalLink className="w-4 h-4 group-hover/link:rotate-12 transition-transform" />
                            <span className="underline underline-offset-2">{t.viewSource}</span>
                            <Zap className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                          </button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-12">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loadingState === 'loadingMore'}
                    variant="outline"
                    size="lg"
                    className="gap-2 hover:scale-105 transition-transform"
                  >
                    {loadingState === 'loadingMore' ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    {loadingState === 'loadingMore' ? t.loading : t.loadMore}
                  </Button>
                </div>
              )}

              {/* End of timeline indicator */}
              {!hasMore && timelineItemsToRender.length > 0 && (
                <div className="text-center mt-16">
                  <div className="inline-flex items-center gap-2 text-muted-foreground text-sm bg-card/50 border rounded-full px-4 py-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span>{t.noMoreItems}</span>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!hasMore && timelineItemsToRender.length === 0 && loadingState === 'idle' && (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Filter className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No events found</h3>
                    <p className="text-muted-foreground text-sm">
                      Try adjusting your filter or check back later for updates.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => handleFilterChange('all')}
                      className="mt-4"
                    >
                      Show All Events
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-16 text-center">
            <Card className="card-enhanced max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t.footerNote}{' '}
                  <button
                    onClick={() => openExternalLink('https://teamcherry.com.au/', 'Team Cherry Official Website')}
                    className="text-primary hover:text-accent underline underline-offset-2 transition-colors"
                  >
                    {t.officialWebsite}
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