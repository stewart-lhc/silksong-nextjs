-- Fix Row Level Security Policies for Email Subscriptions
-- This file contains the SQL commands to fix RLS policy violations

-- =============================================================================
-- SECTION 1: TABLE STRUCTURE VERIFICATION AND CREATION
-- =============================================================================

-- Ensure the email_subscriptions table exists with correct structure
CREATE TABLE IF NOT EXISTS public.email_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email 
ON public.email_subscriptions(email);

CREATE INDEX IF NOT EXISTS idx_email_subscriptions_subscribed_at 
ON public.email_subscriptions(subscribed_at);

-- =============================================================================
-- SECTION 2: ROW LEVEL SECURITY CONFIGURATION
-- =============================================================================

-- Enable RLS on the table
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts (this is safe to run multiple times)
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.email_subscriptions;
DROP POLICY IF EXISTS "Service role can read all" ON public.email_subscriptions;
DROP POLICY IF EXISTS "Public read access for subscriptions" ON public.email_subscriptions;
DROP POLICY IF EXISTS "Anonymous users can insert subscriptions" ON public.email_subscriptions;
DROP POLICY IF EXISTS "Authenticated users can read own subscriptions" ON public.email_subscriptions;
DROP POLICY IF EXISTS "Service role full access" ON public.email_subscriptions;

-- =============================================================================
-- SECTION 3: CREATE NEW RLS POLICIES
-- =============================================================================

-- Policy 1: Allow anonymous users to INSERT email subscriptions
-- This is the key policy that was missing and causing the violations
CREATE POLICY "Allow anonymous subscription inserts" 
ON public.email_subscriptions
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Policy 2: Service role (API routes) can perform all operations
-- This allows your API routes to manage subscriptions
CREATE POLICY "Service role full access" 
ON public.email_subscriptions
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 3: Allow public read access for subscription counts
-- This enables getting subscription counts without authentication
CREATE POLICY "Public read access for counts" 
ON public.email_subscriptions
FOR SELECT 
TO anon, authenticated
USING (true);

-- =============================================================================
-- SECTION 4: GRANT NECESSARY PERMISSIONS
-- =============================================================================

-- Grant necessary permissions to anon role (anonymous users)
GRANT INSERT ON public.email_subscriptions TO anon;
GRANT SELECT ON public.email_subscriptions TO anon;

-- Grant permissions to authenticated users
GRANT INSERT ON public.email_subscriptions TO authenticated;
GRANT SELECT ON public.email_subscriptions TO authenticated;

-- Grant full permissions to service_role (for API routes)
GRANT ALL ON public.email_subscriptions TO service_role;

-- Grant usage on the sequence (for UUID generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- =============================================================================
-- SECTION 5: CREATE HELPER FUNCTIONS (OPTIONAL)
-- =============================================================================

-- Function to get subscription count (already exists based on types, but ensuring it's accessible)
CREATE OR REPLACE FUNCTION public.get_subscription_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM public.email_subscriptions;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_subscription_count() TO anon, authenticated, service_role;

-- =============================================================================
-- SECTION 6: TEST THE CONFIGURATION
-- =============================================================================

-- Test query to verify RLS policies work (run this after applying the above)
-- This should work without authentication errors:
-- SELECT get_subscription_count();

-- =============================================================================
-- VERIFICATION QUERIES (Optional - for debugging)
-- =============================================================================

-- Check current RLS status
-- SELECT schemaname, tablename, rowsecurity, enablerls 
-- FROM pg_tables 
-- WHERE tablename = 'email_subscriptions';

-- View current policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename = 'email_subscriptions';

-- Check permissions
-- SELECT grantee, privilege_type 
-- FROM information_schema.table_privileges 
-- WHERE table_name = 'email_subscriptions';