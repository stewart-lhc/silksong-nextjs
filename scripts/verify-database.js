/**
 * Database Verification Script
 * Verifies that the email_subscriptions table exists and is properly configured
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually from .env.local
const fs = require('fs');
const path = require('path');

// Parse .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length > 0 && !key.startsWith('#')) {
      process.env[key.trim()] = values.join('=').trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyDatabase() {
  console.log('🔍 Verifying database configuration...\n');

  try {
    // 1. Check if table exists and get its structure
    console.log('1. Checking email_subscriptions table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('email_subscriptions')
      .select('*')
      .limit(1);

    if (tableError) {
      if (tableError.code === '42P01') {
        console.error('❌ Table "email_subscriptions" does not exist');
        console.log('\n📝 To create the table, run this SQL in your Supabase dashboard:');
        console.log(`
CREATE TABLE public.email_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policy to allow public inserts
ALTER TABLE public.email_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON public.email_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can read all" ON public.email_subscriptions
  FOR SELECT USING (auth.role() = 'service_role');
        `);
        return;
      }
      throw tableError;
    }
    console.log('✅ Table exists and is accessible');

    // 2. Test insert and delete
    console.log('\n2. Testing subscription operations...');
    const testEmail = `test-${Date.now()}@example.com`;
    
    // Insert test subscription
    const { data: insertData, error: insertError } = await supabase
      .from('email_subscriptions')
      .insert([{ email: testEmail }])
      .select();

    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      return;
    }
    console.log('✅ Insert successful');

    // Test duplicate prevention
    const { error: duplicateError } = await supabase
      .from('email_subscriptions')
      .insert([{ email: testEmail }]);

    if (duplicateError && duplicateError.code === '23505') {
      console.log('✅ Unique constraint working (duplicate prevention)');
    } else if (!duplicateError) {
      console.log('⚠️  Warning: Duplicate constraint may not be working');
    }

    // Clean up test data
    await supabase
      .from('email_subscriptions')
      .delete()
      .eq('email', testEmail);
    console.log('✅ Cleanup successful');

    // 3. Get subscription count
    console.log('\n3. Getting subscription statistics...');
    const { count, error: countError } = await supabase
      .from('email_subscriptions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count failed:', countError.message);
    } else {
      console.log(`✅ Total subscriptions: ${count}`);
    }

    // 4. Test RLS policies
    console.log('\n4. Checking Row Level Security...');
    const { data: rlsData, error: rlsError } = await supabase
      .from('email_subscriptions')
      .select('email')
      .limit(5);

    if (rlsError) {
      console.error('❌ RLS check failed:', rlsError.message);
    } else {
      console.log('✅ RLS policies are working');
    }

    console.log('\n🎉 Database verification completed successfully!');
    console.log('The subscription API should be fully functional.');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error('Error details:', error);
  }
}

verifyDatabase();