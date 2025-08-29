// Check database schema
const { createClient } = require('@supabase/supabase-js');

async function checkSchema() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
  );

  try {
    // Check if email_subscriptions table exists
    const { data, error } = await supabase
      .from('email_subscriptions')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Table email_subscriptions does not exist or has error:', error.message);
      return;
    }

    console.log('✅ Table email_subscriptions exists');
    
    // Get table info
    if (data && data.length > 0) {
      console.log('📊 Sample record structure:', Object.keys(data[0]));
      console.log('📈 Sample data:', data[0]);
    }

    // Check count
    const { count, error: countError } = await supabase
      .from('email_subscriptions')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`📊 Total records: ${count}`);
    }

  } catch (error) {
    console.error('❌ Database check error:', error);
  }
}

checkSchema();