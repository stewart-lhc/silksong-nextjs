/**
 * API Client Types for Email Subscription System
 * 
 * This file provides comprehensive type definitions for API operations.
 * Supports REST, GraphQL, and WebSocket APIs with standardized request/response
 * formats, error handling, and authentication patterns.
 * 
 * Features:
 * - Standardized API response formats
 * - Type-safe request/response handling
 * - Comprehensive error type system
 * - Rate limiting and retry mechanisms
 * - Authentication and authorization types
 * - WebSocket real-time updates
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

import type {
  BaseSubscription,
  ExtendedSubscription,
  ValidatedEmail,
  SubscriptionId,
  ISOTimestamp,
  SubscriptionFilters,
  SubscriptionSort,
  PaginatedSubscriptions,
  SubscriptionError,
  SubscriptionResult,
  EmailValidationResult,
} from './core';

// =====================================================
// STANDARD API RESPONSE TYPES
// =====================================================

/**
 * Standard API response wrapper
 * Provides consistent response format across all endpoints
 */
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ApiError;
  readonly message?: string;
  readonly timestamp: ISOTimestamp;
  readonly request_id: string;
  readonly version: string;
}

/**
 * Paginated API response
 * Extends standard response with pagination metadata
 */
export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
  readonly pagination: ApiPaginationMeta;
  readonly total_count: number;
  readonly filtered_count?: number;
}

/**
 * API pagination metadata
 */
export interface ApiPaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total_pages: number;
  readonly has_next: boolean;
  readonly has_previous: boolean;
  readonly next_cursor?: string;
  readonly previous_cursor?: string;
}

// =====================================================
// API ERROR TYPES
// =====================================================

/**
 * Standard API error structure
 * Provides detailed error information for debugging and user feedback
 */
export interface ApiError {
  readonly code: ApiErrorCode;
  readonly message: string;
  readonly details?: ApiErrorDetails;
  readonly field_errors?: FieldError[];
  readonly correlation_id?: string;
  readonly retry_after?: number;
  readonly documentation_url?: string;
}

/**
 * API error codes using template literal types
 */
export type ApiErrorCode =
  | `${HTTPStatusCode}_${ErrorCategory}_${ErrorType}`
  | 'RATE_LIMIT_EXCEEDED'
  | 'AUTHENTICATION_REQUIRED'
  | 'AUTHORIZATION_FAILED'
  | 'VALIDATION_FAILED'
  | 'RESOURCE_NOT_FOUND'
  | 'DUPLICATE_RESOURCE'
  | 'SERVER_ERROR'
  | 'SERVICE_UNAVAILABLE';

export type HTTPStatusCode = 
  | '400' | '401' | '403' | '404' | '409' | '422' | '429'
  | '500' | '502' | '503' | '504';

export type ErrorCategory = 
  | 'CLIENT' | 'SERVER' | 'NETWORK' | 'VALIDATION' | 'AUTH' | 'RATE_LIMIT';

export type ErrorType = 
  | 'INVALID_REQUEST' | 'MISSING_FIELD' | 'INVALID_FORMAT' | 'CONSTRAINT_VIOLATION'
  | 'TIMEOUT' | 'CONNECTION_FAILED' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'QUOTA_EXCEEDED';

/**
 * Detailed error information
 */
export interface ApiErrorDetails {
  readonly field?: string;
  readonly value?: unknown;
  readonly constraint?: string;
  readonly expected?: string;
  readonly actual?: string;
  readonly context?: Record<string, unknown>;
}

/**
 * Field-specific validation errors
 */
export interface FieldError {
  readonly field: string;
  readonly code: string;
  readonly message: string;
  readonly value?: unknown;
}

// =====================================================
// SUBSCRIPTION API ENDPOINTS
// =====================================================

/**
 * Email subscription API client interface
 * Defines all available API operations
 */
export interface SubscriptionApiClient {
  // Authentication
  authenticate(credentials: ApiCredentials): Promise<ApiResponse<AuthToken>>;
  refreshToken(token: RefreshToken): Promise<ApiResponse<AuthToken>>;
  logout(): Promise<ApiResponse<void>>;
  
