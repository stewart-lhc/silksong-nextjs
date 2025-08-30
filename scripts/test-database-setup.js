#!/usr/bin/env node

/**
 * Database Setup Test Suite
 * Validates that all database operations work correctly
 * Safe to run multiple times - includes cleanup
 */

require('dotenv').config({ path: '.env.local' });

class DatabaseSetupTest {
  constructor() {
    this.supabase = null;
    this.testResults = [];
    this.testSubscriptionId = null;
  }

  async initialize() {
    try {
      const { createClient } = require('@supabase/supabase-js');
      
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
      );
      
      console.log('🧪 Test suite initialized');
      return true;
    } catch (error) {
      console.error('❌ Test initialization failed:', error.message);
      return false;
    }
  }

  logTest(testName, passed, message = '') {
    const status = passed ? '✅' : '❌';
    const result = { testName, passed, message };
    
    this.testResults.push(result);
    console.log(`${status} ${testName}${message ? ': ' + message : ''}`);
    
    return passed;
  }

  async testDatabaseConnection() {
    console.log('\n🔗 Testing database connection...');
    
    try {
      const startTime = Date.now();
      const { data, error } = await this.supabase
        .rpc('sql', { query: 'SELECT NOW() as current_time' });
      const latency = Date.now() - startTime;

      if (error) {
        return this.logTest('Database Connection', false, error.message);
      }

      return this.logTest('Database Connection', true, `Connected (${latency}ms)`);
    } catch (error) {
      return this.logTest('Database Connection', false, error.message);
    }
  }

  async testTableExistence() {
    console.log('\n📋 Testing table existence...');
    
    const requiredTables = [
      'email_subscriptions',
      'email_send_attempts', 
      'email_rollback_tasks'
    ];

    let allTablesExist = true;

    for (const tableName of requiredTables) {
      try {
        const { data, error } = await this.supabase
          .from(tableName)
          .select('count')
          .limit(1);

        if (error) {
          this.logTest(`Table: ${tableName}`, false, error.message);
          allTablesExist = false;
        } else {
          this.logTest(`Table: ${tableName}`, true, 'Accessible');
        }
      } catch (error) {
        this.logTest(`Table: ${tableName}`, false, error.message);
        allTablesExist = false;
      }
    }

    return allTablesExist;
  }

  async testRequiredColumns() {
    console.log('\n📊 Testing required columns...');
    
    try {
      const { data: columns, error } = await this.supabase
        .rpc('sql', { 
          query: `
            SELECT column_name
            FROM information_schema.columns 
            WHERE table_name = 'email_subscriptions' 
            AND table_schema = 'public'
            ORDER BY column_name
          `
        });

      if (error) {
        return this.logTest('Column Check', false, error.message);
      }

      const columnNames = columns.map(col => col.column_name);
      const requiredColumns = [
        'id', 'email', 'subscribed_at', 'email_sent', 'email_sent_at',
        'email_send_attempts', 'last_email_error', 'is_active'
      ];

      const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));

      if (missingColumns.length > 0) {
        return this.logTest('Required Columns', false, `Missing: ${missingColumns.join(', ')}`);
      }

      return this.logTest('Required Columns', true, `All ${requiredColumns.length} columns present`);
    } catch (error) {
      return this.logTest('Column Check', false, error.message);
    }
  }

  async testDatabaseFunctions() {
    console.log('\n⚙️  Testing database functions...');
    
    const functions = [
      'get_pending_email_retries',
      'get_pending_rollback_tasks',
      'update_email_send_tracking',
      'get_email_send_statistics'
    ];

    let allFunctionsWork = true;

    for (const funcName of functions) {
      try {
        // Test if function exists and can be called
        let testResult = false;
        
        if (funcName === 'get_pending_email_retries') {
          const { data, error } = await this.supabase.rpc(funcName, { max_attempts: 3, limit_count: 1 });
          testResult = !error;
        } else if (funcName === 'get_pending_rollback_tasks') {
          const { data, error } = await this.supabase.rpc(funcName, { limit_count: 1 });
          testResult = !error;
        } else if (funcName === 'get_email_send_statistics') {
          const { data, error } = await this.supabase.rpc(funcName);
          testResult = !error;
        } else {
          // For functions that need parameters, just check existence
          const { data, error } = await this.supabase
            .rpc('sql', { 
              query: `
                SELECT routine_name 
                FROM information_schema.routines 
                WHERE routine_name = '${funcName}' 
                AND routine_schema = 'public'
              `
            });
          testResult = !error && data && data.length > 0;
        }

        if (!testResult) {
          allFunctionsWork = false;
          this.logTest(`Function: ${funcName}`, false, 'Not working or missing');
        } else {
          this.logTest(`Function: ${funcName}`, true, 'Working');
        }

      } catch (error) {
        allFunctionsWork = false;
        this.logTest(`Function: ${funcName}`, false, error.message);
      }
    }

    return allFunctionsWork;
  }

  async testCrudOperations() {
    console.log('\n🔄 Testing CRUD operations...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    
    try {
      // Test INSERT
      const { data: insertData, error: insertError } = await this.supabase
        .from('email_subscriptions')
        .insert({
          email: testEmail,
          is_active: true,
          email_sent: false
        })
        .select()
        .single();

      if (insertError) {
        return this.logTest('INSERT Operation', false, insertError.message);
      }

      this.testSubscriptionId = insertData.id;
      this.logTest('INSERT Operation', true, 'Subscription created');

      // Test SELECT
      const { data: selectData, error: selectError } = await this.supabase
        .from('email_subscriptions')
        .select('*')
        .eq('id', this.testSubscriptionId)
        .single();

      if (selectError || !selectData) {
        this.logTest('SELECT Operation', false, selectError?.message || 'No data returned');
      } else {
        this.logTest('SELECT Operation', true, 'Data retrieved');
      }

      // Test UPDATE
      const { error: updateError } = await this.supabase
        .from('email_subscriptions')
        .update({ 
          email_sent: true,
          email_sent_at: new Date().toISOString()
        })
        .eq('id', this.testSubscriptionId);

      if (updateError) {
        this.logTest('UPDATE Operation', false, updateError.message);
      } else {
        this.logTest('UPDATE Operation', true, 'Data updated');
      }

      return true;
    } catch (error) {
      this.logTest('CRUD Operations', false, error.message);
      return false;
    }
  }

  async testEmailSendAttempts() {
    console.log('\n📧 Testing email send attempts...');
    
    if (!this.testSubscriptionId) {
      return this.logTest('Email Send Attempts', false, 'No test subscription available');
    }

    try {
      // Create an email send attempt
      const { data: attemptData, error: attemptError } = await this.supabase
        .from('email_send_attempts')
        .insert({
          email: `test-${Date.now()}@example.com`,
          subscription_id: this.testSubscriptionId,
          template_id: 'welcome',
          status: 'pending',
          attempt_number: 1
        })
        .select()
        .single();

      if (attemptError) {
        return this.logTest('Email Send Attempts', false, attemptError.message);
      }

      this.logTest('Email Send Attempts', true, 'Send attempt created');

      // Test status update
      const { error: statusError } = await this.supabase
        .from('email_send_attempts')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', attemptData.id);

      if (statusError) {
        this.logTest('Send Attempt Update', false, statusError.message);
      } else {
        this.logTest('Send Attempt Update', true, 'Status updated');
      }

      return true;
    } catch (error) {
      this.logTest('Email Send Attempts', false, error.message);
      return false;
    }
  }

  async testRollbackTasks() {
    console.log('\n🔄 Testing rollback tasks...');
    
    if (!this.testSubscriptionId) {
      return this.logTest('Rollback Tasks', false, 'No test subscription available');
    }

    try {
      const { data: taskData, error: taskError } = await this.supabase
        .from('email_rollback_tasks')
        .insert({
          task_type: 'retry_email_send',
          email: `test-${Date.now()}@example.com`,
          subscription_id: this.testSubscriptionId,
          reason: 'Test rollback task',
          status: 'pending'
        })
        .select()
        .single();

      if (taskError) {
        return this.logTest('Rollback Tasks', false, taskError.message);
      }

      this.logTest('Rollback Tasks', true, 'Rollback task created');

      // Update task status
      const { error: updateError } = await this.supabase
        .from('email_rollback_tasks')
        .update({ 
          status: 'completed', 
          processed_at: new Date().toISOString() 
        })
        .eq('id', taskData.id);

      if (updateError) {
        this.logTest('Rollback Task Update', false, updateError.message);
      } else {
        this.logTest('Rollback Task Update', true, 'Task updated');
      }

      return true;
    } catch (error) {
      this.logTest('Rollback Tasks', false, error.message);
      return false;
    }
  }

  async cleanupTestData() {
    console.log('\n🧹 Cleaning up test data...');
    
    try {
      if (this.testSubscriptionId) {
        // Delete email send attempts first (due to foreign key)
        await this.supabase
          .from('email_send_attempts')
          .delete()
          .eq('subscription_id', this.testSubscriptionId);

        // Delete rollback tasks
        await this.supabase
          .from('email_rollback_tasks')
          .delete()
          .eq('subscription_id', this.testSubscriptionId);

        // Delete test subscription
        const { error } = await this.supabase
          .from('email_subscriptions')
          .delete()
          .eq('id', this.testSubscriptionId);

        if (error) {
          this.logTest('Cleanup', false, error.message);
        } else {
          this.logTest('Cleanup', true, 'Test data removed');
        }
      }

      // Clean up any orphaned test data
      await this.supabase
        .from('email_subscriptions')
        .delete()
        .like('email', 'test-%@example.com');

      return true;
    } catch (error) {
      this.logTest('Cleanup', false, error.message);
      return false;
    }
  }

  async generateTestReport() {
    console.log('\n📋 === TEST REPORT ===');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

    console.log(`\n📊 Summary:`);
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${passedTests} ✅`);
    console.log(`  Failed: ${failedTests} ❌`);
    console.log(`  Pass Rate: ${passRate}%`);

    if (failedTests > 0) {
      console.log(`\n❌ Failed Tests:`);
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => console.log(`  • ${r.testName}: ${r.message}`));
    }

    const overallHealth = failedTests === 0 ? 'HEALTHY' : failedTests <= 2 ? 'MINOR ISSUES' : 'CRITICAL ISSUES';
    const healthEmoji = failedTests === 0 ? '✅' : failedTests <= 2 ? '⚠️' : '❌';
    
    console.log(`\n${healthEmoji} Overall Status: ${overallHealth}`);

    if (failedTests > 0) {
      console.log('\n💡 Recommendations:');
      console.log('  • Run: node scripts/db-admin.js repair');
      console.log('  • Check: node scripts/db-admin.js status');
      console.log('  • Setup: node scripts/db-admin.js setup');
    }

    return {
      totalTests,
      passedTests,
      failedTests,
      passRate: parseFloat(passRate),
      healthy: failedTests === 0,
      results: this.testResults
    };
  }

  async runFullTestSuite() {
    console.log('🧪 === DATABASE SETUP TEST SUITE ===');
    console.log('Testing all database functionality...\n');
    
    const initialized = await this.initialize();
    if (!initialized) {
      console.log('❌ Cannot run tests without database connection');
      return false;
    }

    // Run all tests
    await this.testDatabaseConnection();
    await this.testTableExistence();
    await this.testRequiredColumns();
    await this.testDatabaseFunctions();
    await this.testCrudOperations();
    await this.testEmailSendAttempts();
    await this.testRollbackTasks();
    
    // Clean up
    await this.cleanupTestData();
    
    // Generate report
    const report = await this.generateTestReport();
    
    return report.healthy;
  }
}

// CLI Interface
async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing environment variables');
    console.error('Make sure .env.local contains NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const tester = new DatabaseSetupTest();
  const success = await tester.runFullTestSuite();
  
  console.log('\n' + '='.repeat(50));
  console.log(success ? '🎉 All tests passed! Database is ready.' : '⚠️  Some tests failed. Check the report above.');
  
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { DatabaseSetupTest };