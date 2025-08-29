/**
 * Core Subscription Form Component
 * Reusable form component with flexible styling and configuration
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Mail, Check, AlertCircle } from 'lucide-react';
import { useSubscriptionSystem } from '@/hooks/use-subscription-system';
import { SubscriptionFormProps } from '@/types/email-subscription';

export function SubscriptionForm({
  variant = 'default',
  placeholder = 'Enter your email address',
  buttonText = 'Subscribe',
  showCount = true,
  onSuccess,
  onError,
  config,
  className,
  children,
}: SubscriptionFormProps) {
  const [email, setEmail] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    subscriberCount,
    isSubscribed,
    isSubmitting,
    isLoading,
    error,
    subscribe,
    reset,
    validateEmail,
  } = useSubscriptionSystem(config);
  
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!email.trim()) {
        inputRef.current?.focus();
        return;
      }
      
      try {
        await subscribe(email);
        setEmail(''); // Clear form on success
        onSuccess?.(/* subscription data would be passed here */);
      } catch (error) {
        onError?.(error instanceof Error ? error.message : 'Subscription failed');
      }
    },
    [email, subscribe, onSuccess, onError]
  );
  
  const handleReset = useCallback(() => {
    setEmail('');
    reset();
  }, [reset]);
  
  // Variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          container: 'flex flex-row gap-2',
          input: 'flex-1 h-9',
          button: 'h-9 px-3',
        };
      case 'minimal':
        return {
          container: 'space-y-2',
          input: 'border-0 border-b border-gray-300 rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary',
          button: 'w-full',
        };
      default:
        return {
          container: 'space-y-4',
          input: 'w-full',
          button: 'w-full',
        };
    }
  };
  
  const styles = getVariantStyles();
  
  // Success state
  if (isSubscribed) {
    return (
      <div className={cn('text-center space-y-3', className)}>
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full dark:bg-green-900/20">
          <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Successfully subscribed!
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Thank you for joining us.
          </p>
        </div>
        {variant !== 'minimal' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="text-xs"
          >
            Subscribe another email
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      {/* Header */}
      {variant !== 'compact' && variant !== 'minimal' && (
        <div className="text-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary/10 rounded-full mb-3">
            <Mail className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Stay Updated</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Get notified when we have exciting news to share.
          </p>
        </div>
      )}
      
      {/* Subscriber Count */}
      {showCount && config?.ui?.showCount !== false && (
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading...
              </span>
            ) : (
              <>
                Join <span className="font-semibold text-foreground">{subscriberCount.toLocaleString()}</span> subscribers
              </>
            )}
          </p>
        </div>
      )}
      
      {/* Form */}
      <form onSubmit={handleSubmit} className={styles.container}>
        <div className="relative">
          <Input
            ref={inputRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            disabled={isSubmitting}
            className={cn(styles.input)}
            aria-label="Email address"
            aria-describedby={error ? 'email-error' : undefined}
          />
          {error && (
            <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" />
              <span id="email-error">{error}</span>
            </div>
          )}
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting || !email.trim()}
          className={cn(styles.button)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : (
            buttonText
          )}
        </Button>
      </form>
      
      {/* Custom children */}
      {children}
      
      {/* Footer */}
      {variant !== 'minimal' && (
        <p className="text-xs text-muted-foreground text-center mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      )}
    </div>
  );
}