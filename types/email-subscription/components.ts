/**
 * React Component Props Types for Email Subscription System
 * 
 * This file provides comprehensive type definitions for React components.
 * Supports generic props, style variants, and flexible customization while
 * maintaining strict type safety and excellent developer experience.
 * 
 * Features:
 * - Generic component props with type constraints
 * - Template literal types for style variants
 * - Compound component patterns
 * - Polymorphic component support
 * - Theme and styling system integration
 * - Accessibility and ARIA support
 * 
 * @author Claude Code Assistant
 * @version 1.0.0
 */

import type { ComponentProps, ElementType, ReactNode, RefObject } from 'react';
import type {
  ValidatedEmail,
  SubscriptionId,
  SubscriptionResult,
  EmailValidationResult,
  SubscriptionError,
  ExtendedSubscription,
} from './core';
import type { ApiResponse } from './api';

// =====================================================
// BASE COMPONENT PROPS
// =====================================================

/**
 * Base props for all email subscription components
 * Provides common styling and behavior options
 */
export interface BaseComponentProps {
  readonly className?: string;
  readonly id?: string;
  readonly testId?: string;
  readonly children?: ReactNode;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly error?: boolean;
  readonly 'data-testid'?: string;
  readonly 'aria-label'?: string;
  readonly 'aria-describedby'?: string;
}

/**
 * Polymorphic component props
 * Allows components to render as different HTML elements
 */
export type PolymorphicProps<T extends ElementType> = {
  readonly as?: T;
} & ComponentProps<T>;

/**
 * Forwarded ref props
 * For components that need to forward refs
 */
export type ForwardRefProps<T = HTMLElement> = {
  readonly ref?: RefObject<T>;
};

// =====================================================
// STYLE VARIANT TYPES
// =====================================================

/**
 * Component size variants using template literal types
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Component variant styles
 */
export type ComponentVariant = 
  | 'default'
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive';

/**
 * Color scheme variants
 */
export type ColorScheme = 
  | 'blue'
  | 'green' 
  | 'red'
  | 'yellow'
  | 'purple'
  | 'gray'
  | 'dark'
  | 'light';

/**
 * Border radius variants
 */
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';

/**
 * Shadow variants
 */
export type ShadowVariant = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'inner';

/**
 * Animation variants
 */
export type AnimationVariant = 
  | 'none'
  | 'fade'
  | 'slide'
  | 'bounce'
  | 'pulse'
  | 'spin';

// =====================================================
// SUBSCRIPTION FORM COMPONENT PROPS
// =====================================================

/**
 * Main subscription form component props
 * Supports extensive customization and validation
 */
export interface SubscriptionFormProps extends BaseComponentProps {
  // Behavior props
  readonly onSubmit?: (email: ValidatedEmail) => Promise<void> | void;
  readonly onSuccess?: (result: SubscriptionResult) => void;
  readonly onError?: (error: SubscriptionError) => void;
  readonly onValidation?: (result: EmailValidationResult) => void;
  readonly onClear?: () => void;
  
  // Validation props
  readonly validateOnBlur?: boolean;
  readonly validateOnChange?: boolean;
  readonly debounceValidation?: number;
  readonly customValidator?: (email: string) => Promise<EmailValidationResult> | EmailValidationResult;
  
  // UI customization
  readonly variant?: ComponentVariant;
  readonly size?: ComponentSize;
  readonly colorScheme?: ColorScheme;
  readonly fullWidth?: boolean;
  readonly compact?: boolean;
  readonly inline?: boolean;
  
  // Form configuration
  readonly placeholder?: string;
  readonly buttonText?: string;
  readonly loadingText?: string;
  readonly successText?: string;
  readonly errorText?: string;
  readonly autoComplete?: boolean;
  readonly autoFocus?: boolean;
  readonly required?: boolean;
  readonly maxLength?: number;
  
  // Advanced features
  readonly showValidationIcon?: boolean;
  readonly showCounter?: boolean;
  readonly showProgressIndicator?: boolean;
  readonly enableRealTimeValidation?: boolean;
  readonly supportMarketing?: boolean;
  readonly gdprCompliant?: boolean;
  
  // Styling
  readonly inputClassName?: string;
  readonly buttonClassName?: string;
  readonly errorClassName?: string;
  readonly successClassName?: string;
  
  // Layout
  readonly layout?: FormLayout;
  readonly alignment?: ContentAlignment;
  readonly spacing?: ComponentSpacing;
  
  // Animation
  readonly animateOnSubmit?: boolean;
  readonly animateOnSuccess?: boolean;
  readonly animateOnError?: boolean;
  readonly animation?: AnimationVariant;
  
  // Accessibility
  readonly ariaLabel?: string;
  readonly ariaDescription?: string;
  readonly announceValidation?: boolean;
}

/**
 * Form layout options
 */
