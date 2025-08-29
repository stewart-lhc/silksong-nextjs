/**
 * PostgreSQL/Supabase Schema
 * 
 * Complete newsletter database schema optimized for PostgreSQL and Supabase
 */

import type { SchemaDefinition } from './index';

export const POSTGRESQL_SCHEMA: SchemaDefinition = {
  tables: [
    // Core subscriptions table
    `CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(254) UNIQUE NOT NULL,
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'unsubscribed', 'bounced', 'blocked')),
      source VARCHAR(100) DEFAULT 'web',
      tags TEXT[] DEFAULT '{}',
      metadata JSONB DEFAULT '{}',
      subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      confirmed_at TIMESTAMP WITH TIME ZONE,
      unsubscribed_at TIMESTAMP WITH TIME ZONE,
      confirmation_token VARCHAR(255),
      unsubscribe_token VARCHAR(255) DEFAULT gen_random_uuid(),
      ip_address INET,
      user_agent TEXT,
      referrer TEXT,
      utm_source VARCHAR(100),
      utm_medium VARCHAR(100),
      utm_campaign VARCHAR(100),
      utm_content VARCHAR(100),
      utm_term VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    // Unsubscribe tokens for secure one-click unsubscribe
    `CREATE TABLE IF NOT EXISTS newsletter_unsubscribe_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      subscription_id UUID NOT NULL,
      token VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(254) NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      used_at TIMESTAMP WITH TIME ZONE,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY (subscription_id) REFERENCES newsletter_subscriptions(id) ON DELETE CASCADE
    )`,

    // Analytics and statistics
    `CREATE TABLE IF NOT EXISTS newsletter_analytics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      date DATE NOT NULL,
      source VARCHAR(100),
      tag VARCHAR(100),
      subscriptions_count INTEGER DEFAULT 0,
      unsubscriptions_count INTEGER DEFAULT 0,
      confirmations_count INTEGER DEFAULT 0,
      bounces_count INTEGER DEFAULT 0,
      net_growth INTEGER GENERATED ALWAYS AS (subscriptions_count - unsubscriptions_count) STORED,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(date, source, tag)
    )`,

    // Audit logging for all subscription activities
    `CREATE TABLE IF NOT EXISTS newsletter_audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      subscription_id UUID,
      email VARCHAR(254) NOT NULL,
      action VARCHAR(50) NOT NULL CHECK (action IN ('subscribe', 'confirm', 'unsubscribe', 'bounce', 'block', 'update', 'delete', 'export', 'import')),
      previous_status VARCHAR(20),
      new_status VARCHAR(20),
      metadata JSONB DEFAULT '{}',
      ip_address INET,
      user_agent TEXT,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY (subscription_id) REFERENCES newsletter_subscriptions(id) ON DELETE SET NULL
    )`,

    // Email bounce tracking
    `CREATE TABLE IF NOT EXISTS newsletter_email_bounces (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(254) NOT NULL,
      bounce_type VARCHAR(20) NOT NULL CHECK (bounce_type IN ('hard', 'soft', 'complaint', 'suppression')),
      bounce_reason TEXT NOT NULL,
      bounced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      provider_response JSONB,
      resolved BOOLEAN DEFAULT FALSE,
      resolved_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,

    // Subscription tags for organization and segmentation
    `CREATE TABLE IF NOT EXISTS newsletter_subscription_tags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      color VARCHAR(7), -- HEX color code
      is_system BOOLEAN DEFAULT FALSE,
      subscription_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`
  ],

  indexes: [
    // Primary performance indexes
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions(email)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_status ON newsletter_subscriptions(status)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_source ON newsletter_subscriptions(source)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_subscribed_at ON newsletter_subscriptions(subscribed_at)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_confirmed_at ON newsletter_subscriptions(confirmed_at)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_unsubscribed_at ON newsletter_subscriptions(unsubscribed_at)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_tags ON newsletter_subscriptions USING GIN (tags)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_metadata ON newsletter_subscriptions USING GIN (metadata)',
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_confirmation_token ON newsletter_subscriptions(confirmation_token) WHERE confirmation_token IS NOT NULL',
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
    'CREATE INDEX IF NOT EXISTS idx_newsletter_subscription_tags_is_system ON newsletter_subscription_tags(is_system)'
  ],

  functions: [
    // Update timestamp trigger function
    `CREATE OR REPLACE FUNCTION newsletter_update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql'`,

    // Get subscription count function
    `CREATE OR REPLACE FUNCTION newsletter_get_subscription_count(status_filter TEXT DEFAULT 'active')
    RETURNS INTEGER AS $$
    BEGIN
        RETURN (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = status_filter);
    END;
    $$ LANGUAGE plpgsql`,

    // Get growth statistics
    `CREATE OR REPLACE FUNCTION newsletter_get_growth_stats(
        start_date TIMESTAMP WITH TIME ZONE,
        end_date TIMESTAMP WITH TIME ZONE
    )
    RETURNS TABLE (
        subscriptions INTEGER,
        unsubscriptions INTEGER,
        confirmations INTEGER,
        net_growth INTEGER,
        growth_rate NUMERIC
    ) AS $$
    DECLARE
        total_before INTEGER;
    BEGIN
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
        net_growth := subscriptions - unsubscriptions;
        
        -- Get total subscriptions before period for growth rate
        SELECT COUNT(*) INTO total_before
        FROM newsletter_subscriptions
        WHERE subscribed_at < start_date AND status = 'active';
        
        -- Calculate growth rate as percentage
        IF total_before > 0 THEN
            growth_rate := (net_growth::NUMERIC / total_before::NUMERIC) * 100;
        ELSE
            growth_rate := CASE WHEN net_growth > 0 THEN 100 ELSE 0 END;
        END IF;
        
        RETURN NEXT;
    END;
    $$ LANGUAGE plpgsql`,

    // Update analytics for date
    `CREATE OR REPLACE FUNCTION newsletter_update_analytics_for_date(target_date DATE)
    RETURNS VOID AS $$
    DECLARE
        rec RECORD;
    BEGIN
        -- Clear existing analytics for the date
        DELETE FROM newsletter_analytics WHERE date = target_date;
        
        -- Generate analytics by source
        FOR rec IN 
            SELECT 
                COALESCE(source, 'unknown') as source,
                COUNT(*) as subs_count
            FROM newsletter_subscriptions 
            WHERE DATE(subscribed_at) = target_date
            GROUP BY source
        LOOP
            INSERT INTO newsletter_analytics (date, source, tag, subscriptions_count, unsubscriptions_count, confirmations_count)
            VALUES (target_date, rec.source, NULL, rec.subs_count, 0, 0)
            ON CONFLICT (date, source, tag) DO UPDATE SET
                subscriptions_count = EXCLUDED.subscriptions_count;
        END LOOP;
        
        -- Add unsubscription counts
        FOR rec IN 
            SELECT 
                COALESCE(source, 'unknown') as source,
                COUNT(*) as unsub_count
            FROM newsletter_subscriptions
            WHERE DATE(unsubscribed_at) = target_date
            GROUP BY source
        LOOP
            INSERT INTO newsletter_analytics (date, source, tag, subscriptions_count, unsubscriptions_count, confirmations_count)
            VALUES (target_date, rec.source, NULL, 0, rec.unsub_count, 0)
            ON CONFLICT (date, source, tag) DO UPDATE SET
                unsubscriptions_count = EXCLUDED.unsubscriptions_count;
        END LOOP;
        
        -- Add confirmation counts
        FOR rec IN 
            SELECT 
                COALESCE(source, 'unknown') as source,
                COUNT(*) as conf_count
            FROM newsletter_subscriptions 
            WHERE DATE(confirmed_at) = target_date
            GROUP BY source
        LOOP
            INSERT INTO newsletter_analytics (date, source, tag, subscriptions_count, unsubscriptions_count, confirmations_count)
            VALUES (target_date, rec.source, NULL, 0, 0, rec.conf_count)
            ON CONFLICT (date, source, tag) DO UPDATE SET
                confirmations_count = EXCLUDED.confirmations_count;
        END LOOP;
    END;
    $$ LANGUAGE plpgsql`,

    // Get popular tags
    `CREATE OR REPLACE FUNCTION newsletter_get_popular_tags(limit_count INTEGER DEFAULT 10)
    RETURNS TABLE (
        tag TEXT,
        count BIGINT,
        percentage NUMERIC
    ) AS $$
    DECLARE
        total_with_tags INTEGER;
    BEGIN
        -- Get total subscriptions that have tags
        SELECT COUNT(*) INTO total_with_tags
        FROM newsletter_subscriptions
        WHERE array_length(tags, 1) > 0 AND status = 'active';
        
        RETURN QUERY
        SELECT 
            unnest_tags.tag,
            COUNT(*) as count,
            CASE 
                WHEN total_with_tags > 0 THEN ROUND((COUNT(*)::NUMERIC / total_with_tags::NUMERIC) * 100, 1)
                ELSE 0
            END as percentage
        FROM (
            SELECT unnest(tags) as tag
            FROM newsletter_subscriptions
            WHERE status = 'active' AND array_length(tags, 1) > 0
        ) unnest_tags
        GROUP BY unnest_tags.tag
        ORDER BY count DESC
        LIMIT limit_count;
    END;
    $$ LANGUAGE plpgsql`,

    // Clean expired tokens
    `CREATE OR REPLACE FUNCTION newsletter_clean_expired_tokens()
    RETURNS INTEGER AS $$
    DECLARE
        deleted_count INTEGER;
    BEGIN
        DELETE FROM newsletter_unsubscribe_tokens 
        WHERE expires_at < NOW();
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RETURN deleted_count;
    END;
    $$ LANGUAGE plpgsql`,

    // Subscription stats summary
    `CREATE OR REPLACE FUNCTION newsletter_get_subscription_stats()
    RETURNS TABLE (
        total_subscriptions BIGINT,
        active_subscriptions BIGINT,
        pending_subscriptions BIGINT,
        unsubscribed_subscriptions BIGINT,
        bounced_subscriptions BIGINT,
        blocked_subscriptions BIGINT,
        growth_today INTEGER,
        growth_week INTEGER,
        growth_month INTEGER
    ) AS $$
    BEGIN
        RETURN QUERY
        SELECT 
            (SELECT COUNT(*) FROM newsletter_subscriptions) as total_subscriptions,
            (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'active') as active_subscriptions,
            (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'pending') as pending_subscriptions,
            (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'unsubscribed') as unsubscribed_subscriptions,
            (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'bounced') as bounced_subscriptions,
            (SELECT COUNT(*) FROM newsletter_subscriptions WHERE status = 'blocked') as blocked_subscriptions,
            (SELECT COUNT(*)::INTEGER FROM newsletter_subscriptions WHERE subscribed_at >= CURRENT_DATE) as growth_today,
            (SELECT COUNT(*)::INTEGER FROM newsletter_subscriptions WHERE subscribed_at >= CURRENT_DATE - INTERVAL '7 days') as growth_week,
            (SELECT COUNT(*)::INTEGER FROM newsletter_subscriptions WHERE subscribed_at >= CURRENT_DATE - INTERVAL '30 days') as growth_month;
    END;
    $$ LANGUAGE plpgsql`
  ],

  triggers: [
    // Update timestamp triggers
    'DROP TRIGGER IF EXISTS newsletter_subscriptions_updated_at ON newsletter_subscriptions',
    `CREATE TRIGGER newsletter_subscriptions_updated_at
        BEFORE UPDATE ON newsletter_subscriptions
        FOR EACH ROW
        EXECUTE FUNCTION newsletter_update_updated_at_column()`,

    'DROP TRIGGER IF EXISTS newsletter_analytics_updated_at ON newsletter_analytics',
    `CREATE TRIGGER newsletter_analytics_updated_at
        BEFORE UPDATE ON newsletter_analytics
        FOR EACH ROW
        EXECUTE FUNCTION newsletter_update_updated_at_column()`,

    'DROP TRIGGER IF EXISTS newsletter_subscription_tags_updated_at ON newsletter_subscription_tags',
    `CREATE TRIGGER newsletter_subscription_tags_updated_at
        BEFORE UPDATE ON newsletter_subscription_tags
        FOR EACH ROW
        EXECUTE FUNCTION newsletter_update_updated_at_column()`
  ],

  policies: [
    // Enable RLS on all tables
    'ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY',
    'ALTER TABLE newsletter_unsubscribe_tokens ENABLE ROW LEVEL SECURITY',
    'ALTER TABLE newsletter_analytics ENABLE ROW LEVEL SECURITY',
    'ALTER TABLE newsletter_audit_logs ENABLE ROW LEVEL SECURITY',
    'ALTER TABLE newsletter_email_bounces ENABLE ROW LEVEL SECURITY',
    'ALTER TABLE newsletter_subscription_tags ENABLE ROW LEVEL SECURITY',

    // Service role policies (full access)
    `CREATE POLICY "newsletter_service_role_all_subscriptions" ON newsletter_subscriptions
        FOR ALL USING (auth.role() = 'service_role')`,
    
    `CREATE POLICY "newsletter_service_role_all_tokens" ON newsletter_unsubscribe_tokens
        FOR ALL USING (auth.role() = 'service_role')`,
    
    `CREATE POLICY "newsletter_service_role_all_analytics" ON newsletter_analytics
        FOR ALL USING (auth.role() = 'service_role')`,
    
    `CREATE POLICY "newsletter_service_role_all_audit" ON newsletter_audit_logs
        FOR ALL USING (auth.role() = 'service_role')`,
    
    `CREATE POLICY "newsletter_service_role_all_bounces" ON newsletter_email_bounces
        FOR ALL USING (auth.role() = 'service_role')`,
    
    `CREATE POLICY "newsletter_service_role_all_tags" ON newsletter_subscription_tags
        FOR ALL USING (auth.role() = 'service_role')`,

    // Anonymous role policies (limited access for public API)
    `CREATE POLICY "newsletter_anonymous_read_public_analytics" ON newsletter_analytics
        FOR SELECT USING (true)`,
    
    `CREATE POLICY "newsletter_anonymous_insert_subscriptions" ON newsletter_subscriptions
        FOR INSERT WITH CHECK (true)`,
    
    `CREATE POLICY "newsletter_anonymous_update_own_subscription" ON newsletter_subscriptions
        FOR UPDATE USING (
            unsubscribe_token IS NOT NULL AND 
            unsubscribe_token = current_setting('newsletter.unsubscribe_token', true)
        )`
  ],

  seeds: [
    // Default system tags
    `INSERT INTO newsletter_subscription_tags (name, description, color, is_system) VALUES
        ('updates', 'General updates and announcements', '#3B82F6', true),
        ('releases', 'Product and feature releases', '#10B981', true),
        ('news', 'Company news and press releases', '#F59E0B', true),
        ('tips', 'Tips and best practices', '#8B5CF6', true),
        ('events', 'Events and webinars', '#EF4444', true)
    ON CONFLICT (name) DO NOTHING`,

    // Sample analytics data for testing
    `INSERT INTO newsletter_analytics (date, source, subscriptions_count, unsubscriptions_count, confirmations_count) VALUES
        (CURRENT_DATE - INTERVAL '7 days', 'web', 15, 2, 12),
        (CURRENT_DATE - INTERVAL '6 days', 'web', 8, 1, 7),
        (CURRENT_DATE - INTERVAL '5 days', 'mobile_app', 12, 0, 10),
        (CURRENT_DATE - INTERVAL '4 days', 'web', 20, 3, 18),
        (CURRENT_DATE - INTERVAL '3 days', 'landing_page', 25, 1, 22),
        (CURRENT_DATE - INTERVAL '2 days', 'web', 18, 2, 15),
        (CURRENT_DATE - INTERVAL '1 day', 'mobile_app', 10, 1, 8)
    ON CONFLICT (date, source, tag) DO NOTHING`
  ]
};

