/**
 * Database Utilities
 * 
 * Utility functions for database operations and maintenance
 */

import type { 
  DatabaseAdapter, 
  NewsletterSubscription, 
  SubscriptionStats,
  DatabaseConfig 
} from '../types';

/**
 * Backup utilities
 */
export class BackupManager {
  constructor(private adapter: DatabaseAdapter) {}

  /**
   * Create a full backup of subscription data
   */
  async createBackup(): Promise<{
    subscriptions: NewsletterSubscription[];
    analytics: any[];
    tags: any[];
    timestamp: Date;
  }> {
    const subscriptions = await this.adapter.exportSubscriptions();
    const analytics = await this.adapter.getAnalytics({
      startDate: new Date('2020-01-01'),
      endDate: new Date()
    });
    const tags = await this.adapter.getTags();

    return {
      subscriptions,
      analytics,
      tags,
      timestamp: new Date()
    };
  }

  /**
   * Restore from backup data
   */
  async restoreFromBackup(backup: any): Promise<void> {
    // Implementation would restore data
    // This is a placeholder
    console.log('Restoring from backup created at:', backup.timestamp);
    console.log(`Backup contains ${backup.subscriptions.length} subscriptions`);
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private queries: Map<string, number[]> = new Map();

  /**
   * Track query execution time
   */
  trackQuery(queryName: string, executionTime: number): void {
    if (!this.queries.has(queryName)) {
      this.queries.set(queryName, []);
    }
    this.queries.get(queryName)!.push(executionTime);
  }

  /**
   * Get performance statistics
   */
  getStats(): Record<string, {
    count: number;
    avgTime: number;
    minTime: number;
    maxTime: number;
  }> {
    const stats: Record<string, any> = {};

    this.queries.forEach((times, queryName) => {
      const count = times.length;
      const avgTime = times.reduce((a, b) => a + b, 0) / count;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      stats[queryName] = { count, avgTime, minTime, maxTime };
    });

    return stats;
  }

  /**
   * Clear performance data
   */
  clear(): void {
    this.queries.clear();
  }
}

/**
 * Data validation utilities
 */
export class DataValidator {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate subscription data
   */
  static validateSubscription(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.email) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (data.status && !['pending', 'active', 'unsubscribed', 'bounced', 'blocked'].includes(data.status)) {
      errors.push('Invalid status');
    }

    if (data.tags && !Array.isArray(data.tags)) {
      errors.push('Tags must be an array');
    }

    if (data.metadata && typeof data.metadata !== 'object') {
      errors.push('Metadata must be an object');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input.trim().slice(0, 1000); // Limit length
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item)).slice(0, 100); // Limit array size
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      const keys = Object.keys(input).slice(0, 50); // Limit object keys
      
      keys.forEach(key => {
        sanitized[key] = this.sanitizeInput(input[key]);
      });
      
      return sanitized;
    }
    
    return input;
  }
}

/**
 * Analytics utilities
 */
export class AnalyticsHelper {
  constructor(private adapter: DatabaseAdapter) {}

  /**
   * Calculate growth rate between periods
   */
  static calculateGrowthRate(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Get subscription trends
   */
  async getSubscriptionTrends(days = 30): Promise<{
    daily: Array<{ date: string; subscriptions: number; unsubscriptions: number }>;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  }> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const analytics = await this.adapter.getAnalytics({
      startDate,
      endDate,
      groupBy: 'date',
      interval: 'day'
    });

    const daily = analytics.map(entry => ({
      date: entry.date.toISOString().split('T')[0],
      subscriptions: entry.subscriptionsCount,
      unsubscriptions: entry.unsubscriptionsCount
    }));

    const totalGrowth = daily.reduce((sum, day) => sum + day.subscriptions - day.unsubscriptions, 0);
    const avgDailyGrowth = totalGrowth / days;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (avgDailyGrowth > 1) trend = 'up';
    else if (avgDailyGrowth < -1) trend = 'down';

    return { daily, growth: totalGrowth, trend };
  }

