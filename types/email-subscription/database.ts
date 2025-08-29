/**
 * Database Adapter Types for Email Subscription System
 * 
 * This file provides a flexible, ORM-agnostic interface for database operations.
 * Supports multiple database systems (PostgreSQL, MySQL, SQLite, etc.) and 
 * popular ORMs (Supabase, Prisma, TypeORM, Sequelize, etc.).
 * 
 * Features:
 * - Generic database adapter interface
 * - Type-safe query builders
 * - Migration and schema types
 * - Connection pooling configuration
 * - Transaction management
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

import type {
  BaseSubscription,
  ExtendedSubscription,
  SubscriptionId,
  ValidatedEmail,
  ISOTimestamp,
  SubscriptionFilters,
  SubscriptionSort,
  PaginatedSubscriptions,
  SubscriptionResult,
  SubscriptionError,
} from './core';

// =====================================================
// GENERIC DATABASE ADAPTER INTERFACE
// =====================================================

/**
 * Generic database adapter interface
 * Provides a consistent API across different database systems
 */
export interface DatabaseAdapter<T extends BaseSubscription = ExtendedSubscription> {
  // Connection management
  connect(): Promise<DatabaseConnectionResult>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Basic CRUD operations
  insert(subscription: InsertableSubscription<T>): Promise<SubscriptionResult<T>>;
  findById(id: SubscriptionId): Promise<SubscriptionResult<T>>;
  findByEmail(email: ValidatedEmail): Promise<SubscriptionResult<T>>;
  update(id: SubscriptionId, updates: UpdatableSubscription<T>): Promise<SubscriptionResult<T>>;
  delete(id: SubscriptionId): Promise<SubscriptionResult<boolean>>;
  
  // Advanced queries
  findMany(options?: QueryOptions<T>): Promise<SubscriptionResult<PaginatedSubscriptions<T>>>;
  count(filters?: SubscriptionFilters): Promise<SubscriptionResult<number>>;
  exists(email: ValidatedEmail): Promise<SubscriptionResult<boolean>>;
  
  // Batch operations
  insertMany(subscriptions: InsertableSubscription<T>[]): Promise<SubscriptionResult<T[]>>;
  updateMany(filter: SubscriptionFilters, updates: UpdatableSubscription<T>): Promise<SubscriptionResult<number>>;
  deleteMany(filter: SubscriptionFilters): Promise<SubscriptionResult<number>>;
  
  // Transaction support
  transaction<R>(callback: TransactionCallback<T, R>): Promise<SubscriptionResult<R>>;
  
  // Schema operations
  createTable(): Promise<SubscriptionResult<boolean>>;
  dropTable(): Promise<SubscriptionResult<boolean>>;
  migrate(version: string): Promise<SubscriptionResult<MigrationResult>>;
  
  // Health and maintenance
  healthCheck(): Promise<DatabaseHealthStatus>;
  vacuum(): Promise<SubscriptionResult<void>>;
  analyze(): Promise<SubscriptionResult<DatabaseStats>>;
}

// =====================================================
// DATABASE CONNECTION TYPES
// =====================================================

/**
 * Database connection configuration
 */
export interface DatabaseConfig {
  readonly type: DatabaseType;
  readonly connection: ConnectionConfig;
  readonly pool?: PoolConfig;
  readonly ssl?: SSLConfig;
  readonly timeout?: TimeoutConfig;
  readonly logging?: LoggingConfig;
  readonly migrations?: MigrationConfig;
}

/**
 * Supported database types
 */
export type DatabaseType =
  | 'postgresql'
  | 'mysql'
  | 'sqlite'
  | 'mariadb'
  | 'mssql'
  | 'oracle'
  | 'supabase'
  | 'planetscale'
  | 'cockroachdb';

/**
 * Connection configuration
 */
export type ConnectionConfig = 
  | PostgreSQLConfig
  | MySQLConfig  
  | SQLiteConfig
  | SupabaseConfig
  | GenericConfig;

export interface PostgreSQLConfig {
  readonly type: 'postgresql';
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly username: string;
  readonly password: string;
  readonly schema?: string;
}

export interface MySQLConfig {
  readonly type: 'mysql';
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly username: string;
  readonly password: string;
  readonly charset?: string;
  readonly timezone?: string;
}

export interface SQLiteConfig {
  readonly type: 'sqlite';
  readonly filename: string;
  readonly memory?: boolean;
}

export interface SupabaseConfig {
  readonly type: 'supabase';
  readonly url: string;
  readonly anonKey: string;
  readonly serviceRoleKey?: string;
}

export interface GenericConfig {
  readonly type: DatabaseType;
  readonly url: string;
  readonly options?: Record<string, unknown>;
}

/**
 * Connection pool configuration
 */
