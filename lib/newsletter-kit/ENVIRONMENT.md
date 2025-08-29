# Newsletter Kit - Environment Configuration

This guide explains how to configure environment variables to enable email sending functionality in your Newsletter Kit implementation.

## Required Environment Variables

### Email Provider Configuration

The Newsletter Kit supports multiple email providers. Configure the following variables based on your chosen provider:

#### Resend (Recommended)
```bash
# Email provider
EMAIL_PROVIDER=resend

# Resend API configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Email sender configuration
FROM_EMAIL=newsletter@yourdomain.com
FROM_NAME="Your Site Name"
REPLY_TO_EMAIL=support@yourdomain.com
```

#### SendGrid (Alternative)
```bash
# Email provider
EMAIL_PROVIDER=sendgrid

# SendGrid API configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email sender configuration
FROM_EMAIL=newsletter@yourdomain.com
FROM_NAME="Your Site Name"
REPLY_TO_EMAIL=support@yourdomain.com
```

#### Nodemailer SMTP (Alternative)
```bash
# Email provider
EMAIL_PROVIDER=nodemailer

# SMTP configuration
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=newsletter@yourdomain.com
SMTP_PASS=your-smtp-password

# Email sender configuration
FROM_EMAIL=newsletter@yourdomain.com
FROM_NAME="Your Site Name"
REPLY_TO_EMAIL=support@yourdomain.com
```

### Application Configuration

```bash
# Base URL for your application (for generating unsubscribe links)
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Database configuration (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Email Provider Setup Guides

### Setting up Resend

1. **Sign up for Resend**
   - Go to [resend.com](https://resend.com)
   - Create an account and verify your email

2. **Add your domain**
   - In the Resend dashboard, go to "Domains"
   - Add your domain and follow the DNS verification steps
   - Wait for domain verification (usually takes a few minutes)

3. **Generate API Key**
   - Go to "API Keys" in the dashboard
   - Click "Create API Key"
   - Give it a name like "Newsletter Kit"
   - Copy the generated key and add it to your `.env.local`:
   ```bash
   RESEND_API_KEY=re_your_api_key_here
   ```

4. **Configure sender email**
   - Use an email from your verified domain:
   ```bash
   FROM_EMAIL=newsletter@yourdomain.com
   FROM_NAME="Your Site Name"
   ```

### Setting up SendGrid

1. **Sign up for SendGrid**
   - Go to [sendgrid.com](https://sendgrid.com)
   - Create an account (free tier available)

2. **Verify sender identity**
   - Go to "Settings" → "Sender Authentication"
   - Verify either a single sender email or your entire domain

3. **Generate API Key**
   - Go to "Settings" → "API Keys"
   - Click "Create API Key"
   - Choose "Restricted Access" and give it mail sending permissions
   - Copy the generated key:
   ```bash
   SENDGRID_API_KEY=SG.your_api_key_here
   ```

### Setting up SMTP (Nodemailer)

If you have an existing SMTP server (Gmail, Outlook, custom server):

1. **Get SMTP credentials from your email provider**
   - **Gmail**: Enable 2FA and create an App Password
   - **Outlook**: Use your regular credentials or App Password
   - **Custom SMTP**: Get details from your hosting provider

2. **Configure environment variables**:
   ```bash
   EMAIL_PROVIDER=nodemailer
   SMTP_HOST=smtp.gmail.com  # or your SMTP server
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

## Local Development Setup

Create a `.env.local` file in your project root:

```bash
# Copy this template and fill in your values

# Email Configuration (Choose one provider)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key_here

# Email Sender Info
FROM_EMAIL=newsletter@yourdomain.com
FROM_NAME="Your Site Name"
REPLY_TO_EMAIL=support@yourdomain.com

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database (Supabase example)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Production Deployment

### Vercel
1. Go to your Vercel project dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add all the required variables listed above
4. Redeploy your application

### Netlify
1. Go to your site dashboard
2. Navigate to "Site settings" → "Environment variables"
3. Add all the required variables
4. Redeploy your application

### Other Platforms
Check your hosting provider's documentation for how to set environment variables.

## Testing Email Configuration

You can test your email configuration by:

1. **Using the API endpoint**:
   ```bash
   curl -X GET http://localhost:3000/api/newsletter/send-welcome
   ```

2. **Using the Newsletter Test Page**:
   Navigate to `/newsletter-test` in your application to see configuration status and test email sending.

3. **Checking the email service status**:
   ```javascript
   import { getEmailServiceStatus } from '@/lib/newsletter-kit/email/service';
   
   const status = getEmailServiceStatus();
   console.log('Email service status:', status);
   ```

## Troubleshooting

### Common Issues

1. **"Email service not configured"**
   - Check that your API key environment variable is set correctly
   - Ensure you're using the correct variable name for your provider
   - Restart your development server after adding environment variables

2. **"Domain not verified"**
   - For Resend/SendGrid: Make sure your domain is verified in the provider dashboard
   - Use an email address from your verified domain in `FROM_EMAIL`

3. **SMTP connection errors**
   - Verify SMTP server details (host, port, security settings)
   - Check if your email provider requires app passwords (Gmail, Outlook)
   - Ensure firewall/network allows SMTP connections

4. **Emails not being sent**
   - Check application logs for error messages
   - Verify the API key has the correct permissions
   - Test with a simple email first

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will show detailed error messages in the console.

## Security Best Practices

1. **Never commit API keys to version control**
   - Use `.env.local` for local development
   - Add `.env.local` to your `.gitignore`

2. **Use environment-specific keys**
   - Different API keys for development/staging/production
   - Restrict API key permissions to only what's needed

3. **Validate email addresses**
   - The Newsletter Kit includes built-in email validation
   - Block disposable email domains (already implemented)

4. **Rate limiting**
   - Email sending is automatically rate limited
   - Configure limits based on your provider's restrictions

## Email Provider Comparison

| Provider | Free Tier | Setup Difficulty | Features |
|----------|-----------|------------------|----------|
| **Resend** | 3,000/month | Easy | Modern API, great developer experience |
| **SendGrid** | 100/day | Medium | Established, many features, complex interface |
| **Nodemailer** | Depends on SMTP | Medium | Works with any SMTP, requires server setup |

**Recommendation**: Start with Resend for the easiest setup and best developer experience.