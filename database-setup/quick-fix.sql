-- QUICK FIX: RLS Policy for Email Subscriptions
-- Run this in your Supabase SQL Editor to immediately fix the issue

-- Step 1: Allow anonymous inserts (this is the main fix)
CREATE POLICY "anonymous_insert_subscriptions" 
ON public.email_subscriptions
FOR INSERT 
TO anon
WITH CHECK (true);

-- Step 2: Allow public reads for counts
CREATE POLICY "public_read_subscriptions" 
ON public.email_subscriptions
FOR SELECT 
TO anon, authenticated
USING (true);

-- Step 3: Grant necessary permissions
GRANT INSERT ON public.email_subscriptions TO anon;
GRANT SELECT ON public.email_subscriptions TO anon;