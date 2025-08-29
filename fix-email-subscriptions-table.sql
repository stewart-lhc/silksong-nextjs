-- Fix email_subscriptions table - Add missing columns
-- Run this in your Supabase SQL Editor

-- Add missing columns to email_subscriptions table
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
ADD COLUMN IF NOT EXISTS unsubscribe_token VARCHAR(255) DEFAULT gen_random_uuid();

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS ip_address INET;

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS user_agent TEXT;

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE email_subscriptions 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_status ON email_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_source ON email_subscriptions(source);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_subscribed_at ON email_subscriptions(subscribed_at);

-- Add RLS (Row Level Security) policies if needed
-- ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Update existing records to have proper status
UPDATE email_subscriptions 
SET status = 'active', 
    created_at = subscribed_at,
    updated_at = subscribed_at
WHERE status IS NULL;

-- Show final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'email_subscriptions'
ORDER BY ordinal_position;