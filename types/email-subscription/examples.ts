/**
 * Email Subscription Types - Usage Examples and Best Practices
 * 
 * This file demonstrates comprehensive usage patterns for the email subscription
 * type system. It includes practical examples, common patterns, and best practices
 * for implementing type-safe email subscription functionality.
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

import type {
  // Core types
  ValidatedEmail,
  SubscriptionId,
  ExtendedSubscription,
  SubscriptionResult,
  EmailValidationResult,
  SubscriptionError,
  
  // Database types
  DatabaseAdapter,
  SupabaseAdapterConfig,
  QueryOptions,
  
  // API types
  SubscriptionApiClient,
  ApiResponse,
  SubscribeRequest,
  SubscriptionResponse,
  
  // Component types
  SubscriptionFormProps,
  SubscriptionWidgetProps,
  UseSubscriptionReturn,
  
  // Configuration types
  EmailSubscriptionConfig,
  ValidationConfiguration,
  
  // Event types
  SubscriptionEvent,
  EventEmitter,
  SubscriptionCallbacks,
  
  // Utility types
  Result,
  Brand,
} from './index';

import {
  // Utility functions
  createValidatedEmail,
  isValidatedEmail,
  isSuccessfulSubscriptionResult,
  assertValidatedEmail,
  EmailValidators,
  createValidator,
} from './index';

// =====================================================
// BASIC USAGE EXAMPLES
// =====================================================

/**
 * Example 1: Basic Email Validation
 * Demonstrates how to use branded types for email validation
 */
export function basicEmailValidationExample() {
  // ✅ Type-safe email validation with branded types
  const rawEmail = "user@example.com";
  const validatedEmail = createValidatedEmail(rawEmail);
  
  if (validatedEmail) {
    console.log(`Valid email: ${validatedEmail}`);
    // Type is now ValidatedEmail, not string
    processEmail(validatedEmail);
  } else {
    console.log("Invalid email format");
  }
  
  // ✅ Using type guards
  function processUserInput(input: unknown) {
    if (isValidatedEmail(input)) {
      // TypeScript knows input is ValidatedEmail here
      return subscribeUser(input);
    }
    throw new Error("Invalid email provided");
  }
  
  // ✅ Using assertions (when you're certain)
  function processKnownValidEmail(email: string) {
    assertValidatedEmail(email, "Email must be pre-validated");
    return subscribeUser(email); // TypeScript knows email is ValidatedEmail
  }
}

function processEmail(email: ValidatedEmail) {
  // This function only accepts validated emails
  console.log(`Processing validated email: ${email}`);
}

async function subscribeUser(email: ValidatedEmail): Promise<SubscriptionResult> {
  // Implementation would go here
  return { success: true, data: {} as ExtendedSubscription };
}

/**
 * Example 2: Database Adapter Pattern
 * Shows how to implement a type-safe database adapter
 */
export class SupabaseDatabaseAdapter implements DatabaseAdapter<ExtendedSubscription> {
  private config: SupabaseAdapterConfig;
  
  constructor(config: SupabaseAdapterConfig) {
    this.config = config;
  }
  
  async connect() {
    // Implementation details...
    return { success: true, adapter: 'supabase', version: '2.0.0' } as const;
  }
  
  async disconnect() {
    // Implementation details...
  }
  
  isConnected(): boolean {
    // Implementation details...
    return true;
  }
  
