/**
 * Newsletter Kit - Email Providers
 * Support for multiple email service providers
 */

export { ResendEmailProvider, ResendWebhookHandler } from './resend';

import type { EmailProvider, EmailConfig } from '../types';
import { ResendEmailProvider } from './resend';

// ========================= PROVIDER FACTORY =========================
export function createEmailProvider(config: EmailConfig): EmailProvider {
  switch (config.provider) {
    case 'resend':
      return new ResendEmailProvider(config);
    default:
      throw new Error(`Unsupported email provider: ${config.provider}. Currently supported: resend`);
  }
}

// ========================= PROVIDER UTILITIES =========================
export async function validateEmailProvider(config: EmailConfig): Promise<boolean> {
  try {
    const provider = createEmailProvider(config);
    return await provider.validateConfig();
  } catch (error) {
    console.error('Email provider validation failed:', error);
    return false;
  }
}

export function getSupportedProviders(): Array<EmailConfig['provider']> {
  return ['resend'];
}

// ========================= PROVIDER CONFIGURATIONS =========================
export const defaultProviderConfigs = {
  resend: {
    rateLimit: {
      enabled: true,
      maxEmails: 100, // Resend free tier limit
      perMinute: 1,
    },
    retry: {
      enabled: true,
      maxRetries: 3,
      backoffMs: 1000,
    },
  },
} as const;