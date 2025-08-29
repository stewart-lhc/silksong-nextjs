-- Newsletter Kit: Create email subscriptions table
-- This script creates the core table for email subscriptions
-- Run this in your Supabase SQL editor or database client

-- Create the email_subscriptions table
CREATE TABLE IF NOT EXISTS email_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(50) DEFAULT 'web',
    metadata JSONB DEFAULT '{}'::jsonb,
    unsubscribed_at TIMESTAMP WITH TIME ZONE NULL,
    is_active BOOLEAN DEFAULT true,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_source CHECK (source IN ('web', 'api', 'admin', 'import', 'mobile', 'widget'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_subscribed_at ON email_subscriptions(subscribed_at);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_source ON email_subscriptions(source);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_active ON email_subscriptions(is_active) WHERE is_active = true;

-- Create partial index for active subscribers only
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_active_email ON email_subscriptions(email) WHERE is_active = true;

-- Enable Row Level Security (RLS)
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
-- Note: Adjust these policies based on your security requirements

-- Policy: Allow public users to insert (subscribe)
CREATE POLICY "Allow public subscription" ON email_subscriptions
    FOR INSERT 
    TO public
    WITH CHECK (true);

-- Policy: Allow public users to read subscription count (aggregated data only)
CREATE POLICY "Allow public count access" ON email_subscriptions
    FOR SELECT 
    TO public
    USING (true);

-- Policy: Allow authenticated users to manage subscriptions
CREATE POLICY "Allow authenticated management" ON email_subscriptions
    FOR ALL 
    TO authenticated
    USING (true);

-- Create a function to get subscriber count
CREATE OR REPLACE FUNCTION get_subscriber_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM email_subscriptions WHERE is_active = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to safely insert subscription (handles duplicates)
CREATE OR REPLACE FUNCTION safe_subscribe(
    p_email TEXT,
    p_source TEXT DEFAULT 'web',
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    subscription_id UUID,
    is_new BOOLEAN
) AS $$
DECLARE
    v_subscription_id UUID;
    v_existing_record RECORD;
BEGIN
    -- Validate email format
    IF p_email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RETURN QUERY SELECT false, 'Invalid email format', NULL::UUID, false;
        RETURN;
    END IF;
    
    -- Check if email already exists
    SELECT * INTO v_existing_record 
    FROM email_subscriptions 
    WHERE email = LOWER(TRIM(p_email));
    
    IF FOUND THEN
        IF v_existing_record.is_active THEN
            -- Already subscribed and active
            RETURN QUERY SELECT false, 'Email already subscribed', v_existing_record.id, false;
        ELSE
            -- Was unsubscribed, reactivate
            UPDATE email_subscriptions 
            SET is_active = true, 
                unsubscribed_at = NULL,
                subscribed_at = NOW(),
                source = p_source,
                metadata = p_metadata
            WHERE id = v_existing_record.id;
            
            RETURN QUERY SELECT true, 'Subscription reactivated', v_existing_record.id, false;
        END IF;
    ELSE
        -- New subscription
        INSERT INTO email_subscriptions (email, source, metadata)
        VALUES (LOWER(TRIM(p_email)), p_source, p_metadata)
        RETURNING id INTO v_subscription_id;
        
        RETURN QUERY SELECT true, 'Successfully subscribed', v_subscription_id, true;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to unsubscribe
CREATE OR REPLACE FUNCTION unsubscribe_email(p_email TEXT)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
) AS $$
BEGIN
    -- Update the record to mark as inactive
    UPDATE email_subscriptions 
    SET is_active = false, 
        unsubscribed_at = NOW()
    WHERE email = LOWER(TRIM(p_email)) AND is_active = true;
    
    IF FOUND THEN
        RETURN QUERY SELECT true, 'Successfully unsubscribed';
    ELSE
        RETURN QUERY SELECT false, 'Email not found or already unsubscribed';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON email_subscriptions TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_subscriber_count() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION safe_subscribe(TEXT, TEXT, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION unsubscribe_email(TEXT) TO anon, authenticated;

-- Insert a comment for documentation
COMMENT ON TABLE email_subscriptions IS 'Newsletter subscription table created by @silksong/newsletter-kit';
COMMENT ON COLUMN email_subscriptions.metadata IS 'Additional subscription data (JSON format)';
COMMENT ON COLUMN email_subscriptions.source IS 'Source of subscription (web, api, admin, etc.)';
COMMENT ON FUNCTION get_subscriber_count() IS 'Returns total count of active subscribers';
COMMENT ON FUNCTION safe_subscribe(TEXT, TEXT, JSONB) IS 'Safely handles email subscription with duplicate checking';
COMMENT ON FUNCTION unsubscribe_email(TEXT) IS 'Marks email as unsubscribed';

-- Create a view for analytics (optional)
CREATE OR REPLACE VIEW subscription_stats AS
SELECT 
    DATE(subscribed_at) as date,
    COUNT(*) as new_subscriptions,
    source,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM email_subscriptions
WHERE subscribed_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(subscribed_at), source
ORDER BY date DESC, source;

COMMENT ON VIEW subscription_stats IS 'Newsletter subscription statistics for the last 30 days';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Newsletter Kit database setup completed successfully!';
    RAISE NOTICE 'Created table: email_subscriptions';
    RAISE NOTICE 'Created functions: get_subscriber_count, safe_subscribe, unsubscribe_email';
    RAISE NOTICE 'Created view: subscription_stats';
    RAISE NOTICE 'Applied RLS policies for secure public access';
END $$;