export type FormLayout = 
  | 'horizontal'
  | 'vertical'
  | 'inline'
  | 'floating';

/**
 * Content alignment options
 */
export type ContentAlignment = 
  | 'left'
  | 'center'
  | 'right'
  | 'justify';

/**
 * Component spacing options
 */
export type ComponentSpacing = 
  | 'none'
  | 'tight'
  | 'normal'
  | 'relaxed'
  | 'loose';

// =====================================================
// INPUT COMPONENT PROPS
// =====================================================

/**
 * Email input component props
 * Focused on email input with validation features
 */
export interface EmailInputProps extends BaseComponentProps {
  // Core input props
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onChange?: (value: string, isValid: boolean) => void;
  readonly onBlur?: (value: string, validationResult: EmailValidationResult) => void;
  readonly onFocus?: () => void;
  readonly onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  
  // Validation
  readonly validation?: EmailValidationConfig;
  readonly showValidation?: boolean;
  readonly validationDelay?: number;
  
  // Styling
  readonly variant?: InputVariant;
  readonly size?: ComponentSize;
  readonly fullWidth?: boolean;
  readonly rounded?: BorderRadius;
  readonly shadow?: ShadowVariant;
  
  // Features
  readonly placeholder?: string;
  readonly maxLength?: number;
  readonly autoComplete?: 'email' | 'off';
  readonly autoFocus?: boolean;
  readonly readOnly?: boolean;
  readonly spellCheck?: boolean;
  
  // Icons and decorations
  readonly startIcon?: ReactNode;
  readonly endIcon?: ReactNode;
  readonly clearable?: boolean;
  readonly showValidationIcon?: boolean;
  
  // States
  readonly loading?: boolean;
  readonly success?: boolean;
  readonly warning?: boolean;
  
  // Accessibility
  readonly 'aria-invalid'?: boolean;
  readonly 'aria-errormessage'?: string;
  readonly role?: string;
}

/**
 * Input variant styles
 */
export type InputVariant = 
  | 'default'
  | 'outline'
  | 'filled'
  | 'underlined'
  | 'borderless';

/**
 * Email validation configuration
 */
export interface EmailValidationConfig {
  readonly enabled?: boolean;
  readonly realTime?: boolean;
  readonly strict?: boolean;
  readonly allowDisposable?: boolean;
  readonly checkDomain?: boolean;
  readonly suggestCorrections?: boolean;
}

// =====================================================
// BUTTON COMPONENT PROPS
// =====================================================

/**
 * Subscribe button component props
 * Handles submission with various states and styles
 */
export interface SubscribeButtonProps extends BaseComponentProps {
  // Core button props
  readonly type?: 'button' | 'submit' | 'reset';
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  readonly onSubmit?: () => Promise<void> | void;
  
  // Content
  readonly children?: ReactNode;
  readonly text?: string;
  readonly loadingText?: string;
  readonly successText?: string;
  readonly icon?: ReactNode;
  readonly loadingIcon?: ReactNode;
  readonly successIcon?: ReactNode;
  
  // States
  readonly submitting?: boolean;
  readonly success?: boolean;
  readonly failed?: boolean;
  
  // Styling
  readonly variant?: ButtonVariant;
  readonly size?: ComponentSize;
  readonly colorScheme?: ColorScheme;
  readonly fullWidth?: boolean;
  readonly rounded?: BorderRadius;
  readonly shadow?: ShadowVariant;
  
  // Animation
  readonly animate?: boolean;
  readonly animation?: ButtonAnimation;
  readonly successAnimation?: boolean;
  readonly loadingAnimation?: boolean;
  
  // Advanced features
  readonly countdown?: number;
  readonly rateLimited?: boolean;
  readonly showProgress?: boolean;
  readonly hapticFeedback?: boolean;
}

/**
 * Button variant styles
 */
export type ButtonVariant = 
  | 'solid'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'unstyled';

/**
 * Button animation types
 */
export type ButtonAnimation = 
  | 'pulse'
  | 'bounce'
  | 'shake'
  | 'glow'
  | 'ripple';

// =====================================================
// FEEDBACK COMPONENT PROPS
// =====================================================

/**
 * Subscription status component props
 * Displays current subscription state and feedback
 */
export interface SubscriptionStatusProps extends BaseComponentProps {
  // Status data
  readonly status?: SubscriptionStatus;
  readonly count?: number;
  readonly loading?: boolean;
  readonly error?: SubscriptionError;
  readonly success?: boolean;
  
  // Content customization
  readonly messages?: StatusMessages;
  readonly showCount?: boolean;
  readonly showTimestamp?: boolean;
  readonly showDetails?: boolean;
  
  // Styling
  readonly variant?: StatusVariant;
  readonly size?: ComponentSize;
  readonly colorScheme?: ColorScheme;
  readonly compact?: boolean;
  
