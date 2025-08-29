# Email Subscription TypeScript Types

A comprehensive, type-safe TypeScript type system for email subscription functionality. Designed for enterprise-grade applications with strict type checking, runtime validation, and cross-project reusability.

## 🚀 Features

- **🔒 Type Safety**: Branded types and strict validation prevent runtime errors
- **🗄️ Database Agnostic**: Adapters for PostgreSQL, MySQL, SQLite, Supabase, and more
- **🌐 API Ready**: Complete REST API client types with error handling
- **⚛️ React Components**: Fully typed component props and hooks
- **⚙️ Configurable**: Comprehensive configuration system with environment validation
- **🎯 Event-Driven**: Support for event sourcing, CQRS, and state machines
- **🛠️ Utility Rich**: Advanced utility types and runtime validation helpers
- **📚 Well Documented**: Extensive JSDoc comments and usage examples

## 📦 Installation

```bash
npm install @types/email-subscription
# or
yarn add @types/email-subscription
# or
pnpm add @types/email-subscription
```

## 🏗️ Architecture Overview

```
types/email-subscription/
├── core.ts          # Core types and branded types
├── database.ts      # Database adapter interfaces
├── api.ts          # API client types and responses
├── components.ts   # React component props
├── config.ts       # Configuration types
├── events.ts       # Event system and state management
├── utils.ts        # Utility types and type guards
├── examples.ts     # Usage examples and patterns
└── index.ts        # Main export file
```

## 🎯 Quick Start

### Basic Email Validation

```typescript
import { 
  createValidatedEmail, 
  isValidatedEmail, 
  EmailValidators 
} from './types/email-subscription';

// ✅ Type-safe email validation
const email = createValidatedEmail("user@example.com");
if (email) {
  console.log(`Valid email: ${email}`);
  // Type is ValidatedEmail, not string
}

// ✅ Using type guards
function processEmail(input: unknown) {
  if (isValidatedEmail(input)) {
    // TypeScript knows input is ValidatedEmail here
    return subscribeUser(input);
  }
  throw new Error("Invalid email");
}
```

### Database Adapter Implementation

```typescript
import type { DatabaseAdapter, SupabaseAdapterConfig } from './types/email-subscription';

class SupabaseDatabaseAdapter implements DatabaseAdapter {
  constructor(private config: SupabaseAdapterConfig) {}
  
  async insert(subscription: InsertableSubscription) {
    // Type-safe database operations
    const result = await this.supabase
      .from('subscriptions')
      .insert(subscription);
    
    return { success: true, data: result };
  }
  
  // ... other methods
}
```

### API Client Usage

```typescript
import type { SubscriptionApiClient } from './types/email-subscription';

const client: SubscriptionApiClient = new EmailSubscriptionClient({
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key'
});

// Type-safe API calls
const response = await client.subscribe({
  email: 'user@example.com',
  source: 'web',
  metadata: { utm_source: 'newsletter' }
});

if (response.success) {
  console.log('Subscription created:', response.data);
} else {
  console.error('Error:', response.error);
}
```

### React Component Integration

```typescript
import type { SubscriptionFormProps } from './types/email-subscription';

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  onSubmit,
  onSuccess,
  onError,
  variant = "default",
  size = "md"
}) => {
  // Type-safe component implementation
  return (
    <form onSubmit={handleSubmit}>
      <input type="email" {...inputProps} />
      <button type="submit" {...buttonProps}>
        Subscribe
      </button>
    </form>
  );
};
```

## 📋 Core Types

### Branded Types

Branded types ensure type safety at compile time and runtime:

```typescript
type ValidatedEmail = string & { readonly __brand: 'ValidatedEmail' };
type SubscriptionId = string & { readonly __brand: 'SubscriptionId' };
type ISOTimestamp = string & { readonly __brand: 'ISOTimestamp' };
```

### Subscription Models

```typescript
interface BaseSubscription {
  readonly id: SubscriptionId;
  readonly email: ValidatedEmail;
  readonly subscribed_at: ISOTimestamp;
  readonly updated_at: ISOTimestamp;
}

interface ExtendedSubscription extends BaseSubscription {
  readonly status: SubscriptionStatus;
  readonly source?: SubscriptionSource;
  readonly metadata?: SubscriptionMetadata;
  readonly preferences?: SubscriptionPreferences;
}
```

### Result Types

```typescript
type SubscriptionResult<T> =
  | { success: true; data: T; warnings?: string[] }
  | { success: false; error: SubscriptionError; partial?: Partial<T> };
```

## 🗄️ Database Support

The system supports multiple databases through a generic adapter pattern:

