/**
 * SQLite Schema
 * 
 * Newsletter database schema optimized for SQLite
 */

import type { SchemaDefinition } from './index';

export const SQLITE_SCHEMA: SchemaDefinition = {
  tables: [
    // Core subscriptions table
    `CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      email TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'unsubscribed', 'bounced', 'blocked')),
      source TEXT DEFAULT 'web',
      tags TEXT, -- JSON string for tags array
      metadata TEXT, -- JSON string for metadata
      subscribed_at DATETIME DEFAULT (datetime('now')),
      confirmed_at DATETIME,
      unsubscribed_at DATETIME,
      confirmation_token TEXT,
      unsubscribe_token TEXT DEFAULT (lower(hex(randomblob(16)))),
      ip_address TEXT,
      user_agent TEXT,
      referrer TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_content TEXT,
      utm_term TEXT,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    )`,

    // Unsubscribe tokens
    `CREATE TABLE IF NOT EXISTS newsletter_unsubscribe_tokens (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      subscription_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used_at DATETIME,
      metadata TEXT, -- JSON string
      created_at DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (subscription_id) REFERENCES newsletter_subscriptions(id) ON DELETE CASCADE
    )`,

    // Analytics
    `CREATE TABLE IF NOT EXISTS newsletter_analytics (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      date DATE NOT NULL,
      source TEXT,
      tag TEXT,
      subscriptions_count INTEGER DEFAULT 0,
      unsubscriptions_count INTEGER DEFAULT 0,
      confirmations_count INTEGER DEFAULT 0,
      bounces_count INTEGER DEFAULT 0,
      net_growth INTEGER AS (subscriptions_count - unsubscriptions_count) STORED,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now')),
      UNIQUE(date, source, tag)
    )`,

    // Audit logs
    `CREATE TABLE IF NOT EXISTS newsletter_audit_logs (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      subscription_id TEXT,
      email TEXT NOT NULL,
      action TEXT NOT NULL CHECK (action IN ('subscribe', 'confirm', 'unsubscribe', 'bounce', 'block', 'update', 'delete', 'export', 'import')),
      previous_status TEXT,
      new_status TEXT,
      metadata TEXT, -- JSON string
      ip_address TEXT,
      user_agent TEXT,
      timestamp DATETIME DEFAULT (datetime('now')),
      FOREIGN KEY (subscription_id) REFERENCES newsletter_subscriptions(id) ON DELETE SET NULL
    )`,

    // Email bounces
    `CREATE TABLE IF NOT EXISTS newsletter_email_bounces (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      email TEXT NOT NULL,
      bounce_type TEXT NOT NULL CHECK (bounce_type IN ('hard', 'soft', 'complaint', 'suppression')),
      bounce_reason TEXT NOT NULL,
      bounced_at DATETIME DEFAULT (datetime('now')),
      provider_response TEXT, -- JSON string
      resolved INTEGER DEFAULT 0, -- SQLite doesn't have BOOLEAN, use INTEGER
      resolved_at DATETIME,
      created_at DATETIME DEFAULT (datetime('now'))
    )`,

    // Subscription tags
    `CREATE TABLE IF NOT EXISTS newsletter_subscription_tags (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      color TEXT,
      is_system INTEGER DEFAULT 0, -- SQLite doesn't have BOOLEAN, use INTEGER
      subscription_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT (datetime('now')),
      updated_at DATETIME DEFAULT (datetime('now'))
    )`
  ],

  indexes: [
    // Primary indexes for performance
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions(email)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_status ON newsletter_subscriptions(status)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_source ON newsletter_subscriptions(source)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_subscribed_at ON newsletter_subscriptions(subscribed_at)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_confirmed_at ON newsletter_subscriptions(confirmed_at)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_unsubscribed_at ON newsletter_subscriptions(unsubscribed_at)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_confirmation_token ON newsletter_subscriptions(confirmation_token)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_unsubscribe_token ON newsletter_subscriptions(unsubscribe_token)',

    // Token indexes
    'CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribe_tokens_token ON newsletter_unsubscribe_tokens(token)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribe_tokens_email ON newsletter_unsubscribe_tokens(email)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribe_tokens_expires_at ON newsletter_unsubscribe_tokens(expires_at)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribe_tokens_subscription_id ON newsletter_unsubscribe_tokens(subscription_id)',

    // Analytics indexes
    'CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_date ON newsletter_analytics(date)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_date_source ON newsletter_analytics(date, source)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_date_tag ON newsletter_analytics(date, tag)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_source ON newsletter_analytics(source)',

    // Audit log indexes
    'CREATE INDEX IF NOT EXISTS idx_newsletter_audit_logs_email ON newsletter_audit_logs(email)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_audit_logs_action ON newsletter_audit_logs(action)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_audit_logs_timestamp ON newsletter_audit_logs(timestamp)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_audit_logs_subscription_id ON newsletter_audit_logs(subscription_id)',

    // Bounce indexes
    'CREATE INDEX IF NOT EXISTS idx_newsletter_email_bounces_email ON newsletter_email_bounces(email)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_email_bounces_type ON newsletter_email_bounces(bounce_type)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_email_bounces_bounced_at ON newsletter_email_bounces(bounced_at)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_email_bounces_resolved ON newsletter_email_bounces(resolved)',

    // Tag indexes
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscription_tags_name ON newsletter_subscription_tags(name)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscription_tags_is_system ON newsletter_subscription_tags(is_system)',

    // Composite indexes for better performance
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_status_date ON newsletter_subscriptions(status, subscribed_at)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_source_status ON newsletter_subscriptions(source, status)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_audit_logs_email_action ON newsletter_audit_logs(email, action)'
  ],

  functions: [
    // SQLite doesn't support stored functions/procedures
    // These would be implemented in the application layer
  ],

  triggers: [
    // Update timestamp triggers for SQLite
    `CREATE TRIGGER IF NOT EXISTS newsletter_subscriptions_updated_at
        AFTER UPDATE ON newsletter_subscriptions
        FOR EACH ROW
        BEGIN
            UPDATE newsletter_subscriptions 
            SET updated_at = datetime('now') 
            WHERE id = NEW.id;
        END`,

    `CREATE TRIGGER IF NOT EXISTS newsletter_analytics_updated_at
        AFTER UPDATE ON newsletter_analytics
        FOR EACH ROW
        BEGIN
            UPDATE newsletter_analytics 
            SET updated_at = datetime('now') 
            WHERE id = NEW.id;
        END`,

    `CREATE TRIGGER IF NOT EXISTS newsletter_subscription_tags_updated_at
        AFTER UPDATE ON newsletter_subscription_tags
        FOR EACH ROW
        BEGIN
            UPDATE newsletter_subscription_tags 
            SET updated_at = datetime('now') 
            WHERE id = NEW.id;
        END`
  ],

  policies: [
    // SQLite doesn't have built-in RLS
    // Access control would be handled at the application level
  ],

  seeds: [
    // Default system tags
    `INSERT OR IGNORE INTO newsletter_subscription_tags (name, description, color, is_system) VALUES
        ('updates', 'General updates and announcements', '#3B82F6', 1),
        ('releases', 'Product and feature releases', '#10B981', 1),
        ('news', 'Company news and press releases', '#F59E0B', 1),
        ('tips', 'Tips and best practices', '#8B5CF6', 1),
        ('events', 'Events and webinars', '#EF4444', 1)`,

    // Sample analytics data for testing
    `INSERT OR IGNORE INTO newsletter_analytics (date, source, subscriptions_count, unsubscriptions_count, confirmations_count) VALUES
        (date('now', '-7 days'), 'web', 15, 2, 12),
        (date('now', '-6 days'), 'web', 8, 1, 7),
        (date('now', '-5 days'), 'mobile_app', 12, 0, 10),
        (date('now', '-4 days'), 'web', 20, 3, 18),
        (date('now', '-3 days'), 'landing_page', 25, 1, 22),
        (date('now', '-2 days'), 'web', 18, 2, 15),
        (date('now', '-1 days'), 'mobile_app', 10, 1, 8)`
  ]
};

