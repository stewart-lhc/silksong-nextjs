/**
 * Email Subscription TypeScript Types - Main Export
 * 
 * This is the main entry point for the email subscription type system.
 * It provides a comprehensive, type-safe foundation for email subscription
 * functionality across different projects and platforms.
 * 
 * Features:
 * - Complete type coverage for email subscription workflows
 * - Cross-platform compatibility (React, Node.js, etc.)
 * - Database-agnostic design with adapter pattern
 * - Extensive configuration and customization options
 * - Runtime type validation utilities
 * - Event-driven architecture support
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 * @license MIT
 */

// =====================================================
// CORE TYPES EXPORT
// =====================================================

export type {
  // Branded types for type safety
  ValidatedEmail,
  SanitizedEmail,
  SubscriptionId,
  ISOTimestamp,
  
  // Core data structures
  BaseSubscription,
  ExtendedSubscription,
  SubscriptionMetadata,
  SubscriptionPreferences,
  
  // Status and lifecycle
  SubscriptionSource,
  SubscriptionStatus,
  NotificationFrequency,
  NotificationCategory,
  UnsubscribeReason,
  
  // Validation system
  EmailValidationResult,
  EmailValidationError,
  EmailValidationWarning,
  
  // Operation results
  SubscriptionResult,
  SubscriptionError,
  SubscriptionErrorCode,
  SubscriptionErrorContext,
  
  // Collections and querying
  PaginatedSubscriptions,
  PaginationInfo,
  SubscriptionFilters,
  SubscriptionSort,
  SortableSubscriptionField,
  
  // Utility types
  PartialBy,
  RequiredBy,
  DeepReadonly,
  TypeGuard,
  Brand,
} from './core';

// =====================================================
// DATABASE TYPES EXPORT
// =====================================================

export type {
  // Core adapter interface
  DatabaseAdapter,
  DatabaseConfig,
  DatabaseType,
  DatabaseConnectionResult,
  
  // Connection configurations
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
  
  // Query and operation types
  QueryOptions,
  PaginationOptions,
  IncludeOptions,
  InsertableSubscription,
  UpdatableSubscription,
  TransactionCallback,
  QueryBuilder,
  QueryOperator,
  
  // Schema management
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
  
  // ORM-specific configurations
  SupabaseAdapterConfig,
  PrismaAdapterConfig,
  TypeORMAdapterConfig,
  SequelizeAdapterConfig,
  
  // Factory pattern
  DatabaseAdapterFactory,
} from './database';

// =====================================================
// API TYPES EXPORT
// =====================================================

export type {
  // Core API interfaces
  ApiResponse,
  PaginatedApiResponse,
  ApiPaginationMeta,
  SubscriptionApiClient,
  
  // Error handling
  ApiError,
  ApiErrorCode,
  ApiErrorDetails,
  FieldError,
  HTTPStatusCode,
  ErrorCategory,
  ErrorType,
  
  // Request types
  SubscribeRequest,
  UnsubscribeRequest,
  UpdateSubscriptionRequest,
  BulkSubscribeRequest,
  GetSubscriptionsRequest,
  PaginationRequest,
  BulkOperationOptions,
  ConsentData,
  SubscriptionStatusUpdate,
  
  // Response types
  SubscriptionResponse,
  BulkSubscribeResponse,
  BulkOperationError,
  BulkOperationSummary,
  EmailValidationResponse,
  DeliverabilityInfo,
  SubscriptionStats,
  EngagementMetrics,
  
  // Authentication
  ApiCredentials,
  AuthToken,
  RefreshToken,
  
  // Client configuration
  ApiClientConfig,
  RetryConfig,
  ClientRateLimitConfig,
  InterceptorConfig,
  RequestConfig,
  HttpMethod,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  
  // Real-time API
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
} from './api';

// =====================================================
// COMPONENT TYPES EXPORT
// =====================================================

export type {
  // Base component props
  BaseComponentProps,
  PolymorphicProps,
  ForwardRefProps,
  
  // Style system
  ComponentSize,
  ComponentVariant,
  ColorScheme,
  BorderRadius,
  ShadowVariant,
  AnimationVariant,
  
  // Form components
  SubscriptionFormProps,
  EmailInputProps,
  SubscribeButtonProps,
  FormLayout,
  ContentAlignment,
  ComponentSpacing,
  InputVariant,
  ButtonVariant,
  ButtonAnimation,
  EmailValidationConfig,
  
  // Feedback components
  SubscriptionStatusProps,
  ValidationFeedbackProps,
  SubscriptionStatus as ComponentSubscriptionStatus,
  StatusVariant,
  StatusMessages,
  FeedbackVariant,
  FeedbackPosition,
  ValidationMessages,
  ValidationIcons,
  
  // Compound components
  SubscriptionWidgetProps,
  WidgetLayout,
  WidgetTheme,
  ThemeColors,
  ThemeFonts,
  MobileConfiguration,
  KeyboardConfiguration,
  WidgetFeatures,
  TrackingConfiguration,
  TrackingEvent,
  ComplianceConfiguration,
  ConsentConfiguration,
  CustomRenderer,
  WidgetPlugin,
  
  // Hook interfaces
  UseSubscriptionConfig,
  UseSubscriptionReturn,
} from './components';

