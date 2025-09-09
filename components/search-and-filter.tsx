'use client';

import { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

export interface FilterState {
  searchTerm: string;
  category: string;
  location: string;
  type: string;
  mandatory: string;
  completed: string;
  source: string;
}

export interface SearchAndFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: Array<{ id: string; title: string; itemCount: number; completedCount: number }>;
  locations: string[];
  types: string[];
  sources: string[];
  totalResults: number;
  className?: string;
}

const INITIAL_FILTERS: FilterState = {
  searchTerm: '',
  category: '',
  location: '',
  type: '',
  mandatory: '',
  completed: '',
  source: ''
};

export function SearchAndFilter({
  filters,
  onFiltersChange,
  categories,
  locations,
  types,
  sources,
  totalResults,
  className = ''
}: SearchAndFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFiltersChange]);

  const handleClearFilters = useCallback(() => {
    onFiltersChange(INITIAL_FILTERS);
  }, [onFiltersChange]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== '').length;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Search className="w-5 h-5 text-hornet-accent" />
            Search & Filter
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {totalResults} results
            </Badge>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search items by name, description, location..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-10 pr-4"
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

        {/* Quick Category Filters */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Categories</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.category === '' ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange('category', '')}
              className="h-8"
            >
              All ({categories.reduce((sum, cat) => sum + cat.itemCount, 0)})
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={filters.category === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('category', category.id)}
                className="h-8"
              >
                {category.title} ({category.itemCount})
              </Button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between h-8 text-muted-foreground hover:text-foreground"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Advanced Filters
              </div>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Any location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any location</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any type</SelectItem>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mandatory Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Priority</label>
                <Select value={filters.mandatory} onValueChange={(value) => handleFilterChange('mandatory', value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Any priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any priority</SelectItem>
                    <SelectItem value="Mandatory">Mandatory only</SelectItem>
                    <SelectItem value="Optional">Optional only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Completion Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Select value={filters.completed} onValueChange={(value) => handleFilterChange('completed', value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Any status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any status</SelectItem>
                    <SelectItem value="completed">Completed only</SelectItem>
                    <SelectItem value="pending">Pending only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Source Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Source</label>
              <Select value={filters.source} onValueChange={(value) => handleFilterChange('source', value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Any source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any source</SelectItem>
                  {sources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {filters.searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Search: &quot;{filters.searchTerm}&quot;
                  <button
                    onClick={() => handleFilterChange('searchTerm', '')}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary" className="text-xs">
                  Category: {categories.find(c => c.id === filters.category)?.title}
                  <button
                    onClick={() => handleFilterChange('category', '')}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="text-xs">
                  Location: {filters.location}
                  <button
                    onClick={() => handleFilterChange('location', '')}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.type && (
                <Badge variant="secondary" className="text-xs">
                  Type: {filters.type}
                  <button
                    onClick={() => handleFilterChange('type', '')}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.mandatory && (
                <Badge variant="secondary" className="text-xs">
                  Priority: {filters.mandatory}
                  <button
                    onClick={() => handleFilterChange('mandatory', '')}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.completed && (
                <Badge variant="secondary" className="text-xs">
                  Status: {filters.completed === 'completed' ? 'Completed' : 'Pending'}
                  <button
                    onClick={() => handleFilterChange('completed', '')}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.source && (
                <Badge variant="secondary" className="text-xs">
                  Source: {filters.source}
                  <button
                    onClick={() => handleFilterChange('source', '')}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}