- **PostgreSQL** - Full support with connection pooling
- **MySQL** - Complete implementation with SSL support  
- **SQLite** - File and in-memory databases
- **Supabase** - Real-time subscriptions and auth
- **PlanetScale** - Serverless MySQL platform
- **CockroachDB** - Distributed SQL database

```typescript
interface DatabaseAdapter<T extends BaseSubscription = ExtendedSubscription> {
  // Connection management
  connect(): Promise<DatabaseConnectionResult>;
  disconnect(): Promise<void>;
  
  // CRUD operations
  insert(subscription: InsertableSubscription<T>): Promise<SubscriptionResult<T>>;
  findById(id: SubscriptionId): Promise<SubscriptionResult<T>>;
  findByEmail(email: ValidatedEmail): Promise<SubscriptionResult<T>>;
  
  // Advanced queries
  findMany(options?: QueryOptions<T>): Promise<SubscriptionResult<PaginatedSubscriptions<T>>>;
  
  // Batch operations
  insertMany(subscriptions: InsertableSubscription<T>[]): Promise<SubscriptionResult<T[]>>;
  
  // Transaction support
  transaction<R>(callback: TransactionCallback<T, R>): Promise<SubscriptionResult<R>>;
}
```

## 🌐 API Client Types

Comprehensive API client support with standardized responses:

```typescript
interface SubscriptionApiClient {
  // Authentication
  authenticate(credentials: ApiCredentials): Promise<ApiResponse<AuthToken>>;
  
  // Subscription management
  subscribe(request: SubscribeRequest): Promise<ApiResponse<SubscriptionResponse>>;
  unsubscribe(request: UnsubscribeRequest): Promise<ApiResponse<void>>;
  
  // Bulk operations
  subscribeMany(request: BulkSubscribeRequest): Promise<ApiResponse<BulkSubscribeResponse>>;
  
  // Validation
  validateEmail(email: string): Promise<ApiResponse<EmailValidationResponse>>;
  
  // Analytics
  getSubscriptionStats(): Promise<ApiResponse<SubscriptionStats>>;
}
```

### Error Handling

Structured error handling with detailed context:

```typescript
interface ApiError {
  readonly code: ApiErrorCode;
  readonly message: string;
  readonly details?: ApiErrorDetails;
  readonly field_errors?: FieldError[];
  readonly correlation_id?: string;
  readonly retry_after?: number;
}

type ApiErrorCode = 
  | 'VALIDATION_FAILED'
  | 'RATE_LIMIT_EXCEEDED' 
  | 'DUPLICATE_RESOURCE'
  | 'SERVER_ERROR';
```

## ⚛️ React Component Types

Complete type coverage for React components:

### Form Components

```typescript
interface SubscriptionFormProps extends BaseComponentProps {
  // Event handlers
  readonly onSubmit?: (email: ValidatedEmail) => Promise<void> | void;
  readonly onSuccess?: (result: SubscriptionResult) => void;
  readonly onError?: (error: SubscriptionError) => void;
  
  // Validation
  readonly validateOnBlur?: boolean;
  readonly validateOnChange?: boolean;
  readonly customValidator?: (email: string) => Promise<EmailValidationResult>;
  
  // Styling
  readonly variant?: ComponentVariant;
  readonly size?: ComponentSize;
  readonly colorScheme?: ColorScheme;
  readonly fullWidth?: boolean;
  
  // Features
  readonly showValidationIcon?: boolean;
  readonly enableRealTimeValidation?: boolean;
  readonly gdprCompliant?: boolean;
}
```

### Style System

Template literal types for consistent styling:

```typescript
type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ComponentVariant = 'default' | 'primary' | 'secondary' | 'outline' | 'ghost';
type ColorScheme = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
```

### Widget Configuration

```typescript
interface SubscriptionWidgetProps extends BaseComponentProps {
  // Core functionality  
  readonly onSubscribe?: (email: ValidatedEmail) => Promise<SubscriptionResult>;
  
  // Component configuration
  readonly formProps?: Partial<SubscriptionFormProps>;
  readonly inputProps?: Partial<EmailInputProps>;
  readonly buttonProps?: Partial<SubscribeButtonProps>;
  
  // Layout and theming
  readonly layout?: WidgetLayout;
  readonly theme?: WidgetTheme;
  readonly responsive?: boolean;
  
  // Advanced features
  readonly features?: WidgetFeatures;
  readonly tracking?: TrackingConfiguration;
  readonly compliance?: ComplianceConfiguration;
}
```

## ⚙️ Configuration System

Environment-aware configuration with validation:

```typescript
interface EmailSubscriptionConfig {
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
```

### Validation Configuration