  // Subscription management
  subscribe(request: SubscribeRequest): Promise<ApiResponse<SubscriptionResponse>>;
  unsubscribe(request: UnsubscribeRequest): Promise<ApiResponse<void>>;
  getSubscription(id: SubscriptionId): Promise<ApiResponse<SubscriptionResponse>>;
  updateSubscription(id: SubscriptionId, updates: UpdateSubscriptionRequest): Promise<ApiResponse<SubscriptionResponse>>;
  
  // Bulk operations
  subscribeMany(request: BulkSubscribeRequest): Promise<ApiResponse<BulkSubscribeResponse>>;
  getSubscriptions(request: GetSubscriptionsRequest): Promise<PaginatedApiResponse<SubscriptionResponse>>;
  
  // Validation and utilities
  validateEmail(email: string): Promise<ApiResponse<EmailValidationResponse>>;
  getSubscriptionStats(): Promise<ApiResponse<SubscriptionStats>>;
  
  // Health and monitoring
  health(): Promise<ApiResponse<HealthStatus>>;
  metrics(): Promise<ApiResponse<ApiMetrics>>;
}

// =====================================================
// REQUEST TYPES
// =====================================================

/**
 * Subscribe request payload
 */
export interface SubscribeRequest {
  readonly email: string;
  readonly source?: string;
  readonly metadata?: SubscriptionMetadata;
  readonly preferences?: SubscriptionPreferences;
  readonly double_opt_in?: boolean;
  readonly consent?: ConsentData;
}

/**
 * Unsubscribe request payload
 */
export interface UnsubscribeRequest {
  readonly email?: ValidatedEmail;
  readonly id?: SubscriptionId;
  readonly token?: string;
  readonly reason?: UnsubscribeReason;
}

/**
 * Update subscription request payload
 */
export interface UpdateSubscriptionRequest {
  readonly email?: string;
  readonly preferences?: Partial<SubscriptionPreferences>;
  readonly metadata?: Partial<SubscriptionMetadata>;
  readonly status?: SubscriptionStatusUpdate;
}

/**
 * Bulk subscribe request payload
 */
export interface BulkSubscribeRequest {
  readonly subscriptions: SubscribeRequest[];
  readonly options?: BulkOperationOptions;
}

/**
 * Get subscriptions request parameters
 */
export interface GetSubscriptionsRequest {
  readonly filters?: SubscriptionFilters;
  readonly sort?: SubscriptionSort[];
  readonly pagination?: PaginationRequest;
  readonly include?: string[];
}

/**
 * Pagination request parameters
 */
export interface PaginationRequest {
  readonly page?: number;
  readonly limit?: number;
  readonly cursor?: string;
  readonly offset?: number;
}

/**
 * Bulk operation options
 */
export interface BulkOperationOptions {
  readonly continue_on_error?: boolean;
  readonly validate_all?: boolean;
  readonly batch_size?: number;
  readonly timeout?: number;
}

/**
 * Consent data for GDPR compliance
 */
export interface ConsentData {
  readonly marketing: boolean;
  readonly analytics: boolean;
  readonly third_party: boolean;
  readonly timestamp: ISOTimestamp;
  readonly ip_address?: string;
  readonly user_agent?: string;
}

/**
 * Subscription status update options
 */
export type SubscriptionStatusUpdate =
  | { type: 'activate' }
  | { type: 'deactivate'; reason?: string }
  | { type: 'confirm'; token: string }
  | { type: 'block'; reason: string };

/**
 * Subscription metadata for API requests
 */
export interface SubscriptionMetadata {
  readonly [key: string]: unknown;
}

/**
 * Subscription preferences for API requests
 */
export interface SubscriptionPreferences {
  readonly frequency?: string;
  readonly categories?: string[];
  readonly language?: string;
  readonly format?: 'html' | 'text';
}

/**
 * Unsubscribe reason options
 */
export type UnsubscribeReason =
  | 'too_frequent'
  | 'not_relevant'
  | 'never_subscribed'
  | 'spam'
  | 'other';

// =====================================================
// RESPONSE TYPES
// =====================================================

/**
 * Subscription response data
 */
export interface SubscriptionResponse extends ExtendedSubscription {
  readonly confirmation_url?: string;
  readonly unsubscribe_url?: string;
  readonly management_url?: string;
}

/**
 * Bulk subscribe response
 */
export interface BulkSubscribeResponse {
  readonly successful: SubscriptionResponse[];
  readonly failed: BulkOperationError[];
  readonly summary: BulkOperationSummary;
}

