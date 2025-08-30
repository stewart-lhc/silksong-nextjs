#!/usr/bin/env node

/**
 * Database Administration CLI
 * Unified interface for all database operations
 * Provides a single command-line tool for database management
 */

const path = require('path');

// Import our database management classes
const { DatabaseManager } = require('./database-manager');
const { DatabaseStatusChecker } = require('./database-status-checker');
const { DatabaseRepair } = require('./database-repair');

class DatabaseAdmin {
  constructor() {
    this.commands = {
      'status': {
        description: 'Check database health and status',
        handler: this.checkStatus.bind(this)
      },
      'setup': {
        description: 'Run full database setup (creates tables, indexes, functions)',
        handler: this.runSetup.bind(this)
      },
      'repair': {
        description: 'Repair database issues (missing columns, orphaned records, etc.)',
        handler: this.runRepair.bind(this)
      },
      'migrate': {
        description: 'Migrate data from newsletter_subscriptions to email_subscriptions',
        handler: this.runMigration.bind(this)
      },
      'backup': {
        description: 'Create a backup of current database state',
        handler: this.createBackup.bind(this)
      },
      'extend': {
        description: 'Extend email_subscriptions table with new fields',
        handler: this.extendTables.bind(this)
      },
      'cleanup': {
        description: 'Clean up legacy tables and data',
        handler: this.cleanupLegacy.bind(this)
      },
      'validate': {
        description: 'Validate database integrity and performance',
        handler: this.validateDatabase.bind(this)
      },
      'monitor': {
        description: 'Show real-time database metrics',
        handler: this.monitorDatabase.bind(this)
      },
      'help': {
        description: 'Show this help message',
        handler: this.showHelp.bind(this)
      }
    };
  }

  async checkStatus() {
    console.log('🔍 Running comprehensive database status check...\n');
    
    const checker = new DatabaseStatusChecker();
    const report = await checker.runFullCheck();
    
    return report.healthy;
  }

  async runSetup() {
    console.log('🏗️  Running full database setup...\n');
    
    const manager = new DatabaseManager();
    const success = await manager.runFullSetup();
    
    if (success) {
      console.log('\n✨ Setup completed successfully!');
      console.log('💡 Next steps:');
      console.log('  • Test the API endpoints');
      console.log('  • Configure your email provider');
      console.log('  • Set up monitoring and backups');
    }
    
    return success;
  }

  async runRepair() {
    console.log('🔧 Running database repair...\n');
    
    const repair = new DatabaseRepair();
    const result = await repair.runFullRepair();
    
    if (result.success) {
      console.log('\n🎉 Repair completed successfully!');
    } else {
      console.log('\n⚠️  Repair completed with issues - check the repair log');
    }
    
    return result.success;
  }

  async runMigration() {
    console.log('📤 Running data migration...\n');
    
    const repair = new DatabaseRepair();
    await repair.initialize();
    await repair.migrateNewsletterSubscriptions();
    
    console.log('\n✅ Migration process completed');
    return true;
  }

  async createBackup() {
    console.log('💾 Creating database backup...\n');
    
    const manager = new DatabaseManager();
    await manager.initialize();
    const backupFile = await manager.backupExistingData();
    
    if (backupFile) {
      console.log(`\n✅ Backup created successfully: ${backupFile}`);
    } else {
      console.log('\n❌ Backup failed');
      return false;
    }
    
    return true;
  }

  async extendTables() {
    console.log('🔧 Extending database tables...\n');
    
    const manager = new DatabaseManager();
    await manager.initialize();
    await manager.extendEmailSubscriptionsTable();
    
    console.log('\n✅ Table extension completed');
    return true;
  }

  async cleanupLegacy() {
    console.log('🧹 Cleaning up legacy tables...\n');
    
    const manager = new DatabaseManager();
    await manager.initialize();
    await manager.cleanupNewsletterTables();
    
    console.log('\n✅ Legacy cleanup completed');
    return true;
  }

  async validateDatabase() {
    console.log('✅ Running database validation...\n');
    
    const repair = new DatabaseRepair();
    await repair.initialize();
    const validations = await repair.validateRepairs();
    
    const allValid = validations.every(v => v.status === 'ok');
    
    if (allValid) {
      console.log('\n✅ All validations passed - database is healthy!');
    } else {
      console.log('\n⚠️  Some validations failed - consider running repair');
    }
    
    return allValid;
  }