// =====================================================
// CONFIGURATION TYPES EXPORT
// =====================================================

export type {
  // Master configuration
  EmailSubscriptionConfig,
  EnvironmentName,
  LogLevel,
  LanguageCode,
  
  // Core configurations
  EnvironmentConfig,
  DatabaseConfiguration,
  ApiConfiguration,
  EmailConfiguration,
  ValidationConfiguration,
  SecurityConfiguration,
  UIConfiguration,
  FeatureConfiguration,
  MonitoringConfiguration,
  IntegrationsConfiguration,
  
  // Branded environment types
  DatabaseURL,
  ApiKey,
  SecretKey,
  WebhookURL,
  EmailAddress,
  Domain,
  CronExpression,
  
  // Specific configurations
  RateLimitConfig,
  CorsConfiguration,
  SecurityHeaders,
  RetryConfiguration,
  EmailProvider,
  TemplateEngine,
  BounceHandlingConfig,
  DeliveryOptimizationConfig,
  
  // Validation configurations
  EmailValidationConfig as ConfigEmailValidationConfig,
  DomainValidationConfig,
  DisposableEmailConfig,
  RoleAccountConfig,
  TypoCorrectionConfig,
  RealTimeValidationConfig,
  ValidationRule,
  ValidationSeverity,
  UpdateFrequency,
  
  // Security configurations
  EncryptionConfig,
  EncryptionAlgorithm,
  AuthenticationConfig,
  AuthorizationConfig,
  PermissionConfig,
  AuditLoggingConfig,
  DataProtectionConfig,
  ComplianceConfig,
  
  // UI configurations
  ThemeConfiguration,
  ThemeName,
  CustomTheme,
  ComponentConfiguration,
  ResponsiveConfiguration,
  BreakpointConfig,
  AccessibilityConfiguration,
  I18nConfiguration,
  UIPerformanceConfiguration,
  
  // Feature management
  FeatureFlag,
  ExperimentConfig,
  ExperimentVariant,
  RolloutConfig,
  RolloutStrategy,
  RolloutSchedule,
  RolloutPhase,
  ABTestConfig,
  ABTestVariant,
  MetricDefinition,
  MetricType,
  AggregationType,
  MetricFilter,
  FeatureCondition,
  ConditionOperator,
  
  // Monitoring configurations
  LoggingConfiguration,
  LogFormat,
  LogDestination,
  LogRotationConfig,
  MetricsConfiguration,
  MetricsProvider,
  CustomMetric,
  TracingConfiguration,
  TracingProvider,
  AlertingConfiguration,
  AlertRule,
  AlertSeverity,
  AlertChannel,
  AlertChannelType,
  EscalationPolicy,
  EscalationLevel,
  HealthCheckConfiguration,
  HealthCheckDefinition,
  HealthCheckType,
  
  // Integration configurations
  AnalyticsIntegration,
  AnalyticsProvider,
  MarketingIntegration,
  MarketingProvider,
  CRMIntegration,
  CRMProvider,
  WebhookIntegration,
  SocialIntegration,
  SocialProvider,
  
  // Configuration validation
  ConfigValidationResult,
  ConfigValidationError,
  ConfigValidationWarning,
} from './config';

// =====================================================
// EVENT TYPES EXPORT
// =====================================================

