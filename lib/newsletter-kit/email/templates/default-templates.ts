/**
 * Newsletter Kit - Default Email Templates
 * Pre-built templates for common newsletter emails
 */

import type { EmailTemplate } from '../types';
import { createTemplateFromHtmlFile } from './file-loader';

// ========================= WELCOME EMAIL TEMPLATE =========================
export const welcomeEmailTemplate: EmailTemplate = {
  id: 'welcome-email',
  name: 'Welcome Email',
  subject: '🎉 Welcome to {{siteName}}!',
  htmlTemplate: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{siteName}}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .content h2 { color: #1f2937; font-size: 24px; margin-bottom: 20px; }
        .content p { color: #6b7280; line-height: 1.6; margin-bottom: 20px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
        .footer a { color: #6b7280; text-decoration: none; }
    </style>
</head>
<body>
    <div style="padding: 40px 20px;">
        <div class="container">
            <div class="header">
                <h1>{{siteName}}</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome aboard!</p>
            </div>
            <div class="content">
                <h2>Hi {{firstName}}! 👋</h2>
                <p>Thank you for subscribing to our newsletter! We're excited to have you join our community of {{subscriberCount}} subscribers.</p>
                <p>Here's what you can expect from us:</p>
                <ul style="color: #6b7280; line-height: 1.6;">
                    <li>🚀 Latest updates and announcements</li>
                    <li>📚 Exclusive content and insights</li>
                    <li>🎁 Special offers and early access</li>
                    <li>📱 Tips and best practices</li>
                </ul>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{websiteUrl}}" class="cta-button">Visit Our Website</a>
                </div>
                <p>If you have any questions, feel free to reply to this email. We'd love to hear from you!</p>
                <p>Best regards,<br>The {{siteName}} Team</p>
            </div>
            <div class="footer">
                <p>You're receiving this email because you subscribed to {{siteName}}.</p>
                <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{websiteUrl}}">Visit Website</a></p>
            </div>
        </div>
    </div>
</body>
</html>`,
  textTemplate: `
Welcome to {{siteName}}!

Hi {{firstName}},

Thank you for subscribing to our newsletter! We're excited to have you join our community of {{subscriberCount}} subscribers.

Here's what you can expect from us:
- Latest updates and announcements
- Exclusive content and insights  
- Special offers and early access
- Tips and best practices

Visit our website: {{websiteUrl}}

If you have any questions, feel free to reply to this email. We'd love to hear from you!

Best regards,
The {{siteName}} Team

---
You're receiving this email because you subscribed to {{siteName}}.
Unsubscribe: {{unsubscribeUrl}}
`,
  variables: [
    { name: 'siteName', type: 'string', required: true, description: 'Name of the website/company' },
    { name: 'firstName', type: 'string', required: false, defaultValue: 'there', description: 'Subscriber first name' },
    { name: 'subscriberCount', type: 'number', required: false, defaultValue: 1000, description: 'Total subscriber count' },
    { name: 'websiteUrl', type: 'url', required: true, description: 'Website URL' },
    { name: 'unsubscribeUrl', type: 'url', required: true, description: 'Unsubscribe URL' },
  ],
};

// ========================= CONFIRMATION EMAIL TEMPLATE =========================
export const confirmationEmailTemplate: EmailTemplate = {
  id: 'email-confirmation',
  name: 'Email Confirmation',
  subject: '✅ Please confirm your email address',
  htmlTemplate: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your Email</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 30px; text-align: center; }
        .content h2 { color: #1f2937; font-size: 24px; margin-bottom: 20px; }
        .content p { color: #6b7280; line-height: 1.6; margin-bottom: 20px; }
        .confirm-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 18px; margin: 30px 0; }
        .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div style="padding: 40px 20px;">
        <div class="container">
            <div class="header">
                <h1>{{siteName}}</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Almost there!</p>
            </div>
            <div class="content">
                <h2>📧 Confirm Your Email Address</h2>
                <p>Hi there!</p>
                <p>You recently signed up for our newsletter with the email address: <strong>{{email}}</strong></p>
                <p>To complete your subscription and start receiving our updates, please click the button below:</p>
                <a href="{{confirmUrl}}" class="confirm-button">✅ Confirm My Email</a>
                <p style="margin-top: 30px; font-size: 14px; color: #9ca3af;">
                    This link will expire in {{expiryHours}} hours for security reasons.
                </p>
                <p style="margin-top: 30px; font-size: 14px; color: #9ca3af;">
                    If you didn't sign up for this newsletter, you can safely ignore this email.
                </p>
            </div>
            <div class="footer">
                <p>Need help? Contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
                <p>This confirmation link expires on {{expiryDate}}</p>
            </div>
        </div>
    </div>
</body>
</html>`,
  textTemplate: `
Confirm Your Email Address - {{siteName}}

Hi there!

You recently signed up for our newsletter with the email address: {{email}}

To complete your subscription and start receiving our updates, please visit:
{{confirmUrl}}

This link will expire in {{expiryHours}} hours for security reasons.

If you didn't sign up for this newsletter, you can safely ignore this email.

Need help? Contact us at {{supportEmail}}
This confirmation link expires on {{expiryDate}}
`,
  variables: [
    { name: 'siteName', type: 'string', required: true, description: 'Name of the website/company' },
    { name: 'email', type: 'string', required: true, description: 'Email address to confirm' },
    { name: 'confirmUrl', type: 'url', required: true, description: 'Confirmation URL with token' },
    { name: 'supportEmail', type: 'string', required: true, description: 'Support email address' },
    { name: 'expiryHours', type: 'number', required: false, defaultValue: 24, description: 'Hours until link expires' },
    { name: 'expiryDate', type: 'date', required: false, description: 'Expiry date formatted' },
  ],
};

