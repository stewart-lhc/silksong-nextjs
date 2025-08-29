/**
 * Newsletter Kit Database Schema
 * 
 * Complete SQL schema definitions for all supported database types
 */

export interface SchemaDefinition {
  tables: string[];
  indexes: string[];
  functions: string[];
  triggers: string[];
  policies: string[];
  seeds: string[];
}

export const SCHEMA_VERSION = '1.0.0';

// Common SQL fragments
export const SQL_FRAGMENTS = {
  // UUID generation - different for each database type
  uuid: {
    postgresql: 'gen_random_uuid()',
    mysql: 'UUID()',
    sqlite: 'lower(hex(randomblob(16)))'
  },
  
  // Timestamp with timezone
  timestamp: {
    postgresql: 'TIMESTAMP WITH TIME ZONE',
    mysql: 'TIMESTAMP',
    sqlite: 'DATETIME'
  },
  
  // JSON data type
  json: {
    postgresql: 'JSONB',
    mysql: 'JSON',
    sqlite: 'TEXT'
  },
  
  // Array type
  array: {
    postgresql: 'TEXT[]',
    mysql: 'JSON',
    sqlite: 'TEXT'
  },
  
  // IP address type
  inet: {
    postgresql: 'INET',
    mysql: 'VARCHAR(45)',
    sqlite: 'TEXT'
  }
};

export * from './postgresql';
export * from './mysql';
export * from './sqlite';