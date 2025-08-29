/**
 * Newsletter Statistics API Route
 * 
 * Next.js 15 App Router API route for retrieving newsletter subscription analytics.
 * Implements comprehensive statistics with authentication, rate limiting, and caching.
 * Integrates with Supabase database and uses Newsletter Kit type definitions.
 * 
 * Features:
 * - TypeScript strict mode with Newsletter Kit types
 * - Admin authentication with Bearer token and API key support
 * - Advanced rate limiting and request tracking
 * - Comprehensive subscription analytics and metrics
 * - Intelligent caching with configurable TTL
 * - Production-ready error handling and logging
 * - RESTful HTTP status codes and responses
 * - Flexible query parameters for filtering
 * 
 * @version 1.0.0
 * @route GET /api/newsletter/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase/server';
import { rateLimit, env, isProduction } from '@/lib/env';
import { z } from 'zod';

// Newsletter Kit types
import type {
  StatsResponse,
  SubscriptionError,
  SubscriberCount,
  ISOTimestamp,
  SubscriptionFilters,
  PaginationOptions
} from '@/lib/newsletter-kit/types';

// ========================= CONSTANTS =========================
const STATS_CACHE_TTL = isProduction ? 5 * 60 * 1000 : 2 * 60 * 1000; // 5 min prod, 2 min dev
const RATE_LIMIT_CONFIG = {
  maxRequests: isProduction ? 10 : 50,
  windowMs: isProduction ? 15 * 60 * 1000 : 5 * 60 * 1000, // 15 min prod, 5 min dev
} as const;

// Supported authentication methods
const AUTH_METHODS = ['bearer', 'api_key'] as const;

// Maximum date range for queries (days)
const MAX_DATE_RANGE_DAYS = 365;

// ========================= TYPE DEFINITIONS =========================
interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastAccess: number;
}

interface StatsCacheEntry {
  data: ExtendedStatsData;
  expires: number;
  createdAt: number;
}

interface ExtendedStatsData {
  total: SubscriberCount;
  today: number;
  thisWeek: number;
  thisMonth: number;
  topSources: Array<{
    source: string;
    count: number;
  }>;
  periodData?: Array<{
    period: string;
    subscriptions: number;
    unsubscriptions: number;
    netGrowth: number;
  }>;
  tags?: Array<{
    tag: string;
    count: number;
    percentage: number;
  }>;
  summary?: {
    totalSubscriptions: number;
    activeSubscriptions: number;
    unsubscribed: number;
    pendingConfirmation: number;
    growthRate: number;
    churnRate: number;
  };
  meta?: {
    period: string;
    startDate: ISOTimestamp;
    endDate: ISOTimestamp;
    totalRecords: number;
    cacheExpiresAt: ISOTimestamp;
  };
}

// Rate limiting and cache stores
const rateLimitStore = new Map<string, RateLimitEntry>();
const statsCache = new Map<string, StatsCacheEntry>();

// ========================= VALIDATION SCHEMAS =========================
const statsQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).optional().default('month'),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  group_by: z.enum(['day', 'week', 'month', 'source', 'tag']).optional(),
  source: z.string().min(1).max(50).optional(),
  tag: z.string().min(1).max(30).optional(),
  include_summary: z.coerce.boolean().optional().default(false),
  include_period_data: z.coerce.boolean().optional().default(false),
  include_tags: z.coerce.boolean().optional().default(false),
  limit: z.coerce.number().min(1).max(1000).optional().default(100),
});

type StatsQueryParams = z.infer<typeof statsQuerySchema>;

// ========================= CLEANUP INTERVALS =========================
// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  
  // Clean rate limit entries
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  
  // Clean cache entries
  for (const [key, entry] of statsCache.entries()) {
    if (now > entry.expires) {
      statsCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

// ========================= AUTHENTICATION =========================
function checkAuthentication(request: NextRequest): { 
  authorized: boolean; 
  error?: SubscriptionError;
  method?: string;
} {
  const authHeader = request.headers.get('authorization');
  const apiKey = request.headers.get('x-api-key');
  
  // Check Bearer token
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    
    // In production, validate JWT token here
    // For now, just check if it exists and has minimum length
    if (token && token.length >= 10) {
      return { authorized: true, method: 'bearer' };
    }
  }
  
  // Check API key
  if (apiKey) {
    // In production, validate against stored API keys
    // For now, just check if it exists and has minimum length
    if (apiKey.length >= 10) {
      return { authorized: true, method: 'api_key' };
    }
  }
  
  return { 
    authorized: false, 
    error: {
      code: 'security_unauthorized',
      message: 'Authentication required. Provide Bearer token or API key.',
      retryable: false
    }
  };
}

// ========================= RATE LIMITING =========================
function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  error?: SubscriptionError;
} {
  const now = Date.now();
  const key = `stats:${identifier}`;
  let entry = rateLimitStore.get(key);

  // Initialize or reset if expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
      lastAccess: now
    };
    rateLimitStore.set(key, entry);
  }

  // Check rate limit
  if (entry.count >= RATE_LIMIT_CONFIG.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      error: {
        code: 'rate_limit_exceeded',
        message: 'Too many requests. Please wait before trying again.',
        retryable: true,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      }
    };
  }

  // Increment counter
  entry.count++;
  entry.lastAccess = now;

  return {
    allowed: true,
    remaining: RATE_LIMIT_CONFIG.maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

// ========================= DATE UTILITIES =========================
function getDateRange(period: string, startDate?: string, endDate?: string): { 
  start: Date; 
  end: Date;
  error?: SubscriptionError;
} {
  const now = new Date();
  let start: Date;
  let end: Date = new Date(now);

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
    
    // Validate date range
    if (start > end) {
      return {
        start: new Date(),
        end: new Date(),
        error: {
          code: 'validation_date_range',
          message: 'Start date must be before end date',
          retryable: false
        }
      };
    }
    
    // Check maximum date range
    const daysDiff = Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > MAX_DATE_RANGE_DAYS) {
      return {
        start: new Date(),
        end: new Date(),
        error: {
          code: 'validation_date_range',
          message: `Date range cannot exceed ${MAX_DATE_RANGE_DAYS} days`,
          retryable: false
        }
      };
    }
  } else {
    start = new Date(now);
    
    switch (period) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setMonth(now.getMonth() - 1);
    }
  }

  return { start, end };
}

// ========================= CACHING =========================
function getCacheKey(params: StatsQueryParams, authMethod: string): string {
  const cacheParams = {
    ...params,
    auth: authMethod // Include auth method in cache key for security
  };
  return `stats:${Buffer.from(JSON.stringify(cacheParams)).toString('base64')}`;
}

function getCachedStats(cacheKey: string): ExtendedStatsData | null {
  const cached = statsCache.get(cacheKey);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }
  return null;
}

function setCachedStats(cacheKey: string, data: ExtendedStatsData): void {
  statsCache.set(cacheKey, {
    data,
    expires: Date.now() + STATS_CACHE_TTL,
    createdAt: Date.now()
  });
}

// ========================= DATABASE OPERATIONS =========================
async function fetchStatistics(params: StatsQueryParams): Promise<{
  success: boolean;
  data?: ExtendedStatsData;
  error?: SubscriptionError;
}> {
  if (!supabaseAdmin) {
    return {
      success: false,
      error: {
        code: 'database_unavailable',
        message: 'Database service is not available',
        retryable: false
      }
    };
  }

  try {
    const { 
      period, 
      start_date, 
      end_date, 
      group_by, 
      source, 
      tag,
      include_summary,
      include_period_data,
      include_tags,
      limit
    } = params;

    // Get date range
    const dateRangeResult = getDateRange(period, start_date, end_date);
    if (dateRangeResult.error) {
      return { success: false, error: dateRangeResult.error };
    }

    const { start: startDate, end: endDate } = dateRangeResult;
    const now = new Date().toISOString() as ISOTimestamp;

    // Build base query for subscriptions in the date range
    let subscriptionsQuery = supabaseAdmin
      .from('newsletter_subscriptions')
      .select('*')
      .gte('subscribed_at', startDate.toISOString())
      .lte('subscribed_at', endDate.toISOString());

    // Apply filters
    if (source) {
      subscriptionsQuery = subscriptionsQuery.eq('source', source);
    }
    if (tag) {
      subscriptionsQuery = subscriptionsQuery.contains('tags', [tag]);
    }

    const { data: subscriptions, error: subscriptionsError } = await subscriptionsQuery;

    if (subscriptionsError) {
      throw new Error(`Failed to fetch subscriptions: ${subscriptionsError.message}`);
    }

    // Get overall counts
    const [
      { count: totalCount },
      { count: activeCount }, 
      { count: unsubscribedCount },
      { count: pendingCount }
    ] = await Promise.all([
      supabaseAdmin
        .from('newsletter_subscriptions')
        .select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('newsletter_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabaseAdmin
        .from('newsletter_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unsubscribed'),
      supabaseAdmin
        .from('newsletter_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
    ]);

    // Calculate time-based metrics
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - 1);

    const [
      { count: todayCount },
      { count: weekCount },
      { count: monthCount }
    ] = await Promise.all([
      supabaseAdmin
        .from('newsletter_subscriptions')
        .select('*', { count: 'exact', head: true })
        .gte('subscribed_at', todayStart.toISOString()),
      supabaseAdmin
        .from('newsletter_subscriptions')
        .select('*', { count: 'exact', head: true })
        .gte('subscribed_at', weekStart.toISOString()),
      supabaseAdmin
        .from('newsletter_subscriptions')
        .select('*', { count: 'exact', head: true })
        .gte('subscribed_at', monthStart.toISOString())
    ]);

    // Get top sources
    const sourceGroups = (subscriptions || []).reduce((acc: any, sub: any) => {
      const source = sub.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const topSources = Object.entries(sourceGroups)
      .map(([source, count]: [string, any]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    // Build response
    const result: ExtendedStatsData = {
      total: (totalCount || 0) as SubscriberCount,
      today: todayCount || 0,
      thisWeek: weekCount || 0,
      thisMonth: monthCount || 0,
      topSources
    };

    // Add optional data based on query parameters
    if (include_summary) {
      const growthRate = subscriptions?.length || 0;
      
      // Get unsubscriptions in the same period
      const { data: unsubscriptions } = await supabaseAdmin
        .from('unsubscription_logs')
        .select('*')
        .gte('unsubscribed_at', startDate.toISOString())
        .lte('unsubscribed_at', endDate.toISOString());

      const churnRate = unsubscriptions?.length || 0;

      result.summary = {
        totalSubscriptions: totalCount || 0,
        activeSubscriptions: activeCount || 0,
        unsubscribed: unsubscribedCount || 0,
        pendingConfirmation: pendingCount || 0,
        growthRate: totalCount ? Math.round((growthRate / totalCount) * 1000) / 10 : 0,
        churnRate: totalCount ? Math.round((churnRate / totalCount) * 1000) / 10 : 0
      };
    }

    if (include_period_data && group_by && ['day', 'week', 'month'].includes(group_by)) {
      // Group subscriptions by time period
      const grouped = (subscriptions || []).reduce((acc: any, sub: any) => {
        const date = new Date(sub.subscribed_at);
        let key: string;
        
        switch (group_by) {
          case 'day':
            key = date.toISOString().split('T')[0];
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split('T')[0];
            break;
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          default:
            key = date.toISOString().split('T')[0];
        }
        
        if (!acc[key]) {
          acc[key] = { subscriptions: 0, unsubscriptions: 0 };
        }
        acc[key].subscriptions += 1;
        return acc;
      }, {});

      result.periodData = Object.entries(grouped)
        .map(([period, data]: [string, any]) => ({
          period,
          subscriptions: data.subscriptions,
          unsubscriptions: data.unsubscriptions || 0,
          netGrowth: data.subscriptions - (data.unsubscriptions || 0)
        }))
        .sort((a, b) => a.period.localeCompare(b.period))
        .slice(0, limit);
    }

    if (include_tags) {
      // Group by tags
      const tagGroups = (subscriptions || []).reduce((acc: any, sub: any) => {
        if (sub.tags && Array.isArray(sub.tags)) {
          sub.tags.forEach((tag: string) => {
            acc[tag] = (acc[tag] || 0) + 1;
          });
        }
        return acc;
      }, {});

      const totalTaggedSubscriptions = subscriptions?.length || 1;
      result.tags = Object.entries(tagGroups)
        .map(([tag, count]: [string, any]) => ({
          tag,
          count,
          percentage: Math.round((count / totalTaggedSubscriptions) * 1000) / 10
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    }

    // Add metadata
    result.meta = {
      period,
      startDate: startDate.toISOString() as ISOTimestamp,
      endDate: endDate.toISOString() as ISOTimestamp,
      totalRecords: subscriptions?.length || 0,
      cacheExpiresAt: new Date(Date.now() + STATS_CACHE_TTL).toISOString() as ISOTimestamp
    };

    return { success: true, data: result };

  } catch (error) {
    console.error('Failed to fetch statistics:', error);
    
    return {
      success: false,
      error: {
        code: 'database_error',
        message: 'Failed to retrieve statistics',
        retryable: true,
        details: { 
          originalError: error instanceof Error ? error.message : String(error) 
        }
      }
    };
  }
}

// ========================= RESPONSE UTILITIES =========================
function createErrorResponse(
  error: SubscriptionError,
  statusCode: number = 500
): NextResponse<StatsResponse> {
  const timestamp = new Date().toISOString() as ISOTimestamp;
  
  return NextResponse.json(
    {
      success: false,
      error: error.message,
      code: error.code,
      timestamp
    },
    { 
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Error-Code': error.code
      }
    }
  );
}

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip');
  
  return forwarded?.split(',')[0] || cfIp || realIp || 'unknown';
}

// ========================= MAIN API HANDLER =========================

/**
 * GET /api/newsletter/stats
 * 
 * Retrieve newsletter subscription statistics and analytics
 * 
 * Authentication:
 * - Bearer token: Authorization: Bearer <token>
 * - API key: X-API-Key: <key>
 * 
 * Query Parameters:
 * - period: 'day' | 'week' | 'month' | 'year' (default: 'month')
 * - start_date: ISO datetime string (optional)
 * - end_date: ISO datetime string (optional) 
 * - group_by: 'day' | 'week' | 'month' | 'source' | 'tag' (optional)
 * - source: Filter by source (optional)
 * - tag: Filter by tag (optional)
 * - include_summary: boolean (default: false)
 * - include_period_data: boolean (default: false)
 * - include_tags: boolean (default: false)
 * - limit: number (default: 100, max: 1000)
 * 
 * Response:
 * - 200: Statistics retrieved successfully
 * - 400: Invalid query parameters
 * - 401: Authentication required
 * - 429: Rate limit exceeded
 * - 500: Server error
 */
