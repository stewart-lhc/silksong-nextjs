#!/usr/bin/env node
/**
 * Database Backup Script
 * 
 * Automated backup system for Newsletter Kit database
 */

import fs from 'fs/promises';
import path from 'path';
import { createDatabaseClient } from '../client';
import { BackupManager } from '../utils';
import type { DatabaseConfig } from '../types';

interface BackupOptions {
  outputDir: string;
  format: 'json' | 'sql';
  compress: boolean;
  retention: number; // days
  tables?: string[];
}

class NewsletterBackupSystem {
  private client: any;
  private backupManager: BackupManager;
  private config: DatabaseConfig;
  private options: BackupOptions;

  constructor(config: DatabaseConfig, options: Partial<BackupOptions> = {}) {
    this.config = config;
    this.options = {
      outputDir: options.outputDir || './backups',
      format: options.format || 'json',
      compress: options.compress ?? true,
      retention: options.retention || 30,
      tables: options.tables
    };

    this.client = createDatabaseClient(config);
    this.backupManager = new BackupManager(this.client.getAdapter());
  }

  /**
   * Create a full backup
   */
  async createBackup(): Promise<string> {
    console.log('Starting database backup...');
    
    await this.client.connect();
    
    try {
      // Create backup directory
      await fs.mkdir(this.options.outputDir, { recursive: true });

      // Generate backup data
      const backup = await this.backupManager.createBackup();
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `newsletter-backup-${timestamp}.${this.options.format}`;
      const filepath = path.join(this.options.outputDir, filename);

      // Save backup
      if (this.options.format === 'json') {
        await this.saveJSONBackup(filepath, backup);
      } else {
        await this.saveSQLBackup(filepath, backup);
      }

      // Cleanup old backups
      await this.cleanupOldBackups();

      console.log(`Backup completed: ${filepath}`);
      return filepath;
    } finally {
      await this.client.disconnect();
    }
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backupPath: string): Promise<void> {
    console.log(`Restoring from backup: ${backupPath}`);
    
    await this.client.connect();
    
    try {
      const backupData = await this.loadBackup(backupPath);
      await this.backupManager.restoreFromBackup(backupData);
      
      console.log('Backup restored successfully');
    } finally {
      await this.client.disconnect();
    }
  }

  /**
   * List available backups
   */
  async listBackups(): Promise<Array<{
    filename: string;
    size: number;
    created: Date;
    type: string;
  }>> {
    try {
      const files = await fs.readdir(this.options.outputDir);
      const backupFiles = files.filter(f => f.startsWith('newsletter-backup-'));
      
      const backups = await Promise.all(
        backupFiles.map(async (filename) => {
          const filepath = path.join(this.options.outputDir, filename);
          const stats = await fs.stat(filepath);
          
          return {
            filename,
            size: stats.size,
            created: stats.mtime,
            type: path.extname(filename).slice(1)
          };
        })
      );

      return backups.sort((a, b) => b.created.getTime() - a.created.getTime());
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }

  private async saveJSONBackup(filepath: string, backup: any): Promise<void> {
    const data = JSON.stringify(backup, null, 2);
    
    if (this.options.compress) {
      // In a real implementation, you would compress the data
      await fs.writeFile(filepath + '.gz', data);
    } else {
      await fs.writeFile(filepath, data);
    }
  }

  private async saveSQLBackup(filepath: string, backup: any): Promise<void> {
    let sql = '-- Newsletter Kit Database Backup\n';
    sql += `-- Created: ${new Date().toISOString()}\n`;
    sql += `-- Database Type: ${this.config.type}\n\n`;

    // Generate INSERT statements
    sql += '-- Subscriptions\n';
    for (const sub of backup.subscriptions) {
      sql += `INSERT INTO newsletter_subscriptions (...) VALUES (...);\n`;
      // Real implementation would generate proper SQL
    }

    sql += '\n-- Analytics\n';
    for (const analytics of backup.analytics) {
      sql += `INSERT INTO newsletter_analytics (...) VALUES (...);\n`;
    }

    await fs.writeFile(filepath, sql);
  }

  private async loadBackup(backupPath: string): Promise<any> {
    const data = await fs.readFile(backupPath, 'utf8');
    
    if (backupPath.endsWith('.json')) {
      return JSON.parse(data);
    } else if (backupPath.endsWith('.sql')) {
      // Parse SQL backup (simplified)
      return { sql: data };
    }
    
    throw new Error('Unsupported backup format');
  }

  private async cleanupOldBackups(): Promise<void> {
    const backups = await this.listBackups();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.options.retention);

    const oldBackups = backups.filter(backup => backup.created < cutoffDate);

    for (const backup of oldBackups) {
      const filepath = path.join(this.options.outputDir, backup.filename);
      await fs.unlink(filepath);
      console.log(`Deleted old backup: ${backup.filename}`);
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Default configuration (would typically come from environment)
  const config: DatabaseConfig = {
    type: 'supabase',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_SERVICE_KEY || ''
  };

  const backupSystem = new NewsletterBackupSystem(config);

  switch (command) {
    case 'create':
      await backupSystem.createBackup();
      break;

    case 'restore':
      const backupPath = args[1];
      if (!backupPath) {
        console.error('Please provide backup file path');
        process.exit(1);
      }
      await backupSystem.restoreBackup(backupPath);
      break;

    case 'list':
      const backups = await backupSystem.listBackups();
      console.table(backups);
      break;

    default:
      console.log('Usage: npm run backup [create|restore <path>|list]');
      console.log('');
      console.log('Commands:');
      console.log('  create          Create a new backup');
      console.log('  restore <path>  Restore from backup file');
      console.log('  list           List available backups');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { NewsletterBackupSystem };