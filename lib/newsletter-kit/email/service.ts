/**
 * Newsletter Kit - Email Service
 * Main service for sending newsletter emails
 */

import { createEmailProvider } from './providers';
import { EmailTriggerEngine, triggerWelcomeEmail } from './triggers';
import { defaultTemplates } from './templates/default-templates';
import type { EmailConfig } from './types';

// ========================= EMAIL SERVICE CLASS =========================
export class NewsletterEmailService {
  private static instance: NewsletterEmailService;
  private triggerEngine: EmailTriggerEngine | null = null;
  private config: EmailConfig;
  private isConfigured = false;

  private constructor() {
    this.config = this.loadConfiguration();
  }

  static getInstance(): NewsletterEmailService {
    if (!NewsletterEmailService.instance) {
      NewsletterEmailService.instance = new NewsletterEmailService();
    }
    return NewsletterEmailService.instance;
  }

  private loadConfiguration(): EmailConfig {
    return {
      provider: (process.env.EMAIL_PROVIDER as any) || 'resend',
      apiKey: process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.FROM_EMAIL || 'noreply@silksong.com',
      fromName: process.env.FROM_NAME || 'Hollow Knight Silksong',
      replyTo: process.env.REPLY_TO_EMAIL,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      tracking: {
        opens: true,
        clicks: true,
        unsubscribes: true,
      },
      rateLimit: {
        enabled: true,
        maxEmails: 100,
        perMinute: 1,
      },
      retry: {
        enabled: true,
        maxRetries: 3,
        backoffMs: 1000,
      },
    };
  }

  async initialize(): Promise<boolean> {
    if (this.isConfigured) return true;

    try {
      // Validate configuration
      if (!this.config.apiKey) {
        console.warn('Email API key not configured - email sending disabled');
        return false;
      }

      // Create email provider and trigger engine
      const emailProvider = createEmailProvider(this.config);
      
      // Validate provider configuration
      const isValid = await emailProvider.validateConfig();
      if (!isValid) {
        console.error('Email provider configuration is invalid');
        return false;
      }

      this.triggerEngine = new EmailTriggerEngine(emailProvider, {
        fromEmail: this.config.fromEmail,
        fromName: this.config.fromName,
        replyTo: this.config.replyTo,
        baseUrl: this.config.baseUrl!,
      });

      // Load default templates
      defaultTemplates.forEach(template => {
        this.triggerEngine!.addTemplate(template);
      });

      // Load default triggers
      const { createDefaultTriggers } = await import('./triggers');
      createDefaultTriggers().forEach(trigger => {
        this.triggerEngine!.addTrigger(trigger);
      });

      this.isConfigured = true;
      console.log('Newsletter email service initialized successfully');
      return true;

    } catch (error) {
      console.error('Failed to initialize email service:', error);
      return false;
    }
  }

  async sendWelcomeEmail(
    subscription: {
      id: string;
      email: string;
      subscribed_at: string;
      source?: string;
      tags?: string[];
    },
    options?: {
      firstName?: string;
      subscriberCount?: number;
      customData?: Record<string, unknown>;
    }
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured || !this.triggerEngine) {
      const initResult = await this.initialize();
      if (!initResult) {
        return { success: false, error: 'Email service not configured' };
      }
    }

    try {
      const additionalData = {
        siteName: 'Hollow Knight Silksong',
        firstName: options?.firstName || 'there',
        subscriberCount: options?.subscriberCount || 1000,
        websiteUrl: this.config.baseUrl,
        supportEmail: this.config.fromEmail,
        ...options?.customData,
      };

      await triggerWelcomeEmail(this.triggerEngine!, subscription, additionalData);
      
      return { success: true };
    } catch (error: any) {
      console.error('Failed to send welcome email:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send welcome email' 
      };
    }
  }

  async sendConfirmationEmail(
    email: string,
    confirmationToken: string,
    options?: {
      expiryHours?: number;
      customData?: Record<string, unknown>;
    }
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured || !this.triggerEngine) {
      const initResult = await this.initialize();
      if (!initResult) {
        return { success: false, error: 'Email service not configured' };
      }
    }

    try {
      const { triggerConfirmationEmail } = await import('./triggers');
      
      const additionalData = {
        siteName: 'Hollow Knight Silksong',
        supportEmail: this.config.fromEmail,
        baseUrl: this.config.baseUrl,
        expiryHours: options?.expiryHours || 24,
        expiryDate: new Date(Date.now() + (options?.expiryHours || 24) * 60 * 60 * 1000).toLocaleDateString(),
        ...options?.customData,
      };

      await triggerConfirmationEmail(this.triggerEngine!, email, confirmationToken, additionalData);
      
      return { success: true };
    } catch (error: any) {
      console.error('Failed to send confirmation email:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send confirmation email' 
      };
    }
  }

  getConfiguration(): EmailConfig {
    return { ...this.config };
  }

  isServiceConfigured(): boolean {
    return this.isConfigured && !!this.config.apiKey;
  }
}

// ========================= CONVENIENCE FUNCTIONS =========================

/**
 * Send welcome email to new subscriber
 */
export async function sendWelcomeEmail(
  subscription: {
    id: string;
    email: string;
    subscribed_at: string;
    source?: string;
    tags?: string[];
  },
  options?: {
    firstName?: string;
    subscriberCount?: number;
    customData?: Record<string, unknown>;
  }
): Promise<{ success: boolean; error?: string }> {
  const service = NewsletterEmailService.getInstance();
  return service.sendWelcomeEmail(subscription, options);
}

/**
 * Send confirmation email for double opt-in
 */
export async function sendConfirmationEmail(
  email: string,
  confirmationToken: string,
  options?: {
    expiryHours?: number;
    customData?: Record<string, unknown>;
  }
): Promise<{ success: boolean; error?: string }> {
  const service = NewsletterEmailService.getInstance();
  return service.sendConfirmationEmail(email, confirmationToken, options);
}

/**
 * Check if email service is configured
 */
export function isEmailServiceConfigured(): boolean {
  const service = NewsletterEmailService.getInstance();
  return service.isServiceConfigured();
}

/**
 * Get email service configuration status
 */
export function getEmailServiceStatus(): {
  configured: boolean;
  provider: string;
  hasApiKey: boolean;
  fromEmail: string;
  baseUrl: string;
} {
  const service = NewsletterEmailService.getInstance();
  const config = service.getConfiguration();
  
  return {
    configured: service.isServiceConfigured(),
    provider: config.provider,
    hasApiKey: !!config.apiKey,
    fromEmail: config.fromEmail,
    baseUrl: config.baseUrl!,
  };
}