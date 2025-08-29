/**
 * Event System Types for Email Subscription
 * 
 * This file provides comprehensive type definitions for event handling and state
 * management in the email subscription system. Supports both synchronous and
 * asynchronous event patterns, state machines, and reactive programming.
 * 
 * Features:
 * - Type-safe event definitions with discriminated unions
 * - State machine patterns for subscription lifecycle
 * - Event emitter interfaces with generic payloads
 * - Callback and handler type definitions
 * - Real-time event streaming types
 * - Event sourcing and CQRS patterns
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

import type {
  ValidatedEmail,
  SubscriptionId,
  ISOTimestamp,
  ExtendedSubscription,
  SubscriptionError,
  SubscriptionResult,
  EmailValidationResult,
} from './core';

// =====================================================
// CORE EVENT TYPES
// =====================================================

/**
 * Base event interface
 * All events in the system extend this interface
 */
export interface BaseEvent {
  readonly type: string;
  readonly id: EventId;
  readonly timestamp: ISOTimestamp;
  readonly version: number;
  readonly metadata?: EventMetadata;
}

/**
 * Event ID branded type
 */
export type EventId = string & { readonly __brand: 'EventId' };

/**
 * Event metadata for additional context
 */
export interface EventMetadata {
  readonly source?: EventSource;
  readonly correlation_id?: string;
  readonly causation_id?: string;
  readonly user_id?: string;
  readonly session_id?: string;
  readonly ip_address?: string;
  readonly user_agent?: string;
  readonly trace_id?: string;
  readonly [key: string]: unknown;
}

/**
 * Event source information
 */
export interface EventSource {
  readonly system: string;
  readonly component: string;
  readonly version: string;
  readonly environment: string;
}

// =====================================================
// SUBSCRIPTION EVENT TYPES
// =====================================================

/**
 * Subscription-related events using discriminated unions
 * Ensures type safety when handling different event types
 */
export type SubscriptionEvent =
  | SubscriptionInitiatedEvent
  | SubscriptionValidatingEvent
  | SubscriptionValidatedEvent
  | SubscriptionValidationFailedEvent
  | SubscriptionSubmittingEvent
  | SubscriptionSucceededEvent
  | SubscriptionFailedEvent
  | SubscriptionConfirmedEvent
  | SubscriptionUnsubscribedEvent
  | SubscriptionReactivatedEvent
  | SubscriptionDeletedEvent
  | SubscriptionBatchProcessedEvent
  | SubscriptionCountUpdatedEvent;

/**
 * Subscription initiated event
 */
export interface SubscriptionInitiatedEvent extends BaseEvent {
  readonly type: 'subscription.initiated';
  readonly payload: {
    readonly email: string;
    readonly source: string;
    readonly metadata?: Record<string, unknown>;
  };
}

/**
 * Email validation started event
 */
export interface SubscriptionValidatingEvent extends BaseEvent {
  readonly type: 'subscription.validating';
  readonly payload: {
    readonly email: string;
    readonly validation_type: 'client' | 'server' | 'realtime';
  };
}

/**
 * Email validation completed event
 */
export interface SubscriptionValidatedEvent extends BaseEvent {
  readonly type: 'subscription.validated';
  readonly payload: {
    readonly email: ValidatedEmail;
    readonly validation_result: EmailValidationResult;
    readonly duration: number;
  };
}

/**
 * Email validation failed event
 */
export interface SubscriptionValidationFailedEvent extends BaseEvent {
  readonly type: 'subscription.validation_failed';
  readonly payload: {
    readonly email: string;
    readonly validation_result: EmailValidationResult;
    readonly error: SubscriptionError;
  };
}

/**
 * Subscription submission started event
 */
export interface SubscriptionSubmittingEvent extends BaseEvent {
  readonly type: 'subscription.submitting';
  readonly payload: {
    readonly email: ValidatedEmail;
    readonly retry_attempt?: number;
  };
}

/**
 * Subscription successfully created event
 */
export interface SubscriptionSucceededEvent extends BaseEvent {
  readonly type: 'subscription.succeeded';
  readonly payload: {
    readonly subscription: ExtendedSubscription;
    readonly is_new: boolean;
    readonly duration: number;
  };
}

/**
 * Subscription creation failed event
 */
export interface SubscriptionFailedEvent extends BaseEvent {
  readonly type: 'subscription.failed';
  readonly payload: {
    readonly email: ValidatedEmail;
    readonly error: SubscriptionError;
    readonly retry_count: number;
    readonly will_retry: boolean;
  };
}

