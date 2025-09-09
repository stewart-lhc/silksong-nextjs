'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import fallbackChecklistData from '@/data/checklist.json';
import { ChecklistCategory } from '@/types';
import { FilterState } from '@/components/search-and-filter';

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

interface ChecklistContextType {
  // Data
  checklist: ChecklistCategory[];
  userName: string;
  
  // Filter state
  filters: FilterState;
  filteredItems: Array<ChecklistItem & { categoryId: string; categoryTitle: string }>;
  
  // View state
  viewMode: 'compact' | 'detailed';
  activeCategory: string | null;
  
  // Actions
  toggleItem: (categoryId: string, itemId: string) => void;
  setUserName: (name: string) => void;
  setFilters: (filters: FilterState) => void;
  setViewMode: (mode: 'compact' | 'detailed') => void;
  setActiveCategory: (categoryId: string | null) => void;
  resetProgress: () => void;
  
  // Statistics
  overallProgress: number;
  categoryStats: Array<{
    id: string;
    title: string;
    completedItems: number;
    totalItems: number;
    progress: number;
  }>;
  
  // Data for filters
  uniqueLocations: string[];
  uniqueTypes: string[];
  uniqueSources: string[];
}

const ChecklistContext = createContext<ChecklistContextType | undefined>(undefined);

const STORAGE_KEY = 'silksong-checklist-v2';
const USERNAME_KEY = 'silksong-checklist-username';

const INITIAL_FILTERS: FilterState = {
  searchTerm: '',
  category: '',
  location: '',
  type: '',
  mandatory: '',
  completed: '',
  source: ''
};

interface ChecklistProviderProps {
  children: ReactNode;
}

export function ChecklistProvider({ children }: ChecklistProviderProps) {
  // Core state
  const [checklist, setChecklist] = useState<ChecklistCategory[]>([]);
  const [userName, setUserNameState] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    // Load username
    const savedUserName = localStorage.getItem(USERNAME_KEY);
    if (savedUserName) setUserNameState(savedUserName);

    // Load checklist
    const fallback = (fallbackChecklistData as unknown as ChecklistCategory[]);
    const savedChecklist = localStorage.getItem(STORAGE_KEY);
    
    if (savedChecklist) {
      try {
        const parsed: ChecklistCategory[] = JSON.parse(savedChecklist);
        setChecklist(parsed);
      } catch (error) {
        console.warn('Error parsing saved checklist. Using fresh data.', error);
        setChecklist(fallback);
      }
    } else {
      setChecklist(fallback);
    }
  }, []);

  // Save checklist changes
  useEffect(() => {
    if (checklist.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checklist));
    }
  }, [checklist]);

  // Save username changes
  useEffect(() => {
    localStorage.setItem(USERNAME_KEY, userName);
  }, [userName]);

  // Actions
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

  const setUserName = (name: string) => {
    setUserNameState(name);
  };

  const resetProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      const fallback = (fallbackChecklistData as unknown as ChecklistCategory[]);
      setChecklist(fallback);
    }
  };

  // Computed values
  const overallProgress = useMemo(() => {
    const totalItems = checklist.reduce((sum, category) => sum + category.items.length, 0);
    const completedItems = checklist.reduce((sum, category) => 
      sum + category.items.filter(item => item.completed).length, 0
    );
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  }, [checklist]);

  const categoryStats = useMemo(() => {
    return checklist.map(category => {
      const completedItems = category.items.filter(item => item.completed).length;
      const totalItems = category.items.length;
      const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
      
      return {
        id: category.id,
        title: category.title,
        completedItems,
        totalItems,
        progress
      };
    });
  }, [checklist]);

  // Filter data
  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    checklist.forEach(category => {
      category.items.forEach(item => {
        if (item.location && item.location !== 'Unknown') {
          locations.add(item.location);
        }
      });
    });
    return Array.from(locations).sort();
  }, [checklist]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    checklist.forEach(category => {
      category.items.forEach(item => {
        if (item.type && item.type !== 'Unknown') {
          types.add(item.type);
        }
      });
    });
    return Array.from(types).sort();
  }, [checklist]);

  const uniqueSources = useMemo(() => {
    const sources = new Set<string>();
    checklist.forEach(category => {
      category.items.forEach(item => {
        if (item.source && item.source !== 'Unknown') {
          sources.add(item.source);
        }
      });
    });
    return Array.from(sources).sort();
  }, [checklist]);

  // Filtered items
  const filteredItems = useMemo(() => {
    let items: Array<ChecklistItem & { categoryId: string; categoryTitle: string }> = [];

    // Get items from active category or all categories
    const categoriesToSearch = activeCategory 
      ? checklist.filter(cat => cat.id === activeCategory)
      : checklist;

    categoriesToSearch.forEach(category => {
      category.items.forEach(item => {
        // Ensure all required fields are present
        const fullItem: ChecklistItem = {
          id: item.id,
          name: item.name || item.text || 'Unknown Item',
          description: item.description || '',
          location: item.location || '',
          type: item.type || '',
          requiredFor: item.requiredFor || '',
          reward: item.reward || '',
          mandatory: item.mandatory || '',
          source: item.source || '',
          completed: item.completed,
          text: item.text
        };
        
        items.push({
          ...fullItem,
          categoryId: category.id,
          categoryTitle: category.title
        });
      });
    });

    // Apply filters
    if (filters.category) {
      items = items.filter(item => item.categoryId === filters.category);
    }

    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      items = items.filter(item => {
        const itemName = item.name || item.text || '';
        return (
          itemName.toLowerCase().includes(searchTerm) ||
          item.description?.toLowerCase().includes(searchTerm) ||
          item.location?.toLowerCase().includes(searchTerm) ||
          item.type?.toLowerCase().includes(searchTerm) ||
          item.requiredFor?.toLowerCase().includes(searchTerm) ||
          item.reward?.toLowerCase().includes(searchTerm)
        );
      });
    }

    if (filters.location) {
      items = items.filter(item => item.location === filters.location);
    }

    if (filters.type) {
      items = items.filter(item => item.type === filters.type);
    }

    if (filters.mandatory) {
      items = items.filter(item => item.mandatory === filters.mandatory);
    }

    if (filters.completed) {
      items = items.filter(item => 
        filters.completed === 'completed' ? item.completed : !item.completed
      );
    }

    if (filters.source) {
      items = items.filter(item => item.source === filters.source);
    }

    return items;
  }, [checklist, filters, activeCategory]);

  const contextValue: ChecklistContextType = {
    // Data
    checklist,
    userName,
    
    // Filter state
    filters,
    filteredItems,
    
    // View state
    viewMode,
    activeCategory,
    
    // Actions
    toggleItem,
    setUserName,
    setFilters,
    setViewMode,
    setActiveCategory,
    resetProgress,
    
    // Statistics
    overallProgress,
    categoryStats,
    
    // Data for filters
    uniqueLocations,
    uniqueTypes,
    uniqueSources
  };

  return (
    <ChecklistContext.Provider value={contextValue}>
      {children}
    </ChecklistContext.Provider>
  );
}

export function useChecklist() {
  const context = useContext(ChecklistContext);
  if (context === undefined) {
    throw new Error('useChecklist must be used within a ChecklistProvider');
  }
  return context;
}