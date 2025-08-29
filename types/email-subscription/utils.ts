/**
 * Utility Types and Type Guards for Email Subscription System
 * 
 * This file provides essential utility types, type guards, assertion functions,
 * and helper utilities for the email subscription system. Designed to enhance
 * type safety, runtime validation, and developer experience.
 * 
 * Features:
 * - Branded type creation and validation utilities
 * - Type guards with runtime validation
 * - Type assertion functions
 * - Advanced utility types
 * - Email validation helpers
 * - Error handling utilities
 * - Performance optimization types
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

import type {
  ValidatedEmail,
  SanitizedEmail,
  SubscriptionId,
  ISOTimestamp,
  BaseSubscription,
  ExtendedSubscription,
  SubscriptionError,
  EmailValidationResult,
  SubscriptionResult,
} from './core';

// =====================================================
// BRANDED TYPE UTILITIES
// =====================================================

/**
 * Generic branded type creator
 */
export type Brand<T, B extends string> = T & { readonly __brand: B };

/**
 * Extract the base type from a branded type
 */
export type Unbrand<T> = T extends Brand<infer U, string> ? U : T;

/**
 * Create a branded type validator
 */
export type BrandValidator<T extends Brand<any, string>> = (value: Unbrand<T>) => T | null;

/**
 * Branded type factory function
 */
export function createBrandedType<T, B extends string>(
  brand: B,
  validator: (value: T) => boolean,
  errorMessage?: string
): BrandValidator<Brand<T, B>> {
  return (value: T): Brand<T, B> | null => {
    if (validator(value)) {
      return value as Brand<T, B>;
    }
    if (errorMessage && typeof console !== 'undefined') {
      console.warn(`Invalid ${brand}: ${errorMessage}`);
    }
    return null;
  };
}

// =====================================================
// EMAIL VALIDATION UTILITIES
// =====================================================

/**
 * Email validation regex patterns
 */
