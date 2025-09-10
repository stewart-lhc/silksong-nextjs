'use client';

import { useState, useMemo, useCallback, useEffect, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowUp, Search, Hash, CheckCircle2, Package, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ChecklistCategory } from '@/types';
import { useDebounce } from '@/hooks/use-debounce';

// 性能优化：搜索防抖延迟
const SEARCH_DEBOUNCE_DELAY = 300;

// 性能优化：缓存分类图标
const CATEGORY_EMOJI_CACHE = new Map<string, string>([
  ['bosses', '👹'],
  ['tools', '🔧'],
  ['crests', '⚜️'],
  ['abilities', '✨'],
  ['mask-shards', '🎭'],
  ['spool-fragments', '🧵'],
  ['items', '📦'],
  ['areas', '🗺️'],
  ['npcs', '👤'],
  ['quests', '📜']
]);


// 性能优化：缓存的分类按钮组件
interface CategoryButtonProps {
  category?: {
    id: string;
    title: string;
    description?: string;
    isComplete?: boolean;
  } | null;
  isActive: boolean;
  isAllButton?: boolean;
  onClick: () => void;
}

const CategoryButton = memo(({ 
  category, 
  isActive, 
  isAllButton = false, 
  onClick 
}: CategoryButtonProps) => {
  const emoji = isAllButton ? null : CATEGORY_EMOJI_CACHE.get(category?.id || '') || '📋';
  const title = isAllButton ? 'All' : category?.title || '';
  const description = isAllButton ? 'View all categories and items' : category?.description || '';
  const isComplete = !isAllButton && category?.isComplete;
  
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg border text-left hover:bg-muted/50 group relative transition-all duration-200 ${
        isActive 
          ? 'border-hornet-primary bg-hornet-primary/10 text-hornet-primary shadow-md shadow-hornet-primary/20 ring-2 ring-hornet-primary/20' 
          : 'border-border bg-card hover:border-hornet-primary/30'
      }`}
    >
      <div className="flex items-center gap-1.5">
        {isAllButton ? (
          <Package className={`w-3 h-3 flex-shrink-0 ${isActive ? 'text-hornet-primary' : ''}`} />
        ) : (
          <span className={`text-sm flex-shrink-0 ${isActive ? 'scale-110' : ''} transition-transform duration-200`}>{emoji}</span>
        )}
        <span className={`text-xs font-medium truncate ${isActive ? 'font-semibold' : ''}`}>{title}</span>
        {isComplete && (
          <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0 ml-auto" />
        )}
      </div>
      
      {/* Hover tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-[9999] max-w-80 border border-border/20 backdrop-blur-sm">
        {description}
      </div>
    </button>
  );
});

CategoryButton.displayName = 'CategoryButton';

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

export const CategorySidebar = memo(function CategorySidebar({
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
  const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm);
  
  // 性能优化：防抖搜索
  const debouncedSearchTerm = useDebounce(localSearchTerm, SEARCH_DEBOUNCE_DELAY);
  
  // 性能优化：只在防抖值变化时更新父组件
  useEffect(() => {
    if (debouncedSearchTerm !== filters.searchTerm) {
      onFiltersChange({
        ...filters,
        searchTerm: debouncedSearchTerm
      });
    }
  }, [debouncedSearchTerm, filters, onFiltersChange]);
  
  // 性能优化：同步外部搜索词变化
  useEffect(() => {
    if (filters.searchTerm !== localSearchTerm) {
      setLocalSearchTerm(filters.searchTerm);
    }
  }, [filters.searchTerm, localSearchTerm]);

  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    // Convert "all" back to empty string for internal state
    const actualValue = value === 'all' ? '' : value;
    if (key === 'searchTerm') {
      setLocalSearchTerm(actualValue);
    } else {
      onFiltersChange({
        ...filters,
        [key]: actualValue
      });
    }
  }, [filters, onFiltersChange]);

  const handleClearAllFilters = useCallback(() => {
    setLocalSearchTerm('');
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


  // 性能优化：使用本地搜索词计算活跃过滤器数量
  const activeFilterCount = useMemo(() => {
    const searchCount = localSearchTerm ? 1 : 0;
    const otherFiltersCount = Object.entries(filters)
      .filter(([key, value]) => key !== 'category' && key !== 'searchTerm' && value !== '')
      .length;
    return searchCount + otherFiltersCount;
  }, [filters, localSearchTerm]);

  const hasActiveFilters = activeFilterCount > 0;


  return (
    <div className={`h-full ${className} overflow-y-auto overflow-x-visible checklist-scroll-area`}>
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
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {localSearchTerm && (
              <button
                onClick={() => setLocalSearchTerm('')}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter Buttons */}
          <div className="grid grid-cols-1 gap-2">
            <Select value={filters.mandatory || 'all'} onValueChange={(value) => handleFilterChange('mandatory', value)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All items</SelectItem>
                <SelectItem value="Mandatory">Mandatory</SelectItem>
                <SelectItem value="Optional">Optional</SelectItem>
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
          <div className="h-full px-4 py-4 overflow-y-auto overflow-x-visible checklist-scroll-area">
            <div className="grid grid-cols-2 gap-2">
              {/* All Categories Button */}
              <CategoryButton
                category={null}
                isActive={activeCategory === null}
                isAllButton={true}
                onClick={() => onCategorySelect(null)}
              />
              
              {categoriesWithStats.map((category) => {
                return (
                  <CategoryButton
                    key={category.id}
                    category={category}
                    isActive={activeCategory === category.id}
                    onClick={() => onCategorySelect(category.id)}
                  />
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
          </div>
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
    </div>
  );
});

CategorySidebar.displayName = 'CategorySidebar';