-- Complete Newsletter Database Migration
-- Step 1: Upgrade existing email_subscriptions table
-- Step 2: Add all other tables and functions from newsletter-enhanced-schema.sql

-- =========== STEP 1: ALTER EXISTING email_subscriptions TABLE ===========

-- Add missing columns to existing table
ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'unsubscribed', 'bounced'));

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'web';

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS confirmation_token VARCHAR(255);

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS unsubscribe_token VARCHAR(255) DEFAULT gen_random_uuid()::TEXT;

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS ip_address INET;

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS user_agent TEXT;

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS referrer TEXT;

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100);

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100);

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(100);

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS utm_content VARCHAR(100);

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS utm_term VARCHAR(100);

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records
UPDATE email_subscriptions 
SET 
    status = 'active',
    source = 'web',
    metadata = '{}',
    tags = '{}',
    created_at = COALESCE(created_at, subscribed_at),
    updated_at = COALESCE(updated_at, subscribed_at),
    unsubscribe_token = COALESCE(unsubscribe_token, gen_random_uuid()::TEXT)
WHERE status IS NULL;

-- =========== STEP 2: CREATE OTHER TABLES FROM newsletter-enhanced-schema.sql ===========

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

-- Analytics and statistics table
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

-- =========== STEP 3: CREATE INDEXES ===========

