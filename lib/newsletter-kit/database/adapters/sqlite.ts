/**
 * SQLite Database Adapter
 * 
 * Implementation for SQLite backend
 */

import Database from 'better-sqlite3';
import { BaseDatabaseAdapter } from './base';
import { SQLITE_HELPERS } from '../schema/sqlite';
import type {
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

export class SQLiteAdapter extends BaseDatabaseAdapter {
  private db: Database.Database | null = null;

  async connect(): Promise<void> {
    const dbPath = this.config.database || ':memory:';
    
    try {
      this.db = new Database(dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');
      
      // Test connection
      this.db.prepare('SELECT 1').get();
      this.connected = true;
    } catch (error) {
      throw new Error(`Failed to connect to SQLite: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.connected = false;
  }

  private getDb(): Database.Database {
    if (!this.db) {
      throw new Error('Database not connected');
    }
    return this.db;
  }

  // Basic implementations
  
  async createSubscription(
    data: Omit<NewsletterSubscription, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<NewsletterSubscription> {
    const db = this.getDb();
    
    const query = `
      INSERT INTO newsletter_subscriptions (
        email, status, source, tags, metadata, subscribed_at, 
        confirmed_at, unsubscribed_at, confirmation_token, unsubscribe_token,
        ip_address, user_agent, referrer, utm_source, utm_medium, 
        utm_campaign, utm_content, utm_term
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const stmt = db.prepare(query);
    const result = stmt.run(
      data.email,
      data.status,
      data.source,
      JSON.stringify(data.tags),
      JSON.stringify(data.metadata),
      data.subscribedAt.toISOString(),
      data.confirmedAt?.toISOString(),
      data.unsubscribedAt?.toISOString(),
      data.confirmationToken,
      data.unsubscribeToken,
      data.ipAddress,
      data.userAgent,
      data.referrer,
      data.utmSource,
      data.utmMedium,
      data.utmCampaign,
      data.utmContent,
      data.utmTerm
    );

    const subscription = await this.getSubscription(result.lastInsertRowid.toString());
    if (!subscription) {
      throw new Error('Failed to retrieve created subscription');
    }

    await this.logAudit(subscription.id, data.email, 'subscribe', undefined, data.status);

    return subscription;
  }

  async getSubscription(id: string): Promise<NewsletterSubscription | null> {
    const db = this.getDb();
    
    const query = 'SELECT * FROM newsletter_subscriptions WHERE id = ?';
    const stmt = db.prepare(query);
    const result = stmt.get(id);
    
    if (!result) return null;
    return this.mapSubscriptionFromDb(result);
  }

  async getSubscriptionByEmail(email: string): Promise<NewsletterSubscription | null> {
    const db = this.getDb();
    
    const query = 'SELECT * FROM newsletter_subscriptions WHERE email = ?';
    const stmt = db.prepare(query);
    const result = stmt.get(email);
    
    if (!result) return null;
    return this.mapSubscriptionFromDb(result);
  }

  async getSubscriptionByToken(token: string): Promise<NewsletterSubscription | null> {
    const db = this.getDb();
    
    const query = 'SELECT * FROM newsletter_subscriptions WHERE unsubscribe_token = ?';
    const stmt = db.prepare(query);
    const result = stmt.get(token);
    
    if (!result) return null;
    return this.mapSubscriptionFromDb(result);
  }

  async updateSubscription(
    id: string,
    data: Partial<NewsletterSubscription>
  ): Promise<NewsletterSubscription> {
    const current = await this.getSubscription(id);
    if (!current) {
      throw new Error('Subscription not found');
    }

    const db = this.getDb();
    const updateFields: string[] = [];
    const values: any[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = this.mapFieldToDb(key);
        updateFields.push(`${dbField} = ?`);
        values.push(value);
      }
    });

    if (updateFields.length === 0) {
      return current;
    }

    const query = `
      UPDATE newsletter_subscriptions 
      SET ${updateFields.join(', ')}, updated_at = datetime('now')
      WHERE id = ?
    `;
    values.push(id);

    const stmt = db.prepare(query);
    stmt.run(...values);
    
    const subscription = await this.getSubscription(id);
    if (!subscription) {
      throw new Error('Failed to retrieve updated subscription');
    }

    await this.logAudit(
      id,
      current.email,
      'update',
      current.status,
      data.status || current.status
    );

    return subscription;
  }

  async deleteSubscription(id: string): Promise<void> {
    const subscription = await this.getSubscription(id);
    
    const db = this.getDb();
    const query = 'DELETE FROM newsletter_subscriptions WHERE id = ?';
    const stmt = db.prepare(query);
    stmt.run(id);

    if (subscription) {
      await this.logAudit(id, subscription.email, 'delete', subscription.status);
    }
  }

  // Placeholder implementations for remaining methods
  async getSubscriptions(options: QueryOptions = {}): Promise<PaginatedResult<NewsletterSubscription>> {
    throw new Error('Method not implemented');
  }

  async bulkUpdateSubscriptions(updates: BulkUpdateOperation[]): Promise<number> {
    throw new Error('Method not implemented');
  }

  async exportSubscriptions(options: ExportOptions = {}): Promise<NewsletterSubscription[]> {
    throw new Error('Method not implemented');
  }

  async createUnsubscribeToken(data: Omit<UnsubscribeToken, 'id' | 'createdAt'>): Promise<UnsubscribeToken> {
    throw new Error('Method not implemented');
  }

  async getUnsubscribeToken(token: string): Promise<UnsubscribeToken | null> {
    throw new Error('Method not implemented');
  }

  async useUnsubscribeToken(token: string): Promise<void> {
    throw new Error('Method not implemented');
  }

  async createAnalyticsEntry(data: Omit<NewsletterAnalytics, 'id' | 'createdAt' | 'updatedAt'>): Promise<NewsletterAnalytics> {
    throw new Error('Method not implemented');
  }

  async getAnalytics(options: AnalyticsQuery): Promise<NewsletterAnalytics[]> {
    throw new Error('Method not implemented');
  }

  async getGrowthStats(startDate: Date, endDate: Date): Promise<GrowthStats> {
    const db = this.getDb();
    
    const query = SQLITE_HELPERS.getGrowthStats(
      startDate.toISOString(),
      endDate.toISOString()
    );
    
    const stmt = db.prepare(query);
    const result = stmt.get(
      startDate.toISOString(), endDate.toISOString(),
      startDate.toISOString(), endDate.toISOString(),
      startDate.toISOString(), endDate.toISOString(),
      startDate.toISOString()
    );

    const subscriptions = result?.subscriptions || 0;
    const unsubscriptions = result?.unsubscriptions || 0;
    const netGrowth = subscriptions - unsubscriptions;
    const totalBefore = result?.total_before || 0;
    const growthRate = totalBefore > 0 ? (netGrowth / totalBefore) * 100 : (netGrowth > 0 ? 100 : 0);

    return {
      subscriptions,
      unsubscriptions,
      netGrowth,
      growthRate,
      period: { start: startDate, end: endDate }
    };
  }

  async getSubscriptionStats(): Promise<SubscriptionStats> {
    const db = this.getDb();
    
    const query = SQLITE_HELPERS.getSubscriptionStats();
    const stmt = db.prepare(query);
    const result = stmt.get();

    return {
      total: result?.total_subscriptions || 0,
      active: result?.active_subscriptions || 0,
      pending: result?.pending_subscriptions || 0,
      unsubscribed: result?.unsubscribed_subscriptions || 0,
      bounced: result?.bounced_subscriptions || 0,
      blocked: result?.blocked_subscriptions || 0,
      growthToday: result?.growth_today || 0,
      growthWeek: result?.growth_week || 0,
      growthMonth: result?.growth_month || 0
    };
  }

  async createAuditLog(data: Omit<NewsletterAuditLog, 'id' | 'timestamp'>): Promise<NewsletterAuditLog> {
    throw new Error('Method not implemented');
  }

  async getAuditLogs(options: QueryOptions = {}): Promise<PaginatedResult<NewsletterAuditLog>> {
    throw new Error('Method not implemented');
  }

  async createBounce(data: Omit<EmailBounce, 'id' | 'createdAt'>): Promise<EmailBounce> {
    throw new Error('Method not implemented');
  }

  async getBounces(email?: string): Promise<EmailBounce[]> {
    throw new Error('Method not implemented');
  }

  async resolveBounce(id: string): Promise<void> {
    throw new Error('Method not implemented');
  }

  async createTag(data: Omit<SubscriptionTag, 'id' | 'subscriptionCount' | 'createdAt' | 'updatedAt'>): Promise<SubscriptionTag> {
    throw new Error('Method not implemented');
  }

  async getTags(): Promise<SubscriptionTag[]> {
    throw new Error('Method not implemented');
  }

  async getPopularTags(limit = 10): Promise<TagUsageStats[]> {
    const db = this.getDb();
    
    const query = SQLITE_HELPERS.getPopularTags(limit);
    const stmt = db.prepare(query);
    const results = stmt.all(limit);

    return results.map((result: any) => ({
      tag: result.tag,
      count: result.count,
      percentage: 0 // Would need to calculate percentage in application layer for SQLite
    }));
  }

  async runMigrations(): Promise<void> {
    const { SQLITE_SCHEMA } = await import('../schema/sqlite');
    const db = this.getDb();
    
    // Execute schema creation
    for (const table of SQLITE_SCHEMA.tables) {
      db.exec(table);
    }
    
    for (const index of SQLITE_SCHEMA.indexes) {
      db.exec(index);
    }
    
    for (const trigger of SQLITE_SCHEMA.triggers) {
      db.exec(trigger);
    }
    
    for (const seed of SQLITE_SCHEMA.seeds) {
      db.exec(seed);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const db = this.getDb();
      db.prepare('SELECT 1').get();
      return true;
    } catch {
      return false;
    }
  }

  async cleanup(): Promise<void> {
    const db = this.getDb();
    
    const query = SQLITE_HELPERS.cleanExpiredTokens();
    db.exec(query);
  }

  // Helper methods
  private mapFieldToDb(field: string): string {
    const fieldMap: { [key: string]: string } = {
      confirmedAt: 'confirmed_at',
      unsubscribedAt: 'unsubscribed_at',
      confirmationToken: 'confirmation_token',
      unsubscribeToken: 'unsubscribe_token',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      utmSource: 'utm_source',
      utmMedium: 'utm_medium',
      utmCampaign: 'utm_campaign',
      utmContent: 'utm_content',
      utmTerm: 'utm_term',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    };

    return fieldMap[field] || field;
  }

  private mapSubscriptionFromDb(data: any): NewsletterSubscription {
    return {
      id: data.id,
      email: data.email,
      status: data.status,
      source: data.source || 'web',
      tags: data.tags ? JSON.parse(data.tags) : [],
      metadata: data.metadata ? JSON.parse(data.metadata) : {},
      subscribedAt: new Date(data.subscribed_at),
      confirmedAt: data.confirmed_at ? new Date(data.confirmed_at) : undefined,
      unsubscribedAt: data.unsubscribed_at ? new Date(data.unsubscribed_at) : undefined,
      confirmationToken: data.confirmation_token,
      unsubscribeToken: data.unsubscribe_token,
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      referrer: data.referrer,
      utmSource: data.utm_source,
      utmMedium: data.utm_medium,
      utmCampaign: data.utm_campaign,
      utmContent: data.utm_content,
      utmTerm: data.utm_term,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}