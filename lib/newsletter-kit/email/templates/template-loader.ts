/**
 * Template Loader for Email Templates
 * Loads and processes HTML email templates with placeholder replacement
 */

import fs from 'fs';
import path from 'path';

export interface TemplateVariables {
  URL_HOME?: string;
  URL_COMPARE?: string;
  URL_TIMELINE?: string;
  URL_EMBED?: string;
  URL_CHECKLIST?: string;
  URL_DOCS_API?: string;
  URL_EMBED_IFRAME?: string;
  URL_UNSUBSCRIBE?: string;
  DAYS_REMAINING?: string | number;
  YEAR?: string | number;
  TRACKING_PIXEL_URL?: string;
}

/**
 * Load and process the Silksong email template
 */
export function loadSilksongTemplate(variables: TemplateVariables): string {
  try {
    const templatePath = path.join(process.cwd(), 'lib', 'newsletter-kit', 'email', 'templates', 'silksong.html');
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }

    let template = fs.readFileSync(templatePath, 'utf-8');
    
    // Set default values
    const baseUrl = variables.URL_HOME || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const currentYear = new Date().getFullYear();
    
    const templateVars: Required<TemplateVariables> = {
      URL_HOME: baseUrl,
      URL_COMPARE: variables.URL_COMPARE || `${baseUrl}/compare-hollow-knight`,
      URL_TIMELINE: variables.URL_TIMELINE || `${baseUrl}/timeline`,
      URL_EMBED: variables.URL_EMBED || `${baseUrl}/tools/embed`,
      URL_CHECKLIST: variables.URL_CHECKLIST || `${baseUrl}/checklist`,
      URL_DOCS_API: variables.URL_DOCS_API || `${baseUrl}/developers`,
      URL_EMBED_IFRAME: variables.URL_EMBED_IFRAME || `${baseUrl}/embed/countdown`,
      URL_UNSUBSCRIBE: variables.URL_UNSUBSCRIBE || `${baseUrl}/unsubscribe`,
      DAYS_REMAINING: variables.DAYS_REMAINING || calculateDaysRemaining(),
      YEAR: variables.YEAR || currentYear,
      TRACKING_PIXEL_URL: variables.TRACKING_PIXEL_URL || `${baseUrl}/api/track/email?t=${Date.now()}`
    };

    // Replace all template variables
    Object.entries(templateVars).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      template = template.replace(regex, String(value));
      
      // Also handle double braces format for DAYS_REMAINING
      if (key === 'DAYS_REMAINING') {
        const doubleBraceRegex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(doubleBraceRegex, String(value));
      }
    });

    return template;

  } catch (error) {
    console.error('Error loading Silksong template:', error);
    throw new Error(`Failed to load email template: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
 * Generate text version from template variables (fallback for plain text emails)
 */
export function generateTextContent(variables: TemplateVariables): string {
  const baseUrl = variables.URL_HOME || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const daysRemaining = variables.DAYS_REMAINING || calculateDaysRemaining();
  
  return `
🎉 You're In – Silksong Tracking Activated

Real-time differences, verified timeline, shareable countdown & open data — all now at your fingertips.

Do one of these in the next 60 seconds (locks in engagement):
1. Add the countdown embed to your profile / blog.
2. Open the Differences Matrix & star the 3 features you're most hyped about (mentally counts!).
3. Check off prep steps in the Checklist.

Your Toolkit:
Each feature is source-tagged (confirmed / hinted / tba) for credibility.

• Differences Matrix: ${variables.URL_COMPARE || `${baseUrl}/compare-hollow-knight`}
• Timeline: ${variables.URL_TIMELINE || `${baseUrl}/timeline`}
• Countdown Embed: ${variables.URL_EMBED || `${baseUrl}/tools/embed`}
• Checklist: ${variables.URL_CHECKLIST || `${baseUrl}/checklist`}
• Open API: ${variables.URL_DOCS_API || `${baseUrl}/developers`}

Share Instantly:
Copy one snippet, drop it in Discord / Twitter / group chat:
Silksong: ${daysRemaining} days left! Real-time countdown + differences + timeline: ${baseUrl}?ref=share

What You'll Receive (No Spam):
• Platform confirmations or reversals
• New / updated feature entries (with source)
• Timeline milestone additions  
• Key countdown checkpoints (30 / 15 / 7 / 3 / 1 days)

Content creator / analyst?
Use our JSON Differences & Timeline data to build overlays, charts or videos (credit appreciated). CSV export & extra endpoints coming soon.

Credibility & Transparency:
Every item is tagged and source-attributed. Reply if you spot something missing — corrections get priority.

Not you? Ignore this — no further emails.
Unsubscribe any time: ${variables.URL_UNSUBSCRIBE || `${baseUrl}/unsubscribe`}

Source Hub: ${baseUrl}
Data license: CC-BY attribution suggested (Differences / Timeline).
© ${variables.YEAR || new Date().getFullYear()} Silksong Info Hub
  `.trim();
}