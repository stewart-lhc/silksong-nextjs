'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Circle, 
  Printer, 
  RotateCcw, 
  Share2, 
  User, 
  Filter, 
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';
import { interpolate, formatPercentage } from '@/lib/utils';
import checklistData from '@/data/checklist.json';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface ChecklistCategory {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
}

type FilterType = 'all' | 'completed' | 'pending';
type CategoryFilter = 'all' | 'account' | 'lore' | 'hardware' | 'community';

// Loading skeleton component
function ChecklistSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card/50 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-2/3 mx-auto mb-6" />
            <Skeleton className="h-10 w-64 mx-auto mb-6" />
            <div className="max-w-md mx-auto">
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="card-enhanced">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6" />
                    <div>
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-96" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="flex items-center space-x-3 p-3">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChecklistPage() {
  const { t, locale, isLoading: i18nLoading, error: i18nError } = useI18n();
  const [checklist, setChecklist] = useState<ChecklistCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [showCompleted, setShowCompleted] = useState(true);

  // Load checklist and user name from localStorage or use default data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const savedChecklist = localStorage.getItem('silksong-checklist');
        const savedUserName = localStorage.getItem('silksong-checklist-username');
        const savedExpanded = localStorage.getItem('silksong-checklist-expanded');
        const savedFilter = localStorage.getItem('silksong-checklist-filter');
        const savedCategoryFilter = localStorage.getItem('silksong-checklist-category-filter');
        const savedShowCompleted = localStorage.getItem('silksong-checklist-show-completed');
        
        if (savedChecklist) {
          try {
            setChecklist(JSON.parse(savedChecklist));
          } catch (error) {
            console.error('Error parsing saved checklist:', error);
            setChecklist(checklistData);
          }
        } else {
          setChecklist(checklistData);
        }

        if (savedUserName) {
          setUserName(savedUserName);
        }

        // Restore expanded categories or expand all by default
        if (savedExpanded) {
          try {
            setExpandedCategories(new Set(JSON.parse(savedExpanded)));
          } catch {
            setExpandedCategories(new Set(checklistData.map(cat => cat.id)));
          }
        } else {
          setExpandedCategories(new Set(checklistData.map(cat => cat.id)));
        }

        // Restore filters
        if (savedFilter && ['all', 'completed', 'pending'].includes(savedFilter)) {
          setFilter(savedFilter as FilterType);
        }

        if (savedCategoryFilter && ['all', 'account', 'lore', 'hardware', 'community'].includes(savedCategoryFilter)) {
          setCategoryFilter(savedCategoryFilter as CategoryFilter);
        }

        if (savedShowCompleted) {
          setShowCompleted(savedShowCompleted === 'true');
        }

      } catch (err) {
        setError('Failed to load checklist data');
        console.error('Error loading checklist:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever they change
  useEffect(() => {
    if (checklist.length > 0) {
      localStorage.setItem('silksong-checklist', JSON.stringify(checklist));
    }
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem('silksong-checklist-username', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('silksong-checklist-expanded', JSON.stringify(Array.from(expandedCategories)));
  }, [expandedCategories]);

  useEffect(() => {
    localStorage.setItem('silksong-checklist-filter', filter);
  }, [filter]);

  useEffect(() => {
    localStorage.setItem('silksong-checklist-category-filter', categoryFilter);
  }, [categoryFilter]);

  useEffect(() => {
    localStorage.setItem('silksong-checklist-show-completed', showCompleted.toString());
  }, [showCompleted]);

  const toggleItem = (categoryId: string, itemId: string) => {
    setChecklist(prev => prev.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: category.items.map(item => 
            item.id === itemId ? { ...item, completed: !item.completed } : item
          )
        };
      }
      return category;
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getCategoryProgress = (category: ChecklistCategory): number => {
    const completedItems = category.items.filter(item => item.completed).length;
    return Math.round((completedItems / category.items.length) * 100);
  };

  const getOverallProgress = (): number => {
    const totalItems = checklist.reduce((sum, category) => sum + category.items.length, 0);
    const completedItems = checklist.reduce((sum, category) => 
      sum + category.items.filter(item => item.completed).length, 0
    );
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const resetProgress = () => {
    const confirmMessage = t('checklist.resetConfirm');
    if (window.confirm(confirmMessage)) {
      setChecklist(checklistData);
      localStorage.removeItem('silksong-checklist');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const overallProgress = getOverallProgress();
    const shareTemplate = userName 
      ? t('checklist.shareProgress') 
      : t('checklist.shareProgressAnonymous');
    
    const shareText = interpolate(shareTemplate, { 
      name: userName, 
      progress: overallProgress 
    });
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: t('checklist.title'),
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        fallbackShare(shareText, shareUrl);
      }
    } else {
      fallbackShare(shareText, shareUrl);
    }
  };

  const fallbackShare = (text: string, url: string) => {
    const fullText = `${text}\n\n${url}`;
    navigator.clipboard.writeText(fullText).then(() => {
      alert(t('checklist.shareCopied'));
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(t('checklist.shareCopied'));
    });
  };

  const getCategoryIcon = (categoryId: string): string => {
    return t(`checklist.categories.${categoryId}.icon`, '📋');
  };

  const retryLoad = () => {
    window.location.reload();
  };

  // Computed values and filters
  const filteredChecklist = useMemo(() => {
    return checklist.filter(category => {
      // Category filter
      if (categoryFilter !== 'all' && category.id !== categoryFilter) {
        return false;
      }

      // Apply item filters
      const filteredItems = category.items.filter(item => {
        if (filter === 'completed' && !item.completed) return false;
        if (filter === 'pending' && item.completed) return false;
        return true;
      });

      // Only show category if it has items that match the filter
      return filteredItems.length > 0;
    }).map(category => ({
      ...category,
      items: category.items.filter(item => {
        if (!showCompleted && item.completed) return false;
        if (filter === 'completed' && !item.completed) return false;
        if (filter === 'pending' && item.completed) return false;
        return true;
      })
    }));
  }, [checklist, filter, categoryFilter, showCompleted]);

  const overallProgress = getOverallProgress();
  
  const statsData = useMemo(() => {
    const totalItems = checklist.reduce((sum, category) => sum + category.items.length, 0);
    const completedItems = checklist.reduce((sum, category) => 
      sum + category.items.filter(item => item.completed).length, 0
    );
    const remainingItems = totalItems - completedItems;
    
    return {
      totalItems,
      completedItems,
      remainingItems,
      completionRate: overallProgress
    };
  }, [checklist, overallProgress]);

  // Loading state
  if (isLoading || i18nLoading) {
    return <ChecklistSkeleton />;
  }

  // Error state
  if (error || i18nError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('common.error')}</AlertTitle>
              <AlertDescription className="mt-2">
                {error || i18nError}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={retryLoad}
                  className="ml-2"
                >
                  {t('common.retry')}
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            {/* Language Switcher - positioned absolute top-right */}
            <div className="absolute top-4 right-4 z-10">
              <LanguageSwitcher />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold fantasy-text mb-4 text-foreground">
              {t('checklist.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              {t('checklist.subtitle')}
            </p>
            
            {/* Filters and Controls */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('checklist.categories.all')}</SelectItem>
                    <SelectItem value="account">{t('checklist.categories.account.title')}</SelectItem>
                    <SelectItem value="lore">{t('checklist.categories.lore.title')}</SelectItem>
                    <SelectItem value="hardware">{t('checklist.categories.hardware.title')}</SelectItem>
                    <SelectItem value="community">{t('checklist.categories.community.title')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('checklist.filters.all')}</SelectItem>
                  <SelectItem value="completed">{t('checklist.filters.completed')}</SelectItem>
                  <SelectItem value="pending">{t('checklist.filters.pending')}</SelectItem>
                </SelectContent>
              </Select>

              {/* Show/Hide Completed Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompleted(!showCompleted)}
                className="gap-2"
              >
                {showCompleted ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    {t('checklist.filters.hideCompleted')}
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    {t('checklist.filters.showCompleted')}
                  </>
                )}
              </Button>
            </div>
            
            {/* User Name Input */}
            <div className="max-w-sm mx-auto mb-6">
              <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg p-3 border">
                <User className="w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('checklist.usernamePlaceholder')}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-transparent border-none text-foreground placeholder-muted-foreground focus:ring-0 focus:outline-none"
                />
              </div>
            </div>
            
            {/* Overall Progress */}
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {userName ? interpolate(t('checklist.userProgress'), { name: userName }) : t('checklist.overallProgress')}
                </span>
                <span className="text-sm text-muted-foreground">{formatPercentage(overallProgress)}</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 max-w-2xl mx-auto">
              <div className="bg-card/50 rounded-lg p-3 border">
                <div className="text-lg font-bold text-foreground">{statsData.totalItems}</div>
                <div className="text-sm text-muted-foreground">{t('checklist.stats.totalItems')}</div>
              </div>
              <div className="bg-card/50 rounded-lg p-3 border">
                <div className="text-lg font-bold text-hornet-secondary">{statsData.completedItems}</div>
                <div className="text-sm text-muted-foreground">{t('checklist.stats.completedItems')}</div>
              </div>
              <div className="bg-card/50 rounded-lg p-3 border">
                <div className="text-lg font-bold text-hornet-accent">{statsData.remainingItems}</div>
                <div className="text-sm text-muted-foreground">{t('checklist.stats.remainingItems')}</div>
              </div>
              <div className="bg-card/50 rounded-lg p-3 border">
                <div className="text-lg font-bold text-hornet-primary">{formatPercentage(statsData.completionRate)}</div>
                <div className="text-sm text-muted-foreground">{t('checklist.stats.completionRate')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-50 print:hidden">
        <div className="flex flex-col gap-3">
          <Button
            onClick={handlePrint}
            size="icon"
            className="w-12 h-12 bg-hornet-primary hover:bg-hornet-dark text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 group"
            title={t('checklist.tooltips.print')}
          >
            <Printer className="w-5 h-5" />
            <span className="absolute right-14 bg-black/80 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {t('checklist.tooltips.print')}
            </span>
          </Button>
          <Button
            onClick={handleShare}
            size="icon"
            className="w-12 h-12 bg-hornet-secondary hover:bg-hornet-accent text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 group"
            title={t('checklist.tooltips.share')}
          >
            <Share2 className="w-5 h-5" />
            <span className="absolute right-14 bg-black/80 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {t('checklist.tooltips.share')}
            </span>
          </Button>
          <Button
            onClick={resetProgress}
            size="icon"
            className="w-12 h-12 bg-hornet-dark hover:bg-hornet-primary text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 group"
            title={t('checklist.tooltips.reset')}
          >
            <RotateCcw className="w-5 h-5" />
            <span className="absolute right-14 bg-black/80 text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {t('checklist.tooltips.reset')}
            </span>
          </Button>
        </div>
      </div>

      {/* Checklist Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {filteredChecklist.length === 0 ? (
            <Card className="card-enhanced">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="text-4xl mb-4">🦋</div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {t('common.loading', 'No items found')}
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters to see more items.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredChecklist.map((category) => {
              const progress = getCategoryProgress(category);
              const isExpanded = expandedCategories.has(category.id);
              const completedItems = category.items.filter(item => item.completed).length;
              const displayedItems = category.items.filter(item => {
                if (!showCompleted && item.completed) return false;
                return true;
              });

              return (
                <Card 
                  key={category.id} 
                  className="card-enhanced print:bg-white print:border-black print:shadow-none"
                >
                  <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-hornet-dark/10 transition-colors print:hover:bg-transparent">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl print:text-lg">{getCategoryIcon(category.id)}</span>
                            <div>
                              <CardTitle className="text-xl text-foreground print:text-black">
                                {t(`checklist.categories.${category.id}.title`)}
                              </CardTitle>
                              <CardDescription className="text-muted-foreground print:text-gray-700">
                                {t(`checklist.categories.${category.id}.description`)}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <Badge 
                                variant={progress === 100 ? "default" : "secondary"}
                                className="mb-2 print:border print:border-black"
                              >
                                {completedItems}/{category.items.length} {t('checklist.completed')}
                              </Badge>
                              <div className="w-24">
                                <Progress value={progress} className="h-2" />
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-hornet-accent print:hidden" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-hornet-accent print:hidden" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        {displayedItems.length === 0 ? (
                          <div className="text-center py-6 text-muted-foreground">
                            No items match the current filter
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {displayedItems.map((item) => (
                              <div 
                                key={item.id}
                                className="flex items-center space-x-3 p-3 rounded-lg bg-hornet-dark/10 hover:bg-hornet-dark/20 transition-colors print:bg-transparent print:hover:bg-transparent print:border print:border-gray-300"
                              >
                                <Checkbox
                                  id={item.id}
                                  checked={item.completed}
                                  onCheckedChange={() => toggleItem(category.id, item.id)}
                                  className="print:scale-125"
                                />
                                <label 
                                  htmlFor={item.id}
                                  className={`flex-1 text-sm cursor-pointer transition-colors ${
                                    item.completed 
                                      ? 'text-muted-foreground line-through print:text-gray-600' 
                                      : 'text-foreground print:text-black'
                                  }`}
                                >
                                  {item.text}
                                </label>
                                {item.completed ? (
                                  <CheckCircle className="w-4 h-4 text-hornet-secondary print:text-green-600" />
                                ) : (
                                  <Circle className="w-4 h-4 text-hornet-accent/50 print:text-gray-400" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })
          )}

          {/* Summary Card */}
          <Card className="card-enhanced print:bg-white print:border-black">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground mb-4 print:text-black">
                  {userName 
                    ? interpolate(t('checklist.summary.userTitle'), { name: userName })
                    : t('checklist.summary.title')
                  }
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {checklist.map((category) => {
                    const completedItems = category.items.filter(item => item.completed).length;
                    return (
                      <div key={category.id} className="text-center">
                        <div className="text-2xl mb-1">{getCategoryIcon(category.id)}</div>
                        <div className="text-sm text-muted-foreground print:text-gray-600">
                          {t(`checklist.categories.${category.id}.title`)}
                        </div>
                        <div className="text-lg font-bold text-foreground print:text-black">
                          {completedItems}/{category.items.length}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-muted-foreground text-sm print:text-gray-600">
                  {t('checklist.summary.subtitle')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:text-black { color: black !important; }
          .print\\:text-gray-600 { color: #6b7280 !important; }
          .print\\:text-gray-700 { color: #374151 !important; }
          .print\\:border-black { border-color: black !important; }
          .print\\:border-gray-300 { border-color: #d1d5db !important; }
          .print\\:text-green-600 { color: #059669 !important; }
          .print\\:text-gray-400 { color: #9ca3af !important; }
          .print\\:scale-125 { transform: scale(1.25) !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:bg-transparent { background-color: transparent !important; }
          .print\\:hover\\:bg-transparent:hover { background-color: transparent !important; }
          .print\\:border { border-width: 1px !important; }
          .print\\:text-lg { font-size: 1.125rem !important; }
          
          body { 
            background: white !important; 
            color: black !important;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }

        /* Mobile responsive adjustments for floating buttons */
        @media (max-width: 768px) {
          .fixed.right-6 {
            right: 1rem !important;
          }
          
          .fixed .group span {
            display: none !important;
          }
        }

        /* Ensure floating buttons don't interfere with content */
        @media (min-width: 1024px) {
          .container {
            padding-right: 6rem !important;
          }
        }
      `}</style>
    </div>
  );
}