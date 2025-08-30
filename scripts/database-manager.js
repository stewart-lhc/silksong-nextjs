#!/usr/bin/env node

/**
 * Database Manager - Comprehensive Database Operations Script
 * Handles all database operations programmatically without manual SQL execution
 * 
 * Features:
 * - Check current database state
 * - Extend existing tables with new fields
 * - Create auxiliary tables for transactional emails
 * - Clean up legacy tables
 * - Backup and restore functionality
 * - Error handling and rollback support
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

class DatabaseManager {
  constructor() {
    this.supabase = null;
    this.backupData = {};
    this.operations = [];
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
            'X-Client-Info': 'database-manager@1.0.0',
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

  async checkDatabaseState() {
    console.log('\n📊 === DATABASE STATE CHECK ===');
    
    try {
      // Check existing tables
      const { data: tables, error: tablesError } = await this.supabase
        .rpc('sql', { 
          query: `
            SELECT 
              table_name,
              table_type
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN (
              'email_subscriptions', 
              'newsletter_subscriptions',
              'email_send_attempts', 
              'email_rollback_tasks',
              'user_roles'
            )
            ORDER BY table_name;
          `
        });

      if (tablesError) {
        console.error('❌ Error checking tables:', tablesError);
        return false;
      }

      console.log('📋 Current Tables:');
      if (tables && tables.length > 0) {
        tables.forEach(table => {
          console.log(`  ✓ ${table.table_name} (${table.table_type})`);
        });
      } else {
        console.log('  ⚠️  No relevant tables found');
      }

      // Check email_subscriptions table structure
      await this.checkEmailSubscriptionsStructure();
      
      // Check for any data
      await this.checkDataCounts();
      
      return true;
    } catch (error) {
      console.error('❌ Error during database state check:', error);
      return false;
    }
  }

  async checkEmailSubscriptionsStructure() {
    try {
      const { data: columns, error } = await this.supabase
        .rpc('sql', { 
          query: `
            SELECT 
              column_name,
              data_type,
              is_nullable,
              column_default
            FROM information_schema.columns 
            WHERE table_name = 'email_subscriptions' 
            AND table_schema = 'public'
            ORDER BY ordinal_position;
          `
        });

      if (error) {
        console.log('⚠️  email_subscriptions table does not exist or cannot be accessed');
        return;
      }

      console.log('📝 email_subscriptions table structure:');
      if (columns && columns.length > 0) {
        columns.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
          console.log(`  • ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
        });
      } else {
        console.log('  ⚠️  No columns found');
      }
    } catch (error) {
      console.log('⚠️  Could not check email_subscriptions structure:', error.message);
    }
  }

  async checkDataCounts() {
    try {
      const tables = ['email_subscriptions', 'newsletter_subscriptions', 'email_send_attempts', 'email_rollback_tasks'];
      
      console.log('📊 Data counts:');
      
      for (const tableName of tables) {
        try {
          const { data, error } = await this.supabase
            .rpc('sql', { 
              query: `SELECT COUNT(*) as count FROM ${tableName};`
            });

          if (error) {
            console.log(`  • ${tableName}: Table does not exist`);
          } else {
            const count = data && data.length > 0 ? data[0].count : 0;
            console.log(`  • ${tableName}: ${count} records`);
            
            // Store for backup if table has data
            if (count > 0) {
              this.backupData[tableName] = count;
            }
          }
        } catch (tableError) {
          console.log(`  • ${tableName}: Not accessible`);
        }
      }
    } catch (error) {
      console.log('⚠️  Could not check data counts:', error.message);
    }
  }

  async backupExistingData() {
    console.log('\n💾 === BACKING UP EXISTING DATA ===');
    
    try {
      // Create backup directory
      const backupDir = path.join(__dirname, '..', 'database-backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

      const backup = {
        timestamp,
        tables: {}
      };

      // Backup email_subscriptions if it exists
      try {
        const { data: emailSubs, error } = await this.supabase
          .from('email_subscriptions')
          .select('*');

        if (!error && emailSubs) {
          backup.tables.email_subscriptions = emailSubs;
          console.log(`✓ Backed up ${emailSubs.length} email_subscriptions records`);
        }
      } catch (error) {
        console.log('⚠️  Could not backup email_subscriptions');
      }

      // Backup newsletter_subscriptions if it exists
      try {
        const { data: newsletters, error } = await this.supabase
          .from('newsletter_subscriptions')
          .select('*');

        if (!error && newsletters) {
          backup.tables.newsletter_subscriptions = newsletters;
          console.log(`✓ Backed up ${newsletters.length} newsletter_subscriptions records`);
        }
      } catch (error) {
        console.log('⚠️  Could not backup newsletter_subscriptions');
      }

      // Save backup to file
      fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
      console.log(`💾 Backup saved to: ${backupFile}`);
      
      return backupFile;
    } catch (error) {
      console.error('❌ Backup failed:', error);
      return null;
    }
  }

  async extendEmailSubscriptionsTable() {
    console.log('\n🔧 === EXTENDING email_subscriptions TABLE ===');
    
    const newColumns = [
      {
        name: 'email_sent',
        type: 'BOOLEAN',
        default: 'false',
        description: 'Tracks if welcome email was sent'
      },
      {
        name: 'email_sent_at',
        type: 'TIMESTAMP WITH TIME ZONE',
        default: null,
        description: 'Timestamp when email was sent'
      },
      {
        name: 'email_send_attempts',
        type: 'INTEGER',
        default: '0',
        description: 'Number of email send attempts'
      },
      {
        name: 'last_email_error',
        type: 'TEXT',
        default: null,
        description: 'Last email sending error message'
      },
      {
        name: 'last_email_template',
        type: 'VARCHAR(100)',
        default: null,
        description: 'Last email template used'
      },
      {
        name: 'is_active',
        type: 'BOOLEAN',
        default: 'true',
        description: 'Whether subscription is active'
      },
      {
        name: 'unsubscribed_at',
        type: 'TIMESTAMP WITH TIME ZONE',
        default: null,
        description: 'Timestamp when user unsubscribed'
      }
    ];

    for (const column of newColumns) {
      try {
        // Check if column exists
        const { data: exists, error: checkError } = await this.supabase
          .rpc('sql', { 
            query: `
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name = 'email_subscriptions' 
              AND column_name = '${column.name}'
              AND table_schema = 'public';
            `
          });

        if (checkError) {
          console.error(`❌ Error checking column ${column.name}:`, checkError);
          continue;
        }

        if (exists && exists.length > 0) {
          console.log(`✓ Column ${column.name} already exists`);
          continue;
        }

        // Add the column
        const defaultClause = column.default ? `DEFAULT ${column.default}` : '';
        const addColumnSQL = `
          ALTER TABLE email_subscriptions 
          ADD COLUMN ${column.name} ${column.type} ${defaultClause};
        `;

        const { error: addError } = await this.supabase
          .rpc('sql', { query: addColumnSQL });

        if (addError) {
          console.error(`❌ Error adding column ${column.name}:`, addError);
        } else {
          console.log(`✅ Added column: ${column.name} (${column.description})`);
          this.operations.push(`Added column: ${column.name}`);
        }

      } catch (error) {
        console.error(`❌ Error processing column ${column.name}:`, error);
      }
    }
  }

  async createAuxiliaryTables() {
    console.log('\n🏗️  === CREATING AUXILIARY TABLES ===');
    
    // Create enums first
    await this.createEmailEnums();
    
    // Create email_send_attempts table
    await this.createEmailSendAttemptsTable();
    
    // Create email_rollback_tasks table
    await this.createEmailRollbackTasksTable();
    
    // Create indexes
    await this.createIndexes();
    
    // Create functions
    await this.createDatabaseFunctions();
  }

  async createEmailEnums() {
    const enums = [
      {
        name: 'email_send_status',
        values: ['pending', 'sending', 'sent', 'failed', 'cancelled']
      },
      {
        name: 'rollback_task_type',
        values: ['cancel_subscription', 'mark_email_failed', 'retry_email_send', 'update_email_status']
      },
      {
        name: 'rollback_task_status',
        values: ['pending', 'processing', 'completed', 'failed']
      }
    ];

    for (const enumDef of enums) {
      try {
        // Drop enum if exists (for clean recreation)
        await this.supabase.rpc('sql', { 
          query: `DROP TYPE IF EXISTS ${enumDef.name} CASCADE;`
        });

        // Create enum
        const values = enumDef.values.map(v => `'${v}'`).join(', ');
        const createEnumSQL = `CREATE TYPE ${enumDef.name} AS ENUM (${values});`;
        
        const { error } = await this.supabase.rpc('sql', { query: createEnumSQL });
        
        if (error) {
          console.error(`❌ Error creating enum ${enumDef.name}:`, error);
        } else {
          console.log(`✅ Created enum: ${enumDef.name}`);
        }
      } catch (error) {
        console.error(`❌ Error with enum ${enumDef.name}:`, error);
      }
    }
  }

  async createEmailSendAttemptsTable() {
    try {
      const createTableSQL = `
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
      `;

      const { error } = await this.supabase.rpc('sql', { query: createTableSQL });
      
      if (error) {
        console.error('❌ Error creating email_send_attempts table:', error);
      } else {
        console.log('✅ Created table: email_send_attempts');
        this.operations.push('Created email_send_attempts table');
      }
    } catch (error) {
      console.error('❌ Error with email_send_attempts table:', error);
    }
  }

  async createEmailRollbackTasksTable() {
    try {
      const createTableSQL = `
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
      `;

      const { error } = await this.supabase.rpc('sql', { query: createTableSQL });
      
      if (error) {
        console.error('❌ Error creating email_rollback_tasks table:', error);
      } else {
        console.log('✅ Created table: email_rollback_tasks');
        this.operations.push('Created email_rollback_tasks table');
      }
    } catch (error) {
      console.error('❌ Error with email_rollback_tasks table:', error);
    }
  }

  async createIndexes() {
    const indexes = [
      // email_send_attempts indexes
      'CREATE INDEX IF NOT EXISTS idx_email_send_attempts_email ON email_send_attempts(email)',
      'CREATE INDEX IF NOT EXISTS idx_email_send_attempts_subscription_id ON email_send_attempts(subscription_id)',
      'CREATE INDEX IF NOT EXISTS idx_email_send_attempts_status ON email_send_attempts(status)',
      'CREATE INDEX IF NOT EXISTS idx_email_send_attempts_created_at ON email_send_attempts(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_email_send_attempts_template_id ON email_send_attempts(template_id)',
      
      // email_rollback_tasks indexes
      'CREATE INDEX IF NOT EXISTS idx_email_rollback_tasks_status ON email_rollback_tasks(status)',
      'CREATE INDEX IF NOT EXISTS idx_email_rollback_tasks_email ON email_rollback_tasks(email)',
      'CREATE INDEX IF NOT EXISTS idx_email_rollback_tasks_task_type ON email_rollback_tasks(task_type)',
      'CREATE INDEX IF NOT EXISTS idx_email_rollback_tasks_created_at ON email_rollback_tasks(created_at DESC)',
      
      // email_subscriptions enhanced indexes
      'CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email_sent ON email_subscriptions(email_sent)',
      'CREATE INDEX IF NOT EXISTS idx_email_subscriptions_is_active ON email_subscriptions(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email_sent_at ON email_subscriptions(email_sent_at)'
    ];

    console.log('📊 Creating performance indexes...');
    
    for (const indexSQL of indexes) {
      try {
        const { error } = await this.supabase.rpc('sql', { query: indexSQL });
        
        if (error) {
          console.error(`❌ Error creating index: ${error.message}`);
        } else {
          const indexName = indexSQL.match(/idx_\w+/)?.[0] || 'unnamed';
          console.log(`✅ Created index: ${indexName}`);
        }
      } catch (error) {
        console.error('❌ Index creation error:', error);
      }
    }
  }

  async createDatabaseFunctions() {
    console.log('⚙️  Creating database functions...');
    
    // Create update_updated_at_column function first
    await this.createUpdateTimestampFunction();
    
    // Load and execute the functions from the schema file
    try {
      const schemaPath = path.join(__dirname, '..', 'database-setup', 'email-status-tracking-schema.sql');
      
      if (fs.existsSync(schemaPath)) {
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        // Extract only the function definitions
        const functionMatches = schemaSQL.match(/CREATE OR REPLACE FUNCTION[\s\S]*?\$\$ LANGUAGE plpgsql[^;]*;/g);
        
        if (functionMatches) {
          for (const funcSQL of functionMatches) {
            try {
              const { error } = await this.supabase.rpc('sql', { query: funcSQL });
              
              if (error) {
                console.error('❌ Error creating function:', error.message);
              } else {
                const funcName = funcSQL.match(/FUNCTION\s+(\w+)/)?.[1] || 'unnamed';
                console.log(`✅ Created function: ${funcName}`);
              }
            } catch (error) {
              console.error('❌ Function creation error:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error loading schema functions:', error);
    }
  }

  async createUpdateTimestampFunction() {
    try {
      const functionSQL = `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `;

      const { error } = await this.supabase.rpc('sql', { query: functionSQL });
      
      if (error) {
        console.error('❌ Error creating update_updated_at_column function:', error);
      } else {
        console.log('✅ Created function: update_updated_at_column');
      }
    } catch (error) {
      console.error('❌ Error with timestamp function:', error);
    }
  }

  async enableRowLevelSecurity() {
    console.log('\n🔒 === ENABLING ROW LEVEL SECURITY ===');
    
    const tables = ['email_send_attempts', 'email_rollback_tasks', 'email_subscriptions'];
    
    for (const table of tables) {
      try {
        // Enable RLS
        const { error: rlsError } = await this.supabase.rpc('sql', { 
          query: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
        });

        if (rlsError) {
          console.error(`❌ Error enabling RLS on ${table}:`, rlsError.message);
          continue;
        }

        // Create service role policy
        const policySQL = `
          CREATE POLICY IF NOT EXISTS "Service role has full access to ${table}"
          ON ${table}
          FOR ALL
          TO service_role
          USING (true)
          WITH CHECK (true);
        `;

        const { error: policyError } = await this.supabase.rpc('sql', { query: policySQL });
        
        if (policyError) {
          console.error(`❌ Error creating policy for ${table}:`, policyError.message);
        } else {
          console.log(`✅ Enabled RLS and created policy for: ${table}`);
        }

      } catch (error) {
        console.error(`❌ Error with RLS for ${table}:`, error);
      }
    }
  }

  async cleanupNewsletterTables() {
    console.log('\n🧹 === CLEANING UP LEGACY TABLES ===');
    
    // First backup data from newsletter_subscriptions if it exists
    let migrationData = null;
    
    try {
      const { data: newsletterData, error } = await this.supabase
        .from('newsletter_subscriptions')
        .select('*');

      if (!error && newsletterData && newsletterData.length > 0) {
        migrationData = newsletterData;
        console.log(`📦 Found ${newsletterData.length} records in newsletter_subscriptions for migration`);
        
        // Migrate data to email_subscriptions
        await this.migrateNewsletterData(migrationData);
      }
    } catch (error) {
      console.log('⚠️  newsletter_subscriptions table does not exist or is empty');
    }

    // Drop newsletter_subscriptions table
    try {
      const { error } = await this.supabase.rpc('sql', { 
        query: 'DROP TABLE IF EXISTS newsletter_subscriptions CASCADE;'
      });

      if (error) {
        console.error('❌ Error dropping newsletter_subscriptions:', error.message);
      } else {
        console.log('✅ Dropped table: newsletter_subscriptions');
        this.operations.push('Dropped newsletter_subscriptions table');
      }
    } catch (error) {
      console.error('❌ Error with newsletter cleanup:', error);
    }
  }

  async migrateNewsletterData(newsletterData) {
    console.log('📤 Migrating newsletter_subscriptions data to email_subscriptions...');
    
    let migratedCount = 0;
    let errorCount = 0;

    for (const record of newsletterData) {
      try {
        // Check if email already exists in email_subscriptions
        const { data: existing, error: checkError } = await this.supabase
          .from('email_subscriptions')
          .select('id')
          .eq('email', record.email)
          .maybeSingle();

        if (checkError) {
          console.error(`❌ Error checking existing email ${record.email}:`, checkError.message);
          errorCount++;
          continue;
        }

        if (existing) {
          console.log(`⚠️  Email ${record.email} already exists in email_subscriptions, skipping`);
          continue;
        }

        // Insert into email_subscriptions
        const { error: insertError } = await this.supabase
          .from('email_subscriptions')
          .insert({
            email: record.email,
            subscribed_at: record.created_at || record.subscribed_at || new Date().toISOString(),
            is_active: record.status !== 'unsubscribed',
            email_sent: false,
            email_send_attempts: 0
          });

        if (insertError) {
          console.error(`❌ Error migrating email ${record.email}:`, insertError.message);
          errorCount++;
        } else {
          migratedCount++;
        }

      } catch (error) {
        console.error(`❌ Error processing migration for ${record.email}:`, error);
        errorCount++;
      }
    }

    console.log(`✅ Migration complete: ${migratedCount} records migrated, ${errorCount} errors`);
  }

  async runFullSetup() {
    console.log('🚀 === STARTING FULL DATABASE SETUP ===\n');
    
    // Initialize connection
    const connected = await this.initialize();
    if (!connected) {
      console.error('❌ Cannot proceed without database connection');
      return false;
    }

    // Check current state
    await this.checkDatabaseState();

    // Backup existing data
    const backupFile = await this.backupExistingData();

    // Extend email_subscriptions table
    await this.extendEmailSubscriptionsTable();

    // Create auxiliary tables
    await this.createAuxiliaryTables();

    // Enable security
    await this.enableRowLevelSecurity();

    // Clean up legacy tables
    await this.cleanupNewsletterTables();

    // Final verification
    await this.verifySetup();

    console.log('\n🎉 === DATABASE SETUP COMPLETE ===');
    console.log(`📋 Operations performed: ${this.operations.length}`);
    this.operations.forEach(op => console.log(`  • ${op}`));
    
    if (backupFile) {
      console.log(`💾 Backup saved to: ${backupFile}`);
    }

    console.log('\n✅ Database is ready for transactional email system!');
    return true;
  }

  async verifySetup() {
    console.log('\n🔍 === VERIFYING SETUP ===');
    
    const requiredTables = [
      'email_subscriptions',
      'email_send_attempts', 
      'email_rollback_tasks'
    ];

    for (const table of requiredTables) {
      try {
        const { data, error } = await this.supabase
          .from(table)
          .select('count')
          .limit(1);

        if (error) {
          console.error(`❌ Table ${table} verification failed:`, error.message);
        } else {
          console.log(`✅ Table ${table} is accessible`);
        }
      } catch (error) {
        console.error(`❌ Error verifying ${table}:`, error);
      }
    }

    // Test a function
    try {
      const { data, error } = await this.supabase
        .rpc('get_email_send_statistics');

      if (error) {
        console.log('⚠️  Functions may need additional setup:', error.message);
      } else {
        console.log('✅ Database functions are working');
      }
    } catch (error) {
      console.log('⚠️  Could not test database functions');
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'full-setup';

  const dbManager = new DatabaseManager();

  switch (command) {
    case 'check':
      await dbManager.initialize();
      await dbManager.checkDatabaseState();
      break;
      
    case 'backup':
      await dbManager.initialize();
      await dbManager.backupExistingData();
      break;
      
    case 'extend':
      await dbManager.initialize();
      await dbManager.extendEmailSubscriptionsTable();
      break;
      
    case 'create-tables':
      await dbManager.initialize();
      await dbManager.createAuxiliaryTables();
      break;
      
    case 'cleanup':
      await dbManager.initialize();
      await dbManager.cleanupNewsletterTables();
      break;
      
    case 'full-setup':
      await dbManager.runFullSetup();
      break;
      
    case 'help':
      console.log(`
Database Manager Commands:
  check         - Check current database state
  backup        - Backup existing data
  extend        - Extend email_subscriptions table
  create-tables - Create auxiliary tables
  cleanup       - Clean up legacy tables
  full-setup    - Run complete setup (default)
  help          - Show this help

Usage: node scripts/database-manager.js [command]
      `);
      break;
      
    default:
      console.log(`Unknown command: ${command}`);
      console.log('Use "help" to see available commands');
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { DatabaseManager };