export const EMAIL_PATTERNS = {
  BASIC: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  RFC5322: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  STRICT: /^[a-zA-Z0-9][a-zA-Z0-9._%+-]*[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/,
} as const;

/**
 * Email validation functions
 */
export const EmailValidators = {
  /**
   * Basic email format validation
   */
  isValidFormat: (email: string): boolean => EMAIL_PATTERNS.BASIC.test(email),
  
  /**
   * RFC 5322 compliant email validation
   */
  isValidRFC5322: (email: string): boolean => EMAIL_PATTERNS.RFC5322.test(email),
  
  /**
   * Strict email validation
   */
  isValidStrict: (email: string): boolean => EMAIL_PATTERNS.STRICT.test(email),
  
  /**
   * Email length validation
   */
  isValidLength: (email: string, maxLength = 254): boolean => 
    email.length > 0 && email.length <= maxLength,
  
  /**
   * Domain validation
   */
  hasValidDomain: (email: string): boolean => {
    const domain = email.split('@')[1];
    return domain ? domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.') : false;
  },
  
  /**
   * Local part validation (before @)
   */
  hasValidLocalPart: (email: string): boolean => {
    const localPart = email.split('@')[0];
    return localPart ? localPart.length > 0 && localPart.length <= 64 : false;
  },
};

/**
 * Email sanitization utilities
 */
export const EmailSanitizers = {
  /**
   * Sanitize email (trim and lowercase)
   */
  sanitize: (email: string): string => email.trim().toLowerCase(),
  
  /**
   * Remove common typos and normalize
   */
  normalize: (email: string): string => {
    let normalized = email.trim().toLowerCase();
    
    // Common domain typos
    const domainFixes: Record<string, string> = {
      'gmail.co': 'gmail.com',
      'gmail.cm': 'gmail.com',
      'gmai.com': 'gmail.com',
      'yahoo.co': 'yahoo.com',
      'hotmail.co': 'hotmail.com',
      'outlook.co': 'outlook.com',
    };
    
    for (const [typo, correct] of Object.entries(domainFixes)) {
      normalized = normalized.replace(new RegExp(`@${typo}$`), `@${correct}`);
    }
    
    return normalized;
  },
  
  /**
   * Extract domain from email
   */
  extractDomain: (email: string): string | null => {
    const parts = email.split('@');
    return parts.length === 2 ? parts[1] : null;
  },
  
  /**
   * Extract local part from email
   */
  extractLocalPart: (email: string): string | null => {
    const parts = email.split('@');
    return parts.length === 2 ? parts[0] : null;
  },
};

/**
 * Create validated email branded type
 */
export const createValidatedEmail = createBrandedType<string, 'ValidatedEmail'>(
  'ValidatedEmail',
  (email: string) => EmailValidators.isValidRFC5322(email) && EmailValidators.isValidLength(email),
  'Email must be valid RFC5322 format and within length limits'
);

/**
 * Create sanitized email branded type
 */
export const createSanitizedEmail = createBrandedType<string, 'SanitizedEmail'>(
  'SanitizedEmail',
  (email: string) => email === EmailSanitizers.sanitize(email),
  'Email must be properly sanitized (trimmed and lowercased)'
);

// =====================================================
// TYPE GUARDS
// =====================================================

/**
 * Type guard for ValidatedEmail
 */
export function isValidatedEmail(value: unknown): value is ValidatedEmail {
  return typeof value === 'string' && EmailValidators.isValidRFC5322(value);
}

/**
 * Type guard for SanitizedEmail
 */
export function isSanitizedEmail(value: unknown): value is SanitizedEmail {
  return typeof value === 'string' && value === EmailSanitizers.sanitize(value);
}

/**
 * Type guard for SubscriptionId
 */
export function isSubscriptionId(value: unknown): value is SubscriptionId {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Type guard for ISOTimestamp
 */
export function isISOTimestamp(value: unknown): value is ISOTimestamp {
  if (typeof value !== 'string') return false;
  
  try {
    const date = new Date(value);
    return date.toISOString() === value;
  } catch {
    return false;
  }
}

/**
 * Type guard for BaseSubscription
 */
export function isBaseSubscription(value: unknown): value is BaseSubscription {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    isSubscriptionId(obj.id) &&
    isValidatedEmail(obj.email) &&
    isISOTimestamp(obj.subscribed_at) &&
    isISOTimestamp(obj.updated_at)
  );
}

/**
 * Type guard for ExtendedSubscription
 */
export function isExtendedSubscription(value: unknown): value is ExtendedSubscription {
  if (!isBaseSubscription(value)) return false;
  
  const obj = value as ExtendedSubscription;
  
  // Check status property exists and has valid structure
  return typeof obj.status === 'object' && obj.status !== null && 'type' in obj.status;
}

/**
 * Type guard for SubscriptionError
 */
export function isSubscriptionError(value: unknown): value is SubscriptionError {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.code === 'string' &&
    typeof obj.message === 'string' &&
    isISOTimestamp(obj.timestamp)
  );
}

/**
 * Type guard for EmailValidationResult
 */
export function isEmailValidationResult(value: unknown): value is EmailValidationResult {
  if (typeof value !== 'object' || value === null) return false;
  
  const obj = value as Record<string, unknown>;
  
  return (
    typeof obj.isValid === 'boolean' &&
    isSanitizedEmail(obj.sanitized) &&
    typeof obj.original === 'string'
  );
}

/**
 * Type guard for successful SubscriptionResult
 */
export function isSuccessfulSubscriptionResult<T>(
  value: SubscriptionResult<T>
): value is Extract<SubscriptionResult<T>, { success: true }> {
  return value.success === true;
}

/**
 * Type guard for failed SubscriptionResult
 */
export function isFailedSubscriptionResult<T>(
  value: SubscriptionResult<T>
): value is Extract<SubscriptionResult<T>, { success: false }> {
  return value.success === false;
}

