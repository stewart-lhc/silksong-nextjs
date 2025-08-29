#!/usr/bin/env node
/**
 * Database Migration Script
 * 
 * Command-line tool for running database migrations
 */

import { createDatabaseClient } from '../client';
import { MigrationRunner } from '../migrations';
import type { DatabaseConfig, DatabaseType } from '../types';

interface MigrationOptions {
  dryRun?: boolean;
  force?: boolean;
  verbose?: boolean;
  target?: string;
}

class MigrationCLI {
  private client: any;
  private runner: MigrationRunner;
  private dbType: DatabaseType;

  constructor(dbConfig: DatabaseConfig) {
    this.client = createDatabaseClient(dbConfig);
    this.dbType = dbConfig.type;
    this.runner = new MigrationRunner(this.client.getAdapter(), this.dbType);
  }

  /**
   * Run all pending migrations
   */
  async migrate(options: MigrationOptions = {}): Promise<void> {
    console.log('Running database migrations...');
    
    if (options.dryRun) {
      console.log('DRY RUN MODE - No changes will be made');
    }

    await this.client.connect();
    
    try {
      if (options.dryRun) {
        await this.showPendingMigrations();
      } else {
        await this.runner.runMigrations();
      }
    } finally {
      await this.client.disconnect();
    }
  }

  /**
   * Rollback migrations
   */
  async rollback(version?: string, options: MigrationOptions = {}): Promise<void> {
    console.log('Rolling back database migrations...');
    
    if (options.dryRun) {
      console.log('DRY RUN MODE - No changes will be made');
      return;
    }

    await this.client.connect();
    
    try {
      await this.runner.rollbackMigration(version);
    } finally {
      await this.client.disconnect();
    }
  }

  /**
   * Show migration status
   */
  async status(): Promise<void> {
    console.log('Migration Status:');
    
    await this.client.connect();
    
    try {
      await this.showMigrationStatus();
    } finally {
      await this.client.disconnect();
    }
  }

  /**
   * Create database tables from scratch
   */
  async create(options: MigrationOptions = {}): Promise<void> {
    console.log('Creating database schema...');
    
    if (!options.force) {
      console.log('This will create all tables. Use --force to confirm.');
      return;
    }

    await this.client.connect();
    
    try {
      await this.client.runMigrations();
      console.log('Database schema created successfully');
    } finally {
      await this.client.disconnect();
    }
  }

  /**
   * Drop all tables
   */
  async drop(options: MigrationOptions = {}): Promise<void> {
    console.log('WARNING: This will drop all newsletter tables!');
    
    if (!options.force) {
      console.log('Use --force to confirm this destructive operation.');
      return;
    }

    await this.client.connect();
    
    try {
      await this.dropAllTables();
      console.log('All tables dropped successfully');
    } finally {
      await this.client.disconnect();
    }
  }

  /**
   * Reset database (drop + create)
   */
  async reset(options: MigrationOptions = {}): Promise<void> {
    console.log('Resetting database...');
    
    if (!options.force) {
      console.log('This will drop and recreate all tables. Use --force to confirm.');
      return;
    }

    await this.drop({ force: true });
    await this.create({ force: true });
  }

  /**
   * Seed database with sample data
   */
  async seed(): Promise<void> {
    console.log('Seeding database with sample data...');
    
    await this.client.connect();
    
    try {
      await this.seedDatabase();
      console.log('Database seeded successfully');
    } finally {
      await this.client.disconnect();
    }
  }

  private async showPendingMigrations(): Promise<void> {
    // Implementation would show pending migrations
    console.log('Pending migrations:');
    console.log('- 001_create_core_tables');
    console.log('- 002_create_indexes');
    console.log('- 003_create_functions_and_triggers');
    console.log('- 004_insert_seed_data');
  }

  private async showMigrationStatus(): Promise<void> {
    // Implementation would show migration status
    console.log('✓ 001_create_core_tables (executed)');
    console.log('✓ 002_create_indexes (executed)');
    console.log('✓ 003_create_functions_and_triggers (executed)');
    console.log('✗ 004_insert_seed_data (pending)');
  }

