# Newsletter API Implementation Guide

This guide provides comprehensive instructions for implementing the Newsletter API in your Next.js application.

## Quick Start

### 1. Database Setup

First, set up your database schema using the provided SQL file:

```bash
# For Supabase/PostgreSQL
psql -h your-db-host -U your-username -d your-database -f database-setup/newsletter-enhanced-schema.sql
```

### 2. Environment Variables

Add the required environment variables to your `.env.local`:

```env
# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Features
ENABLE_ANALYTICS=true
ENABLE_DOUBLE_OPT_IN=true

# Authentication (for admin endpoints)
NEXTAUTH_SECRET=your-auth-secret
API_ADMIN_TOKEN=your-admin-token
```

### 3. Install Dependencies

The API uses these key dependencies (already in your project):

```bash
npm install @supabase/supabase-js zod
```

### 4. API Routes

The API routes are already implemented in:
- `/app/api/newsletter/subscribe/route.ts`
- `/app/api/newsletter/unsubscribe/route.ts` 
- `/app/api/newsletter/stats/route.ts`

## Implementation Details

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │───▶│   API Routes    │───▶│   Database      │
│                 │    │                 │    │                 │
│ - Forms         │    │ - Validation    │    │ - Supabase      │
│ - Components    │    │ - Rate Limiting │    │ - PostgreSQL    │
│ - SDK           │    │ - Authentication│    │ - Analytics     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Components

#### 1. Request Validation

All endpoints use Zod for request validation:

```typescript
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email().max(254),
  source: z.string().max(50).optional().default('web'),
  tags: z.array(z.string().max(30)).max(10).optional(),
  metadata: z.record(z.any()).optional(),
});
```

#### 2. Rate Limiting

In-memory rate limiting with configurable limits:

```typescript
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string) {
  const now = Date.now();
  const windowMs = rateLimit.windowMs;
  const maxRequests = rateLimit.maxRequests;
  
  // Implementation logic...
}
```

#### 3. Database Operations

Type-safe database operations using Supabase client:

```typescript
const { data, error } = await supabaseAdmin
  .from('email_subscriptions')
  .insert([subscriptionData])
  .select();
```

## Custom Implementation

### For Different Database Systems

#### MongoDB Implementation

```typescript
import { MongoClient, Db } from 'mongodb';

class MongoNewsletterService {
  constructor(private db: Db) {}

  async subscribe(data: CreateSubscriptionData) {
    const collection = this.db.collection('subscriptions');
    
    try {
      const result = await collection.insertOne({
        ...data,
        _id: new ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      return { success: true, id: result.insertedId };
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Email already subscribed');
      }
      throw error;
    }
  }

  async unsubscribe(email: string) {
    const collection = this.db.collection('subscriptions');
    
    const result = await collection.updateOne(
      { email, status: 'active' },
      { 
        $set: { 
          status: 'unsubscribed', 
          unsubscribedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );
    
    return result.modifiedCount > 0;
  }
}
```

#### MySQL/Prisma Implementation

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class PrismaNewsletterService {
  async subscribe(data: CreateSubscriptionData) {
    try {
      const subscription = await prisma.subscription.create({
        data: {
          ...data,
          status: 'pending',
          unsubscribeToken: generateToken(),
        },
      });
      
      return { success: true, subscription };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Email already subscribed');
      }
      throw error;
    }
  }

  async getStats(filters: StatsFilters) {
    const [total, active, unsubscribed] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.subscription.count({ where: { status: 'unsubscribed' } }),
    ]);

    return { total, active, unsubscribed };
  }
}
```

### Authentication Implementation

#### JWT-based Authentication

```typescript
import jwt from 'jsonwebtoken';

