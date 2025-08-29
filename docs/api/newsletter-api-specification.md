# Newsletter API Specification

## Overview

The Newsletter API provides a complete subscription management system with support for email subscriptions, unsubscriptions, and analytics. Built for Next.js App Router with TypeScript and designed for multiple database backends.

## Base URL

```
Production: https://your-domain.com/api/newsletter
Development: http://localhost:3000/api/newsletter
```

## Authentication

Most endpoints are public, but admin endpoints require authentication:
- **Admin endpoints**: Bearer token in Authorization header
- **Public endpoints**: No authentication required

## Rate Limiting

All endpoints implement rate limiting:
- **Window**: 15 minutes (900,000ms)
- **Limit**: 100 requests per IP per window
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Common Response Headers

```http
Content-Type: application/json
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
Cache-Control: no-store
```

## Error Format

All errors follow this consistent format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific field error (optional)"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/newsletter/subscribe"
}
```

## Endpoints

### 1. Subscribe to Newsletter

Subscribe an email address to the newsletter.

#### Request

```http
POST /api/newsletter/subscribe
Content-Type: application/json

{
  "email": "user@example.com",
  "source": "web",
  "tags": ["update", "release"],
  "metadata": {
    "referrer": "homepage",
    "campaign": "launch"
  }
}
```

#### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email address (max 254 chars) |
| `source` | string | No | Subscription source (default: "web") |
| `tags` | string[] | No | Optional tags for categorization |
| `metadata` | object | No | Additional metadata (max 1KB) |

#### Validation Rules

- **Email**: RFC 5322 compliant, lowercase, trimmed
- **Source**: Max 50 characters, alphanumeric + underscore
- **Tags**: Max 10 tags, each max 30 characters
- **Metadata**: Max 1024 bytes when JSON stringified

#### Success Response

```http
HTTP/1.1 201 Created
Content-Type: application/json
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99

{
  "success": true,
  "message": "Successfully subscribed!",
  "data": {
    "subscription": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "source": "web",
      "tags": ["update", "release"],
      "status": "active",
      "subscribed_at": "2024-01-01T00:00:00.000Z",
      "confirmed": false,
      "confirmation_token": "abc123xyz"
    }
  }
}
```

#### Error Responses

**400 Bad Request - Invalid Input**
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Please enter a valid email address"
  }
}
```

**409 Conflict - Already Subscribed**
```json
{
  "error": "Email already subscribed",
  "code": "ALREADY_SUBSCRIBED",
  "details": {
    "subscribed_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**429 Too Many Requests**
```json
{
  "error": "Rate limit exceeded. Please wait before subscribing again.",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "reset_time": 1640995200,
    "retry_after": 300
  }
}
```

---

### 2. Unsubscribe from Newsletter

Remove an email address from the newsletter.

#### Request

```http
POST /api/newsletter/unsubscribe
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "unsubscribe-token-123",
  "reason": "too_frequent",
  "feedback": "Getting too many emails"
}
```

#### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes* | Email address to unsubscribe |
| `token` | string | Yes* | Unsubscribe token from email |
| `reason` | string | No | Reason code for unsubscription |
| `feedback` | string | No | Optional feedback text |

*Either email or token is required, but token is preferred for security.

#### Reason Codes

- `too_frequent` - Too many emails
- `not_relevant` - Content not relevant
- `never_signed_up` - Never signed up
- `temporary` - Temporary unsubscribe
- `other` - Other reason

#### Success Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Successfully unsubscribed",
  "data": {
    "email": "user@example.com",
    "unsubscribed_at": "2024-01-01T00:00:00.000Z",
    "reason": "too_frequent",
    "can_resubscribe": true
  }
}
```

#### Error Responses

**404 Not Found**
```json
{
  "error": "Email not found in subscription list",
  "code": "EMAIL_NOT_FOUND"
}
```

**400 Bad Request**
```json
{
  "error": "Invalid unsubscribe token",
  "code": "INVALID_TOKEN"
}
```

---

### 3. Confirm Subscription

Confirm a pending email subscription.

#### Request

```http
POST /api/newsletter/confirm
Content-Type: application/json

{
  "token": "confirmation-token-123"
}
```

