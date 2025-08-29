/**
 * Configuration System Types for Email Subscription
 * 
 * This file provides comprehensive configuration types for the email subscription
 * system, including environment variables, validation rules, UI theming, and
 * feature toggles. Designed for maximum flexibility while ensuring type safety.
 * 
 * Features:
 * - Environment variable validation with branded types
 * - Hierarchical configuration structure  
 * - Feature flag system with type safety
 * - Theme and UI configuration
 * - Multi-environment support
 * - Runtime configuration validation
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

import type {
  ComponentSize,
  ComponentVariant,
  ColorScheme,
  AnimationVariant,
} from './components';
import type {
  DatabaseConfig,
  DatabaseType,
} from './database';
import type {
  ApiClientConfig,
  RetryConfig,
} from './api';

// =====================================================
// BRANDED ENVIRONMENT TYPES
// =====================================================

/**
 * Branded types for environment variables to ensure validation
 */
export type EnvironmentName = 'development' | 'staging' | 'production' | 'test';
export type DatabaseURL = string & { readonly __brand: 'DatabaseURL' };
export type ApiKey = string & { readonly __brand: 'ApiKey' };
export type SecretKey = string & { readonly __brand: 'SecretKey' };
export type WebhookURL = string & { readonly __brand: 'WebhookURL' };
export type EmailAddress = string & { readonly __brand: 'EmailAddress' };
export type Domain = string & { readonly __brand: 'Domain' };

// =====================================================
// CORE CONFIGURATION INTERFACE
// =====================================================

/**
 * Master configuration interface
 * Contains all configuration sections for the email subscription system
 */
export interface EmailSubscriptionConfig {
  readonly environment: EnvironmentConfig;
  readonly database: DatabaseConfiguration;
  readonly api: ApiConfiguration;
  readonly email: EmailConfiguration;
  readonly validation: ValidationConfiguration;
  readonly security: SecurityConfiguration;
  readonly ui: UIConfiguration;
  readonly features: FeatureConfiguration;
  readonly monitoring: MonitoringConfiguration;
  readonly integrations: IntegrationsConfiguration;
}

// =====================================================
// ENVIRONMENT CONFIGURATION
// =====================================================

/**
 * Environment-specific configuration
 * Handles different deployment environments
 */
export interface EnvironmentConfig {
  readonly NODE_ENV: EnvironmentName;
  readonly APP_ENV: EnvironmentName;
  readonly DEBUG: boolean;
  readonly VERBOSE_LOGGING: boolean;
  readonly LOG_LEVEL: LogLevel;
  readonly BASE_URL: string;
  readonly PORT: number;
  readonly HOST: string;
  readonly CORS_ORIGINS: string[];
  readonly TRUSTED_PROXIES?: string[];
  readonly MAINTENANCE_MODE?: boolean;
}

/**
 * Logging levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

// =====================================================
// DATABASE CONFIGURATION
// =====================================================

/**
 * Database configuration with environment overrides
 */
export interface DatabaseConfiguration extends DatabaseConfig {
  readonly DATABASE_URL: DatabaseURL;
  readonly DATABASE_TYPE: DatabaseType;
  readonly DATABASE_NAME: string;
  readonly DATABASE_HOST?: string;
  readonly DATABASE_PORT?: number;
  readonly DATABASE_USER?: string;
  readonly DATABASE_PASSWORD?: SecretKey;
  readonly DATABASE_SSL?: boolean;
  readonly CONNECTION_POOL_SIZE?: number;
  readonly CONNECTION_TIMEOUT?: number;
  readonly QUERY_TIMEOUT?: number;
  readonly MIGRATION_AUTO_RUN?: boolean;
  readonly BACKUP_ENABLED?: boolean;
  readonly BACKUP_SCHEDULE?: CronExpression;
}

/**
 * Cron expression type for scheduling
 */
export type CronExpression = string & { readonly __brand: 'CronExpression' };

// =====================================================
// API CONFIGURATION  
// =====================================================

/**
 * API server configuration
 */
