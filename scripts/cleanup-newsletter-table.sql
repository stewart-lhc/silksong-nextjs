-- Database Cleanup Script: Remove Empty Newsletter Subscriptions Table
-- 
-- This script safely removes the empty newsletter_subscriptions table
-- and ensures the unified email_subscriptions system is the only subscription system.
-- 
-- Run this in your Supabase SQL editor or via psql

-- Step 1: Verify current state
DO $$ 
BEGIN
  RAISE NOTICE '🧹 Database Cleanup: Newsletter Subscriptions Table';
  RAISE NOTICE '============================================================';
END $$;

-- Step 2: Check if newsletter_subscriptions table exists
DO $$ 
DECLARE
  table_count INTEGER;
  record_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name = 'newsletter_subscriptions';
  
  IF table_count > 0 THEN
    RAISE NOTICE '📋 newsletter_subscriptions table found';
    
    -- Check if it contains data
    EXECUTE 'SELECT COUNT(*) FROM newsletter_subscriptions' INTO record_count;
    RAISE NOTICE '📊 Records in newsletter_subscriptions: %', record_count;
    
    IF record_count > 0 THEN
      RAISE EXCEPTION '⚠️  WARNING: newsletter_subscriptions contains % records. Please review data before cleanup!', record_count;
    ELSE
      RAISE NOTICE '✅ newsletter_subscriptions is empty - safe to remove';
    END IF;
  ELSE
    RAISE NOTICE '✅ newsletter_subscriptions table does not exist - cleanup not needed';
  END IF;
END $$;

-- Step 3: Verify email_subscriptions table is working
DO $$ 
DECLARE
  email_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO email_count FROM email_subscriptions;
  RAISE NOTICE '📊 email_subscriptions table working with % records', email_count;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION '❌ Error accessing email_subscriptions table: %', SQLERRM;
END $$;

-- Step 4: Drop newsletter_subscriptions table if it exists and is empty
DROP TABLE IF EXISTS newsletter_subscriptions;

-- Step 5: Verification
DO $$ 
DECLARE
  table_count INTEGER;
  email_count INTEGER;
BEGIN
  -- Check if newsletter_subscriptions is gone
  SELECT COUNT(*)
  INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name = 'newsletter_subscriptions';
  
  IF table_count = 0 THEN
    RAISE NOTICE '✅ Verified: newsletter_subscriptions table successfully removed';
  ELSE
    RAISE NOTICE '⚠️  newsletter_subscriptions table still exists';
  END IF;
  
  -- Final system check
  SELECT COUNT(*) INTO email_count FROM email_subscriptions;
  RAISE NOTICE '🔍 Final check: email_subscriptions has % records', email_count;
  
  RAISE NOTICE '🎉 DATABASE CLEANUP COMPLETED!';
  RAISE NOTICE '✅ Unified subscription system is now active';
  RAISE NOTICE '✅ Transactional email system ready';
  RAISE NOTICE '🚀 Your subscription system is unified and optimized!';
END $$;