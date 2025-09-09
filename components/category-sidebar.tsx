'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowUp, Search, Hash, CheckCircle2, Package, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ChecklistCategory } from '@/types';

export interface FilterState {
  searchTerm: string;
  category: string;
  location: string;
  type: string;
  mandatory: string;
  completed: string;
  source: string;
}

export interface CategorySidebarProps {
  checklist: ChecklistCategory[];
  activeCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  onScrollToTop: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  uniqueLocations: string[];
  uniqueTypes: string[];
  uniqueSources: string[];
  filteredItemsCount: number;
  className?: string;
}

const getCategoryEmoji = (categoryId: string): string => {
  const emojiMap: Record<string, string> = {
    bosses: '👹',
    tools: '🔧',
    crests: '⚜️',
    abilities: '✨',
    'mask-shards': '🎭',
    'spool-fragments': '🧵',
    items: '📦',
    areas: '🗺️',
    npcs: '👤',
    quests: '📜'
  };
  return emojiMap[categoryId] || '📋';
};

export function CategorySidebar({
  checklist,
  activeCategory,
  onCategorySelect,
  onScrollToTop,
  filters,
  onFiltersChange,
  uniqueLocations,
  uniqueTypes,
  uniqueSources,
  filteredItemsCount,
  className = ''
}: CategorySidebarProps) {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    // Convert "all" back to empty string for internal state
    const actualValue = value === 'all' ? '' : value;
    onFiltersChange({
      ...filters,
      [key]: actualValue
    });
  }, [filters, onFiltersChange]);

  const handleClearAllFilters = useCallback(() => {
    onFiltersChange({
      searchTerm: '',
      category: '',
      location: '',
      type: '',
      mandatory: '',
      completed: '',
      source: ''
    });
  }, [onFiltersChange]);

  const categoriesWithStats = useMemo(() => {
    return checklist
      .map((category) => {
        const completedItems = category.items.filter(item => item.completed).length;
        const totalItems = category.items.length;
        const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        
        return {
          ...category,
          completedItems,
          totalItems,
          progress,
          isComplete: progress === 100
        };
      });
  }, [checklist]);

  const totalStats = useMemo(() => {
    const totalItems = checklist.reduce((sum, cat) => sum + cat.items.length, 0);
    const totalCompleted = checklist.reduce((sum, cat) => 
      sum + cat.items.filter(item => item.completed).length, 0
    );
    const overallProgress = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;
    
    return { totalItems, totalCompleted, overallProgress };
  }, [checklist]);

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => key !== 'category' && value !== '').length;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  const getProgressColor = (progress: number, isActive: boolean = false) => {
    if (isActive) return 'text-hornet-primary';
    if (progress === 100) return 'text-green-600';
    if (progress >= 80) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    if (progress >= 25) return 'text-orange-600';
    return 'text-gray-500';
  };

  const getBorderColor = (progress: number, isActive: boolean = false) => {
    if (isActive) return 'border-hornet-primary bg-hornet-primary/5';
    if (progress === 100) return 'border-green-200 bg-green-50 hover:bg-green-100';
    return 'border-border bg-card hover:bg-muted/50';
  };

  return (
    <ScrollArea className={`h-full ${className}`}>
      <div className="p-4 space-y-4">
      {/* Search & Filter Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Search className="w-5 h-5 text-hornet-accent" />
            Search
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
            <Badge variant="outline" className="ml-auto">
              {filteredItemsCount} results
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Main Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items by name, description, location..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="pl-10 pr-10"
            />
            {filters.searchTerm && (
              <button
                onClick={() => handleFilterChange('searchTerm', '')}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Select value={filters.mandatory || 'all'} onValueChange={(value) => handleFilterChange('mandatory', value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All items</SelectItem>
                <SelectItem value="Mandatory">Required only</SelectItem>
                <SelectItem value="Optional">Optional only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.completed || 'all'} onValueChange={(value) => handleFilterChange('completed', value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters */}
          <Collapsible open={isFiltersExpanded} onOpenChange={setIsFiltersExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between h-8 text-muted-foreground hover:text-foreground"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  More Filters
                </div>
                {isFiltersExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3">
              <Select value={filters.location || 'all'} onValueChange={(value) => handleFilterChange('location', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Any location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any location</SelectItem>
                  {uniqueLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.type || 'all'} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Any type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any type</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filters.source || 'all'} onValueChange={(value) => handleFilterChange('source', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Any source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any source</SelectItem>
                  {uniqueSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CollapsibleContent>
          </Collapsible>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllFilters}
              className="w-full justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Hash className="w-5 h-5 text-hornet-accent" />
            Categories
            <Badge variant="outline" className="ml-auto">
              {categoriesWithStats.length + 1}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-full">
          <ScrollArea className="h-full px-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              {/* All Categories Button */}
              <button
                onClick={() => onCategorySelect(null)}
                className={`p-2 rounded-lg border text-left hover:bg-muted/50 group relative ${
                  activeCategory === null 
                    ? 'border-hornet-primary bg-hornet-primary/5 text-hornet-primary' 
                    : 'border-border bg-card'
                }`}
                title="View all categories and items"
              >
                <div className="flex items-center gap-1.5">
                  <Package className="w-3 h-3 flex-shrink-0" />
                  <span className="text-xs font-medium truncate">All</span>
                </div>
                {/* Hover tooltip for description */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  View all categories and items
                </div>
              </button>
              
              {categoriesWithStats.map((category) => {
                const isActive = activeCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => onCategorySelect(category.id)}
                    className={`p-2 rounded-lg border text-left hover:bg-muted/50 group relative ${
                      isActive 
                        ? 'border-hornet-primary bg-hornet-primary/5 text-hornet-primary' 
                        : 'border-border bg-card'
                    }`}
                    title={category.description}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm flex-shrink-0">{getCategoryEmoji(category.id)}</span>
                      <span className="text-xs font-medium truncate">{category.title}</span>
                      {category.isComplete && (
                        <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 ml-auto" />
                      )}
                    </div>
                    
                    {/* Hover tooltip for description */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 max-w-48">
                      {category.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* No Results */}
            {categoriesWithStats.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No categories found</p>
                <p className="text-xs">Try adjusting your search terms</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-4 space-y-2">
        <Button
          onClick={onScrollToTop}
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
        >
          <ArrowUp className="w-4 h-4" />
          Back to Top
        </Button>
      </div>
      </div>
    </ScrollArea>
  );
}