export interface ApiConfiguration extends Partial<ApiClientConfig> {
  readonly API_VERSION: string;
  readonly API_PREFIX: string;
  readonly API_KEY?: ApiKey;
  readonly WEBHOOK_SECRET?: SecretKey;
  readonly WEBHOOK_URL?: WebhookURL;
  readonly RATE_LIMIT: RateLimitConfig;
  readonly REQUEST_TIMEOUT: number;
  readonly RESPONSE_TIMEOUT: number;
  readonly MAX_REQUEST_SIZE: string;
  readonly CORS: CorsConfiguration;
  readonly SECURITY_HEADERS: SecurityHeaders;
  readonly RETRY: RetryConfiguration;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  readonly ENABLED: boolean;
  readonly WINDOW_MS: number;
  readonly MAX_REQUESTS: number;
  readonly SKIP_SUCCESSFUL: boolean;
  readonly SKIP_FAILED: boolean;
  readonly STORE: RateLimitStore;
  readonly KEY_GENERATOR?: KeyGeneratorFunction;
  readonly ON_LIMIT_REACHED?: LimitReachedHandler;
}

/**
 * Rate limit storage backends
 */
export type RateLimitStore = 'memory' | 'redis' | 'memcached' | 'database';

/**
 * Key generator function type
 */
export type KeyGeneratorFunction = (req: unknown) => string;

/**
 * Limit reached handler function
 */
export type LimitReachedHandler = (req: unknown, res: unknown) => void;

/**
 * CORS configuration
 */
export interface CorsConfiguration {
  readonly ENABLED: boolean;
  readonly ORIGINS: string[] | '*';
  readonly METHODS: HttpMethod[];
  readonly ALLOWED_HEADERS: string[];
  readonly EXPOSED_HEADERS: string[];
  readonly CREDENTIALS: boolean;
  readonly MAX_AGE: number;
}

/**
 * HTTP methods for CORS
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

/**
 * Security headers configuration
 */
export interface SecurityHeaders {
  readonly CONTENT_SECURITY_POLICY?: string;
  readonly STRICT_TRANSPORT_SECURITY?: string;
  readonly X_CONTENT_TYPE_OPTIONS?: string;
  readonly X_FRAME_OPTIONS?: string;
  readonly X_XSS_PROTECTION?: string;
  readonly REFERRER_POLICY?: string;
  readonly PERMISSIONS_POLICY?: string;
}

/**
 * Retry configuration
 */
export interface RetryConfiguration extends RetryConfig {
  readonly ENABLED: boolean;
  readonly MAX_ATTEMPTS: number;
  readonly INITIAL_DELAY: number;
  readonly MAX_DELAY: number;
  readonly BACKOFF_MULTIPLIER: number;
  readonly JITTER: boolean;
}

// =====================================================
// EMAIL CONFIGURATION
// =====================================================

/**
 * Email service configuration
 */
export interface EmailConfiguration {
  readonly SMTP_HOST?: string;
  readonly SMTP_PORT?: number;
  readonly SMTP_SECURE?: boolean;
  readonly SMTP_USER?: string;
  readonly SMTP_PASSWORD?: SecretKey;
  readonly EMAIL_FROM: EmailAddress;
  readonly EMAIL_FROM_NAME: string;
  readonly EMAIL_REPLY_TO?: EmailAddress;
  readonly EMAIL_PROVIDER: EmailProvider;
  readonly TEMPLATE_ENGINE: TemplateEngine;
  readonly DEFAULT_LANGUAGE: LanguageCode;
  readonly SUPPORTED_LANGUAGES: LanguageCode[];
  readonly UNSUBSCRIBE_URL: string;
  readonly CONFIRMATION_URL: string;
  readonly TRACKING_ENABLED: boolean;
  readonly BOUNCE_HANDLING: BounceHandlingConfig;
  readonly DELIVERY_OPTIMIZATION: DeliveryOptimizationConfig;
}

/**
 * Email service providers
 */
export type EmailProvider = 
  | 'sendgrid'
  | 'mailgun'
  | 'ses'
  | 'postmark'
  | 'smtp'
  | 'resend'
  | 'brevo';

/**
 * Template engines
 */
