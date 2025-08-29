/**
 * Base Database Adapter
 * 
 * Abstract base class for all database adapters
 */

import type {
  DatabaseAdapter,
  DatabaseConfig,
  NewsletterSubscription,
  UnsubscribeToken,
  NewsletterAnalytics,
  NewsletterAuditLog,
  EmailBounce,
  SubscriptionTag,
  QueryOptions,
  PaginatedResult,
  BulkUpdateOperation,
  ExportOptions,
  AnalyticsQuery,
  GrowthStats,
  SubscriptionStats,
  TagUsageStats
} from '../types';

export abstract class BaseDatabaseAdapter implements DatabaseAdapter {
  protected config: DatabaseConfig;
  protected connected = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  // Connection management
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  
  isConnected(): boolean {
    return this.connected;
  }

  // Subscription management
  abstract createSubscription(
    data: Omit<NewsletterSubscription, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<NewsletterSubscription>;
  
  abstract getSubscription(id: string): Promise<NewsletterSubscription | null>;
  abstract getSubscriptionByEmail(email: string): Promise<NewsletterSubscription | null>;
  abstract getSubscriptionByToken(token: string): Promise<NewsletterSubscription | null>;
  abstract updateSubscription(id: string, data: Partial<NewsletterSubscription>): Promise<NewsletterSubscription>;
  abstract deleteSubscription(id: string): Promise<void>;

  // Bulk operations
  abstract getSubscriptions(options?: QueryOptions): Promise<PaginatedResult<NewsletterSubscription>>;
  abstract bulkUpdateSubscriptions(updates: BulkUpdateOperation[]): Promise<number>;
  abstract exportSubscriptions(options?: ExportOptions): Promise<NewsletterSubscription[]>;

  // Token management
  abstract createUnsubscribeToken(
    data: Omit<UnsubscribeToken, 'id' | 'createdAt'>
  ): Promise<UnsubscribeToken>;
  
  abstract getUnsubscribeToken(token: string): Promise<UnsubscribeToken | null>;
  abstract useUnsubscribeToken(token: string): Promise<void>;

  // Analytics
  abstract createAnalyticsEntry(
    data: Omit<NewsletterAnalytics, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<NewsletterAnalytics>;
  
  abstract getAnalytics(options: AnalyticsQuery): Promise<NewsletterAnalytics[]>;
  abstract getGrowthStats(startDate: Date, endDate: Date): Promise<GrowthStats>;
  abstract getSubscriptionStats(): Promise<SubscriptionStats>;

  // Audit logging
  abstract createAuditLog(
    data: Omit<NewsletterAuditLog, 'id' | 'timestamp'>
  ): Promise<NewsletterAuditLog>;
  
  abstract getAuditLogs(options?: QueryOptions): Promise<PaginatedResult<NewsletterAuditLog>>;

  // Bounce management
  abstract createBounce(data: Omit<EmailBounce, 'id' | 'createdAt'>): Promise<EmailBounce>;
  abstract getBounces(email?: string): Promise<EmailBounce[]>;
  abstract resolveBounce(id: string): Promise<void>;

  // Tag management
  abstract createTag(
    data: Omit<SubscriptionTag, 'id' | 'subscriptionCount' | 'createdAt' | 'updatedAt'>
  ): Promise<SubscriptionTag>;
  
  abstract getTags(): Promise<SubscriptionTag[]>;
  abstract getPopularTags(limit?: number): Promise<TagUsageStats[]>;

  // Utility functions
  abstract runMigrations(): Promise<void>;
  abstract healthCheck(): Promise<boolean>;
  abstract cleanup(): Promise<void>;

  // Helper methods for common operations
  protected buildWhereClause(filters?: Record<string, any>): { clause: string; values: any[] } {
    if (!filters || Object.keys(filters).length === 0) {
      return { clause: '', values: [] };
    }

    const conditions: string[] = [];
    const values: any[] = [];

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        conditions.push(`${key} = ?`);
        values.push(value);
      }
    });

    return {
      clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      values
    };
  }

  protected buildOrderClause(sortBy?: string, sortOrder?: 'asc' | 'desc'): string {
    if (!sortBy) return '';
    const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
    return `ORDER BY ${sortBy} ${order}`;
  }

  protected buildLimitClause(page?: number, limit?: number): { clause: string; offset: number } {
    if (!limit || limit <= 0) return { clause: '', offset: 0 };
    
    const actualPage = Math.max(1, page || 1);
    const offset = (actualPage - 1) * limit;
    
    return {
      clause: `LIMIT ${limit} OFFSET ${offset}`,
      offset
    };
  }

  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected generateToken(): string {
    return Math.random().toString(36).substr(2) + Date.now().toString(36);
  }

  protected sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input.trim();
    }
    return input;
  }

  protected async logAudit(
    subscriptionId: string | undefined,
    email: string,
    action: string,
    previousStatus?: string,
    newStatus?: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      await this.createAuditLog({
        subscriptionId,
        email,
        action: action as any,
        previousStatus: previousStatus as any,
        newStatus: newStatus as any,
        metadata
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw - audit logging should not break main operations
    }
  }
}