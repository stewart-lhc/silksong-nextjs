// Data exports
import timelineData from './timeline.json';
import checklistData from './checklist.json';
import gameInfoData from './gameInfo.json';
import comparisonData from './comparison.json';
import differencesData from './differences.json';
import platformsData from './platforms.json';
import faqsData from './faqs.json';
import differencesUnconfirmedData from './differences-unconfirmed.json';

// Type imports
import type { TimelineEvent, ChecklistCategory, ChecklistSubItem, DifferenceItem, PlatformItem, FaqItem, UnconfirmedDifferenceItem } from '../types';
import type { GameInfo } from '../types/game';

// Typed exports
export const timeline: TimelineEvent[] = timelineData as TimelineEvent[];
export const checklist: ChecklistCategory[] = checklistData;
export const gameInfo: GameInfo = gameInfoData;
export const comparison = comparisonData;
export const differences: DifferenceItem[] = differencesData as DifferenceItem[];
export const platforms: PlatformItem[] = platformsData as PlatformItem[];
export const faqs: FaqItem[] = faqsData;
export const differencesUnconfirmed: UnconfirmedDifferenceItem[] = differencesUnconfirmedData as UnconfirmedDifferenceItem[];

// Utility functions for data access
export const getTimelineByType = (type: 'Official' | 'Media' | 'Community') => {
  return timeline.filter(event => event.type === type);
};

export const getTimelineByCategory = (category: string) => {
  return timeline.filter(event => event.category === category);
};

export const getChecklistCategory = (categoryId: string) => {
  return checklist.find(category => category.id === categoryId);
};

export const getAllChecklistItems = (): ChecklistSubItem[] => {
  return checklist.flatMap(category => category.items);
};

export const getCompletedItems = (): ChecklistSubItem[] => {
  return getAllChecklistItems().filter(item => item.completed);
};

export const getPendingItems = (): ChecklistSubItem[] => {
  return getAllChecklistItems().filter(item => !item.completed);
};

export const getTimelineSorted = (ascending = false) => {
  return [...timeline].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

// Statistics
export const getChecklistStats = () => {
  const allItems = getAllChecklistItems();
  const completedItems = getCompletedItems();
  const totalItems = allItems.length;
  const completedCount = completedItems.length;
  
  const byCategory = checklist.reduce((acc, category) => {
    const completed = category.items.filter(item => item.completed).length;
    const total = category.items.length;
    acc[category.title] = {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
    return acc;
  }, {} as Record<string, { total: number; completed: number; percentage: number }>);

  return {
    totalItems,
    completedCount,
    completionPercentage: totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0,
    byCategory
  };
};

export const getTimelineStats = () => {
  const total = timeline.length;
  const byType = timeline.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byCategory = timeline.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const latestEvent = getTimelineSorted(false)[0];
  const oldestEvent = getTimelineSorted(true)[0];

  return {
    total,
    byType,
    byCategory,
    latestEvent,
    oldestEvent
  };
};

// Helper functions for UI components
export const getRecentEvents = (count = 5) => {
  return getTimelineSorted(false).slice(0, count);
};

export const getCategoryProgress = (categoryId: string) => {
  const category = getChecklistCategory(categoryId);
  if (!category) return null;
  
  const completed = category.items.filter(item => item.completed).length;
  const total = category.items.length;
  
  return {
    category: category.title,
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0
  };
};

// New utility functions for PRD Day 2 data
export const getDifferencesByStatus = (status: 'confirmed' | 'hinted' | 'tba') => {
  return differences.filter(item => item.status === status);
};

export const getPlatformsByStatus = (status: 'confirmed' | 'tba' | 'unannounced') => {
  return platforms.filter(item => item.status === status);
};

export const getConfirmedPlatforms = () => {
  return getPlatformsByStatus('confirmed');
};

export const getGamePassPlatform = () => {
  return platforms.find(platform => 
    platform.platform.toLowerCase().includes('game pass')
  );
};

export const getFaqsByKeyword = (keyword: string) => {
  return faqs.filter(faq => 
    faq.q.toLowerCase().includes(keyword.toLowerCase()) ||
    faq.a.toLowerCase().includes(keyword.toLowerCase())
  );
};

export const getGamePassFaqs = () => {
  return getFaqsByKeyword('game pass');
};

export const getDifferencesStats = () => {
  const total = differences.length;
  const confirmed = getDifferencesByStatus('confirmed').length;
  const hinted = getDifferencesByStatus('hinted').length;
  const tba = getDifferencesByStatus('tba').length;
  
  return {
    total,
    confirmed,
    hinted,
    tba,
    confirmedPercentage: total > 0 ? Math.round((confirmed / total) * 100) : 0,
    hintedPercentage: total > 0 ? Math.round((hinted / total) * 100) : 0,
    tbaPercentage: total > 0 ? Math.round((tba / total) * 100) : 0
  };
};

export const getPlatformsStats = () => {
  const total = platforms.length;
  const confirmed = getPlatformsByStatus('confirmed').length;
  const tba = getPlatformsByStatus('tba').length;
  const unannounced = getPlatformsByStatus('unannounced').length;
  
  return {
    total,
    confirmed,
    tba,
    unannounced,
    confirmedPercentage: total > 0 ? Math.round((confirmed / total) * 100) : 0
  };
};