export type TemplateEngine = 
  | 'handlebars'
  | 'mustache'
  | 'ejs'
  | 'pug'
  | 'liquid';

/**
 * Language codes (ISO 639-1)
 */
export type LanguageCode = 
  | 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'ja' | 'ko' | 'zh'
  | string;

/**
 * Bounce handling configuration
 */
export interface BounceHandlingConfig {
  readonly ENABLED: boolean;
  readonly AUTO_CLEANUP: boolean;
  readonly SOFT_BOUNCE_LIMIT: number;
  readonly HARD_BOUNCE_LIMIT: number;
  readonly COMPLAINT_LIMIT: number;
  readonly CLEANUP_AFTER_DAYS: number;
}

/**
 * Email delivery optimization
 */
export interface DeliveryOptimizationConfig {
  readonly BATCH_SIZE: number;
  readonly DELAY_BETWEEN_BATCHES: number;
  readonly RETRY_FAILED: boolean;
  readonly PRIORITY_QUEUE: boolean;
  readonly THROTTLING_ENABLED: boolean;
  readonly SEND_TIME_OPTIMIZATION: boolean;
}

// =====================================================
// VALIDATION CONFIGURATION
// =====================================================

/**
 * Email validation rules and settings
 */
export interface ValidationConfiguration {
  readonly EMAIL_VALIDATION: EmailValidationConfig;
  readonly DOMAIN_VALIDATION: DomainValidationConfig;
  readonly DISPOSABLE_EMAIL_CHECK: DisposableEmailConfig;
  readonly ROLE_ACCOUNT_CHECK: RoleAccountConfig;
  readonly TYPO_CORRECTION: TypoCorrectionConfig;
  readonly REAL_TIME_VALIDATION: RealTimeValidationConfig;
}

/**
 * Email validation settings
 */
export interface EmailValidationConfig {
  readonly ENABLED: boolean;
  readonly STRICT_MODE: boolean;
  readonly MAX_LENGTH: number;
  readonly MIN_LENGTH: number;
  readonly REGEX_PATTERN: string;
  readonly CUSTOM_RULES: ValidationRule[];
  readonly WHITELIST_DOMAINS: Domain[];
  readonly BLACKLIST_DOMAINS: Domain[];
}

/**
 * Domain validation settings
 */
export interface DomainValidationConfig {
  readonly DNS_CHECK: boolean;
  readonly MX_RECORD_CHECK: boolean;
  readonly SMTP_CHECK: boolean;
  readonly TIMEOUT: number;
  readonly CACHE_TTL: number;
  readonly FALLBACK_ON_ERROR: boolean;
}

/**
 * Disposable email detection
 */
export interface DisposableEmailConfig {
  readonly ENABLED: boolean;
  readonly BLOCK_DISPOSABLE: boolean;
  readonly UPDATE_FREQUENCY: UpdateFrequency;
  readonly CUSTOM_PROVIDERS: string[];
  readonly WHITELIST_EXCEPTIONS: string[];
}

/**
 * Role account detection
 */
export interface RoleAccountConfig {
  readonly ENABLED: boolean;
  readonly BLOCK_ROLE_ACCOUNTS: boolean;
  readonly ROLE_PREFIXES: string[];
  readonly EXCEPTIONS: string[];
}

/**
 * Typo correction settings
 */
export interface TypoCorrectionConfig {
  readonly ENABLED: boolean;
  readonly SUGGEST_CORRECTIONS: boolean;
  readonly CONFIDENCE_THRESHOLD: number;
  readonly MAX_SUGGESTIONS: number;
  readonly POPULAR_DOMAINS: string[];
}

/**
 * Real-time validation settings
 */
export interface RealTimeValidationConfig {
  readonly ENABLED: boolean;
  readonly DEBOUNCE_DELAY: number;
  readonly CACHE_RESULTS: boolean;
  readonly CACHE_TTL: number;
  readonly FALLBACK_ON_ERROR: boolean;
}

/**
 * Custom validation rule
 */
export interface ValidationRule {
  readonly name: string;
  readonly pattern: RegExp;
  readonly message: string;
  readonly severity: ValidationSeverity;
}

