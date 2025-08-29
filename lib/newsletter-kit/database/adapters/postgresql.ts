/**
 * PostgreSQL Database Adapter
 * 
 * Implementation for native PostgreSQL backend
 */

import { Pool, PoolClient } from 'pg';
import { BaseDatabaseAdapter } from './base';
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

export class PostgreSQLAdapter extends BaseDatabaseAdapter {
  private pool: Pool | null = null;

  async connect(): Promise<void> {
    const config = {
      connectionString: this.config.connectionString,
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.username,
      password: this.config.password,
      ssl: this.config.ssl,
      max: this.config.poolSize || 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: this.config.timeout || 2000,
    };

    this.pool = new Pool(config);

    // Test connection
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      this.connected = true;
    } catch (error) {
      throw new Error(`Failed to connect to PostgreSQL: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
    this.connected = false;
  }

  private async query(text: string, params: any[] = []): Promise<any> {
    if (!this.pool) {
      throw new Error('Database not connected');
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Implementation would follow similar patterns to Supabase adapter
  // but using direct SQL queries instead of Supabase client methods
  
  async createSubscription(
    data: Omit<NewsletterSubscription, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<NewsletterSubscription> {
    const query = `
      INSERT INTO newsletter_subscriptions (
        email, status, source, tags, metadata, subscribed_at, 
        confirmed_at, unsubscribed_at, confirmation_token, unsubscribe_token,
        ip_address, user_agent, referrer, utm_source, utm_medium, 
        utm_campaign, utm_content, utm_term
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;

    const values = [
      data.email,
      data.status,
      data.source,
      data.tags,
      JSON.stringify(data.metadata),
      data.subscribedAt,
      data.confirmedAt,
      data.unsubscribedAt,
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
    ];

    const result = await this.query(query, values);
    const subscription = this.mapSubscriptionFromDb(result.rows[0]);

    await this.logAudit(subscription.id, data.email, 'subscribe', undefined, data.status);

    return subscription;
  }

  async getSubscription(id: string): Promise<NewsletterSubscription | null> {
    const query = 'SELECT * FROM newsletter_subscriptions WHERE id = $1';
    const result = await this.query(query, [id]);
    
    if (result.rows.length === 0) return null;
    return this.mapSubscriptionFromDb(result.rows[0]);
  }

  async getSubscriptionByEmail(email: string): Promise<NewsletterSubscription | null> {
    const query = 'SELECT * FROM newsletter_subscriptions WHERE email = $1';
    const result = await this.query(query, [email]);
    
    if (result.rows.length === 0) return null;
    return this.mapSubscriptionFromDb(result.rows[0]);
  }

  async getSubscriptionByToken(token: string): Promise<NewsletterSubscription | null> {
    const query = 'SELECT * FROM newsletter_subscriptions WHERE unsubscribe_token = $1';
    const result = await this.query(query, [token]);
    
    if (result.rows.length === 0) return null;
    return this.mapSubscriptionFromDb(result.rows[0]);
  }

  async updateSubscription(
    id: string,
    data: Partial<NewsletterSubscription>
  ): Promise<NewsletterSubscription> {
    // Get current subscription for audit logging
    const current = await this.getSubscription(id);
    if (!current) {
      throw new Error('Subscription not found');
    }

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = this.mapFieldToDb(key);
        updateFields.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return current;
    }

    const query = `
      UPDATE newsletter_subscriptions 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    values.push(id);

    const result = await this.query(query, values);
    const subscription = this.mapSubscriptionFromDb(result.rows[0]);

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
    
    const query = 'DELETE FROM newsletter_subscriptions WHERE id = $1';
    await this.query(query, [id]);

    if (subscription) {
      await this.logAudit(id, subscription.email, 'delete', subscription.status);
    }
  }

  // Placeholder implementations for remaining methods
  // In a real implementation, these would follow similar SQL query patterns

  async getSubscriptions(options: QueryOptions = {}): Promise<PaginatedResult<NewsletterSubscription>> {
    // Implementation using SQL queries with LIMIT, OFFSET, WHERE clauses
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
    const query = 'SELECT * FROM newsletter_get_growth_stats($1, $2)';
    const result = await this.query(query, [startDate, endDate]);
    
    const row = result.rows[0];
    return {
      subscriptions: row.subscriptions || 0,
      unsubscriptions: row.unsubscriptions || 0,
      netGrowth: row.net_growth || 0,
      growthRate: parseFloat(row.growth_rate) || 0,
      period: { start: startDate, end: endDate }
    };
  }

  async getSubscriptionStats(): Promise<SubscriptionStats> {
    const query = 'SELECT * FROM newsletter_get_subscription_stats()';
    const result = await this.query(query, []);
    
    const row = result.rows[0];
    return {
      total: parseInt(row.total_subscriptions) || 0,
      active: parseInt(row.active_subscriptions) || 0,
      pending: parseInt(row.pending_subscriptions) || 0,
      unsubscribed: parseInt(row.unsubscribed_subscriptions) || 0,
      bounced: parseInt(row.bounced_subscriptions) || 0,
      blocked: parseInt(row.blocked_subscriptions) || 0,
      growthToday: row.growth_today || 0,
      growthWeek: row.growth_week || 0,
      growthMonth: row.growth_month || 0
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
    const query = 'SELECT * FROM newsletter_get_popular_tags($1)';
    const result = await this.query(query, [limit]);
    
    return result.rows.map((row: any) => ({
      tag: row.tag,
      count: parseInt(row.count),
      percentage: parseFloat(row.percentage)
    }));
  }

  async runMigrations(): Promise<void> {
    // Run PostgreSQL migrations
    const { POSTGRESQL_SCHEMA } = await import('../schema/postgresql');
    
    // Execute schema creation
    for (const table of POSTGRESQL_SCHEMA.tables) {
      await this.query(table);
    }
    
    for (const index of POSTGRESQL_SCHEMA.indexes) {
      await this.query(index);
    }
    
    for (const func of POSTGRESQL_SCHEMA.functions) {
      await this.query(func);
    }
    
    for (const trigger of POSTGRESQL_SCHEMA.triggers) {
      await this.query(trigger);
    }
    
    for (const seed of POSTGRESQL_SCHEMA.seeds) {
      await this.query(seed);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async cleanup(): Promise<void> {
    await this.query('SELECT newsletter_clean_expired_tokens()');
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
      tags: data.tags || [],
      metadata: typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata || {},
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