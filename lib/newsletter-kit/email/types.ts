/**
 * Newsletter Kit - Email Types
 * Type definitions for email system
 */

// ========================= EMAIL PROVIDER TYPES =========================
export interface EmailProvider {
  name: string;
  send(email: EmailMessage): Promise<EmailSendResult>;
  sendBatch(emails: EmailMessage[]): Promise<EmailBatchResult>;
  validateConfig(): Promise<boolean>;
}

export interface EmailMessage {
  to: string | string[];
  from: string;
  subject: string;
  html?: string;
  text?: string;
  reply_to?: string;
  headers?: Record<string, string>;
  attachments?: EmailAttachment[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

export interface EmailBatchResult {
  success: boolean;
  sent: number;
  failed: number;
  results: EmailSendResult[];
  errors?: Array<{ email: string; error: string }>;
}

// ========================= EMAIL TEMPLATE TYPES =========================
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlTemplate: string;
  textTemplate?: string;
  variables: EmailTemplateVariable[];
  metadata?: {
    description?: string;
    category?: string;
    created_at?: string;
    updated_at?: string;
  };
}

export interface EmailTemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'url';
  required: boolean;
  defaultValue?: unknown;
  description?: string;
}

export interface EmailTemplateData {
  [key: string]: unknown;
}

export interface RenderedTemplate {
  subject: string;
  html: string;
  text?: string;
}

// ========================= EMAIL TRIGGER TYPES =========================
export type EmailTriggerType = 
  | 'subscription_confirmed'
  | 'welcome_email'
  | 'newsletter_broadcast'
  | 'unsubscribe_confirmation'
  | 'subscription_reminder';

export interface EmailTrigger {
  id: string;
  name: string;
  type: EmailTriggerType;
  enabled: boolean;
  templateId: string;
  conditions?: EmailTriggerCondition[];
  delay?: number; // in seconds
  metadata?: Record<string, unknown>;
}

export interface EmailTriggerCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: unknown;
}

export interface EmailTriggerPayload {
  triggerType: EmailTriggerType;
  recipient: string;
  data: Record<string, unknown>;
  subscription?: {
    id: string;
    email: string;
    subscribed_at: string;
    source?: string;
    tags?: string[];
  };
}

// ========================= EMAIL CONFIGURATION =========================
export interface EmailConfig {
  provider: 'resend' | 'sendgrid' | 'nodemailer';
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  
  // Advanced settings
  defaultTemplateId?: string;
  unsubscribeUrl?: string;
  baseUrl?: string;
  
  // Rate limiting
  rateLimit?: {
    enabled: boolean;
    maxEmails: number;
    perMinute: number;
  };
  
  // Tracking
  tracking?: {
    opens: boolean;
    clicks: boolean;
    unsubscribes: boolean;
  };
  
  // Retry settings
  retry?: {
    enabled: boolean;
    maxRetries: number;
    backoffMs: number;
  };
}

// ========================= EMAIL QUEUE TYPES =========================
export interface EmailQueue {
  add(job: EmailJob): Promise<void>;
  process(): Promise<void>;
  getStatus(): Promise<QueueStatus>;
  clear(): Promise<void>;
}

export interface EmailJob {
  id: string;
  type: 'single' | 'batch' | 'broadcast';
  payload: EmailMessage | EmailMessage[] | BroadcastPayload;
  priority: 'low' | 'medium' | 'high';
  scheduled_for?: Date;
  retry_count?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: Date;
  updated_at: Date;
}

export interface BroadcastPayload {
  templateId: string;
  data: EmailTemplateData;
  recipients: Array<{
    email: string;
    data?: EmailTemplateData;
  }>;
  tags?: string[];
}

export interface QueueStatus {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}

// ========================= EMAIL ANALYTICS TYPES =========================
export interface EmailAnalytics {
  messageId: string;
  email: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface EmailStats {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  unsubscribed: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
}

// ========================= EXPORT ALL TYPES =========================
export type {
  EmailProvider,
  EmailMessage,
  EmailAttachment,
  EmailSendResult,
  EmailBatchResult,
  EmailTemplate,
  EmailTemplateVariable,
  EmailTemplateData,
  RenderedTemplate,
  EmailTrigger,
  EmailTriggerCondition,
  EmailTriggerPayload,
  EmailConfig,
  EmailQueue,
  EmailJob,
  BroadcastPayload,
  QueueStatus,
  EmailAnalytics,
  EmailStats,
};