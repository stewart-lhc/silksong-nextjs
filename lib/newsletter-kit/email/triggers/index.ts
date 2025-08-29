/**
 * Newsletter Kit - Email Triggers
 * Automated email sending based on events
 */

import type { 
  EmailTrigger,
  EmailTriggerPayload,
  EmailProvider,
  EmailTemplate,
  EmailTemplateData,
  EmailMessage
} from '../types';
import { renderTemplate } from '../templates';

// ========================= TRIGGER ENGINE =========================
export class EmailTriggerEngine {
  private triggers: Map<string, EmailTrigger> = new Map();
  private templates: Map<string, EmailTemplate> = new Map();
  private emailProvider: EmailProvider;
  private config: {
    fromEmail: string;
    fromName: string;
    replyTo?: string;
    baseUrl: string;
  };

  constructor(
    emailProvider: EmailProvider, 
    config: {
      fromEmail: string;
      fromName: string;
      replyTo?: string;
      baseUrl: string;
    }
  ) {
    this.emailProvider = emailProvider;
    this.config = config;
  }

  // ========================= TRIGGER MANAGEMENT =========================
  addTrigger(trigger: EmailTrigger): void {
    this.triggers.set(trigger.id, trigger);
  }

  removeTrigger(triggerId: string): boolean {
    return this.triggers.delete(triggerId);
  }

  getTrigger(triggerId: string): EmailTrigger | undefined {
    return this.triggers.get(triggerId);
  }

  getAllTriggers(): EmailTrigger[] {
    return Array.from(this.triggers.values());
  }

  // ========================= TEMPLATE MANAGEMENT =========================
  addTemplate(template: EmailTemplate): void {
    this.templates.set(template.id, template);
  }

  getTemplate(templateId: string): EmailTemplate | undefined {
    return this.templates.get(templateId);
  }

  // ========================= TRIGGER EXECUTION =========================
  async executeTrigger(payload: EmailTriggerPayload): Promise<void> {
    const activeTriggers = this.getActiveTriggersForType(payload.triggerType);
    
    for (const trigger of activeTriggers) {
      try {
        // Check conditions
        if (!this.checkTriggerConditions(trigger, payload)) {
          continue;
        }

        // Execute with delay if specified
        if (trigger.delay && trigger.delay > 0) {
          setTimeout(() => {
            this.sendTriggeredEmail(trigger, payload);
          }, trigger.delay * 1000);
        } else {
          await this.sendTriggeredEmail(trigger, payload);
        }
      } catch (error) {
        console.error(`Failed to execute trigger ${trigger.id}:`, error);
      }
    }
  }

  private getActiveTriggersForType(type: EmailTriggerPayload['triggerType']): EmailTrigger[] {
    return Array.from(this.triggers.values()).filter(
      trigger => trigger.enabled && trigger.type === type
    );
  }

  private checkTriggerConditions(trigger: EmailTrigger, payload: EmailTriggerPayload): boolean {
    if (!trigger.conditions || trigger.conditions.length === 0) {
      return true;
    }

    return trigger.conditions.every(condition => {
      const fieldValue = this.getFieldValue(payload.data, condition.field);
      return this.evaluateCondition(fieldValue, condition.operator, condition.value);
    });
  }

  private getFieldValue(data: Record<string, unknown>, field: string): unknown {
    return field.split('.').reduce((obj: any, key) => obj?.[key], data);
  }

