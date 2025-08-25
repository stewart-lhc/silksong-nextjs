# Email Subscription API Testing Guide

This guide provides comprehensive testing instructions for the `/api/subscribe` endpoint.

## Quick Status Check

The subscription API is **✅ FULLY FUNCTIONAL** and ready for use.

## API Endpoint

- **URL**: `POST /api/subscribe`
- **Content-Type**: `application/json`
- **Local Development**: `http://localhost:3004/api/subscribe` (port may vary)

## Request Format

```json
{
  "email": "user@example.com",
  "source": "web" // optional, defaults to "web"
}
```

## Response Formats

### Success (201 Created)
```json
{
  "success": true,
  "message": "Successfully subscribed!",
  "subscription": {
    "id": "uuid-here",
    "email": "user@example.com",
    "subscribed_at": "2025-08-24T10:46:32.62049+00:00"
  }
}
```

### Duplicate Email (409 Conflict)
```json
{
  "error": "Email already subscribed",
  "code": "ALREADY_SUBSCRIBED"
}
```

### Invalid Email (400 Bad Request)
```json
{
  "error": "Please enter a valid email address"
}
```

### Rate Limited (429 Too Many Requests)
```json
{
  "error": "Rate limit exceeded. Please wait before subscribing again.",
  "resetTime": 1756032831050
}
```

## Testing Methods

### 1. cURL Commands

#### Valid Subscription
```bash
curl -X POST "http://localhost:3004/api/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

#### Test Invalid Email
```bash
curl -X POST "http://localhost:3004/api/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email"}'
```

#### Test Duplicate Subscription
```bash
# Run this twice with the same email
curl -X POST "http://localhost:3004/api/subscribe" \
  -H "Content-Type: application/json" \
  -d '{"email":"duplicate@example.com"}'
```

#### Test Rate Limiting
```bash
# Run multiple times quickly
for i in {1..10}; do
  curl -X POST "http://localhost:3004/api/subscribe" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test$i@example.com\"}"
  sleep 0.1
done
```

### 2. Node.js Scripts

#### CLI Tool
```bash
# Single subscription
node scripts/subscribe-cli.js user@example.com

# Test invalid email
node scripts/subscribe-cli.js invalid-email
```

#### Comprehensive Test Suite
```bash
# Run all tests
node scripts/test-subscription-api.js
```

#### Database Verification
```bash
# Verify database setup
node scripts/verify-database.js
```

### 3. Browser Testing (Fetch API)

```javascript
// Valid subscription
fetch('/api/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com'
  })
})
.then(response => response.json())
.then(data => console.log(data));

// With error handling
async function subscribeEmail(email) {
  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Subscribed successfully!', data);
    } else {
      console.error('❌ Subscription failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}
```

## Rate Limiting

- **Window**: 15 minutes (900,000ms)
- **Max Requests**: 100 per IP per window
- **Duplicate Email Protection**: 60 seconds between same email attempts
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Validation Rules

### Email Validation
- ✅ Must be valid email format (RFC 5322 compliant)
- ✅ Maximum length: 254 characters
- ✅ Required field
- ✅ Case insensitive (automatically lowercase)
- ✅ Trimmed of whitespace

### Invalid Examples
- `invalid-email` (no @ or domain)
- `@example.com` (no local part)
- `test@` (no domain)
- `test@.com` (invalid domain)
- Empty string
- Very long emails (>254 characters)

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 201 | - | Success |
| 400 | - | Invalid request (validation failed) |
| 405 | - | Method not allowed (only POST allowed) |
| 409 | ALREADY_SUBSCRIBED | Email already exists |
| 429 | - | Rate limit exceeded |
| 500 | - | Internal server error |

## Database Schema

The `email_subscriptions` table has the following structure:

```sql
CREATE TABLE public.email_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security Features

- ✅ Row Level Security (RLS) enabled
- ✅ Service role authentication for API routes
- ✅ Rate limiting by IP address
- ✅ Input validation and sanitization
- ✅ Unique email constraint
- ✅ SQL injection protection (via Supabase)

## Monitoring

### Check Subscription Count
```bash
node scripts/verify-database.js
```

### View Recent Subscriptions (via Supabase Dashboard)
```sql
SELECT email, subscribed_at 
FROM email_subscriptions 
ORDER BY subscribed_at DESC 
LIMIT 10;
```

## Troubleshooting

### Common Issues

1. **"Failed to process subscription"**
   - Check Supabase connection
   - Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
   - Run `node scripts/verify-database.js`

2. **"Database configuration error: Table not found"**
   - Table doesn't exist in Supabase
   - Run the SQL schema creation commands

3. **Rate limiting too aggressive**
   - Adjust `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` in `.env.local`

4. **CORS errors**
   - Ensure proper origin headers in production
   - Check Next.js configuration

### Debug Mode

Set `DEBUG_API_CALLS=true` in `.env.local` to enable detailed logging.

## Production Considerations

1. **Environment Variables**
   - Set proper `NEXT_PUBLIC_APP_URL`
   - Use strong `SUPABASE_SERVICE_ROLE_KEY`
   - Configure appropriate rate limits

2. **Monitoring**
   - Monitor subscription rates
   - Set up alerts for failures
   - Track unique vs duplicate attempts

3. **Backup**
   - Regular database backups
   - Export subscription lists
   - Disaster recovery plan

4. **Performance**
   - Consider Redis for rate limiting in high-traffic scenarios
   - Database indexing on email field (already exists via UNIQUE)
   - CDN for static assets

## Support

If you encounter issues:

1. Run the verification script: `node scripts/verify-database.js`
2. Check the test suite: `node scripts/test-subscription-api.js`
3. Review server logs in development mode
4. Verify Supabase dashboard for RLS policies and data