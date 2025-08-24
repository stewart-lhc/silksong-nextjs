// Base types for the application

export interface GameInfo {
  title: string;
  releaseDate: string;
  status: string;
  lastUpdated: string;
  subscribers: number;
  platforms: string[];
  developer: string;
  publisher: string;
  genre: string[];
  description: string;
}

export interface Platform {
  id: string;
  name: string;
  icon?: string;
  url?: string;
  releaseDate?: string;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  image?: string;
  role: 'protagonist' | 'antagonist' | 'npc' | 'boss';
  abilities?: string[];
}

export interface Location {
  id: string;
  name: string;
  description: string;
  image?: string;
  type: 'city' | 'area' | 'dungeon' | 'landmark';
  characters?: string[]; // Character IDs
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  tags: string[];
  featured: boolean;
  image?: string;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  category: 'screenshot' | 'artwork' | 'trailer' | 'music' | 'promotional';
  publishedAt: string;
  tags: string[];
}

export interface TimelineEvent {
  id: string;
  date: string; // YYYY-MM-DD format
  title: string;
  description: string;
  type: 'Official' | 'Media' | 'Community';
  source: string; // URL
  category: string;
}

// Checklist Data Types (based on existing structure)
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

// UI Component Props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface NavigationItem {
  label: string;
  href: string;
  external?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// New data types for PRD Day 2
export interface DifferenceItem {
  dimension: string;
  hk: string;
  ss: string;
  status: 'confirmed' | 'hinted' | 'tba';
  source: {
    label: string;
    url: string;
  } | null;
}

export interface PlatformItem {
  platform: string;
  status: 'confirmed' | 'tba' | 'unannounced';
  notes?: string;
  source?: {
    label: string;
    url: string;
  } | null;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface UnconfirmedDifferenceItem {
  expectation: string;
  rationale: string;
  status: 'unconfirmed';
  note?: string;
}