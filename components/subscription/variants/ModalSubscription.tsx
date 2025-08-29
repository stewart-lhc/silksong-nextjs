/**
 * Modal Subscription Component
 * Popup subscription form with trigger button
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Mail, X } from 'lucide-react';
import { SubscriptionForm } from '../core/SubscriptionForm';
import { ModalSubscriptionProps } from '@/types/email-subscription';

export function ModalSubscription({
  trigger,
  title = "Stay in the loop",
  description = "Subscribe to get the latest updates and announcements.",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  className,
  config,
  onSuccess,
  onError,
  children,
}: ModalSubscriptionProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const onOpenChange = controlledOnOpenChange || setInternalOpen;
  
  const handleSuccess = (subscription: any) => {
    onSuccess?.(subscription);
    // Auto-close modal on success after a delay
    setTimeout(() => {
      onOpenChange(false);
    }, 2000);
  };
  
  const defaultTrigger = (
    <Button variant="default" size="sm">
      <Mail className="w-4 h-4 mr-2" />
      Subscribe
    </Button>
  );
  
  return (
    <>
      {/* Trigger */}
      <div onClick={() => onOpenChange(true)}>
        {trigger || defaultTrigger}
      </div>
      
      {/* Modal */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn('max-w-md', className)}>
          <DialogHeader className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary/10 rounded-full mb-4">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">{title}</DialogTitle>
            {description && (
              <DialogDescription className="text-base">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
          
          <div className="mt-4">
            <SubscriptionForm
              variant="default"
              showCount={true}
              config={config}
              onSuccess={handleSuccess}
              onError={onError}
            />
          </div>
          
          {/* Custom children content */}
          {children}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Pre-configured modal variants
export function NewsletterModal(props: Omit<ModalSubscriptionProps, 'title' | 'description'>) {
  return (
    <ModalSubscription
      title="Subscribe to Our Newsletter"
      description="Get weekly updates with the latest news, articles, and exclusive content."
      {...props}
    />
  );
}

export function LaunchNotificationModal(props: Omit<ModalSubscriptionProps, 'title' | 'description'>) {
  return (
    <ModalSubscription
      title="Get Launch Notifications"
      description="Be among the first to know when we go live!"
      {...props}
    />
  );
}

export function UpdatesModal(props: Omit<ModalSubscriptionProps, 'title' | 'description'>) {
  return (
    <ModalSubscription
      title="Stay Updated"
      description="Never miss an important update or announcement."
      {...props}
    />
  );
}

// Hook for programmatic modal control
export function useModalSubscription() {
  const [isOpen, setIsOpen] = useState(false);
  
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const toggleModal = () => setIsOpen(prev => !prev);
  
  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
    modalProps: {
      open: isOpen,
      onOpenChange: setIsOpen,
    },
  };
}