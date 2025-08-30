/**
 * Unified Email Service
 * Simple email service for the subscription system using Resend
 * Based on email_subscriptions table structure with Silksong template integration
 */

import { Resend } from 'resend';
import { EmailSubscription } from '@/types/email-subscription';
import { generateSilksongTemplate, generateTextContent, type TemplateVariables } from '@/lib/newsletter-kit/email/templates/silksong-gmail-optimized';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailSendOptions {
  firstName?: string;
  subscriberCount?: number;
  customData?: Record<string, any>;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Calculate days remaining until Silksong release
 */
function calculateDaysRemaining(): number {
  const releaseDate = new Date('2025-09-04T14:00:00Z');
  const now = new Date();
  const timeDiff = releaseDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  return Math.max(0, daysRemaining); // Don't return negative days
}

/**
 * Send welcome email using professional Silksong HTML template
 */
export async function sendWelcomeEmail(
  subscription: EmailSubscription,
  options: EmailSendOptions = {}
): Promise<EmailResult> {
  try {
    const { firstName, subscriberCount = 0, customData } = options;
    const isTransactional = customData?.transactional || false;
    
    // Prepare template variables
    const templateVariables: TemplateVariables = {
      URL_HOME: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      DAYS_REMAINING: calculateDaysRemaining(),
      YEAR: new Date().getFullYear()
    };
    
    // Generate Gmail-optimized Silksong template with inline styles
    const htmlContent = generateSilksongTemplate(templateVariables);
    const textContent = generateTextContent(templateVariables);

    const result = await resend.emails.send({
      from: `${process.env.FROM_NAME || 'Hornet'} <${process.env.FROM_EMAIL || 'noreply@hollowknightsilksong.org'}>`,
      to: [subscription.email],
      subject: '🎉 You\'re In – Silksong Tracking Activated',
      html: htmlContent,
      text: textContent,
      // Disable link tracking to prevent Gmail image display issues
      track_opens: false,
      track_clicks: false,
      headers: {
        'X-Entity-Ref-ID': subscription.id,
        'List-Unsubscribe': `<mailto:${process.env.REPLY_TO_EMAIL || process.env.FROM_EMAIL || 'unsubscribe@hollowknightsilksong.org'}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      },
      tags: [
        { name: 'type', value: 'welcome' },
        { name: 'source', value: subscription.source || 'web' },
        { name: 'template', value: 'silksong-professional' },
        { name: 'transactional', value: isTransactional ? 'true' : 'false' }
      ]
    });

    if (result.error) {
      console.error('Email send failed:', result.error);
      return {
        success: false,
        error: result.error.message || 'Failed to send email'
      };
    }

    return {
      success: true,
      messageId: result.data?.id
    };

  } catch (error) {
    console.error('Email service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown email error'
    };
  }
}

/**
 * Send confirmation email for subscription verification
 */
export async function sendConfirmationEmail(
  email: string,
  confirmationToken: string,
  options: { expiryHours?: number; customData?: Record<string, any> } = {}
): Promise<EmailResult> {
  try {
    const { expiryHours = 24 } = options;
    const confirmationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/confirm?token=${confirmationToken}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirm your Silksong subscription</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">Confirm Your Subscription</h1>
          <p style="font-size: 16px; color: #666;">One more step to get Silksong updates</p>
        </div>
        
        <p>Hi there!</p>
        <p>Thank you for subscribing to Silksong updates. To complete your subscription, please confirm your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">Confirm Subscription</a>
        </div>
        
        <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
        <p style="font-size: 14px; color: #2563eb; word-break: break-all;">${confirmationUrl}</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #666;">
          <p>This confirmation link will expire in ${expiryHours} hours.</p>
          <p>If you didn't request this subscription, you can safely ignore this email.</p>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Confirm Your Subscription

Thank you for subscribing to Silksong updates. To complete your subscription, please confirm your email address by visiting:

${confirmationUrl}

This confirmation link will expire in ${expiryHours} hours.
If you didn't request this subscription, you can safely ignore this email.
    `;

    const result = await resend.emails.send({
      from: 'Silksong Updates <noreply@silksong-updates.com>',
      to: [email],
      subject: 'Confirm your Silksong subscription',
      html: htmlContent,
      text: textContent,
      // Disable tracking for confirmation emails too
      track_opens: false,
      track_clicks: false,
      tags: [
        { name: 'type', value: 'confirmation' }
      ]
    });

    if (result.error) {
      console.error('Confirmation email send failed:', result.error);
      return {
        success: false,
        error: result.error.message || 'Failed to send confirmation email'
      };
    }

    return {
      success: true,
      messageId: result.data?.id
    };

  } catch (error) {
    console.error('Confirmation email service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown confirmation email error'
    };
  }
}

/**
 * Get subscriber count for display in emails
 */
export async function getSubscriberCount(): Promise<number> {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Supabase not configured for subscriber count');
      return 0;
    }

    const { supabaseAdmin } = await import('@/lib/supabase/server');
    
    if (!supabaseAdmin) {
      console.warn('Supabase admin client not available');
      return 0;
    }

    const { count, error } = await supabaseAdmin
      .from('email_subscriptions')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Failed to get subscriber count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Failed to get subscriber count:', error);
    return 0;
  }
}