/**
 * Subscription confirmed event (double opt-in)
 */
export interface SubscriptionConfirmedEvent extends BaseEvent {
  readonly type: 'subscription.confirmed';
  readonly payload: {
    readonly subscription_id: SubscriptionId;
    readonly confirmed_at: ISOTimestamp;
    readonly confirmation_token: string;
  };
}

/**
 * Subscription unsubscribed event
 */
export interface SubscriptionUnsubscribedEvent extends BaseEvent {
  readonly type: 'subscription.unsubscribed';
  readonly payload: {
    readonly subscription_id: SubscriptionId;
    readonly email: ValidatedEmail;
    readonly reason: UnsubscribeReason;
    readonly unsubscribed_at: ISOTimestamp;
  };
}

/**
 * Subscription reactivated event
 */
export interface SubscriptionReactivatedEvent extends BaseEvent {
  readonly type: 'subscription.reactivated';
  readonly payload: {
    readonly subscription_id: SubscriptionId;
    readonly email: ValidatedEmail;
    readonly reactivated_at: ISOTimestamp;
  };
}

/**
 * Subscription deleted event
 */
export interface SubscriptionDeletedEvent extends BaseEvent {
  readonly type: 'subscription.deleted';
  readonly payload: {
    readonly subscription_id: SubscriptionId;
    readonly email: ValidatedEmail;
    readonly deleted_at: ISOTimestamp;
    readonly reason: string;
  };
}

/**
 * Batch subscription processed event
 */
export interface SubscriptionBatchProcessedEvent extends BaseEvent {
  readonly type: 'subscription.batch_processed';
  readonly payload: {
    readonly batch_id: string;
    readonly total_count: number;
    readonly successful_count: number;
    readonly failed_count: number;
    readonly duration: number;
  };
}

/**
 * Subscription count updated event
 */
export interface SubscriptionCountUpdatedEvent extends BaseEvent {
  readonly type: 'subscription.count_updated';
  readonly payload: {
    readonly previous_count: number;
    readonly current_count: number;
    readonly change: number;
  };
}

/**
 * Unsubscribe reason enumeration
 */
export type UnsubscribeReason = 
  | 'user_requested'
  | 'bounce_hard'
  | 'bounce_soft'
  | 'spam_complaint'
  | 'admin_action'
  | 'gdpr_request'
  | 'inactive_cleanup';

// =====================================================
// STATE MANAGEMENT TYPES
// =====================================================

/**
 * Subscription state machine states
 * Represents the complete lifecycle of a subscription
 */
export type SubscriptionState =
  | 'idle'
  | 'validating'
  | 'submitting'
  | 'succeeded'
  | 'failed'
  | 'rate_limited'
  | 'already_exists'
  | 'pending_confirmation'
  | 'confirmed'
  | 'unsubscribed'
  | 'error';

/**
 * State transition definition
 */
export interface StateTransition<S = SubscriptionState, E = SubscriptionEvent> {
  readonly from: S;
  readonly to: S;
  readonly event: E['type'];
  readonly condition?: (state: S, event: E) => boolean;
  readonly action?: (state: S, event: E) => void | Promise<void>;
}

/**
 * State machine configuration
 */
export interface StateMachineConfig<S = SubscriptionState, E = SubscriptionEvent> {
  readonly initial_state: S;
  readonly states: S[];
  readonly transitions: StateTransition<S, E>[];
  readonly context?: StateMachineContext;
}

/**
 * State machine context for additional data
 */
export interface StateMachineContext {
  readonly [key: string]: unknown;
}

/**
 * State machine instance
 */
export interface StateMachine<S = SubscriptionState, E = SubscriptionEvent> {
  readonly current_state: S;
  readonly context: StateMachineContext;
  
  // Methods
  transition(event: E): Promise<StateTransitionResult<S>>;
  can_transition(event_type: E['type']): boolean;
  get_available_transitions(): E['type'][];
  reset(): void;
}

/**
 * State transition result
 */
export interface StateTransitionResult<S = SubscriptionState> {
  readonly success: boolean;
  readonly from_state: S;
  readonly to_state: S;
  readonly error?: string;
  readonly context_changes?: Record<string, unknown>;
}

// =====================================================
// EVENT EMITTER TYPES
// =====================================================

/**
 * Generic event emitter interface
 */