  async monitorDatabase() {
    console.log('📊 Database monitoring dashboard...\n');
    
    const checker = new DatabaseStatusChecker();
    await checker.initialize();
    
    // Connection health
    await checker.checkConnectionHealth();
    
    // Data stats
    await checker.checkDataIntegrity();
    
    // Performance metrics
    console.log('\n⚡ Performance Metrics:');
    
    try {
      const { createClient } = require('@supabase/supabase-js');
      require('dotenv').config({ path: '.env.local' });
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } }
      );
      
      // Get email statistics if function exists
      try {
        const { data: stats, error } = await supabase
          .rpc('get_email_send_statistics');

        if (!error && stats && stats.length > 0) {
          const stat = stats[0];
          console.log(`  📧 Email Statistics (Last 30 days):`);
          console.log(`    • Total attempts: ${stat.total_attempts || 0}`);
          console.log(`    • Sent successfully: ${stat.sent_count || 0}`);
          console.log(`    • Failed: ${stat.failed_count || 0}`);
          console.log(`    • Success rate: ${stat.success_rate || 0}%`);
        }
      } catch (error) {
        console.log('    ⚠️  Email statistics function not available');
      }
      
      // Check for pending operations
      try {
        const { data: pendingRetries, error: retryError } = await supabase
          .rpc('get_pending_email_retries', { max_attempts: 3, limit_count: 10 });

        if (!retryError && pendingRetries) {
          console.log(`  🔄 Pending email retries: ${pendingRetries.length}`);
        }
      } catch (error) {
        console.log('    ⚠️  Cannot check pending retries');
      }

      try {
        const { data: pendingTasks, error: taskError } = await supabase
          .rpc('get_pending_rollback_tasks', { limit_count: 10 });

        if (!taskError && pendingTasks) {
          console.log(`  📋 Pending rollback tasks: ${pendingTasks.length}`);
        }
      } catch (error) {
        console.log('    ⚠️  Cannot check pending tasks');
      }

    } catch (error) {
      console.log('  ❌ Cannot fetch performance metrics');
    }
    
    console.log('\n💡 Use "db-admin status" for detailed health check');
    return true;
  }

  showHelp() {
    console.log(`
🗄️  Database Administration Tool

Usage: node scripts/db-admin.js <command> [options]

Commands:
`);

    Object.entries(this.commands).forEach(([command, info]) => {
      console.log(`  ${command.padEnd(10)} - ${info.description}`);
    });

    console.log(`
Examples:
  node scripts/db-admin.js status              # Check database health
  node scripts/db-admin.js setup               # Set up database from scratch
  node scripts/db-admin.js repair              # Fix database issues
  node scripts/db-admin.js backup              # Create a backup
  node scripts/db-admin.js monitor             # Show monitoring dashboard

Options:
  --skip-migration    Skip data migration during repair
  --drop-old-table    Drop newsletter_subscriptions after migration
  --verbose           Show detailed output

Environment:
  Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
    `);
    
    return true;
  }

  async executeCommand(command, args = []) {
    const cmd = this.commands[command];
    
    if (!cmd) {
      console.error(`❌ Unknown command: ${command}`);
      console.log('Use "help" to see available commands');
      return false;
    }

    try {
      const startTime = Date.now();
      const result = await cmd.handler(args);
      const duration = Date.now() - startTime;
      
      console.log(`\n⏱️  Command completed in ${duration}ms`);
      return result;
    } catch (error) {
      console.error(`❌ Command failed: ${error.message}`);
      
      if (args.includes('--verbose')) {
        console.error('Stack trace:', error.stack);
      }
      
      return false;
    }
  }

  async runInteractiveMode() {
    console.log('🚀 Database Administration Interactive Mode');
    console.log('Type "help" for available commands, "quit" to exit\n');

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const promptUser = () => {
      rl.question('db-admin> ', async (input) => {
        const [command, ...args] = input.trim().split(' ');
        
        if (command === 'quit' || command === 'exit') {
          console.log('👋 Goodbye!');
          rl.close();
          return;
        }
        
        if (command === 'clear') {
          console.clear();
          promptUser();
          return;
        }
        
        if (command) {
          await this.executeCommand(command, args);
        }
        
        console.log(); // Add spacing
        promptUser();
      });
    };

    promptUser();
  }
}

// CLI Entry Point
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const options = args.slice(1);

  const admin = new DatabaseAdmin();

  // Check for required environment variables
  require('dotenv').config({ path: '.env.local' });
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    console.error('   Make sure .env.local is configured correctly');
    process.exit(1);
  }

  // Interactive mode if no command provided
  if (!command) {
    await admin.runInteractiveMode();
    return;
  }

  // Execute the command
  const success = await admin.executeCommand(command, options);
  process.exit(success ? 0 : 1);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

if (require.main === module) {
  main();
}

module.exports = { DatabaseAdmin };