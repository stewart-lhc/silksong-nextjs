'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import fallbackChecklistData from '@/data/checklist.json';
import { ChecklistCategory } from '@/types';
import { FilterState } from '@/components/search-and-filter';

// 性能优化：缓存和工具函数
const STORAGE_THROTTLE_DELAY = 300; // localStorage写入节流延迟

// 优化的搜索算法 - 预编译正则表达式
const createSearchMatcher = (searchTerm: string) => {
  if (!searchTerm) return null;
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escapedTerm, 'i');
};

// 高性能字符串匹配函数
const matchesSearchTerm = (item: any, matcher: RegExp | null): boolean => {
  if (!matcher) return true;
  
  // 优化：只检查主要字段，减少计算量
  const itemName = item.name || item.text || '';
  return matcher.test(itemName) ||
         matcher.test(item.description || '') ||
         matcher.test(item.location || '') ||
         matcher.test(item.type || '');
};

// localStorage操作节流函数
const createThrottledStorage = () => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (key: string, value: string) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }, STORAGE_THROTTLE_DELAY);
  };
};

const throttledSetItem = createThrottledStorage();

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
  
  // 性能优化：缓存refs
  const searchMatcherRef = useRef<RegExp | null>(null);
  const lastSearchTermRef = useRef<string>('');
  const filterResultsCacheRef = useRef<Map<string, Array<ChecklistItem & { categoryId: string; categoryTitle: string }>>>(new Map());

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

  // 优化：节流保存checklist变化
  useEffect(() => {
    if (checklist.length > 0) {
      throttledSetItem(STORAGE_KEY, JSON.stringify(checklist));
    }
  }, [checklist]);

  // 优化：节流保存username变化
  useEffect(() => {
    throttledSetItem(USERNAME_KEY, userName);
  }, [userName]);

  // 优化：使用useCallback缓存actions
  const toggleItem = useCallback((categoryId: string, itemId: string) => {
    setChecklist(prev => {
      // 性能优化：提前找到目标category，避免不必要的映射
      const categoryIndex = prev.findIndex(cat => cat.id === categoryId);
      if (categoryIndex === -1) return prev;
      
      const category = prev[categoryIndex];
      const itemIndex = category.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return prev;
      
      // 只更新必要的部分
      const newCategories = [...prev];
      newCategories[categoryIndex] = {
        ...category,
        items: [
          ...category.items.slice(0, itemIndex),
          { ...category.items[itemIndex], completed: !category.items[itemIndex].completed },
          ...category.items.slice(itemIndex + 1)
        ]
      };
      
      // 清除缓存
      filterResultsCacheRef.current.clear();
      return newCategories;
    });
  }, []);

  const setUserName = useCallback((name: string) => {
    setUserNameState(name);
  }, []);

  const resetProgress = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEY);
      const fallback = (fallbackChecklistData as unknown as ChecklistCategory[]);
      setChecklist(fallback);
      // 清除所有缓存
      filterResultsCacheRef.current.clear();
    }
  }, []);

  // 优化：预计算统计数据，避免重复计算
  const statsData = useMemo(() => {
    let totalItems = 0;
    let completedItems = 0;
    
    const categoryStats = checklist.map(category => {
      const categoryCompletedItems = category.items.filter(item => item.completed).length;
      const categoryTotalItems = category.items.length;
      
      totalItems += categoryTotalItems;
      completedItems += categoryCompletedItems;
      
      return {
        id: category.id,
        title: category.title,
        completedItems: categoryCompletedItems,
        totalItems: categoryTotalItems,
        progress: categoryTotalItems > 0 ? Math.round((categoryCompletedItems / categoryTotalItems) * 100) : 0 // Keep category progress as percentage for display
      };
    });
    
    return {
      overallProgress: completedItems, // 1 item = 1%, so completed items directly = progress percentage
      categoryStats,
      totalItems,
      completedItems
    };
  }, [checklist]);
  
  const overallProgress = statsData.overallProgress;
  const categoryStats = statsData.categoryStats;


  // 优化：一次遍历获取所有唯一值
  const uniqueValues = useMemo(() => {
    const locations = new Set<string>();
    const types = new Set<string>();
    const sources = new Set<string>();
    
    checklist.forEach(category => {
      category.items.forEach(item => {
        if (item.location && item.location !== 'Unknown') {
          locations.add(item.location);
        }
        if (item.type && item.type !== 'Unknown') {
          types.add(item.type);
        }
        if (item.source && item.source !== 'Unknown') {
          sources.add(item.source);
        }
      });
    });
    
    return {
      uniqueLocations: Array.from(locations).sort(),
      uniqueTypes: Array.from(types).sort(),
      uniqueSources: Array.from(sources).sort()
    };
  }, [checklist]);
  
  const { uniqueLocations, uniqueTypes, uniqueSources } = uniqueValues;

  // 极致优化：高性能过滤算法with缓存
  const filteredItems = useMemo(() => {
    // 生成缓存键
    const cacheKey = JSON.stringify({ filters, activeCategory, checklistLength: checklist.length });
    const cached = filterResultsCacheRef.current.get(cacheKey);
    if (cached) return cached;
    
    // 更新搜索匹配器
    if (lastSearchTermRef.current !== filters.searchTerm) {
      searchMatcherRef.current = createSearchMatcher(filters.searchTerm);
      lastSearchTermRef.current = filters.searchTerm;
    }
    
    const items: Array<ChecklistItem & { categoryId: string; categoryTitle: string }> = [];

    // 优化：只处理需要的categories
    const categoriesToProcess = activeCategory 
      ? checklist.filter(cat => cat.id === activeCategory)
      : checklist;

    // 优化：使用for循环替代forEach，性能更好
    for (let catIndex = 0; catIndex < categoriesToProcess.length; catIndex++) {
      const category = categoriesToProcess[catIndex];
      
      for (let itemIndex = 0; itemIndex < category.items.length; itemIndex++) {
        const item = category.items[itemIndex];
        
        // 预过滤：先检查快速过滤条件
        if (filters.category && category.id !== filters.category) continue;
        if (filters.location && item.location !== filters.location) continue;
        if (filters.type && item.type !== filters.type) continue;
        if (filters.mandatory && item.mandatory !== filters.mandatory) continue;
        if (filters.source && item.source !== filters.source) continue;
        if (filters.completed) {
          const shouldBeCompleted = filters.completed === 'completed';
          if (item.completed !== shouldBeCompleted) continue;
        }
        
        // 搜索过滤（最昂贵的操作放在最后）
        if (!matchesSearchTerm(item, searchMatcherRef.current)) continue;
        
        // 构建结果项
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
      }
    }

    // 缓存结果
    filterResultsCacheRef.current.set(cacheKey, items);
    
    // 限制缓存大小
    if (filterResultsCacheRef.current.size > 50) {
      const firstKey = filterResultsCacheRef.current.keys().next().value;
      if (firstKey) {
        filterResultsCacheRef.current.delete(firstKey);
      }
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