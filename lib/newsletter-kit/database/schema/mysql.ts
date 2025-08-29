/**
 * MySQL Schema
 * 
 * Newsletter database schema optimized for MySQL
 */

import type { SchemaDefinition } from './index';

export const MYSQL_SCHEMA: SchemaDefinition = {
  tables: [
    // Core subscriptions table
    `CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      email VARCHAR(254) UNIQUE NOT NULL,
      status ENUM('pending', 'active', 'unsubscribed', 'bounced', 'blocked') DEFAULT 'pending',
      source VARCHAR(100) DEFAULT 'web',
      tags JSON,
      metadata JSON,
      subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      confirmed_at TIMESTAMP NULL,
      unsubscribed_at TIMESTAMP NULL,
      confirmation_token VARCHAR(255),
      unsubscribe_token VARCHAR(255) DEFAULT (UUID()),
      ip_address VARCHAR(45),
      user_agent TEXT,
      referrer TEXT,
      utm_source VARCHAR(100),
      utm_medium VARCHAR(100),
      utm_campaign VARCHAR(100),
      utm_content VARCHAR(100),
      utm_term VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_status (status),
      INDEX idx_source (source),
      INDEX idx_subscribed_at (subscribed_at),
      INDEX idx_confirmed_at (confirmed_at),
      INDEX idx_unsubscribed_at (unsubscribed_at),
      INDEX idx_confirmation_token (confirmation_token),
      INDEX idx_unsubscribe_token (unsubscribe_token)
    ) ENGINE=InnoDB`,

    // Unsubscribe tokens
    `CREATE TABLE IF NOT EXISTS newsletter_unsubscribe_tokens (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      subscription_id VARCHAR(36) NOT NULL,
      token VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(254) NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP NULL,
      metadata JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subscription_id) REFERENCES newsletter_subscriptions(id) ON DELETE CASCADE,
      INDEX idx_token (token),
      INDEX idx_email (email),
      INDEX idx_expires_at (expires_at),
      INDEX idx_subscription_id (subscription_id)
    ) ENGINE=InnoDB`,

    // Analytics
    `CREATE TABLE IF NOT EXISTS newsletter_analytics (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      date DATE NOT NULL,
      source VARCHAR(100),
      tag VARCHAR(100),
      subscriptions_count INT DEFAULT 0,
      unsubscriptions_count INT DEFAULT 0,
      confirmations_count INT DEFAULT 0,
      bounces_count INT DEFAULT 0,
      net_growth INT GENERATED ALWAYS AS (subscriptions_count - unsubscriptions_count) STORED,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_analytics (date, source, tag),
      INDEX idx_date (date),
      INDEX idx_date_source (date, source),
      INDEX idx_date_tag (date, tag),
      INDEX idx_source (source)
    ) ENGINE=InnoDB`,

    // Audit logs
    `CREATE TABLE IF NOT EXISTS newsletter_audit_logs (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      subscription_id VARCHAR(36),
      email VARCHAR(254) NOT NULL,
      action ENUM('subscribe', 'confirm', 'unsubscribe', 'bounce', 'block', 'update', 'delete', 'export', 'import') NOT NULL,
      previous_status VARCHAR(20),
      new_status VARCHAR(20),
      metadata JSON,
      ip_address VARCHAR(45),
      user_agent TEXT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subscription_id) REFERENCES newsletter_subscriptions(id) ON DELETE SET NULL,
      INDEX idx_email (email),
      INDEX idx_action (action),
      INDEX idx_timestamp (timestamp),
      INDEX idx_subscription_id (subscription_id)
    ) ENGINE=InnoDB`,

    // Email bounces
    `CREATE TABLE IF NOT EXISTS newsletter_email_bounces (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      email VARCHAR(254) NOT NULL,
      bounce_type ENUM('hard', 'soft', 'complaint', 'suppression') NOT NULL,
      bounce_reason TEXT NOT NULL,
      bounced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      provider_response JSON,
      resolved BOOLEAN DEFAULT FALSE,
      resolved_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_bounce_type (bounce_type),
      INDEX idx_bounced_at (bounced_at),
      INDEX idx_resolved (resolved)
    ) ENGINE=InnoDB`,

    // Subscription tags
    `CREATE TABLE IF NOT EXISTS newsletter_subscription_tags (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      color VARCHAR(7),
      is_system BOOLEAN DEFAULT FALSE,
      subscription_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_name (name),
      INDEX idx_is_system (is_system)
    ) ENGINE=InnoDB`
  ],

  indexes: [
    // Additional composite indexes for performance
    'CREATE INDEX idx_newsletter_subscriptions_status_date ON newsletter_subscriptions(status, subscribed_at)',
    'CREATE INDEX idx_newsletter_subscriptions_source_status ON newsletter_subscriptions(source, status)',
    'CREATE INDEX idx_newsletter_audit_logs_email_action ON newsletter_audit_logs(email, action)',
    'CREATE INDEX idx_newsletter_analytics_date_source_tag ON newsletter_analytics(date, source, tag)'
  ],

  functions: [
    // Get subscription count function
    `DROP FUNCTION IF EXISTS newsletter_get_subscription_count`,
    `CREATE FUNCTION newsletter_get_subscription_count(status_filter VARCHAR(20))
    RETURNS INT
    READS SQL DATA
    BEGIN
        DECLARE result INT DEFAULT 0;
        SELECT COUNT(*) INTO result FROM newsletter_subscriptions WHERE status = status_filter;
        RETURN result;
    END`,

    // Get growth stats function
    `DROP FUNCTION IF EXISTS newsletter_get_growth_stats`,
    `CREATE FUNCTION newsletter_get_growth_stats(
        start_date TIMESTAMP,
        end_date TIMESTAMP
    )
    RETURNS JSON
    READS SQL DATA
    BEGIN
        DECLARE subscriptions INT DEFAULT 0;
        DECLARE unsubscriptions INT DEFAULT 0;
        DECLARE confirmations INT DEFAULT 0;
        DECLARE net_growth INT DEFAULT 0;
        DECLARE total_before INT DEFAULT 0;
        DECLARE growth_rate DECIMAL(10,2) DEFAULT 0;
        
        -- Get subscriptions in period
        SELECT COUNT(*) INTO subscriptions
        FROM newsletter_subscriptions
        WHERE subscribed_at >= start_date AND subscribed_at <= end_date;
        
        -- Get unsubscriptions in period
        SELECT COUNT(*) INTO unsubscriptions
        FROM newsletter_subscriptions
        WHERE unsubscribed_at >= start_date AND unsubscribed_at <= end_date;
        
        -- Get confirmations in period
        SELECT COUNT(*) INTO confirmations
        FROM newsletter_subscriptions
        WHERE confirmed_at >= start_date AND confirmed_at <= end_date;
        
        -- Calculate net growth
        SET net_growth = subscriptions - unsubscriptions;
        
        -- Get total subscriptions before period
        SELECT COUNT(*) INTO total_before
        FROM newsletter_subscriptions
        WHERE subscribed_at < start_date AND status = 'active';
        
        -- Calculate growth rate
        IF total_before > 0 THEN
            SET growth_rate = (net_growth / total_before) * 100;
        ELSE
            SET growth_rate = CASE WHEN net_growth > 0 THEN 100 ELSE 0 END;
        END IF;
        
        RETURN JSON_OBJECT(
            'subscriptions', subscriptions,
            'unsubscriptions', unsubscriptions,
            'confirmations', confirmations,
            'net_growth', net_growth,
            'growth_rate', growth_rate
        );
    END`,

    // Clean expired tokens
    `DROP FUNCTION IF EXISTS newsletter_clean_expired_tokens`,
    `CREATE FUNCTION newsletter_clean_expired_tokens()
    RETURNS INT
    MODIFIES SQL DATA
    BEGIN
        DECLARE deleted_count INT DEFAULT 0;
        DELETE FROM newsletter_unsubscribe_tokens WHERE expires_at < NOW();
        SET deleted_count = ROW_COUNT();
        RETURN deleted_count;
    END`,

    // Get subscription stats
    `DROP FUNCTION IF EXISTS newsletter_get_subscription_stats`,
    `CREATE FUNCTION newsletter_get_subscription_stats()
    RETURNS JSON
    READS SQL DATA
    BEGIN
        RETURN JSON_OBJECT(
            'total_subscriptions', (SELECT COUNT(*) FROM newsletter_subscriptions),
            'active_subscriptions', (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'active'),
            'pending_subscriptions', (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'pending'),
            'unsubscribed_subscriptions', (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'unsubscribed'),
            'bounced_subscriptions', (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'bounced'),
            'blocked_subscriptions', (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'blocked'),
            'growth_today', (SELECT COUNT(*) FROM newsletter_subscriptions WHERE DATE(subscribed_at) = CURDATE()),
            'growth_week', (SELECT COUNT(*) FROM newsletter_subscriptions WHERE subscribed_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)),
            'growth_month', (SELECT COUNT(*) FROM newsletter_subscriptions WHERE subscribed_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY))
        );
    END`
  ],

  triggers: [
    // MySQL doesn't need explicit triggers for updated_at since we use ON UPDATE CURRENT_TIMESTAMP
  ],

  policies: [
    // MySQL doesn't have built-in RLS like PostgreSQL
    // Access control would be handled at the application level
  ],

  seeds: [
    // Default system tags
    `INSERT IGNORE INTO newsletter_subscription_tags (name, description, color, is_system) VALUES
        ('updates', 'General updates and announcements', '#3B82F6', true),
        ('releases', 'Product and feature releases', '#10B981', true),
        ('news', 'Company news and press releases', '#F59E0B', true),
        ('tips', 'Tips and best practices', '#8B5CF6', true),
        ('events', 'Events and webinars', '#EF4444', true)`,

    // Sample analytics data
    `INSERT IGNORE INTO newsletter_analytics (date, source, subscriptions_count, unsubscriptions_count, confirmations_count) VALUES
        (DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'web', 15, 2, 12),
        (DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'web', 8, 1, 7),
        (DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'mobile_app', 12, 0, 10),
        (DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'web', 20, 3, 18),
        (DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'landing_page', 25, 1, 22),
        (DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'web', 18, 2, 15),
        (DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'mobile_app', 10, 1, 8)`
  ]
};