  private evaluateCondition(fieldValue: unknown, operator: string, conditionValue: unknown): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'not_equals':
        return fieldValue !== conditionValue;
      case 'contains':
        return String(fieldValue).includes(String(conditionValue));
      case 'not_contains':
        return !String(fieldValue).includes(String(conditionValue));
      case 'greater_than':
        return Number(fieldValue) > Number(conditionValue);
      case 'less_than':
        return Number(fieldValue) < Number(conditionValue);
      default:
        return true;
    }
  }

  private async sendTriggeredEmail(trigger: EmailTrigger, payload: EmailTriggerPayload): Promise<void> {
    const template = this.getTemplate(trigger.templateId);
    if (!template) {
      throw new Error(`Template ${trigger.templateId} not found`);
    }

    // Prepare template data
    const templateData = this.prepareTemplateData(payload);

    // Render template
    const subject = renderTemplate(template.subject, templateData);
    const html = renderTemplate(template.htmlTemplate, templateData);
    const text = template.textTemplate ? renderTemplate(template.textTemplate, templateData) : undefined;

    // Create email message
    const emailMessage: EmailMessage = {
      to: payload.recipient,
      from: `${this.config.fromName} <${this.config.fromEmail}>`,
      subject,
      html,
      text,
      reply_to: this.config.replyTo,
      tags: [`trigger:${trigger.type}`, `template:${template.id}`],
      metadata: {
        triggerId: trigger.id,
        triggerType: trigger.type,
        templateId: template.id,
        ...trigger.metadata,
      },
    };

    // Send email
    const result = await this.emailProvider.send(emailMessage);
    
    if (!result.success) {
      throw new Error(`Failed to send triggered email: ${result.error}`);
    }

    console.log(`Triggered email sent: ${trigger.type} to ${payload.recipient}`);
  }

  private prepareTemplateData(payload: EmailTriggerPayload): EmailTemplateData {
    const data: EmailTemplateData = {
      ...payload.data,
      baseUrl: this.config.baseUrl,
      recipient: payload.recipient,
    };

    // Add subscription-specific data
    if (payload.subscription) {
      data.email = payload.subscription.email;
      data.subscriptionId = payload.subscription.id;
      data.subscribedAt = payload.subscription.subscribed_at;
      data.source = payload.subscription.source;
      data.tags = payload.subscription.tags;
      
      // Generate unsubscribe URL
      data.unsubscribeUrl = `${this.config.baseUrl}/api/newsletter/unsubscribe?token=${this.generateUnsubscribeToken(payload.subscription.id)}`;
    }

    // Add default URLs
    data.websiteUrl = data.websiteUrl || this.config.baseUrl;
    data.supportEmail = data.supportEmail || this.config.fromEmail;

    return data;
  }

  private generateUnsubscribeToken(subscriptionId: string): string {
    // In production, use a proper JWT or signed token
    return Buffer.from(`${subscriptionId}:${Date.now()}`).toString('base64');
  }
}

// ========================= DEFAULT TRIGGERS =========================
export const createDefaultTriggers = (): EmailTrigger[] => [
  {
    id: 'welcome-email-trigger',
    name: 'Welcome Email',
    type: 'subscription_confirmed',
    enabled: true,
    templateId: 'welcome-email',
    delay: 0, // Send immediately
    metadata: {
      description: 'Send welcome email when user confirms subscription',
    },
  },
  {
    id: 'confirmation-email-trigger',
    name: 'Email Confirmation',
    type: 'subscription_confirmed',
    enabled: true,
    templateId: 'email-confirmation',
    delay: 0, // Send immediately
    conditions: [
      {
        field: 'requiresConfirmation',
        operator: 'equals',
        value: true,
      },
    ],
    metadata: {
      description: 'Send confirmation email for double opt-in',
    },
  },
  {
    id: 'unsubscribe-confirmation-trigger',
    name: 'Unsubscribe Confirmation',
    type: 'unsubscribe_confirmation',
    enabled: true,
    templateId: 'unsubscribe-confirmation',
    delay: 0,
    metadata: {
      description: 'Send confirmation when user unsubscribes',
    },
  },
];

// ========================= TRIGGER HELPERS =========================
export async function triggerWelcomeEmail(
  engine: EmailTriggerEngine,
  subscription: {
    id: string;
    email: string;
    subscribed_at: string;
    source?: string;
    tags?: string[];
  },
  additionalData?: EmailTemplateData
): Promise<void> {
  const payload: EmailTriggerPayload = {
    triggerType: 'subscription_confirmed',
    recipient: subscription.email,
    subscription,
    data: {
      siteName: 'Your Site',
      firstName: 'there', // Extract from email or user data
      subscriberCount: 1000, // Get from database
      ...additionalData,
    },
  };

  await engine.executeTrigger(payload);
}

export async function triggerConfirmationEmail(
  engine: EmailTriggerEngine,
  email: string,
  confirmationToken: string,
  additionalData?: EmailTemplateData
): Promise<void> {
  const payload: EmailTriggerPayload = {
    triggerType: 'subscription_confirmed',
    recipient: email,
    data: {
      email,
      confirmUrl: `${additionalData?.baseUrl}/api/newsletter/confirm?token=${confirmationToken}`,
      requiresConfirmation: true,
      expiryHours: 24,
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
      ...additionalData,
    },
  };

  await engine.executeTrigger(payload);
}

export async function triggerUnsubscribeConfirmation(
  engine: EmailTriggerEngine,
  subscription: {
    id: string;
    email: string;
    subscribed_at: string;
  },
  additionalData?: EmailTemplateData
): Promise<void> {
  const payload: EmailTriggerPayload = {
    triggerType: 'unsubscribe_confirmation',
    recipient: subscription.email,
    subscription,
    data: {
      firstName: 'there', // Extract from email or user data
      resubscribeUrl: `${additionalData?.baseUrl}/newsletter/subscribe`,
      ...additionalData,
    },
  };

  await engine.executeTrigger(payload);
}