// =====================================================
// TYPE ASSERTION FUNCTIONS
// =====================================================

/**
 * Assert that a value is a ValidatedEmail
 */
export function assertValidatedEmail(value: unknown, message?: string): asserts value is ValidatedEmail {
  if (!isValidatedEmail(value)) {
    throw new TypeError(message ?? `Expected ValidatedEmail, got ${typeof value}`);
  }
}

/**
 * Assert that a value is a SubscriptionId
 */
export function assertSubscriptionId(value: unknown, message?: string): asserts value is SubscriptionId {
  if (!isSubscriptionId(value)) {
    throw new TypeError(message ?? `Expected SubscriptionId, got ${typeof value}`);
  }
}

/**
 * Assert that a value is an ISOTimestamp
 */
export function assertISOTimestamp(value: unknown, message?: string): asserts value is ISOTimestamp {
  if (!isISOTimestamp(value)) {
    throw new TypeError(message ?? `Expected ISOTimestamp, got ${typeof value}`);
  }
}

/**
 * Assert that a subscription result is successful
 */
export function assertSuccessfulResult<T>(
  result: SubscriptionResult<T>,
  message?: string
): asserts result is Extract<SubscriptionResult<T>, { success: true }> {
  if (!isSuccessfulSubscriptionResult(result)) {
    throw new Error(message ?? `Expected successful result, got error: ${result.error.message}`);
  }
}

// =====================================================
// ADVANCED UTILITY TYPES
// =====================================================

/**
 * Make all properties of a type deeply readonly
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Make specific properties optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type Required<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};

/**
 * Pick properties by value type
 */
export type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

/**
 * Omit properties by value type
 */
export type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};

/**
 * Extract function property names
 */
export type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

/**
 * Extract non-function property names
 */
export type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
}[keyof T];

/**
 * Create a type with only function properties
 */
export type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;

/**
 * Create a type with only non-function properties
 */
export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

/**
 * Convert union type to intersection type
 */
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

/**
 * Get the keys of a type as a union
 */
export type KeysOfUnion<T> = T extends T ? keyof T : never;

/**
 * Flatten nested object types
 */
export type Flatten<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: Flatten<O[K]> }
    : never
  : T;

/**
 * Create a type that represents a Promise or the value itself
 */
export type Awaitable<T> = T | Promise<T>;

/**
 * Extract the resolved type from a Promise
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Create a mutable version of a readonly type
 */
export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

/**
 * Create a type with specific keys made mutable
 */
export type MutableKeys<T, K extends keyof T> = Omit<T, K> & {
  -readonly [P in K]: T[P];
};

/**
 * Extract array element type
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/**
 * Create a type that excludes null and undefined
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

// =====================================================
// CONDITIONAL UTILITY TYPES
// =====================================================

/**
 * Check if two types are equal
 */
export type Equals<T, U> = T extends U ? (U extends T ? true : false) : false;

/**
 * Check if a type extends another
 */
export type Extends<T, U> = T extends U ? true : false;

/**
 * Check if a type is any
 */
export type IsAny<T> = 0 extends 1 & T ? true : false;

/**
 * Check if a type is unknown
 */
export type IsUnknown<T> = IsAny<T> extends true ? false : unknown extends T ? true : false;

/**
 * Check if a type is never
 */
export type IsNever<T> = [T] extends [never] ? true : false;

/**
 * Check if a type is a function
 */
export type IsFunction<T> = T extends (...args: any[]) => any ? true : false;

/**
 * Check if a type is an array
 */
export type IsArray<T> = T extends readonly any[] ? true : false;

/**
 * Check if a type is an object (but not array or function)
 */
export type IsObject<T> = T extends object
  ? T extends any[]
    ? false
    : T extends (...args: any[]) => any
    ? false
    : true
  : false;

// =====================================================
// PERFORMANCE OPTIMIZATION TYPES
// =====================================================

