/**
 * Newsletter Kit - Toast Component
 * Toast/notification component for subscription feedback
 * 
 * @version 1.0.0
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { SubscriptionToastProps, SubscriptionStatus } from '../types';
import { cn } from '../utils/cn';

// ========================= TOAST COMPONENT =========================
export const NewsletterToast: React.FC<SubscriptionToastProps> = ({
  status,
  position = 'top-right',
  duration = 5000,
  dismissible = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  
  // Show toast when status changes to success or error
  useEffect(() => {
    if (status.type === 'success' || status.type === 'error') {
      setIsVisible(true);
      setIsAnimatingOut(false);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [status, duration]);
  
  const handleDismiss = useCallback(() => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimatingOut(false);
    }, 300); // Animation duration
  }, []);
  
  const handleToastClick = useCallback(() => {
    if (dismissible) {
      handleDismiss();
    }
  }, [dismissible, handleDismiss]);
  
  // Don't render if not visible or idle/loading states
  if (!isVisible || (status.type !== 'success' && status.type !== 'error')) {
    return null;
  }
  
  // Portal target
  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  if (!portalTarget) return null;
  
  const isError = status.type === 'error';
  const isSuccess = status.type === 'success';
  
  // Position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };
  
  // Animation classes
  const animationClasses = position.includes('top')
    ? isAnimatingOut
      ? 'animate-slide-out-up'
      : 'animate-slide-in-down'
    : isAnimatingOut
      ? 'animate-slide-out-down'
      : 'animate-slide-in-up';
  
  const toastContent = (
    <div 
      className={cn(
        'newsletter-toast',
        'fixed z-50 max-w-sm w-full',
        positionClasses[position],
        animationClasses
      )}
    >
      <div
        className={cn(
          'newsletter-toast__content',
          'mx-4 p-4 rounded-lg shadow-lg border',
          'backdrop-blur-sm transition-all duration-300',
          isError && 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          isSuccess && 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          dismissible && 'cursor-pointer hover:shadow-xl'
        )}
        onClick={handleToastClick}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex items-start">
          {/* Icon */}
          <div className="flex-shrink-0">
            {isSuccess && (
              <div className={cn(
                'newsletter-toast__icon-success',
                'w-5 h-5 text-green-600 dark:text-green-400'
              )}>
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.23a.75.75 0 00-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            
            {isError && (
              <div className={cn(
                'newsletter-toast__icon-error',
                'w-5 h-5 text-red-600 dark:text-red-400'
              )}>
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="ml-3 flex-1">
            {isSuccess && (
              <div className="newsletter-toast__success">
                <p className={cn(
                  'newsletter-toast__title',
                  'text-sm font-medium text-green-800 dark:text-green-200'
                )}>
                  Successfully subscribed!
                </p>
                <p className={cn(
                  'newsletter-toast__message',
                  'mt-1 text-sm text-green-700 dark:text-green-300'
                )}>
                  Welcome! You've joined {status.count.toLocaleString()} other subscribers.
                </p>
              </div>
            )}
            
            {isError && (
              <div className="newsletter-toast__error">
                <p className={cn(
                  'newsletter-toast__title',
                  'text-sm font-medium text-red-800 dark:text-red-200'
                )}>
                  Subscription failed
                </p>
                <p className={cn(
                  'newsletter-toast__message',
                  'mt-1 text-sm text-red-700 dark:text-red-300'
                )}>
                  {status.error.message}
                </p>
                {status.error.retryable && (
                  <p className={cn(
                    'newsletter-toast__retry-hint',
                    'mt-1 text-xs text-red-600 dark:text-red-400'
                  )}>
                    Please try again in a moment.
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Close button */}
          {dismissible && (
            <div className="ml-4 flex-shrink-0">
              <button
                type="button"
                className={cn(
                  'newsletter-toast__close',
                  'inline-flex rounded-md p-1.5',
                  'text-gray-400 hover:text-gray-600',
                  'dark:text-gray-500 dark:hover:text-gray-300',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500',
                  isError && 'text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300',
                  isSuccess && 'text-green-400 hover:text-green-600 dark:text-green-500 dark:hover:text-green-300'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss();
                }}
                aria-label="Dismiss notification"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  return createPortal(toastContent, portalTarget);
};

// ========================= TOAST HOOK =========================
export interface UseNewsletterToastReturn {
  showToast: (status: SubscriptionStatus) => void;
  hideToast: () => void;
  isVisible: boolean;
}

export const useNewsletterToast = (
  options: {
    position?: SubscriptionToastProps['position'];
    duration?: number;
    dismissible?: boolean;
  } = {}
): UseNewsletterToastReturn => {
  const [currentStatus, setCurrentStatus] = useState<SubscriptionStatus>({ type: 'idle' });
  const [isVisible, setIsVisible] = useState(false);
  
  const showToast = useCallback((status: SubscriptionStatus) => {
    setCurrentStatus(status);
    setIsVisible(true);
  }, []);
  
  const hideToast = useCallback(() => {
    setCurrentStatus({ type: 'idle' });
    setIsVisible(false);
  }, []);
  
  return {
    showToast,
    hideToast,
    isVisible,
  };
};

// ========================= TOAST CONTAINER =========================
export interface NewsletterToastContainerProps {
  position?: SubscriptionToastProps['position'];
  duration?: number;
  dismissible?: boolean;
  maxToasts?: number;
}

export const NewsletterToastContainer: React.FC<NewsletterToastContainerProps> = ({
  position = 'top-right',
  duration = 5000,
  dismissible = true,
  maxToasts = 3,
}) => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    status: SubscriptionStatus;
    timestamp: number;
  }>>([]);
  
  // Listen for toast events
  useEffect(() => {
    const handleToastEvent = (event: CustomEvent<{ status: SubscriptionStatus }>) => {
      const id = Date.now().toString();
      const newToast = {
        id,
        status: event.detail.status,
        timestamp: Date.now(),
      };
      
      setToasts(prev => {
        const updated = [...prev, newToast];
        // Limit number of toasts
        return updated.slice(-maxToasts);
      });
      
      // Auto remove after duration
      if (duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(toast => toast.id !== id));
        }, duration + 500); // Extra time for animation
      }
    };
    
    document.addEventListener('newsletter:toast' as any, handleToastEvent);
    return () => document.removeEventListener('newsletter:toast' as any, handleToastEvent);
  }, [duration, maxToasts]);
  
  if (toasts.length === 0) return null;
  
  return (
    <>
      {toasts.map((toast, index) => (
        <NewsletterToast
          key={toast.id}
          status={toast.status}
          position={position}
          duration={duration}
          dismissible={dismissible}
        />
      ))}
    </>
  );
};

// ========================= TOAST VARIANTS =========================

/**
 * Success toast with predefined styling
 */
export const NewsletterToastSuccess: React.FC<Omit<SubscriptionToastProps, 'status'> & {
  count?: number;
  message?: string;
}> = ({ count = 0, message = 'Successfully subscribed!', ...props }) => (
  <NewsletterToast
    {...props}
    status={{
      type: 'success',
      subscription: {} as any,
      count: count as any,
    }}
  />
);

/**
 * Error toast with predefined styling
 */
export const NewsletterToastError: React.FC<Omit<SubscriptionToastProps, 'status'> & {
  message?: string;
  retryable?: boolean;
}> = ({ message = 'Something went wrong', retryable = false, ...props }) => (
  <NewsletterToast
    {...props}
    status={{
      type: 'error',
      error: {
        code: 'toast_error' as any,
        message,
        retryable,
      },
    }}
  />
);

// ========================= GLOBAL TOAST HELPER =========================
export const showNewsletterToast = (status: SubscriptionStatus) => {
  if (typeof document !== 'undefined') {
    document.dispatchEvent(
      new CustomEvent('newsletter:toast', {
        detail: { status },
      })
    );
  }
};

// ========================= DEVELOPMENT HELPERS =========================
if (process.env.NODE_ENV === 'development') {
  NewsletterToast.displayName = 'NewsletterToast';
  NewsletterToastContainer.displayName = 'NewsletterToastContainer';
  NewsletterToastSuccess.displayName = 'NewsletterToastSuccess';
  NewsletterToastError.displayName = 'NewsletterToastError';
}

// ========================= EXPORTS =========================
export type { 
  SubscriptionToastProps,
  UseNewsletterToastReturn,
  NewsletterToastContainerProps,
} from '../types';