  async insert(subscription: Omit<ExtendedSubscription, 'id' | 'subscribed_at' | 'updated_at'>): Promise<SubscriptionResult<ExtendedSubscription>> {
    try {
      // Validate email before insertion
      if (!isValidatedEmail(subscription.email)) {
        return {
          success: false,
          error: {
            code: 'validation_invalid_format',
            message: 'Invalid email format',
            timestamp: new Date().toISOString() as any,
          }
        };
      }
      
      // Insert logic here...
      const insertedSubscription: ExtendedSubscription = {
        ...subscription,
        id: 'sub_123' as SubscriptionId,
        subscribed_at: new Date().toISOString() as any,
        updated_at: new Date().toISOString() as any,
        status: { type: 'active', confirmed_at: new Date().toISOString() as any },
      };
      
      return { success: true, data: insertedSubscription };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'database_connection_failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString() as any,
        }
      };
    }
  }
  
  async findById(id: SubscriptionId): Promise<SubscriptionResult<ExtendedSubscription>> {
    // Implementation...
    throw new Error('Not implemented');
  }
  
  async findByEmail(email: ValidatedEmail): Promise<SubscriptionResult<ExtendedSubscription>> {
    // Implementation...
    throw new Error('Not implemented');
  }
  
  async update(id: SubscriptionId, updates: Partial<ExtendedSubscription>): Promise<SubscriptionResult<ExtendedSubscription>> {
    // Implementation...
    throw new Error('Not implemented');
  }
  
  async delete(id: SubscriptionId): Promise<SubscriptionResult<boolean>> {
    // Implementation...
    throw new Error('Not implemented');
  }
  
  async findMany(options?: QueryOptions<ExtendedSubscription>) {
    // Implementation...
    throw new Error('Not implemented');
  }
  
  async count() {
    // Implementation...
    throw new Error('Not implemented');
  }
  
  async exists() {
    // Implementation...
    throw new Error('Not implemented');
  }
  
  async insertMany() {
    // Implementation...
    throw new Error('Not implemented');
  }
  
  async updateMany() {
    // Implementation...
    throw new Error('Not implemented');
  }
  
  async deleteMany() {
    // Implementation...
    throw new Error('Not implemented');
  }
  
  async transaction(callback: any) {
    // Implementation...
    throw new Error('Not implemented');
  }
  
  async createTable() {
    // Implementation...
    throw new Error('Not implemented');
  }
  
  async dropTable() {
    // Implementation...
    throw new Error('Not implemented');
  }
  
  async migrate() {
    // Implementation...
    throw new Error('Not implemented');
  }
  
  async healthCheck() {
    // Implementation...
    throw new Error('Not implemented');
  }
  
  async vacuum() {
    // Implementation...
    throw new Error('Not implemented');
  }
  
  async analyze() {
    // Implementation...
    throw new Error('Not implemented');
  }
}

/**
 * Example 3: API Client Implementation
 * Demonstrates type-safe API client usage
 */