export type {
  // Core event types
  BaseEvent,
  EventId,
  EventMetadata,
  EventSource,
  
  // Subscription events
  SubscriptionEvent,
  SubscriptionInitiatedEvent,
  SubscriptionValidatingEvent,
  SubscriptionValidatedEvent,
  SubscriptionValidationFailedEvent,
  SubscriptionSubmittingEvent,
  SubscriptionSucceededEvent,
  SubscriptionFailedEvent,
  SubscriptionConfirmedEvent,
  SubscriptionUnsubscribedEvent,
  SubscriptionReactivatedEvent,
  SubscriptionDeletedEvent,
  SubscriptionBatchProcessedEvent,
  SubscriptionCountUpdatedEvent,
  UnsubscribeReason as EventUnsubscribeReason,
  
  // State management
  SubscriptionState as EventSubscriptionState,
  StateTransition,
  StateMachineConfig,
  StateMachine,
  StateTransitionResult,
  StateMachineContext,
  
  // Event emitter
  EventEmitter,
  EventListener,
  EventSubscription,
  EventOfType,
  ErrorEventHandler,
  
  // Callback types
  SubscriptionCallbacks,
  ValidationCallbacks,
  ValidationStep,
  AsyncCallback,
  SyncCallback,
  VoidCallback,
  ErrorCallback,
  
  // Event streaming
  EventStream,
  EventStreamHandler,
  EventStreamSubscription,
  EventPattern,
  EventMatcher,
  EventPredicate,
  EventMapper,
  StreamErrorHandler,
  
  // Event sourcing
  EventStore,
  EventSnapshot,
  ProjectionDefinition,
  ProjectionHandler,
  ProjectionOptions,
  
  // CQRS
  Command,
  CommandMetadata,
  Query,
  QueryParameters,
  CommandHandler,
  QueryHandler,
  CommandBus,
  QueryBus,
  
  // Subscription-specific CQRS
  SubscriptionCommand,
  CreateSubscriptionCommand,
  ConfirmSubscriptionCommand,
  UnsubscribeCommand,
  UpdateSubscriptionCommand,
  DeleteSubscriptionCommand,
  SubscriptionQuery,
  GetSubscriptionQuery,
  GetSubscriptionsQuery,
  GetSubscriptionCountQuery,
  GetSubscriptionStatsQuery,
} from './events';

// =====================================================
// UTILITY TYPES EXPORT
// =====================================================

export type {
  // Branded type utilities
  Brand as UtilBrand,
  Unbrand,
  BrandValidator,
  
  // Advanced utility types
  DeepReadonly as UtilDeepReadonly,
  Optional,
  Required as UtilRequired,
  PickByType,
  OmitByType,
  FunctionPropertyNames,
  NonFunctionPropertyNames,
  FunctionProperties,
  NonFunctionProperties,
  UnionToIntersection,
  KeysOfUnion,
  Flatten,
  Awaitable,
  Awaited as UtilAwaited,
  Mutable,
  MutableKeys,
  ArrayElement,
  NonNullable as UtilNonNullable,
  
  // Conditional utility types
  Equals,
  Extends,
  IsAny,
  IsUnknown,
  IsNever,
  IsFunction,
  IsArray,
  IsObject,
  
  // Performance types
  Lazy,
  Memoized,
  Debounced,
  Throttled,
  
  // Error handling utilities
  Result,
  Option,
  Try,
  ErrorBoundary,
  SafeFunction,
  
  // Domain utilities
  EmailDomainType,
  DomainInfo,
} from './utils';

// =====================================================
// UTILITY FUNCTIONS AND CONSTANTS EXPORT
// =====================================================

export {
  // Email validation patterns
  EMAIL_PATTERNS,
  EmailValidators,
  EmailSanitizers,
  
  // Branded type creators
  createValidatedEmail,
  createSanitizedEmail,
  createBrandedType,
  
  // Type guards
  isValidatedEmail,
  isSanitizedEmail,
  isSubscriptionId,
  isISOTimestamp,
  isBaseSubscription,
  isExtendedSubscription,
  isSubscriptionError,
  isEmailValidationResult,
  isSuccessfulSubscriptionResult,
  isFailedSubscriptionResult,
  
  // Type assertions
  assertValidatedEmail,
  assertSubscriptionId,
  assertISOTimestamp,
  assertSuccessfulResult,
  
  // Domain constants
  COMMON_EMAIL_DOMAINS,
  DISPOSABLE_EMAIL_DOMAINS,
  
  // Utility functions
  createValidator,
  composeValidators,
  createAsyncValidator,
} from './utils';

// =====================================================
// VERSION AND METADATA
// =====================================================

/**
 * Type system version information
 */
export const EMAIL_SUBSCRIPTION_TYPES_VERSION = '1.0.0' as const;

/**
 * Supported TypeScript version range
 */
export const TYPESCRIPT_VERSION_RANGE = '^5.0.0' as const;

/**
 * Type system metadata
 */
