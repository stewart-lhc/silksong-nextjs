# API改进方案

## 实施计划

基于API设计分析，以下是具体的改进实施方案，保留现有优秀实现的同时补充必要功能。

## 1. 统一API响应格式

### 新增类型定义

```typescript
// types/api.ts
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

export interface APIError {
  message: string;
  code: string;
  details?: string;
  field?: string; // 用于表单验证错误
}

// 特定响应类型
export interface StatusResponse {
  releaseDate: string;
  serverTime: string;
  isReleased: boolean;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  };
  timeline: {
    lastUpdate: string;
    itemCount: number;
  };
  version: string;
  etag: string;
}

export interface SubscriptionResponse {
  count: number;
  subscription?: {
    id: string;
    email: string;
    subscribedAt: string;
  };
}
```

### API响应辅助函数

```typescript
// lib/api-helpers.ts
import { NextResponse } from 'next/server';
import type { APIResponse, APIError } from '@/types/api';
import { env } from '@/lib/env';

export function createAPIResponse<T>(
  data?: T,
  options: {
    status?: number;
    headers?: Record<string, string>;
    requestId?: string;
  } = {}
): NextResponse<APIResponse<T>> {
  const { status = 200, headers = {}, requestId } = options;

  const response: APIResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: env.NEXT_PUBLIC_APP_VERSION,
      requestId,
    },
  };

  return NextResponse.json(response, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-API-Version': env.NEXT_PUBLIC_APP_VERSION,
      ...(requestId && { 'X-Request-ID': requestId }),
      ...headers,
    },
  });
}

export function createAPIError(
  error: APIError,
  status: number = 400,
  requestId?: string
): NextResponse<APIResponse<never>> {
  const response: APIResponse<never> = {
    success: false,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      version: env.NEXT_PUBLIC_APP_VERSION,
      requestId,
    },
  };

  return NextResponse.json(response, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-API-Version': env.NEXT_PUBLIC_APP_VERSION,
      ...(requestId && { 'X-Request-ID': requestId }),
    },
  });
}

// 预定义错误类型
export const API_ERRORS = {
  INVALID_EMAIL: {
    code: 'INVALID_EMAIL',
    message: 'Please enter a valid email address',
  },
  ALREADY_SUBSCRIBED: {
    code: 'ALREADY_SUBSCRIBED',
    message: 'This email is already subscribed',
  },
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.',
  },
  SUBSCRIPTION_DISABLED: {
    code: 'SUBSCRIPTION_DISABLED',
    message: 'Email subscriptions are currently disabled',
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: 'An internal server error occurred',
  },
  TIMELINE_LOAD_FAILED: {
    code: 'TIMELINE_LOAD_FAILED',
    message: 'Failed to load timeline data',
  },
} as const;
```

## 2. 实现 `/api/status` 端点

```typescript
// app/api/status/route.ts
import { NextRequest } from 'next/server';
import { createAPIResponse, createAPIError, API_ERRORS } from '@/lib/api-helpers';
import type { StatusResponse } from '@/types/api';
import { env } from '@/lib/env';
import { createHash } from 'crypto';
import timelineData from '@/data/timeline.json';

const RELEASE_DATE = '2025-09-04T00:00:00Z';

function calculateTimeRemaining(releaseDate: Date, now: Date) {
  const diffMs = Math.max(0, releaseDate.getTime() - now.getTime());
  
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
  };
}

function generateETag(releaseDate: string, lastTimelineUpdate: string, timelineItems: number): string {
  const content = `${releaseDate}:${lastTimelineUpdate}:${timelineItems}`;
  const hash = createHash('sha256').update(content).digest('base64');
  return hash.substring(0, 24);
}

export async function GET(request: NextRequest) {
  try {
    const requestId = request.headers.get('X-Request-ID') || crypto.randomUUID();
    
    // 解析时间线数据
    const sortedTimeline = timelineData.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const lastTimelineUpdate = sortedTimeline[0]?.date || new Date().toISOString();
    
    // 计算状态
    const releaseDate = new Date(RELEASE_DATE);
    const serverTime = new Date();
    const isReleased = serverTime >= releaseDate;
    const timeRemaining = calculateTimeRemaining(releaseDate, serverTime);
    
    // 生成ETag
    const etag = generateETag(RELEASE_DATE, lastTimelineUpdate, timelineData.length);
    
    // 检查缓存
    const clientETag = request.headers.get('If-None-Match');
    if (clientETag === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': 'public, max-age=60, s-maxage=300',
        },
      });
    }

    const statusData: StatusResponse = {
      releaseDate: RELEASE_DATE,
      serverTime: serverTime.toISOString(),
      isReleased,
      timeRemaining,
      timeline: {
        lastUpdate: lastTimelineUpdate,
        itemCount: timelineData.length,
      },
      version: env.NEXT_PUBLIC_APP_VERSION,
      etag,
    };

    return createAPIResponse(statusData, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300',
        'ETag': etag,
        'Access-Control-Allow-Origin': '*',
      },
      requestId,
    });
  } catch (error) {
    console.error('Status endpoint error:', error);
    return createAPIError(API_ERRORS.INTERNAL_ERROR, 500);
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
    },
  });
}
```