/**
 * Validation severity levels
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Update frequency for external data
 */
export type UpdateFrequency = 'daily' | 'weekly' | 'monthly' | 'never';

// =====================================================
// SECURITY CONFIGURATION
// =====================================================

/**
 * Security settings
 */
export interface SecurityConfiguration {
  readonly ENCRYPTION: EncryptionConfig;
  readonly AUTHENTICATION: AuthenticationConfig;
  readonly AUTHORIZATION: AuthorizationConfig;
  readonly AUDIT_LOGGING: AuditLoggingConfig;
  readonly DATA_PROTECTION: DataProtectionConfig;
  readonly COMPLIANCE: ComplianceConfig;
}

/**
 * Encryption configuration
 */
export interface EncryptionConfig {
  readonly ALGORITHM: EncryptionAlgorithm;
  readonly KEY_LENGTH: number;
  readonly SECRET_KEY: SecretKey;
  readonly SALT_ROUNDS: number;
  readonly ENCRYPT_PII: boolean;
  readonly ENCRYPT_EMAILS: boolean;
}

/**
 * Encryption algorithms
 */
export type EncryptionAlgorithm = 
  | 'aes-256-gcm'
  | 'aes-256-cbc'
  | 'chacha20-poly1305'
  | 'xchacha20-poly1305';

/**
 * Authentication configuration
 */
export interface AuthenticationConfig {
  readonly ENABLED: boolean;
  readonly JWT_SECRET: SecretKey;
  readonly JWT_EXPIRES_IN: string;
  readonly API_KEY_REQUIRED: boolean;
  readonly SESSION_TIMEOUT: number;
  readonly MFA_ENABLED: boolean;
}

/**
 * Authorization configuration
 */
export interface AuthorizationConfig {
  readonly RBAC_ENABLED: boolean;
  readonly DEFAULT_ROLE: string;
  readonly ADMIN_ROLES: string[];
  readonly PERMISSIONS: PermissionConfig[];
}

/**
 * Permission configuration
 */
export interface PermissionConfig {
  readonly name: string;
  readonly description: string;
  readonly actions: string[];
  readonly resources: string[];
}

/**
 * Audit logging configuration
 */
export interface AuditLoggingConfig {
  readonly ENABLED: boolean;
  readonly LOG_LEVEL: LogLevel;
  readonly INCLUDE_REQUEST_BODY: boolean;
  readonly INCLUDE_RESPONSE_BODY: boolean;
  readonly RETENTION_DAYS: number;
  readonly ANONYMIZE_PII: boolean;
}

/**
 * Data protection configuration
 */
export interface DataProtectionConfig {
  readonly ANONYMIZATION: boolean;
  readonly PSEUDONYMIZATION: boolean;
  readonly DATA_RETENTION_DAYS: number;
  readonly AUTO_DELETE: boolean;
  readonly BACKUP_ENCRYPTION: boolean;
  readonly ACCESS_LOGGING: boolean;
}

/**
 * Compliance configuration
 */
export interface ComplianceConfig {
  readonly GDPR_ENABLED: boolean;
  readonly CCPA_ENABLED: boolean;
  readonly CONSENT_REQUIRED: boolean;
  readonly PRIVACY_POLICY_URL: string;
  readonly TERMS_OF_SERVICE_URL: string;
  readonly COOKIE_POLICY_URL?: string;
  readonly DATA_PROCESSOR_AGREEMENT?: string;
}

// =====================================================
// UI CONFIGURATION
// =====================================================

/**
 * User interface configuration
 */
export interface UIConfiguration {
  readonly THEME: ThemeConfiguration;
  readonly COMPONENTS: ComponentConfiguration;
  readonly RESPONSIVE: ResponsiveConfiguration;
  readonly ACCESSIBILITY: AccessibilityConfiguration;
  readonly INTERNATIONALIZATION: I18nConfiguration;
  readonly PERFORMANCE: UIPerformanceConfiguration;
}

/**
 * Theme configuration
 */
