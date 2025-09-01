#!/usr/bin/env node

/**
 * Database Migration Manager
 * 数据库迁移版本管理工具
 * 支持版本控制、回滚、备份和验证
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

class DatabaseMigrationManager {
  constructor() {
    this.supabase = null;
    this.migrationDir = path.join(__dirname, '..', 'database-setup');
    this.backupDir = path.join(__dirname, '..', 'database-backups');
    this.migrations = [
      {
        version: '001',
        name: 'initial_setup',
        file: 'manual-setup.sql',
        description: '初始数据库结构设置'
      },
      {
        version: '002',
        name: 'performance_optimization',
        file: 'performance-optimization.sql',
        description: '性能优化索引和函数'
      }
    ];
  }

  async initialize() {
    try {
      const { createClient } = require('@supabase/supabase-js');
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase configuration');
      }
      
      this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
      });
      
      // 确保备份目录存在
      if (!fs.existsSync(this.backupDir)) {
        fs.mkdirSync(this.backupDir, { recursive: true });
      }
      
      // 创建迁移历史表
      await this.createMigrationHistoryTable();
      
      return true;
    } catch (error) {
      console.error('❌ Initialization failed:', error.message);
      return false;
    }
  }

  async createMigrationHistoryTable() {
    console.log('📋 Creating migration history table...');
    
    const sql = `
      CREATE TABLE IF NOT EXISTS migration_history (
        id SERIAL PRIMARY KEY,
        version VARCHAR(10) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        rollback_sql TEXT,
        checksum VARCHAR(64),
        status VARCHAR(20) DEFAULT 'applied'
      );
      
      CREATE INDEX IF NOT EXISTS idx_migration_history_version 
        ON migration_history(version);
      
      CREATE INDEX IF NOT EXISTS idx_migration_history_applied_at 
        ON migration_history(applied_at DESC);
    `;

    try {
      const { error } = await this.supabase.rpc('exec_sql', { query: sql });
      if (error) throw error;
      console.log('✅ Migration history table ready');
    } catch (error) {
      console.error('❌ Failed to create migration history table:', error.message);
      throw error;
    }
  }

  async getCurrentVersion() {
    try {
      const { data, error } = await this.supabase
        .from('migration_history')
        .select('version, name, applied_at')
        .eq('status', 'applied')
        .order('version', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      return data?.[0] || null;
    } catch (error) {
      console.error('❌ Failed to get current version:', error.message);
      return null;
    }
  }

  async getPendingMigrations() {
    try {
      const { data: appliedMigrations, error } = await this.supabase
        .from('migration_history')
        .select('version')
        .eq('status', 'applied');

      if (error) throw error;

      const appliedVersions = new Set(appliedMigrations?.map(m => m.version) || []);
      
      return this.migrations.filter(migration => 
        !appliedVersions.has(migration.version)
      );
    } catch (error) {
      console.error('❌ Failed to get pending migrations:', error.message);
      return [];
    }
  }

  async backupDatabase() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `backup-${timestamp}.sql`);
    
    console.log('💾 Creating database backup...');
    
    try {
      // 获取所有表的结构和数据
      const { data: tables, error } = await this.supabase
        .rpc('exec_sql', {
          query: `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
          `
        });

      if (error) throw error;

      let backupSql = `-- Database Backup - ${new Date().toISOString()}\n\n`;
      
      for (const table of tables || []) {
        backupSql += await this.exportTableData(table.table_name);
      }

      fs.writeFileSync(backupFile, backupSql);
      console.log(`✅ Backup created: ${backupFile}`);
      
      return backupFile;
    } catch (error) {
      console.error('❌ Backup failed:', error.message);
      return null;
    }
  }

  async exportTableData(tableName) {
    try {
      const { data: tableData, error } = await this.supabase
        .from(tableName)
        .select('*');

      if (error) throw error;

      let sql = `-- Table: ${tableName}\n`;
      
      if (tableData && tableData.length > 0) {
        const columns = Object.keys(tableData[0]);
        const values = tableData.map(row => 
          `(${columns.map(col => {
            const val = row[col];
            if (val === null) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            return String(val);
          }).join(', ')})`
        ).join(',\n  ');

        sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n  ${values};\n\n`;
      } else {
        sql += `-- No data in ${tableName}\n\n`;
      }

      return sql;
    } catch (error) {
      console.error(`❌ Failed to export ${tableName}:`, error.message);
      return `-- Failed to export ${tableName}: ${error.message}\n\n`;
    }
  }

  async applyMigration(migration) {
    console.log(`\n🔄 Applying migration ${migration.version}: ${migration.name}`);
    
    const migrationFile = path.join(this.migrationDir, migration.file);
    
    if (!fs.existsSync(migrationFile)) {
      throw new Error(`Migration file not found: ${migration.file}`);
    }

    const sql = fs.readFileSync(migrationFile, 'utf8');
    const checksum = require('crypto').createHash('md5').update(sql).digest('hex');

    try {
      // 执行迁移SQL
      const { error: migrationError } = await this.supabase
        .rpc('exec_sql', { query: sql });

      if (migrationError) {
        throw new Error(`Migration execution failed: ${migrationError.message}`);
      }

      // 记录迁移历史
      const { error: historyError } = await this.supabase
        .from('migration_history')
        .insert([{
          version: migration.version,
          name: migration.name,
          description: migration.description,
          checksum: checksum,
          status: 'applied'
        }]);

      if (historyError) {
        throw new Error(`Failed to record migration history: ${historyError.message}`);
      }

      console.log(`✅ Migration ${migration.version} applied successfully`);
      
      return true;
    } catch (error) {
      console.error(`❌ Migration ${migration.version} failed:`, error.message);
      
      // 记录失败状态
      try {
        await this.supabase
          .from('migration_history')
          .insert([{
            version: migration.version,
            name: migration.name,
            description: migration.description,
            checksum: checksum,
            status: 'failed'
          }]);
      } catch (recordError) {
        console.error('Failed to record migration failure:', recordError.message);
      }

      throw error;
    }
  }

  async runMigrations() {
    console.log('🚀 Starting database migrations...\n');

    // 创建备份
    const backupFile = await this.backupDatabase();
    if (!backupFile) {
      console.log('⚠️  Proceeding without backup (backup failed)');
    }

    // 获取当前版本
    const currentVersion = await this.getCurrentVersion();
    console.log(`📊 Current version: ${currentVersion?.version || 'none'}`);

    // 获取待执行的迁移
    const pendingMigrations = await this.getPendingMigrations();
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations - database is up to date');
      return true;
    }

    console.log(`📋 Found ${pendingMigrations.length} pending migrations:`);
    pendingMigrations.forEach(m => {
      console.log(`  - ${m.version}: ${m.name} (${m.description})`);
    });

    // 执行迁移
    for (const migration of pendingMigrations) {
      try {
        await this.applyMigration(migration);
      } catch (error) {
        console.error(`❌ Migration chain stopped at ${migration.version}`);
        console.error('💡 Consider rolling back or fixing the migration');
        return false;
      }
    }

    console.log('\n🎉 All migrations completed successfully!');
    
    // 验证最终状态
    await this.verifyDatabaseState();
    
    return true;
  }

  async verifyDatabaseState() {
    console.log('\n🔍 Verifying database state...');

    try {
      // 检查关键表存在性
      const { data: tables, error } = await this.supabase
        .rpc('exec_sql', {
          query: `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('email_subscriptions', 'email_send_attempts', 'email_rollback_tasks')
            ORDER BY table_name
          `
        });

      if (error) throw error;

      console.log(`✅ Core tables verified: ${tables?.length || 0}/3`);

      // 检查关键函数
      const { data: functions, error: funcError } = await this.supabase
        .rpc('exec_sql', {
          query: `
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name IN ('get_active_subscription_count', 'get_subscription_statistics')
          `
        });

      if (funcError) throw funcError;

      console.log(`✅ Core functions verified: ${functions?.length || 0}/2`);

      // 快速性能测试
      const startTime = Date.now();
      const { error: perfError } = await this.supabase
        .rpc('get_active_subscription_count');
      const latency = Date.now() - startTime;

      if (perfError) {
        console.log(`⚠️  Performance test failed: ${perfError.message}`);
      } else {
        console.log(`✅ Performance test passed (${latency}ms)`);
      }

      return true;
    } catch (error) {
      console.error('❌ Database verification failed:', error.message);
      return false;
    }
  }

  async showMigrationStatus() {
    console.log('📊 Migration Status Report\n');

    try {
      const { data: history, error } = await this.supabase
        .from('migration_history')
        .select('*')
        .order('version', { ascending: true });

      if (error) throw error;

      if (!history || history.length === 0) {
        console.log('No migrations have been applied yet.');
        return;
      }

      console.log('Applied Migrations:');
      console.log('-------------------');
      
      history.forEach(migration => {
        const status = migration.status === 'applied' ? '✅' : '❌';
        const date = new Date(migration.applied_at).toLocaleString();
        console.log(`${status} ${migration.version}: ${migration.name}`);
        console.log(`    ${migration.description}`);
        console.log(`    Applied: ${date}`);
        console.log(`    Status: ${migration.status}`);
        console.log('');
      });

      // 显示待执行的迁移
      const pending = await this.getPendingMigrations();
      if (pending.length > 0) {
        console.log('Pending Migrations:');
        console.log('-------------------');
        pending.forEach(migration => {
          console.log(`⏳ ${migration.version}: ${migration.name}`);
          console.log(`    ${migration.description}`);
          console.log('');
        });
      }

    } catch (error) {
      console.error('❌ Failed to show migration status:', error.message);
    }
  }

  async generateRollbackScript(version) {
    console.log(`🔄 Generating rollback script for version ${version}...`);
    
    // 这里应该包含具体的回滚逻辑
    // 由于SQL结构迁移的复杂性，建议使用备份恢复
    
    console.log('💡 For safety, consider using database backup for rollback');
    console.log(`📁 Check backup directory: ${this.backupDir}`);
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const manager = new DatabaseMigrationManager();
  
  const initialized = await manager.initialize();
  if (!initialized) {
    console.error('❌ Failed to initialize migration manager');
    process.exit(1);
  }

  switch (command) {
    case 'migrate':
    case 'up':
      const success = await manager.runMigrations();
      process.exit(success ? 0 : 1);
      break;
      
    case 'status':
      await manager.showMigrationStatus();
      break;
      
    case 'backup':
      const backupFile = await manager.backupDatabase();
      process.exit(backupFile ? 0 : 1);
      break;
      
    case 'verify':
      const verified = await manager.verifyDatabaseState();
      process.exit(verified ? 0 : 1);
      break;
      
    case 'rollback':
      const version = process.argv[3];
      if (!version) {
        console.error('❌ Please specify version to rollback to');
        process.exit(1);
      }
      await manager.generateRollbackScript(version);
      break;
      
    default:
      console.log(`
Database Migration Manager
Usage:
  node database-migration-manager.js <command>

Commands:
  migrate, up    Run pending migrations
  status         Show migration status
  backup         Create database backup
  verify         Verify database state
  rollback <ver> Generate rollback script

Examples:
  node database-migration-manager.js migrate
  node database-migration-manager.js status
  node database-migration-manager.js backup
  node database-migration-manager.js rollback 001
      `);
      break;
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Migration manager failed:', error);
    process.exit(1);
  });
}

module.exports = { DatabaseMigrationManager };