```typescript
interface ValidationConfiguration {
  readonly EMAIL_VALIDATION: {
    readonly ENABLED: boolean;
    readonly STRICT_MODE: boolean;
    readonly MAX_LENGTH: number;
    readonly REGEX_PATTERN: string;
    readonly CUSTOM_RULES: ValidationRule[];
  };
  readonly DOMAIN_VALIDATION: {
    readonly DNS_CHECK: boolean;
    readonly MX_RECORD_CHECK: boolean;
    readonly SMTP_CHECK: boolean;
  };
  readonly DISPOSABLE_EMAIL_CHECK: {
    readonly ENABLED: boolean;
    readonly BLOCK_DISPOSABLE: boolean;
  };
}
```

## 🎯 Event-Driven Architecture

Support for event sourcing, CQRS, and real-time updates:

### Event Types

```typescript
type SubscriptionEvent =
  | SubscriptionInitiatedEvent
  | SubscriptionValidatingEvent  
  | SubscriptionSucceededEvent
  | SubscriptionFailedEvent
  | SubscriptionConfirmedEvent
  | SubscriptionUnsubscribedEvent;

interface SubscriptionSucceededEvent extends BaseEvent {
  readonly type: 'subscription.succeeded';
  readonly payload: {
    readonly subscription: ExtendedSubscription;
    readonly is_new: boolean;
    readonly duration: number;
  };
}
```

### Event Emitter

```typescript
interface EventEmitter<T extends BaseEvent = BaseEvent> {
  on<K extends T['type']>(event: K, listener: EventListener<EventOfType<T, K>>): void;
  emit<K extends T['type']>(event: K, payload: EventOfType<T, K>): boolean;
  emit_async<K extends T['type']>(event: K, payload: EventOfType<T, K>): Promise<boolean>;
}
```

### State Machine

```typescript
type SubscriptionState = 
  | 'idle'
  | 'validating' 
  | 'submitting'
  | 'succeeded'
  | 'failed'
  | 'rate_limited';

interface StateMachine<S = SubscriptionState, E = SubscriptionEvent> {
  readonly current_state: S;
  transition(event: E): Promise<StateTransitionResult<S>>;
  can_transition(event_type: E['type']): boolean;
}
```

## 🛠️ Utility Types

Advanced TypeScript utilities for enhanced developer experience:

### Type Guards

```typescript
function isValidatedEmail(value: unknown): value is ValidatedEmail;
function isSubscriptionId(value: unknown): value is SubscriptionId;
function isBaseSubscription(value: unknown): value is BaseSubscription;
function isSuccessfulResult<T>(result: SubscriptionResult<T>): result is { success: true; data: T };
```

### Type Assertions

```typescript
function assertValidatedEmail(value: unknown): asserts value is ValidatedEmail;
function assertSubscriptionId(value: unknown): asserts value is SubscriptionId;
function assertSuccessfulResult<T>(result: SubscriptionResult<T>): asserts result is { success: true; data: T };
```

### Advanced Utilities

```typescript
type DeepReadonly<T> = { readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P] };
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type PickByType<T, U> = { [K in keyof T as T[K] extends U ? K : never]: T[K] };
type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };
```

## 📊 Validation System

Comprehensive email validation with multiple layers:

### Built-in Validators

```typescript
const EmailValidators = {
  isValidFormat: (email: string): boolean => EMAIL_PATTERNS.BASIC.test(email),
  isValidRFC5322: (email: string): boolean => EMAIL_PATTERNS.RFC5322.test(email),
  isValidStrict: (email: string): boolean => EMAIL_PATTERNS.STRICT.test(email),
  hasValidDomain: (email: string): boolean => { /* implementation */ },
  hasValidLocalPart: (email: string): boolean => { /* implementation */ },
};
```

### Custom Validation Rules

```typescript
interface ValidationRule {
  readonly name: string;
  readonly pattern: RegExp;
  readonly message: string;
  readonly severity: 'error' | 'warning' | 'info';
}

const customRule: ValidationRule = {
  name: 'corporate_email_only',
  pattern: /^[^@]+@(?!gmail\.com|yahoo\.com|hotmail\.com).+$/,
  message: 'Please use your corporate email address',
  severity: 'warning'
};
```

## 🔧 Best Practices

### 1. Always Use Branded Types

```typescript
// ❌ Avoid raw strings for emails
function subscribe(email: string) { /* ... */ }

// ✅ Use validated email types
function subscribe(email: ValidatedEmail) { /* ... */ }
```

### 2. Implement Proper Error Handling

```typescript
// ✅ Use Result pattern for operations that can fail
async function safeSubscription(email: string): Promise<Result<ExtendedSubscription, SubscriptionError>> {
  try {
    const validatedEmail = createValidatedEmail(email);
    if (!validatedEmail) {
      return { 
        success: false, 
        error: { 
          code: 'validation_invalid_format', 
          message: 'Invalid email format' 
        } 
      };
    }
    
    const result = await subscriptionService.create(validatedEmail);
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: { 
        code: 'operation_failed', 
        message: error.message 
      } 
    };
  }
}
```