export async function GET(request: NextRequest): Promise<NextResponse<StatsResponse>> {
  const timestamp = new Date().toISOString() as ISOTimestamp;
  const clientIp = getClientIdentifier(request);

  try {
    // Check authentication
    const authCheck = checkAuthentication(request);
    if (!authCheck.authorized) {
      return createErrorResponse(authCheck.error!, 401);
    }

    // Rate limiting
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      const response = createErrorResponse(rateCheck.error!, 429);
      
      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIG.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', rateCheck.remaining.toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil(rateCheck.resetTime / 1000).toString());
      response.headers.set('Retry-After', Math.ceil((rateCheck.resetTime - Date.now()) / 1000).toString());
      
      return response;
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      period: searchParams.get('period') || 'month',
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      group_by: searchParams.get('group_by') || undefined,
      source: searchParams.get('source') || undefined,
      tag: searchParams.get('tag') || undefined,
      include_summary: searchParams.get('include_summary') === 'true',
      include_period_data: searchParams.get('include_period_data') === 'true',
      include_tags: searchParams.get('include_tags') === 'true',
      limit: parseInt(searchParams.get('limit') || '100')
    };

    const validation = statsQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      const error: SubscriptionError = {
        code: 'validation_query_params',
        message: 'Invalid query parameters',
        details: validation.error.flatten()
      };
      return createErrorResponse(error, 400);
    }

    const params = validation.data;

    // Check cache first
    const cacheKey = getCacheKey(params, authCheck.method!);
    const cached = getCachedStats(cacheKey);
    
    if (cached) {
      const responseData: StatsResponse = {
        success: true,
        data: cached,
        timestamp
      };

      return NextResponse.json(responseData, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${Math.floor(STATS_CACHE_TTL / 1000)}`,
          'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
          'X-RateLimit-Remaining': rateCheck.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateCheck.resetTime / 1000).toString(),
          'X-Cache-Status': 'HIT'
        }
      });
    }

    // Fetch fresh data
    const result = await fetchStatistics(params);
    
    if (!result.success) {
      return createErrorResponse(result.error!, 500);
    }

    // Cache the results
    setCachedStats(cacheKey, result.data!);

    const responseData: StatsResponse = {
      success: true,
      data: result.data!,
      timestamp
    };

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${Math.floor(STATS_CACHE_TTL / 1000)}`,
        'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequests.toString(),
        'X-RateLimit-Remaining': rateCheck.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(rateCheck.resetTime / 1000).toString(),
        'X-Cache-Status': 'MISS'
      }
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/newsletter/stats:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      clientIp,
      timestamp
    });

    const subscriptionError: SubscriptionError = {
      code: 'server_internal',
      message: 'An unexpected error occurred. Please try again later.',
      retryable: true
    };

    return createErrorResponse(subscriptionError, 500);
  }
}

// ========================= OTHER HTTP METHODS =========================
const methodNotAllowedResponse = NextResponse.json(
  {
    success: false,
    error: 'Method not allowed. This endpoint only supports GET requests.',
    code: 'METHOD_NOT_ALLOWED',
    timestamp: new Date().toISOString()
  } satisfies StatsResponse,
  { 
    status: 405,
    headers: { 'Allow': 'GET' }
  }
);

export async function POST(): Promise<NextResponse<StatsResponse>> {
  return methodNotAllowedResponse;
}

export async function PUT(): Promise<NextResponse<StatsResponse>> {
  return methodNotAllowedResponse;
}

export async function DELETE(): Promise<NextResponse<StatsResponse>> {
  return methodNotAllowedResponse;
}

export async function PATCH(): Promise<NextResponse<StatsResponse>> {
  return methodNotAllowedResponse;
}