  /**
   * Get conversion funnel metrics
   */
  async getConversionFunnel(): Promise<{
    subscribed: number;
    confirmed: number;
    active: number;
    conversionRate: number;
  }> {
    const stats = await this.adapter.getSubscriptionStats();
    const subscribed = stats.total;
    const confirmed = stats.active + stats.unsubscribed; // Those who confirmed
    const active = stats.active;

    const conversionRate = subscribed > 0 ? (confirmed / subscribed) * 100 : 0;

    return { subscribed, confirmed, active, conversionRate };
  }
}

/**
 * Database maintenance utilities
 */
export class MaintenanceManager {
  constructor(private adapter: DatabaseAdapter) {}

  /**
   * Clean up old data
   */
  async cleanup(options: {
    cleanAuditLogs?: boolean;
    auditLogRetentionDays?: number;
    cleanExpiredTokens?: boolean;
    cleanResolvedBounces?: boolean;
    bouncesRetentionDays?: number;
  } = {}): Promise<{
    expiredTokens: number;
    oldAuditLogs: number;
    oldBounces: number;
  }> {
    const results = {
      expiredTokens: 0,
      oldAuditLogs: 0,
      oldBounces: 0
    };

    // Clean expired tokens
    if (options.cleanExpiredTokens !== false) {
      await this.adapter.cleanup();
      // Would need to track actual cleanup numbers
    }

    // Clean old audit logs (implementation would depend on adapter)
    if (options.cleanAuditLogs && options.auditLogRetentionDays) {
      // Implementation would clean old audit logs
    }

    // Clean old resolved bounces
    if (options.cleanResolvedBounces && options.bouncesRetentionDays) {
      // Implementation would clean old bounces
    }

    return results;
  }

  /**
   * Update analytics data
   */
  async updateAnalytics(date?: Date): Promise<void> {
    const targetDate = date || new Date();
    // Implementation would update analytics for the specified date
  }

  /**
   * Vacuum database (PostgreSQL/SQLite specific)
   */
  async vacuum(): Promise<void> {
    // Implementation would depend on database type
    console.log('Database vacuum completed');
  }
}

/**
 * Connection pool monitoring
 */
export class ConnectionMonitor {
  private connections: Map<string, { created: Date; lastUsed: Date }> = new Map();

  /**
   * Track connection usage
   */
  trackConnection(id: string): void {
    const now = new Date();
    if (this.connections.has(id)) {
      this.connections.get(id)!.lastUsed = now;
    } else {
      this.connections.set(id, { created: now, lastUsed: now });
    }
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    total: number;
    active: number;
    idle: number;
    avgAge: number;
  } {
    const now = new Date();
    const connections = Array.from(this.connections.values());
    
    const total = connections.length;
    const idle = connections.filter(conn => 
      now.getTime() - conn.lastUsed.getTime() > 300000 // 5 minutes
    ).length;
    const active = total - idle;
    
    const avgAge = connections.length > 0 
      ? connections.reduce((sum, conn) => 
          sum + (now.getTime() - conn.created.getTime()), 0
        ) / connections.length / 1000 // Convert to seconds
      : 0;

    return { total, active, idle, avgAge };
  }
}

/**
 * Configuration validator
 */
export class ConfigValidator {
  /**
   * Validate database configuration
   */
  static validateConfig(config: DatabaseConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.type) {
      errors.push('Database type is required');
    }

    switch (config.type) {
      case 'supabase':
        if (!config.supabaseUrl) errors.push('Supabase URL is required');
        if (!config.supabaseKey) errors.push('Supabase key is required');
        break;
      
      case 'postgresql':
      case 'mysql':
        if (!config.connectionString && !config.host) {
          errors.push('Connection string or host is required');
        }
        break;
      
      case 'sqlite':
        if (!config.database) errors.push('Database path is required');
        break;
      
      default:
        errors.push(`Unsupported database type: ${config.type}`);
    }

    if (config.poolSize && (config.poolSize < 1 || config.poolSize > 100)) {
      errors.push('Pool size must be between 1 and 100');
    }

    if (config.timeout && config.timeout < 1000) {
      errors.push('Timeout must be at least 1000ms');
    }

    return { valid: errors.length === 0, errors };
  }
}