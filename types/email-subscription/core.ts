/**
 * Core Email Subscription Types
 * 
 * This file contains the foundational type definitions for the email subscription system.
 * Designed for cross-project reusability with strict type safety and extensibility.
 * 
 * Features:
 * - Branded types for email validation
 * - Discriminated unions for state management
 * - Template literal types for styling variants
 * - Utility types for configuration flexibility
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

// =====================================================
// BRANDED TYPES FOR TYPE SAFETY
// =====================================================

/**
 * Branded type for validated email addresses
 * Ensures email has passed validation before being used in the system
 */
export type ValidatedEmail = string & { readonly __brand: 'ValidatedEmail' };

/**
 * Branded type for sanitized email addresses
 * Ensures email has been properly sanitized (trimmed, lowercased)
 */
export type SanitizedEmail = string & { readonly __brand: 'SanitizedEmail' };

/**
 * Branded type for subscription IDs
 * Provides type safety for subscription identifiers
 */
export type SubscriptionId = string & { readonly __brand: 'SubscriptionId' };

/**
 * Branded type for ISO timestamp strings
 * Ensures consistency in timestamp formatting
 */
export type ISOTimestamp = string & { readonly __brand: 'ISOTimestamp' };

// =====================================================
// CORE DATA INTERFACES
// =====================================================

/**
 * Base subscription data interface
 * Represents a subscription record with minimal required fields
 */
export interface BaseSubscription {
  readonly id: SubscriptionId;
  readonly email: ValidatedEmail;
  readonly subscribed_at: ISOTimestamp;
  readonly updated_at: ISOTimestamp;
}

/**
 * Extended subscription interface with optional metadata
 * Supports additional tracking information
 */
export interface ExtendedSubscription extends BaseSubscription {
  readonly source?: SubscriptionSource;
  readonly metadata?: SubscriptionMetadata;
  readonly preferences?: SubscriptionPreferences;
  readonly status: SubscriptionStatus;
  readonly confirmed_at?: ISOTimestamp;
  readonly unsubscribed_at?: ISOTimestamp;
}

/**
 * Subscription source tracking
 * Tracks where the subscription originated
 */
export type SubscriptionSource = 
  | 'web'
  | 'mobile'
  | 'api'
  | 'import'
  | 'admin'
  | 'widget'
  | 'popup'
  | 'footer';

/**
 * Subscription status using discriminated unions
 * Enables type-safe state management
 */
export type SubscriptionStatus = 
  | { type: 'pending'; confirmation_token?: string }
  | { type: 'active'; confirmed_at: ISOTimestamp }
  | { type: 'unsubscribed'; reason?: UnsubscribeReason; unsubscribed_at: ISOTimestamp }
  | { type: 'bounced'; bounce_count: number; last_bounce_at: ISOTimestamp }
  | { type: 'blocked'; reason: string };

/**
 * Unsubscribe reasons for analytics
 */
export type UnsubscribeReason =
  | 'user_requested'
  | 'admin_removed'
  | 'bounced_permanently'
  | 'spam_complaint'
  | 'invalid_email'
  | 'gdpr_deletion';

/**
 * Flexible metadata interface
 * Allows custom fields while maintaining type safety
 */
export interface SubscriptionMetadata {
  readonly ip_address?: string;
  readonly user_agent?: string;
  readonly referrer?: string;
  readonly utm_source?: string;
  readonly utm_medium?: string;
  readonly utm_campaign?: string;
  readonly consent_given?: boolean;
  readonly consent_date?: ISOTimestamp;
  readonly [key: string]: unknown; // Allow additional custom fields
}

/**
 * User preference management
 */
export interface SubscriptionPreferences {
  readonly frequency?: NotificationFrequency;
  readonly categories?: NotificationCategory[];
  readonly language?: string;
  readonly timezone?: string;
  readonly format?: 'html' | 'text';
}

/**
 * Notification frequency options
 */
export type NotificationFrequency =
  | 'immediate'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'on_release_only';

/**
 * Notification categories
 */
export type NotificationCategory =
  | 'releases'
  | 'updates'
  | 'news'
  | 'marketing'
  | 'security'
  | 'admin';

// =====================================================
// VALIDATION AND RESULT TYPES
// =====================================================

/**
 * Email validation result interface
 * Provides detailed feedback on validation attempts
 */
export interface EmailValidationResult {
  readonly isValid: boolean;
  readonly sanitized: SanitizedEmail;
  readonly original: string;
  readonly errors?: EmailValidationError[];
  readonly warnings?: EmailValidationWarning[];
  readonly score?: number; // Validation confidence score (0-100)
}

/**
 * Email validation error types
 */
export type EmailValidationError =
  | { type: 'required'; message: 'Email is required' }
  | { type: 'invalid_format'; message: string; pattern?: string }
  | { type: 'too_long'; message: string; maxLength: number; actualLength: number }
  | { type: 'too_short'; message: string; minLength: number; actualLength: number }
  | { type: 'domain_invalid'; message: string; domain: string }
  | { type: 'disposable_email'; message: string; domain: string }
  | { type: 'role_account'; message: string; localPart: string };

/**
 * Email validation warning types
 */
