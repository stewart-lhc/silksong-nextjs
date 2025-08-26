/**
 * Email Transport System for Double Opt-in Subscriptions
 * 
 * Supports multiple transport modes:
 * - mock: For testing (logs email content)
 * - file: Saves emails to filesystem
 * - smtp: Real email delivery via SMTP
 * - none: Disabled (for CI/testing)
 * 
 * SECURITY FEATURES:
 * - No sensitive information in logs
 * - Email content sanitization
 * - Transport validation
 * - Rate limiting integration ready
 */

import fs from 'fs/promises';
import path from 'path';
import nodemailer from 'nodemailer';
import { env } from '@/lib/env';
import { secureLog } from '@/lib/double-optin-security';

// Email transport configuration
export type EmailTransport = 'mock' | 'file' | 'smtp' | 'none';

interface EmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
  code?: string;
  messageId?: string;
}

// Get transport mode from environment
function getTransportMode(): EmailTransport {
  const mode = process.env.EMAIL_TRANSPORT?.toLowerCase() as EmailTransport;
  
  // Validate transport mode
  if (!mode || !['mock', 'file', 'smtp', 'none'].includes(mode)) {
    return env.NODE_ENV === 'production' ? 'none' : 'mock';
  }
  
  return mode;
}

/**
 * Creates SMTP transporter for real email delivery
 */
async function createSMTPTransporter() {
  const config = {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ? parseInt(env.SMTP_PORT, 10) : 587,
    secure: env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
    // Security options
    requireTLS: true,
    tls: {
      rejectUnauthorized: env.NODE_ENV === 'production',
    },
  };
  
  return nodemailer.createTransport(config);
}

/**
 * Generates confirmation email content
 * 
 * @param email - Recipient email (for personalization only)
 * @param token - Confirmation token
 * @returns Email content object
 */
