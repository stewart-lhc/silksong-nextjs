/**
 * Newsletter Kit - Modal Component
 * Modal/Dialog wrapper for newsletter subscription
 * 
 * @version 1.0.0
 */

'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { SubscriptionModalProps } from '../types';
import { NewsletterForm } from './NewsletterForm';
import { cn } from '../utils/cn';

// ========================= MODAL COMPONENT =========================
export const NewsletterModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  title = 'Stay Updated',
  description = 'Subscribe to our newsletter for the latest updates',
  closeOnSuccess = true,
  overlay = true,
  
  // Form props
  className,
  style,
  id,
  'data-testid': testId,
  variant = 'default',
  size = 'md',
  theme,
  placeholder,
  submitText,
  loadingText,
  successText,
  showCount = true,
  showSuccess = true,
  showSource = false,
  autoFocus = true, // Default to true for modals
  disabled = false,
  customValidation,
  allowedDomains,
  blockedDomains,
  onSuccess,
  onError,
  onStatusChange,
  source = 'modal',
  tags = [],
  metadata = {},
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  
  // Handle success with optional auto-close
  const handleSuccess = useCallback((result: any) => {
    onSuccess?.(result);
    if (closeOnSuccess) {
      // Delay close to show success message briefly
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [onSuccess, closeOnSuccess, onClose]);
  
  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);
  
  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);
  
  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Save currently focused element
      previousActiveElementRef.current = document.activeElement as HTMLElement;
      
      // Add event listeners
      document.addEventListener('keydown', handleKeyDown);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        
        // Restore focus
        if (previousActiveElementRef.current) {
          previousActiveElementRef.current.focus();
        }
      };
    }
  }, [isOpen, handleKeyDown]);
  
  // Don't render if not open
  if (!isOpen) return null;
  
  // Portal target
  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  if (!portalTarget) return null;
  
  const modalContent = (
    <div 
      className={cn(
        'newsletter-modal',
        'fixed inset-0 z-50 flex items-center justify-center',
        className
      )}
      style={style}
      data-testid={testId}
    >
      {/* Backdrop */}
      {overlay && (
        <div 
          className="newsletter-modal__backdrop fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}
      
      {/* Modal content */}
      <div
        ref={modalRef}
        className={cn(
          'newsletter-modal__content',
          'relative w-full max-w-md mx-4 bg-white dark:bg-gray-900',
          'rounded-lg shadow-xl border border-gray-200 dark:border-gray-700',
          'max-h-[90vh] overflow-y-auto'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id ? `${id}-title` : undefined}
        aria-describedby={id ? `${id}-description` : undefined}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="newsletter-modal__header p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {title && (
                <h2 
                  id={id ? `${id}-title` : undefined}
                  className="newsletter-modal__title text-lg font-semibold text-gray-900 dark:text-gray-100"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p 
                  id={id ? `${id}-description` : undefined}
                  className="newsletter-modal__description mt-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  {description}
                </p>
              )}
            </div>
            
            {/* Close button */}
            <button
              type="button"
              className={cn(
                'newsletter-modal__close',
                'ml-4 -mt-1 p-1 rounded-md text-gray-400 hover:text-gray-600',
                'dark:text-gray-500 dark:hover:text-gray-300',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                'focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg 
                className="w-5 h-5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Form */}
        <div className="newsletter-modal__body px-6 pb-6">
          <NewsletterForm
            variant={variant}
            size={size}
            theme={theme}
            placeholder={placeholder}
            submitText={submitText}
            loadingText={loadingText}
            successText={successText}
            showCount={showCount}
            showSuccess={showSuccess}
            showSource={showSource}
            autoFocus={autoFocus}
            disabled={disabled}
            customValidation={customValidation}
            allowedDomains={allowedDomains}
            blockedDomains={blockedDomains}
            onSuccess={handleSuccess}
            onError={onError}
            onStatusChange={onStatusChange}
            source={source}
            tags={tags}
            metadata={metadata}
            className="newsletter-modal__form"
          />
        </div>
      </div>
    </div>
  );
  
  return createPortal(modalContent, portalTarget);
};

// ========================= MODAL HOOK =========================
export interface UseNewsletterModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useNewsletterModal = (initialOpen = false): UseNewsletterModalReturn => {
  const [isOpen, setIsOpen] = React.useState(initialOpen);
  
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  
  return { isOpen, open, close, toggle };
};

// ========================= MODAL TRIGGER =========================
export interface NewsletterModalTriggerProps {
  children: (props: { onClick: () => void; isOpen: boolean }) => React.ReactNode;
  modalProps?: Omit<SubscriptionModalProps, 'isOpen' | 'onClose'>;
}

export const NewsletterModalTrigger: React.FC<NewsletterModalTriggerProps> = ({
  children,
  modalProps = {},
}) => {
  const modal = useNewsletterModal();
  
  return (
    <>
      {children({ onClick: modal.open, isOpen: modal.isOpen })}
      <NewsletterModal 
        {...modalProps} 
        isOpen={modal.isOpen} 
        onClose={modal.close} 
      />
    </>
  );
};

// ========================= MODAL VARIANTS =========================

/**
 * Simple modal with minimal styling
 */
export const NewsletterModalSimple: React.FC<Omit<SubscriptionModalProps, 'variant'>> = (props) => (
  <NewsletterModal {...props} variant="minimal" />
);

/**
 * Modern modal with contemporary styling
 */
export const NewsletterModalModern: React.FC<Omit<SubscriptionModalProps, 'variant'>> = (props) => (
  <NewsletterModal {...props} variant="modern" />
);

/**
 * Promotional modal with marketing focus
 */
export const NewsletterModalPromo: React.FC<Omit<SubscriptionModalProps, 'title' | 'description'>> = (props) => (
  <NewsletterModal 
    {...props} 
    title="🚀 Don't Miss Out!"
    description="Join thousands of subscribers and be the first to know about our latest updates"
    variant="modern"
    showCount={true}
  />
);

// ========================= DEVELOPMENT HELPERS =========================
if (process.env.NODE_ENV === 'development') {
  NewsletterModal.displayName = 'NewsletterModal';
  NewsletterModalTrigger.displayName = 'NewsletterModalTrigger';
  NewsletterModalSimple.displayName = 'NewsletterModalSimple';
  NewsletterModalModern.displayName = 'NewsletterModalModern';
  NewsletterModalPromo.displayName = 'NewsletterModalPromo';
}

// ========================= EXPORTS =========================
export type { 
  SubscriptionModalProps, 
  NewsletterModalTriggerProps, 
  UseNewsletterModalReturn 
} from '../types';