#### Success Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Subscription confirmed successfully",
  "data": {
    "email": "user@example.com",
    "confirmed_at": "2024-01-01T00:00:00.000Z",
    "status": "active"
  }
}
```

---

### 4. Get Newsletter Statistics

Retrieve subscription statistics and analytics data.

#### Request

```http
GET /api/newsletter/stats
Authorization: Bearer <admin-token>
```

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | string | Time period: `day`, `week`, `month`, `year` |
| `start_date` | string | Start date (ISO 8601) |
| `end_date` | string | End date (ISO 8601) |
| `group_by` | string | Group by: `day`, `week`, `month`, `source`, `tag` |

#### Success Response

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: public, max-age=300

{
  "success": true,
  "data": {
    "summary": {
      "total_subscriptions": 15420,
      "active_subscriptions": 14892,
      "unsubscribed": 485,
      "pending_confirmation": 43,
      "growth_rate": 12.5,
      "churn_rate": 3.2
    },
    "period_data": [
      {
        "period": "2024-01-01",
        "subscriptions": 125,
        "unsubscriptions": 8,
        "net_growth": 117
      }
    ],
    "sources": [
      {
        "source": "web",
        "count": 12450,
        "percentage": 80.8
      },
      {
        "source": "mobile_app",
        "count": 2970,
        "percentage": 19.2
      }
    ],
    "tags": [
      {
        "tag": "update",
        "count": 9800,
        "percentage": 63.5
      },
      {
        "tag": "release",
        "count": 7200,
        "percentage": 46.7
      }
    ]
  },
  "meta": {
    "period": "month",
    "start_date": "2024-01-01T00:00:00.000Z",
    "end_date": "2024-01-31T23:59:59.999Z",
    "total_records": 15420,
    "cache_expires_at": "2024-01-01T00:05:00.000Z"
  }
}
```

---

### 5. Bulk Operations

Perform bulk operations on subscriptions (Admin only).

#### Request

```http
POST /api/newsletter/bulk
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "operation": "subscribe",
  "emails": [
    "user1@example.com",
    "user2@example.com",
    "user3@example.com"
  ],
  "source": "import",
  "tags": ["imported"],
  "skip_confirmation": true
}
```

#### Operations

- `subscribe` - Bulk subscribe emails
- `unsubscribe` - Bulk unsubscribe emails
- `update_tags` - Update tags for multiple emails
- `export` - Export subscription data

#### Success Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "operation": "subscribe",
    "processed": 3,
    "successful": 2,
    "failed": 1,
    "results": [
      {
        "email": "user1@example.com",
        "status": "success",
        "id": "123e4567-e89b-12d3-a456-426614174000"
      },
      {
        "email": "user2@example.com",
        "status": "success",
        "id": "223e4567-e89b-12d3-a456-426614174001"
      },
      {
        "email": "user3@example.com",
        "status": "error",
        "error": "Email already subscribed"
      }
    ]
  }
}
```

---

## Database Schema

### Supabase/PostgreSQL Schema

```sql
-- Main subscriptions table
CREATE TABLE email_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(254) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'unsubscribed', 'bounced')),
  source VARCHAR(50) DEFAULT 'web',
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  confirmation_token VARCHAR(255),
  unsubscribe_token VARCHAR(255) DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unsubscription tracking
CREATE TABLE unsubscription_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(254) NOT NULL,
  reason VARCHAR(50),
  feedback TEXT,
  unsubscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Analytics and statistics
CREATE TABLE subscription_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  source VARCHAR(50),
  subscriptions_count INTEGER DEFAULT 0,
  unsubscriptions_count INTEGER DEFAULT 0,
  confirmations_count INTEGER DEFAULT 0,
  bounces_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX idx_email_subscriptions_status ON email_subscriptions(status);
CREATE INDEX idx_email_subscriptions_source ON email_subscriptions(source);
CREATE INDEX idx_email_subscriptions_subscribed_at ON email_subscriptions(subscribed_at);
CREATE INDEX idx_email_subscriptions_tags ON email_subscriptions USING GIN (tags);
CREATE INDEX idx_subscription_analytics_date_source ON subscription_analytics(date, source);
```

### MongoDB Schema

```javascript
// subscriptions collection
{
  _id: ObjectId,
  email: { type: String, required: true, unique: true, maxLength: 254 },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'unsubscribed', 'bounced'],
    default: 'pending'
  },
  source: { type: String, default: 'web', maxLength: 50 },
  tags: [{ type: String, maxLength: 30 }],
  metadata: { type: Object, default: {} },
  subscribedAt: { type: Date, default: Date.now },
  confirmedAt: Date,
  unsubscribedAt: Date,
  confirmationToken: String,
  unsubscribeToken: { type: String, default: () => generateToken() },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