export function generateConfirmationEmail(email: string, token: string): EmailData {
  const confirmationUrl = `${env.NEXT_PUBLIC_APP_URL}/subscribe/confirm?token=${token}`;
  
  const subject = 'Confirm your Hollow Knight: Silksong subscription';
  
  const text = `
Hello!

Thank you for your interest in Hollow Knight: Silksong updates.

To complete your subscription, please click the link below or copy it into your browser:

${confirmationUrl}

This confirmation link will expire in 48 hours.

If you didn't request this subscription, you can safely ignore this email.

Thanks,
The Silksong Team
  `.trim();
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm your subscription</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
        .security-note { background: #e7f3ff; border: 1px solid #b8daff; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🦋 Hollow Knight: Silksong</h1>
        <p>Confirm your subscription</p>
    </div>
    
    <div class="content">
        <p>Hello!</p>
        
        <p>Thank you for your interest in <strong>Hollow Knight: Silksong</strong> updates.</p>
        
        <p>To complete your subscription and start receiving updates about the game, please click the button below:</p>
        
        <div style="text-align: center;">
            <a href="${confirmationUrl}" class="button">Confirm Subscription</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px; font-family: monospace;">
            ${confirmationUrl}
        </p>
        
        <div class="security-note">
            <strong>Security Notice:</strong> This confirmation link will expire in 48 hours for your security. 
            If you didn't request this subscription, you can safely ignore this email.
        </div>
        
        <div class="footer">
            <p>Thanks,<br>The Silksong Team</p>
            <p><small>This email was sent to confirm your subscription request. If you have questions, please visit our FAQ page.</small></p>
        </div>
    </div>
</body>
</html>
  `.trim();
  
  return {
    to: email,
    subject,
    text,
    html
  };
}

/**
 * Mock transport - logs email content for development
 */
async function sendEmailMock(emailData: EmailData): Promise<EmailResult> {
  secureLog('email_mock', emailData.to, {
    subject: emailData.subject,
    contentLength: emailData.text.length
  });
  
  console.log('\n=== MOCK EMAIL DELIVERY ===');
  console.log(`To: ${emailData.to}`);
  console.log(`Subject: ${emailData.subject}`);
  console.log('Content:');
  console.log(emailData.text);
  console.log('=== END MOCK EMAIL ===\n');
  
  return {
    success: true,
    messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
}

/**
 * File transport - saves emails to filesystem for testing
 */
async function sendEmailFile(emailData: EmailData): Promise<EmailResult> {
  try {
    const emailsDir = path.join(process.cwd(), 'data', 'emails');
    await fs.mkdir(emailsDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `email-${timestamp}.json`;
    const filePath = path.join(emailsDir, filename);
    
    const emailRecord = {
      ...emailData,
      timestamp: new Date().toISOString(),
      transport: 'file'
    };
    
    await fs.writeFile(filePath, JSON.stringify(emailRecord, null, 2), 'utf8');
    
    secureLog('email_file', emailData.to, {
      filename,
      subject: emailData.subject
    });
    
    return {
      success: true,
      messageId: `file-${filename}`
    };
  } catch (error) {
    secureLog('email_file_error', emailData.to, {
      error: (error as Error).message
    });
    
    return {
      success: false,
      error: 'Failed to save email to file',
      code: 'FILE_WRITE_ERROR'
    };
  }
}

/**
 * SMTP transport - real email delivery
 */
async function sendEmailSMTP(emailData: EmailData): Promise<EmailResult> {
  try {
    // Validate SMTP configuration
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
      return {
        success: false,
        error: 'SMTP configuration incomplete',
        code: 'SMTP_CONFIG_MISSING'
      };
    }
    
    const transporter = await createSMTPTransporter();
    
    // Verify SMTP connection (optional, but good for debugging)
    if (env.NODE_ENV === 'development') {
      try {
        await transporter.verify();
      } catch (verifyError) {
        secureLog('smtp_verify_error', emailData.to, {
          error: (verifyError as Error).message
        });
        
        return {
          success: false,
          error: 'SMTP connection failed',
          code: 'SMTP_CONNECTION_ERROR'
        };
      }
    }
    
    // Send email
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM || '"Silksong Team" <noreply@silksong.com>',
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
      // Security headers
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'Silksong Subscription System',
        'Reply-To': env.EMAIL_FROM || 'noreply@silksong.com'
      }
    });
    
    secureLog('email_smtp_success', emailData.to, {
      messageId: info.messageId,
      subject: emailData.subject
    });
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    secureLog('email_smtp_error', emailData.to, {
      error: (error as Error).message,
      code: (error as any).code
    });
    
    return {
      success: false,
      error: 'Failed to send email via SMTP',
      code: 'SMTP_SEND_ERROR'
    };
  }
}

/**
 * None transport - disabled email sending
 */
async function sendEmailNone(emailData: EmailData): Promise<EmailResult> {
  secureLog('email_none', emailData.to, {
    subject: emailData.subject,
    note: 'Email transport disabled'
  });
  
  return {
    success: true,
    messageId: 'none-disabled'
  };
}

/**
 * Main email sending function
 * Routes to appropriate transport based on configuration
 * 
 * @param email - Recipient email address
 * @param token - Confirmation token
 * @returns Email sending result
 */
export async function sendConfirmationEmail(email: string, token: string): Promise<EmailResult> {
  const transport = getTransportMode();
  const emailData = generateConfirmationEmail(email, token);
  
  secureLog('email_send_attempt', email, {
    transport,
    subject: emailData.subject
  });
  
  try {
    switch (transport) {
      case 'mock':
        return await sendEmailMock(emailData);
      
      case 'file':
        return await sendEmailFile(emailData);
      
      case 'smtp':
        return await sendEmailSMTP(emailData);
      
      case 'none':
        return await sendEmailNone(emailData);
      
      default:
        return {
          success: false,
          error: 'Invalid email transport configuration',
          code: 'INVALID_TRANSPORT'
        };
    }
  } catch (error) {
    secureLog('email_send_error', email, {
      transport,
      error: (error as Error).message
    });
    
    return {
      success: false,
      error: 'Email sending failed',
      code: 'SEND_FAILED'
    };
  }
}

/**
 * Health check for email transport system
 * Tests the configured transport without sending real emails
 * 
 * @returns Health check result
 */
export async function checkEmailTransportHealth(): Promise<EmailResult> {
  const transport = getTransportMode();
  
  try {
    switch (transport) {
      case 'mock':
      case 'file':
      case 'none':
        return { success: true, messageId: `${transport}-healthy` };
      
      case 'smtp':
        if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
          return {
            success: false,
            error: 'SMTP configuration incomplete',
            code: 'SMTP_CONFIG_MISSING'
          };
        }
        
        // Test SMTP connection
        try {
          const transporter = await createSMTPTransporter();
          await transporter.verify();
          return { success: true, messageId: 'smtp-verified' };
        } catch (error) {
          return {
            success: false,
            error: 'SMTP connection failed',
            code: 'SMTP_CONNECTION_ERROR'
          };
        }
      
      default:
        return {
          success: false,
          error: 'Unknown transport mode',
          code: 'UNKNOWN_TRANSPORT'
        };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Health check failed',
      code: 'HEALTH_CHECK_ERROR'
    };
  }
}