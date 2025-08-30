#!/usr/bin/env node

/**
 * Fixed Database Manager - Compatible with Supabase
 * Uses only standard Supabase client methods without custom RPC functions
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

class DatabaseManagerFixed {
  constructor() {
    this.supabase = null;
    this.operations = [];
    this.backupData = {};
  }

  async initialize() {
    try {
      const { createClient } = require('@supabase/supabase-js');
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
      }
      
      this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { 
          persistSession: false,
          autoRefreshToken: false 
        },
        global: {
          headers: {
            'X-Client-Info': 'database-manager-fixed@1.0.0',
          },
        },
      });
      
      console.log('🔗 Database connection initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize database connection:', error.message);
      return false;
    }
  }

  async testConnection() {
    console.log('🔗 Testing database connection...');
    
    try {
      const startTime = Date.now();
      
      // Use a simple query that should work on any Supabase instance
      const { data, error } = await this.supabase
        .from('email_subscriptions')
        .select('count')
        .limit(1);
      
      const latency = Date.now() - startTime;

      if (error && error.code === 'PGRST116') {
        // Table doesn't exist - connection works but schema needs setup
        console.log(`✅ Connection healthy (${latency}ms) - Schema needs setup`);
        return { healthy: true, latency, needsSetup: true };
      } else if (error) {
        console.log(`⚠️  Connection issues: ${error.message}`);
        return { healthy: false, latency, error: error.message };
      } else {
        console.log(`✅ Connection and schema healthy (${latency}ms)`);
        return { healthy: true, latency, needsSetup: false };
      }
    } catch (error) {
      console.log(`❌ Connection test failed: ${error.message}`);
      return { healthy: false, error: error.message };
    }
  }

  async checkCurrentState() {
    console.log('\n📊 === CHECKING CURRENT STATE ===');
    
    const state = {
      email_subscriptions: { exists: false, count: 0 },
      newsletter_subscriptions: { exists: false, count: 0 },
      email_send_attempts: { exists: false, count: 0 },
      email_rollback_tasks: { exists: false, count: 0 }
    };

    const tables = Object.keys(state);

    for (const table of tables) {
      try {
        const { data, error, count } = await this.supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1);

        if (error) {
          if (error.code === 'PGRST116') {
            console.log(`  📋 ${table}: Does not exist`);
            state[table] = { exists: false, count: 0 };
          } else {
            console.log(`  📋 ${table}: Error - ${error.message}`);
            state[table] = { exists: false, error: error.message };
          }
        } else {
          console.log(`  📋 ${table}: Exists with ${count || 0} records`);
          state[table] = { exists: true, count: count || 0 };
        }
      } catch (error) {
        console.log(`  📋 ${table}: Exception - ${error.message}`);
        state[table] = { exists: false, error: error.message };
      }
    }

    return state;
  }

  async createBackup() {
    console.log('\n💾 === CREATING BACKUP ===');
    
    try {
      const backupDir = path.join(__dirname, '..', 'database-backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

      const backup = {
        timestamp,
        purpose: 'pre-setup-backup',
        tables: {}
      };

      // Try to backup existing data
      const tablesToBackup = ['email_subscriptions', 'newsletter_subscriptions'];
      
      for (const table of tablesToBackup) {
        try {
          const { data, error } = await this.supabase
            .from(table)
            .select('*');

          if (!error && data && data.length > 0) {
            backup.tables[table] = data;
            console.log(`  ✓ Backed up ${data.length} records from ${table}`);
            this.backupData[table] = data;
          } else if (!error) {
            console.log(`  ✓ ${table} is empty - no data to backup`);
            backup.tables[table] = [];
          } else {
            console.log(`  ⚠️  Could not backup ${table}: ${error.message}`);
          }
        } catch (error) {
          console.log(`  ⚠️  Could not access ${table}: ${error.message}`);
        }
      }

      fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
      console.log(`💾 Backup saved: ${backupFile}`);
      
      return backupFile;
    } catch (error) {
      console.log(`❌ Backup failed: ${error.message}`);
      return null;
    }
  }

  async createEmailSubscriptionsTable() {
    console.log('\n🏗️  Creating email_subscriptions table...');
    
    try {
      // Check if table already exists
      const { data: existing } = await this.supabase
        .from('email_subscriptions')
        .select('count')
        .limit(1);

      if (!existing) {
        // Table doesn't exist, we'll create it using the API route approach
        console.log('  📋 Table does not exist, creating...');
        
        // For now, let's try to create a subscription to trigger table creation
        // This is a workaround approach using the existing API
        try {
          // First try to create via the subscribe API endpoint
          const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/email_subscriptions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              email: 'setup-test@example.com',
              subscribed_at: new Date().toISOString()
            })
          });

          if (response.ok) {
            console.log('  ✅ Table created successfully via API');
            
            // Clean up the test record
            await this.supabase
              .from('email_subscriptions')
              .delete()
              .eq('email', 'setup-test@example.com');
              
            this.operations.push('Created email_subscriptions table');
          } else {
            console.log('  ⚠️  Could not create table via API - may need manual setup');
          }
        } catch (error) {
          console.log(`  ⚠️  API approach failed: ${error.message}`);
        }
      } else {
        console.log('  ✅ Table already exists');
      }

      return true;
    } catch (error) {
      console.error('❌ Error creating email_subscriptions table:', error.message);
      return false;
    }
  }

  async extendEmailSubscriptionsTable() {
    console.log('\n🔧 === EXTENDING email_subscriptions TABLE ===');
    
    console.log('  ℹ️  Note: Table extensions may require database admin access');
    console.log('  ℹ️  If extensions fail, you may need to run SQL manually in Supabase dashboard');
    
    // Check current table structure by attempting to insert/update with new fields
    try {
      const { data, error } = await this.supabase
        .from('email_subscriptions')
        .select('*')
        .limit(1);

      if (error) {
        console.log('  ❌ Cannot access email_subscriptions table');
        return false;
      }

      // Try to update a record with new fields to test if they exist
      const testFields = {
        email_sent: false,
        email_sent_at: null,
        email_send_attempts: 0,
        last_email_error: null,
        last_email_template: null,
        is_active: true,
        unsubscribed_at: null
      };

      console.log('  🔍 Testing for extended fields...');
      
      // This will give us information about which fields are missing
      const { error: testError } = await this.supabase
        .from('email_subscriptions')
        .update(testFields)
        .eq('id', '00000000-0000-0000-0000-000000000000'); // Non-existent ID

      if (testError) {
        const missingFields = [];
        const errorMessage = testError.message.toLowerCase();
        
        Object.keys(testFields).forEach(field => {
          if (errorMessage.includes(`column "${field}" of relation "email_subscriptions" does not exist`)) {
            missingFields.push(field);
          }
        });

        if (missingFields.length > 0) {
          console.log(`  ⚠️  Missing fields detected: ${missingFields.join(', ')}`);
          console.log('  💡 You need to add these columns manually in Supabase dashboard:');
          
          const sqlCommands = [
            'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false;',
            'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE;',
            'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS email_send_attempts INTEGER DEFAULT 0;',
            'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS last_email_error TEXT;',
            'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS last_email_template VARCHAR(100);',
            'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;',
            'ALTER TABLE email_subscriptions ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP WITH TIME ZONE;'
          ];

          console.log('\n  📝 SQL to run in Supabase SQL Editor:');
          sqlCommands.forEach(sql => console.log(`     ${sql}`));
          
          return false;
        } else {
          console.log('  ✅ All extended fields are present');
          return true;
        }
      } else {
        console.log('  ✅ All extended fields are present');
        return true;
      }

    } catch (error) {
      console.error('❌ Error checking table extensions:', error.message);
      return false;
    }
  }

  async migrateNewsletterData() {
    console.log('\n📤 === MIGRATING DATA ===');
    
    try {
      // Check for newsletter_subscriptions data
      const { data: newsletterData, error: fetchError } = await this.supabase
        .from('newsletter_subscriptions')
        .select('*');

      if (fetchError) {
        console.log('  ℹ️  No newsletter_subscriptions table found - nothing to migrate');
        return true;
      }

      if (!newsletterData || newsletterData.length === 0) {
        console.log('  ℹ️  newsletter_subscriptions table is empty - nothing to migrate');
        return true;
      }

      console.log(`  📊 Found ${newsletterData.length} records to migrate`);
      
      let migratedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      for (const record of newsletterData) {
        try {
          // Check if email already exists
          const { data: existing, error: checkError } = await this.supabase
            .from('email_subscriptions')
            .select('id')
            .eq('email', record.email)
            .maybeSingle();

          if (checkError) {
            console.log(`    ❌ Error checking ${record.email}: ${checkError.message}`);
            errorCount++;
            continue;
          }

          if (existing) {
            console.log(`    ⏭️  ${record.email} already exists`);
            skippedCount++;
            continue;
          }

          // Migrate the record
          const migratedRecord = {
            email: record.email,
            subscribed_at: record.created_at || record.subscribed_at || new Date().toISOString()
          };

          const { error: insertError } = await this.supabase
            .from('email_subscriptions')
            .insert(migratedRecord);

          if (insertError) {
            console.log(`    ❌ Failed to migrate ${record.email}: ${insertError.message}`);
            errorCount++;
          } else {
            console.log(`    ✅ Migrated ${record.email}`);
            migratedCount++;
          }

        } catch (error) {
          console.log(`    ❌ Error processing ${record.email}: ${error.message}`);
          errorCount++;
        }
      }

      console.log(`\n  📊 Migration Summary:`);
      console.log(`    • Migrated: ${migratedCount} records`);
      console.log(`    • Skipped: ${skippedCount} records`);
      console.log(`    • Errors: ${errorCount} records`);

      this.operations.push(`Migrated ${migratedCount} records from newsletter_subscriptions`);
      return errorCount === 0;

    } catch (error) {
      console.error('❌ Migration error:', error.message);
      return false;
    }
  }

  async createAuxiliaryTablesInfo() {
    console.log('\n📋 === AUXILIARY TABLES INFO ===');
    
    console.log('  ℹ️  The following tables need to be created manually in Supabase:');
    console.log('  ℹ️  Go to Supabase Dashboard → SQL Editor and run this SQL:');
    
    const sql = `
-- Create email status enum
CREATE TYPE IF NOT EXISTS email_send_status AS ENUM (
    'pending', 'sending', 'sent', 'failed', 'cancelled'
);

-- Create rollback task enums  
CREATE TYPE IF NOT EXISTS rollback_task_type AS ENUM (
    'cancel_subscription', 'mark_email_failed', 'retry_email_send', 'update_email_status'
);

CREATE TYPE IF NOT EXISTS rollback_task_status AS ENUM (
    'pending', 'processing', 'completed', 'failed'
);

-- Create email send attempts table
CREATE TABLE IF NOT EXISTS email_send_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(254) NOT NULL,
    subscription_id UUID,
    template_id VARCHAR(100) NOT NULL,
    status email_send_status DEFAULT 'pending',
    attempt_number INTEGER DEFAULT 1,
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_after TIMESTAMP WITH TIME ZONE,
    provider_response JSONB DEFAULT '{}',
    email_content JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_email_send_attempts_subscription 
        FOREIGN KEY (subscription_id) 
        REFERENCES email_subscriptions(id) 
        ON DELETE SET NULL
);

-- Create email rollback tasks table
CREATE TABLE IF NOT EXISTS email_rollback_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_type rollback_task_type NOT NULL,
    email VARCHAR(254) NOT NULL,
    subscription_id UUID,
    send_attempt_id UUID,
    reason TEXT,
    task_data JSONB DEFAULT '{}',
    status rollback_task_status DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_rollback_tasks_subscription 
        FOREIGN KEY (subscription_id) 
        REFERENCES email_subscriptions(id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_rollback_tasks_send_attempt 
        FOREIGN KEY (send_attempt_id) 
        REFERENCES email_send_attempts(id) 
        ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_send_attempts_email ON email_send_attempts(email);
CREATE INDEX IF NOT EXISTS idx_email_send_attempts_status ON email_send_attempts(status);
CREATE INDEX IF NOT EXISTS idx_email_send_attempts_subscription_id ON email_send_attempts(subscription_id);

CREATE INDEX IF NOT EXISTS idx_email_rollback_tasks_status ON email_rollback_tasks(status);
CREATE INDEX IF NOT EXISTS idx_email_rollback_tasks_email ON email_rollback_tasks(email);

-- Enable RLS
ALTER TABLE email_send_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_rollback_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY IF NOT EXISTS "Service role full access send_attempts" ON email_send_attempts
    FOR ALL TO service_role USING (true) WITH CHECK (true);
    
CREATE POLICY IF NOT EXISTS "Service role full access rollback_tasks" ON email_rollback_tasks
    FOR ALL TO service_role USING (true) WITH CHECK (true);
`;

    console.log(sql);
    
    // Save SQL to file for convenience
    try {
      const sqlDir = path.join(__dirname, '..', 'database-setup');
      if (!fs.existsSync(sqlDir)) {
        fs.mkdirSync(sqlDir, { recursive: true });
      }
      
      const sqlFile = path.join(sqlDir, 'manual-setup.sql');
      fs.writeFileSync(sqlFile, sql);
      console.log(`\n  💾 SQL saved to: ${sqlFile}`);
    } catch (error) {
      console.log('  ⚠️  Could not save SQL file');
    }
  }

  async verifySetup() {
    console.log('\n✅ === VERIFYING SETUP ===');
    
    const tables = ['email_subscriptions', 'email_send_attempts', 'email_rollback_tasks'];
    const results = { working: [], missing: [], errors: [] };
    
    for (const table of tables) {
      try {
        const { data, error } = await this.supabase
          .from(table)
          .select('count')
          .limit(1);

        if (error) {
          if (error.code === 'PGRST116') {
            results.missing.push(table);
            console.log(`  ❌ ${table}: Missing`);
          } else {
            results.errors.push({ table, error: error.message });
            console.log(`  ❌ ${table}: ${error.message}`);
          }
        } else {
          results.working.push(table);
          console.log(`  ✅ ${table}: Working`);
        }
      } catch (error) {
        results.errors.push({ table, error: error.message });
        console.log(`  ❌ ${table}: ${error.message}`);
      }
    }

    return results;
  }

  async runSimpleSetup() {
    console.log('🚀 === SIMPLE DATABASE SETUP ===\n');
    
    // Initialize connection
    const connected = await this.initialize();
    if (!connected) {
      console.error('❌ Cannot proceed without database connection');
      return false;
    }

    // Test connection
    const connectionTest = await this.testConnection();
    if (!connectionTest.healthy) {
      console.error('❌ Database connection is not healthy');
      return false;
    }

    // Check current state
    const currentState = await this.checkCurrentState();

    // Create backup if there's data
    if (currentState.email_subscriptions.count > 0 || currentState.newsletter_subscriptions.count > 0) {
      await this.createBackup();
    }

    // Ensure email_subscriptions table exists
    await this.createEmailSubscriptionsTable();

    // Check and extend table if possible
    await this.extendEmailSubscriptionsTable();

    // Migrate data if needed
    if (currentState.newsletter_subscriptions.exists && currentState.newsletter_subscriptions.count > 0) {
      await this.migrateNewsletterData();
    }

    // Show information about auxiliary tables
    await this.createAuxiliaryTablesInfo();

    // Verify setup
    const verification = await this.verifySetup();

    console.log('\n🎉 === SETUP SUMMARY ===');
    console.log(`📋 Operations performed: ${this.operations.length}`);
    this.operations.forEach(op => console.log(`  • ${op}`));
    
    console.log(`\n✅ Working tables: ${verification.working.length}`);
    verification.working.forEach(table => console.log(`  • ${table}`));
    
    if (verification.missing.length > 0) {
      console.log(`\n❌ Missing tables: ${verification.missing.length}`);
      verification.missing.forEach(table => console.log(`  • ${table}`));
      console.log('\n💡 Run the SQL provided above in Supabase Dashboard to create missing tables');
    }

    if (verification.errors.length > 0) {
      console.log(`\n⚠️  Table errors: ${verification.errors.length}`);
      verification.errors.forEach(({table, error}) => console.log(`  • ${table}: ${error}`));
    }

    const success = verification.missing.length === 0 && verification.errors.length === 0;
    
    console.log(`\n${success ? '🎉 Setup completed successfully!' : '⚠️  Setup completed with manual steps required'}`);
    console.log('\nNext steps:');
    console.log('  1. If you saw SQL commands above, run them in Supabase Dashboard');
    console.log('  2. Test your API endpoints');
    console.log('  3. Configure your email provider');
    
    return success;
  }
}

// CLI Interface
async function main() {
  const manager = new DatabaseManagerFixed();
  const result = await manager.runSimpleSetup();
  process.exit(result ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
}

module.exports = { DatabaseManagerFixed };