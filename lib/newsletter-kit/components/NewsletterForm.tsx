/**
 * Newsletter Kit - Form Component
 * Main subscription form with multiple variants and full customization
 * 
 * @version 1.0.0
 */

'use client';

import React, { useState, useCallback, useRef, useId, useEffect } from 'react';
import type { SubscriptionFormProps } from '../types';
import { useNewsletter, useNewsletterStats } from '../hooks/use-newsletter';
import { useNewsletterContext } from './NewsletterProvider';
import { cn } from '../utils/cn';

// ========================= FORM COMPONENT =========================
export const NewsletterForm: React.FC<SubscriptionFormProps> = ({
  className,
  style,
  id: providedId,
  'data-testid': testId,
  
  // Appearance
  variant = 'default',
  size = 'md',
  theme,
  
  // Content
  placeholder,
  submitText,
  loadingText,
  successText,
  
  // Features
  showCount = true,
  showSuccess = true,
  showSource = false,
  autoFocus = false,
  disabled = false,
  
  // Validation
  customValidation,
  allowedDomains,
  blockedDomains,
  
  // Events
  onSuccess,
  onError,
  onStatusChange,
  
  // Advanced
  source = 'form',
  tags = [],
  metadata = {},
}) => {
  const { config } = useNewsletterContext();
  const formId = useId();
  const finalId = providedId || formId;
  
  // Local state
  const [email, setEmail] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Newsletter hooks
  const newsletter = useNewsletter({
    config,
    onSuccess: (result) => {
      onSuccess?.(result);
      if (showSuccess) {
        setShowSuccessMessage(true);
        setEmail('');
        // Auto-hide success message after 5 seconds
        setTimeout(() => setShowSuccessMessage(false), 5000);
      }
    },
    onError: (error) => {
      onError?.(error);
      // Keep email in form on error for retry
    },
    onStatusChange,
  });
  
  // Stats (optional)
  const stats = useNewsletterStats(config, { 
    enabled: showCount,
    refetchInterval: 300000, // 5 minutes
  });
  
  // Configuration with overrides
  const effectiveConfig = React.useMemo(() => ({
    ...config,
    validation: {
      ...config.validation,
      ...(allowedDomains && { allowedDomains }),
      ...(blockedDomains && { blockedDomains }),
    },
    messages: {
      ...config.messages,
      ...(placeholder && { placeholder }),
      ...(submitText && { submitText }),
      ...(loadingText && { loadingText }),
      ...(successText && { successText }),
    },
  }), [config, allowedDomains, blockedDomains, placeholder, submitText, loadingText, successText]);
  
  // Auto-focus effect
  useEffect(() => {
    if (autoFocus && inputRef.current && !newsletter.isLoading) {
      inputRef.current.focus();
    }
  }, [autoFocus, newsletter.isLoading]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newsletter.isLoading || disabled) return;
    
    // Custom validation if provided
    if (customValidation) {
      const validation = customValidation(email);
      if (!validation.isValid) {
        // Show validation error
        return;
      }
    }
    
    await newsletter.subscribe(email, { source, tags, metadata });
  }, [email, newsletter, disabled, customValidation, source, tags, metadata]);
  
  // Handle input change
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (showSuccessMessage) {
      setShowSuccessMessage(false);
    }
    if (newsletter.isError) {
      newsletter.reset();
    }
  }, [showSuccessMessage, newsletter]);
  
  // Handle enter key
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  }, [handleSubmit]);
  
  // Determine current state
  const isSuccess = newsletter.isSuccess || showSuccessMessage;
  const isError = newsletter.isError;
  const isLoading = newsletter.isLoading;
  
  // Get messages
  const messages = effectiveConfig.messages;
  const currentPlaceholder = placeholder || messages.placeholder;
  const currentSubmitText = submitText || messages.submitText;
  const currentLoadingText = loadingText || messages.loadingText;
  const currentSuccessText = successText || messages.successText;
  
  // Style classes based on variant and size
  const containerClasses = cn(
    'newsletter-form',
    `newsletter-form--${variant}`,
    `newsletter-form--${size}`,
    theme && `newsletter-form--${theme}`,
    isSuccess && 'newsletter-form--success',
    isError && 'newsletter-form--error',
    isLoading && 'newsletter-form--loading',
    disabled && 'newsletter-form--disabled',
    className
  );
  
  const inputClasses = cn(
    'newsletter-form__input',
    size === 'sm' && 'newsletter-form__input--sm',
    size === 'lg' && 'newsletter-form__input--lg',
    isError && 'newsletter-form__input--error',
    isSuccess && 'newsletter-form__input--success'
  );
  
  const buttonClasses = cn(
    'newsletter-form__button',
    size === 'sm' && 'newsletter-form__button--sm',
    size === 'lg' && 'newsletter-form__button--lg',
    variant === 'minimal' && 'newsletter-form__button--minimal',
    variant === 'modern' && 'newsletter-form__button--modern',
    isLoading && 'newsletter-form__button--loading',
    disabled && 'newsletter-form__button--disabled'
  );
  
  return (
    <div 
      className={containerClasses}
      style={style}
      data-testid={testId}
      data-variant={variant}
      data-size={size}
      data-state={isLoading ? 'loading' : isSuccess ? 'success' : isError ? 'error' : 'idle'}
    >
      {/* Optional subscriber count */}
      {showCount && stats.data && (
        <div className="newsletter-form__count">
          <span className="newsletter-form__count-number">
            {stats.data.total.toLocaleString()}
          </span>
          <span className="newsletter-form__count-text">
            {stats.data.total === 1 ? 'subscriber' : 'subscribers'}
          </span>
        </div>
      )}
      
      {/* Main form */}
      <form 
        className="newsletter-form__form"
        onSubmit={handleSubmit}
        noValidate
        role="form"
        aria-labelledby={`${finalId}-label`}
      >
        <div className="newsletter-form__fields">
          {/* Email input */}
          <div className="newsletter-form__input-wrapper">
            <label 
              id={`${finalId}-label`}
              htmlFor={`${finalId}-email`}
              className="newsletter-form__label"
            >
              <span className="sr-only">Email address</span>
            </label>
            <input
              ref={inputRef}
              id={`${finalId}-email`}
              type="email"
              value={email}
              onChange={handleEmailChange}
              onKeyDown={handleKeyDown}
              placeholder={currentPlaceholder}
              className={inputClasses}
              disabled={disabled || isLoading}
              required
              aria-invalid={isError}
              aria-describedby={isError ? `${finalId}-error` : undefined}
              autoComplete="email"
              spellCheck={false}
            />
          </div>
          
          {/* Submit button */}
          <button
            type="submit"
            className={buttonClasses}
            disabled={disabled || isLoading || !email.trim()}
            aria-describedby={isLoading ? `${finalId}-loading` : undefined}
          >
            {isLoading ? (
              <>
                <span className="newsletter-form__spinner" aria-hidden="true" />
                <span>{currentLoadingText}</span>
                <span id={`${finalId}-loading`} className="sr-only">
                  Subscription in progress
                </span>
              </>
            ) : (
              currentSubmitText
            )}
          </button>
        </div>
        
        {/* Optional source display */}
        {showSource && source && (
          <div className="newsletter-form__source">
            <small>Source: {source}</small>
          </div>
        )}
      </form>
      
      {/* Success message */}
      {isSuccess && showSuccess && (
        <div 
          className="newsletter-form__success"
          role="status"
          aria-live="polite"
        >
          <span className="newsletter-form__success-icon" aria-hidden="true">
            ✓
          </span>
          <span className="newsletter-form__success-text">
            {currentSuccessText}
          </span>
        </div>
      )}
      
      {/* Error message */}
      {isError && newsletter.error && (
        <div 
          id={`${finalId}-error`}
          className="newsletter-form__error"
          role="alert"
          aria-live="assertive"
        >
          <span className="newsletter-form__error-icon" aria-hidden="true">
            ⚠
          </span>
          <span className="newsletter-form__error-text">
            {newsletter.error.message}
          </span>
          {newsletter.error.retryable && (
            <button
              type="button"
              className="newsletter-form__retry"
              onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            >
              Try again
            </button>
          )}
        </div>
      )}
      
      {/* Loading stats fallback */}
      {showCount && stats.isLoading && (
        <div className="newsletter-form__loading-stats">
          <div className="newsletter-form__skeleton" />
        </div>
      )}
    </div>
  );
};

