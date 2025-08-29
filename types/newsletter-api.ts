/**
 * Newsletter API Types
 * Comprehensive type definitions for the Newsletter API
 */

// Base response structure
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
  details?: Record<string, any>;
  timestamp?: string;
  path?: string;
}

// Error response structure
export interface ErrorResponse {
  error: string;
  code: string;
  details?: Record<string, any>;
  timestamp: string;
  path: string;
}

// Subscription status enum
export type SubscriptionStatus = 'pending' | 'active' | 'unsubscribed' | 'bounced';

// Unsubscription reason enum
export type UnsubscriptionReason = 
  | 'too_frequent' 
  | 'not_relevant' 
  | 'never_signed_up' 
  | 'temporary' 
  | 'other';

// Bounce type enum
export type BounceType = 'hard' | 'soft' | 'complaint';

// Base subscription interface
export interface Subscription {
  id: string;
  email: string;
  status: SubscriptionStatus;
  source: string;
  tags: string[];
  metadata: Record<string, any>;
  subscribed_at: string;
  confirmed_at?: string | null;
  unsubscribed_at?: string | null;
  confirmation_token?: string | null;
  unsubscribe_token: string;
  ip_address?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  created_at: string;
  updated_at: string;
}

// Subscription creation input
export interface CreateSubscriptionData {
  email: string;
  source?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

// =============================================================================
// REQUEST/RESPONSE TYPES
// =============================================================================

// Subscribe endpoint
export interface SubscribeRequest {
  email: string;
  source?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface SubscribeResponse extends ApiResponse {
  data: {
    subscription: Subscription;
  };
}

// Unsubscribe endpoint
export interface UnsubscribeRequest {
  email?: string;
  token?: string;
  reason?: UnsubscriptionReason;
  feedback?: string;
}

export interface UnsubscribeResponse extends ApiResponse {
  data: {
    email: string;
    unsubscribed_at: string;
    reason?: UnsubscriptionReason | null;
    can_resubscribe: boolean;
  };
}

// Confirm subscription endpoint
export interface ConfirmRequest {
  token: string;
}

export interface ConfirmResponse extends ApiResponse {
  data: {
    email: string;
    confirmed_at: string;
    status: SubscriptionStatus;
  };
}

// Statistics endpoint
export interface StatsRequest {
  period?: 'day' | 'week' | 'month' | 'year';
  start_date?: string;
  end_date?: string;
  group_by?: 'day' | 'week' | 'month' | 'source' | 'tag';
  source?: string;
  tag?: string;
}

export interface StatsSummary {
  total_subscriptions: number;
  active_subscriptions: number;
  unsubscribed: number;
  pending_confirmation: number;
  bounced?: number;
  growth_rate: number;
  churn_rate: number;
}

export interface PeriodData {
  period: string;
  subscriptions: number;
  unsubscriptions: number;
  confirmations: number;
  bounces?: number;
  net_growth: number;
}

export interface SourceData {
  source: string;
  count: number;
  percentage: number;
}

export interface TagData {
  tag: string;
  count: number;
  percentage: number;
}

export interface StatsMeta {
  period: string;
  start_date: string;
  end_date: string;
  total_records: number;
  cache_expires_at: string;
}

export interface StatsResponse extends ApiResponse {
  data: {
    summary: StatsSummary;
    period_data: PeriodData[];
    sources: SourceData[];
    tags: TagData[];
  };
  meta: StatsMeta;
}

// Bulk operations
export type BulkOperation = 'subscribe' | 'unsubscribe' | 'update_tags' | 'export';

export interface BulkRequest {
  operation: BulkOperation;
  emails: string[];
  source?: string;
  tags?: string[];
  reason?: UnsubscriptionReason;
  skip_confirmation?: boolean;
  metadata?: Record<string, any>;
}

export interface BulkResult {
  email: string;
  status: 'success' | 'error' | 'skipped';
  id?: string | null;
  error?: string | null;
  reason?: string | null;
}

export interface BulkResponse extends ApiResponse {
  data: {
    operation: BulkOperation;
    processed: number;
    successful: number;
    failed: number;
    skipped?: number;
    results: BulkResult[];
  };
}

// Migration operations
export type MigrationSource = 'mailchimp' | 'convertkit' | 'custom' | 'csv';

export interface MigrateSubscriptionData {
  email: string;
  subscribed_at?: string;
  confirmed?: boolean;
  tags?: string[];
  source?: string;
  metadata?: Record<string, any>;
  status?: SubscriptionStatus;
}

export interface MigrateRequest {
  source_system: MigrationSource;
  data: MigrateSubscriptionData[];
  default_source?: string;
  default_tags?: string[];
  skip_duplicates?: boolean;
  update_existing?: boolean;
}

export interface MigrateResult {
  email: string;
  status: 'migrated' | 'skipped' | 'failed' | 'updated';
  reason?: string | null;
  id?: string | null;
  original_data?: MigrateSubscriptionData;
}

export interface MigrateResponse extends ApiResponse {
  data: {
    source_system: MigrationSource;
    migrated: number;
    skipped: number;
    failed: number;
    updated?: number;
    total_processed: number;
    details: MigrateResult[];
  };
}

// =============================================================================
// DATABASE TYPES
// =============================================================================

// Unsubscription log entry
export interface UnsubscriptionLog {
  id: string;
  subscription_id?: string | null;
  email: string;
  reason?: UnsubscriptionReason | null;
  feedback?: string | null;
  unsubscribed_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
  created_at: string;
}

// Analytics entry
export interface SubscriptionAnalytics {
  id: string;
  date: string;
  source?: string | null;
  tag?: string | null;
  subscriptions_count: number;
  unsubscriptions_count: number;
  confirmations_count: number;
  bounces_count: number;
  net_growth: number;
  created_at: string;
  updated_at: string;
}

// Email bounce entry
export interface EmailBounce {
  id: string;
  email: string;
  bounce_type: BounceType;
  bounce_reason?: string | null;
  bounced_at: string;
  provider_response?: Record<string, any> | null;
  created_at: string;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

// Rate limiting information
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  resetTime: number;
}

// Validation result
export interface ValidationResult<T = any> {
  isValid: boolean;
  sanitized?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// Database query filters
export interface SubscriptionFilters {
  status?: SubscriptionStatus | SubscriptionStatus[];
  source?: string | string[];
  tags?: string | string[];
  start_date?: string;
  end_date?: string;
  email?: string;
  confirmed?: boolean;
  limit?: number;
  offset?: number;
  order_by?: 'subscribed_at' | 'email' | 'status' | 'source';
  order_direction?: 'asc' | 'desc';
}

// Analytics query parameters
export interface AnalyticsQuery {
  start_date: string;
  end_date: string;
  group_by?: 'day' | 'week' | 'month' | 'source' | 'tag';
  source_filter?: string;
  tag_filter?: string;
  include_totals?: boolean;
}

// =============================================================================
// SDK/CLIENT TYPES
// =============================================================================

// Client configuration
export interface NewsletterClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  userAgent?: string;
}

// Client options for requests
export interface RequestOptions {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

// Webhook event types
export type WebhookEventType = 
  | 'subscription.created'
  | 'subscription.confirmed'
  | 'subscription.unsubscribed'
  | 'subscription.bounced'
  | 'subscription.updated';

// Webhook payload
export interface WebhookPayload {
  event: WebhookEventType;
  data: Subscription;
  timestamp: string;
  signature?: string;
}

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

// API configuration
export interface ApiConfig {
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  cache: {
    enabled: boolean;
    ttl: number; // Time to live in seconds
  };
  validation: {
    maxEmailLength: number;
    maxTagLength: number;
    maxTags: number;
    maxMetadataSize: number;
    maxFeedbackLength: number;
  };
  features: {
    doubleOptIn: boolean;
    unsubscribeToken: boolean;
    analytics: boolean;
    webhooks: boolean;
    bulkOperations: boolean;
  };
}

// Database configuration
export interface DatabaseConfig {
  type: 'supabase' | 'postgresql' | 'mysql' | 'sqlite';
  connection: {
    url?: string;
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
  };
  pool?: {
    min: number;
    max: number;
  };
  ssl?: boolean;
}

// =============================================================================
// ERROR TYPES
// =============================================================================

// API Error codes
export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  ALREADY_SUBSCRIBED = 'ALREADY_SUBSCRIBED',
  EMAIL_NOT_FOUND = 'EMAIL_NOT_FOUND',
  INVALID_TOKEN = 'INVALID_TOKEN',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INVALID_CONTENT_TYPE = 'INVALID_CONTENT_TYPE',
  INVALID_JSON = 'INVALID_JSON',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  BULK_LIMIT_EXCEEDED = 'BULK_LIMIT_EXCEEDED'
}

// Custom error class
export class NewsletterApiError extends Error {
  constructor(
    message: string,
    public code: ApiErrorCode | string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'NewsletterApiError';
  }
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isSubscription(obj: any): obj is Subscription {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string';
}

export function isErrorResponse(obj: any): obj is ErrorResponse {
  return obj && typeof obj.error === 'string' && typeof obj.code === 'string';
}

export function isApiResponse<T>(obj: any): obj is ApiResponse<T> {
  return obj && typeof obj.success === 'boolean';
}

// =============================================================================
// UTILITY TYPE HELPERS
// =============================================================================

// Make certain fields optional for updates
export type PartialSubscription = Partial<Omit<Subscription, 'id' | 'email' | 'created_at'>>;

// Database insert type (auto-generated fields optional)
export type SubscriptionInsert = Omit<Subscription, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

// Database update type (only updatable fields)
export type SubscriptionUpdate = Partial<Pick<
  Subscription,
  'status' | 'tags' | 'metadata' | 'confirmed_at' | 'unsubscribed_at' | 'updated_at'
>>;

// Export all types for easy importing
export type {
  Subscription,
  CreateSubscriptionData,
  UnsubscriptionLog,
  SubscriptionAnalytics,
  EmailBounce
};

// Type assertion helpers
export const assertSubscription = (obj: any): Subscription => {
  if (!isSubscription(obj)) {
    throw new Error('Invalid subscription object');
  }
  return obj;
};

export const assertApiResponse = <T>(obj: any): ApiResponse<T> => {
  if (!isApiResponse(obj)) {
    throw new Error('Invalid API response object');
  }
  return obj;
};