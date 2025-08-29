/**
 * Supabase Database Adapter
 * 
 * Implementation for Supabase/PostgreSQL backend
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
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

export class SupabaseAdapter extends BaseDatabaseAdapter {
  private client: SupabaseClient | null = null;

  async connect(): Promise<void> {
    if (!this.config.supabaseUrl || !this.config.supabaseKey) {
      throw new Error('Supabase URL and service key are required');
    }

    this.client = createClient(this.config.supabaseUrl, this.config.supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Test connection
    const { error } = await this.client.from('newsletter_subscriptions').select('count').limit(1);
    if (error) {
      throw new Error(`Failed to connect to Supabase: ${error.message}`);
    }

    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.client = null;
    this.connected = false;
  }

  private getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.client;
  }

  // Subscription management
  async createSubscription(
    data: Omit<NewsletterSubscription, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<NewsletterSubscription> {
    const client = this.getClient();
    
    const { data: subscription, error } = await client
      .from('newsletter_subscriptions')
      .insert({
        email: data.email,
        status: data.status,
        source: data.source,
        tags: data.tags,
        metadata: data.metadata,
        subscribed_at: data.subscribedAt.toISOString(),
        confirmed_at: data.confirmedAt?.toISOString(),
        unsubscribed_at: data.unsubscribedAt?.toISOString(),
        confirmation_token: data.confirmationToken,
        unsubscribe_token: data.unsubscribeToken,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        referrer: data.referrer,
        utm_source: data.utmSource,
        utm_medium: data.utmMedium,
        utm_campaign: data.utmCampaign,
        utm_content: data.utmContent,
        utm_term: data.utmTerm
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }

    await this.logAudit(subscription.id, data.email, 'subscribe', undefined, data.status);

    return this.mapSubscriptionFromDb(subscription);
  }

  async getSubscription(id: string): Promise<NewsletterSubscription | null> {
    const client = this.getClient();
    
    const { data, error } = await client
      .from('newsletter_subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get subscription: ${error.message}`);
    }

    return this.mapSubscriptionFromDb(data);
  }

  async getSubscriptionByEmail(email: string): Promise<NewsletterSubscription | null> {
    const client = this.getClient();
    
    const { data, error } = await client
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get subscription by email: ${error.message}`);
    }

    return this.mapSubscriptionFromDb(data);
  }

  async getSubscriptionByToken(token: string): Promise<NewsletterSubscription | null> {
    const client = this.getClient();
    
    const { data, error } = await client
      .from('newsletter_subscriptions')
      .select('*')
      .eq('unsubscribe_token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get subscription by token: ${error.message}`);
    }

    return this.mapSubscriptionFromDb(data);
  }

  async updateSubscription(
    id: string, 
    data: Partial<NewsletterSubscription>
  ): Promise<NewsletterSubscription> {
    const client = this.getClient();
    
    // Get current subscription for audit logging
    const current = await this.getSubscription(id);
    if (!current) {
      throw new Error('Subscription not found');
    }

    const updateData: any = {};
    
    if (data.email !== undefined) updateData.email = data.email;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;
    if (data.confirmedAt !== undefined) updateData.confirmed_at = data.confirmedAt?.toISOString();
    if (data.unsubscribedAt !== undefined) updateData.unsubscribed_at = data.unsubscribedAt?.toISOString();
    if (data.confirmationToken !== undefined) updateData.confirmation_token = data.confirmationToken;
    if (data.ipAddress !== undefined) updateData.ip_address = data.ipAddress;
    if (data.userAgent !== undefined) updateData.user_agent = data.userAgent;
    if (data.referrer !== undefined) updateData.referrer = data.referrer;
    if (data.utmSource !== undefined) updateData.utm_source = data.utmSource;
    if (data.utmMedium !== undefined) updateData.utm_medium = data.utmMedium;
    if (data.utmCampaign !== undefined) updateData.utm_campaign = data.utmCampaign;
    if (data.utmContent !== undefined) updateData.utm_content = data.utmContent;
    if (data.utmTerm !== undefined) updateData.utm_term = data.utmTerm;

    const { data: subscription, error } = await client
      .from('newsletter_subscriptions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }

    await this.logAudit(
      id, 
      current.email, 
      'update', 
      current.status, 
      data.status || current.status
    );

    return this.mapSubscriptionFromDb(subscription);
  }

  async deleteSubscription(id: string): Promise<void> {
    const client = this.getClient();
    
    // Get subscription for audit logging
    const subscription = await this.getSubscription(id);
    
    const { error } = await client
      .from('newsletter_subscriptions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete subscription: ${error.message}`);
    }

    if (subscription) {
      await this.logAudit(id, subscription.email, 'delete', subscription.status);
    }
  }

  // Bulk operations
  async getSubscriptions(options: QueryOptions = {}): Promise<PaginatedResult<NewsletterSubscription>> {
    const client = this.getClient();
    const { page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc', filters, search } = options;

    let query = client.from('newsletter_subscriptions').select('*', { count: 'exact' });

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    // Apply search
    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to get subscriptions: ${error.message}`);
    }

    const subscriptions = (data || []).map(this.mapSubscriptionFromDb);
    const total = count || 0;

    return {
      data: subscriptions,
      total,
      page,
      limit,
      hasNext: end < total - 1,
      hasPrev: page > 1
    };
  }

  async bulkUpdateSubscriptions(updates: BulkUpdateOperation[]): Promise<number> {
    const client = this.getClient();
    let updated = 0;

    // Process updates in batches to avoid hitting request limits
    const batchSize = 100;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async ({ id, data }) => {
          try {
            await this.updateSubscription(id, data);
            updated++;
          } catch (error) {
            console.error(`Failed to update subscription ${id}:`, error);
          }
        })
      );
    }

    return updated;
  }

  async exportSubscriptions(options: ExportOptions = {}): Promise<NewsletterSubscription[]> {
    const client = this.getClient();
    const { filters, fields } = options;

    let query = client.from('newsletter_subscriptions').select('*');

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to export subscriptions: ${error.message}`);
    }

    let subscriptions = (data || []).map(this.mapSubscriptionFromDb);

    // Filter fields if specified
    if (fields && fields.length > 0) {
      subscriptions = subscriptions.map(sub => {
        const filtered: any = {};
        fields.forEach(field => {
          if (field in sub) {
            filtered[field] = (sub as any)[field];
          }
        });
        return filtered;
      });
    }

    return subscriptions;
  }

  // Token management
  async createUnsubscribeToken(
    data: Omit<UnsubscribeToken, 'id' | 'createdAt'>
  ): Promise<UnsubscribeToken> {
    const client = this.getClient();
    
    const { data: token, error } = await client
      .from('newsletter_unsubscribe_tokens')
      .insert({
        subscription_id: data.subscriptionId,
        token: data.token,
        email: data.email,
        expires_at: data.expiresAt.toISOString(),
        used_at: data.usedAt?.toISOString(),
        metadata: data.metadata
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create unsubscribe token: ${error.message}`);
    }

    return this.mapTokenFromDb(token);
  }

  async getUnsubscribeToken(token: string): Promise<UnsubscribeToken | null> {
    const client = this.getClient();
    
    const { data, error } = await client
      .from('newsletter_unsubscribe_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get unsubscribe token: ${error.message}`);
    }

    return this.mapTokenFromDb(data);
  }

  async useUnsubscribeToken(token: string): Promise<void> {
    const client = this.getClient();
    
    const { error } = await client
      .from('newsletter_unsubscribe_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    if (error) {
      throw new Error(`Failed to mark token as used: ${error.message}`);
    }
  }

  // Analytics
  async createAnalyticsEntry(
    data: Omit<NewsletterAnalytics, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<NewsletterAnalytics> {
    const client = this.getClient();
    
    const { data: analytics, error } = await client
      .from('newsletter_analytics')
      .insert({
        date: data.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        source: data.source,
        tag: data.tag,
        subscriptions_count: data.subscriptionsCount,
        unsubscriptions_count: data.unsubscriptionsCount,
        confirmations_count: data.confirmationsCount,
        bounces_count: data.bouncesCount
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create analytics entry: ${error.message}`);
    }

    return this.mapAnalyticsFromDb(analytics);
  }

  async getAnalytics(options: AnalyticsQuery): Promise<NewsletterAnalytics[]> {
    const client = this.getClient();
    const { startDate, endDate, source, tag } = options;

    let query = client
      .from('newsletter_analytics')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);

    if (source) query = query.eq('source', source);
    if (tag) query = query.eq('tag', tag);

    query = query.order('date', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get analytics: ${error.message}`);
    }

    return (data || []).map(this.mapAnalyticsFromDb);
  }

  async getGrowthStats(startDate: Date, endDate: Date): Promise<GrowthStats> {
    const client = this.getClient();
    
    const { data, error } = await client.rpc('newsletter_get_growth_stats', {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    });

    if (error) {
      throw new Error(`Failed to get growth stats: ${error.message}`);
    }

    const result = data[0];
    return {
      subscriptions: result.subscriptions || 0,
      unsubscriptions: result.unsubscriptions || 0,
      netGrowth: result.net_growth || 0,
      growthRate: parseFloat(result.growth_rate) || 0,
      period: {
        start: startDate,
        end: endDate
      }
    };
  }

  async getSubscriptionStats(): Promise<SubscriptionStats> {
    const client = this.getClient();
    
    const { data, error } = await client.rpc('newsletter_get_subscription_stats');

    if (error) {
      throw new Error(`Failed to get subscription stats: ${error.message}`);
    }

    const result = data[0];
    return {
      total: parseInt(result.total_subscriptions) || 0,
      active: parseInt(result.active_subscriptions) || 0,
      pending: parseInt(result.pending_subscriptions) || 0,
      unsubscribed: parseInt(result.unsubscribed_subscriptions) || 0,
      bounced: parseInt(result.bounced_subscriptions) || 0,
      blocked: parseInt(result.blocked_subscriptions) || 0,
      growthToday: result.growth_today || 0,
      growthWeek: result.growth_week || 0,
      growthMonth: result.growth_month || 0
    };
  }

  // Audit logging
  async createAuditLog(
    data: Omit<NewsletterAuditLog, 'id' | 'timestamp'>
  ): Promise<NewsletterAuditLog> {
    const client = this.getClient();
    
    const { data: log, error } = await client
      .from('newsletter_audit_logs')
      .insert({
        subscription_id: data.subscriptionId,
        email: data.email,
        action: data.action,
        previous_status: data.previousStatus,
        new_status: data.newStatus,
        metadata: data.metadata,
        ip_address: data.ipAddress,
        user_agent: data.userAgent
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create audit log: ${error.message}`);
    }

    return this.mapAuditLogFromDb(log);
  }

  async getAuditLogs(options: QueryOptions = {}): Promise<PaginatedResult<NewsletterAuditLog>> {
    const client = this.getClient();
    const { page = 1, limit = 20, sortBy = 'timestamp', sortOrder = 'desc', filters, search } = options;

    let query = client.from('newsletter_audit_logs').select('*', { count: 'exact' });

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    // Apply search
    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to get audit logs: ${error.message}`);
    }

    const logs = (data || []).map(this.mapAuditLogFromDb);
    const total = count || 0;

    return {
      data: logs,
      total,
      page,
      limit,
      hasNext: end < total - 1,
      hasPrev: page > 1
    };
  }

  // Bounce management
  async createBounce(data: Omit<EmailBounce, 'id' | 'createdAt'>): Promise<EmailBounce> {
    const client = this.getClient();
    
    const { data: bounce, error } = await client
      .from('newsletter_email_bounces')
      .insert({
        email: data.email,
        bounce_type: data.bounceType,
        bounce_reason: data.bounceReason,
        bounced_at: data.bouncedAt.toISOString(),
        provider_response: data.providerResponse,
        resolved: data.resolved,
        resolved_at: data.resolvedAt?.toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create bounce: ${error.message}`);
    }

    return this.mapBounceFromDb(bounce);
  }

  async getBounces(email?: string): Promise<EmailBounce[]> {
    const client = this.getClient();
    
    let query = client.from('newsletter_email_bounces').select('*');
    
    if (email) {
      query = query.eq('email', email);
    }
    
    query = query.order('bounced_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get bounces: ${error.message}`);
    }

    return (data || []).map(this.mapBounceFromDb);
  }

  async resolveBounce(id: string): Promise<void> {
    const client = this.getClient();
    
    const { error } = await client
      .from('newsletter_email_bounces')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to resolve bounce: ${error.message}`);
    }
  }

  // Tag management
  async createTag(
    data: Omit<SubscriptionTag, 'id' | 'subscriptionCount' | 'createdAt' | 'updatedAt'>
  ): Promise<SubscriptionTag> {
    const client = this.getClient();
    
    const { data: tag, error } = await client
      .from('newsletter_subscription_tags')
      .insert({
        name: data.name,
        description: data.description,
        color: data.color,
        is_system: data.isSystem
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create tag: ${error.message}`);
    }

    return this.mapTagFromDb(tag);
  }

  async getTags(): Promise<SubscriptionTag[]> {
    const client = this.getClient();
    
    const { data, error } = await client
      .from('newsletter_subscription_tags')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(`Failed to get tags: ${error.message}`);
    }

    return (data || []).map(this.mapTagFromDb);
  }

  async getPopularTags(limit = 10): Promise<TagUsageStats[]> {
    const client = this.getClient();
    
    const { data, error } = await client.rpc('newsletter_get_popular_tags', { limit_count: limit });

    if (error) {
      throw new Error(`Failed to get popular tags: ${error.message}`);
    }

    return (data || []).map((item: any) => ({
      tag: item.tag,
      count: parseInt(item.count),
      percentage: parseFloat(item.percentage)
    }));
  }

  // Utility functions
  async runMigrations(): Promise<void> {
    // Migrations would be handled by Supabase migrations system
    // This could trigger custom migration functions if needed
  }

  async healthCheck(): Promise<boolean> {
    try {
      const client = this.getClient();
      const { error } = await client.from('newsletter_subscriptions').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  async cleanup(): Promise<void> {
    const client = this.getClient();
    
    // Clean expired tokens
    await client.rpc('newsletter_clean_expired_tokens');
  }

  // Mapping functions to convert database records to domain objects
  private mapSubscriptionFromDb(data: any): NewsletterSubscription {
    return {
      id: data.id,
      email: data.email,
      status: data.status,
      source: data.source || 'web',
      tags: data.tags || [],
      metadata: data.metadata || {},
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

  private mapTokenFromDb(data: any): UnsubscribeToken {
    return {
      id: data.id,
      subscriptionId: data.subscription_id,
      token: data.token,
      email: data.email,
      expiresAt: new Date(data.expires_at),
      usedAt: data.used_at ? new Date(data.used_at) : undefined,
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at)
    };
  }

  private mapAnalyticsFromDb(data: any): NewsletterAnalytics {
    return {
      id: data.id,
      date: new Date(data.date),
      source: data.source,
      tag: data.tag,
      subscriptionsCount: data.subscriptions_count || 0,
      unsubscriptionsCount: data.unsubscriptions_count || 0,
      confirmationsCount: data.confirmations_count || 0,
      bouncesCount: data.bounces_count || 0,
      netGrowth: data.net_growth || 0,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private mapAuditLogFromDb(data: any): NewsletterAuditLog {
    return {
      id: data.id,
      subscriptionId: data.subscription_id,
      email: data.email,
      action: data.action,
      previousStatus: data.previous_status,
      newStatus: data.new_status,
      metadata: data.metadata || {},
      ipAddress: data.ip_address,
      userAgent: data.user_agent,
      timestamp: new Date(data.timestamp)
    };
  }

  private mapBounceFromDb(data: any): EmailBounce {
    return {
      id: data.id,
      email: data.email,
      bounceType: data.bounce_type,
      bounceReason: data.bounce_reason,
      bouncedAt: new Date(data.bounced_at),
      providerResponse: data.provider_response,
      resolved: data.resolved || false,
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
      createdAt: new Date(data.created_at)
    };
  }

  private mapTagFromDb(data: any): SubscriptionTag {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      color: data.color,
      isSystem: data.is_system || false,
      subscriptionCount: data.subscription_count || 0,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}