/**
 * Bulk operation error
 */
export interface BulkOperationError {
  readonly index: number;
  readonly email: string;
  readonly error: ApiError;
}

/**
 * Bulk operation summary
 */
export interface BulkOperationSummary {
  readonly total: number;
  readonly successful: number;
  readonly failed: number;
  readonly skipped: number;
  readonly processing_time: number;
}

/**
 * Email validation API response
 */
export interface EmailValidationResponse extends EmailValidationResult {
  readonly suggestions?: string[];
  readonly risk_score?: number;
  readonly deliverability?: DeliverabilityInfo;
}

/**
 * Email deliverability information
 */
export interface DeliverabilityInfo {
  readonly status: 'deliverable' | 'undeliverable' | 'risky' | 'unknown';
  readonly reason?: string;
  readonly smtp_check?: boolean;
  readonly domain_check?: boolean;
  readonly catch_all?: boolean;
}

/**
 * Subscription statistics
 */
export interface SubscriptionStats {
  readonly total_subscriptions: number;
  readonly active_subscriptions: number;
  readonly recent_subscriptions: number;
  readonly unsubscribe_rate: number;
  readonly growth_rate: number;
  readonly top_sources: Array<{ source: string; count: number }>;
  readonly engagement_metrics?: EngagementMetrics;
}

/**
 * Engagement metrics
 */
export interface EngagementMetrics {
  readonly open_rate: number;
  readonly click_rate: number;
  readonly bounce_rate: number;
  readonly complaint_rate: number;
  readonly last_calculated: ISOTimestamp;
}

// =====================================================
// AUTHENTICATION TYPES
// =====================================================

/**
 * API authentication credentials
 */
export type ApiCredentials =
  | { type: 'api_key'; api_key: string }
  | { type: 'bearer_token'; token: string }
  | { type: 'basic'; username: string; password: string }
  | { type: 'oauth'; client_id: string; client_secret: string };

/**
 * Authentication token response
 */
export interface AuthToken {
  readonly access_token: string;
  readonly token_type: 'Bearer' | 'API';
  readonly expires_in: number;
  readonly expires_at: ISOTimestamp;
  readonly refresh_token?: string;
  readonly scope?: string[];
}

/**
 * Refresh token type
 */
export type RefreshToken = string & { readonly __brand: 'RefreshToken' };

// =====================================================
// CLIENT CONFIGURATION
// =====================================================

/**
 * API client configuration
 */
export interface ApiClientConfig {
  readonly base_url: string;
  readonly version?: string;
  readonly timeout?: number;
  readonly retry_config?: RetryConfig;
  readonly auth?: ApiCredentials;
  readonly headers?: Record<string, string>;
  readonly interceptors?: InterceptorConfig;
  readonly rate_limit?: ClientRateLimitConfig;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  readonly max_attempts: number;
  readonly backoff_strategy: 'linear' | 'exponential' | 'fixed';
  readonly initial_delay: number;
  readonly max_delay: number;
  readonly retry_on: HttpStatusCode[];
}

/**
 * HTTP status codes for retry logic
 */
export type HttpStatusCode = 
  | 408 | 429 | 500 | 502 | 503 | 504;

/**
 * Client-side rate limiting configuration
 */
export interface ClientRateLimitConfig {
  readonly requests_per_second: number;
  readonly burst_size: number;
  readonly queue_size: number;
}

/**
 * Request/response interceptor configuration
 */
export interface InterceptorConfig {
  readonly request?: RequestInterceptor[];
  readonly response?: ResponseInterceptor[];
  readonly error?: ErrorInterceptor[];
}

/**
 * Request interceptor function
 */
export type RequestInterceptor = (
  config: RequestConfig
) => Promise<RequestConfig> | RequestConfig;

/**
 * Response interceptor function
 */
export type ResponseInterceptor = (
  response: ApiResponse
) => Promise<ApiResponse> | ApiResponse;

/**
 * Error interceptor function
 */
export type ErrorInterceptor = (
  error: ApiError
) => Promise<ApiError> | ApiError | void;

/**
 * Request configuration
 */
export interface RequestConfig {
  readonly method: HttpMethod;
  readonly url: string;
  readonly headers?: Record<string, string>;
  readonly query?: Record<string, unknown>;
  readonly body?: unknown;
  readonly timeout?: number;
}

/**
 * HTTP methods
 */
