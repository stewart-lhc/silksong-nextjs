/**
 * Newsletter Kit - Resend Email Provider
 * Resend.com integration for email sending
 */

import { Resend } from 'resend';
import type { 
  EmailProvider, 
  EmailMessage, 
  EmailSendResult, 
  EmailBatchResult,
  EmailConfig 
} from '../types';

export class ResendEmailProvider implements EmailProvider {
  public readonly name = 'resend';
  private resend: Resend;
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
    this.resend = new Resend(config.apiKey);
  }

  async validateConfig(): Promise<boolean> {
    try {
      // Test API key by getting domains
      await this.resend.domains.list();
      return true;
    } catch (error) {
      console.error('Resend config validation failed:', error);
      return false;
    }
  }

  async send(email: EmailMessage): Promise<EmailSendResult> {
    try {
      const emailData = {
        from: email.from || `${this.config.fromName} <${this.config.fromEmail}>`,
        to: Array.isArray(email.to) ? email.to : [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
        reply_to: email.reply_to || this.config.replyTo,
        headers: email.headers,
        attachments: email.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
        })),
        tags: email.tags?.filter(tag => /^[a-zA-Z0-9_-]+$/.test(tag)).map(tag => ({ name: tag, value: 'true' })),
      };

      console.log('🚀 Sending email via Resend:', {
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        tags: emailData.tags,
      });

      const result = await this.resend.emails.send(emailData);

      console.log('✅ Resend API Response:', {
        success: !!result.data,
        id: result.data?.id,
        error: result.error,
      });

      if (result.error) {
        console.error('❌ Resend API Error:', result.error);
        return {
          success: false,
          error: `Resend API Error: ${result.error.message || result.error}`,
          provider: this.name,
        };
      }

      return {
        success: true,
        messageId: result.data?.id,
        provider: this.name,
      };
    } catch (error: any) {
      console.error('❌ Resend Send Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
        provider: this.name,
      };
    }
  }

  async sendBatch(emails: EmailMessage[]): Promise<EmailBatchResult> {
    const results: EmailSendResult[] = [];
    let sent = 0;
    let failed = 0;
    const errors: Array<{ email: string; error: string }> = [];

    // Resend doesn't support true batch sending, so we send individually
    // but implement rate limiting to avoid hitting limits
    for (const email of emails) {
      try {
        // Rate limiting
        if (this.config.rateLimit?.enabled) {
          await this.rateLimitDelay();
        }

        const result = await this.send(email);
        results.push(result);

        if (result.success) {
          sent++;
        } else {
          failed++;
          errors.push({
            email: Array.isArray(email.to) ? email.to[0] : email.to,
            error: result.error || 'Unknown error',
          });
        }
      } catch (error: any) {
        failed++;
        results.push({
          success: false,
          error: error.message || 'Batch send failed',
          provider: this.name,
        });
        errors.push({
          email: Array.isArray(email.to) ? email.to[0] : email.to,
          error: error.message || 'Unknown error',
        });
      }
    }

    return {
      success: sent > 0,
      sent,
      failed,
      results,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private async rateLimitDelay(): Promise<void> {
    if (!this.config.rateLimit?.enabled) return;
    
    const delayMs = (60 * 1000) / this.config.rateLimit.maxEmails;
    return new Promise(resolve => setTimeout(resolve, delayMs));
  }
}

// ========================= RESEND WEBHOOK HANDLING =========================
export interface ResendWebhookEvent {
  type: 'email.sent' | 'email.delivered' | 'email.delivery_delayed' | 'email.complained' | 'email.bounced';
  created_at: string;
  data: {
    email_id: string;
    to: string;
    subject: string;
    from: string;
    created_at: string;
  };
}

export class ResendWebhookHandler {
  static async handleWebhook(
    payload: ResendWebhookEvent,
    onEvent?: (event: ResendWebhookEvent) => Promise<void>
  ): Promise<void> {
    try {
      // Verify webhook signature if needed
      // In production, you should verify the webhook signature
      
      // Handle different event types
      switch (payload.type) {
        case 'email.sent':
          console.log('Email sent:', payload.data.email_id);
          break;
        case 'email.delivered':
          console.log('Email delivered:', payload.data.email_id);
          break;
        case 'email.bounced':
          console.log('Email bounced:', payload.data.email_id);
          break;
        case 'email.complained':
          console.log('Email complained:', payload.data.email_id);
          break;
        default:
          console.log('Unknown event type:', payload.type);
      }

      // Call custom event handler if provided
      if (onEvent) {
        await onEvent(payload);
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }
}