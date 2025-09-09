'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { CheckCircle2, ChevronRight, MapPin, Tag, Target, Gift, ExternalLink, Info } from 'lucide-react';

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

export function ItemCard({
  item,
  categoryId,
  onToggle,
  viewMode,
  searchTerm = '',
  className = ''
}: ItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const itemName = item.name || item.text || 'Unknown Item';
  const hasDetailedInfo = item.name && item.description && item.location;

  // Highlight search terms
  const highlightText = (text: string, search: string) => {
    if (!search || !text) return text;
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 px-1 py-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const getMandatoryBadge = () => {
    if (!hasDetailedInfo || !item.mandatory) return null;
    
    return (
      <Badge 
        variant={item.mandatory === 'Mandatory' ? 'destructive' : 'secondary'}
        className="text-xs font-medium"
      >
        {item.mandatory}
      </Badge>
    );
  };


  if (viewMode === 'compact') {
    return (
      <Card data-item-card className={`group relative hover:shadow-lg ${
        item.completed 
          ? 'border-muted bg-muted/40 dark:bg-muted/20 shadow-sm' 
          : 'hover:border-hornet-accent/50 hover:shadow-md hover:shadow-hornet-primary/5 bg-gradient-to-r from-background to-muted/20'
      } ${className} overflow-hidden`}>
        {/* Status Indicator */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
          item.completed 
            ? 'bg-gradient-to-b from-green-500 to-emerald-500' 
            : getMandatoryBadge()?.props.variant === 'destructive'
              ? 'bg-gradient-to-b from-red-500 to-orange-500'
              : 'bg-gradient-to-b from-hornet-primary to-hornet-secondary opacity-60'
        }`} />
        
        <CardContent className="p-4 pl-6">
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <div className="relative">
              <Checkbox
                id={item.id}
                checked={item.completed}
                onCheckedChange={(checked) => onToggle(categoryId, item.id)}
                className={`mt-1 print:scale-125 ${
                  item.completed 
                    ? 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600' 
                    : 'hover:border-hornet-primary'
                }`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div 
                  className={`font-semibold ${
                    item.completed 
                      ? 'text-green-700 dark:text-green-300 line-through' 
                      : 'text-foreground hover:text-hornet-primary'
                  }`}
                >
                  {highlightText(itemName, searchTerm)}
                </div>
                {getMandatoryBadge() && (
                  <div className="flex items-center flex-shrink-0">
                    {getMandatoryBadge()}
                  </div>
                )}
              </div>

              {/* Quick Info */}
              {hasDetailedInfo && (
                <div className="flex items-center gap-4 text-xs">
                  {item.location && (
                    <span className={`flex items-center gap-1 truncate transition-colors duration-200 ${
                      item.completed ? 'text-green-600/80' : 'text-muted-foreground group-hover:text-hornet-accent'
                    }`}>
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {highlightText(item.location, searchTerm)}
                    </span>
                  )}
                  {item.type && (
                    <span className={`flex items-center gap-1 truncate transition-colors duration-200 ${
                      item.completed ? 'text-green-600/80' : 'text-muted-foreground group-hover:text-hornet-primary'
                    }`}>
                      <Tag className="w-3 h-3 flex-shrink-0" />
                      {highlightText(item.type, searchTerm)}
                    </span>
                  )}
                  {item.description && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className={`h-auto p-0 text-xs transition-colors duration-200 ${
                        item.completed 
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
              {hasDetailedInfo && (
                <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                  <CollapsibleContent className="mt-3 pt-3 border-t border-border/50">
                    <div className="space-y-3 text-sm">
                      {item.description && (
                        <p className={`leading-relaxed ${
                          item.completed ? 'text-green-600/80 dark:text-green-400/80' : 'text-muted-foreground'
                        }`}>
                          {highlightText(item.description, searchTerm)}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-1 gap-3 text-xs">
                        {item.requiredFor && item.requiredFor !== 'Unknown' && (
                          <div className={`flex items-start gap-2 p-2 rounded-lg ${
                            item.completed 
                              ? 'bg-green-50/50 dark:bg-green-900/10' 
                              : 'bg-hornet-secondary/5'
                          }`}>
                            <Target className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                              item.completed ? 'text-green-600' : 'text-hornet-secondary'
                            }`} />
                            <span className={item.completed ? 'text-green-600' : 'text-foreground'}>
                              <span className={`font-medium ${
                                item.completed ? 'text-green-700' : 'text-hornet-secondary'
                              }`}>Required for:</span> {item.requiredFor}
                            </span>
                          </div>
                        )}
                        
                        {item.reward && item.reward !== 'Unknown' && (
                          <div className={`flex items-start gap-2 p-2 rounded-lg ${
                            item.completed 
                              ? 'bg-green-50/50 dark:bg-green-900/10' 
                              : 'bg-amber-50/50 dark:bg-amber-900/10'
                          }`}>
                            <Gift className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                              item.completed ? 'text-green-600' : 'text-amber-600'
                            }`} />
                            <span className={item.completed ? 'text-green-600' : 'text-foreground'}>
                              <span className={`font-medium ${
                                item.completed ? 'text-green-700' : 'text-amber-700'
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
      item.completed 
        ? 'border-muted bg-muted/30 dark:bg-muted/15 shadow-lg' 
        : 'border-border/40 bg-gradient-to-br from-background via-muted/30 to-accent/5 hover:border-hornet-primary/60 hover:shadow-hornet-primary/20 hover:bg-gradient-to-br hover:from-background hover:via-hornet-primary/10 hover:to-hornet-secondary/10'
    } ${className} overflow-hidden backdrop-blur-md ring-1 ring-black/5 dark:ring-white/5`}>
      {/* Enhanced Status Indicator */}
      <div className={`absolute top-0 left-0 w-full h-3 ${
        item.completed 
          ? 'bg-gradient-to-r from-green-400 via-emerald-400 via-green-500 to-emerald-600' 
          : getMandatoryBadge()?.props.variant === 'destructive'
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
                checked={item.completed}
                onCheckedChange={(checked) => onToggle(categoryId, item.id)}
                className={`mt-3 w-6 h-6 print:scale-125 ${
                  item.completed 
                    ? 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600' 
                    : 'hover:border-hornet-primary'
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div 
                className={`text-lg font-semibold block leading-tight ${
                  item.completed 
                    ? 'text-green-700 dark:text-green-300 line-through opacity-80' 
                    : 'text-foreground group-hover:text-hornet-primary group-hover:drop-shadow-sm'
                }`}
              >
                {highlightText(itemName, searchTerm)}
              </div>
              {hasDetailedInfo && item.description && (
                <p className={`mt-3 text-sm leading-relaxed ${
                  item.completed 
                    ? 'text-green-600/85 dark:text-green-400/85' 
                    : 'text-muted-foreground group-hover:text-foreground/90'
                }`}>
                  {highlightText(item.description, searchTerm)}
                </p>
              )}
            </div>
          </div>
          
          {getMandatoryBadge() && (
            <div className="flex items-start flex-shrink-0">
              {getMandatoryBadge()}
            </div>
          )}
        </div>

        {/* Detailed Information Grid */}
        {hasDetailedInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-6">
            {/* Location */}
            {item.location && (
              <div className={`flex items-start gap-3 p-3 rounded-xl ${
                item.completed 
                  ? 'bg-gradient-to-br from-green-50/80 to-emerald-50/60 border border-green-200/60 shadow-md shadow-green-100/50 dark:bg-gradient-to-br dark:from-green-950/30 dark:to-emerald-950/20 dark:border-green-800/40' 
                  : 'bg-gradient-to-br from-muted/50 to-background/80 border border-border/60 hover:border-hornet-accent/50 hover:shadow-md hover:shadow-hornet-accent/10'
              } backdrop-blur-sm`}>
                <div className={`p-2 rounded-lg ${
                  item.completed ? 'bg-green-200/80 text-green-800 shadow-md shadow-green-200/50' : 'bg-hornet-accent/15 text-hornet-accent group-hover:bg-hornet-accent/25'
                }`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`font-semibold text-xs uppercase tracking-wider ${
                    item.completed ? 'text-green-800' : 'text-hornet-accent'
                  }`}>Location</span>
                  <div className={`mt-1 font-medium text-sm ${
                    item.completed ? 'text-green-700' : 'text-foreground'
                  }`}>
                    {highlightText(item.location, searchTerm)}
                  </div>
                </div>
              </div>
            )}

            {/* Type */}
            {item.type && (
              <div className={`flex items-start gap-3 p-3 rounded-xl ${
                item.completed 
                  ? 'bg-gradient-to-br from-green-50/80 to-emerald-50/60 border border-green-200/60 shadow-md shadow-green-100/50 dark:bg-gradient-to-br dark:from-green-950/30 dark:to-emerald-950/20 dark:border-green-800/40' 
                  : 'bg-gradient-to-br from-muted/50 to-background/80 border border-border/60 hover:border-hornet-primary/50 hover:shadow-md hover:shadow-hornet-primary/10'
              } backdrop-blur-sm`}>
                <div className={`p-2 rounded-lg ${
                  item.completed ? 'bg-green-200/80 text-green-800 shadow-md shadow-green-200/50' : 'bg-hornet-primary/15 text-hornet-primary group-hover:bg-hornet-primary/25'
                }`}>
                  <Tag className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`font-semibold text-xs uppercase tracking-wider ${
                    item.completed ? 'text-green-800' : 'text-hornet-primary'
                  }`}>Type</span>
                  <div className={`mt-1 font-medium text-sm ${
                    item.completed ? 'text-green-700' : 'text-foreground'
                  }`}>
                    {highlightText(item.type, searchTerm)}
                  </div>
                </div>
              </div>
            )}

            {/* Required For */}
            {item.requiredFor && item.requiredFor !== 'Unknown' && (
              <div className={`flex items-start gap-3 p-3 rounded-xl ${
                item.completed 
                  ? 'bg-gradient-to-br from-green-50/80 to-emerald-50/60 border border-green-200/60 shadow-md shadow-green-100/50 dark:bg-gradient-to-br dark:from-green-950/30 dark:to-emerald-950/20 dark:border-green-800/40' 
                  : 'bg-gradient-to-br from-muted/50 to-background/80 border border-border/60 hover:border-hornet-secondary/50 hover:shadow-md hover:shadow-hornet-secondary/10'
              } backdrop-blur-sm`}>
                <div className={`p-2 rounded-lg ${
                  item.completed ? 'bg-green-200/80 text-green-800 shadow-md shadow-green-200/50' : 'bg-hornet-secondary/15 text-hornet-secondary group-hover:bg-hornet-secondary/25'
                }`}>
                  <Target className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`font-semibold text-xs uppercase tracking-wider ${
                    item.completed ? 'text-green-800' : 'text-hornet-secondary'
                  }`}>Required For</span>
                  <div className={`mt-1 font-medium text-sm ${
                    item.completed ? 'text-green-700' : 'text-foreground'
                  }`}>
                    {item.requiredFor}
                  </div>
                </div>
              </div>
            )}

            {/* Reward */}
            {item.reward && item.reward !== 'Unknown' && (
              <div className={`flex items-start gap-3 p-3 rounded-xl ${
                item.completed 
                  ? 'bg-gradient-to-br from-green-50/80 to-emerald-50/60 border border-green-200/60 shadow-md shadow-green-100/50 dark:bg-gradient-to-br dark:from-green-950/30 dark:to-emerald-950/20 dark:border-green-800/40' 
                  : 'bg-gradient-to-br from-amber-50/70 to-yellow-50/50 border border-amber-200/60 hover:border-amber-400/60 hover:shadow-md hover:shadow-amber-200/40'
              } backdrop-blur-sm`}>
                <div className={`p-2 rounded-lg ${
                  item.completed ? 'bg-green-200/80 text-green-800 shadow-md shadow-green-200/50' : 'bg-amber-200/80 text-amber-800 shadow-md shadow-amber-200/50'
                }`}>
                  <Gift className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`font-semibold text-xs uppercase tracking-wider ${
                    item.completed ? 'text-green-800' : 'text-amber-800'
                  }`}>Reward</span>
                  <div className={`mt-1 font-medium text-sm ${
                    item.completed ? 'text-green-700' : 'text-foreground'
                  }`}>
                    {item.reward}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Source */}
        {hasDetailedInfo && item.source && (
          <div className="mt-6 pt-4 border-t border-gradient-to-r from-transparent via-border/60 to-transparent">
            <div className={`flex items-center gap-3 p-3 rounded-xl ${
              item.completed 
                ? 'bg-gradient-to-br from-green-50/60 to-emerald-50/40 border border-green-200/50 shadow-md shadow-green-100/30' 
                : 'bg-gradient-to-br from-muted/40 to-background/60 border border-border/50 hover:border-muted-foreground/30 hover:shadow-md hover:shadow-muted/20'
            } backdrop-blur-sm`}>
              <div className={`p-2 rounded-lg transition-all duration-300 ${
                item.completed ? 'bg-green-200/60 text-green-700 shadow-md shadow-green-200/40' : 'bg-muted/80 text-muted-foreground'
              }`}>
                <ExternalLink className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  item.completed ? 'text-green-800' : 'text-muted-foreground'
                }`}>Source</span>
                <div className={`text-sm font-medium mt-1 ${
                  item.completed ? 'text-green-700' : 'text-foreground'
                }`}>{item.source}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}