export interface ThemeConfiguration {
  readonly DEFAULT_THEME: ThemeName;
  readonly AVAILABLE_THEMES: ThemeName[];
  readonly CUSTOM_THEMES: CustomTheme[];
  readonly DARK_MODE: boolean;
  readonly AUTO_SWITCH_THEME: boolean;
  readonly THEME_PERSISTENCE: boolean;
}

/**
 * Theme names
 */
export type ThemeName = 'light' | 'dark' | 'auto' | 'system' | string;

/**
 * Custom theme definition
 */
export interface CustomTheme {
  readonly name: string;
  readonly colors: ThemeColors;
  readonly fonts: ThemeFonts;
  readonly spacing: ThemeSpacing;
  readonly borders: ThemeBorders;
  readonly shadows: ThemeShadows;
  readonly animations: ThemeAnimations;
}

/**
 * Theme color palette
 */
export interface ThemeColors {
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly background: string;
  readonly foreground: string;
  readonly muted: string;
  readonly border: string;
  readonly input: string;
  readonly ring: string;
  readonly success: string;
  readonly warning: string;
  readonly error: string;
  readonly info: string;
}

/**
 * Theme typography
 */
export interface ThemeFonts {
  readonly family: string;
  readonly sizes: Record<ComponentSize, string>;
  readonly weights: Record<string, number>;
  readonly lineHeights: Record<ComponentSize, string>;
}

/**
 * Theme spacing system
 */
export interface ThemeSpacing {
  readonly unit: number;
  readonly scale: number[];
}

/**
 * Theme border configuration
 */
export interface ThemeBorders {
  readonly width: Record<string, string>;
  readonly radius: Record<string, string>;
  readonly style: string;
}

/**
 * Theme shadow system
 */
export interface ThemeShadows {
  readonly small: string;
  readonly medium: string;
  readonly large: string;
  readonly focus: string;
}

/**
 * Theme animations
 */
export interface ThemeAnimations {
  readonly duration: Record<string, string>;
  readonly easing: Record<string, string>;
  readonly presets: Record<AnimationVariant, string>;
}

/**
 * Component-level configuration
 */
export interface ComponentConfiguration {
  readonly DEFAULT_SIZE: ComponentSize;
  readonly DEFAULT_VARIANT: ComponentVariant;
  readonly DEFAULT_COLOR_SCHEME: ColorScheme;
  readonly ANIMATION_ENABLED: boolean;
  readonly COMPACT_MODE: boolean;
  readonly ROUNDED_CORNERS: boolean;
  readonly SHOW_LABELS: boolean;
  readonly SHOW_ICONS: boolean;
}

/**
 * Responsive design configuration
 */
export interface ResponsiveConfiguration {
  readonly ENABLED: boolean;
  readonly BREAKPOINTS: BreakpointConfig;
  readonly MOBILE_FIRST: boolean;
  readonly ADAPTIVE_TEXT: boolean;
  readonly ADAPTIVE_SPACING: boolean;
}

/**
 * Breakpoint configuration
 */
export interface BreakpointConfig {
  readonly xs: number;
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly xl: number;
  readonly xxl?: number;
}

/**
 * Accessibility configuration
 */
export interface AccessibilityConfiguration {
  readonly ENABLED: boolean;
  readonly HIGH_CONTRAST: boolean;
  readonly REDUCED_MOTION: boolean;
  readonly KEYBOARD_NAVIGATION: boolean;
  readonly SCREEN_READER_SUPPORT: boolean;
  readonly FOCUS_VISIBLE: boolean;
  readonly ARIA_LABELS: boolean;
  readonly COLOR_BLIND_SUPPORT: boolean;
}

/**
 * Internationalization configuration
 */
export interface I18nConfiguration {
  readonly ENABLED: boolean;
  readonly DEFAULT_LOCALE: LanguageCode;
  readonly SUPPORTED_LOCALES: LanguageCode[];
  readonly FALLBACK_LOCALE: LanguageCode;
  readonly LOAD_ON_DEMAND: boolean;
  readonly CACHE_TRANSLATIONS: boolean;
  readonly RTL_SUPPORT: boolean;
}

/**
 * UI performance configuration
 */
