/**
 * Database Migrations
 * 
 * Migration system for Newsletter Kit database schema
 */

import type { DatabaseAdapter, DatabaseType } from '../types';
import { getDatabaseSchema } from '../adapters';

export interface Migration {
  version: string;
  name: string;
  up: string[];
  down: string[];
}

export interface MigrationRecord {
  version: string;
  name: string;
  executedAt: Date;
}

export class MigrationRunner {
  constructor(private adapter: DatabaseAdapter, private dbType: DatabaseType) {}

  async runMigrations(): Promise<void> {
    await this.createMigrationTable();
    
    const migrations = await this.getMigrations();
    const executedMigrations = await this.getExecutedMigrations();
    
    const pendingMigrations = migrations.filter(
      migration => !executedMigrations.some(executed => executed.version === migration.version)
    );

    console.log(`Found ${pendingMigrations.length} pending migrations`);

    for (const migration of pendingMigrations) {
      await this.executeMigration(migration);
    }

    console.log('All migrations completed successfully');
  }

  async rollbackMigration(version?: string): Promise<void> {
    const executedMigrations = await this.getExecutedMigrations();
    
    if (executedMigrations.length === 0) {
      console.log('No migrations to rollback');
      return;
    }

    const targetMigration = version 
      ? executedMigrations.find(m => m.version === version)
      : executedMigrations[executedMigrations.length - 1]; // Last migration

    if (!targetMigration) {
      throw new Error(`Migration version ${version} not found`);
    }

    const migrations = await this.getMigrations();
    const migration = migrations.find(m => m.version === targetMigration.version);

    if (!migration) {
      throw new Error(`Migration definition for version ${targetMigration.version} not found`);
    }

    console.log(`Rolling back migration: ${migration.name}`);

    try {
      // Execute down migration
      for (const sql of migration.down) {
        await this.executeSql(sql);
      }

      // Remove from migration records
      await this.removeMigrationRecord(migration.version);

      console.log(`Successfully rolled back migration: ${migration.name}`);
    } catch (error) {
      console.error(`Failed to rollback migration ${migration.name}:`, error);
      throw error;
    }
  }

