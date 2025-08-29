/**
 * Newsletter Kit - Send Welcome Email API
 * Sends welcome email to new subscribers
 */

import { NextRequest, NextResponse } from 'next/server';
import { createEmailProvider } from '@/lib/newsletter-kit/email/providers';
import { EmailTriggerEngine, triggerWelcomeEmail } from '@/lib/newsletter-kit/email/triggers';
import { defaultTemplates } from '@/lib/newsletter-kit/email/templates/default-templates';
import type { EmailConfig } from '@/lib/newsletter-kit/email/types';

// Email configuration
const emailConfig: EmailConfig = {
  provider: 'resend',
  apiKey: process.env.RESEND_API_KEY || '',
  fromEmail: process.env.FROM_EMAIL || 'noreply@example.com',
  fromName: process.env.FROM_NAME || 'Hollow Knight Silksong',
  replyTo: process.env.REPLY_TO_EMAIL,
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  tracking: {
    opens: true,
    clicks: true,
    unsubscribes: true,
  },
};

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, subscriptionId, firstName, source } = body;

    // Validate required fields
    if (!email || !subscriptionId) {
      return NextResponse.json(
        { success: false, error: 'Email and subscription ID are required' },
        { status: 400 }
      );
    }

    // Validate email provider configuration
    if (!emailConfig.apiKey) {
      return NextResponse.json(
        { success: false, error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Create email provider and trigger engine
    const emailProvider = createEmailProvider(emailConfig);
    const triggerEngine = new EmailTriggerEngine(emailProvider, {
      fromEmail: emailConfig.fromEmail,
      fromName: emailConfig.fromName,
      replyTo: emailConfig.replyTo,
      baseUrl: emailConfig.baseUrl!,
    });

    // Add default templates to engine
    defaultTemplates.forEach(template => {
      triggerEngine.addTemplate(template);
    });

    // Add Silksong HTML file trigger
    triggerEngine.addTrigger({
      id: 'silksong-welcome-html-trigger',
      name: 'Silksong Welcome Email (HTML File)',
      type: 'subscription_confirmed',
      enabled: true,
      templateId: 'silksong-welcome-html', // Use the HTML file template
      delay: 0,
      metadata: {
        description: 'Send Silksong welcome email using the specific HTML template file',
      },
    });

    // Get subscriber count (mock for now, replace with actual database query)
    const subscriberCount = 1234; // await getSubscriberCount();

    // Prepare subscription data
    const subscription = {
      id: subscriptionId,
      email,
      subscribed_at: new Date().toISOString(),
      source: source || 'web',
      tags: ['welcome', 'new_subscriber'],  // 使用下划线替代连字符
    };

    // Silksong-specific template data
    const additionalData = {
      siteName: 'Hollow Knight: Silksong Info Hub',
      firstName: firstName || 'Knight',
      subscriberCount,
      websiteUrl: emailConfig.baseUrl,
      supportEmail: emailConfig.fromEmail,
      // Silksong-specific URLs
      URL_HOME: emailConfig.baseUrl,
      URL_COMPARE: `${emailConfig.baseUrl}/compare-hollow-knight`,
      URL_TIMELINE: `${emailConfig.baseUrl}/timeline`,
      URL_EMBED: `${emailConfig.baseUrl}/tools/embed`,
      URL_CHECKLIST: `${emailConfig.baseUrl}/checklist`,
      URL_DOCS_API: `${emailConfig.baseUrl}/developers`,
      URL_EMBED_IFRAME: `${emailConfig.baseUrl}/embed/countdown`,
      DAYS_REMAINING: Math.ceil((new Date('2025-09-04T14:00:00Z').getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      URL_UNSUBSCRIBE: `${emailConfig.baseUrl}/api/newsletter/unsubscribe?email=${email}`,
      TRACKING_PIXEL_URL: `${emailConfig.baseUrl}/api/newsletter/track?id=${subscriptionId}`,
      YEAR: new Date().getFullYear(),
      SUBSCRIBER_NUMBER: subscriberCount,
    };

    // Trigger Silksong-themed welcome email
    await triggerWelcomeEmail(triggerEngine, subscription, {
      ...additionalData,
      email,
      subscribedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
    });

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
      data: {
        email,
        subscriptionId,
        sentAt: new Date().toISOString(),
      },
    });

  } catch (error: any) {
    console.error('Welcome email send error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send welcome email',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Newsletter Welcome Email API',
    endpoints: {
      POST: 'Send welcome email',
    },
    requiredEnvVars: [
      'RESEND_API_KEY',
      'FROM_EMAIL',
      'FROM_NAME (optional)',
      'REPLY_TO_EMAIL (optional)',
    ],
    configured: {
      hasApiKey: !!process.env.RESEND_API_KEY,
      hasFromEmail: !!process.env.FROM_EMAIL,
    },
  });
}