// ========================= NEWSLETTER TEMPLATE =========================
export const newsletterTemplate: EmailTemplate = {
  id: 'newsletter',
  name: 'Newsletter',
  subject: '📰 {{newsletterTitle}} - {{date}}',
  htmlTemplate: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{newsletterTitle}}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
        .header .date { margin: 8px 0 0 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 30px; }
        .article { margin-bottom: 40px; padding-bottom: 30px; border-bottom: 1px solid #e5e7eb; }
        .article:last-child { border-bottom: none; margin-bottom: 0; }
        .article h2 { color: #1f2937; font-size: 20px; margin-bottom: 10px; }
        .article p { color: #6b7280; line-height: 1.6; margin-bottom: 15px; }
        .read-more { color: #3b82f6; text-decoration: none; font-weight: 600; }
        .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
        .footer a { color: #6b7280; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{newsletterTitle}}</h1>
            <div class="date">{{date}}</div>
        </div>
        <div class="content">
            <p style="color: #6b7280; font-size: 16px; margin-bottom: 30px;">{{introText}}</p>
            
            {{#articles}}
            <div class="article">
                <h2>{{title}}</h2>
                <p>{{excerpt}}</p>
                <a href="{{url}}" class="read-more">Read more →</a>
            </div>
            {{/articles}}
        </div>
        <div class="footer">
            <p>Thank you for subscribing to {{siteName}}!</p>
            <p><a href="{{unsubscribeUrl}}">Unsubscribe</a> | <a href="{{websiteUrl}}">Visit Website</a></p>
        </div>
    </div>
</body>
</html>`,
  textTemplate: `
{{newsletterTitle}} - {{date}}

{{introText}}

{{#articles}}
{{title}}
{{excerpt}}
Read more: {{url}}

{{/articles}}

---
Thank you for subscribing to {{siteName}}!
Unsubscribe: {{unsubscribeUrl}}
Visit Website: {{websiteUrl}}
`,
  variables: [
    { name: 'siteName', type: 'string', required: true, description: 'Name of the website/company' },
    { name: 'newsletterTitle', type: 'string', required: true, description: 'Newsletter title' },
    { name: 'date', type: 'date', required: true, description: 'Newsletter date' },
    { name: 'introText', type: 'string', required: false, description: 'Introduction text' },
    { name: 'articles', type: 'string', required: false, description: 'Array of articles' },
    { name: 'websiteUrl', type: 'url', required: true, description: 'Website URL' },
    { name: 'unsubscribeUrl', type: 'url', required: true, description: 'Unsubscribe URL' },
  ],
};

// ========================= UNSUBSCRIBE CONFIRMATION TEMPLATE =========================
export const unsubscribeTemplate: EmailTemplate = {
  id: 'unsubscribe-confirmation',
  name: 'Unsubscribe Confirmation',
  subject: '👋 You\'ve been unsubscribed from {{siteName}}',
  htmlTemplate: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unsubscribed</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 30px; text-align: center; }
        .content h2 { color: #1f2937; font-size: 24px; margin-bottom: 20px; }
        .content p { color: #6b7280; line-height: 1.6; margin-bottom: 20px; }
        .resubscribe-button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div style="padding: 40px 20px;">
        <div class="container">
            <div class="header">
                <h1>{{siteName}}</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">We'll miss you!</p>
            </div>
            <div class="content">
                <h2>👋 You've Been Unsubscribed</h2>
                <p>Hi {{firstName}},</p>
                <p>We've successfully unsubscribed your email address ({{email}}) from our newsletter.</p>
                <p>We're sorry to see you go! If you unsubscribed by mistake, you can resubscribe anytime:</p>
                <a href="{{resubscribeUrl}}" class="resubscribe-button">Resubscribe</a>
                <p style="margin-top: 30px;">
                    If you have any feedback about why you unsubscribed, we'd love to hear from you. 
                    Just reply to this email - your input helps us improve!
                </p>
                <p>Thank you for being part of our community.</p>
                <p>Best regards,<br>The {{siteName}} Team</p>
            </div>
            <div class="footer">
                <p>This is a confirmation that {{email}} has been unsubscribed.</p>
                <p><a href="{{websiteUrl}}">Visit Our Website</a></p>
            </div>
        </div>
    </div>
</body>
</html>`,
  textTemplate: `
You've Been Unsubscribed - {{siteName}}

Hi {{firstName}},

We've successfully unsubscribed your email address ({{email}}) from our newsletter.

We're sorry to see you go! If you unsubscribed by mistake, you can resubscribe anytime:
{{resubscribeUrl}}

If you have any feedback about why you unsubscribed, we'd love to hear from you. 
Just reply to this email - your input helps us improve!

Thank you for being part of our community.

Best regards,
The {{siteName}} Team

---
This is a confirmation that {{email}} has been unsubscribed.
Visit Our Website: {{websiteUrl}}
`,
  variables: [
    { name: 'siteName', type: 'string', required: true, description: 'Name of the website/company' },
    { name: 'firstName', type: 'string', required: false, defaultValue: 'there', description: 'Subscriber first name' },
    { name: 'email', type: 'string', required: true, description: 'Unsubscribed email address' },
    { name: 'resubscribeUrl', type: 'url', required: true, description: 'Resubscribe URL' },
    { name: 'websiteUrl', type: 'url', required: true, description: 'Website URL' },
  ],
};

// ========================= SILKSONG THEMED TEMPLATE =========================
export const silksongWelcomeTemplate: EmailTemplate = {
  id: 'silksong-welcome',
  name: 'Silksong Welcome Email',
  subject: '🦋 Welcome to the Hollow Knight: Silksong community!',
  htmlTemplate: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{siteName}}</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset and base styles */
        body, table, td, div, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        
        /* Main styles */
        body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #0a0a0f !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #e8e9ea;
            line-height: 1.6;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1a1a2e;
            box-shadow: 0 8px 32px rgba(139, 69, 19, 0.3);
        }
        
        .header {
            background: linear-gradient(135deg, #2a1810 0%, #16213e 50%, #0f3460 100%);
            padding: 30px 20px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
            animation: shimmer 3s ease-in-out infinite;
        }
        
        @keyframes shimmer {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.7; }
        }
        
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #ffd700;
            margin: 0;
            position: relative;
            z-index: 2;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .subtitle {
            color: #b8c5d1;
            font-size: 18px;
            margin: 10px 0 0 0;
            position: relative;
            z-index: 2;
        }
        
        .content {
            padding: 40px 20px;
            background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
        }
        
        .welcome-badge {
            display: inline-block;
            background: linear-gradient(135deg, #8b4513 0%, #cd853f 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 30px;
            border: 2px solid #ffd700;
            box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
        }
        
        .greeting {
            font-size: 24px;
            color: #ffd700;
            font-weight: bold;
            margin: 0 0 20px 0;
        }
        
        .main-text {
            color: #e8e9ea;
            font-size: 16px;
            margin-bottom: 25px;
        }
        
        .features-grid {
            display: table;
            width: 100%;
            margin: 30px 0;
        }
        
        .feature-row {
            display: table-row;
        }
        
        .feature-item {
            display: table-cell;
            padding: 15px 10px;
            vertical-align: top;
            width: 50%;
        }
        
        .feature-icon {
            display: inline-block;
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #8b4513 0%, #cd853f 100%);
            border-radius: 50%;
            text-align: center;
            line-height: 40px;
            font-size: 18px;
            margin-bottom: 10px;
            box-shadow: 0 2px 10px rgba(139, 69, 19, 0.4);
        }
        
        .feature-text {
            color: #b8c5d1;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .cta-section {
            text-align: center;
            margin: 40px 0;
            padding: 30px 20px;
            background: rgba(255, 215, 0, 0.05);
            border-radius: 12px;
            border: 1px solid rgba(255, 215, 0, 0.2);
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #8b4513 0%, #cd853f 100%);
            color: white;
            padding: 18px 40px;
            text-decoration: none;
            border-radius: 30px;
            font-weight: bold;
            font-size: 18px;
            margin: 10px;
            border: 2px solid #ffd700;
            box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4);
            transition: all 0.3s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(139, 69, 19, 0.6);
        }
        
        .secondary-cta {
            background: transparent;
            border: 2px solid #4a90e2;
            color: #4a90e2;
        }
        
        .social-section {
            text-align: center;
            margin: 30px 0;
        }
        
        .social-button {
            display: inline-block;
            margin: 0 10px;
            padding: 12px 20px;
            background: rgba(74, 144, 226, 0.1);
            color: #4a90e2;
            text-decoration: none;
            border-radius: 8px;
            font-size: 14px;
            border: 1px solid rgba(74, 144, 226, 0.3);
        }
        
        .footer {
            background: #0a0a0f;
            padding: 30px 20px;
            text-align: center;
            border-top: 1px solid rgba(255, 215, 0, 0.2);
        }
        
        .footer-text {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 15px;
        }
        
        .footer-links {
            margin-top: 20px;
        }
        
        .footer-link {
            color: #4a90e2;
            text-decoration: none;
            margin: 0 15px;
            font-size: 14px;
        }
        
        /* Mobile responsiveness */
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; }
            .header { padding: 20px 15px !important; }
            .content { padding: 30px 15px !important; }
            .logo { font-size: 28px !important; }
            .greeting { font-size: 20px !important; }
            .cta-button { padding: 16px 30px !important; font-size: 16px !important; }
            .features-grid { display: block !important; }
            .feature-item { display: block !important; width: 100% !important; margin-bottom: 20px; }
            .social-button { display: block !important; margin: 10px 0 !important; }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .main-text { color: #e8e9ea !important; }
            .footer-text { color: #9ca3af !important; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1 class="logo">🦋 {{siteName}}</h1>
            <p class="subtitle">Embrace the Silk and Song</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <div style="text-align: center;">
                <div class="welcome-badge">🌟 Welcome, Knight! 🌟</div>
            </div>
            
            <h2 class="greeting">Greetings, {{firstName}}!</h2>
            
            <p class="main-text">
                Your journey into the kingdom of Pharloom begins now! Thank you for joining our community of {{subscriberCount}} fellow knights eagerly awaiting the release of Hollow Knight: Silksong.
            </p>
            
            <p class="main-text">
                As a member of our community, you'll be the first to discover:
            </p>
            
            <!-- Features Grid -->
            <div class="features-grid">
                <div class="feature-row">
                    <div class="feature-item">
                        <div class="feature-icon">🗞️</div>
                        <div class="feature-text"><strong>Exclusive Updates</strong><br>Latest news, trailers, and development insights</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">🎮</div>
                        <div class="feature-text"><strong>Early Access</strong><br>Special previews and beta opportunities</div>
                    </div>
                </div>
                <div class="feature-row">
                    <div class="feature-item">
                        <div class="feature-icon">🏆</div>
                        <div class="feature-text"><strong>Community Events</strong><br>Contests, challenges, and exclusive content</div>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">💬</div>
                        <div class="feature-text"><strong>Knight Network</strong><br>Connect with fellow Silksong enthusiasts</div>
                    </div>
                </div>
            </div>
            
            <!-- Call-to-Action Section -->
            <div class="cta-section">
                <p style="color: #ffd700; font-size: 18px; font-weight: 600; margin-bottom: 20px;">
                    Ready to explore the kingdom?
                </p>
                <a href="{{websiteUrl}}" class="cta-button">🏰 Enter Pharloom</a>
                <br>
                <a href="{{websiteUrl}}/timeline" class="cta-button secondary-cta">📅 View Timeline</a>
            </div>
            
            <!-- Social Section -->
            <div class="social-section">
                <p style="color: #b8c5d1; margin-bottom: 20px;">Join the conversation:</p>
                <a href="{{websiteUrl}}/community" class="social-button">💬 Community</a>
                <a href="{{websiteUrl}}/updates" class="social-button">📢 Updates</a>
                <a href="{{websiteUrl}}/media" class="social-button">🎬 Media</a>
            </div>
            
            <p class="main-text" style="margin-top: 40px;">
                May your silk be strong and your song be true. The kingdom of Pharloom awaits!
            </p>
            
            <p style="color: #8b4513; font-style: italic; margin-top: 30px;">
                — Team Cherry & The Silksong Community
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                You're receiving this email because you subscribed to {{siteName}} updates.
            </p>
            <p class="footer-text">
                Email: {{email}} | Subscribed: {{subscribedDate}}
            </p>
            <div class="footer-links">
                <a href="{{websiteUrl}}" class="footer-link">🏰 Website</a>
                <a href="{{websiteUrl}}/preferences" class="footer-link">⚙️ Preferences</a>
                <a href="{{unsubscribeUrl}}" class="footer-link">🚪 Unsubscribe</a>
            </div>
        </div>
    </div>
</body>
</html>`,
  textTemplate: `
🦋 Welcome to {{siteName}}!

Greetings, {{firstName}}!

Your journey into the kingdom of Pharloom begins now! Thank you for joining our community of {{subscriberCount}} fellow knights eagerly awaiting the release of Hollow Knight: Silksong.

As a member of our community, you'll be the first to discover:

🗞️ Exclusive Updates - Latest news, trailers, and development insights
🎮 Early Access - Special previews and beta opportunities  
🏆 Community Events - Contests, challenges, and exclusive content
💬 Knight Network - Connect with fellow Silksong enthusiasts

Ready to explore the kingdom?
Visit: {{websiteUrl}}
Timeline: {{websiteUrl}}/timeline

Join the conversation:
Community: {{websiteUrl}}/community
Updates: {{websiteUrl}}/updates
Media: {{websiteUrl}}/media

May your silk be strong and your song be true. The kingdom of Pharloom awaits!

— Team Cherry & The Silksong Community

---
You're receiving this email because you subscribed to {{siteName}} updates.
Email: {{email}}

Website: {{websiteUrl}}
Unsubscribe: {{unsubscribeUrl}}
`,
  variables: [
    { name: 'siteName', type: 'string', required: true, description: 'Name of the website/company' },
    { name: 'firstName', type: 'string', required: false, defaultValue: 'Knight', description: 'Subscriber first name' },
    { name: 'subscriberCount', type: 'number', required: false, defaultValue: 1000, description: 'Total subscriber count' },
    { name: 'websiteUrl', type: 'url', required: true, description: 'Website URL' },
    { name: 'email', type: 'string', required: true, description: 'Subscriber email address' },
    { name: 'subscribedDate', type: 'date', required: false, description: 'Subscription date formatted' },
    { name: 'unsubscribeUrl', type: 'url', required: true, description: 'Unsubscribe URL' },
  ],
};

// ========================= SILKSONG CONFIRMATION TEMPLATE =========================
export const silksongConfirmationTemplate: EmailTemplate = {
  id: 'silksong-confirmation',
  name: 'Silksong Email Confirmation',
  subject: '🗡️ Confirm your subscription to Silksong updates',
  htmlTemplate: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your Subscription</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset and base styles */
        body, table, td, div, p, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        
        body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #0a0a0f !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #e8e9ea;
            line-height: 1.6;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1a1a2e;
            box-shadow: 0 8px 32px rgba(139, 69, 19, 0.3);
        }
        
        .header {
            background: linear-gradient(135deg, #2a1810 0%, #16213e 50%, #0f3460 100%);
            padding: 30px 20px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
            animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
        }
        
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #ffd700;
            margin: 0;
            position: relative;
            z-index: 2;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        .content {
            padding: 40px 20px;
            text-align: center;
            background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
        }
        
        .confirmation-icon {
            font-size: 64px;
            margin-bottom: 20px;
            animation: bounce 2s ease-in-out infinite;
        }
        
        @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
        }
        
        .main-heading {
            font-size: 28px;
            color: #ffd700;
            font-weight: bold;
            margin: 0 0 20px 0;
        }
        
        .main-text {
            color: #e8e9ea;
            font-size: 16px;
            margin-bottom: 25px;
            line-height: 1.6;
        }
        
        .email-display {
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #ffd700;
            font-weight: 600;
            font-size: 16px;
        }
        
        .confirm-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 20px 50px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            font-size: 20px;
            margin: 30px 0;
            border: 2px solid #34d399;
            box-shadow: 0 8px 30px rgba(16, 185, 129, 0.4);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .confirm-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 40px rgba(16, 185, 129, 0.6);
        }
        
        .confirm-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.6s;
        }
        
        .confirm-button:hover::before {
            left: 100%;
        }
        
        .urgency-text {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin: 30px 0;
            color: #f87171;
            font-size: 14px;
            font-weight: 500;
        }
        
        .help-section {
            margin-top: 40px;
            padding: 25px;
            background: rgba(74, 144, 226, 0.05);
            border-radius: 12px;
            border: 1px solid rgba(74, 144, 226, 0.2);
        }
        
        .footer {
            background: #0a0a0f;
            padding: 30px 20px;
            text-align: center;
            border-top: 1px solid rgba(255, 215, 0, 0.2);
        }
        
        .footer-text {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        /* Mobile responsiveness */
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; }
            .header, .content { padding: 20px 15px !important; }
            .logo { font-size: 28px !important; }
            .main-heading { font-size: 24px !important; }
            .confirm-button { 
                padding: 18px 40px !important; 
                font-size: 18px !important; 
                border-radius: 30px !important; 
            }
            .confirmation-icon { font-size: 48px !important; }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1 class="logo">🗡️ {{siteName}}</h1>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <div class="confirmation-icon">⚔️</div>
            <h2 class="main-heading">Confirm Your Quest</h2>
            
            <p class="main-text">
                Knight, your journey to Pharloom awaits confirmation!
            </p>
            
            <p class="main-text">
                We need to verify your email address to ensure you receive all the latest updates about Hollow Knight: Silksong.
            </p>
            
            <div class="email-display">
                📧 {{email}}
            </div>
            
            <a href="{{confirmUrl}}" class="confirm-button">
                ⚔️ Confirm & Join the Quest
            </a>
            
            <div class="urgency-text">
                🕐 This confirmation link expires in {{expiryHours}} hours.<br>
                Don't miss your chance to join the kingdom!
            </div>
            
            <div class="help-section">
                <h3 style="color: #4a90e2; margin-top: 0;">Having trouble?</h3>
                <p style="color: #b8c5d1; margin: 10px 0; font-size: 14px;">
                    If the button above doesn't work, copy and paste this link into your browser:
                </p>
                <div style="background: rgba(0, 0, 0, 0.3); padding: 10px; border-radius: 6px; word-break: break-all; font-size: 12px; color: #9ca3af; margin: 15px 0;">
                    {{confirmUrl}}
                </div>
                <p style="color: #b8c5d1; margin-bottom: 0; font-size: 14px;">
                    If you didn't subscribe to {{siteName}}, you can safely ignore this email.
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p class="footer-text">
                Need help? Contact us at {{supportEmail}}
            </p>
            <p class="footer-text">
                This confirmation expires on {{expiryDate}}
            </p>
        </div>
    </div>
</body>
</html>`,
  textTemplate: `
🗡️ Confirm Your Subscription to {{siteName}}

Knight, your journey to Pharloom awaits confirmation!

We need to verify your email address ({{email}}) to ensure you receive all the latest updates about Hollow Knight: Silksong.

Please click the following link to confirm your subscription:
{{confirmUrl}}

⏰ This confirmation link expires in {{expiryHours}} hours.

If you didn't subscribe to {{siteName}}, you can safely ignore this email.

Need help? Contact us at {{supportEmail}}
This confirmation expires on {{expiryDate}}
`,
  variables: [
    { name: 'siteName', type: 'string', required: true, description: 'Name of the website/company' },
    { name: 'email', type: 'string', required: true, description: 'Email address to confirm' },
    { name: 'confirmUrl', type: 'url', required: true, description: 'Confirmation URL with token' },
    { name: 'supportEmail', type: 'string', required: true, description: 'Support email address' },
    { name: 'expiryHours', type: 'number', required: false, defaultValue: 24, description: 'Hours until link expires' },
    { name: 'expiryDate', type: 'date', required: false, description: 'Expiry date formatted' },
  ],
};

// ========================= SILKSONG HTML FILE TEMPLATE =========================
import { SILKSONG_HTML_TEMPLATE } from './silksong-embedded';

// Use embedded template for reliability in all deployment environments
export const silksongHtmlTemplate: EmailTemplate = {
  id: 'silksong-welcome-html',
  name: 'Silksong Welcome (Embedded)',
  subject: '🎉 You\'re In – Silksong Tracking Activated',
  htmlTemplate: SILKSONG_HTML_TEMPLATE,
  variables: [
    { name: 'URL_HOME', type: 'url', required: true, description: 'Base URL of the website' },
    { name: 'URL_COMPARE', type: 'url', required: false, description: 'URL to the comparison page' },
    { name: 'URL_TIMELINE', type: 'url', required: false, description: 'URL to the timeline page' },
    { name: 'URL_EMBED', type: 'url', required: false, description: 'URL to embed tools' },
    { name: 'URL_CHECKLIST', type: 'url', required: false, description: 'URL to the checklist page' },
    { name: 'URL_DOCS_API', type: 'url', required: false, description: 'URL to API documentation' },
    { name: 'URL_EMBED_IFRAME', type: 'url', required: false, description: 'URL for countdown iframe embed' },
    { name: 'DAYS_REMAINING', type: 'number', required: true, description: 'Number of days remaining until release' },
    { name: 'URL_UNSUBSCRIBE', type: 'url', required: true, description: 'Unsubscribe URL' },
    { name: 'TRACKING_PIXEL_URL', type: 'url', required: false, description: 'Tracking pixel URL for analytics' },
    { name: 'YEAR', type: 'number', required: true, description: 'Current year' },
  ],
  metadata: {
    description: 'Silksong-themed welcome email template (embedded for deployment reliability)',
    category: 'embedded',
    created_at: new Date().toISOString(),
  },
};

// ========================= EXPORT ALL TEMPLATES =========================
export const defaultTemplates: EmailTemplate[] = [
  welcomeEmailTemplate,
  confirmationEmailTemplate,
  newsletterTemplate,
  unsubscribeTemplate,
  silksongWelcomeTemplate,
  silksongConfirmationTemplate,
  silksongHtmlTemplate,
];

export const getDefaultTemplate = (id: string): EmailTemplate | undefined => {
  return defaultTemplates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category?: string): EmailTemplate[] => {
  if (!category) return defaultTemplates;
  
  return defaultTemplates.filter(template => 
    template.metadata?.category === category
  );
};