/**
 * Lazy evaluation type for expensive computations
 */
export type Lazy<T> = () => T;

/**
 * Memoization type for caching results
 */
export type Memoized<T extends (...args: any[]) => any> = T & {
  clear: () => void;
  cache: Map<string, ReturnType<T>>;
};

/**
 * Debounced function type
 */
export type Debounced<T extends (...args: any[]) => any> = T & {
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
  pending: () => boolean;
};

/**
 * Throttled function type
 */
export type Throttled<T extends (...args: any[]) => any> = T & {
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
};

// =====================================================
// ERROR HANDLING UTILITIES
// =====================================================

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Option type for nullable values
 */
export type Option<T> = T | null | undefined;

/**
 * Try-catch wrapper type
 */
export type Try<T> = Result<T, Error>;

/**
 * Error boundary type
 */
export interface ErrorBoundary<T = unknown> {
  readonly hasError: boolean;
  readonly error: Error | null;
  readonly retry: () => void;
  readonly reset: () => void;
  readonly data: T | null;
}

/**
 * Safe function type that never throws
 */
export type SafeFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => Result<ReturnType<T>, Error>;

// =====================================================
// EMAIL DOMAIN UTILITIES
// =====================================================

/**
 * Common email domains
 */
export const COMMON_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'apple.com',
  'live.com',
  'msn.com',
  'aol.com',
] as const;

/**
 * Disposable email domains (common ones)
 */
export const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.org',
  'temp-mail.org',
] as const;

/**
 * Domain classification types
 */
export type EmailDomainType = 
  | 'common'
  | 'business'
  | 'educational'
  | 'disposable'
  | 'role'
  | 'unknown';

/**
 * Domain information interface
 */
export interface DomainInfo {
  readonly domain: string;
  readonly type: EmailDomainType;
  readonly reputation: 'high' | 'medium' | 'low' | 'unknown';
  readonly deliverability: 'good' | 'poor' | 'blocked' | 'unknown';
}

// =====================================================
// VALIDATION HELPERS
// =====================================================

/**
 * Create a validation function with custom error messages
 */
export function createValidator<T>(
  predicate: (value: unknown) => value is T,
  errorMessage: string
) {
  return (value: unknown): Result<T, string> => {
    if (predicate(value)) {
      return { success: true, data: value };
    }
    return { success: false, error: errorMessage };
  };
}

/**
 * Compose multiple validators
 */
export function composeValidators<T>(
  ...validators: Array<(value: T) => Result<T, string>>
) {
  return (value: T): Result<T, string[]> => {
    const errors: string[] = [];
    
    for (const validator of validators) {
      const result = validator(value);
      if (!result.success) {
        errors.push(result.error);
      }
    }
    
    if (errors.length > 0) {
      return { success: false, error: errors };
    }
    
    return { success: true, data: value };
  };
}

/**
 * Create an async validator
 */
export function createAsyncValidator<T>(
  predicate: (value: unknown) => Promise<value is T>,
  errorMessage: string
) {
  return async (value: unknown): Promise<Result<T, string>> => {
    try {
      if (await predicate(value)) {
        return { success: true, data: value as T };
      }
      return { success: false, error: errorMessage };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  };
}

// =====================================================
// EXPORT COLLECTION
// =====================================================

/**
 * All utility types for convenient importing
 */
export type {
  // Branded types
  Brand,
  Unbrand,
  BrandValidator,
  
  // Type guards
  // (functions are exported as values)
  
  // Advanced utilities
  DeepReadonly,
  Optional,
  Required,
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
  Awaited,
  Mutable,
  MutableKeys,
  ArrayElement,
  NonNullable,
  
  // Conditional types
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
  
  // Error handling
  Result,
  Option,
  Try,
  ErrorBoundary,
  SafeFunction,
  
  // Domain utilities
  EmailDomainType,
  DomainInfo,
} as EmailSubscriptionUtilTypes;