// unsubscriptionLogs collection
{
  _id: ObjectId,
  email: { type: String, required: true },
  reason: String,
  feedback: String,
  unsubscribedAt: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String
}
```

## Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `ALREADY_SUBSCRIBED` | 409 | Email already subscribed |
| `EMAIL_NOT_FOUND` | 404 | Email not in subscription list |
| `INVALID_TOKEN` | 400 | Invalid confirmation/unsubscribe token |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## SDK Examples

### JavaScript/TypeScript SDK

```typescript
class NewsletterAPI {
  constructor(private baseUrl: string, private apiKey?: string) {}

  async subscribe(email: string, options?: SubscribeOptions): Promise<SubscriptionResponse> {
    const response = await fetch(`${this.baseUrl}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
      },
      body: JSON.stringify({ email, ...options })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new NewsletterAPIError(error.error, error.code, response.status);
    }

    return response.json();
  }

  async unsubscribe(emailOrToken: string, isToken = false): Promise<UnsubscribeResponse> {
    const body = isToken ? { token: emailOrToken } : { email: emailOrToken };
    
    const response = await fetch(`${this.baseUrl}/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    return response.json();
  }

  async getStats(options?: StatsOptions): Promise<StatsResponse> {
    const params = new URLSearchParams(options as any);
    const response = await fetch(`${this.baseUrl}/stats?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    return response.json();
  }
}
```

### cURL Examples

**Subscribe**
```bash
curl -X POST https://api.example.com/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "source": "landing_page",
    "tags": ["updates", "releases"]
  }'
```

**Unsubscribe**
```bash
curl -X POST https://api.example.com/newsletter/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{
    "token": "unsubscribe-token-123",
    "reason": "too_frequent"
  }'
```

**Get Statistics**
```bash
curl -X GET "https://api.example.com/newsletter/stats?period=month" \
  -H "Authorization: Bearer your-admin-token"
```

## Webhooks

The API can send webhooks for important events:

### Webhook Events

- `subscription.created` - New subscription
- `subscription.confirmed` - Subscription confirmed
- `subscription.unsubscribed` - User unsubscribed
- `subscription.bounced` - Email bounced

### Webhook Payload

```json
{
  "event": "subscription.created",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "status": "pending",
    "source": "web",
    "tags": ["updates"],
    "subscribed_at": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "signature": "sha256=abc123..."
}
```

## Migration Guide

### From Other Systems

The API provides migration endpoints to import existing subscriptions:

```http
POST /api/newsletter/migrate
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "source_system": "mailchimp",
  "data": [
    {
      "email": "user@example.com",
      "subscribed_at": "2023-01-01T00:00:00.000Z",
      "tags": ["imported"],
      "confirmed": true
    }
  ]
}
```

## Testing

### Test Environment

```
Base URL: https://api-staging.example.com/newsletter
Rate Limits: Disabled for testing
Test Email: test@example.com (always succeeds)
```

### Postman Collection

A complete Postman collection is available with:
- Pre-configured requests for all endpoints
- Environment variables for different stages
- Automated tests for response validation
- Example data for testing

Download: [newsletter-api.postman_collection.json](./postman/newsletter-api.postman_collection.json)

## Performance Considerations

- **Caching**: Statistics are cached for 5 minutes
- **Database Indexing**: Optimized for email lookups and date ranges
- **Rate Limiting**: Prevents abuse and ensures service stability
- **Bulk Operations**: Use bulk endpoints for large datasets
- **Pagination**: Large result sets are paginated (default 100 items)

## Security

- **Input Validation**: All inputs are validated and sanitized
- **SQL Injection**: Protected through parameterized queries
- **XSS Prevention**: JSON responses are properly encoded
- **CSRF Protection**: State-changing operations use POST/PUT/DELETE
- **Token Security**: Unsubscribe tokens are cryptographically secure
- **Rate Limiting**: Prevents brute force attacks

## Changelog

### Version 2.0.0 (Current)
- Added bulk operations
- Enhanced analytics with grouping
- Improved error messages
- Added webhook support
- Better TypeScript types

### Version 1.0.0
- Initial release
- Basic subscribe/unsubscribe
- Simple statistics
- Supabase integration