export interface EventEmitter<T extends BaseEvent = BaseEvent> {
  // Event registration
  on<K extends T['type']>(event: K, listener: EventListener<EventOfType<T, K>>): void;
  once<K extends T['type']>(event: K, listener: EventListener<EventOfType<T, K>>): void;
  off<K extends T['type']>(event: K, listener: EventListener<EventOfType<T, K>>): void;
  
  // Event emission
  emit<K extends T['type']>(event: K, payload: EventOfType<T, K>): boolean;
  emit_async<K extends T['type']>(event: K, payload: EventOfType<T, K>): Promise<boolean>;
  
  // Utility methods
  listener_count(event: T['type']): number;
  event_names(): T['type'][];
  remove_all_listeners(event?: T['type']): void;
  
  // Error handling
  on_error(handler: ErrorEventHandler): void;
}

/**
 * Extract event of specific type from union
 */
export type EventOfType<T extends BaseEvent, K extends T['type']> = T extends { type: K } ? T : never;

/**
 * Event listener function type
 */
export type EventListener<T extends BaseEvent> = (event: T) => void | Promise<void>;

/**
 * Error event handler
 */
export type ErrorEventHandler = (error: Error, event?: BaseEvent) => void;

/**
 * Event subscription handle
 */
export interface EventSubscription {
  readonly event_type: string;
  readonly listener: EventListener<BaseEvent>;
  unsubscribe(): void;
}

// =====================================================
// CALLBACK TYPES
// =====================================================

/**
 * Subscription lifecycle callbacks
 */
export interface SubscriptionCallbacks {
  readonly on_initiated?: (event: SubscriptionInitiatedEvent) => void;
  readonly on_validating?: (event: SubscriptionValidatingEvent) => void;
  readonly on_validated?: (event: SubscriptionValidatedEvent) => void;
  readonly on_validation_failed?: (event: SubscriptionValidationFailedEvent) => void;
  readonly on_submitting?: (event: SubscriptionSubmittingEvent) => void;
  readonly on_succeeded?: (event: SubscriptionSucceededEvent) => void;
  readonly on_failed?: (event: SubscriptionFailedEvent) => void;
  readonly on_confirmed?: (event: SubscriptionConfirmedEvent) => void;
  readonly on_unsubscribed?: (event: SubscriptionUnsubscribedEvent) => void;
  readonly on_state_change?: (from: SubscriptionState, to: SubscriptionState, event: SubscriptionEvent) => void;
  readonly on_error?: (error: SubscriptionError, context?: EventMetadata) => void;
}

/**
 * Validation callbacks
 */
export interface ValidationCallbacks {
  readonly on_validation_start?: (email: string) => void;
  readonly on_validation_progress?: (email: string, step: ValidationStep) => void;
  readonly on_validation_complete?: (email: ValidatedEmail, result: EmailValidationResult) => void;
  readonly on_validation_error?: (email: string, error: SubscriptionError) => void;
}

/**
 * Validation steps for progress tracking
 */
export type ValidationStep = 
  | 'format_check'
  | 'domain_lookup'
  | 'mx_check'
  | 'disposable_check'
  | 'role_check'
  | 'typo_check'
  | 'deliverability_check';

/**
 * Generic callback function types
 */
export type AsyncCallback<T = void, U = unknown> = (arg: U) => Promise<T> | T;
export type SyncCallback<T = void, U = unknown> = (arg: U) => T;
export type VoidCallback = () => void;
export type ErrorCallback = (error: Error) => void;

// =====================================================
// REAL-TIME EVENT STREAMING
// =====================================================

/**
 * Event stream interface for real-time updates
 */
export interface EventStream<T extends BaseEvent = BaseEvent> {
  // Stream management
  start(): Promise<void>;
  stop(): Promise<void>;
  is_active(): boolean;
  
  // Event subscription
  subscribe<K extends T['type']>(
    event_type: K,
    handler: EventStreamHandler<EventOfType<T, K>>
  ): EventStreamSubscription;
  
  subscribe_to_pattern(
    pattern: EventPattern,
    handler: EventStreamHandler<T>
  ): EventStreamSubscription;
  
  // Event filtering
  filter(predicate: EventPredicate<T>): EventStream<T>;
  map<U extends BaseEvent>(mapper: EventMapper<T, U>): EventStream<U>;
  
  // Buffering and batching
  buffer(size: number): EventStream<T[]>;
  buffer_time(duration: number): EventStream<T[]>;
  debounce(duration: number): EventStream<T>;
  throttle(duration: number): EventStream<T>;
  
  // Error handling
  catch(handler: StreamErrorHandler): EventStream<T>;
  retry(attempts: number): EventStream<T>;
}

