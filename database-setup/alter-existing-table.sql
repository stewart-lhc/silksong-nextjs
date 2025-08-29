-- ALTER existing email_subscriptions table to match our code requirements
-- This script safely adds missing columns without losing existing data

-- Add missing columns one by one
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
ADD COLUMN IF NOT EXISTS unsubscribe_token VARCHAR(255) DEFAULT gen_random_uuid();

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

-- Update existing records to have proper values
UPDATE email_subscriptions 
SET 
    status = 'active',
    source = 'web',
    metadata = '{}',
    tags = '{}',
    created_at = subscribed_at,
    updated_at = subscribed_at,
    unsubscribe_token = gen_random_uuid()
WHERE status IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_status ON email_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_source ON email_subscriptions(source);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_subscribed_at ON email_subscriptions(subscribed_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_metadata ON email_subscriptions USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_tags ON email_subscriptions USING gin(tags);

-- Create function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at (DROP first to avoid conflicts)
DROP TRIGGER IF EXISTS update_email_subscriptions_updated_at ON email_subscriptions;
CREATE TRIGGER update_email_subscriptions_updated_at 
    BEFORE UPDATE ON email_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the final structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'email_subscriptions'
ORDER BY ordinal_position;