  // Behavior
  readonly dismissible?: boolean;
  readonly autoHide?: number;
  readonly onDismiss?: () => void;
  
  // Animation
  readonly animate?: boolean;
  readonly enterAnimation?: AnimationVariant;
  readonly exitAnimation?: AnimationVariant;
}

/**
 * Subscription status types
 */
export type SubscriptionStatus = 
  | 'idle'
  | 'validating'
  | 'submitting'
  | 'success'
  | 'error'
  | 'rate_limited'
  | 'already_subscribed';

/**
 * Status variant styles
 */
export type StatusVariant = 
  | 'toast'
  | 'banner'
  | 'inline'
  | 'modal'
  | 'minimal';

/**
 * Customizable status messages
 */
export interface StatusMessages {
  readonly idle?: string;
  readonly validating?: string;
  readonly submitting?: string;
  readonly success?: string;
  readonly error?: string;
  readonly rateLimited?: string;
  readonly alreadySubscribed?: string;
  readonly [key: string]: string | undefined;
}

// =====================================================
// VALIDATION FEEDBACK PROPS
// =====================================================

/**
 * Email validation feedback component props
 */
export interface ValidationFeedbackProps extends BaseComponentProps {
  // Validation data
  readonly result?: EmailValidationResult;
  readonly realTime?: boolean;
  readonly showSuggestions?: boolean;
  readonly showScore?: boolean;
  
  // Display options
  readonly variant?: FeedbackVariant;
  readonly position?: FeedbackPosition;
  readonly size?: ComponentSize;
  readonly animate?: boolean;
  
  // Content customization
  readonly messages?: ValidationMessages;
  readonly icons?: ValidationIcons;
  
  // Behavior
  readonly onClick?: (suggestion: string) => void;
  readonly onClose?: () => void;
  readonly autoHide?: number;
}

/**
 * Validation feedback variants
 */
export type FeedbackVariant = 
  | 'tooltip'
  | 'inline'
  | 'floating'
  | 'modal';

/**
 * Validation feedback position
 */
export type FeedbackPosition = 
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'auto';

/**
 * Validation message customization
 */
export interface ValidationMessages {
  readonly invalid?: string;
  readonly valid?: string;
  readonly checking?: string;
  readonly suggestion?: string;
  readonly [key: string]: string | undefined;
}

/**
 * Validation icon customization
 */
export interface ValidationIcons {
  readonly valid?: ReactNode;
  readonly invalid?: ReactNode;
  readonly checking?: ReactNode;
  readonly suggestion?: ReactNode;
}

// =====================================================
// COMPOUND COMPONENT PROPS
// =====================================================

/**
 * Subscription widget component props
 * Main compound component containing form, status, and feedback
 */
export interface SubscriptionWidgetProps extends BaseComponentProps {
  // Core functionality
  readonly onSubscribe?: (email: ValidatedEmail) => Promise<SubscriptionResult>;
  readonly onSuccess?: (result: SubscriptionResult) => void;
  readonly onError?: (error: SubscriptionError) => void;
  
  // Component configuration
  readonly formProps?: Partial<SubscriptionFormProps>;
  readonly inputProps?: Partial<EmailInputProps>;
  readonly buttonProps?: Partial<SubscribeButtonProps>;
  readonly statusProps?: Partial<SubscriptionStatusProps>;
  readonly feedbackProps?: Partial<ValidationFeedbackProps>;
  
  // Layout and styling
  readonly layout?: WidgetLayout;
  readonly theme?: WidgetTheme;
  readonly responsive?: boolean;
  readonly mobile?: MobileConfiguration;
  
  // Features
  readonly features?: WidgetFeatures;
  readonly tracking?: TrackingConfiguration;
  readonly compliance?: ComplianceConfiguration;
  
  // Advanced
  readonly customRenderer?: CustomRenderer;
  readonly plugins?: WidgetPlugin[];
}

/**
 * Widget layout configurations
 */
export type WidgetLayout = 
  | 'default'
  | 'minimal'
  | 'card'
  | 'modal'
  | 'sidebar'
  | 'footer'
  | 'popup';

/**
 * Widget theme configuration
 */
export interface WidgetTheme {
  readonly colorScheme?: ColorScheme;
  readonly variant?: ComponentVariant;
  readonly size?: ComponentSize;
  readonly radius?: BorderRadius;
  readonly shadow?: ShadowVariant;
  readonly animation?: AnimationVariant;
  readonly customColors?: ThemeColors;
  readonly customFonts?: ThemeFonts;
}

/**
 * Custom theme colors
 */
export interface ThemeColors {
  readonly primary?: string;
  readonly secondary?: string;
  readonly success?: string;
  readonly error?: string;
  readonly warning?: string;
  readonly background?: string;
  readonly foreground?: string;
  readonly border?: string;
}