  private async createMigrationTable(): Promise<void> {
    const sql = this.dbType === 'sqlite' 
      ? `CREATE TABLE IF NOT EXISTS newsletter_migrations (
          version TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          executed_at DATETIME DEFAULT (datetime('now'))
        )`
      : `CREATE TABLE IF NOT EXISTS newsletter_migrations (
          version VARCHAR(50) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
    
    await this.executeSql(sql);
  }

  private async getMigrations(): Promise<Migration[]> {
    // In a real implementation, these would be loaded from files
    return [
      {
        version: '001',
        name: 'create_core_tables',
        up: await this.getCoreTablesMigration(),
        down: await this.getDropCoreTablesMigration()
      },
      {
        version: '002',
        name: 'create_indexes',
        up: await this.getIndexesMigration(),
        down: await this.getDropIndexesMigration()
      },
      {
        version: '003',
        name: 'create_functions_and_triggers',
        up: await this.getFunctionsMigration(),
        down: await this.getDropFunctionsMigration()
      },
      {
        version: '004',
        name: 'insert_seed_data',
        up: await this.getSeedDataMigration(),
        down: await this.getClearSeedDataMigration()
      }
    ];
  }

  private async getExecutedMigrations(): Promise<MigrationRecord[]> {
    try {
      const sql = 'SELECT version, name, executed_at FROM newsletter_migrations ORDER BY executed_at';
      // This would need to be implemented per adapter
      // For now, return empty array
      return [];
    } catch {
      return [];
    }
  }

  private async executeMigration(migration: Migration): Promise<void> {
    console.log(`Executing migration: ${migration.name}`);

    try {
      // Execute up migration
      for (const sql of migration.up) {
        await this.executeSql(sql);
      }

      // Record migration
      await this.recordMigration(migration);

      console.log(`Successfully executed migration: ${migration.name}`);
    } catch (error) {
      console.error(`Failed to execute migration ${migration.name}:`, error);
      throw error;
    }
  }

  private async recordMigration(migration: Migration): Promise<void> {
    const sql = 'INSERT INTO newsletter_migrations (version, name) VALUES (?, ?)';
    await this.executeSql(sql, [migration.version, migration.name]);
  }

  private async removeMigrationRecord(version: string): Promise<void> {
    const sql = 'DELETE FROM newsletter_migrations WHERE version = ?';
    await this.executeSql(sql, [version]);
  }

  private async executeSql(sql: string, params: any[] = []): Promise<any> {
    // This would need to be implemented per adapter
    // For now, just log
    console.log('Executing SQL:', sql.substring(0, 100) + '...');
  }

  private async getCoreTablesMigration(): Promise<string[]> {
    const schema = await getDatabaseSchema(this.dbType);
    return schema.tables;
  }

  private async getDropCoreTablesMigration(): Promise<string[]> {
    return [
      'DROP TABLE IF EXISTS newsletter_subscription_tags CASCADE',
      'DROP TABLE IF EXISTS newsletter_email_bounces CASCADE', 
      'DROP TABLE IF EXISTS newsletter_audit_logs CASCADE',
      'DROP TABLE IF EXISTS newsletter_analytics CASCADE',
      'DROP TABLE IF EXISTS newsletter_unsubscribe_tokens CASCADE',
      'DROP TABLE IF EXISTS newsletter_subscriptions CASCADE'
    ];
  }

  private async getIndexesMigration(): Promise<string[]> {
    const schema = await getDatabaseSchema(this.dbType);
    return schema.indexes;
  }

  private async getDropIndexesMigration(): Promise<string[]> {
    // Index names would need to be collected and dropped
    return ['-- Drop indexes (implementation specific)'];
  }

  private async getFunctionsMigration(): Promise<string[]> {
    const schema = await getDatabaseSchema(this.dbType);
    return [...schema.functions, ...schema.triggers, ...schema.policies];
  }

  private async getDropFunctionsMigration(): Promise<string[]> {
    if (this.dbType === 'sqlite') {
      return ['-- SQLite does not support stored functions'];
    }

    return [
      'DROP FUNCTION IF EXISTS newsletter_update_updated_at_column() CASCADE',
      'DROP FUNCTION IF EXISTS newsletter_get_subscription_count(TEXT) CASCADE',
      'DROP FUNCTION IF EXISTS newsletter_get_growth_stats(TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) CASCADE',
      'DROP FUNCTION IF EXISTS newsletter_update_analytics_for_date(DATE) CASCADE',
      'DROP FUNCTION IF EXISTS newsletter_get_popular_tags(INTEGER) CASCADE',
      'DROP FUNCTION IF EXISTS newsletter_clean_expired_tokens() CASCADE',
      'DROP FUNCTION IF EXISTS newsletter_get_subscription_stats() CASCADE'
    ];
  }

  private async getSeedDataMigration(): Promise<string[]> {
    const schema = await getDatabaseSchema(this.dbType);
    return schema.seeds;
  }

  private async getClearSeedDataMigration(): Promise<string[]> {
    return [
      'DELETE FROM newsletter_subscription_tags WHERE is_system = true',
      'DELETE FROM newsletter_analytics WHERE date >= date(\'now\', \'-7 days\')'
    ];
  }
}

/**
 * Convenience function to run migrations
 */
export async function runMigrations(adapter: DatabaseAdapter, dbType: DatabaseType): Promise<void> {
  const runner = new MigrationRunner(adapter, dbType);
  await runner.runMigrations();
}

/**
 * Convenience function to rollback migrations
 */
export async function rollbackMigration(
  adapter: DatabaseAdapter, 
  dbType: DatabaseType, 
  version?: string
): Promise<void> {
  const runner = new MigrationRunner(adapter, dbType);
  await runner.rollbackMigration(version);
}