function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }
  
  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    
    // Check if user has admin role
    return payload.role === 'admin';
  } catch {
    return false;
  }
}
```

#### API Key Authentication

```typescript
function verifyApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key');
  const validKeys = process.env.API_KEYS?.split(',') || [];
  
  return apiKey && validKeys.includes(apiKey);
}
```

### Rate Limiting Strategies

#### Redis-based Rate Limiting

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

async function checkRateLimitRedis(identifier: string) {
  const key = `rate_limit:${identifier}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, Math.ceil(rateLimit.windowMs / 1000));
  }
  
  return {
    allowed: current <= rateLimit.maxRequests,
    remaining: Math.max(0, rateLimit.maxRequests - current),
    resetTime: Date.now() + (await redis.ttl(key)) * 1000,
  };
}
```

#### Distributed Rate Limiting with Upstash

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "15 m"),
});

async function checkRateLimitUpstash(identifier: string) {
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
  
  return {
    allowed: success,
    remaining,
    resetTime: reset,
    limit,
  };
}
```

## Advanced Features

### Webhook Implementation

```typescript
// app/api/newsletter/webhook/route.ts
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('x-webhook-signature');
  
  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex');
    
  if (signature !== `sha256=${expectedSignature}`) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const event = JSON.parse(payload);
  
  // Handle webhook events
  switch (event.type) {
    case 'subscription.created':
      await handleSubscriptionCreated(event.data);
      break;
    case 'subscription.unsubscribed':
      await handleUnsubscription(event.data);
      break;
  }
  
  return NextResponse.json({ received: true });
}
```

### Email Integration

