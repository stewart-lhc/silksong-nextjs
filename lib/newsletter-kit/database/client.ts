/**
 * Database Client
 * 
 * Main client for Newsletter Kit database operations
 */

import type { DatabaseAdapter, DatabaseConfig, DatabaseType } from './types';
import { createDatabaseAdapter } from './adapters';
import { runMigrations } from './migrations';

export class NewsletterDatabaseClient {
  private adapter: DatabaseAdapter;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.adapter = createDatabaseAdapter(config);
  }

  /**
   * Connect to the database and optionally run migrations
   */
  async connect(autoMigrate = false): Promise<void> {
    await this.adapter.connect();

    if (autoMigrate) {
      await this.runMigrations();
    }
  }

  /**
   * Disconnect from the database
   */
  async disconnect(): Promise<void> {
    await this.adapter.disconnect();
  }

  /**
   * Check if database is connected
   */
  isConnected(): boolean {
    return this.adapter.isConnected();
  }

  /**
   * Get the underlying database adapter
   */
  getAdapter(): DatabaseAdapter {
    return this.adapter;
  }

  /**
   * Run database migrations
   */
  async runMigrations(): Promise<void> {
    await runMigrations(this.adapter, this.config.type);
  }

  /**
   * Perform health check
   */
  async healthCheck(): Promise<boolean> {
    return this.adapter.healthCheck();
  }

  /**
   * Clean up expired tokens and perform maintenance
   */
  async cleanup(): Promise<void> {
    await this.adapter.cleanup();
  }

  // Subscription management methods (delegate to adapter)

  /**
   * Create a new subscription
   */
  async createSubscription(data: Parameters<DatabaseAdapter['createSubscription']>[0]) {
    return this.adapter.createSubscription(data);
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(id: string) {
    return this.adapter.getSubscription(id);
  }

  /**
   * Get subscription by email
   */
  async getSubscriptionByEmail(email: string) {
    return this.adapter.getSubscriptionByEmail(email);
  }

  /**
   * Get subscription by unsubscribe token
   */
  async getSubscriptionByToken(token: string) {
    return this.adapter.getSubscriptionByToken(token);
  }

  /**
   * Update subscription
   */
  async updateSubscription(id: string, data: Parameters<DatabaseAdapter['updateSubscription']>[1]) {
    return this.adapter.updateSubscription(id, data);
  }

  /**
   * Delete subscription
   */
  async deleteSubscription(id: string) {
    return this.adapter.deleteSubscription(id);
  }

  /**
   * Get paginated subscriptions
   */
  async getSubscriptions(options?: Parameters<DatabaseAdapter['getSubscriptions']>[0]) {
    return this.adapter.getSubscriptions(options);
  }

  /**
   * Bulk update subscriptions
   */
  async bulkUpdateSubscriptions(updates: Parameters<DatabaseAdapter['bulkUpdateSubscriptions']>[0]) {
    return this.adapter.bulkUpdateSubscriptions(updates);
  }

  /**
   * Export subscriptions
   */
  async exportSubscriptions(options?: Parameters<DatabaseAdapter['exportSubscriptions']>[0]) {
    return this.adapter.exportSubscriptions(options);
  }

  // Token management methods

  /**
   * Create unsubscribe token
   */
  async createUnsubscribeToken(data: Parameters<DatabaseAdapter['createUnsubscribeToken']>[0]) {
    return this.adapter.createUnsubscribeToken(data);
  }

  /**
   * Get unsubscribe token
   */
  async getUnsubscribeToken(token: string) {
    return this.adapter.getUnsubscribeToken(token);
  }

  /**
   * Mark unsubscribe token as used
   */
  async useUnsubscribeToken(token: string) {
    return this.adapter.useUnsubscribeToken(token);
  }

  // Analytics methods

  /**
   * Create analytics entry
   */
  async createAnalyticsEntry(data: Parameters<DatabaseAdapter['createAnalyticsEntry']>[0]) {
    return this.adapter.createAnalyticsEntry(data);
  }

  /**
   * Get analytics data
   */
  async getAnalytics(options: Parameters<DatabaseAdapter['getAnalytics']>[0]) {
    return this.adapter.getAnalytics(options);
  }

  /**
   * Get growth statistics
   */
  async getGrowthStats(startDate: Date, endDate: Date) {
    return this.adapter.getGrowthStats(startDate, endDate);
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats() {
    return this.adapter.getSubscriptionStats();
  }

  // Audit logging methods

  /**
   * Create audit log entry
   */
  async createAuditLog(data: Parameters<DatabaseAdapter['createAuditLog']>[0]) {
    return this.adapter.createAuditLog(data);
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(options?: Parameters<DatabaseAdapter['getAuditLogs']>[0]) {
    return this.adapter.getAuditLogs(options);
  }

  // Bounce management methods

  /**
   * Create bounce record
   */
  async createBounce(data: Parameters<DatabaseAdapter['createBounce']>[0]) {
    return this.adapter.createBounce(data);
  }

  /**
   * Get bounce records
   */
  async getBounces(email?: string) {
    return this.adapter.getBounces(email);
  }

  /**
   * Resolve bounce
   */
  async resolveBounce(id: string) {
    return this.adapter.resolveBounce(id);
  }

  // Tag management methods

  /**
   * Create tag
   */
  async createTag(data: Parameters<DatabaseAdapter['createTag']>[0]) {
    return this.adapter.createTag(data);
  }

  /**
   * Get all tags
   */
  async getTags() {
    return this.adapter.getTags();
  }

  /**
   * Get popular tags
   */
  async getPopularTags(limit?: number) {
    return this.adapter.getPopularTags(limit);
  }
}

/**
 * Factory function to create a database client
 */
export function createDatabaseClient(config: DatabaseConfig): NewsletterDatabaseClient {
  return new NewsletterDatabaseClient(config);
}

/**
 * Create a Supabase database client
 */
export function createSupabaseClient(supabaseUrl: string, supabaseKey: string): NewsletterDatabaseClient {
  return createDatabaseClient({
    type: 'supabase',
    supabaseUrl,
    supabaseKey
  });
}

/**
 * Create a PostgreSQL database client
 */
export function createPostgreSQLClient(connectionString: string): NewsletterDatabaseClient {
  return createDatabaseClient({
    type: 'postgresql',
    connectionString
  });
}

/**
 * Create a MySQL database client
 */
export function createMySQLClient(connectionString: string): NewsletterDatabaseClient {
  return createDatabaseClient({
    type: 'mysql',
    connectionString
  });
}

/**
 * Create a SQLite database client
 */
export function createSQLiteClient(database: string): NewsletterDatabaseClient {
  return createDatabaseClient({
    type: 'sqlite',
    database
  });
}