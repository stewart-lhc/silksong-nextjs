#!/usr/bin/env node

/**
 * Database Repair Script
 * Automated repair and optimization for database issues
 * Handles data migration, orphaned records, and schema fixes
 */

require('dotenv').config({ path: '.env.local' });
const path = require('path');
const fs = require('fs');

class DatabaseRepair {
  constructor() {
    this.supabase = null;
    this.repairLog = [];
    this.backupData = {};
  }

  async initialize() {
    try {
      const { createClient } = require('@supabase/supabase-js');
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing environment variables');
      }
      
      this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
      });
      
      console.log('🔧 Database repair tools initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize repair tools:', error.message);
      return false;
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    this.repairLog.push({ timestamp, message });
    console.log(message);
  }

  async createRepairBackup() {
    this.log('\n💾 Creating repair backup...');
    
    try {
      const backupDir = path.join(__dirname, '..', 'database-backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(backupDir, `repair-backup-${timestamp}.json`);

      const backup = {
        timestamp,
        purpose: 'pre-repair-backup',
        tables: {}
      };

      // Backup critical tables
      const tablesToBackup = ['email_subscriptions', 'newsletter_subscriptions', 'email_send_attempts', 'email_rollback_tasks'];
      
      for (const table of tablesToBackup) {
        try {
          const { data, error } = await this.supabase
            .from(table)
            .select('*');

          if (!error && data) {
            backup.tables[table] = data;
            this.log(`✓ Backed up ${data.length} records from ${table}`);
            this.backupData[table] = data;
          }
        } catch (error) {
          this.log(`⚠️  Could not backup ${table}: ${error.message}`);
        }
      }

      fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
      this.log(`💾 Repair backup saved: ${backupFile}`);
      
      return backupFile;
    } catch (error) {
      this.log(`❌ Backup failed: ${error.message}`);
      return null;
    }
  }

  async repairMissingColumns() {
    this.log('\n🔧 Repairing missing columns...');
    
    const requiredColumns = {
      email_subscriptions: [
        { name: 'email_sent', type: 'BOOLEAN', default: 'false' },
        { name: 'email_sent_at', type: 'TIMESTAMP WITH TIME ZONE' },
        { name: 'email_send_attempts', type: 'INTEGER', default: '0' },
        { name: 'last_email_error', type: 'TEXT' },
        { name: 'last_email_template', type: 'VARCHAR(100)' },
        { name: 'is_active', type: 'BOOLEAN', default: 'true' },
        { name: 'unsubscribed_at', type: 'TIMESTAMP WITH TIME ZONE' }
      ]
    };

    for (const [tableName, columns] of Object.entries(requiredColumns)) {
      this.log(`\n  🔍 Checking ${tableName} columns...`);
      
      // Check if table exists first
      const { data: tableExists, error: tableError } = await this.supabase
        .rpc('sql', { 
          query: `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = '${tableName}' 
            AND table_schema = 'public'
          `
        });

      if (tableError || !tableExists || tableExists.length === 0) {
        this.log(`    ⚠️  Table ${tableName} does not exist, skipping column repairs`);
        continue;
      }

      for (const column of columns) {
        try {
          // Check if column exists
          const { data: columnExists, error: columnError } = await this.supabase
            .rpc('sql', { 
              query: `
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = '${tableName}' 
                AND column_name = '${column.name}'
                AND table_schema = 'public'
              `
            });

          if (columnError) {
            this.log(`    ❌ Error checking column ${column.name}: ${columnError.message}`);
            continue;
          }

          if (columnExists && columnExists.length > 0) {
            this.log(`    ✓ Column ${column.name} exists`);
            continue;
          }

          // Add the missing column
          const defaultClause = column.default ? `DEFAULT ${column.default}` : '';
          const addColumnSQL = `
            ALTER TABLE ${tableName} 
            ADD COLUMN ${column.name} ${column.type} ${defaultClause}
          `;

          const { error: addError } = await this.supabase
            .rpc('sql', { query: addColumnSQL });

          if (addError) {
            this.log(`    ❌ Failed to add column ${column.name}: ${addError.message}`);
          } else {
            this.log(`    ✅ Added column: ${column.name}`);
          }

        } catch (error) {
          this.log(`    ❌ Error with column ${column.name}: ${error.message}`);
        }
      }
    }
  }

  async repairOrphanedRecords() {
    this.log('\n🧹 Cleaning up orphaned records...');
    
    try {
      // Find and fix orphaned email_send_attempts
      const { data: orphanedAttempts, error: orphanError1 } = await this.supabase
        .rpc('sql', { 
          query: `
            SELECT esa.id, esa.email, esa.subscription_id
            FROM email_send_attempts esa
            LEFT JOIN email_subscriptions es ON esa.subscription_id = es.id
            WHERE esa.subscription_id IS NOT NULL 
            AND es.id IS NULL
            LIMIT 100
          `
        });

      if (!orphanError1 && orphanedAttempts && orphanedAttempts.length > 0) {
        this.log(`  🔍 Found ${orphanedAttempts.length} orphaned email_send_attempts`);
        
        for (const orphan of orphanedAttempts) {
          // Try to find matching subscription by email
          const { data: matchingSub, error: matchError } = await this.supabase
            .from('email_subscriptions')
            .select('id')
            .eq('email', orphan.email)
            .maybeSingle();

          if (!matchError && matchingSub) {
            // Update with correct subscription_id
            const { error: updateError } = await this.supabase
              .from('email_send_attempts')
              .update({ subscription_id: matchingSub.id })
              .eq('id', orphan.id);

            if (!updateError) {
              this.log(`    ✅ Fixed orphaned attempt for ${orphan.email}`);
            }
          } else {
            // Set subscription_id to null for orphaned records
            const { error: nullifyError } = await this.supabase
              .from('email_send_attempts')
              .update({ subscription_id: null })
              .eq('id', orphan.id);

            if (!nullifyError) {
              this.log(`    🔧 Nullified orphaned reference for ${orphan.email}`);
            }
          }
        }
      } else {
        this.log('  ✓ No orphaned email_send_attempts found');
      }

      // Find and fix orphaned email_rollback_tasks
      const { data: orphanedTasks, error: orphanError2 } = await this.supabase
        .rpc('sql', { 
          query: `
            SELECT ert.id, ert.email, ert.subscription_id
            FROM email_rollback_tasks ert
            LEFT JOIN email_subscriptions es ON ert.subscription_id = es.id
            WHERE ert.subscription_id IS NOT NULL 
            AND es.id IS NULL
            LIMIT 100
          `
        });

      if (!orphanError2 && orphanedTasks && orphanedTasks.length > 0) {
        this.log(`  🔍 Found ${orphanedTasks.length} orphaned email_rollback_tasks`);
        
        for (const orphan of orphanedTasks) {
          // Try to find matching subscription by email
          const { data: matchingSub, error: matchError } = await this.supabase
            .from('email_subscriptions')
            .select('id')
            .eq('email', orphan.email)
            .maybeSingle();

          if (!matchError && matchingSub) {
            const { error: updateError } = await this.supabase
              .from('email_rollback_tasks')
              .update({ subscription_id: matchingSub.id })
              .eq('id', orphan.id);

            if (!updateError) {
              this.log(`    ✅ Fixed orphaned task for ${orphan.email}`);
            }
          } else {
            // Set subscription_id to null for orphaned records
            const { error: nullifyError } = await this.supabase
              .from('email_rollback_tasks')
              .update({ subscription_id: null })
              .eq('id', orphan.id);

            if (!nullifyError) {
              this.log(`    🔧 Nullified orphaned reference for ${orphan.email}`);
            }
          }
        }
      } else {
        this.log('  ✓ No orphaned email_rollback_tasks found');
      }

    } catch (error) {
      this.log(`❌ Error cleaning orphaned records: ${error.message}`);
    }
  }

  async migrateNewsletterSubscriptions() {
    this.log('\n📤 Migrating newsletter_subscriptions data...');
    
    try {
      // Check if newsletter_subscriptions exists and has data
      const { data: newsletterData, error: fetchError } = await this.supabase
        .from('newsletter_subscriptions')
        .select('*');

      if (fetchError) {
        this.log('  ✓ No newsletter_subscriptions table to migrate');
        return;
      }

      if (!newsletterData || newsletterData.length === 0) {
        this.log('  ✓ newsletter_subscriptions table is empty');
        return;
      }

      this.log(`  📊 Found ${newsletterData.length} records to migrate`);
      
      let migratedCount = 0;
      let skippedCount = 0;
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
            this.log(`    ❌ Error checking ${record.email}: ${checkError.message}`);
            errorCount++;
            continue;
          }

          if (existing) {
            this.log(`    ⏭️  ${record.email} already exists, skipping`);
            skippedCount++;
            continue;
          }

          // Migrate the record
          const migratedRecord = {
            email: record.email,
            subscribed_at: record.created_at || record.subscribed_at || new Date().toISOString(),
            is_active: record.status !== 'unsubscribed',
            email_sent: false,
            email_send_attempts: 0
          };

          const { error: insertError } = await this.supabase
            .from('email_subscriptions')
            .insert(migratedRecord);

          if (insertError) {
            this.log(`    ❌ Failed to migrate ${record.email}: ${insertError.message}`);
            errorCount++;
          } else {
            this.log(`    ✅ Migrated ${record.email}`);
            migratedCount++;
          }

        } catch (error) {
          this.log(`    ❌ Error processing ${record.email}: ${error.message}`);
          errorCount++;
        }
      }

      this.log(`\n  📊 Migration Summary:`);
      this.log(`    • Migrated: ${migratedCount} records`);
      this.log(`    • Skipped: ${skippedCount} records`);
      this.log(`    • Errors: ${errorCount} records`);

      if (migratedCount > 0 && errorCount === 0) {
        // Optionally drop the old table after successful migration
        const dropOldTable = process.argv.includes('--drop-old-table');
        if (dropOldTable) {
          const { error: dropError } = await this.supabase
            .rpc('sql', { query: 'DROP TABLE newsletter_subscriptions CASCADE' });
          
          if (dropError) {
            this.log(`    ⚠️  Could not drop old table: ${dropError.message}`);
          } else {
            this.log(`    🗑️  Dropped old newsletter_subscriptions table`);
          }
        } else {
          this.log(`    💡 Use --drop-old-table flag to remove old table after verification`);
        }
      }

    } catch (error) {
      this.log(`❌ Migration error: ${error.message}`);
    }
  }

  async repairIndexes() {
    this.log('\n📊 Repairing missing indexes...');
    
    const criticalIndexes = [
      {
        table: 'email_subscriptions',
        indexes: [
          'CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email)',
          'CREATE INDEX IF NOT EXISTS idx_email_subscriptions_is_active ON email_subscriptions(is_active)',
          'CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email_sent ON email_subscriptions(email_sent)'
        ]
      },
      {
        table: 'email_send_attempts',
        indexes: [
          'CREATE INDEX IF NOT EXISTS idx_email_send_attempts_email ON email_send_attempts(email)',
          'CREATE INDEX IF NOT EXISTS idx_email_send_attempts_status ON email_send_attempts(status)',
          'CREATE INDEX IF NOT EXISTS idx_email_send_attempts_subscription_id ON email_send_attempts(subscription_id)',
          'CREATE INDEX IF NOT EXISTS idx_email_send_attempts_created_at ON email_send_attempts(created_at DESC)'
        ]
      },
      {
        table: 'email_rollback_tasks',
        indexes: [
          'CREATE INDEX IF NOT EXISTS idx_email_rollback_tasks_status ON email_rollback_tasks(status)',
          'CREATE INDEX IF NOT EXISTS idx_email_rollback_tasks_email ON email_rollback_tasks(email)',
          'CREATE INDEX IF NOT EXISTS idx_email_rollback_tasks_task_type ON email_rollback_tasks(task_type)'
        ]
      }
    ];

    for (const tableIndexes of criticalIndexes) {
      // Check if table exists first
      const { data: tableExists, error: tableError } = await this.supabase
        .rpc('sql', { 
          query: `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = '${tableIndexes.table}' 
            AND table_schema = 'public'
          `
        });

      if (tableError || !tableExists || tableExists.length === 0) {
        this.log(`  ⏭️  Table ${tableIndexes.table} doesn't exist, skipping indexes`);
        continue;
      }

      this.log(`  🔧 Creating indexes for ${tableIndexes.table}...`);
      
      for (const indexSQL of tableIndexes.indexes) {
        try {
          const { error: indexError } = await this.supabase
            .rpc('sql', { query: indexSQL });

          if (indexError) {
            this.log(`    ❌ Index creation failed: ${indexError.message}`);
          } else {
            const indexName = indexSQL.match(/idx_\w+/)?.[0] || 'unnamed';
            this.log(`    ✅ Created index: ${indexName}`);
          }
        } catch (error) {
          this.log(`    ❌ Index error: ${error.message}`);
        }
      }
    }
  }

  async repairRowLevelSecurity() {
    this.log('\n🔒 Repairing Row Level Security...');
    
    const tables = ['email_subscriptions', 'email_send_attempts', 'email_rollback_tasks'];
    
    for (const table of tables) {
      try {
        // Check if table exists
        const { data: tableExists, error: tableError } = await this.supabase
          .rpc('sql', { 
            query: `
              SELECT table_name 
              FROM information_schema.tables 
              WHERE table_name = '${table}' 
              AND table_schema = 'public'
            `
          });

        if (tableError || !tableExists || tableExists.length === 0) {
          this.log(`  ⏭️  Table ${table} doesn't exist, skipping RLS`);
          continue;
        }

        // Enable RLS
        const { error: rlsError } = await this.supabase
          .rpc('sql', { query: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY` });

        if (rlsError && !rlsError.message.includes('already enabled')) {
          this.log(`  ❌ Could not enable RLS on ${table}: ${rlsError.message}`);
          continue;
        }

        // Create service role policy
        const policySQL = `
          CREATE POLICY IF NOT EXISTS "Service role full access ${table}"
          ON ${table}
          FOR ALL
          TO service_role
          USING (true)
          WITH CHECK (true)
        `;

        const { error: policyError } = await this.supabase
          .rpc('sql', { query: policySQL });

        if (policyError) {
          this.log(`  ❌ Could not create policy for ${table}: ${policyError.message}`);
        } else {
          this.log(`  ✅ RLS enabled and policy created for ${table}`);
        }

      } catch (error) {
        this.log(`  ❌ RLS repair error for ${table}: ${error.message}`);
      }
    }
  }

  async validateRepairs() {
    this.log('\n✅ Validating repairs...');
    
    const validations = [];
    
    // Test basic table access
    const tables = ['email_subscriptions', 'email_send_attempts', 'email_rollback_tasks'];
    
    for (const table of tables) {
      try {
        const { data, error } = await this.supabase
          .from(table)
          .select('count')
          .limit(1);

        if (error) {
          validations.push({ table, status: 'failed', error: error.message });
          this.log(`  ❌ ${table}: ${error.message}`);
        } else {
          validations.push({ table, status: 'ok' });
          this.log(`  ✅ ${table}: Accessible`);
        }
      } catch (error) {
        validations.push({ table, status: 'error', error: error.message });
        this.log(`  ❌ ${table}: ${error.message}`);
      }
    }

    // Test function if available
    try {
      const { data, error } = await this.supabase
        .rpc('get_email_send_statistics');

      if (error) {
        this.log(`  ⚠️  Database functions need setup: ${error.message}`);
      } else {
        this.log(`  ✅ Database functions working`);
      }
    } catch (error) {
      this.log(`  ⚠️  Database functions not available`);
    }

    return validations;
  }

  async generateRepairReport() {
    this.log('\n📋 Generating repair report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      repairLog: this.repairLog,
      summary: {
        totalOperations: this.repairLog.length,
        successful: this.repairLog.filter(log => log.message.includes('✅')).length,
        warnings: this.repairLog.filter(log => log.message.includes('⚠️')).length,
        errors: this.repairLog.filter(log => log.message.includes('❌')).length
      }
    };

    try {
      const reportDir = path.join(__dirname, '..', 'database-backups');
      const reportFile = path.join(reportDir, `repair-report-${Date.now()}.json`);
      
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
      this.log(`📄 Repair report saved: ${reportFile}`);
      
      return report;
    } catch (error) {
      this.log(`⚠️  Could not save repair report: ${error.message}`);
      return report;
    }
  }

  async runFullRepair(options = {}) {
    this.log('🔧 === DATABASE REPAIR ===');
    
    const connected = await this.initialize();
    if (!connected) {
      this.log('❌ Cannot proceed without database connection');
      return false;
    }

    // Create backup before starting repairs
    await this.createRepairBackup();

    // Run repair operations
    await this.repairMissingColumns();
    await this.repairOrphanedRecords();
    
    if (!options.skipMigration) {
      await this.migrateNewsletterSubscriptions();
    }
    
    await this.repairIndexes();
    await this.repairRowLevelSecurity();
    
    // Validate repairs
    const validations = await this.validateRepairs();
    
    // Generate report
    const report = await this.generateRepairReport();
    
    this.log('\n🎉 === REPAIR COMPLETE ===');
    this.log(`📊 Operations: ${report.summary.totalOperations}`);
    this.log(`✅ Successful: ${report.summary.successful}`);
    this.log(`⚠️  Warnings: ${report.summary.warnings}`);
    this.log(`❌ Errors: ${report.summary.errors}`);
    
    const success = report.summary.errors === 0;
    this.log(`\n${success ? '✅ Repair completed successfully!' : '⚠️  Repair completed with issues - check logs'}`);
    
    return {
      success,
      report,
      validations
    };
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    skipMigration: args.includes('--skip-migration'),
    dropOldTable: args.includes('--drop-old-table')
  };

  const repair = new DatabaseRepair();
  const result = await repair.runFullRepair(options);
  
  process.exit(result.success ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Repair failed:', error);
    process.exit(1);
  });
}

module.exports = { DatabaseRepair };