#### Sending Confirmation Emails

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendConfirmationEmail(subscription: Subscription) {
  const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/confirm?token=${subscription.confirmation_token}`;
  
  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: subscription.email,
    subject: 'Confirm your newsletter subscription',
    html: `
      <h2>Welcome!</h2>
      <p>Click the link below to confirm your subscription:</p>
      <a href="${confirmUrl}">Confirm Subscription</a>
    `,
  });
}
```

#### Unsubscribe Email Links

```typescript
function generateUnsubscribeUrl(subscription: Subscription): string {
  return `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${subscription.unsubscribe_token}`;
}

// Include in all newsletter emails
const unsubscribeUrl = generateUnsubscribeUrl(subscription);
const emailFooter = `
  <p style="font-size: 12px; color: #666;">
    <a href="${unsubscribeUrl}">Unsubscribe</a> from this newsletter
  </p>
`;
```

### Analytics and Reporting

#### Custom Analytics Queries

```typescript
// app/api/newsletter/analytics/custom/route.ts
export async function POST(request: NextRequest) {
  const { query, params } = await request.json();
  
  // Validate admin access
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Execute custom analytics query
  const result = await supabaseAdmin.rpc(query, params);
  
  return NextResponse.json({ data: result.data });
}
```

#### Real-time Statistics

```typescript
// Real-time subscription updates
export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(async () => {
        const stats = await getRealtimeStats();
        controller.enqueue(`data: ${JSON.stringify(stats)}\n\n`);
      }, 5000);
      
      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

## Performance Optimization

### Caching Strategies

#### Response Caching

```typescript
import { unstable_cache } from 'next/cache';

const getCachedStats = unstable_cache(
  async (period: string) => {
    return await fetchStatsFromDB(period);
  },
  ['newsletter-stats'],
  { revalidate: 300 } // 5 minutes
);
```

#### Database Query Optimization

```sql
-- Add database indexes for performance
CREATE INDEX CONCURRENTLY idx_email_subscriptions_status_subscribed_at 
  ON email_subscriptions(status, subscribed_at DESC);

CREATE INDEX CONCURRENTLY idx_email_subscriptions_source_status 
  ON email_subscriptions(source, status);

-- Analyze query performance
EXPLAIN ANALYZE SELECT COUNT(*) 
FROM email_subscriptions 
WHERE status = 'active' 
  AND subscribed_at >= NOW() - INTERVAL '30 days';
```

### Background Jobs

#### Processing Subscriptions

```typescript
// lib/queue.ts
import Queue from 'bull';

const emailQueue = new Queue('email processing', process.env.REDIS_URL!);

emailQueue.process('send-confirmation', async (job) => {
  const { subscription } = job.data;
  await sendConfirmationEmail(subscription);
});

// Add job after subscription
export async function queueConfirmationEmail(subscription: Subscription) {
  await emailQueue.add('send-confirmation', { subscription }, {
    delay: 2000, // 2 second delay
    attempts: 3,
    backoff: 'exponential',
  });
}
```

## Security Best Practices

### Input Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}
```

### SQL Injection Prevention

Always use parameterized queries:

```typescript
// ✅ Good - parameterized query
const { data } = await supabase
  .from('email_subscriptions')
  .select('*')
  .eq('email', userEmail);

// ❌ Bad - string interpolation (if using raw SQL)
// const query = `SELECT * FROM subscriptions WHERE email = '${userEmail}'`;
```

### Rate Limiting by User Context

```typescript
function getRateLimitKey(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const userAgent = request.headers.get('user-agent');
  const ip = forwardedFor?.split(',')[0] || 'unknown';
  
  // Consider user context for rate limiting
  return `${ip}:${hashString(userAgent || 'unknown')}`;
}
```

## Testing

### Unit Tests

```typescript
// __tests__/api/subscribe.test.ts
import { POST } from '@/app/api/newsletter/subscribe/route';

describe('/api/newsletter/subscribe', () => {
  test('should subscribe valid email', async () => {
    const request = new Request('http://localhost:3000/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    
    const response = await POST(request as any);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data.subscription.email).toBe('test@example.com');
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/newsletter-flow.test.ts
describe('Newsletter Full Flow', () => {
  test('complete subscription flow', async () => {
    // 1. Subscribe
    const subscribeResponse = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'integration@example.com' }),
    });
    
    expect(subscribeResponse.status).toBe(201);
    const subscribeData = await subscribeResponse.json();
    
    // 2. Confirm subscription
    const confirmResponse = await fetch('/api/newsletter/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: subscribeData.data.subscription.confirmation_token }),
    });
    
    expect(confirmResponse.status).toBe(200);
    
    // 3. Check stats
    const statsResponse = await fetch('/api/newsletter/stats', {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    
    expect(statsResponse.status).toBe(200);
    const statsData = await statsResponse.json();
    expect(statsData.data.summary.total_subscriptions).toBeGreaterThan(0);
  });
});
```

## Deployment Considerations

### Environment-Specific Configuration

```typescript
// config/newsletter.ts
export const newsletterConfig = {
  development: {
    rateLimit: { windowMs: 60000, maxRequests: 10 },
    enableAnalytics: true,
    enableWebhooks: false,
  },
  staging: {
    rateLimit: { windowMs: 900000, maxRequests: 50 },
    enableAnalytics: true,
    enableWebhooks: true,
  },
  production: {
    rateLimit: { windowMs: 900000, maxRequests: 100 },
    enableAnalytics: true,
    enableWebhooks: true,
  },
};
```

### Monitoring and Logging

```typescript
import { logger } from '@/lib/logger';

// Add structured logging
logger.info('Subscription created', {
  email: subscription.email,
  source: subscription.source,
  timestamp: new Date().toISOString(),
  requestId: request.headers.get('x-request-id'),
});
```

### Health Checks

```typescript
// app/api/newsletter/health/route.ts
export async function GET() {
  try {
    // Check database connectivity
    const { data, error } = await supabaseAdmin
      .from('email_subscriptions')
      .select('id')
      .limit(1);
    
    if (error) throw error;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      database: 'connected',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
```

## Troubleshooting

### Common Issues

1. **Rate Limit False Positives**
   - Use user-specific identifiers beyond IP
   - Implement exponential backoff
   - Consider authenticated vs anonymous limits

2. **Database Connection Issues**
   - Implement connection pooling
   - Add retry logic with exponential backoff
   - Monitor connection counts

3. **Memory Leaks in Rate Limiting**
   - Regular cleanup of expired entries
   - Use Redis for distributed setups
   - Monitor memory usage

### Debug Mode

```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Request:', {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.clone().text(),
  });
}
```

This implementation guide provides a solid foundation for building and scaling your Newsletter API. Adjust the implementations based on your specific requirements and infrastructure.