-- Newsletter API Enhanced Database Schema
-- Supports multiple database backends: Supabase/PostgreSQL
-- Includes analytics tables, indexes, and functions

-- Drop existing tables if they exist (be careful in production)
-- DROP TABLE IF EXISTS unsubscription_logs CASCADE;
-- DROP TABLE IF EXISTS subscription_analytics CASCADE;
-- DROP TABLE IF EXISTS email_subscriptions CASCADE;

-- Main subscriptions table with enhanced schema
CREATE TABLE IF NOT EXISTS email_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(254) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'unsubscribed', 'bounced')),
    source VARCHAR(50) DEFAULT 'web',
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
);

-- Unsubscription tracking table
CREATE TABLE IF NOT EXISTS unsubscription_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID,
    email VARCHAR(254) NOT NULL,
    reason VARCHAR(50) CHECK (reason IN ('too_frequent', 'not_relevant', 'never_signed_up', 'temporary', 'other')),
    feedback TEXT,
    unsubscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (subscription_id) REFERENCES email_subscriptions(id) ON DELETE SET NULL
);

-- Analytics and statistics table for aggregated data
CREATE TABLE IF NOT EXISTS subscription_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    source VARCHAR(50),
    tag VARCHAR(50),
    subscriptions_count INTEGER DEFAULT 0,
    unsubscriptions_count INTEGER DEFAULT 0,
    confirmations_count INTEGER DEFAULT 0,
    bounces_count INTEGER DEFAULT 0,
    net_growth INTEGER GENERATED ALWAYS AS (subscriptions_count - unsubscriptions_count) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, source, tag)
);

-- Email bounce tracking
CREATE TABLE IF NOT EXISTS email_bounces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(254) NOT NULL,
    bounce_type VARCHAR(20) CHECK (bounce_type IN ('hard', 'soft', 'complaint')),
    bounce_reason TEXT,
    bounced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    provider_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_status ON email_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_source ON email_subscriptions(source);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_subscribed_at ON email_subscriptions(subscribed_at);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_confirmed_at ON email_subscriptions(confirmed_at);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_unsubscribed_at ON email_subscriptions(unsubscribed_at);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_tags ON email_subscriptions USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_metadata ON email_subscriptions USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_confirmation_token ON email_subscriptions(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_unsubscribe_token ON email_subscriptions(unsubscribe_token);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_date ON subscription_analytics(date);
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_date_source ON subscription_analytics(date, source);
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_date_tag ON subscription_analytics(date, tag);

-- Unsubscription logs indexes
CREATE INDEX IF NOT EXISTS idx_unsubscription_logs_email ON unsubscription_logs(email);
CREATE INDEX IF NOT EXISTS idx_unsubscription_logs_unsubscribed_at ON unsubscription_logs(unsubscribed_at);
CREATE INDEX IF NOT EXISTS idx_unsubscription_logs_reason ON unsubscription_logs(reason);

-- Email bounces indexes
CREATE INDEX IF NOT EXISTS idx_email_bounces_email ON email_bounces(email);
CREATE INDEX IF NOT EXISTS idx_email_bounces_bounced_at ON email_bounces(bounced_at);
CREATE INDEX IF NOT EXISTS idx_email_bounces_type ON email_bounces(bounce_type);

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
DROP TRIGGER IF EXISTS update_email_subscriptions_updated_at ON email_subscriptions;
CREATE TRIGGER update_email_subscriptions_updated_at
    BEFORE UPDATE ON email_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscription_analytics_updated_at ON subscription_analytics;
CREATE TRIGGER update_subscription_analytics_updated_at
    BEFORE UPDATE ON subscription_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to get subscription count (compatible with existing code)
CREATE OR REPLACE FUNCTION get_subscription_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM email_subscriptions WHERE status = 'active');
END;
$$ LANGUAGE plpgsql;

-- Function to get growth statistics for a period
CREATE OR REPLACE FUNCTION get_growth_stats(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    subscriptions INTEGER,
    unsubscriptions INTEGER,
    net_growth INTEGER,
    growth_rate NUMERIC
) AS $$
DECLARE
    total_before INTEGER;
BEGIN
    -- Get subscriptions in period
    SELECT COUNT(*) INTO subscriptions
    FROM email_subscriptions
    WHERE subscribed_at >= start_date AND subscribed_at <= end_date;
    
    -- Get unsubscriptions in period
    SELECT COUNT(*) INTO unsubscriptions
    FROM unsubscription_logs
    WHERE unsubscribed_at >= start_date AND unsubscribed_at <= end_date;
    
    -- Calculate net growth
    net_growth := subscriptions - unsubscriptions;
    
    -- Get total subscriptions before period for growth rate
    SELECT COUNT(*) INTO total_before
    FROM email_subscriptions
    WHERE subscribed_at < start_date AND status = 'active';
    
    -- Calculate growth rate as percentage
    IF total_before > 0 THEN
        growth_rate := (net_growth::NUMERIC / total_before::NUMERIC) * 100;
    ELSE
        growth_rate := 0;
    END IF;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to generate analytics data for a specific date
