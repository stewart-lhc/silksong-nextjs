/**
 * Database Adapters
 * 
 * Unified interface for multiple database backends
 */

export * from './base';
export * from './supabase';
// Optional adapters - require additional dependencies
// export * from './postgresql'; // requires pg package
// export * from './mysql';       // requires mysql2 package  
// export * from './sqlite';      // requires sqlite3 package

import type { DatabaseAdapter, DatabaseConfig, DatabaseType } from '../types';
import { SupabaseAdapter } from './supabase';
// Optional adapters
// import { PostgreSQLAdapter } from './postgresql';
// import { MySQLAdapter } from './mysql';
// import { SQLiteAdapter } from './sqlite';

/**
 * Factory function to create the appropriate database adapter
 */
export function createDatabaseAdapter(config: DatabaseConfig): DatabaseAdapter {
  switch (config.type) {
    case 'supabase':
      return new SupabaseAdapter(config);
    case 'postgresql':
      throw new Error('PostgreSQL adapter requires pg package. Install it with: npm install pg @types/pg');
    case 'mysql':
      throw new Error('MySQL adapter requires mysql2 package. Install it with: npm install mysql2');
    case 'sqlite':
      throw new Error('SQLite adapter requires sqlite3 package. Install it with: npm install sqlite3');
    default:
      throw new Error(`Unsupported database type: ${config.type}`);
  }
}

/**
 * Get schema for database type
 */
export function getDatabaseSchema(type: DatabaseType) {
  switch (type) {
    case 'supabase':
      return import('../schema/postgresql').then(m => m.POSTGRESQL_SCHEMA);
    case 'postgresql':
      throw new Error('PostgreSQL schema requires pg package. Install it with: npm install pg @types/pg');
    case 'mysql':
      throw new Error('MySQL schema requires mysql2 package. Install it with: npm install mysql2');
    case 'sqlite':
      throw new Error('SQLite schema requires sqlite3 package. Install it with: npm install sqlite3');
    default:
      throw new Error(`Unsupported database type: ${type}`);
  }
}