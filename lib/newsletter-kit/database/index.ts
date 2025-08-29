/**
 * Newsletter Kit Database Module
 * 
 * Complete database solution for newsletter subscription management
 * Supports multiple database backends with TypeScript type safety
 */

export * from './adapters';
export * from './migrations';
export * from './schema';
export * from './types';
export * from './client';
export * from './utils';

// Default exports for common use cases
export { createDatabaseClient } from './client';
export { runMigrations } from './migrations';
export type { 
  NewsletterSubscription, 
  NewsletterAnalytics, 
  NewsletterAuditLog,
  UnsubscribeToken,
  DatabaseAdapter,
  DatabaseConfig 
} from './types';