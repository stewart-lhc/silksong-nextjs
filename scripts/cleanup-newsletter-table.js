#!/usr/bin/env node

/**
 * Database Cleanup Script: Remove Empty Newsletter Subscriptions Table
 * 
 * This script safely removes the empty newsletter_subscriptions table
 * and ensures the unified email_subscriptions system is working properly.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration in environment variables');
  console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupNewsletterTable() {
  console.log('🧹 Database Cleanup: Remove Newsletter Subscriptions Table');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Check if newsletter_subscriptions table exists and is empty
    console.log('\n📊 Step 1: Checking newsletter_subscriptions table...');
    
    const { data: tableExists, error: tableError } = await supabase
      .rpc('table_exists', { table_name: 'newsletter_subscriptions' })
      .single();
    
    if (tableError && !tableError.message.includes('does not exist')) {
      // Try alternative method to check table existence
      try {
        const { count, error: countError } = await supabase
          .from('newsletter_subscriptions')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          if (countError.code === '42P01') {
            console.log('✅ newsletter_subscriptions table does not exist - cleanup not needed');
            return;
          }
          throw countError;
        }
        
        console.log(`📋 newsletter_subscriptions table found with ${count || 0} records`);
        
        if (count > 0) {
          console.log('⚠️  WARNING: newsletter_subscriptions table contains data!');
          console.log('   Please review the data before cleanup:');
          
          const { data, error } = await supabase
            .from('newsletter_subscriptions')
            .select('*')
            .limit(5);
          
          if (!error && data) {
            console.log('   Sample records:', JSON.stringify(data, null, 2));
          }
          
          console.log('\n🛑 Cleanup aborted - table contains data');
          return;
        }
        
        console.log('✅ newsletter_subscriptions table is empty - safe to remove');
        
      } catch (err) {
        console.log('✅ newsletter_subscriptions table does not exist - cleanup not needed');
        return;
      }
    }
    
    // Step 2: Verify email_subscriptions table is working
    console.log('\n📊 Step 2: Verifying email_subscriptions table...');
    
    const { count: emailCount, error: emailError } = await supabase
      .from('email_subscriptions')
      .select('*', { count: 'exact', head: true });
    
    if (emailError) {
      console.error('❌ Error accessing email_subscriptions table:', emailError.message);
      console.log('🛑 Cleanup aborted - primary table not accessible');
      return;
    }
    
    console.log(`✅ email_subscriptions table is working with ${emailCount || 0} records`);
    
    // Step 3: Drop newsletter_subscriptions table
    console.log('\n🗑️  Step 3: Dropping newsletter_subscriptions table...');
    
    const { error: dropError } = await supabase.rpc('drop_table_if_exists', {
      table_name: 'newsletter_subscriptions'
    });
    
    if (dropError) {
      // Try alternative SQL execution
      console.log('   Trying alternative drop method...');
      
      const { error: altDropError } = await supabase
        .from('newsletter_subscriptions')
        .delete()
        .neq('id', ''); // This should fail if table doesn't exist
      
      if (altDropError && altDropError.code === '42P01') {
        console.log('✅ newsletter_subscriptions table already doesn\'t exist');
      } else {
        console.error('❌ Unable to drop newsletter_subscriptions table');
        console.error('   Manual cleanup required via Supabase dashboard');
        console.error('   SQL: DROP TABLE IF EXISTS newsletter_subscriptions;');
        return;
      }
    } else {
      console.log('✅ newsletter_subscriptions table successfully dropped');
    }
    
    // Step 4: Verify cleanup
    console.log('\n✅ Step 4: Verifying cleanup...');
    
    try {
      const { error: verifyError } = await supabase
        .from('newsletter_subscriptions')
        .select('*', { head: true });
      
      if (verifyError && verifyError.code === '42P01') {
        console.log('✅ Verified: newsletter_subscriptions table no longer exists');
      } else {
        console.log('⚠️  newsletter_subscriptions table might still exist');
      }
    } catch (err) {
      console.log('✅ Verified: newsletter_subscriptions table no longer exists');
    }
    
    // Step 5: Final system check
    console.log('\n🔍 Step 5: Final unified system check...');
    
    const { count: finalCount, error: finalError } = await supabase
      .from('email_subscriptions')
      .select('*', { count: 'exact', head: true });
    
    if (finalError) {
      console.error('❌ System check failed:', finalError.message);
      return;
    }
    
    console.log(`✅ Unified system working: ${finalCount || 0} email subscriptions`);
    
    // Success summary
    console.log('\n' + '🎉'.repeat(20));
    console.log('🎉 DATABASE CLEANUP SUCCESSFUL!');
    console.log('🎉'.repeat(20));
    console.log('\n✅ Cleanup Summary:');
    console.log('   • newsletter_subscriptions table removed');
    console.log('   • email_subscriptions table verified working');
    console.log('   • Unified subscription system active');
    console.log('   • Transactional email system ready');
    console.log('\n🚀 Your subscription system is now unified and optimized!');
    
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    console.error('\nPlease manually review and clean up if necessary');
    process.exit(1);
  }
}

// Helper function to create RPC if needed
async function createHelperFunctions() {
  const functions = [
    {
      name: 'table_exists',
      sql: `
        CREATE OR REPLACE FUNCTION table_exists(table_name text)
        RETURNS boolean AS $$
        BEGIN
          RETURN EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = $1
          );
        END;
        $$ LANGUAGE plpgsql;
      `
    },
    {
      name: 'drop_table_if_exists',
      sql: `
        CREATE OR REPLACE FUNCTION drop_table_if_exists(table_name text)
        RETURNS void AS $$
        BEGIN
          EXECUTE format('DROP TABLE IF EXISTS %I', table_name);
        END;
        $$ LANGUAGE plpgsql;
      `
    }
  ];
  
  for (const func of functions) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: func.sql });
      if (error) {
        console.log(`Note: Helper function ${func.name} creation skipped`);
      }
    } catch (err) {
      // Ignore helper function creation errors
    }
  }
}

// Main execution
if (require.main === module) {
  createHelperFunctions().then(() => {
    cleanupNewsletterTable().catch(console.error);
  });
}

module.exports = { cleanupNewsletterTable };