export const EMAIL_SUBSCRIPTION_TYPES_METADATA = {
  name: 'email-subscription-types',
  version: EMAIL_SUBSCRIPTION_TYPES_VERSION,
  description: 'Comprehensive TypeScript types for email subscription systems',
  author: 'Claude Code Assistant',
  license: 'MIT',
  repository: 'https://github.com/example/email-subscription-types',
  typescript: TYPESCRIPT_VERSION_RANGE,
  keywords: [
    'typescript',
    'types',
    'email',
    'subscription',
    'newsletter',
    'validation',
    'database',
    'api',
    'react',
    'nodejs',
  ],
  features: [
    'branded-types',
    'type-guards',
    'runtime-validation',
    'database-adapters',
    'api-client-types',
    'react-component-types',
    'event-system',
    'configuration-types',
    'utility-types',
  ],
} as const;

// =====================================================
// BACKWARDS COMPATIBILITY
// =====================================================

/**
 * @deprecated Use ValidatedEmail instead
 */
export type ValidEmail = ValidatedEmail;

/**
 * @deprecated Use SubscriptionResult instead
 */
export type OperationResult<T> = SubscriptionResult<T>;

/**
 * @deprecated Use SubscriptionError instead
 */
export type EmailError = SubscriptionError;

// =====================================================
// TYPE SYSTEM HEALTH CHECK
// =====================================================

/**
 * Type-level test to ensure all core types are properly exported
 * This creates a compilation error if any essential types are missing
 */
type TypeSystemHealthCheck = {
  // Core types
  validatedEmail: ValidatedEmail;
  subscription: ExtendedSubscription;
  subscriptionResult: SubscriptionResult<ExtendedSubscription>;
  
  // Database types
  databaseAdapter: DatabaseAdapter;
  databaseConfig: DatabaseConfig;
  
  // API types
  apiClient: SubscriptionApiClient;
  apiResponse: ApiResponse<SubscriptionResponse>;
  
  // Component types
  formProps: SubscriptionFormProps;
  widgetProps: SubscriptionWidgetProps;
  
  // Configuration types
  config: EmailSubscriptionConfig;
  
  // Event types
  event: SubscriptionEvent;
  eventEmitter: EventEmitter<SubscriptionEvent>;
  
  // Utility types
  result: Result<string, Error>;
  brand: Brand<string, 'test'>;
};

// Ensure the health check type is valid (this line should not cause errors)
const _typeSystemHealthCheck: TypeSystemHealthCheck = {} as any;

// =====================================================
// EXPORT SUMMARY
// =====================================================

/**
 * EXPORT SUMMARY
 * 
 * This module exports a comprehensive type system for email subscription functionality:
 * 
 * CORE TYPES (./core):
 * - Branded types for email validation and IDs
 * - Base subscription interfaces and metadata
 * - Status enumerations and lifecycle types
 * - Validation result structures
 * - Error handling types
 * - Collection and pagination types
 * 
 * DATABASE TYPES (./database):
 * - Generic database adapter interface
 * - Multi-database connection configurations
 * - Query builder and operation types
 * - Schema management and migrations
 * - Health monitoring and statistics
 * - ORM-specific adapter configurations
 * 
 * API TYPES (./api):
 * - RESTful API client interfaces
 * - Standardized request/response formats
 * - Comprehensive error handling
 * - Authentication and authorization
 * - Rate limiting and retry mechanisms
 * - Real-time WebSocket support
 * 
 * COMPONENT TYPES (./components):
 * - React component prop definitions
 * - Style variant systems
 * - Form and input component types
 * - Compound widget configurations
 * - Theme and customization options
 * - Hook interface definitions
 * 
 * CONFIGURATION TYPES (./config):
 * - Environment variable validation
 * - Multi-service configuration
 * - Feature flag management
 * - Security and compliance settings
 * - UI theme configurations
 * - Monitoring and alerting setup
 * 
 * EVENT TYPES (./events):
 * - Event-driven architecture support
 * - State machine patterns
 * - Event sourcing and CQRS
 * - Real-time streaming interfaces
 * - Callback and handler definitions
 * - Command and query patterns
 * 
 * UTILITY TYPES (./utils):
 * - Advanced TypeScript utilities
 * - Runtime type validation
 * - Email domain classification
 * - Performance optimization types
 * - Error boundary patterns
 * - Conditional type helpers
 * 
 * FEATURES:
 * ✅ Type-safe across the entire stack
 * ✅ Database-agnostic design
 * ✅ Framework-agnostic (React, Vue, etc.)
 * ✅ Extensive customization options
 * ✅ Runtime validation utilities
 * ✅ Performance optimized
 * ✅ Fully documented with JSDoc
 * ✅ Backwards compatible
 * ✅ Extensible architecture
 * 
 * USAGE:
 * ```typescript
 * import { 
 *   ValidatedEmail, 
 *   SubscriptionApiClient, 
 *   SubscriptionFormProps,
 *   EmailSubscriptionConfig 
 * } from './types/email-subscription';
 * ```
 */