CREATE OR REPLACE FUNCTION update_analytics_for_date(target_date DATE)
RETURNS VOID AS $$
DECLARE
    rec RECORD;
BEGIN
    -- Clear existing analytics for the date
    DELETE FROM subscription_analytics WHERE date = target_date;
    
    -- Generate analytics by source
    FOR rec IN 
        SELECT 
            source,
            COUNT(*) as subs_count
        FROM email_subscriptions 
        WHERE DATE(subscribed_at) = target_date
        GROUP BY source
    LOOP
        INSERT INTO subscription_analytics (date, source, tag, subscriptions_count, unsubscriptions_count, confirmations_count)
        VALUES (target_date, rec.source, NULL, rec.subs_count, 0, 0)
        ON CONFLICT (date, source, tag) DO UPDATE SET
            subscriptions_count = EXCLUDED.subscriptions_count;
    END LOOP;
    
    -- Add unsubscription counts
    FOR rec IN 
        SELECT 
            es.source,
            COUNT(*) as unsub_count
        FROM unsubscription_logs ul
        JOIN email_subscriptions es ON ul.email = es.email
        WHERE DATE(ul.unsubscribed_at) = target_date
        GROUP BY es.source
    LOOP
        INSERT INTO subscription_analytics (date, source, tag, subscriptions_count, unsubscriptions_count, confirmations_count)
        VALUES (target_date, rec.source, NULL, 0, rec.unsub_count, 0)
        ON CONFLICT (date, source, tag) DO UPDATE SET
            unsubscriptions_count = EXCLUDED.unsubscriptions_count;
    END LOOP;
    
    -- Add confirmation counts
    FOR rec IN 
        SELECT 
            source,
            COUNT(*) as conf_count
        FROM email_subscriptions 
        WHERE DATE(confirmed_at) = target_date
        GROUP BY source
    LOOP
        INSERT INTO subscription_analytics (date, source, tag, subscriptions_count, unsubscriptions_count, confirmations_count)
        VALUES (target_date, rec.source, NULL, 0, 0, rec.conf_count)
        ON CONFLICT (date, source, tag) DO UPDATE SET
            confirmations_count = EXCLUDED.confirmations_count;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get popular tags
CREATE OR REPLACE FUNCTION get_popular_tags(limit_count INTEGER DEFAULT 10)
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
    FROM email_subscriptions
    WHERE array_length(tags, 1) > 0;
    
    RETURN QUERY
    SELECT 
        unnest_tags.tag,
        COUNT(*) as count,
        ROUND((COUNT(*)::NUMERIC / total_with_tags::NUMERIC) * 100, 1) as percentage
    FROM (
        SELECT unnest(tags) as tag
        FROM email_subscriptions
        WHERE status = 'active' AND array_length(tags, 1) > 0
    ) unnest_tags
    GROUP BY unnest_tags.tag
    ORDER BY count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies for Supabase
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE unsubscription_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_bounces ENABLE ROW LEVEL SECURITY;

-- Public access policies for API usage
CREATE POLICY "Enable read access for service role" ON email_subscriptions
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for service role" ON email_subscriptions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for service role" ON email_subscriptions
    FOR UPDATE USING (true);

-- Similar policies for other tables
CREATE POLICY "Enable all access for service role on unsubscription_logs" ON unsubscription_logs
    FOR ALL USING (true);

CREATE POLICY "Enable all access for service role on subscription_analytics" ON subscription_analytics
    FOR ALL USING (true);

CREATE POLICY "Enable all access for service role on email_bounces" ON email_bounces
    FOR ALL USING (true);

-- Sample data for testing (comment out in production)
-- INSERT INTO email_subscriptions (email, status, source, tags, metadata) VALUES
--     ('test1@example.com', 'active', 'web', '{"updates", "releases"}', '{"referrer": "homepage"}'),
--     ('test2@example.com', 'active', 'mobile_app', '{"updates"}', '{"campaign": "launch"}'),
--     ('test3@example.com', 'pending', 'landing_page', '{"releases"}', '{"utm_source": "google"}'),
--     ('test4@example.com', 'unsubscribed', 'web', '{"updates"}', '{}');

-- Comments for schema documentation
COMMENT ON TABLE email_subscriptions IS 'Main newsletter subscriptions table with enhanced metadata support';
COMMENT ON TABLE unsubscription_logs IS 'Tracks unsubscription events with reasons and feedback';
COMMENT ON TABLE subscription_analytics IS 'Aggregated analytics data for reporting and dashboards';
COMMENT ON TABLE email_bounces IS 'Tracks email bounces and delivery issues';

COMMENT ON COLUMN email_subscriptions.metadata IS 'JSON metadata including UTM parameters, referrer, campaign data';
COMMENT ON COLUMN email_subscriptions.tags IS 'Array of tags for categorization and segmentation';
COMMENT ON COLUMN email_subscriptions.unsubscribe_token IS 'Secure token for one-click unsubscribe links';
COMMENT ON COLUMN subscription_analytics.net_growth IS 'Computed column: subscriptions - unsubscriptions';

-- Grant necessary permissions (adjust for your specific setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
-- GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;