// Schema comments for documentation
export const POSTGRESQL_COMMENTS = [
  "COMMENT ON TABLE newsletter_subscriptions IS 'Core newsletter subscriptions with enhanced metadata and tracking'",
  "COMMENT ON TABLE newsletter_unsubscribe_tokens IS 'Secure tokens for one-click unsubscribe functionality'",
  "COMMENT ON TABLE newsletter_analytics IS 'Aggregated analytics data for reporting and insights'",
  "COMMENT ON TABLE newsletter_audit_logs IS 'Complete audit trail for all subscription activities'",
  "COMMENT ON TABLE newsletter_email_bounces IS 'Email delivery bounce tracking and management'",
  "COMMENT ON TABLE newsletter_subscription_tags IS 'Tagging system for subscription organization and segmentation'",
  
  "COMMENT ON COLUMN newsletter_subscriptions.metadata IS 'JSON metadata including UTM parameters, custom fields, and tracking data'",
  "COMMENT ON COLUMN newsletter_subscriptions.tags IS 'Array of tags for subscription categorization and segmentation'",
  "COMMENT ON COLUMN newsletter_subscriptions.unsubscribe_token IS 'Unique token for secure one-click unsubscribe'",
  "COMMENT ON COLUMN newsletter_analytics.net_growth IS 'Computed column: subscriptions minus unsubscriptions'"
];