export interface PoolConfig {
  readonly min: number;
  readonly max: number;
  readonly acquireTimeoutMillis?: number;
  readonly idleTimeoutMillis?: number;
  readonly reapIntervalMillis?: number;
  readonly createRetryIntervalMillis?: number;
  readonly createTimeoutMillis?: number;
  readonly destroyTimeoutMillis?: number;
}

/**
 * SSL configuration
 */
export interface SSLConfig {
  readonly enabled: boolean;
  readonly rejectUnauthorized?: boolean;
  readonly ca?: string;
  readonly cert?: string;
  readonly key?: string;
}

/**
 * Timeout configuration
 */
export interface TimeoutConfig {
  readonly connection?: number;
  readonly query?: number;
  readonly idle?: number;
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  readonly enabled: boolean;
  readonly level?: 'debug' | 'info' | 'warn' | 'error';
  readonly queries?: boolean;
  readonly parameters?: boolean;
  readonly duration?: boolean;
}

/**
 * Migration configuration
 */
export interface MigrationConfig {
  readonly directory: string;
  readonly tableName?: string;
  readonly schemaName?: string;
  readonly autoRun?: boolean;
}

/**
 * Database connection result
 */
export type DatabaseConnectionResult =
  | { success: true; adapter: string; version: string }
  | { success: false; error: SubscriptionError };

// =====================================================
// QUERY AND OPERATION TYPES
// =====================================================

/**
 * Query options for complex database operations
 */
export interface QueryOptions<T extends BaseSubscription> {
  readonly filters?: SubscriptionFilters;
  readonly sort?: SubscriptionSort[];
  readonly pagination?: PaginationOptions;
  readonly select?: (keyof T)[];
  readonly include?: IncludeOptions<T>;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  readonly page?: number;
  readonly limit?: number;
  readonly offset?: number;
  readonly cursor?: string;
}

/**
 * Include options for related data
 */
export interface IncludeOptions<T> {
  readonly metadata?: boolean;
  readonly preferences?: boolean;
  readonly logs?: boolean;
  readonly custom?: Record<string, unknown>;
}

/**
 * Insertable subscription type
 * Omits auto-generated fields from the base subscription
 */
export type InsertableSubscription<T extends BaseSubscription> = Omit<T, 'id' | 'subscribed_at' | 'updated_at'> & {
  readonly email: ValidatedEmail;
  readonly id?: SubscriptionId;
  readonly subscribed_at?: ISOTimestamp;
  readonly updated_at?: ISOTimestamp;
};

/**
 * Updatable subscription type  
 * Makes all fields optional except for system timestamps
 */
export type UpdatableSubscription<T extends BaseSubscription> = Partial<Omit<T, 'id' | 'subscribed_at'>> & {
  readonly updated_at?: ISOTimestamp;
};

/**
 * Transaction callback type
 */
export type TransactionCallback<T extends BaseSubscription, R> = (
  adapter: DatabaseAdapter<T>
) => Promise<R>;

// =====================================================
// SCHEMA AND MIGRATION TYPES
// =====================================================

/**
 * Database table schema definition
 */
export interface TableSchema {
  readonly name: string;
  readonly columns: ColumnDefinition[];
  readonly indexes: IndexDefinition[];
  readonly constraints: ConstraintDefinition[];
}

/**
 * Column definition for schema creation
 */
export interface ColumnDefinition {
  readonly name: string;
  readonly type: ColumnType;
  readonly nullable?: boolean;
  readonly default?: unknown;
  readonly unique?: boolean;
  readonly primaryKey?: boolean;
  readonly autoIncrement?: boolean;
  readonly length?: number;
  readonly precision?: number;
  readonly scale?: number;
}

/**
 * Supported column types
 */
export type ColumnType =
  | 'string'
  | 'text'
  | 'integer'
  | 'bigint'
  | 'decimal'
  | 'float'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'timestamp'
  | 'json'
  | 'uuid'
  | 'enum';

/**
 * Index definition
 */
export interface IndexDefinition {
  readonly name: string;
  readonly columns: string[];
  readonly unique?: boolean;
  readonly type?: 'btree' | 'hash' | 'gin' | 'gist';
}

/**
 * Constraint definition
 */
export interface ConstraintDefinition {
  readonly name: string;
  readonly type: 'primary' | 'unique' | 'foreign' | 'check';
  readonly columns: string[];
  readonly references?: {
    readonly table: string;
    readonly columns: string[];
    readonly onDelete?: 'cascade' | 'restrict' | 'set null';
    readonly onUpdate?: 'cascade' | 'restrict' | 'set null';
  };
  readonly expression?: string; // For check constraints
}

/**
 * Migration definition
 */
export interface Migration {
  readonly version: string;
  readonly name: string;
  readonly up: MigrationFunction;
  readonly down: MigrationFunction;
  readonly dependencies?: string[];
}

/**
 * Migration function type
 */
export type MigrationFunction = (adapter: DatabaseAdapter) => Promise<void>;

/**
 * Migration result
 */
export interface MigrationResult {
  readonly version: string;
  readonly applied: boolean;
  readonly duration: number;
  readonly error?: string;
}

