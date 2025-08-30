#!/usr/bin/env node

/**
 * Simple Database Status Check
 * Compatible with all Supabase instances - no custom functions required
 */

require('dotenv').config({ path: '.env.local' });

class SimpleDBChecker {
  constructor() {
    this.supabase = null;
  }

  async initialize() {
    try {
      const { createClient } = require('@supabase/supabase-js');
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
      }
      
      this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
      });
      
      return true;
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      return false;
    }
  }

  async checkTable(tableName, required = true) {
    try {
      const startTime = Date.now();
      const { data, error, count } = await this.supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(1);
      
      const latency = Date.now() - startTime;

      if (error) {
        if (error.code === 'PGRST116') {
          const status = required ? '❌ MISSING (Required)' : '⚠️  Missing (Optional)';
          console.log(`  ${tableName.padEnd(25)} ${status}`);
          return { exists: false, required, count: 0, latency };
        } else {
          console.log(`  ${tableName.padEnd(25)} ❌ Error: ${error.message}`);
          return { exists: false, error: error.message, latency };
        }
      } else {
        console.log(`  ${tableName.padEnd(25)} ✅ OK (${count || 0} records, ${latency}ms)`);
        return { exists: true, count: count || 0, latency };
      }
    } catch (error) {
      console.log(`  ${tableName.padEnd(25)} ❌ Exception: ${error.message}`);
      return { exists: false, error: error.message };
    }
  }

  async testConnection() {
    console.log('🔗 Testing database connection...');
    
    try {
      const startTime = Date.now();
      
      // Try the most basic query possible
      const { data, error } = await this.supabase
        .from('email_subscriptions')
        .select('count')
        .limit(0); // Don't return any data, just test the connection
      
      const latency = Date.now() - startTime;

      if (error && error.code === 'PGRST116') {
        console.log(`✅ Connection healthy (${latency}ms) - Database accessible`);
        return { healthy: true, latency, message: 'Connected but schema needs setup' };
      } else if (error) {
        console.log(`⚠️  Connection issues: ${error.message}`);
        return { healthy: false, latency, error: error.message };
      } else {
        console.log(`✅ Connection and schema healthy (${latency}ms)`);
        return { healthy: true, latency, message: 'Fully connected' };
      }
    } catch (error) {
      console.log(`❌ Connection test failed: ${error.message}`);
      return { healthy: false, error: error.message };
    }
  }

  async runCheck() {
    console.log('🔍 === SIMPLE DATABASE STATUS CHECK ===\n');
    
    const initialized = await this.initialize();
    if (!initialized) {
      console.log('❌ Cannot proceed without initialization');
      return false;
    }

    // Test connection
    const connectionResult = await this.testConnection();
    
    console.log('\n📋 Checking table status...');
    
    // Check core tables
    const tables = [
      { name: 'email_subscriptions', required: true },
      { name: 'email_send_attempts', required: true },
      { name: 'email_rollback_tasks', required: true },
      { name: 'newsletter_subscriptions', required: false }
    ];

    const results = {};
    let criticalIssues = 0;
    let totalRecords = 0;

    for (const { name, required } of tables) {
      const result = await this.checkTable(name, required);
      results[name] = result;
      
      if (required && !result.exists) {
        criticalIssues++;
      }
      
      if (result.count) {
        totalRecords += result.count;
      }
    }

    // Summary
    console.log('\n📊 === SUMMARY ===');
    console.log(`🔗 Connection: ${connectionResult.healthy ? '✅ Healthy' : '❌ Issues'} (${connectionResult.latency || 0}ms)`);
    console.log(`📋 Tables: ${Object.values(results).filter(r => r.exists).length}/${tables.length} accessible`);
    console.log(`📈 Total Records: ${totalRecords.toLocaleString()}`);
    console.log(`🚨 Critical Issues: ${criticalIssues}`);

    if (criticalIssues > 0) {
      console.log('\n❌ CRITICAL ISSUES FOUND:');
      tables.forEach(({ name, required }) => {
        if (required && !results[name].exists) {
          console.log(`  • Missing required table: ${name}`);
        }
      });
      
      console.log('\n💡 NEXT STEPS:');
      console.log('  1. Run: npm run db:setup');
      console.log('  2. Or use: node scripts/database-manager-fixed.js');
      console.log('  3. Follow the SQL instructions provided');
    } else {
      console.log('\n✅ Database appears healthy!');
      
      if (results.newsletter_subscriptions?.exists && results.newsletter_subscriptions?.count > 0) {
        console.log('\n💡 RECOMMENDATION:');
        console.log(`  • ${results.newsletter_subscriptions.count} records in legacy newsletter_subscriptions`);
        console.log('  • Consider migrating with: npm run db:migrate');
      }
    }

    // Migration info
    if (results.newsletter_subscriptions?.exists && results.newsletter_subscriptions?.count > 0) {
      console.log('\n📤 MIGRATION OPPORTUNITY:');
      console.log(`  • Found ${results.newsletter_subscriptions.count} records in newsletter_subscriptions`);
      console.log('  • Run: npm run db:migrate to move them to email_subscriptions');
    }

    console.log('\n📚 For detailed setup instructions, see: DATABASE-QUICK-START.md');
    
    return criticalIssues === 0;
  }
}

// CLI Interface
async function main() {
  const checker = new SimpleDBChecker();
  const healthy = await checker.runCheck();
  process.exit(healthy ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Check failed:', error);
    process.exit(1);
  });
}

module.exports = { SimpleDBChecker };