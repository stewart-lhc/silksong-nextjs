'use client';

/**
 * Email Subscription Confirmation Page
 * 
 * Handles the GET /subscribe/confirm?token=... endpoint for double opt-in confirmation
 * 
 * SECURITY FEATURES:
 * - Token validation and expiration checks
 * - Protection against token replay attacks
 * - User-friendly error handling without sensitive information exposure
 * - Automatic cleanup of confirmed tokens
 * - Idempotent confirmation process
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, AlertTriangle, Home } from 'lucide-react';

type ConfirmationState = 
  | 'loading' 
  | 'success' 
  | 'already_confirmed'
  | 'token_not_found' 
  | 'token_expired' 
  | 'token_invalid'
  | 'error';

interface ConfirmationResult {
  success: boolean;
  message: string;
  code?: string;
}

export default function SubscriptionConfirmPage() {
  const [state, setState] = useState<ConfirmationState>('loading');
  const [message, setMessage] = useState<string>('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    const confirmSubscription = async () => {
      // Validate token parameter
      if (!token) {
        setState('token_invalid');
        setMessage('Missing confirmation token');
        return;
      }

      // Basic token format validation (client-side)
      if (!/^[a-f0-9]{32}$/.test(token)) {
        setState('token_invalid');
        setMessage('Invalid confirmation token format');
        return;
      }

      try {
        // Call the confirmation API
        const response = await fetch(`/api/subscribe/confirm?token=${token}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          
          // Handle specific error codes
          switch (response.status) {
            case 404:
              setState('token_not_found');
              setMessage('Confirmation token not found or already used');
              break;
            case 410:
              setState('token_expired');
              setMessage('Confirmation token has expired. Please subscribe again.');
              break;
            case 400:
              setState('token_invalid');
              setMessage(errorData.error || 'Invalid confirmation token');
              break;
            default:
              setState('error');
              setMessage('Failed to confirm subscription. Please try again later.');
              break;
          }
          return;
        }

        const result: ConfirmationResult = await response.json();
        
        if (result.success) {
          if (result.code === 'ALREADY_CONFIRMED') {
            setState('already_confirmed');
            setMessage('Email subscription already confirmed');
          } else {
            setState('success');
            setMessage('Email subscription confirmed successfully!');
          }
        } else {
          setState('error');
          setMessage(result.message || 'Failed to confirm subscription');
        }
      } catch (error) {
        setState('error');
        setMessage('Network error. Please check your connection and try again.');
      }
    };

    confirmSubscription();
  }, [token]);

  const getIcon = () => {
    switch (state) {
      case 'loading':
        return <Clock className="h-8 w-8 text-blue-500 animate-spin" />;
      case 'success':
      case 'already_confirmed':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'token_expired':
        return <AlertTriangle className="h-8 w-8 text-orange-500" />;
      case 'token_not_found':
      case 'token_invalid':
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Clock className="h-8 w-8 text-gray-500" />;
    }
  };

  const getTitle = () => {
    switch (state) {
      case 'loading':
        return 'Confirming Subscription...';
      case 'success':
        return 'Subscription Confirmed!';
      case 'already_confirmed':
        return 'Already Subscribed';
      case 'token_expired':
        return 'Confirmation Expired';
      case 'token_not_found':
        return 'Token Not Found';
      case 'token_invalid':
        return 'Invalid Token';
      case 'error':
        return 'Confirmation Failed';
      default:
        return 'Email Confirmation';
    }
  };

  const getDescription = () => {
    switch (state) {
      case 'loading':
        return 'Please wait while we confirm your email subscription...';
      case 'success':
        return 'Thank you! You will now receive updates about Hollow Knight: Silksong.';
      case 'already_confirmed':
        return 'Your email is already subscribed to Silksong updates.';
      case 'token_expired':
        return 'Your confirmation link has expired after 48 hours for security reasons.';
      case 'token_not_found':
        return 'The confirmation token was not found or has already been used.';
      case 'token_invalid':
        return 'The confirmation link appears to be invalid or corrupted.';
      case 'error':
        return 'We encountered an issue confirming your subscription.';
      default:
        return '';
    }
  };

  const getAlertVariant = () => {
    switch (state) {
      case 'success':
      case 'already_confirmed':
        return 'default'; // Success styling
      case 'token_expired':
        return 'default'; // Warning styling
      case 'token_not_found':
      case 'token_invalid':
      case 'error':
        return 'destructive'; // Error styling
      default:
        return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-xl font-semibold">
            {getTitle()}
          </CardTitle>
          <CardDescription>
            {getDescription()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert variant={getAlertVariant()}>
            <AlertDescription>
              {message}
            </AlertDescription>
          </Alert>

          {/* Action buttons based on state */}
          <div className="space-y-2">
            {state === 'success' && (
              <Button 
                onClick={() => router.push('/')} 
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Return to Homepage
              </Button>
            )}

            {state === 'already_confirmed' && (
              <Button 
                onClick={() => router.push('/')} 
                variant="outline" 
                className="w-full"
              >
                <Home className="h-4 w-4 mr-2" />
                Return to Homepage
              </Button>
            )}

            {state === 'token_expired' && (
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/?subscribe=true')} 
                  className="w-full"
                >
                  Subscribe Again
                </Button>
                <Button 
                  onClick={() => router.push('/')} 
                  variant="outline" 
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Return to Homepage
                </Button>
              </div>
            )}

            {(state === 'token_not_found' || state === 'token_invalid' || state === 'error') && (
              <div className="space-y-2">
                <Button 
                  onClick={() => router.push('/?subscribe=true')} 
                  className="w-full"
                >
                  Try Subscribing Again
                </Button>
                <Button 
                  onClick={() => router.push('/')} 
                  variant="outline" 
                  className="w-full"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Return to Homepage
                </Button>
              </div>
            )}
          </div>

          {/* Security notice */}
          {(state === 'token_expired' || state === 'token_not_found') && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <strong>Security Notice:</strong> Confirmation links expire after 48 hours 
              and can only be used once for your security and privacy.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}