/**
 * Event stream handler
 */
export type EventStreamHandler<T extends BaseEvent> = (event: T) => void | Promise<void>;

/**
 * Event stream subscription
 */
export interface EventStreamSubscription {
  readonly id: string;
  readonly active: boolean;
  unsubscribe(): Promise<void>;
}

/**
 * Event pattern for subscription filtering
 */
export type EventPattern = string | RegExp | EventMatcher;

/**
 * Event matcher function
 */
export type EventMatcher = (event: BaseEvent) => boolean;

/**
 * Event predicate for filtering
 */
export type EventPredicate<T extends BaseEvent> = (event: T) => boolean;

/**
 * Event mapper for transformation
 */
export type EventMapper<T extends BaseEvent, U extends BaseEvent> = (event: T) => U;

/**
 * Stream error handler
 */
export type StreamErrorHandler = (error: Error, stream: EventStream) => void;

// =====================================================
// EVENT SOURCING TYPES
// =====================================================

/**
 * Event store interface for persistence
 */
export interface EventStore {
  // Event persistence
  append(stream_id: string, events: BaseEvent[]): Promise<void>;
  append_to_stream(stream_id: string, event: BaseEvent, expected_version?: number): Promise<void>;
  
  // Event retrieval
  get_events(stream_id: string, from_version?: number): Promise<BaseEvent[]>;
  get_events_by_type(event_type: string, from?: ISOTimestamp, to?: ISOTimestamp): Promise<BaseEvent[]>;
  get_all_events(from_position?: number): Promise<BaseEvent[]>;
  
  // Stream management
  stream_exists(stream_id: string): Promise<boolean>;
  delete_stream(stream_id: string, hard_delete?: boolean): Promise<void>;
  
  // Snapshots
  save_snapshot(stream_id: string, version: number, data: unknown): Promise<void>;
  get_snapshot(stream_id: string): Promise<EventSnapshot | null>;
  
  // Projections
  create_projection(name: string, definition: ProjectionDefinition): Promise<void>;
  get_projection_state(name: string): Promise<unknown>;
}

/**
 * Event snapshot for performance optimization
 */
export interface EventSnapshot {
  readonly stream_id: string;
  readonly version: number;
  readonly timestamp: ISOTimestamp;
  readonly data: unknown;
}

/**
 * Projection definition for read models
 */
export interface ProjectionDefinition {
  readonly name: string;
  readonly query: string;
  readonly handlers: Record<string, ProjectionHandler>;
  readonly options?: ProjectionOptions;
}

/**
 * Projection handler function
 */
export type ProjectionHandler = (state: unknown, event: BaseEvent) => unknown;

/**
 * Projection options
 */
export interface ProjectionOptions {
  readonly emit_enabled?: boolean;
  readonly checkpoint_after?: number;
  readonly process_existing_events?: boolean;
}

// =====================================================
// COMMAND QUERY RESPONSIBILITY SEGREGATION (CQRS)
// =====================================================

/**
 * Command interface for write operations
 */
export interface Command {
  readonly type: string;
  readonly id: string;
  readonly timestamp: ISOTimestamp;
  readonly metadata?: CommandMetadata;
}

/**
 * Command metadata
 */
export interface CommandMetadata {
  readonly user_id?: string;
  readonly correlation_id?: string;
  readonly expected_version?: number;
  readonly [key: string]: unknown;
}

/**
 * Query interface for read operations
 */
export interface Query {
  readonly type: string;
  readonly parameters: QueryParameters;
  readonly timestamp: ISOTimestamp;
}

/**
 * Query parameters
 */
export interface QueryParameters {
  readonly [key: string]: unknown;
}

/**
 * Command handler interface
 */
export interface CommandHandler<T extends Command = Command> {
  handle(command: T): Promise<BaseEvent[]>;
  can_handle(command_type: string): boolean;
}

/**
 * Query handler interface
 */
export interface QueryHandler<T extends Query = Query, R = unknown> {
  handle(query: T): Promise<R>;
  can_handle(query_type: string): boolean;
}

/**
 * Command bus for routing commands
 */
export interface CommandBus {
  send<T extends Command>(command: T): Promise<void>;
  register_handler<T extends Command>(command_type: string, handler: CommandHandler<T>): void;
  unregister_handler(command_type: string): void;
}

/**
 * Query bus for routing queries
 */
export interface QueryBus {
  ask<T extends Query, R>(query: T): Promise<R>;
  register_handler<T extends Query, R>(query_type: string, handler: QueryHandler<T, R>): void;
  unregister_handler(query_type: string): void;
}

