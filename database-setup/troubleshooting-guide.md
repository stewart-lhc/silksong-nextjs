# RLS Policy Troubleshooting Guide for Email Subscriptions

## Problem Analysis

The error "new row violates row-level security policy for table email_subscriptions" occurs because:

1. **RLS is enabled** on the `email_subscriptions` table
2. **No policies exist** to allow anonymous users to INSERT records
3. **Your API route uses the anon role** when inserting subscriptions
4. **The anon role is blocked** by the default RLS behavior (deny all)

## Root Cause

Based on the codebase analysis:
- The subscription API route at `/app/api/subscribe/route.ts` uses the regular Supabase client
- The regular client uses the `anon` role with the `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- RLS is enabled but missing the policy to allow `anon` role to INSERT

## Solution Steps

### Step 1: Apply the Quick Fix (IMMEDIATE)

Run this SQL in your Supabase Dashboard → SQL Editor:

```sql
-- Allow anonymous users to insert email subscriptions
CREATE POLICY "anonymous_insert_subscriptions" 
ON public.email_subscriptions
FOR INSERT 
TO anon
WITH CHECK (true);

-- Allow public reads for subscription counts
CREATE POLICY "public_read_subscriptions" 
ON public.email_subscriptions
FOR SELECT 
TO anon, authenticated
USING (true);

-- Grant necessary permissions
GRANT INSERT ON public.email_subscriptions TO anon;
GRANT SELECT ON public.email_subscriptions TO anon;
```

### Step 2: Verify the Fix

Test the API endpoint:
```bash
curl -X POST http://localhost:3000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Successfully subscribed!",
  "subscription": {
    "id": "uuid-here",
    "email": "test@example.com",
    "subscribed_at": "timestamp"
  }
}
```

### Step 3: Complete Setup (RECOMMENDED)

For a production-ready setup, run the complete SQL script at:
`database-setup/fix-rls-policies.sql`

## Alternative Solutions

### Option A: Use Service Role (More Secure)

Modify your API route to use the admin client for inserts:

```typescript
// In /app/api/subscribe/route.ts
import { supabaseAdmin } from '@/lib/supabase/client';

// Replace line 185:
const insertClient = supabaseAdmin || supabase;
```

This requires setting `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local`

### Option B: Temporarily Disable RLS (NOT RECOMMENDED)

```sql
-- Only for development/testing
ALTER TABLE public.email_subscriptions DISABLE ROW LEVEL SECURITY;
```

**Warning**: Never use this in production!

## Verification Commands

### Check RLS Status
```sql
SELECT schemaname, tablename, rowsecurity, enablerls 
FROM pg_tables 
WHERE tablename = 'email_subscriptions';
```

### View Current Policies
```sql
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'email_subscriptions';
```

### Test Permissions
```sql
-- This should work after the fix
SELECT COUNT(*) FROM public.email_subscriptions;
```

## Common Issues After Fix

### Issue 1: Still Getting RLS Errors
- **Cause**: Old policy names conflicting
- **Fix**: Drop all policies first, then recreate

### Issue 2: 403 Forbidden Errors
- **Cause**: Missing GRANT permissions
- **Fix**: Run the GRANT statements from the SQL script

### Issue 3: Policies Not Applied
- **Cause**: Wrong role in policy definition
- **Fix**: Ensure policies specify `TO anon` correctly

## Database Configuration Checklist

- [ ] Table `email_subscriptions` exists
- [ ] RLS is enabled on the table
- [ ] INSERT policy for `anon` role exists
- [ ] SELECT policy for public access exists
- [ ] Proper GRANT permissions are set
- [ ] Unique constraint on email column exists
- [ ] Default values and indexes are configured

## Testing the Complete Setup

Run the database verification script:
```bash
node scripts/verify-database.js
```

Expected output:
- ✅ Table exists and is accessible
- ✅ Insert successful  
- ✅ Unique constraint working
- ✅ Cleanup successful
- ✅ RLS policies are working

## Environment Variables Check

Ensure these are set in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Optional but recommended
```

## Security Best Practices

1. **Use specific policies**: Don't use `WITH CHECK (true)` for everything
2. **Validate on API side**: Always validate input in your API routes
3. **Rate limiting**: Implement rate limiting (already in your code)
4. **Monitor usage**: Set up logging and monitoring
5. **Regular audits**: Periodically review your RLS policies

## Need Help?

If you're still experiencing issues after following this guide:

1. Check the Supabase logs in Dashboard → Logs
2. Enable query logging to see exactly what's failing
3. Verify your environment variables are loaded correctly
4. Test with the service role key to isolate RLS vs connection issues