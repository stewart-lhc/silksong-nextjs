/**
 * Data structure types for Silksong Next.js application
 */

// Timeline types
export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'Official' | 'Media' | 'Community';
  source: string;
  category: string;
}

// Checklist types
export interface ChecklistSubItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ChecklistCategory {
  id: string;
  title: string;
  description: string;
  items: ChecklistSubItem[];
}

// Comparison/Differences types
export interface DifferenceItem {
  dimension: string;
  hk?: string; // Hollow Knight
  ss?: string; // Silksong
  hollowKnight?: string; // Alternative naming
  silksong?: string; // Alternative naming
  status: 'confirmed' | 'hinted' | 'tba';
  source: {
    label: string;
    url: string;
  };
}

export interface UnconfirmedDifferenceItem {
  expectation: string;
  rationale: string;
  status?: string;
  note?: string;
}

// Platform types
export interface PlatformItem {
  platform: string;
  status: 'confirmed' | 'tba' | 'unannounced';
  notes?: string;
  source?: {
    label: string;
    url: string;
  };
}

// FAQ types
export interface FaqItem {
  q: string; // question
  a: string; // answer
}

// Additional utility types
export interface Source {
  label: string;
  url: string;
}

export type EventStatus = 'confirmed' | 'hinted' | 'tba';
export type PlatformStatus = 'confirmed' | 'tba' | 'unannounced';
export type EventType = 'Official' | 'Media' | 'Community';

// Statistics types
export interface ChecklistStats {
  totalItems: number;
  completedCount: number;
  completionPercentage: number;
  byCategory: Record<string, {
    total: number;
    completed: number;
    percentage: number;
  }>;
}

export interface TimelineStats {
  total: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  latestEvent: TimelineEvent;
  oldestEvent: TimelineEvent;
}

export interface CategoryProgress {
  category: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface DifferencesStats {
  total: number;
  confirmed: number;
  hinted: number;
  tba: number;
  confirmedPercentage: number;
  hintedPercentage: number;
  tbaPercentage: number;
}

export interface PlatformsStats {
  total: number;
  confirmed: number;
  tba: number;
  unannounced: number;
  confirmedPercentage: number;
}