// Helper functions that would be implemented in the application layer for SQLite
export const SQLITE_HELPERS = {
  // Get subscription count
  getSubscriptionCount: (status: string) => `
    SELECT COUNT(*) as count FROM newsletter_subscriptions WHERE status = ?
  `,

  // Get growth stats
  getGrowthStats: (startDate: string, endDate: string) => `
    SELECT 
      (SELECT COUNT(*) FROM newsletter_subscriptions WHERE subscribed_at >= ? AND subscribed_at <= ?) as subscriptions,
      (SELECT COUNT(*) FROM newsletter_subscriptions WHERE unsubscribed_at >= ? AND unsubscribed_at <= ?) as unsubscriptions,
      (SELECT COUNT(*) FROM newsletter_subscriptions WHERE confirmed_at >= ? AND confirmed_at <= ?) as confirmations,
      (SELECT COUNT(*) FROM newsletter_subscriptions WHERE subscribed_at < ? AND status = 'active') as total_before
  `,

  // Clean expired tokens
  cleanExpiredTokens: () => `
    DELETE FROM newsletter_unsubscribe_tokens WHERE expires_at < datetime('now')
  `,

  // Get subscription stats
  getSubscriptionStats: () => `
    SELECT 
      (SELECT COUNT(*) FROM newsletter_subscriptions) as total_subscriptions,
      (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'active') as active_subscriptions,
      (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'pending') as pending_subscriptions,
      (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'unsubscribed') as unsubscribed_subscriptions,
      (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'bounced') as bounced_subscriptions,
      (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'blocked') as blocked_subscriptions,
      (SELECT COUNT(*) FROM newsletter_subscriptions WHERE date(subscribed_at) = date('now')) as growth_today,
      (SELECT COUNT(*) FROM newsletter_subscriptions WHERE subscribed_at >= date('now', '-7 days')) as growth_week,
      (SELECT COUNT(*) FROM newsletter_subscriptions WHERE subscribed_at >= date('now', '-30 days')) as growth_month
  `,

  // Get popular tags (requires JSON parsing in application layer)
  getPopularTags: (limit: number = 10) => `
    SELECT 
      tag_value as tag,
      COUNT(*) as count
    FROM (
      SELECT 
        json_each.value as tag_value
      FROM newsletter_subscriptions, json_each(newsletter_subscriptions.tags)
      WHERE newsletter_subscriptions.status = 'active' 
        AND newsletter_subscriptions.tags IS NOT NULL 
        AND newsletter_subscriptions.tags != '[]'
    )
    GROUP BY tag_value
    ORDER BY count DESC
    LIMIT ?
  `
};