export interface UIPerformanceConfiguration {
  readonly LAZY_LOADING: boolean;
  readonly CODE_SPLITTING: boolean;
  readonly BUNDLE_OPTIMIZATION: boolean;
  readonly IMAGE_OPTIMIZATION: boolean;
  readonly FONT_OPTIMIZATION: boolean;
  readonly CSS_OPTIMIZATION: boolean;
  readonly PRELOAD_CRITICAL: boolean;
}

// =====================================================
// FEATURE CONFIGURATION
// =====================================================

/**
 * Feature flags and toggles
 */
export interface FeatureConfiguration {
  readonly FEATURES: FeatureFlag[];
  readonly EXPERIMENTS: ExperimentConfig[];
  readonly ROLLOUTS: RolloutConfig[];
  readonly A_B_TESTS: ABTestConfig[];
}

/**
 * Feature flag definition
 */
export interface FeatureFlag {
  readonly name: string;
  readonly enabled: boolean;
  readonly description: string;
  readonly environment?: EnvironmentName[];
  readonly users?: string[];
  readonly percentage?: number;
  readonly conditions?: FeatureCondition[];
}

/**
 * Feature condition
 */
export interface FeatureCondition {
  readonly key: string;
  readonly operator: ConditionOperator;
  readonly value: unknown;
}

/**
 * Condition operators
 */
export type ConditionOperator = 
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'in'
  | 'not_in';

/**
 * Experiment configuration
 */
export interface ExperimentConfig {
  readonly name: string;
  readonly description: string;
  readonly variants: ExperimentVariant[];
  readonly traffic_allocation: number;
  readonly start_date?: string;
  readonly end_date?: string;
  readonly success_metrics: string[];
}

/**
 * Experiment variant
 */
export interface ExperimentVariant {
  readonly name: string;
  readonly weight: number;
  readonly configuration: Record<string, unknown>;
}

/**
 * Rollout configuration
 */
export interface RolloutConfig {
  readonly feature: string;
  readonly strategy: RolloutStrategy;
  readonly percentage: number;
  readonly segments?: string[];
  readonly schedule?: RolloutSchedule;
}

/**
 * Rollout strategies
 */
export type RolloutStrategy = 
  | 'percentage'
  | 'user_segment'
  | 'geographic'
  | 'device_type'
  | 'custom';

/**
 * Rollout schedule
 */
export interface RolloutSchedule {
  readonly start_date: string;
  readonly phases: RolloutPhase[];
}

/**
 * Rollout phase
 */
export interface RolloutPhase {
  readonly percentage: number;
  readonly duration_hours: number;
  readonly success_criteria?: string[];
}

/**
 * A/B test configuration
 */
export interface ABTestConfig {
  readonly name: string;
  readonly hypothesis: string;
  readonly variants: ABTestVariant[];
  readonly sample_size: number;
  readonly confidence_level: number;
  readonly success_metrics: MetricDefinition[];
  readonly secondary_metrics?: MetricDefinition[];
}

/**
 * A/B test variant
 */
export interface ABTestVariant {
  readonly name: string;
  readonly description: string;
  readonly traffic_allocation: number;
  readonly configuration: Record<string, unknown>;
}

/**
 * Metric definition
 */
export interface MetricDefinition {
  readonly name: string;
  readonly type: MetricType;
  readonly aggregation: AggregationType;
  readonly filters?: MetricFilter[];
}

/**
 * Metric types
 */
export type MetricType = 
  | 'counter'
  | 'gauge'
  | 'histogram'
  | 'timer'
  | 'conversion';

/**
 * Aggregation types
 */
export type AggregationType = 
  | 'sum'
  | 'average'
  | 'count'
  | 'min'
  | 'max'
  | 'percentile';

/**
 * Metric filter
 */
export interface MetricFilter {
  readonly key: string;
  readonly operator: ConditionOperator;
  readonly value: unknown;
}

// =====================================================
// MONITORING CONFIGURATION
// =====================================================

/**
 * System monitoring and observability
 */