/**
 * Custom theme fonts
 */
export interface ThemeFonts {
  readonly family?: string;
  readonly size?: string;
  readonly weight?: string;
  readonly lineHeight?: string;
}

/**
 * Mobile-specific configuration
 */
export interface MobileConfiguration {
  readonly responsive?: boolean;
  readonly breakpoint?: string;
  readonly layout?: WidgetLayout;
  readonly gestures?: boolean;
  readonly keyboard?: KeyboardConfiguration;
}

/**
 * Keyboard configuration
 */
export interface KeyboardConfiguration {
  readonly submitOnEnter?: boolean;
  readonly escapeToClose?: boolean;
  readonly tabNavigation?: boolean;
  readonly shortcuts?: Record<string, () => void>;
}

/**
 * Widget features configuration
 */
export interface WidgetFeatures {
  readonly realTimeValidation?: boolean;
  readonly autoComplete?: boolean;
  readonly socialLogin?: boolean;
  readonly doubleOptIn?: boolean;
  readonly unsubscribeLink?: boolean;
  readonly analytics?: boolean;
  readonly a11y?: boolean;
}

/**
 * Tracking configuration
 */
export interface TrackingConfiguration {
  readonly enabled?: boolean;
  readonly events?: TrackingEvent[];
  readonly provider?: 'google' | 'mixpanel' | 'segment' | 'custom';
  readonly customHandler?: (event: string, data: Record<string, unknown>) => void;
}

/**
 * Tracking events
 */
export type TrackingEvent = 
  | 'form_view'
  | 'input_focus'
  | 'validation_start'
  | 'validation_complete'
  | 'submit_attempt'
  | 'submit_success'
  | 'submit_error'
  | 'unsubscribe';

/**
 * Compliance configuration
 */
export interface ComplianceConfiguration {
  readonly gdpr?: boolean;
  readonly ccpa?: boolean;
  readonly consent?: ConsentConfiguration;
  readonly privacyPolicy?: string;
  readonly termsOfService?: string;
}

/**
 * Consent configuration
 */
export interface ConsentConfiguration {
  readonly required?: boolean;
  readonly checkbox?: boolean;
  readonly text?: string;
  readonly links?: Record<string, string>;
}

/**
 * Custom renderer function
 */
export type CustomRenderer = (props: SubscriptionWidgetProps) => ReactNode;

/**
 * Widget plugin interface
 */
export interface WidgetPlugin {
  readonly name: string;
  readonly version: string;
  readonly init?: (widget: SubscriptionWidgetProps) => void;
  readonly beforeSubmit?: (email: string) => Promise<boolean> | boolean;
  readonly afterSubmit?: (result: SubscriptionResult) => void;
  readonly onError?: (error: SubscriptionError) => void;
  readonly cleanup?: () => void;
}

// =====================================================
// HOOK-RELATED PROPS
// =====================================================

/**
 * Subscription hook configuration
 */
export interface UseSubscriptionConfig {
  readonly apiEndpoint?: string;
  readonly validateOnMount?: boolean;
  readonly retryOnError?: boolean;
  readonly debounceDelay?: number;
  readonly cacheEnabled?: boolean;
  readonly realTimeUpdates?: boolean;
}

/**
 * Subscription hook return type
 */
export interface UseSubscriptionReturn {
  // State
  readonly email: string;
  readonly isValid: boolean;
  readonly isSubmitting: boolean;
  readonly isSuccess: boolean;
  readonly error: SubscriptionError | null;
  readonly count: number;
  
  // Actions
  readonly setEmail: (email: string) => void;
  readonly submit: () => Promise<void>;
  readonly reset: () => void;
  readonly validate: () => Promise<EmailValidationResult>;
  
  // Utilities
  readonly formatEmail: (email: string) => string;
  readonly isEmailTaken: (email: string) => Promise<boolean>;
}

// =====================================================
// EXPORT COLLECTION
// =====================================================

/**
 * All component types for convenient importing
 */
export type {
  // Base types
  BaseComponentProps,
  PolymorphicProps,
  ForwardRefProps,
  
  // Style variants
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
  
  // Feedback components
  SubscriptionStatusProps,
  ValidationFeedbackProps,
  SubscriptionStatus,
  StatusVariant,
  StatusMessages,
  FeedbackVariant,
  ValidationMessages,
  
  // Compound components
  SubscriptionWidgetProps,
  WidgetLayout,
  WidgetTheme,
  ThemeColors,
  ThemeFonts,
  MobileConfiguration,
  WidgetFeatures,
  TrackingConfiguration,
  ComplianceConfiguration,
  
  // Hook types
  UseSubscriptionConfig,
  UseSubscriptionReturn,
  
  // Utilities
  CustomRenderer,
  WidgetPlugin,
} as EmailSubscriptionComponentTypes;