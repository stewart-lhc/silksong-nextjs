/**
 * Inline Subscription Component
 * For embedding directly in page content
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { SubscriptionForm } from '../core/SubscriptionForm';
import { BaseSubscriptionProps } from '@/types/email-subscription';

interface InlineSubscriptionProps extends BaseSubscriptionProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'compact' | 'minimal';
  showCard?: boolean;
  showCount?: boolean;
}

export function InlineSubscription({
  title,
  description,
  variant = 'default',
  showCard = true,
  showCount = true,
  className,
  config,
  onSuccess,
  onError,
  children,
}: InlineSubscriptionProps) {
  const content = (
    <div className="space-y-4">
      {/* Header */}
      {(title || description) && variant !== 'minimal' && (
        <div className="text-center">
          {title && (
            <h3 className="text-xl font-semibold tracking-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-muted-foreground mt-2">
              {description}
            </p>
          )}
        </div>
      )}
      
      {/* Subscription Form */}
      <SubscriptionForm
        variant={variant}
        showCount={showCount}
        config={config}
        onSuccess={onSuccess}
        onError={onError}
      />
      
      {/* Custom children content */}
      {children}
    </div>
  );
  
  if (!showCard) {
    return (
      <div className={cn('w-full max-w-md mx-auto', className)}>
        {content}
      </div>
    );
  }
  
  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardContent className="p-6">
        {content}
      </CardContent>
    </Card>
  );
}

// Pre-configured variants for common use cases
export function NewsletterSignup(props: Omit<InlineSubscriptionProps, 'title' | 'description'>) {
  return (
    <InlineSubscription
      title="Subscribe to Our Newsletter"
      description="Get the latest updates and news delivered to your inbox."
      {...props}
    />
  );
}

export function WaitlistSignup(props: Omit<InlineSubscriptionProps, 'title' | 'description'>) {
  return (
    <InlineSubscription
      title="Join the Waitlist"
      description="Be the first to know when we launch."
      variant="compact"
      {...props}
    />
  );
}

export function FooterSubscription(props: Omit<InlineSubscriptionProps, 'variant' | 'showCard'>) {
  return (
    <InlineSubscription
      variant="compact"
      showCard={false}
      showCount={false}
      {...props}
    />
  );
}

export function CompactInlineSubscription(props: InlineSubscriptionProps) {
  return (
    <InlineSubscription
      variant="compact"
      showCard={false}
      {...props}
    />
  );
}