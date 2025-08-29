/**
 * Silksong Email Template - Embedded Version
 * This is the embedded version of silksong.html for reliable deployment
 */

export const SILKSONG_HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en" style="margin:0;padding:0;">
<head>
  <meta charset="UTF-8">
  <title>Silksong Info Hub – Subscription Confirmed</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark light">
  <style>
    /* Reset and base styles for maximum email client compatibility */
    * { box-sizing: border-box; }
    body, table, td, div, p, h1, h2, h3 { margin: 0; padding: 0; }
    
    body {
      font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
      margin: 0;
      padding: 0;
      /* Dark theme with Hornet colors */
      background-color: #0a0a0a !important;
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(220, 38, 38, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(234, 88, 12, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(153, 27, 27, 0.08) 0%, transparent 50%);
      color: #f8fafc !important;
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      line-height: 1.6;
    }
    
    /* Main wrapper with sophisticated dark design */
    .wrapper { 
      max-width: 640px; 
      margin: 0 auto; 
      padding: 0;
      /* Professional dark gradient background */
      background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
      border: 1px solid #2d2d2d;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 
        0 20px 25px -5px rgba(0, 0, 0, 0.5),
        0 10px 10px -5px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }

    /* Banner image header */
    .banner-header {
      width: 100%;
      height: 200px;
      background-image: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%);
      position: relative;
      overflow: hidden;
    }
    .banner-header img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* Content padding */
    .content {
      padding: 32px 24px;
    }
    
    h1 { 
      font-size: 28px; 
      margin: 0 0 8px; 
      line-height: 1.2; 
      color: #f8fafc !important; 
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
      /* Clean, professional appearance without complex gradients */
      background: none;
      -webkit-text-fill-color: #f8fafc;
    }
    
    h2 { 
      font-size: 20px; 
      margin: 36px 0 16px; 
      color: #dc2626 !important; 
      font-weight: 600;
      text-shadow: 0 0 10px rgba(220, 38, 38, 0.5);
      position: relative;
    }
    h2:before {
      content: '';
      position: absolute;
      left: -12px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 20px;
      background: linear-gradient(to bottom, #dc2626, #991b1b);
      border-radius: 2px;
      box-shadow: 0 0 8px rgba(220, 38, 38, 0.6);
    }
    
    p { 
      line-height: 1.65; 
      margin: 0 0 16px; 
      font-size: 15px; 
      color: #e2e8f0 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }
    
    ul { 
      margin: 0 0 20px 20px; 
      padding: 0; 
    }
    
    li { 
      margin: 6px 0; 
      color: #e2e8f0 !important;
      position: relative;
    }
    /* Removed red arrow styling for cleaner numbered lists */
    li:before {
      content: '';
    }
    
    /* Clean numbered list styling */
    ol li {
      list-style-type: decimal;
      margin-left: 0;
    }
    
    /* Hornet-themed links */
    a { 
      color: #fb923c !important; 
      text-decoration: none; 
      font-weight: 500;
      text-shadow: 0 0 8px rgba(251, 146, 60, 0.4);
      transition: all 0.3s ease;
    }
    a:hover { 
      color: #ea580c !important;
      text-shadow: 0 0 12px rgba(234, 88, 12, 0.6);
      text-decoration: underline;
    }
    
    /* Sophisticated Hornet-themed buttons */
    .btn-row a {
      display: inline-block;
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%) !important;
      color: #f8fafc !important;
      font-weight: 600;
      padding: 14px 24px;
      border-radius: 12px;
      margin: 8px 12px 12px 0;
      font-size: 14px;
      text-decoration: none;
      border: 2px solid rgba(220, 38, 38, 0.3);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      box-shadow: 
        0 4px 12px rgba(220, 38, 38, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    }
    .btn-row a:before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s;
    }
    .btn-row a:hover {
      background: linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%) !important;
      transform: translateY(-2px);
      box-shadow: 
        0 8px 20px rgba(220, 38, 38, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      border-color: rgba(220, 38, 38, 0.6);
      color: #ffffff !important;
      text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
    }
    .btn-row a:hover:before {
      left: 100%;
    }
    
    /* Sophisticated dark panels with Hornet accents */
    .panel {
      background: linear-gradient(135deg, #1a1a1a 0%, #262626 100%) !important;
      border: 2px solid #404040 !important;
      padding: 24px;
      border-radius: 16px;
      margin: 28px 0;
      font-size: 15px;
      line-height: 1.7;
      color: #e2e8f0 !important;
      border-left: 6px solid #dc2626 !important;
      box-shadow: 
        0 8px 16px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
      position: relative;
    }
    .panel:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.3), transparent);
    }
    
    /* Enhanced alert panel */
    .panel-alert {
      background: linear-gradient(135deg, #2d1b1b 0%, #3d2626 100%) !important;
      border: 2px solid #5c3333 !important;
      border-left: 6px solid #dc2626 !important;
      color: #fecaca !important;
      box-shadow: 
        0 8px 16px rgba(220, 38, 38, 0.2),
        inset 0 1px 0 rgba(254, 202, 202, 0.1);
    }
    .panel-alert strong {
      color: #fca5a5 !important;
      text-shadow: 0 0 8px rgba(252, 165, 165, 0.4);
    }
    
    /* Professional dark code blocks */
    .code {
      font-family: ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;
      background: linear-gradient(135deg, #171717 0%, #262626 100%) !important;
      border: 2px solid #404040 !important;
      padding: 20px;
      border-radius: 12px;
      font-size: 13px;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.6;
      color: #f1f5f9 !important;
      border-left: 6px solid #fb923c !important;
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
      text-shadow: 0 1px 1px rgba(0, 0, 0, 0.5);
    }
    
    /* Elegant divider with Hornet theme */
    .divider { 
      height: 2px; 
      background: linear-gradient(90deg, transparent, #dc2626, #fb923c, #dc2626, transparent); 
      margin: 48px 0 36px; 
      border-radius: 1px;
      box-shadow: 0 0 8px rgba(220, 38, 38, 0.4);
    }
    
    /* Sophisticated footer */
    .footer {
      font-size: 13px; 
      color: #94a3b8 !important; 
      line-height: 1.7; 
      margin-top: 36px;
      padding: 24px;
      padding-top: 24px;
      border-top: 1px solid #404040;
      background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
      border-radius: 0 0 16px 16px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    }
    .footer a {
      color: #fb923c !important;
    }
    
    /* Enhanced subtitle styling */
    .subtitle {
      margin-top: -4px !important;
      color: #cbd5e1 !important;
      font-size: 16px !important;
      font-style: italic;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
    }
    
    .muted {
      color: #94a3b8 !important;
    }
    
    .small-muted {
      font-size: 13px !important;
      color: #94a3b8 !important;
    }
    
    /* Enhanced strong elements */
    strong {
      color: #f8fafc !important;
      font-weight: 600;
      text-shadow: 0 0 8px rgba(248, 250, 252, 0.3);
    }
    
    /* Hornet-themed accent colors */
    .accent-text {
      color: #fb923c !important;
      text-shadow: 0 0 8px rgba(251, 146, 60, 0.4);
    }
    
    /* Responsive design for mobile email clients */
    @media only screen and (max-width: 600px) {
      .wrapper {
        margin: 10px;
        border-radius: 12px;
      }
      .content {
        padding: 24px 20px !important;
      }
      .banner-header {
        height: 150px;
      }
      h1 {
        font-size: 24px !important;
      }
      h2 {
        font-size: 18px !important;
        margin: 28px 0 12px !important;
      }
      .btn-row a {
        display: block !important;
        margin: 10px 0 !important;
        text-align: center;
      }
      .code {
        font-size: 12px !important;
        padding: 16px !important;
      }
      .panel {
        padding: 20px !important;
      }
    }
    
    /* Outlook-specific fixes for dark theme */
    <!--[if mso]>
    <style type="text/css">
      body { background-color: #0a0a0a !important; }
      .wrapper { background-color: #0f0f0f !important; }
      h1, h2, p, li, strong { color: #f8fafc !important; }
      a { color: #fb923c !important; }
      .panel { background-color: #1a1a1a !important; }
      .code { background-color: #171717 !important; }
    </style>
    <![endif]-->
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Banner Header -->
    <div class="banner-header">
      <img src="{URL_HOME}/mobileBannerImage.jpg" alt="Hollow Knight: Silksong - Hornet" style="width:100%;height:100%;object-fit:cover;display:block;" />
    </div>
    
    <!-- Main Content -->
    <div class="content">
      <h1>🎉 You're In – Silksong Tracking Activated</h1>
      <p class="subtitle">
        Real-time differences, verified timeline, shareable countdown & open data — all now at your fingertips.
      </p>

      <div class="panel">
        <strong>Do one of these in the next 60 seconds (locks in engagement):</strong>
        <ol style="margin:12px 0 4px 20px;padding:0;list-style-type:decimal;">
          <li>Add the countdown embed to your profile / blog.</li>
          <li>Open the Differences Matrix & star the 3 features you're most hyped about (mentally counts!).</li>
          <li>Check off prep steps in the Checklist.</li>
        </ol>
      </div>

      <h2>Your Toolkit</h2>
      <p class="muted" style="margin-top:-4px;">Each feature is source-tagged (confirmed / hinted / tba) for credibility.</p>
      <div class="btn-row">
        <a href="{URL_COMPARE}" target="_blank" rel="noopener">Differences Matrix</a>
        <a href="{URL_TIMELINE}" target="_blank" rel="noopener">Timeline</a>
        <a href="{URL_EMBED}" target="_blank" rel="noopener">Countdown Embed</a>
        <a href="{URL_CHECKLIST}" target="_blank" rel="noopener">Checklist</a>
        <a href="{URL_DOCS_API}" target="_blank" rel="noopener">Open API</a>
      </div>

      <h2>Share Instantly</h2>
      <p>Copy one snippet, drop it in Discord / Twitter / group chat:</p>
      <div class="code">Silksong: {{DAYS_REMAINING}} days left! Real-time countdown + differences + timeline:
{URL_HOME}?ref=share</div>
      <p class="small-muted" style="margin-top:-4px;">DAYS_REMAINING is pre-rendered or resolves on visit.</p>

      <h2>Embed Countdown (paste anywhere)</h2>
      <div class="code">&lt;iframe src="{URL_EMBED_IFRAME}" width="360" height="140"
  style="border:0;" loading="lazy"
  title="Silksong Countdown"&gt;&lt;/iframe&gt;</div>
      <p class="small-muted" style="margin-top:-4px;">Supports theme=dark|light|auto, layout=compact, locale=en|zh.</p>

      <h2>What You'll Receive (No Spam)</h2>
      <ul>
        <li>Platform confirmations or reversals</li>
        <li>New / updated feature entries (with source)</li>
        <li>Timeline milestone additions</li>
        <li>Key countdown checkpoints (30 / 15 / 7 / 3 / 1 days)</li>
      </ul>

      <div class="panel panel-alert">
        <strong>Content creator / analyst?</strong><br>
        Use our JSON Differences & Timeline data to build overlays, charts or videos (credit appreciated). CSV export & extra endpoints coming soon.
      </div>

      <h2>Credibility & Transparency</h2>
      <p>Every item is tagged and source-attributed. Reply if you spot something missing — corrections get priority.</p>

      <h2>Roadmap Teasers</h2>
      <ul>
        <li>CSV export snapshots</li>
        <li>Additional OG visual themes</li>
        <li>More locales (community-driven)</li>
      </ul>

      <div class="divider"></div>

      <p class="muted">
        Not you? Ignore this — no further emails.<br>
        <a href="{URL_UNSUBSCRIBE}" target="_blank" rel="noopener">Unsubscribe any time</a>
      </p>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      Source Hub: <a href="{URL_HOME}" target="_blank" rel="noopener">{URL_HOME}</a><br>
      Data license: CC-BY attribution suggested (Differences / Timeline).<br>
      &copy; {YEAR} Silksong Info Hub
    </div>
    
    <img src="{TRACKING_PIXEL_URL}" alt="" width="1" height="1" style="display:none;">
  </div>
</body>
</html>`;