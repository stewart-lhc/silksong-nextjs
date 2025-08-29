/**
 * Newsletter Kit - Complete TypeScript Type Definitions
 * A reusable, type-safe email subscription component system
 * 
 * @version 1.0.0
 * @license MIT
 */

// ========================= BRANDED TYPES =========================
export type Brand<T, K> = T & { __brand: K };

export type ValidatedEmail = Brand<string, 'ValidatedEmail'>;
export type SanitizedEmail = Brand<string, 'SanitizedEmail'>;
export type SubscriptionId = Brand<string, 'SubscriptionId'>;
export type ISOTimestamp = Brand<string, 'ISOTimestamp'>;
export type SubscriberCount = Brand<number, 'SubscriberCount'>;

// ========================= CORE DATA TYPES =========================
export interface BaseSubscription {
  readonly id: SubscriptionId;
  readonly email: ValidatedEmail;
  readonly subscribed_at: ISOTimestamp;
  readonly source?: string;
  readonly status: 'active' | 'unsubscribed' | 'pending';
}

export interface ExtendedSubscription extends BaseSubscription {
  readonly verified: boolean;
  readonly verification_token?: string;
  readonly verification_sent_at?: ISOTimestamp;
  readonly verification_expires_at?: ISOTimestamp;
  readonly unsubscribe_token?: string;
  readonly metadata?: Record<string, unknown>;
  readonly tags?: readonly string[];
}

// ========================= STATE MANAGEMENT =========================
export type SubscriptionStatus = 
  | { type: 'idle' }
  | { type: 'validating'; email: string }
  | { type: 'submitting'; email: ValidatedEmail }
  | { type: 'success'; subscription: BaseSubscription; count: SubscriberCount }
  | { type: 'error'; error: SubscriptionError; email?: string };

// ========================= VALIDATION & RESULTS =========================
export interface EmailValidationResult {
  readonly isValid: boolean;
  readonly sanitizedEmail?: ValidatedEmail;
  readonly error?: string;
  readonly suggestions?: readonly string[];
}

export interface SubscriptionResult {
  readonly success: boolean;
  readonly subscription?: BaseSubscription;
  readonly count?: SubscriberCount;
  readonly error?: SubscriptionError;
  readonly code?: SubscriptionResultCode;
}

export type SubscriptionResultCode = 
  | 'SUCCESS'
  | 'ALREADY_SUBSCRIBED' 
  | 'INVALID_EMAIL'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR';

// ========================= ERROR HANDLING =========================
export interface SubscriptionError {
  readonly code: SubscriptionErrorCode;
  readonly message: string;
  readonly details?: Record<string, unknown>;
  readonly retryable?: boolean;
  readonly retryAfter?: number; // seconds
}

export type SubscriptionErrorCode = 
  | `validation_${string}`
  | `rate_limit_${string}`
  | `database_${string}`
  | `network_${string}`
  | `server_${string}`;

// ========================= DATABASE ADAPTER =========================
export interface DatabaseAdapter<TSubscription = BaseSubscription> {
  // Core operations
  insert(data: Omit<TSubscription, 'id' | 'subscribed_at'>): Promise<TSubscription>;
  findByEmail(email: ValidatedEmail): Promise<TSubscription | null>;
  findById(id: SubscriptionId): Promise<TSubscription | null>;
  update(id: SubscriptionId, data: Partial<TSubscription>): Promise<TSubscription>;
  delete(id: SubscriptionId): Promise<boolean>;
  
  // Analytics & Stats
  count(filters?: SubscriptionFilters): Promise<SubscriberCount>;
  list(options: PaginationOptions & SubscriptionFilters): Promise<PaginatedSubscriptions<TSubscription>>;
  
  // Health & Monitoring
  healthCheck(): Promise<DatabaseHealthStatus>;
}

export interface SubscriptionFilters {
  readonly status?: BaseSubscription['status'];
  readonly source?: string;
  readonly verified?: boolean;
  readonly since?: ISOTimestamp;
  readonly until?: ISOTimestamp;
  readonly tags?: readonly string[];
}

export interface PaginationOptions {
  readonly limit?: number;
  readonly offset?: number;
  readonly orderBy?: keyof BaseSubscription;
  readonly orderDirection?: 'asc' | 'desc';
}

export interface PaginatedSubscriptions<T = BaseSubscription> {
  readonly items: readonly T[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
}

export interface DatabaseHealthStatus {
  readonly healthy: boolean;
  readonly latency: number; // ms
  readonly connections: {
    readonly active: number;
    readonly idle: number;
    readonly total: number;
  };
  readonly lastCheck: ISOTimestamp;
}

// ========================= API TYPES =========================
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly code?: string;
  readonly timestamp: ISOTimestamp;
}

export interface SubscribeRequest {
  readonly email: string;
  readonly source?: string;
  readonly tags?: readonly string[];
  readonly metadata?: Record<string, unknown>;
}

export interface SubscribeResponse extends ApiResponse<{
  subscription: BaseSubscription;
  count: SubscriberCount;
  isNewSubscription: boolean;
}> {}

export interface UnsubscribeRequest {
  readonly token: string;
  readonly reason?: string;
}

export interface StatsResponse extends ApiResponse<{
  total: SubscriberCount;
  today: number;
  thisWeek: number;
  thisMonth: number;
  topSources: Array<{
    source: string;
    count: number;
  }>;
}> {}

// ========================= COMPONENT PROPS =========================
export interface BaseComponentProps {
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly id?: string;
  readonly 'data-testid'?: string;
}

export interface SubscriptionFormProps extends BaseComponentProps {
  // Appearance
  readonly variant?: 'default' | 'outlined' | 'minimal' | 'modern';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly theme?: 'light' | 'dark' | 'auto';
  