export type HttpMethod = 
  | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

// =====================================================
// REAL-TIME API TYPES (WebSocket)
// =====================================================

/**
 * WebSocket API client for real-time updates
 */
export interface RealtimeApiClient {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(topic: RealtimeTopic, callback: RealtimeCallback): Promise<void>;
  unsubscribe(topic: RealtimeTopic): Promise<void>;
  send(message: RealtimeMessage): Promise<void>;
}

/**
 * Real-time topic types
 */
export type RealtimeTopic =
  | `subscription:${SubscriptionId}`
  | 'subscriptions:count'
  | 'subscriptions:new'
  | 'system:health';

/**
 * Real-time message types
 */
export interface RealtimeMessage {
  readonly type: RealtimeMessageType;
  readonly topic: RealtimeTopic;
  readonly payload: unknown;
  readonly timestamp: ISOTimestamp;
}

/**
 * Real-time message type categories
 */
export type RealtimeMessageType =
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_deleted'
  | 'count_updated'
  | 'system_event';

/**
 * Real-time callback function
 */
export type RealtimeCallback = (message: RealtimeMessage) => void;

// =====================================================
// HEALTH AND MONITORING
// =====================================================

/**
 * API health status
 */
export interface HealthStatus {
  readonly status: 'healthy' | 'degraded' | 'unhealthy';
  readonly checks: HealthCheck[];
  readonly timestamp: ISOTimestamp;
  readonly version: string;
  readonly uptime: number;
}

/**
 * Individual health check
 */
export interface HealthCheck {
  readonly name: string;
  readonly status: 'pass' | 'fail' | 'warn';
  readonly duration: number;
  readonly message?: string;
  readonly details?: Record<string, unknown>;
}

/**
 * API metrics
 */
export interface ApiMetrics {
  readonly requests: RequestMetrics;
  readonly responses: ResponseMetrics;
  readonly performance: PerformanceMetrics;
  readonly errors: ErrorMetrics;
  readonly timestamp: ISOTimestamp;
}

/**
 * Request metrics
 */
export interface RequestMetrics {
  readonly total: number;
  readonly per_second: number;
  readonly by_endpoint: Record<string, number>;
  readonly by_method: Record<HttpMethod, number>;
}

/**
 * Response metrics
 */
export interface ResponseMetrics {
  readonly by_status: Record<string, number>;
  readonly avg_response_time: number;
  readonly p95_response_time: number;
  readonly p99_response_time: number;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  readonly cpu_usage: number;
  readonly memory_usage: number;
  readonly active_connections: number;
  readonly queue_size: number;
}

/**
 * Error metrics
 */
export interface ErrorMetrics {
  readonly total_errors: number;
  readonly error_rate: number;
  readonly by_type: Record<string, number>;
  readonly recent_errors: ApiError[];
}

// =====================================================
// EXPORT COLLECTION
// =====================================================

/**
 * All API types for convenient importing
 */
export type {
  // Core API types
  ApiResponse,
  PaginatedApiResponse,
  ApiPaginationMeta,
  SubscriptionApiClient,
  
  // Error types
  ApiError,
  ApiErrorCode,
  ApiErrorDetails,
  FieldError,
  
  // Request types
  SubscribeRequest,
  UnsubscribeRequest,
  UpdateSubscriptionRequest,
  BulkSubscribeRequest,
  GetSubscriptionsRequest,
  PaginationRequest,
  BulkOperationOptions,
  ConsentData,
  
  // Response types
  SubscriptionResponse,
  BulkSubscribeResponse,
  EmailValidationResponse,
  SubscriptionStats,
  DeliverabilityInfo,
  EngagementMetrics,
  
  // Authentication
  ApiCredentials,
  AuthToken,
  RefreshToken,
  
  // Configuration
  ApiClientConfig,
  RetryConfig,
  ClientRateLimitConfig,
  InterceptorConfig,
  RequestConfig,
  HttpMethod,
  
  // Real-time
  RealtimeApiClient,
  RealtimeTopic,
  RealtimeMessage,
  RealtimeMessageType,
  RealtimeCallback,
  
  // Health and monitoring
  HealthStatus,
  HealthCheck,
  ApiMetrics,
  RequestMetrics,
  ResponseMetrics,
  PerformanceMetrics,
  ErrorMetrics,
} as EmailSubscriptionApiTypes;