export type EmailValidationWarning =
  | { type: 'typo_suggestion'; message: string; suggestion: string }
  | { type: 'uncommon_domain'; message: string; domain: string }
  | { type: 'public_domain'; message: string; domain: string };

/**
 * Subscription operation result
 * Generic result type for subscription operations
 */
export type SubscriptionResult<T = ExtendedSubscription> =
  | { success: true; data: T; warnings?: string[] }
  | { success: false; error: SubscriptionError; partial?: Partial<T> };

/**
 * Comprehensive error typing for subscription operations
 */
export interface SubscriptionError {
  readonly code: SubscriptionErrorCode;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly timestamp: ISOTimestamp;
  readonly context?: SubscriptionErrorContext;
}

/**
 * Subscription error codes using template literal types
 */
export type SubscriptionErrorCode =
  | `validation_${EmailValidationErrorType}`
  | `database_${DatabaseErrorType}`
  | `rate_limit_${RateLimitErrorType}`
  | `auth_${AuthErrorType}`
  | `network_${NetworkErrorType}`;

export type EmailValidationErrorType = 
  | 'invalid_format'
  | 'required'
  | 'too_long'
  | 'domain_invalid'
  | 'disposable';

export type DatabaseErrorType =
  | 'duplicate_entry'
  | 'connection_failed'
  | 'constraint_violation'
  | 'transaction_failed'
  | 'timeout';

export type RateLimitErrorType =
  | 'exceeded'
  | 'same_email_too_soon'
  | 'ip_blocked'
  | 'user_blocked';

export type AuthErrorType =
  | 'unauthorized'
  | 'forbidden'
  | 'token_invalid'
  | 'session_expired';

export type NetworkErrorType =
  | 'timeout'
  | 'connection_refused'
  | 'dns_error'
  | 'ssl_error';

/**
 * Error context for debugging
 */
export interface SubscriptionErrorContext {
  readonly operation: string;
  readonly email?: string;
  readonly ip_address?: string;
  readonly user_agent?: string;
  readonly request_id?: string;
  readonly stack_trace?: string;
}

// =====================================================
// GENERIC UTILITY TYPES
// =====================================================

/**
 * Make specific fields optional while keeping others required
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific fields required while keeping others optional
 */
export type RequiredBy<T, K extends keyof T> = Required<Pick<T, K>> & Omit<T, K>;

/**
 * Deep readonly for immutable data structures
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Extract email from subscription types
 */
export type ExtractEmail<T> = T extends { email: infer E } ? E : never;

/**
 * Create branded type helper
 */
export type Brand<T, B> = T & { readonly __brand: B };

/**
 * Type guard helper for branded types
 */
export type TypeGuard<T> = (value: unknown) => value is T;

// =====================================================
// SUBSCRIPTION COLLECTION TYPES
// =====================================================

/**
 * Paginated subscription collection
 */
export interface PaginatedSubscriptions<T extends BaseSubscription = ExtendedSubscription> {
  readonly data: readonly T[];
  readonly pagination: PaginationInfo;
  readonly total_count: number;
  readonly filtered_count?: number;
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  readonly page: number;
  readonly limit: number;
  readonly total_pages: number;
  readonly has_next: boolean;
  readonly has_previous: boolean;
  readonly offset: number;
}

/**
 * Subscription query filters
 */
export interface SubscriptionFilters {
  readonly status?: SubscriptionStatus['type'][];
  readonly source?: SubscriptionSource[];
  readonly date_range?: {
    readonly from: ISOTimestamp;
    readonly to: ISOTimestamp;
  };
  readonly email_pattern?: string;
  readonly has_metadata?: boolean;
  readonly categories?: NotificationCategory[];
}

/**
 * Subscription sort options
 */
export interface SubscriptionSort {
  readonly field: SortableSubscriptionField;
  readonly direction: 'asc' | 'desc';
}

export type SortableSubscriptionField =
  | 'subscribed_at'
  | 'updated_at'
  | 'email'
  | 'status'
  | 'source';

// =====================================================
// EXPORT COLLECTION
// =====================================================

/**
 * All core types for convenient importing
 */
export type {
  // Branded types
  ValidatedEmail,
  SanitizedEmail,
  SubscriptionId,
  ISOTimestamp,
  
  // Data interfaces
  BaseSubscription,
  ExtendedSubscription,
  SubscriptionMetadata,
  SubscriptionPreferences,
  
  // Enums and unions
  SubscriptionSource,
  SubscriptionStatus,
  NotificationFrequency,
  NotificationCategory,
  UnsubscribeReason,
  
  // Validation
  EmailValidationResult,
  EmailValidationError,
  EmailValidationWarning,
  
  // Results and errors
  SubscriptionResult,
  SubscriptionError,
  SubscriptionErrorCode,
  SubscriptionErrorContext,
  
  // Collections
  PaginatedSubscriptions,
  PaginationInfo,
  SubscriptionFilters,
  SubscriptionSort,
  
  // Utilities
  PartialBy,
  RequiredBy,
  DeepReadonly,
  TypeGuard,
  Brand,
} as EmailSubscriptionCoreTypes;