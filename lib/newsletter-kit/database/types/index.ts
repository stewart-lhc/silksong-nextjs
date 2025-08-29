/**
 * Newsletter Kit Database Types
 * 
 * Complete TypeScript type definitions for newsletter database schema
 */

// Database connection types
export type DatabaseType = 'supabase' | 'postgresql' | 'mysql' | 'sqlite';

export interface DatabaseConfig {
  type: DatabaseType;
  connectionString?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  poolSize?: number;
  timeout?: number;
}

// Core subscription types
export interface NewsletterSubscription {
  id: string;
  email: string;
  status: SubscriptionStatus;
  source: string;
  tags: string[];
  metadata: Record<string, any>;
  subscribedAt: Date;
  confirmedAt?: Date;
  unsubscribedAt?: Date;
  confirmationToken?: string;
  unsubscribeToken: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus = 'pending' | 'active' | 'unsubscribed' | 'bounced' | 'blocked';

// Unsubscribe token management
export interface UnsubscribeToken {
  id: string;
  subscriptionId: string;
  token: string;
  email: string;
  expiresAt: Date;
  usedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Analytics and reporting
export interface NewsletterAnalytics {
  id: string;
  date: Date;
  source?: string;
  tag?: string;
  subscriptionsCount: number;
  unsubscriptionsCount: number;
  confirmationsCount: number;
  bouncesCount: number;
  netGrowth: number;
  createdAt: Date;
  updatedAt: Date;
}

// Audit logging
export interface NewsletterAuditLog {
  id: string;
  subscriptionId?: string;
  email: string;
  action: AuditAction;
  previousStatus?: SubscriptionStatus;
  newStatus?: SubscriptionStatus;
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export type AuditAction = 
  | 'subscribe'
  | 'confirm'
  | 'unsubscribe'
  | 'bounce'
  | 'block'
  | 'update'
  | 'delete'
  | 'export'
  | 'import';

// Email bounce tracking
export interface EmailBounce {
  id: string;
  email: string;
  bounceType: BounceType;
  bounceReason: string;
  bouncedAt: Date;
  providerResponse?: Record<string, any>;
  resolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
}

export type BounceType = 'hard' | 'soft' | 'complaint' | 'suppression';

// Subscription tags for segmentation
export interface SubscriptionTag {
  id: string;
  name: string;
  description?: string;
  color?: string;
  isSystem: boolean;
  subscriptionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Database adapter interface
export interface DatabaseAdapter {
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Subscription management
  createSubscription(data: Omit<NewsletterSubscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<NewsletterSubscription>;
  getSubscription(id: string): Promise<NewsletterSubscription | null>;
  getSubscriptionByEmail(email: string): Promise<NewsletterSubscription | null>;
  getSubscriptionByToken(token: string): Promise<NewsletterSubscription | null>;
  updateSubscription(id: string, data: Partial<NewsletterSubscription>): Promise<NewsletterSubscription>;
  deleteSubscription(id: string): Promise<void>;
  
  // Bulk operations
  getSubscriptions(options?: QueryOptions): Promise<PaginatedResult<NewsletterSubscription>>;
  bulkUpdateSubscriptions(updates: BulkUpdateOperation[]): Promise<number>;
  exportSubscriptions(options?: ExportOptions): Promise<NewsletterSubscription[]>;
  
  // Token management
  createUnsubscribeToken(data: Omit<UnsubscribeToken, 'id' | 'createdAt'>): Promise<UnsubscribeToken>;
  getUnsubscribeToken(token: string): Promise<UnsubscribeToken | null>;
  useUnsubscribeToken(token: string): Promise<void>;
  
  // Analytics
  createAnalyticsEntry(data: Omit<NewsletterAnalytics, 'id' | 'createdAt' | 'updatedAt'>): Promise<NewsletterAnalytics>;
  getAnalytics(options: AnalyticsQuery): Promise<NewsletterAnalytics[]>;
  getGrowthStats(startDate: Date, endDate: Date): Promise<GrowthStats>;
  getSubscriptionStats(): Promise<SubscriptionStats>;
  
  // Audit logging
  createAuditLog(data: Omit<NewsletterAuditLog, 'id' | 'timestamp'>): Promise<NewsletterAuditLog>;
  getAuditLogs(options?: QueryOptions): Promise<PaginatedResult<NewsletterAuditLog>>;
  
  // Bounce management
  createBounce(data: Omit<EmailBounce, 'id' | 'createdAt'>): Promise<EmailBounce>;
  getBounces(email?: string): Promise<EmailBounce[]>;
  resolveBounce(id: string): Promise<void>;
  
  // Tag management
  createTag(data: Omit<SubscriptionTag, 'id' | 'subscriptionCount' | 'createdAt' | 'updatedAt'>): Promise<SubscriptionTag>;
  getTags(): Promise<SubscriptionTag[]>;
  getPopularTags(limit?: number): Promise<TagUsageStats[]>;
  
  // Utility functions
  runMigrations(): Promise<void>;
  healthCheck(): Promise<boolean>;
  cleanup(): Promise<void>;
}

// Query and pagination types
export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ExportOptions {
  format?: 'json' | 'csv';
  fields?: string[];
  filters?: Record<string, any>;
}

export interface BulkUpdateOperation {
  id: string;
  data: Partial<NewsletterSubscription>;
}

// Analytics query types
export interface AnalyticsQuery {
  startDate: Date;
  endDate: Date;
  source?: string;
  tag?: string;
  groupBy?: 'date' | 'source' | 'tag';
  interval?: 'day' | 'week' | 'month';
}

export interface GrowthStats {
  subscriptions: number;
  unsubscriptions: number;
  netGrowth: number;
  growthRate: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface SubscriptionStats {
  total: number;
  active: number;
  pending: number;
  unsubscribed: number;
  bounced: number;
  blocked: number;
  growthToday: number;
  growthWeek: number;
  growthMonth: number;
}

export interface TagUsageStats {
  tag: string;
  count: number;
  percentage: number;
}