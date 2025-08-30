#!/usr/bin/env node

/**
 * Database Status Checker
 * Comprehensive database health and status monitoring
 * Provides detailed insights into database state, performance, and data integrity
 */

require('dotenv').config({ path: '.env.local' });

class DatabaseStatusChecker {
  constructor() {
    this.supabase = null;
    this.results = {
      connection: null,
      tables: {},
      data: {},
      performance: {},
      security: {},
      functions: {},
      issues: []
    };
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
      
      this.results.connection = { status: 'connected', latency: null };
      return true;
    } catch (error) {
      this.results.connection = { status: 'failed', error: error.message };
      return false;
    }
  }

  async checkConnectionHealth() {
    console.log('🔗 Testing database connection...');
    
    const startTime = Date.now();
    
    try {
      const { data, error } = await this.supabase
        .rpc('sql', { query: 'SELECT NOW() as current_time' });

      const latency = Date.now() - startTime;

      if (error) {
        this.results.connection = { 
          status: 'error', 
          error: error.message,
          latency 
        };
        console.log(`❌ Connection failed: ${error.message}`);
      } else {
        this.results.connection = { 
          status: 'healthy', 
          latency,
          timestamp: data[0]?.current_time 
        };
        console.log(`✅ Connection healthy (${latency}ms)`);
      }
    } catch (error) {
      this.results.connection = { status: 'failed', error: error.message };
      console.log(`❌ Connection test failed: ${error.message}`);
    }
  }

  async checkTableStructures() {
    console.log('\n📋 Analyzing table structures...');
    
    const expectedTables = {
      email_subscriptions: {
        required: true,
        expectedColumns: [
          'id', 'email', 'subscribed_at', 'email_sent', 'email_sent_at',
          'email_send_attempts', 'last_email_error', 'is_active'
        ]
      },
      email_send_attempts: {
        required: true,
        expectedColumns: [
          'id', 'email', 'subscription_id', 'template_id', 'status',
          'attempt_number', 'sent_at', 'error_message', 'created_at'
        ]
      },
      email_rollback_tasks: {
        required: true,
        expectedColumns: [
          'id', 'task_type', 'email', 'subscription_id', 'status',
          'reason', 'created_at', 'processed_at'
        ]
      },
      newsletter_subscriptions: {
        required: false,
        legacy: true
      }
    };

    for (const [tableName, config] of Object.entries(expectedTables)) {
      console.log(`\n  📊 Checking table: ${tableName}`);
      
      try {
        // Check if table exists
        const { data: tableInfo, error: tableError } = await this.supabase
          .rpc('sql', { 
            query: `
              SELECT 
                table_name,
                table_type
              FROM information_schema.tables 
              WHERE table_name = '${tableName}' 
              AND table_schema = 'public'
            `
          });

        if (tableError || !tableInfo || tableInfo.length === 0) {
          this.results.tables[tableName] = {
            exists: false,
            required: config.required,
            status: config.required ? 'missing_critical' : 'missing_optional'
          };
          
          const status = config.required ? '❌ MISSING (Required)' : '⚠️  Missing (Optional)';
          console.log(`    ${status}`);
          
          if (config.required) {
            this.results.issues.push(`Critical table missing: ${tableName}`);
          }
          continue;
        }

        // Table exists, check columns
        const { data: columns, error: colError } = await this.supabase
          .rpc('sql', { 
            query: `
              SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default
              FROM information_schema.columns 
              WHERE table_name = '${tableName}' 
              AND table_schema = 'public'
              ORDER BY ordinal_position
            `
          });

        if (colError) {
          this.results.tables[tableName] = {
            exists: true,
            accessible: false,
            error: colError.message
          };
          console.log(`    ❌ Cannot access table structure: ${colError.message}`);
          continue;
        }

        const actualColumns = columns.map(col => col.column_name);
        const missingColumns = config.expectedColumns 
          ? config.expectedColumns.filter(col => !actualColumns.includes(col))
          : [];

        this.results.tables[tableName] = {
          exists: true,
          accessible: true,
          columns: actualColumns,
          missingColumns,
          legacy: config.legacy || false,
          columnCount: actualColumns.length
        };

        if (config.legacy) {
          console.log(`    ⚠️  Legacy table (should be migrated)`);
          this.results.issues.push(`Legacy table exists: ${tableName}`);
        } else if (missingColumns.length > 0) {
          console.log(`    ⚠️  Missing columns: ${missingColumns.join(', ')}`);
          this.results.issues.push(`${tableName} missing columns: ${missingColumns.join(', ')}`);
        } else {
          console.log(`    ✅ Structure OK (${actualColumns.length} columns)`);
        }

      } catch (error) {
        this.results.tables[tableName] = {
          exists: false,
          error: error.message
        };
        console.log(`    ❌ Error checking table: ${error.message}`);
      }
    }
  }

  async checkDataIntegrity() {
    console.log('\n📊 Checking data integrity...');

    const tables = ['email_subscriptions', 'email_send_attempts', 'email_rollback_tasks'];

    for (const table of tables) {
      if (!this.results.tables[table]?.exists) {
        console.log(`    ⏭️  Skipping ${table} (table doesn't exist)`);
        continue;
      }

      try {
        // Get record count
        const { data: countData, error: countError } = await this.supabase
          .rpc('sql', { query: `SELECT COUNT(*) as count FROM ${table}` });

        if (countError) {
          console.log(`    ❌ Cannot count records in ${table}: ${countError.message}`);
          continue;
        }

        const recordCount = countData[0]?.count || 0;

        // Get recent activity
        const { data: recentData, error: recentError } = await this.supabase
          .rpc('sql', { 
            query: `
              SELECT 
                DATE_TRUNC('day', created_at) as day,
                COUNT(*) as daily_count
              FROM ${table}
              WHERE created_at >= NOW() - INTERVAL '7 days'
              GROUP BY DATE_TRUNC('day', created_at)
              ORDER BY day DESC
            `
          });

        this.results.data[table] = {
          totalRecords: recordCount,
          recentActivity: recentData || [],
          status: recordCount > 0 ? 'has_data' : 'empty'
        };

        console.log(`    📈 ${table}: ${recordCount.toLocaleString()} records`);

        if (recentData && recentData.length > 0) {
          const recentTotal = recentData.reduce((sum, day) => sum + parseInt(day.daily_count), 0);
          console.log(`      📅 Recent 7 days: ${recentTotal} new records`);
        }

      } catch (error) {
        console.log(`    ❌ Error checking data for ${table}: ${error.message}`);
      }
    }

    // Check for orphaned records
    await this.checkOrphanedRecords();
  }

  async checkOrphanedRecords() {
    console.log('\n🔍 Checking for orphaned records...');

    try {
      // Check for email_send_attempts without valid subscription_id
      const { data: orphanedAttempts, error: orphanError1 } = await this.supabase
        .rpc('sql', { 
          query: `
            SELECT COUNT(*) as count
            FROM email_send_attempts esa
            LEFT JOIN email_subscriptions es ON esa.subscription_id = es.id
            WHERE esa.subscription_id IS NOT NULL 
            AND es.id IS NULL
          `
        });

      if (!orphanError1 && orphanedAttempts && orphanedAttempts[0]) {
        const orphanCount = orphanedAttempts[0].count;
        if (orphanCount > 0) {
          console.log(`    ⚠️  Found ${orphanCount} orphaned email_send_attempts records`);
          this.results.issues.push(`${orphanCount} orphaned email_send_attempts records`);
        } else {
          console.log(`    ✅ No orphaned email_send_attempts found`);
        }
      }

      // Check for email_rollback_tasks without valid references
      const { data: orphanedTasks, error: orphanError2 } = await this.supabase
        .rpc('sql', { 
          query: `
            SELECT COUNT(*) as count
            FROM email_rollback_tasks ert
            LEFT JOIN email_subscriptions es ON ert.subscription_id = es.id
            WHERE ert.subscription_id IS NOT NULL 
            AND es.id IS NULL
          `
        });

      if (!orphanError2 && orphanedTasks && orphanedTasks[0]) {
        const orphanCount = orphanedTasks[0].count;
        if (orphanCount > 0) {
          console.log(`    ⚠️  Found ${orphanCount} orphaned email_rollback_tasks records`);
          this.results.issues.push(`${orphanCount} orphaned email_rollback_tasks records`);
        } else {
          console.log(`    ✅ No orphaned email_rollback_tasks found`);
        }
      }

    } catch (error) {
      console.log(`    ❌ Error checking orphaned records: ${error.message}`);
    }
  }

  async checkDatabaseFunctions() {
    console.log('\n⚙️  Checking database functions...');

    const expectedFunctions = [
      'get_pending_email_retries',
      'get_pending_rollback_tasks', 
      'update_email_send_tracking',
      'get_email_send_statistics',
      'cleanup_old_attempts'
    ];

    for (const funcName of expectedFunctions) {
      try {
        const { data, error } = await this.supabase
          .rpc('sql', { 
            query: `
              SELECT routine_name 
              FROM information_schema.routines 
              WHERE routine_name = '${funcName}' 
              AND routine_schema = 'public'
            `
          });

        if (error || !data || data.length === 0) {
          console.log(`    ❌ Missing function: ${funcName}`);
          this.results.functions[funcName] = { exists: false };
          this.results.issues.push(`Missing database function: ${funcName}`);
        } else {
          console.log(`    ✅ Function exists: ${funcName}`);
          this.results.functions[funcName] = { exists: true };
        }

      } catch (error) {
        console.log(`    ❌ Error checking function ${funcName}: ${error.message}`);
        this.results.functions[funcName] = { exists: false, error: error.message };
      }
    }

    // Test a function if it exists
    if (this.results.functions.get_email_send_statistics?.exists) {
      try {
        const { data, error } = await this.supabase
          .rpc('get_email_send_statistics');

        if (error) {
          console.log(`    ⚠️  Function test failed: ${error.message}`);
          this.results.issues.push(`Function test failed: get_email_send_statistics`);
        } else {
          console.log(`    ✅ Function test passed: get_email_send_statistics`);
        }
      } catch (error) {
        console.log(`    ⚠️  Cannot test function: ${error.message}`);
      }
    }
  }

  async checkIndexes() {
    console.log('\n📊 Checking database indexes...');

    try {
      const { data: indexes, error } = await this.supabase
        .rpc('sql', { 
          query: `
            SELECT 
              indexname,
              tablename,
              indexdef
            FROM pg_indexes 
            WHERE schemaname = 'public'
            AND tablename IN ('email_subscriptions', 'email_send_attempts', 'email_rollback_tasks')
            ORDER BY tablename, indexname
          `
        });

      if (error) {
        console.log(`    ❌ Cannot check indexes: ${error.message}`);
        return;
      }

      const indexesByTable = {};
      if (indexes) {
        indexes.forEach(idx => {
          if (!indexesByTable[idx.tablename]) {
            indexesByTable[idx.tablename] = [];
          }
          indexesByTable[idx.tablename].push(idx.indexname);
        });
      }

      for (const [table, tableIndexes] of Object.entries(indexesByTable)) {
        console.log(`    📋 ${table}: ${tableIndexes.length} indexes`);
        
        // Check for key indexes
        const hasEmailIndex = tableIndexes.some(idx => 
          idx.includes('email') && !idx.includes('pkey')
        );
        const hasStatusIndex = tableIndexes.some(idx => 
          idx.includes('status')
        );

        if (table === 'email_send_attempts' && !hasEmailIndex) {
          this.results.issues.push(`${table} missing email index for performance`);
        }

        if ((table === 'email_send_attempts' || table === 'email_rollback_tasks') && !hasStatusIndex) {
          this.results.issues.push(`${table} missing status index for performance`);
        }
      }

    } catch (error) {
      console.log(`    ❌ Error checking indexes: ${error.message}`);
    }
  }

  async generateHealthReport() {
    console.log('\n📋 === HEALTH REPORT ===');
    
    const criticalIssues = this.results.issues.filter(issue => 
      issue.includes('Critical') || issue.includes('missing_critical')
    );
    
    const warnings = this.results.issues.filter(issue => 
      !issue.includes('Critical') && !issue.includes('missing_critical')
    );

    console.log(`\n🏥 Overall Health: ${criticalIssues.length === 0 ? '✅ HEALTHY' : '❌ CRITICAL ISSUES'}`);
    console.log(`📊 Connection: ${this.results.connection.status} (${this.results.connection.latency}ms)`);
    
    const tableCount = Object.keys(this.results.tables).length;
    const healthyTables = Object.values(this.results.tables).filter(t => t.exists && t.accessible).length;
    console.log(`🗄️  Tables: ${healthyTables}/${tableCount} accessible`);

    const totalRecords = Object.values(this.results.data).reduce((sum, data) => 
      sum + (data.totalRecords || 0), 0
    );
    console.log(`📈 Total Records: ${totalRecords.toLocaleString()}`);

    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      criticalIssues.forEach(issue => console.log(`  • ${issue}`));
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      warnings.forEach(issue => console.log(`  • ${issue}`));
    }

    if (criticalIssues.length === 0 && warnings.length === 0) {
      console.log('\n✅ No issues found - Database is in good health!');
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    
    if (this.results.tables.newsletter_subscriptions?.exists) {
      console.log('  • Migrate data from newsletter_subscriptions to email_subscriptions');
    }
    
    if (Object.values(this.results.functions).some(f => !f.exists)) {
      console.log('  • Install missing database functions for full functionality');
    }

    if (warnings.some(w => w.includes('orphaned'))) {
      console.log('  • Clean up orphaned records to improve data integrity');
    }

    if (this.results.connection.latency > 1000) {
      console.log('  • Database latency is high - consider connection optimization');
    }

    return {
      healthy: criticalIssues.length === 0,
      criticalIssues,
      warnings,
      summary: this.results
    };
  }

  async runFullCheck() {
    console.log('🔍 === DATABASE STATUS CHECK ===\n');
    
    const connected = await this.initialize();
    if (!connected) {
      console.log('❌ Cannot proceed without database connection');
      return this.results;
    }

    await this.checkConnectionHealth();
    await this.checkTableStructures();
    await this.checkDataIntegrity();
    await this.checkDatabaseFunctions();
    await this.checkIndexes();
    
    const report = await this.generateHealthReport();
    
    // Save detailed report to file
    const reportPath = path.join(__dirname, '..', 'database-backups', `health-report-${Date.now()}.json`);
    try {
      const fs = require('fs');
      const reportDir = path.dirname(reportPath);
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Detailed report saved: ${reportPath}`);
    } catch (error) {
      console.log('⚠️  Could not save detailed report to file');
    }

    return report;
  }
}

// CLI Interface
async function main() {
  const checker = new DatabaseStatusChecker();
  const report = await checker.runFullCheck();
  
  // Exit with appropriate code
  process.exit(report.healthy ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Status check failed:', error);
    process.exit(1);
  });
}

module.exports = { DatabaseStatusChecker };