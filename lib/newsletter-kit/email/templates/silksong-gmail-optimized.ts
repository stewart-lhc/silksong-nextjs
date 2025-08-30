/**
 * Gmail-Optimized Silksong Email Template
 * Uses inline styles and table layout for maximum email client compatibility
 */

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
 * Calculate days remaining until Silksong release
 */
function calculateDaysRemaining(): number {
  const releaseDate = new Date('2025-09-04T14:00:00Z');
  const now = new Date();
  const timeDiff = releaseDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  return Math.max(0, daysRemaining);
}

/**
 * Generate Gmail-optimized Silksong email template with inline styles
 */
export function generateSilksongTemplate(variables: TemplateVariables): string {
  const baseUrl = variables.URL_HOME || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const daysRemaining = variables.DAYS_REMAINING || calculateDaysRemaining();
  const currentYear = variables.YEAR || new Date().getFullYear();
  
  // Banner image URL (tracking disabled in email service)
  const bannerImageUrl = `${baseUrl}/mobileBannerImage.jpg`;

  const templateVars = {
    URL_HOME: baseUrl,
    URL_COMPARE: variables.URL_COMPARE || `${baseUrl}/compare-hollow-knight`,
    URL_TIMELINE: variables.URL_TIMELINE || `${baseUrl}/timeline`,
    URL_EMBED: variables.URL_EMBED || `${baseUrl}/tools/embed`,
    URL_CHECKLIST: variables.URL_CHECKLIST || `${baseUrl}/checklist`,
    URL_DOCS_API: variables.URL_DOCS_API || `${baseUrl}/developers`,
    URL_EMBED_IFRAME: variables.URL_EMBED_IFRAME || `${baseUrl}/embed/countdown`,
    URL_UNSUBSCRIBE: variables.URL_UNSUBSCRIBE || `${baseUrl}/unsubscribe`,
    DAYS_REMAINING: daysRemaining,
    YEAR: currentYear,
    TRACKING_PIXEL_URL: variables.TRACKING_PIXEL_URL || `${baseUrl}/api/track/email?t=${Date.now()}`
  };

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>🎉 You're In – Silksong Tracking Activated</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0 !important; padding: 0 !important; background-color: #0a0a0a !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important; -webkit-text-size-adjust: 100% !important; -ms-text-size-adjust: 100% !important;">

  <!-- Main container table -->
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #0a0a0a; margin: 0; padding: 0;">
    <tr>
      <td align="center" valign="top" style="padding: 20px 10px; background-color: #0a0a0a;">
        
        <!-- Email content wrapper -->
        <table cellpadding="0" cellspacing="0" border="0" width="640" style="max-width: 640px; margin: 0 auto; background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%); border: 1px solid #2d2d2d; border-radius: 16px; overflow: hidden;">
          
          <!-- Banner Header -->
          <tr>
            <td style="padding: 0; position: relative;">
              <div style="width: 100%; height: 200px; position: relative; overflow: hidden; background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%);">
                <a href="${templateVars.URL_HOME}" target="_blank" rel="noopener" style="display: block; width: 100%; height: 100%; text-decoration: none;">
                  <img src="${bannerImageUrl}" alt="Hollow Knight: Silksong - Hornet" style="width: 100%; height: 200px; object-fit: cover; display: block; border: none; outline: none;">
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 24px; color: #f8fafc;">
              
              <!-- Title -->
              <h1 style="margin: 0 0 8px 0; font-size: 28px; line-height: 1.2; color: #f8fafc !important; font-weight: 700; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6); background: none; -webkit-text-fill-color: #f8fafc;">
                🎉 You're In – Silksong Tracking Activated
              </h1>
              
              <!-- Subtitle -->
              <p style="margin: -4px 0 16px 0; color: #cbd5e1 !important; font-size: 16px; font-style: italic; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);">
                Real-time differences, verified timeline, shareable countdown & open data — all now at your fingertips.
              </p>

              <!-- Engagement Panel -->
              <div style="background: linear-gradient(135deg, #1a1a1a 0%, #262626 100%); border: 2px solid #404040; padding: 24px; border-radius: 16px; margin: 28px 0; font-size: 15px; line-height: 1.7; color: #e2e8f0; border-left: 6px solid #dc2626; position: relative;">
                <div style="position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.3), transparent);"></div>
                <strong style="color: #f8fafc; font-weight: 600; text-shadow: 0 0 8px rgba(248, 250, 252, 0.3);">Do one of these in the next 60 seconds (locks in engagement):</strong>
                <ol style="margin: 12px 0 4px 20px; padding: 0; list-style-type: decimal; color: #e2e8f0;">
                  <li style="margin: 6px 0; color: #e2e8f0;">Add the countdown embed to your profile / blog.</li>
                  <li style="margin: 6px 0; color: #e2e8f0;">Open the Differences Matrix & star the 3 features you're most hyped about (mentally counts!).</li>
                  <li style="margin: 6px 0; color: #e2e8f0;">Check off prep steps in the Checklist.</li>
                </ol>
              </div>

              <!-- Toolkit Section -->
              <h2 style="font-size: 20px; margin: 36px 0 16px; color: #dc2626 !important; font-weight: 600; text-shadow: 0 0 10px rgba(220, 38, 38, 0.5); position: relative; padding-left: 12px;">
                <span style="position: absolute; left: -12px; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background: linear-gradient(to bottom, #dc2626, #991b1b); border-radius: 2px; content: '';"></span>
                Your Toolkit
              </h2>
              <p style="line-height: 1.65; margin: -4px 0 16px; font-size: 15px; color: #94a3b8; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);">
                Each feature is source-tagged (confirmed / hinted / tba) for credibility.
              </p>
              
              <!-- Button Row -->
              <div style="margin: 20px 0;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding: 0 12px 12px 0;">
                      <a href="${templateVars.URL_COMPARE}" target="_blank" rel="noopener" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #f8fafc !important; font-weight: 600; padding: 14px 24px; border-radius: 12px; font-size: 14px; text-decoration: none; border: 2px solid rgba(220, 38, 38, 0.3); text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);">Differences Matrix</a>
                    </td>
                    <td style="padding: 0 12px 12px 0;">
                      <a href="${templateVars.URL_TIMELINE}" target="_blank" rel="noopener" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #f8fafc !important; font-weight: 600; padding: 14px 24px; border-radius: 12px; font-size: 14px; text-decoration: none; border: 2px solid rgba(220, 38, 38, 0.3); text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);">Timeline</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 12px 12px 0;">
                      <a href="${templateVars.URL_EMBED}" target="_blank" rel="noopener" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #f8fafc !important; font-weight: 600; padding: 14px 24px; border-radius: 12px; font-size: 14px; text-decoration: none; border: 2px solid rgba(220, 38, 38, 0.3); text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);">Countdown Embed</a>
                    </td>
                    <td style="padding: 0 12px 12px 0;">
                      <a href="${templateVars.URL_CHECKLIST}" target="_blank" rel="noopener" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #f8fafc !important; font-weight: 600; padding: 14px 24px; border-radius: 12px; font-size: 14px; text-decoration: none; border: 2px solid rgba(220, 38, 38, 0.3); text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);">Checklist</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 12px 12px 0;">
                      <a href="${templateVars.URL_DOCS_API}" target="_blank" rel="noopener" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: #f8fafc !important; font-weight: 600; padding: 14px 24px; border-radius: 12px; font-size: 14px; text-decoration: none; border: 2px solid rgba(220, 38, 38, 0.3); text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);">Open API</a>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Share Section -->
              <h2 style="font-size: 20px; margin: 36px 0 16px; color: #dc2626 !important; font-weight: 600; text-shadow: 0 0 10px rgba(220, 38, 38, 0.5);">Share Instantly</h2>
              <p style="line-height: 1.65; margin: 0 0 16px; font-size: 15px; color: #e2e8f0; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);">Copy one snippet, drop it in Discord / Twitter / group chat:</p>
              
              <!-- Code Block -->
              <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace; background: linear-gradient(135deg, #171717 0%, #262626 100%); border: 2px solid #404040; padding: 20px; border-radius: 12px; font-size: 13px; white-space: pre-wrap; word-break: break-word; line-height: 1.6; color: #f1f5f9; border-left: 6px solid #fb923c; text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);">Silksong: ${daysRemaining} days left! Real-time countdown + differences + timeline:
${templateVars.URL_HOME}?ref=share</div>
              
              <p style="line-height: 1.65; margin: -4px 0 16px; font-size: 13px; color: #94a3b8; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);">DAYS_REMAINING is pre-rendered or resolves on visit.</p>

              <!-- Embed Section -->
              <h2 style="font-size: 20px; margin: 36px 0 16px; color: #dc2626 !important; font-weight: 600; text-shadow: 0 0 10px rgba(220, 38, 38, 0.5);">Embed Countdown (paste anywhere)</h2>
              <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace; background: linear-gradient(135deg, #171717 0%, #262626 100%); border: 2px solid #404040; padding: 20px; border-radius: 12px; font-size: 13px; white-space: pre-wrap; word-break: break-word; line-height: 1.6; color: #f1f5f9; border-left: 6px solid #fb923c; text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);">&lt;iframe src="${templateVars.URL_EMBED_IFRAME}" width="360" height="140"
  style="border:0;" loading="lazy"
  title="Silksong Countdown"&gt;&lt;/iframe&gt;</div>
              <p style="line-height: 1.65; margin: -4px 0 16px; font-size: 13px; color: #94a3b8; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);">Supports theme=dark|light|auto, layout=compact, locale=en|zh.</p>

              <!-- What You'll Receive -->
              <h2 style="font-size: 20px; margin: 36px 0 16px; color: #dc2626 !important; font-weight: 600; text-shadow: 0 0 10px rgba(220, 38, 38, 0.5);">What You'll Receive (No Spam)</h2>
              <ul style="margin: 0 0 20px 20px; padding: 0;">
                <li style="margin: 6px 0; color: #e2e8f0;">Platform confirmations or reversals</li>
                <li style="margin: 6px 0; color: #e2e8f0;">New / updated feature entries (with source)</li>
                <li style="margin: 6px 0; color: #e2e8f0;">Timeline milestone additions</li>
                <li style="margin: 6px 0; color: #e2e8f0;">Key countdown checkpoints (30 / 15 / 7 / 3 / 1 days)</li>
              </ul>

              <!-- Alert Panel -->
              <div style="background: linear-gradient(135deg, #2d1b1b 0%, #3d2626 100%); border: 2px solid #5c3333; border-left: 6px solid #dc2626; color: #fecaca; padding: 24px; border-radius: 16px; margin: 28px 0;">
                <strong style="color: #fca5a5; text-shadow: 0 0 8px rgba(252, 165, 165, 0.4);">Content creator / analyst?</strong><br>
                Use our JSON Differences & Timeline data to build overlays, charts or videos (credit appreciated). CSV export & extra endpoints coming soon.
              </div>

              <!-- Credibility Section -->
              <h2 style="font-size: 20px; margin: 36px 0 16px; color: #dc2626 !important; font-weight: 600; text-shadow: 0 0 10px rgba(220, 38, 38, 0.5);">Credibility & Transparency</h2>
              <p style="line-height: 1.65; margin: 0 0 16px; font-size: 15px; color: #e2e8f0; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);">Every item is tagged and source-attributed. Reply if you spot something missing — corrections get priority.</p>

              <!-- Roadmap -->
              <h2 style="font-size: 20px; margin: 36px 0 16px; color: #dc2626 !important; font-weight: 600; text-shadow: 0 0 10px rgba(220, 38, 38, 0.5);">Roadmap Teasers</h2>
              <ul style="margin: 0 0 20px 20px; padding: 0;">
                <li style="margin: 6px 0; color: #e2e8f0;">CSV export snapshots</li>
                <li style="margin: 6px 0; color: #e2e8f0;">Additional OG visual themes</li>
                <li style="margin: 6px 0; color: #e2e8f0;">More locales (community-driven)</li>
              </ul>

              <!-- Divider -->
              <div style="height: 2px; background: linear-gradient(90deg, transparent, #dc2626, #fb923c, #dc2626, transparent); margin: 48px 0 36px; border-radius: 1px;"></div>

              <!-- Unsubscribe -->
              <p style="line-height: 1.65; margin: 0 0 16px; font-size: 15px; color: #94a3b8; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);">
                Not you? Ignore this — no further emails.<br>
                <a href="${templateVars.URL_UNSUBSCRIBE}" target="_blank" rel="noopener" style="color: #fb923c !important; text-decoration: none; font-weight: 500; text-shadow: 0 0 8px rgba(251, 146, 60, 0.4);">Unsubscribe any time</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="font-size: 13px; color: #94a3b8; line-height: 1.7; margin-top: 36px; padding: 24px; border-top: 1px solid #404040; background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%); border-radius: 0 0 16px 16px; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8); text-align: center;">
              Source Hub: <a href="${templateVars.URL_HOME}" target="_blank" rel="noopener" style="color: #fb923c !important; text-decoration: none; font-weight: 500;">${templateVars.URL_HOME}</a><br>
              Data license: CC-BY attribution suggested (Differences / Timeline).<br>
              &copy; ${templateVars.YEAR} Silksong Info Hub
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
  <!-- Tracking Pixel -->
  <img src="${templateVars.TRACKING_PIXEL_URL}" alt="" width="1" height="1" style="display: none;">
  
</body>
</html>`;
}

/**
 * Generate text version for email clients that don't support HTML
 */
export function generateTextContent(variables: TemplateVariables): string {
  const baseUrl = variables.URL_HOME || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const daysRemaining = variables.DAYS_REMAINING || calculateDaysRemaining();
  const currentYear = variables.YEAR || new Date().getFullYear();
  
  return `🎉 You're In – Silksong Tracking Activated

Real-time differences, verified timeline, shareable countdown & open data — all now at your fingertips.

Do one of these in the next 60 seconds (locks in engagement):
1. Add the countdown embed to your profile / blog.
2. Open the Differences Matrix & star the 3 features you're most hyped about (mentally counts!).
3. Check off prep steps in the Checklist.

Your Toolkit:
Each feature is source-tagged (confirmed / hinted / tba) for credibility.

• Differences Matrix: ${baseUrl}/compare-hollow-knight
• Timeline: ${baseUrl}/timeline
• Countdown Embed: ${baseUrl}/tools/embed
• Checklist: ${baseUrl}/checklist
• Open API: ${baseUrl}/developers

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

Roadmap Teasers:
• CSV export snapshots
• Additional OG visual themes
• More locales (community-driven)

Not you? Ignore this — no further emails.
Unsubscribe any time: ${baseUrl}/unsubscribe

Source Hub: ${baseUrl}
Data license: CC-BY attribution suggested (Differences / Timeline).
© ${currentYear} Silksong Info Hub`;
}