-- Main table indexes
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_status ON email_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_source ON email_subscriptions(source);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_subscribed_at ON email_subscriptions(subscribed_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_metadata ON email_subscriptions USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_tags ON email_subscriptions USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_status_active ON email_subscriptions(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_unsubscribe_token ON email_subscriptions(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_created_at ON email_subscriptions(created_at DESC);

-- Unsubscription logs indexes
CREATE INDEX IF NOT EXISTS idx_unsubscription_logs_email ON unsubscription_logs(email);
CREATE INDEX IF NOT EXISTS idx_unsubscription_logs_subscription_id ON unsubscription_logs(subscription_id);
CREATE INDEX IF NOT EXISTS idx_unsubscription_logs_unsubscribed_at ON unsubscription_logs(unsubscribed_at DESC);
CREATE INDEX IF NOT EXISTS idx_unsubscription_logs_reason ON unsubscription_logs(reason);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_date ON subscription_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_source ON subscription_analytics(source);
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_tag ON subscription_analytics(tag);

-- =========== STEP 4: CREATE FUNCTIONS ===========

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_email_subscriptions_updated_at ON email_subscriptions;
CREATE TRIGGER update_email_subscriptions_updated_at 
    BEFORE UPDATE ON email_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscription_analytics_updated_at ON subscription_analytics;
CREATE TRIGGER update_subscription_analytics_updated_at 
    BEFORE UPDATE ON subscription_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get subscription statistics
CREATE OR REPLACE FUNCTION get_subscription_stats()
RETURNS TABLE(
    total_subscriptions BIGINT,
    active_subscriptions BIGINT,
    unsubscribed_count BIGINT,
    pending_count BIGINT,
    bounced_count BIGINT,
    growth_today BIGINT,
    growth_this_week BIGINT,
    growth_this_month BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'active') as active,
            COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed,
            COUNT(*) FILTER (WHERE status = 'pending') as pending,
            COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
            COUNT(*) FILTER (WHERE DATE(subscribed_at) = CURRENT_DATE) as today,
            COUNT(*) FILTER (WHERE subscribed_at >= CURRENT_DATE - INTERVAL '7 days') as week,
            COUNT(*) FILTER (WHERE subscribed_at >= CURRENT_DATE - INTERVAL '30 days') as month
        FROM email_subscriptions
    )
    SELECT 
        s.total,
        s.active, 
        s.unsubscribed,
        s.pending,
        s.bounced,
        s.today,
        s.week,
        s.month
    FROM stats s;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely unsubscribe with logging
CREATE OR REPLACE FUNCTION safe_unsubscribe(
    p_email TEXT,
    p_reason VARCHAR(50) DEFAULT 'other',
    p_feedback TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_subscription_record RECORD;
    v_updated BOOLEAN := FALSE;
BEGIN
    -- Find the subscription
    SELECT * INTO v_subscription_record 
    FROM email_subscriptions 
    WHERE email = LOWER(TRIM(p_email)) AND status = 'active';
    
    IF FOUND THEN
        -- Update subscription status
        UPDATE email_subscriptions 
        SET 
            status = 'unsubscribed',
            unsubscribed_at = NOW()
        WHERE id = v_subscription_record.id;
        
        -- Log the unsubscription
        INSERT INTO unsubscription_logs (
            subscription_id,
            email,
            reason,
            feedback,
            ip_address,
            user_agent,
            referrer
        ) VALUES (
            v_subscription_record.id,
            v_subscription_record.email,
            p_reason,
            p_feedback,
            p_ip_address,
            p_user_agent,
            p_referrer
        );
        
        v_updated := TRUE;
    END IF;
    
    RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========== STEP 5: CREATE VIEWS ===========

-- Fixed subscription overview analytics view (Security: Authenticated users only)
CREATE OR REPLACE VIEW v_subscription_overview 
WITH (security_barrier=true) AS
WITH daily_stats AS (
    -- Main aggregation by date, source, and status
    SELECT 
        DATE_TRUNC('day', subscribed_at) as date,
        source,
        status,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE confirmed_at IS NOT NULL) as confirmed_count
    FROM email_subscriptions
    GROUP BY DATE_TRUNC('day', subscribed_at), source, status
),
tag_popularity AS (
    -- Calculate tag popularity for each date/source/status combination
    SELECT 
        DATE_TRUNC('day', subscribed_at) as date,
        source,
        status,
        tag,
        COUNT(*) as tag_count
    FROM email_subscriptions,
         LATERAL unnest(
             CASE 
                 WHEN tags IS NULL OR tags = '{}' THEN ARRAY[]::TEXT[]
                 ELSE tags 
             END
         ) AS tag
    GROUP BY DATE_TRUNC('day', subscribed_at), source, status, tag
),
top_tags AS (
    -- Get top 10 tags for each date/source/status combination
    SELECT 
        date,
        source,
        status,
        ARRAY_AGG(tag ORDER BY tag_count DESC) as popular_tags
    FROM (
        SELECT 
            date,
            source,
            status,
            tag,
            tag_count,
            ROW_NUMBER() OVER (
                PARTITION BY date, source, status 
                ORDER BY tag_count DESC, tag
            ) as rn
        FROM tag_popularity
    ) ranked_tags
    WHERE rn <= 10
    GROUP BY date, source, status
)
-- Final result combining daily stats with popular tags
SELECT 
    ds.date,
    ds.source,
    ds.status,
    ds.count,
    ds.confirmed_count,
    COALESCE(tt.popular_tags, ARRAY[]::TEXT[]) as popular_tags
FROM daily_stats ds
LEFT JOIN top_tags tt ON (
    ds.date = tt.date 
    AND ds.source = tt.source 
    AND ds.status = tt.status
)
ORDER BY ds.date DESC, ds.source, ds.status;

-- Recent subscription activity view (Security: Only for authenticated admin users)
-- Drop existing view first to avoid column naming conflicts
DROP VIEW IF EXISTS v_recent_activity;

CREATE VIEW v_recent_activity 
WITH (security_barrier=true) AS
SELECT 
    id,
    CASE 
        WHEN auth.role() = 'service_role' THEN email
        ELSE LEFT(email, 3) || '***@' || SPLIT_PART(email, '@', 2)
    END as masked_email,
    status,
    source,
    tags,
    subscribed_at,
    confirmed_at,
    unsubscribed_at,
    CASE 
        WHEN auth.role() = 'service_role' THEN 
            COALESCE(metadata->>'ip', ip_address::text)
        ELSE '***masked***'
    END as ip,
    CASE 
        WHEN auth.role() = 'service_role' THEN 
            COALESCE(metadata->>'userAgent', user_agent)
        ELSE '***masked***'
    END as user_agent
FROM email_subscriptions
WHERE auth.role() IN ('service_role', 'authenticated')
ORDER BY subscribed_at DESC
LIMIT 100;

-- =========== STEP 6: ENABLE ROW LEVEL SECURITY ===========

ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE unsubscription_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (use CREATE OR REPLACE or handle existing policies)
DROP POLICY IF EXISTS "Public read access for stats" ON email_subscriptions;
CREATE POLICY "Public read access for stats" ON email_subscriptions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access" ON email_subscriptions;
CREATE POLICY "Service role full access" ON email_subscriptions
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Anonymous can insert subscriptions" ON email_subscriptions;
CREATE POLICY "Anonymous can insert subscriptions" ON email_subscriptions
    FOR INSERT WITH CHECK (auth.role() = 'anon' OR auth.role() = 'authenticated');

-- Unsubscription logs policies
DROP POLICY IF EXISTS "Service role access to unsubscription logs" ON unsubscription_logs;
CREATE POLICY "Service role access to unsubscription logs" ON unsubscription_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Analytics policies  
DROP POLICY IF EXISTS "Authenticated users can read analytics" ON subscription_analytics;
CREATE POLICY "Authenticated users can read analytics" ON subscription_analytics
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- =========== STEP 7: GRANT PERMISSIONS ===========

-- Grant function permissions
GRANT EXECUTE ON FUNCTION get_subscription_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION safe_unsubscribe(TEXT, VARCHAR, TEXT, INET, TEXT, TEXT) TO anon, authenticated;

-- Grant view permissions - Restricted access
-- Only service_role and authenticated users can access analytics
GRANT SELECT ON v_subscription_overview TO authenticated, service_role;

-- v_recent_activity has built-in role checking, but still restrict grants
GRANT SELECT ON v_recent_activity TO authenticated, service_role;

-- Revoke public access to views
REVOKE SELECT ON v_subscription_overview FROM anon, public;
REVOKE SELECT ON v_recent_activity FROM anon, public;

-- =========== VERIFICATION ===========

-- Verify table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('email_subscriptions', 'unsubscription_logs', 'subscription_analytics')
ORDER BY table_name, ordinal_position;

-- Test the stats function
SELECT * FROM get_subscription_stats();

-- Show recent activity
SELECT * FROM v_recent_activity LIMIT 5;

COMMENT ON TABLE email_subscriptions IS 'Enhanced email subscription system with full tracking and analytics';
COMMENT ON TABLE unsubscription_logs IS 'Detailed logging of all unsubscription events with reasons';
COMMENT ON TABLE subscription_analytics IS 'Aggregated analytics data for reporting and insights';