// =====================================================
// SUBSCRIPTION-SPECIFIC COMMANDS
// =====================================================

/**
 * Subscription commands
 */
export type SubscriptionCommand =
  | CreateSubscriptionCommand
  | ConfirmSubscriptionCommand
  | UnsubscribeCommand
  | UpdateSubscriptionCommand
  | DeleteSubscriptionCommand;

/**
 * Create subscription command
 */
export interface CreateSubscriptionCommand extends Command {
  readonly type: 'create_subscription';
  readonly payload: {
    readonly email: ValidatedEmail;
    readonly source: string;
    readonly metadata?: Record<string, unknown>;
  };
}

/**
 * Confirm subscription command
 */
export interface ConfirmSubscriptionCommand extends Command {
  readonly type: 'confirm_subscription';
  readonly payload: {
    readonly subscription_id: SubscriptionId;
    readonly token: string;
  };
}

/**
 * Unsubscribe command
 */
export interface UnsubscribeCommand extends Command {
  readonly type: 'unsubscribe';
  readonly payload: {
    readonly subscription_id?: SubscriptionId;
    readonly email?: ValidatedEmail;
    readonly token?: string;
    readonly reason: UnsubscribeReason;
  };
}

/**
 * Update subscription command
 */
export interface UpdateSubscriptionCommand extends Command {
  readonly type: 'update_subscription';
  readonly payload: {
    readonly subscription_id: SubscriptionId;
    readonly updates: Partial<ExtendedSubscription>;
  };
}

/**
 * Delete subscription command
 */
export interface DeleteSubscriptionCommand extends Command {
  readonly type: 'delete_subscription';
  readonly payload: {
    readonly subscription_id: SubscriptionId;
    readonly reason: string;
    readonly hard_delete?: boolean;
  };
}

// =====================================================
// SUBSCRIPTION QUERIES
// =====================================================

/**
 * Subscription queries
 */
export type SubscriptionQuery =
  | GetSubscriptionQuery
  | GetSubscriptionsQuery
  | GetSubscriptionCountQuery
  | GetSubscriptionStatsQuery;

/**
 * Get single subscription query
 */
export interface GetSubscriptionQuery extends Query {
  readonly type: 'get_subscription';
  readonly parameters: {
    readonly id?: SubscriptionId;
    readonly email?: ValidatedEmail;
  };
}

/**
 * Get multiple subscriptions query
 */
export interface GetSubscriptionsQuery extends Query {
  readonly type: 'get_subscriptions';
  readonly parameters: {
    readonly filters?: Record<string, unknown>;
    readonly sort?: string;
    readonly limit?: number;
    readonly offset?: number;
  };
}

/**
 * Get subscription count query
 */
export interface GetSubscriptionCountQuery extends Query {
  readonly type: 'get_subscription_count';
  readonly parameters: {
    readonly filters?: Record<string, unknown>;
  };
}

/**
 * Get subscription statistics query
 */
export interface GetSubscriptionStatsQuery extends Query {
  readonly type: 'get_subscription_stats';
  readonly parameters: {
    readonly period?: string;
    readonly group_by?: string;
  };
}

// =====================================================
// EXPORT COLLECTION
// =====================================================

/**
 * All event types for convenient importing
 */
export type {
  // Core events
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
  
  // State management
  SubscriptionState,
  StateTransition,
  StateMachineConfig,
  StateMachine,
  StateTransitionResult,
  
  // Event emitter
  EventEmitter,
  EventListener,
  EventSubscription,
  EventOfType,
  
  // Callbacks
  SubscriptionCallbacks,
  ValidationCallbacks,
  ValidationStep,
  AsyncCallback,
  SyncCallback,
  
  // Streaming
  EventStream,
  EventStreamHandler,
  EventStreamSubscription,
  EventPattern,
  EventPredicate,
  
  // Event sourcing
  EventStore,
  EventSnapshot,
  ProjectionDefinition,
  ProjectionHandler,
  
  // CQRS
  Command,
  Query,
  CommandHandler,
  QueryHandler,
  CommandBus,
  QueryBus,
  
  // Subscription commands/queries
  SubscriptionCommand,
  CreateSubscriptionCommand,
  ConfirmSubscriptionCommand,
  UnsubscribeCommand,
  SubscriptionQuery,
  GetSubscriptionQuery,
  GetSubscriptionsQuery,
} as EmailSubscriptionEventTypes;