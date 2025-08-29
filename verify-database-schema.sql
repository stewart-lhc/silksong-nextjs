-- Verify email_subscriptions table structure after migration
-- Run this in Supabase SQL Editor to confirm all fields exist

-- 1. Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'email_subscriptions'
ORDER BY ordinal_position;

-- 2. Check indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'email_subscriptions';

-- 3. Check existing data
SELECT 
    id,
    email,
    status,
    source,
    subscribed_at,
    metadata,
    created_at
FROM email_subscriptions 
ORDER BY subscribed_at DESC 
LIMIT 5;

-- 4. Test insert with new structure (optional test)
/*
INSERT INTO email_subscriptions (
    email, 
    status, 
    source, 
    metadata,
    tags
) VALUES (
    'test-migration@example.com',
    'active',
    'migration-test',
    '{"test": true}',
    ARRAY['test', 'migration']
);
*/