'use client';

import { useState, memo, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronRight, MapPin, Tag, Target, Gift, ExternalLink, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// 性能优化：预计算样式类
const STYLE_CACHE = {
  completed: {
    card: 'border-muted bg-muted/40 dark:bg-muted/20 shadow-sm',
    title: 'text-green-700 dark:text-green-300 line-through',
    text: 'text-green-600/80',
    checkbox: 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600',
    indicator: 'bg-gradient-to-b from-green-500 to-emerald-500'
  },
  pending: {
    card: 'hover:border-hornet-accent/50 hover:shadow-md hover:shadow-hornet-primary/5 bg-gradient-to-r from-background to-muted/20',
    title: 'text-foreground hover:text-hornet-primary',
    text: 'text-muted-foreground',
    checkbox: 'hover:border-hornet-primary',
    indicator: 'bg-gradient-to-b from-hornet-primary to-hornet-secondary opacity-60'
  },
  mandatory: {
    indicator: 'bg-gradient-to-b from-red-500 to-orange-500'
  }
};

// 性能优化：高效的文本高亮组件
const HighlightedText = memo(({ text, search }: { text: string; search: string }) => {
  const highlightedContent = useMemo(() => {
    if (!search || !text) return text;
    
    try {
      const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\\]\\]/g, '\\\\$&')})`, 'gi');
      const parts = text.split(regex);
      
      return parts.map((part, index) => 
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 px-1 py-0.5 rounded">
            {part}
          </mark>
        ) : part
      );
    } catch (_error) {
      return text;
    }
  }, [text, search]);
  
  return <>{highlightedContent}</>;
});

HighlightedText.displayName = 'HighlightedText';

export interface ChecklistItem {
  id: string;
  name: string;
  description: string;
  location: string;
  type: string;
  requiredFor: string;
  reward: string;
  mandatory: string;
  source: string;
  completed: boolean;
  text?: string;
}

export interface ItemCardProps {
  item: ChecklistItem;
  categoryId: string;
  onToggle: (categoryId: string, itemId: string) => void;
  viewMode: 'compact' | 'detailed';
  searchTerm?: string;
  className?: string;
}

export const ItemCard = memo(function ItemCard({
  item,
  categoryId,
  onToggle,
  viewMode,
  searchTerm = '',
  className = ''
}: ItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 性能优化：缓存计算值
  const computedValues = useMemo(() => {
    const itemName = item.name || item.text || 'Unknown Item';
    const hasDetailedInfo = Boolean(item.name && item.description && item.location);
    const isMandatory = item.mandatory === 'Mandatory';
    const isCompleted = item.completed;
    
    return {
      itemName,
      hasDetailedInfo,
      isMandatory,
      isCompleted,
      styles: isCompleted ? STYLE_CACHE.completed : STYLE_CACHE.pending,
      indicatorStyle: isCompleted 
        ? STYLE_CACHE.completed.indicator
        : isMandatory 
          ? STYLE_CACHE.mandatory.indicator
          : STYLE_CACHE.pending.indicator
    };
  }, [item.name, item.text, item.description, item.location, item.mandatory, item.completed]);
  
  // 性能优化：缓存事件处理函数
  const handleToggle = useCallback(() => {
    onToggle(categoryId, item.id);
  }, [onToggle, categoryId, item.id]);
  
  const handleExpandToggle = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // 性能优化：缓存Badge组件
  const mandatoryBadge = useMemo(() => {
    if (!computedValues.hasDetailedInfo || !item.mandatory) return null;
    
    return (
      <Badge 
        variant={computedValues.isMandatory ? 'destructive' : 'secondary'}
        className="text-xs font-medium"
      >
        {item.mandatory}
      </Badge>
    );
  }, [computedValues.hasDetailedInfo, computedValues.isMandatory, item.mandatory]);

  // 性能优化：将渲染逻辑拆分为单独组件
  if (viewMode === 'compact') {
    return (
      <Card 
        data-item-card 
        className={`group relative hover:shadow-lg ${computedValues.styles.card} ${className} overflow-hidden`}
      >
        {/* Status Indicator */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${computedValues.indicatorStyle}`} />
        
        <CardContent className="p-4 pl-6">
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <div className="relative">
              <Checkbox
                id={item.id}
                checked={computedValues.isCompleted}
                onCheckedChange={handleToggle}
                className={`mt-1 print:scale-125 ${computedValues.styles.checkbox}`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className={`font-semibold ${computedValues.styles.title}`}>
                  <HighlightedText text={computedValues.itemName} search={searchTerm} />
                </div>
                {mandatoryBadge && (
                  <div className="flex items-center flex-shrink-0">
                    {mandatoryBadge}
                  </div>
                )}
              </div>

              {/* Quick Info */}
              {computedValues.hasDetailedInfo && (
                <div className="flex items-center gap-4 text-xs">
                  {item.location && (
                    <span className={`flex items-center gap-1 truncate transition-colors duration-200 ${
                      computedValues.isCompleted ? 'text-green-600/80' : 'text-muted-foreground group-hover:text-hornet-accent'
                    }`}>
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <HighlightedText text={item.location} search={searchTerm} />
                    </span>
                  )}
                  {item.type && (
                    <span className={`flex items-center gap-1 truncate transition-colors duration-200 ${
                      computedValues.isCompleted ? 'text-green-600/80' : 'text-muted-foreground group-hover:text-hornet-primary'
                    }`}>
                      <Tag className="w-3 h-3 flex-shrink-0" />
                      <HighlightedText text={item.type} search={searchTerm} />
                    </span>
                  )}
                  {item.description && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExpandToggle}
                      className={`h-auto p-0 text-xs transition-colors duration-200 ${
                        computedValues.isCompleted 
                          ? 'text-green-600 hover:text-green-700' 
                          : 'text-hornet-accent hover:text-hornet-primary'
                      }`}
                    >
                      <Info className="w-3 h-3 mr-1" />
                      Details
                      <ChevronRight className={`w-3 h-3 ml-1 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                    </Button>
                  )}
                </div>
              )}

              {/* Expandable Details */}
              {computedValues.hasDetailedInfo && (
                <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                  <CollapsibleContent className="mt-3 pt-3 border-t border-border/50">
                    <div className="space-y-3 text-sm">
                      {item.description && (
                        <p className={`leading-relaxed ${
                          computedValues.isCompleted ? 'text-green-600/80 dark:text-green-400/80' : 'text-muted-foreground'
                        }`}>
                          <HighlightedText text={item.description} search={searchTerm} />
                        </p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {item.requiredFor && item.requiredFor !== 'Unknown' && (
                          <div className={`flex items-start gap-2 p-2 rounded-lg ${
                            computedValues.isCompleted 
                              ? 'bg-muted/40 dark:bg-muted/20' 
                              : 'bg-hornet-secondary/5'
                          }`}>
                            <Target className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                              computedValues.isCompleted ? 'text-green-600' : 'text-hornet-secondary'
                            }`} />
                            <span className={computedValues.isCompleted ? 'text-green-600' : 'text-foreground'}>
                              <span className={`font-medium ${
                                computedValues.isCompleted ? 'text-green-700' : 'text-hornet-secondary'
                              }`}>Required for:</span> {item.requiredFor}
                            </span>
                          </div>
                        )}
                        
                        {item.reward && item.reward !== 'Unknown' && (
                          <div className={`flex items-start gap-2 p-2 rounded-lg ${
                            computedValues.isCompleted 
                              ? 'bg-muted/40 dark:bg-muted/20' 
                              : 'bg-hornet-secondary/5'
                          }`}>
                            <Gift className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                              computedValues.isCompleted ? 'text-green-600' : 'text-hornet-secondary'
                            }`} />
                            <span className={computedValues.isCompleted ? 'text-green-600' : 'text-foreground'}>
                              <span className={`font-medium ${
                                computedValues.isCompleted ? 'text-green-700' : 'text-hornet-secondary'
                              }`}>Reward:</span> {item.reward}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Detailed view mode
  return (
    <Card data-item-card className={`group relative hover:shadow-xl ${
      computedValues.isCompleted 
        ? 'border-muted bg-muted/30 dark:bg-muted/15 shadow-lg' 
        : 'border-border/40 bg-gradient-to-br from-background via-muted/30 to-accent/5 hover:border-hornet-primary/60 hover:shadow-hornet-primary/20 hover:bg-gradient-to-br hover:from-background hover:via-hornet-primary/10 hover:to-hornet-secondary/10'
    } ${className} overflow-hidden backdrop-blur-md ring-1 ring-black/5 dark:ring-white/5`}>
      {/* Enhanced Status Indicator */}
      <div className={`absolute top-0 left-0 w-full h-3 ${
        computedValues.isCompleted 
          ? 'bg-gradient-to-r from-green-400 via-emerald-400 via-green-500 to-emerald-600' 
          : computedValues.isMandatory
            ? 'bg-gradient-to-r from-red-400 via-orange-400 via-red-500 to-orange-600'
            : 'bg-gradient-to-r from-hornet-primary via-hornet-accent via-hornet-secondary to-hornet-primary opacity-80'
      } rounded-t-lg`} />
      
      <CardContent className="p-6 pt-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-5 flex-1">
            <div className="relative group">
              <Checkbox
                id={item.id}
                checked={computedValues.isCompleted}
                onCheckedChange={handleToggle}
                className={`mt-3 w-6 h-6 print:scale-125 ${computedValues.styles.checkbox}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div 
                className={`text-lg font-semibold block leading-tight ${
                  computedValues.isCompleted 
                    ? 'text-green-700 dark:text-green-300 line-through opacity-80' 
                    : 'text-foreground group-hover:text-hornet-primary group-hover:drop-shadow-sm'
                }`}
              >
                <HighlightedText text={computedValues.itemName} search={searchTerm} />
              </div>
              {computedValues.hasDetailedInfo && item.description && (
                <p className={`mt-3 text-sm leading-relaxed ${
                  computedValues.isCompleted 
                    ? 'text-green-600/85 dark:text-green-400/85' 
                    : 'text-muted-foreground group-hover:text-foreground/90'
                }`}>
                  <HighlightedText text={item.description} search={searchTerm} />
                </p>
              )}
            </div>
          </div>
          
          {mandatoryBadge && (
            <div className="flex items-start flex-shrink-0">
              {mandatoryBadge}
            </div>
          )}
        </div>

        {/* Detailed Information Grid */}
        {computedValues.hasDetailedInfo && (
          <TooltipProvider>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-6">
            {/* Location */}
            {item.location && (
              <div className={`flex items-start gap-3 p-3 rounded-xl ${
                computedValues.isCompleted 
                  ? 'bg-muted/30 dark:bg-muted/15 border border-border' 
                  : 'bg-gradient-to-br from-muted/50 to-background/80 border border-border/60 hover:border-hornet-accent/50 hover:shadow-md hover:shadow-hornet-accent/10'
              } backdrop-blur-sm`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`p-2 rounded-lg cursor-help ${
                      computedValues.isCompleted ? 'bg-muted/60 text-muted-foreground' : 'bg-hornet-accent/15 text-hornet-accent group-hover:bg-hornet-accent/25'
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Location</p>
                  </TooltipContent>
                </Tooltip>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${
                    computedValues.isCompleted ? 'text-green-700' : 'text-foreground'
                  }`}>
                    <HighlightedText text={item.location} search={searchTerm} />
                  </div>
                </div>
              </div>
            )}

            {/* Type */}
            {item.type && (
              <div className={`flex items-start gap-3 p-3 rounded-xl ${
                computedValues.isCompleted 
                  ? 'bg-muted/30 dark:bg-muted/15 border border-border' 
                  : 'bg-gradient-to-br from-muted/50 to-background/80 border border-border/60 hover:border-hornet-primary/50 hover:shadow-md hover:shadow-hornet-primary/10'
              } backdrop-blur-sm`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`p-2 rounded-lg cursor-help ${
                      computedValues.isCompleted ? 'bg-muted/60 text-muted-foreground' : 'bg-hornet-primary/15 text-hornet-primary group-hover:bg-hornet-primary/25'
                    }`}>
                      <Tag className="w-4 h-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Type</p>
                  </TooltipContent>
                </Tooltip>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${
                    computedValues.isCompleted ? 'text-green-700' : 'text-foreground'
                  }`}>
                    <HighlightedText text={item.type} search={searchTerm} />
                  </div>
                </div>
              </div>
            )}

            {/* Required For */}
            {item.requiredFor && item.requiredFor !== 'Unknown' && (
              <div className={`flex items-start gap-3 p-3 rounded-xl ${
                computedValues.isCompleted 
                  ? 'bg-muted/30 dark:bg-muted/15 border border-border' 
                  : 'bg-gradient-to-br from-muted/50 to-background/80 border border-border/60 hover:border-hornet-secondary/50 hover:shadow-md hover:shadow-hornet-secondary/10'
              } backdrop-blur-sm`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`p-2 rounded-lg cursor-help ${
                      computedValues.isCompleted ? 'bg-muted/60 text-muted-foreground' : 'bg-hornet-secondary/15 text-hornet-secondary group-hover:bg-hornet-secondary/25'
                    }`}>
                      <Target className="w-4 h-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Required For</p>
                  </TooltipContent>
                </Tooltip>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${
                    computedValues.isCompleted ? 'text-green-700' : 'text-foreground'
                  }`}>
                    {item.requiredFor}
                  </div>
                </div>
              </div>
            )}

            {/* Reward */}
            {item.reward && item.reward !== 'Unknown' && (
              <div className={`flex items-start gap-3 p-3 rounded-xl ${
                computedValues.isCompleted 
                  ? 'bg-muted/30 dark:bg-muted/15 border border-border' 
                  : 'bg-gradient-to-br from-muted/50 to-background/80 border border-border/60 hover:border-hornet-secondary/50 hover:shadow-md hover:shadow-hornet-secondary/10'
              } backdrop-blur-sm`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`p-2 rounded-lg cursor-help ${
                      computedValues.isCompleted ? 'bg-muted/60 text-muted-foreground' : 'bg-hornet-secondary/15 text-hornet-secondary group-hover:bg-hornet-secondary/25'
                    }`}>
                      <Gift className="w-4 h-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reward</p>
                  </TooltipContent>
                </Tooltip>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${
                    computedValues.isCompleted ? 'text-green-700' : 'text-foreground'
                  }`}>
                    {item.reward}
                  </div>
                </div>
              </div>
            )}
            </div>
          </TooltipProvider>
        )}

        {/* Enhanced Source */}
        {computedValues.hasDetailedInfo && item.source && (
          <div className="mt-6 pt-4 border-t border-gradient-to-r from-transparent via-border/60 to-transparent">
            <div className={`flex items-center gap-3 p-3 rounded-xl ${
              computedValues.isCompleted 
                ? 'bg-muted/30 dark:bg-muted/15 border border-border' 
                : 'bg-gradient-to-br from-muted/40 to-background/60 border border-border/50 hover:border-muted-foreground/30 hover:shadow-md hover:shadow-muted/20'
            } backdrop-blur-sm`}>
              <div className={`p-2 rounded-lg ${
                computedValues.isCompleted ? 'bg-muted/60 text-muted-foreground' : 'bg-muted/80 text-muted-foreground'
              }`}>
                <ExternalLink className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  computedValues.isCompleted ? 'text-green-800' : 'text-muted-foreground'
                }`}>Source</span>
                <div className={`text-sm font-medium mt-1 ${
                  computedValues.isCompleted ? 'text-green-700' : 'text-foreground'
                }`}>{item.source}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // 性能优化：自定义比较函数，只在必要时重新渲染
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.completed === nextProps.item.completed &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.text === nextProps.item.text &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.searchTerm === nextProps.searchTerm &&
    prevProps.categoryId === nextProps.categoryId
  );
});

ItemCard.displayName = 'ItemCard';