// ========================= FORM VARIANTS =========================

/**
 * Inline form variant - horizontal layout
 */
export const NewsletterFormInline: React.FC<SubscriptionFormProps> = (props) => (
  <NewsletterForm {...props} variant="default" />
);

/**
 * Minimal form variant - clean design
 */
export const NewsletterFormMinimal: React.FC<SubscriptionFormProps> = (props) => (
  <NewsletterForm {...props} variant="minimal" showCount={false} />
);

/**
 * Modern form variant - contemporary styling
 */
export const NewsletterFormModern: React.FC<SubscriptionFormProps> = (props) => (
  <NewsletterForm {...props} variant="modern" />
);

/**
 * Simple form - basic functionality only
 */
export const NewsletterFormSimple: React.FC<Pick<SubscriptionFormProps, 
  'onSuccess' | 'onError' | 'placeholder' | 'submitText' | 'className'
>> = (props) => (
  <NewsletterForm 
    {...props} 
    variant="minimal" 
    showCount={false} 
    showSuccess={true}
    size="md"
  />
);

// ========================= DEVELOPMENT HELPERS =========================
if (process.env.NODE_ENV === 'development') {
  NewsletterForm.displayName = 'NewsletterForm';
  NewsletterFormInline.displayName = 'NewsletterFormInline';
  NewsletterFormMinimal.displayName = 'NewsletterFormMinimal';
  NewsletterFormModern.displayName = 'NewsletterFormModern';
  NewsletterFormSimple.displayName = 'NewsletterFormSimple';
}

// ========================= EXPORTS =========================
export type { SubscriptionFormProps } from '../types';