## 3. RSS Feed 实现

```typescript
// lib/rss.ts
import type { TimelineItem } from '@/types/timeline';
import { env } from '@/lib/env';

export function generateRSSFeed(items: TimelineItem[]): string {
  const sortedItems = items
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 30);

  const rssItems = sortedItems
    .map(item => {
      const pubDate = new Date(item.date).toUTCString();
      const link = `${env.NEXT_PUBLIC_APP_URL}/timeline#${item.id}`;
      
      return `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.summary}]]></description>
      <link>${link}</link>
      <guid isPermaLink="false">${item.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${item.type || 'update'}]]></category>
    </item>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hollow Knight: Silksong Release Timeline</title>
    <description>Official updates and news about Hollow Knight: Silksong release</description>
    <link>${env.NEXT_PUBLIC_APP_URL}</link>
    <atom:link href="${env.NEXT_PUBLIC_APP_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>30</ttl>
    <generator>Silksong Release Tracker</generator>
    <managingEditor>noreply@${env.NEXT_PUBLIC_APP_URL.replace('https://', '').replace('http://', '')} (Silksong Tracker)</managingEditor>
    <webMaster>noreply@${env.NEXT_PUBLIC_APP_URL.replace('https://', '').replace('http://', '')} (Silksong Tracker)</webMaster>
    ${rssItems}
  </channel>
</rss>`.trim();
}

export function validateRSSFeed(xml: string): boolean {
  try {
    // 基本XML格式检查
    return xml.includes('<rss') && xml.includes('</rss>') && xml.includes('<channel');
  } catch {
    return false;
  }
}
```

```typescript
// app/feed.xml/route.ts
import { NextRequest } from 'next/server';
import { generateRSSFeed, validateRSSFeed } from '@/lib/rss';
import timelineData from '@/data/timeline.json';