### 3. Leverage Type Guards

```typescript
// ✅ Use type guards for runtime type checking
function processSubscriptionResult(result: unknown) {
  if (isSuccessfulSubscriptionResult(result)) {
    // TypeScript knows result.data is available
    console.log('Subscription created:', result.data.id);
  } else {
    // TypeScript knows result.error is available  
    console.error('Error:', result.error.message);
  }
}
```

### 4. Compose Validators

```typescript
// ✅ Create reusable validation chains
const emailValidatorChain = composeValidators(
  createValidator(
    (value): value is string => typeof value === 'string',
    'Email must be a string'
  ),
  createValidator(
    (value: string) => value.length >= 5,
    'Email must be at least 5 characters'
  ),
  createValidator(
    (value: string) => EmailValidators.isValidRFC5322(value),
    'Email format is invalid'
  )
);
```

## 📈 Performance Considerations

### Lazy Loading

```typescript
// ✅ Use lazy evaluation for expensive operations
type Lazy<T> = () => T;
const lazyValidator: Lazy<EmailValidationResult> = () => expensiveValidation(email);
```

### Memoization

```typescript
// ✅ Cache validation results
type Memoized<T extends (...args: any[]) => any> = T & {
  clear: () => void;
  cache: Map<string, ReturnType<T>>;
};

const memoizedValidator: Memoized<typeof validateEmail> = memoize(validateEmail);
```

## 🚀 Migration Guide

### From Existing Types

If you have existing email subscription types, here's how to migrate:

1. **Replace string emails with ValidatedEmail**:
```typescript
// Before
interface OldSubscription {
  email: string;
}

// After  
interface NewSubscription {
  email: ValidatedEmail;
}
```

2. **Update error handling**:
```typescript
// Before
function subscribe(email: string): Promise<Subscription | null> {
  // ...
}

// After
function subscribe(email: ValidatedEmail): Promise<SubscriptionResult<ExtendedSubscription>> {
  // ...
}
```

3. **Add runtime validation**:
```typescript
// Before
const email = userInput;
await subscribe(email);

// After
const validatedEmail = createValidatedEmail(userInput);
if (validatedEmail) {
  await subscribe(validatedEmail);
} else {
  handleValidationError();
}
```

## 🧪 Testing

### Unit Tests with Type Safety

```typescript
import { createValidatedEmail, isValidatedEmail } from './types/email-subscription';

describe('Email Validation', () => {
  it('should create validated email for valid input', () => {
    const email = createValidatedEmail('test@example.com');
    expect(email).toBeTruthy();
    expect(isValidatedEmail(email)).toBe(true);
  });
  
  it('should reject invalid email format', () => {
    const email = createValidatedEmail('invalid-email');
    expect(email).toBeNull();
  });
});
```

### Mock Database Adapter

```typescript
class MockDatabaseAdapter implements DatabaseAdapter {
  private subscriptions: Map<SubscriptionId, ExtendedSubscription> = new Map();
  
  async insert(subscription: InsertableSubscription): Promise<SubscriptionResult<ExtendedSubscription>> {
    const id = 'sub_' + Date.now() as SubscriptionId;
    const fullSubscription: ExtendedSubscription = {
      ...subscription,
      id,
      subscribed_at: new Date().toISOString() as ISOTimestamp,
      updated_at: new Date().toISOString() as ISOTimestamp,
      status: { type: 'active', confirmed_at: new Date().toISOString() as ISOTimestamp }
    };
    
    this.subscriptions.set(id, fullSubscription);
    return { success: true, data: fullSubscription };
  }
  
  // ... other methods
}
```

## 📚 Examples

See the [examples.ts](./examples.ts) file for comprehensive usage patterns including:

- Basic email validation and subscription flow
- Database adapter implementations
- API client usage
- React component integration  
- Event-driven architecture
- Configuration management
- Error handling patterns
- Testing strategies

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Add comprehensive tests for new types
4. Ensure all TypeScript strict checks pass
5. Update documentation and examples
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Development Guidelines

- All types must have comprehensive JSDoc comments
- Include runtime validation for branded types
- Provide usage examples for complex types
- Maintain backwards compatibility
- Follow semantic versioning

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- TypeScript team for advanced type system features
- React community for component pattern inspiration
- Database communities for adapter pattern guidance
- Contributors who helped shape this type system

---

**Built with ❤️ for the TypeScript community**

For questions, suggestions, or issues, please visit our [GitHub repository](https://github.com/example/email-subscription-types) or contact the maintainers.