export interface MonitoringConfiguration {
  readonly LOGGING: LoggingConfiguration;
  readonly METRICS: MetricsConfiguration;
  readonly TRACING: TracingConfiguration;
  readonly ALERTING: AlertingConfiguration;
  readonly HEALTH_CHECKS: HealthCheckConfiguration;
}

/**
 * Logging configuration
 */
export interface LoggingConfiguration {
  readonly ENABLED: boolean;
  readonly LEVEL: LogLevel;
  readonly FORMAT: LogFormat;
  readonly DESTINATION: LogDestination;
  readonly ROTATION: LogRotationConfig;
  readonly STRUCTURED: boolean;
  readonly INCLUDE_STACK_TRACE: boolean;
}

/**
 * Log formats
 */
export type LogFormat = 'json' | 'text' | 'combined' | 'common';

/**
 * Log destinations
 */
export type LogDestination = 'console' | 'file' | 'syslog' | 'remote';

/**
 * Log rotation configuration
 */
export interface LogRotationConfig {
  readonly max_size: string;
  readonly max_files: number;
  readonly max_age: string;
  readonly compress: boolean;
}

/**
 * Metrics configuration
 */
export interface MetricsConfiguration {
  readonly ENABLED: boolean;
  readonly PROVIDER: MetricsProvider;
  readonly COLLECTION_INTERVAL: number;
  readonly RETENTION_PERIOD: string;
  readonly CUSTOM_METRICS: CustomMetric[];
}

/**
 * Metrics providers
 */
export type MetricsProvider = 
  | 'prometheus'
  | 'statsd'
  | 'datadog'
  | 'newrelic'
  | 'cloudwatch';

/**
 * Custom metric definition
 */
export interface CustomMetric {
  readonly name: string;
  readonly type: MetricType;
  readonly description: string;
  readonly labels?: string[];
  readonly unit?: string;
}

/**
 * Tracing configuration
 */
export interface TracingConfiguration {
  readonly ENABLED: boolean;
  readonly PROVIDER: TracingProvider;
  readonly SAMPLE_RATE: number;
  readonly INCLUDE_SQL: boolean;
  readonly INCLUDE_HTTP: boolean;
  readonly CUSTOM_SPANS: boolean;
}

/**
 * Tracing providers
 */
export type TracingProvider = 
  | 'jaeger'
  | 'zipkin'
  | 'datadog'
  | 'newrelic'
  | 'opentelemetry';

/**
 * Alerting configuration
 */
export interface AlertingConfiguration {
  readonly ENABLED: boolean;
  readonly RULES: AlertRule[];
  readonly CHANNELS: AlertChannel[];
  readonly ESCALATION: EscalationPolicy;
}

/**
 * Alert rule
 */
export interface AlertRule {
  readonly name: string;
  readonly condition: string;
  readonly threshold: number;
  readonly duration: string;
  readonly severity: AlertSeverity;
  readonly channels: string[];
}

/**
 * Alert severity levels
 */
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Alert channel
 */
export interface AlertChannel {
  readonly name: string;
  readonly type: AlertChannelType;
  readonly configuration: Record<string, unknown>;
  readonly enabled: boolean;
}

/**
 * Alert channel types
 */
export type AlertChannelType = 
  | 'email'
  | 'slack'
  | 'webhook'
  | 'pagerduty'
  | 'sms';

/**
 * Escalation policy
 */
export interface EscalationPolicy {
  readonly levels: EscalationLevel[];
  readonly repeat_interval: string;
  readonly max_escalations: number;
}

/**
 * Escalation level
 */
export interface EscalationLevel {
  readonly delay: string;
  readonly channels: string[];
  readonly users?: string[];
}

/**
 * Health check configuration
 */
export interface HealthCheckConfiguration {
  readonly ENABLED: boolean;
  readonly INTERVAL: number;
  readonly TIMEOUT: number;
  readonly CHECKS: HealthCheckDefinition[];
}

/**
 * Health check definition
 */
export interface HealthCheckDefinition {
  readonly name: string;
  readonly type: HealthCheckType;
  readonly configuration: Record<string, unknown>;
  readonly critical: boolean;
  readonly timeout: number;
}

/**
 * Health check types
 */
