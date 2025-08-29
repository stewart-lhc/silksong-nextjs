/**
 * Silksong Email Template - Gmail Optimized Version
 * Simplified for maximum compatibility with Gmail's restrictive HTML rendering
 */

export const SILKSONG_GMAIL_TEMPLATE = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Silksong Info Hub – Subscription Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0a0a;">
  <!-- Gmail-compatible table structure -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <!-- Main container table -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #1a1a1a; border-radius: 16px; border: 1px solid #333333; max-width: 600px;">
          
          <!-- Banner Header -->
          <tr>
            <td style="padding: 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 0; background-color: #000000; text-align: center; height: 200px;">
                    <img src="{URL_HOME}/mobileBannerImage.jpg" alt="Hollow Knight: Silksong - Hornet" style="width: 100%; height: 200px; display: block; border: 0; object-fit: cover;">
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <!-- Title -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom: 16px;">
                    <h1 style="margin: 0; font-size: 28px; color: #f8fafc; font-weight: bold; text-align: left; font-family: Arial, sans-serif;">
                      🎉 You're In – Silksong Tracking Activated
                    </h1>
                    <p style="margin: 8px 0 0 0; font-size: 16px; color: #cbd5e1; font-style: italic; font-family: Arial, sans-serif;">
                      Real-time differences, verified timeline, shareable countdown & open data — all now at your fingertips.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Engagement Panel -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td style="background-color: #262626; border: 2px solid #404040; border-left: 6px solid #dc2626; padding: 24px; border-radius: 16px;">
                    <p style="margin: 0 0 12px 0; font-weight: bold; color: #f8fafc; font-size: 15px; font-family: Arial, sans-serif;">
                      Do one of these in the next 60 seconds (locks in engagement):
                    </p>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="color: #e2e8f0; font-size: 15px; padding: 4px 0; font-family: Arial, sans-serif;">
                          1. Add the countdown embed to your profile / blog.
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #e2e8f0; font-size: 15px; padding: 4px 0; font-family: Arial, sans-serif;">
                          2. Open the Differences Matrix & star the 3 features you're most hyped about (mentally counts!).
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #e2e8f0; font-size: 15px; padding: 4px 0; font-family: Arial, sans-serif;">
                          3. Check off prep steps in the Checklist.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Your Toolkit Section -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 36px 0 16px 0;">
                <tr>
                  <td>
                    <h2 style="margin: 0; font-size: 20px; color: #dc2626; font-weight: 600; font-family: Arial, sans-serif;">
                      Your Toolkit
                    </h2>
                    <p style="margin: 4px 0 16px 0; color: #94a3b8; font-size: 14px; font-family: Arial, sans-serif;">
                      Each feature is source-tagged (confirmed / hinted / tba) for credibility.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Button Row -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 8px 8px 8px 0;">
                    <a href="{URL_COMPARE}" style="display: inline-block; background-color: #dc2626; color: #f8fafc; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; font-family: Arial, sans-serif;">
                      Differences Matrix
                    </a>
                  </td>
                  <td style="padding: 8px;">
                    <a href="{URL_TIMELINE}" style="display: inline-block; background-color: #dc2626; color: #f8fafc; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; font-family: Arial, sans-serif;">
                      Timeline
                    </a>
                  </td>
                  <td style="padding: 8px;">
                    <a href="{URL_EMBED}" style="display: inline-block; background-color: #dc2626; color: #f8fafc; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; font-family: Arial, sans-serif;">
                      Countdown Embed
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 8px 8px 0;">
                    <a href="{URL_CHECKLIST}" style="display: inline-block; background-color: #dc2626; color: #f8fafc; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; font-family: Arial, sans-serif;">
                      Checklist
                    </a>
                  </td>
                  <td style="padding: 8px;">
                    <a href="{URL_DOCS_API}" style="display: inline-block; background-color: #dc2626; color: #f8fafc; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; font-family: Arial, sans-serif;">
                      Open API
                    </a>
                  </td>
                  <td></td>
                </tr>
              </table>
              
              <!-- Share Section -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 36px 0 16px 0;">
                <tr>
                  <td>
                    <h2 style="margin: 0; font-size: 20px; color: #dc2626; font-weight: 600; font-family: Arial, sans-serif;">
                      Share Instantly
                    </h2>
                    <p style="margin: 4px 0 12px 0; color: #e2e8f0; font-size: 15px; font-family: Arial, sans-serif;">
                      Copy one snippet, drop it in Discord / Twitter / group chat:
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Code Block -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="background-color: #262626; border: 2px solid #404040; border-left: 6px solid #fb923c; padding: 20px; border-radius: 12px;">
                    <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 13px; color: #f1f5f9; line-height: 1.6;">
                      Silksong: {{DAYS_REMAINING}} days left! Real-time countdown + differences + timeline:<br>
                      {URL_HOME}?ref=share
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 24px 0; color: #94a3b8; font-size: 13px; font-family: Arial, sans-serif;">
                DAYS_REMAINING is pre-rendered or resolves on visit.
              </p>
              
              <!-- Embed Section -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 36px 0 16px 0;">
                <tr>
                  <td>
                    <h2 style="margin: 0; font-size: 20px; color: #dc2626; font-weight: 600; font-family: Arial, sans-serif;">
                      Embed Countdown (paste anywhere)
                    </h2>
                  </td>
                </tr>
              </table>
              
              <!-- Embed Code Block -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="background-color: #262626; border: 2px solid #404040; border-left: 6px solid #fb923c; padding: 20px; border-radius: 12px;">
                    <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 13px; color: #f1f5f9; line-height: 1.6;">
                      &lt;iframe src="{URL_EMBED_IFRAME}" width="360" height="140"<br>
                      &nbsp;&nbsp;style="border:0;" loading="lazy"<br>
                      &nbsp;&nbsp;title="Silksong Countdown"&gt;&lt;/iframe&gt;
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 24px 0; color: #94a3b8; font-size: 13px; font-family: Arial, sans-serif;">
                Supports theme=dark|light|auto, layout=compact, locale=en|zh.
              </p>
              
              <!-- What You'll Receive Section -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 36px 0 16px 0;">
                <tr>
                  <td>
                    <h2 style="margin: 0; font-size: 20px; color: #dc2626; font-weight: 600; font-family: Arial, sans-serif;">
                      What You'll Receive (No Spam)
                    </h2>
                  </td>
                </tr>
              </table>
              
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="color: #e2e8f0; font-size: 15px; padding: 4px 0; font-family: Arial, sans-serif;">
                    • Platform confirmations or reversals
                  </td>
                </tr>
                <tr>
                  <td style="color: #e2e8f0; font-size: 15px; padding: 4px 0; font-family: Arial, sans-serif;">
                    • New / updated feature entries (with source)
                  </td>
                </tr>
                <tr>
                  <td style="color: #e2e8f0; font-size: 15px; padding: 4px 0; font-family: Arial, sans-serif;">
                    • Timeline milestone additions
                  </td>
                </tr>
                <tr>
                  <td style="color: #e2e8f0; font-size: 15px; padding: 4px 0; font-family: Arial, sans-serif;">
                    • Key countdown checkpoints (30 / 15 / 7 / 3 / 1 days)
                  </td>
                </tr>
              </table>
              
              <!-- Content Creator Alert -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td style="background-color: #3d2626; border: 2px solid #5c3333; border-left: 6px solid #dc2626; padding: 24px; border-radius: 16px;">
                    <p style="margin: 0; color: #fecaca; font-size: 15px; font-family: Arial, sans-serif;">
                      <strong style="color: #fca5a5;">Content creator / analyst?</strong><br>
                      Use our JSON Differences & Timeline data to build overlays, charts or videos (credit appreciated). CSV export & extra endpoints coming soon.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Other Sections -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 36px 0 16px 0;">
                <tr>
                  <td>
                    <h2 style="margin: 0; font-size: 20px; color: #dc2626; font-weight: 600; font-family: Arial, sans-serif;">
                      Credibility & Transparency
                    </h2>
                    <p style="margin: 4px 0 16px 0; color: #e2e8f0; font-size: 15px; font-family: Arial, sans-serif;">
                      Every item is tagged and source-attributed. Reply if you spot something missing — corrections get priority.
                    </p>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 36px 0 16px 0;">
                <tr>
                  <td>
                    <h2 style="margin: 0; font-size: 20px; color: #dc2626; font-weight: 600; font-family: Arial, sans-serif;">
                      Roadmap Teasers
                    </h2>
                  </td>
                </tr>
              </table>
              
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 32px 0;">
                <tr>
                  <td style="color: #e2e8f0; font-size: 15px; padding: 4px 0; font-family: Arial, sans-serif;">
                    • CSV export snapshots
                  </td>
                </tr>
                <tr>
                  <td style="color: #e2e8f0; font-size: 15px; padding: 4px 0; font-family: Arial, sans-serif;">
                    • Additional OG visual themes
                  </td>
                </tr>
                <tr>
                  <td style="color: #e2e8f0; font-size: 15px; padding: 4px 0; font-family: Arial, sans-serif;">
                    • More locales (community-driven)
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
                <tr>
                  <td style="height: 2px; background-color: #dc2626;"></td>
                </tr>
              </table>
              
              <!-- Unsubscribe -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin: 0; color: #94a3b8; font-size: 14px; font-family: Arial, sans-serif;">
                      Not you? Ignore this — no further emails.<br>
                      <a href="{URL_UNSUBSCRIBE}" style="color: #fb923c; text-decoration: none;">Unsubscribe any time</a>
                    </p>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f0f0f; padding: 24px; border-top: 1px solid #404040;">
              <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center; font-family: Arial, sans-serif;">
                Source Hub: <a href="{URL_HOME}" style="color: #fb923c; text-decoration: none;">{URL_HOME}</a><br>
                Data license: CC-BY attribution suggested (Differences / Timeline).<br>
                &copy; {YEAR} Silksong Info Hub
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
  
  <!-- Tracking Pixel -->
  <img src="{TRACKING_PIXEL_URL}" alt="" width="1" height="1" style="display: none;">
</body>
</html>`;