export async function GET(request: NextRequest) {
  try {
    const rssXml = generateRSSFeed(timelineData);
    
    // 验证生成的RSS
    if (!validateRSSFeed(rssXml)) {
      throw new Error('Generated RSS XML is invalid');
    }

    return new Response(rssXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=900, s-maxage=1800',
        'X-Robots-Tag': 'noindex', // RSS feeds don't need to be indexed
      },
    });
  } catch (error) {
    console.error('RSS feed generation failed:', error);
    
    // 返回最小可用的RSS feed
    const fallbackRss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Hollow Knight: Silksong Release Timeline</title>
    <description>RSS feed temporarily unavailable</description>
    <link>${process.env.NEXT_PUBLIC_APP_URL}</link>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  </channel>
</rss>`;

    return new Response(fallbackRss, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  }
}
```

## 4. 优化现有订阅API

```typescript
// app/api/subscriptions/route.ts (优化版本)
import { NextRequest } from 'next/server';
import { createAPIResponse, createAPIError, API_ERRORS } from '@/lib/api-helpers';
import { supabase } from '@/lib/supabase/client';
import type { SubscriptionResponse } from '@/types/api';
import { validateEmail } from '@/lib/validators';

// GET - 获取订阅数量
export async function GET(request: NextRequest) {
  try {
    const requestId = crypto.randomUUID();
    
    const { data: count, error } = await supabase.rpc('get_subscription_count');
    
    if (error) {
      console.error('Failed to fetch subscription count:', error);
      return createAPIError(API_ERRORS.INTERNAL_ERROR, 500, requestId);
    }

    const responseData = { count: count || 0 };

    return createAPIResponse(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
      requestId,
    });
  } catch (error) {
    console.error('Subscription count endpoint error:', error);
    return createAPIError(API_ERRORS.INTERNAL_ERROR, 500);
  }
}

// POST - 创建订阅
export async function POST(request: NextRequest) {
  try {
    const requestId = crypto.randomUUID();
    
    // 解析请求体
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return createAPIError({
        ...API_ERRORS.INVALID_EMAIL,
        field: 'email',
      }, 400, requestId);
    }

    // 验证邮箱
    const validation = validateEmail(email);
    if (!validation.isValid) {
      return createAPIError({
        ...API_ERRORS.INVALID_EMAIL,
        message: validation.error || API_ERRORS.INVALID_EMAIL.message,
        field: 'email',
      }, 400, requestId);
    }

    // 插入订阅
    const { data, error } = await supabase
      .from('email_subscriptions')
      .insert([{ email: validation.sanitized }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return createAPIError(API_ERRORS.ALREADY_SUBSCRIBED, 409, requestId);
      }
      
      console.error('Database error during subscription:', error);
      return createAPIError(API_ERRORS.INTERNAL_ERROR, 500, requestId);
    }

    // 获取更新后的计数
    const { data: count } = await supabase.rpc('get_subscription_count');

    const responseData: SubscriptionResponse = {
      count: count || 0,
      subscription: data ? {
        id: data.id,
        email: data.email,
        subscribedAt: data.subscribed_at,
      } : undefined,
    };

    return createAPIResponse(responseData, {
      status: 201,
      requestId,
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return createAPIError(API_ERRORS.INTERNAL_ERROR, 500);
  }
}
```

## 5. 类型安全的API客户端

```typescript
// lib/api-client.ts
import type { APIResponse, StatusResponse, SubscriptionResponse } from '@/types/api';

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData: APIResponse<never> = await response.json();
      throw new APIError(
        errorData.error?.message || 'API request failed',
        response.status,
        errorData.error?.code
      );
    }

    const data: APIResponse<T> = await response.json();
    
    if (!data.success) {
      throw new APIError(
        data.error?.message || 'API request failed',
        response.status,
        data.error?.code
      );
    }

    return data.data as T;
  }

  async getStatus(): Promise<StatusResponse> {
    return this.request<StatusResponse>('/api/status');
  }

  async getSubscriptionCount(): Promise<{ count: number }> {
    return this.request<{ count: number }>('/api/subscriptions');
  }

  async subscribe(email: string): Promise<SubscriptionResponse> {
    return this.request<SubscriptionResponse>('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getHealthStatus(): Promise<any> {
    return this.request('/api/health');
  }
}

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// 单例导出
export const apiClient = new APIClient();

// React Hook
export function useAPIClient() {
  return apiClient;
}
```

## 6. 验证和测试

```typescript
// lib/validators.ts
export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  const sanitized = email.trim().toLowerCase();
  
  if (!sanitized) {
    return { isValid: false, sanitized, error: "Email is required" };
  }
  
  if (sanitized.length > 254) {
    return { isValid: false, sanitized, error: "Email is too long" };
  }
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(sanitized)) {
    return { isValid: false, sanitized, error: "Please enter a valid email address" };
  }
  
  return { isValid: true, sanitized };
}
```

## 实施时间表

1. **第1天：基础框架** - 实现统一响应格式和辅助函数
2. **第2天：Status API** - 实现 `/api/status` 端点
3. **第3天：RSS Feed** - 实现 RSS feed 生成
4. **第4天：API优化** - 更新现有订阅API使用新格式
5. **第5天：客户端** - 实现类型安全的API客户端
6. **第6天：测试** - 全面测试和文档更新

这个改进方案保持了现有实现的优势，同时添加了PRD中有价值的功能，确保API的一致性和可维护性。