export type HealthCheckType = 
  | 'database'
  | 'redis'
  | 'http'
  | 'tcp'
  | 'custom';

// =====================================================
// INTEGRATIONS CONFIGURATION
// =====================================================

/**
 * External service integrations
 */
export interface IntegrationsConfiguration {
  readonly ANALYTICS: AnalyticsIntegration[];
  readonly MARKETING: MarketingIntegration[];
  readonly CRM: CRMIntegration[];
  readonly WEBHOOKS: WebhookIntegration[];
  readonly SOCIAL: SocialIntegration[];
}

/**
 * Analytics integration
 */
export interface AnalyticsIntegration {
  readonly name: string;
  readonly provider: AnalyticsProvider;
  readonly enabled: boolean;
  readonly configuration: Record<string, unknown>;
  readonly events: string[];
}

/**
 * Analytics providers
 */
export type AnalyticsProvider = 
  | 'google_analytics'
  | 'mixpanel'
  | 'segment'
  | 'amplitude'
  | 'heap';

/**
 * Marketing integration
 */
export interface MarketingIntegration {
  readonly name: string;
  readonly provider: MarketingProvider;
  readonly enabled: boolean;
  readonly configuration: Record<string, unknown>;
  readonly sync_enabled: boolean;
}

/**
 * Marketing providers
 */
export type MarketingProvider = 
  | 'mailchimp'
  | 'klaviyo'
  | 'sendgrid'
  | 'constant_contact'
  | 'hubspot';

/**
 * CRM integration
 */
export interface CRMIntegration {
  readonly name: string;
  readonly provider: CRMProvider;
  readonly enabled: boolean;
  readonly configuration: Record<string, unknown>;
  readonly bidirectional_sync: boolean;
}

/**
 * CRM providers
 */
export type CRMProvider = 
  | 'salesforce'
  | 'hubspot'
  | 'pipedrive'
  | 'zoho'
  | 'airtable';

/**
 * Webhook integration
 */
export interface WebhookIntegration {
  readonly name: string;
  readonly url: WebhookURL;
  readonly enabled: boolean;
  readonly events: string[];
  readonly secret?: SecretKey;
  readonly retry_config: RetryConfiguration;
}

/**
 * Social media integration
 */
export interface SocialIntegration {
  readonly name: string;
  readonly provider: SocialProvider;
  readonly enabled: boolean;
  readonly configuration: Record<string, unknown>;
  readonly auto_post: boolean;
}

/**
 * Social media providers
 */
export type SocialProvider = 
  | 'twitter'
  | 'facebook'
  | 'linkedin'
  | 'instagram'
  | 'discord';

// =====================================================
// CONFIGURATION VALIDATION
// =====================================================

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  readonly valid: boolean;
  readonly errors: ConfigValidationError[];
  readonly warnings: ConfigValidationWarning[];
}

/**
 * Configuration validation error
 */
export interface ConfigValidationError {
  readonly path: string;
  readonly message: string;
  readonly value?: unknown;
  readonly expected?: string;
}

/**
 * Configuration validation warning
 */
export interface ConfigValidationWarning {
  readonly path: string;
  readonly message: string;
  readonly recommendation?: string;
}

// =====================================================
// EXPORT COLLECTION
// =====================================================

/**
 * All configuration types for convenient importing
 */
export type {
  // Core configuration
  EmailSubscriptionConfig,
  EnvironmentConfig,
  DatabaseConfiguration,
  ApiConfiguration,
  
  // Email and validation
  EmailConfiguration,
  ValidationConfiguration,
  SecurityConfiguration,
  
  // UI and features
  UIConfiguration,
  FeatureConfiguration,
  ThemeConfiguration,
  ComponentConfiguration,
  
  // Monitoring and integrations
  MonitoringConfiguration,
  IntegrationsConfiguration,
  
  // Validation
  ConfigValidationResult,
  ConfigValidationError,
  ConfigValidationWarning,
  
  // Utility types
  EnvironmentName,
  LogLevel,
  LanguageCode,
  MetricType,
  AlertSeverity,
} as EmailSubscriptionConfigTypes;