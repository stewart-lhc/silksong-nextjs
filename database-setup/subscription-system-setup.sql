-- Email Subscription System Database Setup
-- Compatible with PostgreSQL/Supabase
-- Can be adapted for other databases

-- Drop existing objects if they exist (for clean reinstall)
DROP FUNCTION IF EXISTS get_subscription_count();
DROP FUNCTION IF EXISTS subscribe_email(text, text, jsonb);
DROP FUNCTION IF EXISTS unsubscribe_email(text);
DROP TABLE IF EXISTS email_subscriptions CASCADE;
DROP TYPE IF EXISTS subscription_source;

-- Create enum for subscription sources
CREATE TYPE subscription_source AS ENUM ('web', 'api', 'import', 'mobile', 'widget');

-- Create the main email_subscriptions table
CREATE TABLE email_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(254) NOT NULL UNIQUE,
    source subscription_source DEFAULT 'web',
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX idx_email_subscriptions_active ON email_subscriptions(is_active);
CREATE INDEX idx_email_subscriptions_subscribed_at ON email_subscriptions(subscribed_at DESC);
CREATE INDEX idx_email_subscriptions_source ON email_subscriptions(source);
CREATE INDEX idx_email_subscriptions_metadata ON email_subscriptions USING gin(metadata);

-- Add constraints
ALTER TABLE email_subscriptions 
ADD CONSTRAINT check_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Create function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_email_subscriptions_updated_at 
    BEFORE UPDATE ON email_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get active subscription count
CREATE OR REPLACE FUNCTION get_subscription_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM email_subscriptions WHERE is_active = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to subscribe an email with metadata
CREATE OR REPLACE FUNCTION subscribe_email(
    p_email TEXT,
    p_source TEXT DEFAULT 'web',
    p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE(
    subscription_id UUID,
    email_address TEXT,
    subscription_source subscription_source,
    subscribed_timestamp TIMESTAMP WITH TIME ZONE,
    was_reactivated BOOLEAN
) AS $$
DECLARE
    v_source subscription_source;
    v_existing_record RECORD;
    v_was_reactivated BOOLEAN := FALSE;
BEGIN
    -- Validate and cast source
    v_source := p_source::subscription_source;
    
    -- Normalize email
    p_email := LOWER(TRIM(p_email));
    
    -- Check if email already exists
    SELECT * INTO v_existing_record 
    FROM email_subscriptions 
    WHERE email = p_email;
    
    IF FOUND THEN
        -- If exists but inactive, reactivate
        IF NOT v_existing_record.is_active THEN
            UPDATE email_subscriptions 
            SET 
                is_active = true,
                source = v_source,
                metadata = p_metadata,
                subscribed_at = NOW(),
                unsubscribed_at = NULL
            WHERE email = p_email
            RETURNING id, email, source, subscribed_at 
            INTO subscription_id, email_address, subscription_source, subscribed_timestamp;
            
            v_was_reactivated := TRUE;
        ELSE
            -- Already active, return existing record
            SELECT 
                v_existing_record.id,
                v_existing_record.email,
                v_existing_record.source,
                v_existing_record.subscribed_at
            INTO subscription_id, email_address, subscription_source, subscribed_timestamp;
        END IF;
    ELSE
        -- Insert new subscription
        INSERT INTO email_subscriptions (email, source, metadata)
        VALUES (p_email, v_source, p_metadata)
        RETURNING id, email, source, subscribed_at
        INTO subscription_id, email_address, subscription_source, subscribed_timestamp;
    END IF;
    
    RETURN QUERY SELECT 
        subscription_id,
        email_address,
        subscription_source,
        subscribed_timestamp,
        v_was_reactivated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unsubscribe an email
CREATE OR REPLACE FUNCTION unsubscribe_email(p_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    -- Normalize email
    p_email := LOWER(TRIM(p_email));
    
    -- Update the subscription to inactive
    UPDATE email_subscriptions 
    SET 
        is_active = false,
        unsubscribed_at = NOW()
    WHERE email = p_email AND is_active = true;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    RETURN v_updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create analytics view for subscription metrics
CREATE OR REPLACE VIEW subscription_analytics AS
SELECT 
    DATE_TRUNC('day', subscribed_at) as date,
    source,
    COUNT(*) as subscriptions,
    COUNT(*) FILTER (WHERE is_active) as active_subscriptions,
    COUNT(*) FILTER (WHERE NOT is_active) as inactive_subscriptions
FROM email_subscriptions
GROUP BY DATE_TRUNC('day', subscribed_at), source
ORDER BY date DESC, source;

-- Grant permissions (adjust based on your RLS policies)
-- These are examples - modify according to your security requirements

-- For public access to count function
GRANT EXECUTE ON FUNCTION get_subscription_count() TO anon, authenticated;

-- For API access to subscription functions  
GRANT EXECUTE ON FUNCTION subscribe_email(TEXT, TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION unsubscribe_email(TEXT) TO anon, authenticated;

-- Grant select on analytics view to authenticated users
GRANT SELECT ON subscription_analytics TO authenticated;

-- Row Level Security (RLS) policies
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read subscription count (for public counter)
CREATE POLICY "Anyone can read subscription count" ON email_subscriptions
    FOR SELECT USING (true);

-- Policy: Service role can do everything
CREATE POLICY "Service role has full access" ON email_subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Policy: Authenticated users can insert subscriptions
CREATE POLICY "Authenticated users can insert subscriptions" ON email_subscriptions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Insert some sample data for testing (optional)
-- INSERT INTO email_subscriptions (email, source, metadata) VALUES
-- ('test1@example.com', 'web', '{"test": true}'),
-- ('test2@example.com', 'api', '{"source_app": "mobile"}');

-- Create indexes for better query performance on metadata
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_metadata_source 
ON email_subscriptions USING gin((metadata->>'source_app'));

-- Add comment to table
COMMENT ON TABLE email_subscriptions IS 'Email subscription system table - stores all email subscriptions with metadata and status tracking';
COMMENT ON COLUMN email_subscriptions.email IS 'Email address - unique and normalized to lowercase';
COMMENT ON COLUMN email_subscriptions.source IS 'Source of subscription (web, api, import, mobile, widget)';
COMMENT ON COLUMN email_subscriptions.metadata IS 'JSON metadata for storing additional information like user agent, referrer, etc.';
COMMENT ON COLUMN email_subscriptions.is_active IS 'Whether the subscription is currently active';
COMMENT ON COLUMN email_subscriptions.subscribed_at IS 'When the user first subscribed or reactivated';
COMMENT ON COLUMN email_subscriptions.unsubscribed_at IS 'When the user unsubscribed (null if never unsubscribed)';

-- Verification query to test setup
-- Run this after setup to verify everything works:
/*
-- Test the functions
SELECT get_subscription_count();
SELECT * FROM subscribe_email('test@example.com', 'web', '{"test": true}');
SELECT get_subscription_count();
SELECT unsubscribe_email('test@example.com');
SELECT get_subscription_count();

-- View analytics
SELECT * FROM subscription_analytics LIMIT 10;
*/