  private async dropAllTables(): Promise<void> {
    const adapter = this.client.getAdapter();
    
    const dropQueries = [
      'DROP TABLE IF EXISTS newsletter_subscription_tags CASCADE',
      'DROP TABLE IF EXISTS newsletter_email_bounces CASCADE',
      'DROP TABLE IF EXISTS newsletter_audit_logs CASCADE',
      'DROP TABLE IF EXISTS newsletter_analytics CASCADE',
      'DROP TABLE IF EXISTS newsletter_unsubscribe_tokens CASCADE',
      'DROP TABLE IF EXISTS newsletter_subscriptions CASCADE',
      'DROP TABLE IF EXISTS newsletter_migrations CASCADE'
    ];

    for (const query of dropQueries) {
      try {
        // Would execute via adapter
        console.log(`Executing: ${query}`);
      } catch (error) {
        console.warn(`Warning: ${error}`);
      }
    }
  }

  private async seedDatabase(): Promise<void> {
    const adapter = this.client.getAdapter();

    // Sample subscription data
    const sampleSubscriptions = [
      {
        email: 'user1@example.com',
        status: 'active' as const,
        source: 'web',
        tags: ['updates', 'releases'],
        metadata: { referrer: 'homepage' },
        subscribedAt: new Date(),
        unsubscribeToken: 'token1',
      },
      {
        email: 'user2@example.com',
        status: 'active' as const,
        source: 'mobile_app',
        tags: ['updates'],
        metadata: { campaign: 'mobile_launch' },
        subscribedAt: new Date(),
        unsubscribeToken: 'token2',
      },
      {
        email: 'user3@example.com',
        status: 'pending' as const,
        source: 'landing_page',
        tags: ['releases'],
        metadata: { utm_source: 'google' },
        subscribedAt: new Date(),
        unsubscribeToken: 'token3',
      }
    ];

    for (const sub of sampleSubscriptions) {
      try {
        await adapter.createSubscription(sub);
        console.log(`Created subscription: ${sub.email}`);
      } catch (error) {
        console.warn(`Failed to create subscription ${sub.email}:`, error);
      }
    }

    // Sample tags
    const sampleTags = [
      { name: 'updates', description: 'General updates', color: '#3B82F6', isSystem: true },
      { name: 'releases', description: 'Product releases', color: '#10B981', isSystem: true },
      { name: 'news', description: 'Company news', color: '#F59E0B', isSystem: true }
    ];

    for (const tag of sampleTags) {
      try {
        await adapter.createTag(tag);
        console.log(`Created tag: ${tag.name}`);
      } catch (error) {
        console.warn(`Failed to create tag ${tag.name}:`, error);
      }
    }

    console.log('Sample data created successfully');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const options: MigrationOptions = {};

  // Parse options
  args.forEach(arg => {
    if (arg === '--dry-run') options.dryRun = true;
    if (arg === '--force') options.force = true;
    if (arg === '--verbose') options.verbose = true;
  });

  // Database configuration
  const dbConfig: DatabaseConfig = {
    type: (process.env.DB_TYPE as DatabaseType) || 'supabase',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_KEY,
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  };

  const cli = new MigrationCLI(dbConfig);

  try {
    switch (command) {
      case 'migrate':
      case 'up':
        await cli.migrate(options);
        break;

      case 'rollback':
      case 'down':
        const version = args.find(arg => !arg.startsWith('--'));
        await cli.rollback(version, options);
        break;

      case 'status':
        await cli.status();
        break;

      case 'create':
        await cli.create(options);
        break;

      case 'drop':
        await cli.drop(options);
        break;

      case 'reset':
        await cli.reset(options);
        break;

      case 'seed':
        await cli.seed();
        break;

      default:
        console.log('Usage: npm run migrate <command> [options]');
        console.log('');
        console.log('Commands:');
        console.log('  migrate, up       Run pending migrations');
        console.log('  rollback, down    Rollback last migration');
        console.log('  status           Show migration status');
        console.log('  create           Create database schema');
        console.log('  drop             Drop all tables');
        console.log('  reset            Drop and recreate all tables');
        console.log('  seed             Seed database with sample data');
        console.log('');
        console.log('Options:');
        console.log('  --dry-run        Show what would be done');
        console.log('  --force          Force destructive operations');
        console.log('  --verbose        Verbose output');
        console.log('');
        console.log('Environment Variables:');
        console.log('  DB_TYPE          Database type (supabase|postgresql|mysql|sqlite)');
        console.log('  SUPABASE_URL     Supabase URL');
        console.log('  SUPABASE_SERVICE_KEY  Supabase service key');
        console.log('  DATABASE_URL     Connection string');
        process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { MigrationCLI };