export class EmailSubscriptionApiClient implements SubscriptionApiClient {
  private baseUrl: string;
  private apiKey?: string;
  
  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }
  
  async authenticate() {
    throw new Error('Not implemented');
  }
  
  async refreshToken() {
    throw new Error('Not implemented');
  }
  
  async logout() {
    throw new Error('Not implemented');
  }
  
  async subscribe(request: SubscribeRequest): Promise<ApiResponse<SubscriptionResponse>> {
    try {
      // Validate email before sending request
      const validatedEmail = createValidatedEmail(request.email);
      if (!validatedEmail) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid email format',
            field_errors: [{
              field: 'email',
              code: 'invalid_format',
              message: 'Please enter a valid email address',
              value: request.email,
            }],
          },
          timestamp: new Date().toISOString() as any,
          request_id: 'req_123',
          version: '1.0.0',
        };
      }
      
      // Make API request...
      const response = await fetch(`${this.baseUrl}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify({ ...request, email: validatedEmail }),
      });
      
      const data = await response.json();
      
      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.error,
        timestamp: new Date().toISOString() as any,
        request_id: data.request_id || 'unknown',
        version: '1.0.0',
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
        timestamp: new Date().toISOString() as any,
        request_id: 'error_' + Date.now(),
        version: '1.0.0',
      };
    }
  }
  
  async unsubscribe() {
    throw new Error('Not implemented');
  }
  
  async getSubscription() {
    throw new Error('Not implemented');
  }
  
  async updateSubscription() {
    throw new Error('Not implemented');
  }
  
  async subscribeMany() {
    throw new Error('Not implemented');
  }
  
  async getSubscriptions() {
    throw new Error('Not implemented');
  }
  
  async validateEmail(email: string): Promise<ApiResponse<EmailValidationResult>> {
    const result: EmailValidationResult = {
      isValid: EmailValidators.isValidRFC5322(email),
      sanitized: email.trim().toLowerCase() as any,
      original: email,
      score: EmailValidators.isValidRFC5322(email) ? 95 : 0,
    };
    
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString() as any,
      request_id: 'val_' + Date.now(),
      version: '1.0.0',
    };
  }
  
  async getSubscriptionStats() {
    throw new Error('Not implemented');
  }
  
  async health() {
    throw new Error('Not implemented');
  }
  
  async metrics() {
    throw new Error('Not implemented');
  }
}

/**
 * Example 4: React Component with TypeScript
 * Shows how to use component types in React
 */
import React, { useState, useCallback } from 'react';

export const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  onSubmit,
  onSuccess,
  onError,
  validateOnChange = true,
  placeholder = "Enter your email...",
  buttonText = "Subscribe",
  variant = "default",
  size = "md",
  fullWidth = true,
  className = "",
}) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<EmailValidationResult | null>(null);
  
  // Type-safe validation callback
  const validateEmail = useCallback(async (emailValue: string): Promise<EmailValidationResult> => {
    const result: EmailValidationResult = {
      isValid: EmailValidators.isValidRFC5322(emailValue),
      sanitized: emailValue.trim().toLowerCase() as any,
      original: emailValue,
      errors: EmailValidators.isValidRFC5322(emailValue) ? undefined : [
        { type: 'invalid_format', message: 'Please enter a valid email address' }
      ],
    };
    
    setValidationResult(result);
    return result;
  }, []);
  
  // Type-safe form submission
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Validate email
      const validation = await validateEmail(email);
      
      if (!validation.isValid) {
        onError?.({
          code: 'validation_invalid_format',
          message: validation.errors?.[0]?.message || 'Invalid email',
          timestamp: new Date().toISOString() as any,
        });
        return;
      }
      
      // Create validated email
      const validatedEmail = createValidatedEmail(email);
      if (!validatedEmail) {
        throw new Error('Email validation failed');
      }
      
      // Submit with type safety
      await onSubmit?.(validatedEmail);
      onSuccess?.({ success: true, data: {} as ExtendedSubscription });
      
      // Clear form
      setEmail("");
      setValidationResult(null);
      
    } catch (error) {
      onError?.({
        code: 'server_error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString() as any,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, isSubmitting, onSubmit, onSuccess, onError, validateEmail]);
  
  // Type-safe input change handler
  const handleEmailChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEmail(value);
    
    if (validateOnChange && value.length > 0) {
      await validateEmail(value);
    }
  }, [validateOnChange, validateEmail]);
  
  return (
    <form onSubmit={handleSubmit} className={`subscription-form ${className}`}>
      <div className={`form-group ${fullWidth ? 'full-width' : ''}`}>
        <input
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder={placeholder}
          className={`email-input ${variant} ${size} ${validationResult?.isValid === false ? 'error' : ''}`}
          disabled={isSubmitting}
          required
        />
        
        {validationResult && !validationResult.isValid && (
          <div className="validation-error">
            {validationResult.errors?.[0]?.message}
          </div>
        )}
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting || validationResult?.isValid === false}
        className={`subscribe-button ${variant} ${size}`}
      >
        {isSubmitting ? "Subscribing..." : buttonText}
      </button>
    </form>
  );
};

/**
 * Example 5: Custom Hook Implementation
 * Shows how to create a type-safe subscription hook
 */
export function useSubscription(config?: {
  apiClient?: SubscriptionApiClient;
  validateOnMount?: boolean;
}): UseSubscriptionReturn {
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<SubscriptionError | null>(null);
  const [count, setCount] = useState(0);
  
  // Type-safe validation function
  const validate = useCallback(async (): Promise<EmailValidationResult> => {
    const result: EmailValidationResult = {
      isValid: EmailValidators.isValidRFC5322(email),
      sanitized: email.trim().toLowerCase() as any,
      original: email,
    };
    
    setIsValid(result.isValid);
    return result;
  }, [email]);
  
  // Type-safe submission function
  const submit = useCallback(async (): Promise<void> => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const validationResult = await validate();
      
      if (!validationResult.isValid) {
        throw new Error('Email validation failed');
      }
      
      const validatedEmail = createValidatedEmail(email);
      if (!validatedEmail) {
        throw new Error('Failed to create validated email');
      }
      
      // Submit to API
      if (config?.apiClient) {
        const response = await config.apiClient.subscribe({
          email,
          source: 'web',
        });
        
        if (!response.success) {
          throw new Error(response.error?.message || 'Subscription failed');
        }
      }
      
      setIsSuccess(true);
      setCount(prev => prev + 1);
      
    } catch (err) {
      setError({
        code: 'submission_failed',
        message: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString() as any,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, isSubmitting, validate, config?.apiClient]);
  
  const reset = useCallback(() => {
    setEmail("");
    setIsValid(false);
    setIsSubmitting(false);
    setIsSuccess(false);
    setError(null);
  }, []);
  
  const formatEmail = useCallback((rawEmail: string): string => {
    return rawEmail.trim().toLowerCase();
  }, []);
  
  const isEmailTaken = useCallback(async (emailToCheck: string): Promise<boolean> => {
    // Implementation would check against API/database
    return false;
  }, []);
  
  return {
    email,
    isValid,
    isSubmitting,
    isSuccess,
    error,
    count,
    setEmail,
    submit,
    reset,
    validate,
    formatEmail,
    isEmailTaken,
  };
}

/**
 * Example 6: Event-Driven Architecture
 * Demonstrates type-safe event handling
 */
export class SubscriptionEventManager implements EventEmitter<SubscriptionEvent> {
  private listeners: Map<string, Array<(event: any) => void>> = new Map();
  
  // Type-safe event registration
  on<K extends SubscriptionEvent['type']>(
    event: K, 
    listener: (event: Extract<SubscriptionEvent, { type: K }>) => void
  ): void {
    const eventListeners = this.listeners.get(event) || [];
    eventListeners.push(listener);
    this.listeners.set(event, eventListeners);
  }
  
  once<K extends SubscriptionEvent['type']>(
    event: K, 
    listener: (event: Extract<SubscriptionEvent, { type: K }>) => void
  ): void {
    const wrappedListener = (eventData: any) => {
      listener(eventData);
      this.off(event, wrappedListener);
    };
    this.on(event, wrappedListener);
  }
  
  off<K extends SubscriptionEvent['type']>(
    event: K, 
    listener: (event: Extract<SubscriptionEvent, { type: K }>) => void
  ): void {
    const eventListeners = this.listeners.get(event) || [];
    const index = eventListeners.indexOf(listener);
    if (index > -1) {
      eventListeners.splice(index, 1);
      this.listeners.set(event, eventListeners);
    }
  }
  
  emit<K extends SubscriptionEvent['type']>(
    event: K, 
    payload: Extract<SubscriptionEvent, { type: K }>
  ): boolean {
    const eventListeners = this.listeners.get(event) || [];
    eventListeners.forEach(listener => {
      try {
        listener(payload);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
    return eventListeners.length > 0;
  }
  
  async emit_async<K extends SubscriptionEvent['type']>(
    event: K, 
    payload: Extract<SubscriptionEvent, { type: K }>
  ): Promise<boolean> {
    const eventListeners = this.listeners.get(event) || [];
    await Promise.all(
      eventListeners.map(async listener => {
        try {
          await listener(payload);
        } catch (error) {
          console.error(`Error in async event listener for ${event}:`, error);
        }
      })
    );
    return eventListeners.length > 0;
  }
  
  listener_count(event: string): number {
    return this.listeners.get(event)?.length || 0;
  }
  
  event_names(): string[] {
    return Array.from(this.listeners.keys());
  }
  
  remove_all_listeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
  
  on_error(handler: (error: Error, event?: any) => void): void {
    // Implementation for global error handling
  }
}

/**
 * Example 7: Configuration Management
 * Shows how to use configuration types
 */
export function createEmailSubscriptionConfig(): EmailSubscriptionConfig {
  return {
    environment: {
      NODE_ENV: 'development',
      APP_ENV: 'development',
      DEBUG: true,
      VERBOSE_LOGGING: false,
      LOG_LEVEL: 'info',
      BASE_URL: 'http://localhost:3000',
      PORT: 3000,
      HOST: 'localhost',
      CORS_ORIGINS: ['http://localhost:3000'],
    },
    
    database: {
      type: 'supabase',
      DATABASE_URL: 'postgresql://localhost:5432/subscriptions' as any,
      DATABASE_TYPE: 'postgresql',
      DATABASE_NAME: 'subscriptions',
      connection: {
        type: 'supabase',
        url: 'https://your-project.supabase.co',
        anonKey: 'your-anon-key',
      },
    },
    
    api: {
      API_VERSION: '1.0.0',
      API_PREFIX: '/api/v1',
      RATE_LIMIT: {
        ENABLED: true,
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 100,
        SKIP_SUCCESSFUL: false,
        SKIP_FAILED: false,
        STORE: 'memory',
      },
      REQUEST_TIMEOUT: 30000,
      RESPONSE_TIMEOUT: 30000,
      MAX_REQUEST_SIZE: '10mb',
      CORS: {
        ENABLED: true,
        ORIGINS: ['*'],
        METHODS: ['GET', 'POST', 'PUT', 'DELETE'],
        ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
        EXPOSED_HEADERS: [],
        CREDENTIALS: false,
        MAX_AGE: 86400,
      },
      SECURITY_HEADERS: {},
      RETRY: {
        ENABLED: true,
        MAX_ATTEMPTS: 3,
        INITIAL_DELAY: 1000,
        MAX_DELAY: 10000,
        BACKOFF_MULTIPLIER: 2,
        JITTER: true,
        backoff_strategy: 'exponential',
        retry_on: [408, 429, 500, 502, 503, 504],
      },
    },
    
    email: {
      EMAIL_FROM: 'noreply@example.com' as any,
      EMAIL_FROM_NAME: 'Example Newsletter',
      EMAIL_PROVIDER: 'sendgrid',
      TEMPLATE_ENGINE: 'handlebars',
      DEFAULT_LANGUAGE: 'en',
      SUPPORTED_LANGUAGES: ['en', 'es', 'fr'],
      UNSUBSCRIBE_URL: 'https://example.com/unsubscribe',
      CONFIRMATION_URL: 'https://example.com/confirm',
      TRACKING_ENABLED: true,
      BOUNCE_HANDLING: {
        ENABLED: true,
        AUTO_CLEANUP: true,
        SOFT_BOUNCE_LIMIT: 5,
        HARD_BOUNCE_LIMIT: 1,
        COMPLAINT_LIMIT: 1,
        CLEANUP_AFTER_DAYS: 30,
      },
      DELIVERY_OPTIMIZATION: {
        BATCH_SIZE: 100,
        DELAY_BETWEEN_BATCHES: 1000,
        RETRY_FAILED: true,
        PRIORITY_QUEUE: false,
        THROTTLING_ENABLED: true,
        SEND_TIME_OPTIMIZATION: false,
      },
    },
    
    validation: {
      EMAIL_VALIDATION: {
        ENABLED: true,
        STRICT_MODE: false,
        MAX_LENGTH: 254,
        MIN_LENGTH: 5,
        REGEX_PATTERN: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
        CUSTOM_RULES: [],
        WHITELIST_DOMAINS: [],
        BLACKLIST_DOMAINS: [],
      },
      DOMAIN_VALIDATION: {
        DNS_CHECK: false,
        MX_RECORD_CHECK: false,
        SMTP_CHECK: false,
        TIMEOUT: 5000,
        CACHE_TTL: 3600,
        FALLBACK_ON_ERROR: true,
      },
      DISPOSABLE_EMAIL_CHECK: {
        ENABLED: true,
        BLOCK_DISPOSABLE: true,
        UPDATE_FREQUENCY: 'weekly',
        CUSTOM_PROVIDERS: [],
        WHITELIST_EXCEPTIONS: [],
      },
      ROLE_ACCOUNT_CHECK: {
        ENABLED: false,
        BLOCK_ROLE_ACCOUNTS: false,
        ROLE_PREFIXES: ['admin', 'info', 'support', 'noreply'],
        EXCEPTIONS: [],
      },
      TYPO_CORRECTION: {
        ENABLED: true,
        SUGGEST_CORRECTIONS: true,
        CONFIDENCE_THRESHOLD: 0.8,
        MAX_SUGGESTIONS: 3,
        POPULAR_DOMAINS: ['gmail.com', 'yahoo.com', 'outlook.com'],
      },
      REAL_TIME_VALIDATION: {
        ENABLED: true,
        DEBOUNCE_DELAY: 500,
        CACHE_RESULTS: true,
        CACHE_TTL: 300,
        FALLBACK_ON_ERROR: true,
      },
    },
    
    security: {
      ENCRYPTION: {
        ALGORITHM: 'aes-256-gcm',
        KEY_LENGTH: 256,
        SECRET_KEY: 'your-secret-key' as any,
        SALT_ROUNDS: 12,
        ENCRYPT_PII: true,
        ENCRYPT_EMAILS: false,
      },
      AUTHENTICATION: {
        ENABLED: true,
        JWT_SECRET: 'your-jwt-secret' as any,
        JWT_EXPIRES_IN: '1h',
        API_KEY_REQUIRED: false,
        SESSION_TIMEOUT: 3600,
        MFA_ENABLED: false,
      },
      AUTHORIZATION: {
        RBAC_ENABLED: false,
        DEFAULT_ROLE: 'user',
        ADMIN_ROLES: ['admin', 'super_admin'],
        PERMISSIONS: [],
      },
      AUDIT_LOGGING: {
        ENABLED: true,
        LOG_LEVEL: 'info',
        INCLUDE_REQUEST_BODY: false,
        INCLUDE_RESPONSE_BODY: false,
        RETENTION_DAYS: 90,
        ANONYMIZE_PII: true,
      },
      DATA_PROTECTION: {
        ANONYMIZATION: false,
        PSEUDONYMIZATION: false,
        DATA_RETENTION_DAYS: 365,
        AUTO_DELETE: false,
        BACKUP_ENCRYPTION: true,
        ACCESS_LOGGING: true,
      },
      COMPLIANCE: {
        GDPR_ENABLED: true,
        CCPA_ENABLED: false,
        CONSENT_REQUIRED: true,
        PRIVACY_POLICY_URL: 'https://example.com/privacy',
        TERMS_OF_SERVICE_URL: 'https://example.com/terms',
      },
    },
    
    ui: {
      THEME: {
        DEFAULT_THEME: 'light',
        AVAILABLE_THEMES: ['light', 'dark'],
        CUSTOM_THEMES: [],
        DARK_MODE: false,
        AUTO_SWITCH_THEME: false,
        THEME_PERSISTENCE: true,
      },
      COMPONENTS: {
        DEFAULT_SIZE: 'md',
        DEFAULT_VARIANT: 'default',
        DEFAULT_COLOR_SCHEME: 'blue',
        ANIMATION_ENABLED: true,
        COMPACT_MODE: false,
        ROUNDED_CORNERS: true,
        SHOW_LABELS: true,
        SHOW_ICONS: true,
      },
      RESPONSIVE: {
        ENABLED: true,
        BREAKPOINTS: {
          xs: 0,
          sm: 576,
          md: 768,
          lg: 992,
          xl: 1200,
        },
        MOBILE_FIRST: true,
        ADAPTIVE_TEXT: true,
        ADAPTIVE_SPACING: true,
      },
      ACCESSIBILITY: {
        ENABLED: true,
        HIGH_CONTRAST: false,
        REDUCED_MOTION: false,
        KEYBOARD_NAVIGATION: true,
        SCREEN_READER_SUPPORT: true,
        FOCUS_VISIBLE: true,
        ARIA_LABELS: true,
        COLOR_BLIND_SUPPORT: false,
      },
      INTERNATIONALIZATION: {
        ENABLED: false,
        DEFAULT_LOCALE: 'en',
        SUPPORTED_LOCALES: ['en'],
        FALLBACK_LOCALE: 'en',
        LOAD_ON_DEMAND: false,
        CACHE_TRANSLATIONS: true,
        RTL_SUPPORT: false,
      },
      PERFORMANCE: {
        LAZY_LOADING: true,
        CODE_SPLITTING: true,
        BUNDLE_OPTIMIZATION: true,
        IMAGE_OPTIMIZATION: true,
        FONT_OPTIMIZATION: true,
        CSS_OPTIMIZATION: true,
        PRELOAD_CRITICAL: true,
      },
    },
    
    features: {
      FEATURES: [
        {
          name: 'double_opt_in',
          enabled: false,
          description: 'Require email confirmation before subscription',
        },
        {
          name: 'real_time_validation',
          enabled: true,
          description: 'Validate emails in real-time as user types',
        },
      ],
      EXPERIMENTS: [],
      ROLLOUTS: [],
      A_B_TESTS: [],
    },
    
    monitoring: {
      LOGGING: {
        ENABLED: true,
        LEVEL: 'info',
        FORMAT: 'json',
        DESTINATION: 'console',
        ROTATION: {
          max_size: '100MB',
          max_files: 5,
          max_age: '7d',
          compress: true,
        },
        STRUCTURED: true,
        INCLUDE_STACK_TRACE: true,
      },
      METRICS: {
        ENABLED: true,
        PROVIDER: 'prometheus',
        COLLECTION_INTERVAL: 60000,
        RETENTION_PERIOD: '30d',
        CUSTOM_METRICS: [],
      },
      TRACING: {
        ENABLED: false,
        PROVIDER: 'jaeger',
        SAMPLE_RATE: 0.1,
        INCLUDE_SQL: false,
        INCLUDE_HTTP: true,
        CUSTOM_SPANS: false,
      },
      ALERTING: {
        ENABLED: false,
        RULES: [],
        CHANNELS: [],
        ESCALATION: {
          levels: [],
          repeat_interval: '1h',
          max_escalations: 3,
        },
      },
      HEALTH_CHECKS: {
        ENABLED: true,
        INTERVAL: 30000,
        TIMEOUT: 5000,
        CHECKS: [
          {
            name: 'database',
            type: 'database',
            configuration: {},
            critical: true,
            timeout: 5000,
          },
        ],
      },
    },
    
    integrations: {
      ANALYTICS: [],
      MARKETING: [],
      CRM: [],
      WEBHOOKS: [],
      SOCIAL: [],
    },
  };
}

// =====================================================
// BEST PRACTICES AND PATTERNS
// =====================================================

/**
 * Best Practice 1: Result Pattern for Error Handling
 */
export async function safeSubscriptionOperation<T>(
  operation: () => Promise<T>
): Promise<Result<T, SubscriptionError>> {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'operation_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString() as any,
      }
    };
  }
}

/**
 * Best Practice 2: Custom Validator with Composition
 */
export const emailValidatorChain = composeValidators(
  createValidator(
    (value): value is string => typeof value === 'string',
    'Email must be a string'
  ),
  createValidator(
    (value: string) => value.length >= 5,
    'Email must be at least 5 characters'
  ),
  createValidator(
    (value: string) => value.length <= 254,
    'Email must be no more than 254 characters'
  ),
  createValidator(
    (value: string) => EmailValidators.isValidRFC5322(value),
    'Email format is invalid'
  )
);

/**
 * Best Practice 3: Type-Safe Event Subscription Manager
 */
export class TypeSafeSubscriptionManager {
  private eventManager = new SubscriptionEventManager();
  
  // Type-safe callback registration
  onSubscriptionSuccess(callback: (data: ExtendedSubscription) => void) {
    this.eventManager.on('subscription.succeeded', (event) => {
      callback(event.payload.subscription);
    });
  }
  
  onSubscriptionError(callback: (error: SubscriptionError) => void) {
    this.eventManager.on('subscription.failed', (event) => {
      callback(event.payload.error);
    });
  }
  
  onValidationComplete(callback: (result: EmailValidationResult) => void) {
    this.eventManager.on('subscription.validated', (event) => {
      callback(event.payload.validation_result);
    });
  }
  
  // Type-safe event emission
  emitSubscriptionSuccess(subscription: ExtendedSubscription) {
    this.eventManager.emit('subscription.succeeded', {
      type: 'subscription.succeeded',
      id: `event_${Date.now()}` as any,
      timestamp: new Date().toISOString() as any,
      version: 1,
      payload: {
        subscription,
        is_new: true,
        duration: 1000,
      },
    });
  }
}

/**
 * Best Practice 4: Factory Pattern for Database Adapters
 */
export class DatabaseAdapterFactory {
  static async create(config: any): Promise<DatabaseAdapter> {
    switch (config.type) {
      case 'supabase':
        return new SupabaseDatabaseAdapter(config);
      case 'postgresql':
        // return new PostgreSQLDatabaseAdapter(config);
        throw new Error('PostgreSQL adapter not implemented');
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }
}

/**
 * Best Practice 5: Comprehensive Integration Example
 */
export class EmailSubscriptionService {
  constructor(
    private database: DatabaseAdapter,
    private apiClient: SubscriptionApiClient,
    private eventManager: SubscriptionEventManager,
    private config: EmailSubscriptionConfig
  ) {}
  
  async subscribe(email: string, source = 'web'): Promise<SubscriptionResult<ExtendedSubscription>> {
    // 1. Emit validation start event
    this.eventManager.emit('subscription.validating', {
      type: 'subscription.validating',
      id: `event_${Date.now()}` as any,
      timestamp: new Date().toISOString() as any,
      version: 1,
      payload: { email, validation_type: 'server' },
    });
    
    // 2. Validate email with type safety
    const validationResult = await this.validateEmail(email);
    if (!validationResult.success) {
      this.eventManager.emit('subscription.validation_failed', {
        type: 'subscription.validation_failed',
        id: `event_${Date.now()}` as any,
        timestamp: new Date().toISOString() as any,
        version: 1,
        payload: { 
          email, 
          validation_result: validationResult.data!,
          error: validationResult.error!,
        },
      });
      return validationResult;
    }
    
    // 3. Check for existing subscription
    const validatedEmail = createValidatedEmail(email)!;
    const existingResult = await this.database.findByEmail(validatedEmail);
    
    if (isSuccessfulSubscriptionResult(existingResult)) {
      return {
        success: false,
        error: {
          code: 'database_duplicate_entry',
          message: 'Email already subscribed',
          timestamp: new Date().toISOString() as any,
        }
      };
    }
    
    // 4. Create subscription
    const subscriptionResult = await this.database.insert({
      email: validatedEmail,
      status: { type: 'active', confirmed_at: new Date().toISOString() as any },
      source: source as any,
    });
    
    if (isSuccessfulSubscriptionResult(subscriptionResult)) {
      this.eventManager.emit('subscription.succeeded', {
        type: 'subscription.succeeded',
        id: `event_${Date.now()}` as any,
        timestamp: new Date().toISOString() as any,
        version: 1,
        payload: {
          subscription: subscriptionResult.data,
          is_new: true,
          duration: 1000,
        },
      });
    } else {
      this.eventManager.emit('subscription.failed', {
        type: 'subscription.failed',
        id: `event_${Date.now()}` as any,
        timestamp: new Date().toISOString() as any,
        version: 1,
        payload: {
          email: validatedEmail,
          error: subscriptionResult.error,
          retry_count: 0,
          will_retry: false,
        },
      });
    }
    
    return subscriptionResult;
  }
  
  private async validateEmail(email: string): Promise<SubscriptionResult<EmailValidationResult>> {
    return safeSubscriptionOperation(async () => {
      const result = emailValidatorChain(email);
      if (!result.success) {
        throw new Error(result.error.join(', '));
      }
      
      const validationResult: EmailValidationResult = {
        isValid: true,
        sanitized: email.trim().toLowerCase() as any,
        original: email,
        score: 100,
      };
      
      return validationResult;
    });
  }
}

/**
 * Usage Summary:
 * 
 * This examples file demonstrates:
 * 
 * 1. ✅ Basic email validation with branded types
 * 2. ✅ Database adapter implementation
 * 3. ✅ API client with type safety
 * 4. ✅ React component integration
 * 5. ✅ Custom hooks with type safety
 * 6. ✅ Event-driven architecture
 * 7. ✅ Configuration management
 * 8. ✅ Error handling patterns
 * 9. ✅ Composition and factory patterns
 * 10. ✅ Comprehensive service integration
 * 
 * Key Benefits:
 * - Complete type safety across the stack
 * - Runtime validation aligned with types
 * - Extensible and maintainable architecture
 * - Clear separation of concerns
 * - Comprehensive error handling
 * - Event-driven patterns for scalability
 */