  // Behavior
  readonly placeholder?: string;
  readonly submitText?: string;
  readonly loadingText?: string;
  readonly successText?: string;
  
  // Features
  readonly showCount?: boolean;
  readonly showSuccess?: boolean;
  readonly showSource?: boolean;
  readonly autoFocus?: boolean;
  readonly disabled?: boolean;
  
  // Validation
  readonly customValidation?: (email: string) => EmailValidationResult;
  readonly allowedDomains?: readonly string[];
  readonly blockedDomains?: readonly string[];
  
  // Events
  readonly onSuccess?: (result: SubscriptionResult) => void;
  readonly onError?: (error: SubscriptionError) => void;
  readonly onStatusChange?: (status: SubscriptionStatus) => void;
  
  // Advanced
  readonly source?: string;
  readonly tags?: readonly string[];
  readonly metadata?: Record<string, unknown>;
}

export interface SubscriptionModalProps extends SubscriptionFormProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly description?: string;
  readonly closeOnSuccess?: boolean;
  readonly overlay?: boolean;
}

export interface SubscriptionToastProps {
  readonly status: SubscriptionStatus;
  readonly position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  readonly duration?: number;
  readonly dismissible?: boolean;
}

// ========================= CONFIGURATION =========================
export interface NewsletterConfig {
  // Database
  readonly database: {
    readonly adapter: DatabaseAdapter;
    readonly tableName?: string;
  };
  
  // API
  readonly api: {
    readonly baseUrl?: string;
    readonly endpoints: {
      readonly subscribe: string;
      readonly unsubscribe: string;
      readonly stats: string;
    };
    readonly timeout?: number;
    readonly retries?: number;
  };
  
  // Validation
  readonly validation: {
    readonly emailRegex?: RegExp;
    readonly allowedDomains?: readonly string[];
    readonly blockedDomains?: readonly string[];
    readonly maxLength?: number;
  };
  
  // Rate Limiting
  readonly rateLimit: {
    readonly enabled: boolean;
    readonly maxRequests: number;
    readonly windowMs: number;
    readonly skipSuccessfulRequests?: boolean;
  };
  
  // UI Defaults
  readonly ui: {
    readonly theme: 'light' | 'dark' | 'auto';
    readonly variant: 'default' | 'outlined' | 'minimal' | 'modern';
    readonly size: 'sm' | 'md' | 'lg';
    readonly showCount: boolean;
  };
  
  // Messages
  readonly messages: {
    readonly placeholder: string;
    readonly submitText: string;
    readonly loadingText: string;
    readonly successText: string;
    readonly alreadySubscribed: string;
    readonly invalidEmail: string;
    readonly networkError: string;
    readonly serverError: string;
    readonly rateLimitExceeded: string;
  };
  
  // Analytics
  readonly analytics?: {
    readonly trackSubscriptions: boolean;
    readonly trackErrors: boolean;
    readonly customEvents?: Record<string, unknown>;
  };
}

// ========================= HOOKS =========================
export interface UseSubscriptionOptions {
  readonly config?: Partial<NewsletterConfig>;
  readonly onSuccess?: (result: SubscriptionResult) => void;
  readonly onError?: (error: SubscriptionError) => void;
}

export interface UseSubscriptionReturn {
  readonly status: SubscriptionStatus;
  readonly isLoading: boolean;
  readonly isSuccess: boolean;
  readonly isError: boolean;
  readonly error: SubscriptionError | null;
  readonly subscriberCount: SubscriberCount;
  readonly subscribe: (email: string, options?: {
    source?: string;
    tags?: readonly string[];
    metadata?: Record<string, unknown>;
  }) => Promise<SubscriptionResult>;
  readonly reset: () => void;
}

export interface UseSubscriptionStatsReturn {
  readonly data: {
    total: SubscriberCount;
    today: number;
    thisWeek: number;
    thisMonth: number;
    topSources: Array<{
      source: string;
      count: number;
    }>;
  } | null;
  readonly isLoading: boolean;
  readonly error: SubscriptionError | null;
  readonly refresh: () => Promise<void>;
}

// ========================= UTILITIES =========================
export interface ValidationOptions {
  readonly strict?: boolean;
  readonly allowInternational?: boolean;
  readonly suggestCorrections?: boolean;
}

export interface EmailSuggestion {
  readonly original: string;
  readonly suggested: string;
  readonly confidence: number;
  readonly reason: string;
}

// ========================= TYPE GUARDS =========================
export const isValidatedEmail = (email: string): email is ValidatedEmail => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const isSubscriptionId = (id: string): id is SubscriptionId => {
  // UUID v4 pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const isISOTimestamp = (timestamp: string): timestamp is ISOTimestamp => {
  const date = new Date(timestamp);
  return !isNaN(date.getTime()) && date.toISOString() === timestamp;
};

// ========================= CONSTANTS =========================
export const DEFAULT_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
} as const;

export const DEFAULT_MESSAGES = {
  placeholder: 'Enter your email address',
  submitText: 'Subscribe',
  loadingText: 'Subscribing...',
  successText: 'Successfully subscribed!',
  alreadySubscribed: 'You\'re already subscribed!',
  invalidEmail: 'Please enter a valid email address',
  networkError: 'Network error. Please try again.',
  serverError: 'Server error. Please try again later.',
  rateLimitExceeded: 'Too many requests. Please wait and try again.',
} as const;

export const COMMON_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'protonmail.com',
] as const;

// ========================= VERSION =========================
export const VERSION = '1.0.0' as const;
export const BUILD_TIME = new Date().toISOString() as ISOTimestamp;