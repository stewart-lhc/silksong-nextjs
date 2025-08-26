# Server-Side Email Subscription Implementation

## Overview

The email subscription functionality has been updated to use **server-side API calls** instead of direct client-side Supabase calls for improved security and control.

## Architecture

### Before (Client-Side)
```
Browser → Supabase Client → Supabase Database
```
- Used public Supabase anon key
- Direct database access from browser
- Limited server-side control

### After (Server-Side)
```
Browser → Next.js API Route → Supabase Server Client → Supabase Database
```
- API keys hidden on server
- Better validation and error handling
- Full server-side control
- Rate limiting and security features

## API Endpoints

### GET /api/subscriptions
- **Purpose**: Get current subscription count
- **Response**: `{ count: number, timestamp: string }`
- **Caching**: 5 minutes public cache
- **Rate Limiting**: Applied

### POST /api/subscriptions
- **Purpose**: Subscribe with email
- **Request**: `{ email: string }`
- **Response**: `{ success: boolean, message: string, count: number, subscription: object }`
- **Features**:
  - Email validation and sanitization
  - Duplicate detection (409 status)
  - Rate limiting
  - Updated subscription count

## Components Updated

### `hooks/use-supabase-query-simplified.ts`
- ✅ Now uses `fetch()` to call API endpoints
- ✅ Proper error handling for HTTP status codes
- ✅ Maintains same interface for components

### `components/optimized-hero-section.tsx`
- ✅ Now uses `useEmailSubscription` hook instead of fake logic
- ✅ Real API calls to server
- ✅ Proper error handling with toast notifications
- ✅ Shows actual subscriber count

## Environment Setup

Required environment variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Silk Song Archive
```

## Testing

### Manual Testing
1. Start the development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Try subscribing with an email
4. Check browser network tab for API calls

### Automated Testing
```bash
npm run test:api
```

This script tests:
- ✅ GET subscription count
- ✅ POST new subscription
- ✅ Duplicate email handling
- ✅ Invalid email validation
- ✅ Count updates correctly

## Security Features

### Rate Limiting
- **Window**: 15 minutes (configurable)
- **Max Requests**: 100 per IP (configurable)
- **Headers**: `X-RateLimit-*` headers included

### Input Validation
- **Email Format**: RFC-compliant regex validation
- **Length Limits**: 254 characters max
- **Sanitization**: Trim and lowercase

### Error Handling
- **Duplicate Emails**: 409 Conflict status
- **Invalid Input**: 400 Bad Request status  
- **Rate Limits**: 429 Too Many Requests status
- **Server Errors**: 500 Internal Server Error status

## Database Schema

The subscription uses the `email_subscriptions` table:

```sql
CREATE TABLE email_subscriptions (
  id SERIAL PRIMARY KEY,
  email VARCHAR(254) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RPC function for getting count
CREATE OR REPLACE FUNCTION get_subscription_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM email_subscriptions);
END;
$$ LANGUAGE plpgsql;
```

## Benefits of Server-Side Approach

### Security
- ✅ API keys not exposed to browser
- ✅ Server-side validation and sanitization
- ✅ Rate limiting protection
- ✅ Better audit logging

### Performance  
- ✅ Response caching
- ✅ Optimized database queries
- ✅ Reduced client-side bundle size

### Maintainability
- ✅ Centralized business logic
- ✅ Easier to modify validation rules
- ✅ Better error handling
- ✅ Comprehensive logging

## Troubleshooting

### Common Issues

**1. Environment Variables Not Set**
```
Error: Invalid Supabase URL format
```
Solution: Ensure `.env.local` exists with proper Supabase credentials.

**2. Database Connection Issues**
```
Error: Failed to fetch subscription count
```
Solution: Check Supabase project status and credentials.

**3. Rate Limiting Triggered**
```
Status: 429 - Rate limit exceeded
```
Solution: Wait for rate limit window to reset or adjust limits.

### Debug Mode

Enable API debugging:
```env
DEBUG_API_CALLS=true
```

This will log detailed information about API calls and responses.