// =====================================================
// HEALTH AND MONITORING TYPES
// =====================================================

/**
 * Database health status
 */
export interface DatabaseHealthStatus {
  readonly healthy: boolean;
  readonly connection: 'connected' | 'disconnected' | 'error';
  readonly response_time: number;
  readonly last_check: ISOTimestamp;
  readonly version?: string;
  readonly metrics?: DatabaseMetrics;
  readonly issues?: string[];
}

/**
 * Database performance metrics
 */
export interface DatabaseMetrics {
  readonly connections: {
    readonly active: number;
    readonly idle: number;
    readonly total: number;
  };
  readonly queries: {
    readonly total: number;
    readonly avg_duration: number;
    readonly slow_queries: number;
  };
  readonly storage: {
    readonly used: number;
    readonly available: number;
    readonly percentage: number;
  };
}

/**
 * Database statistics
 */
export interface DatabaseStats {
  readonly table_count: number;
  readonly row_count: number;
  readonly size_bytes: number;
  readonly index_count: number;
  readonly last_analyzed: ISOTimestamp;
}

// =====================================================
// ORM-SPECIFIC ADAPTER TYPES
// =====================================================

/**
 * Supabase-specific adapter configuration
 */
export interface SupabaseAdapterConfig extends SupabaseConfig {
  readonly realtime?: boolean;
  readonly auth?: boolean;
  readonly storage?: boolean;
  readonly edge_functions?: boolean;
}

/**
 * Prisma-specific adapter configuration
 */
export interface PrismaAdapterConfig {
  readonly datasource: string;
  readonly generator?: string;
  readonly log?: string[];
}

/**
 * TypeORM-specific adapter configuration
 */
export interface TypeORMAdapterConfig {
  readonly entities: string[];
  readonly synchronize?: boolean;
  readonly logging?: boolean;
  readonly cache?: boolean;
}

/**
 * Sequelize-specific adapter configuration
 */
export interface SequelizeAdapterConfig {
  readonly dialect: 'postgres' | 'mysql' | 'mariadb' | 'sqlite' | 'mssql';
  readonly dialectOptions?: Record<string, unknown>;
  readonly define?: Record<string, unknown>;
}

// =====================================================
// FACTORY AND BUILDER TYPES
// =====================================================

/**
 * Database adapter factory
 */
export interface DatabaseAdapterFactory {
  create<T extends BaseSubscription = ExtendedSubscription>(
    config: DatabaseConfig
  ): Promise<DatabaseAdapter<T>>;
}

/**
 * Query builder interface for type-safe queries
 */
export interface QueryBuilder<T extends BaseSubscription> {
  select(fields?: (keyof T)[]): QueryBuilder<T>;
  where(field: keyof T, operator: QueryOperator, value: unknown): QueryBuilder<T>;
  whereIn(field: keyof T, values: unknown[]): QueryBuilder<T>;
  whereBetween(field: keyof T, from: unknown, to: unknown): QueryBuilder<T>;
  orderBy(field: keyof T, direction?: 'asc' | 'desc'): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  offset(count: number): QueryBuilder<T>;
  execute(): Promise<SubscriptionResult<T[]>>;
  first(): Promise<SubscriptionResult<T>>;
  count(): Promise<SubscriptionResult<number>>;
}

/**
 * Query operators
 */
export type QueryOperator =
  | '='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'like'
  | 'ilike'
  | 'in'
  | 'not in'
  | 'is null'
  | 'is not null';

// =====================================================
// EXPORT COLLECTION
// =====================================================

/**
 * All database types for convenient importing
 */
export type {
  // Core adapter
  DatabaseAdapter,
  DatabaseConfig,
  DatabaseType,
  
  // Connection types
  ConnectionConfig,
  PostgreSQLConfig,
  MySQLConfig,
  SQLiteConfig,
  SupabaseConfig,
  GenericConfig,
  PoolConfig,
  SSLConfig,
  TimeoutConfig,
  LoggingConfig,
  MigrationConfig,
  DatabaseConnectionResult,
  
  // Query types
  QueryOptions,
  PaginationOptions,
  IncludeOptions,
  InsertableSubscription,
  UpdatableSubscription,
  TransactionCallback,
  QueryBuilder,
  QueryOperator,
  
  // Schema types
  TableSchema,
  ColumnDefinition,
  ColumnType,
  IndexDefinition,
  ConstraintDefinition,
  Migration,
  MigrationFunction,
  MigrationResult,
  
  // Health and monitoring
  DatabaseHealthStatus,
  DatabaseMetrics,
  DatabaseStats,
  
  // ORM-specific
  SupabaseAdapterConfig,
  PrismaAdapterConfig,
  TypeORMAdapterConfig,
  SequelizeAdapterConfig,
  
  // Factory
  DatabaseAdapterFactory,
} as EmailSubscriptionDatabaseTypes;