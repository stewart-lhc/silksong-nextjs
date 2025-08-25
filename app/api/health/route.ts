/**
 * Health Check API Route
 * Provides system health status and database connectivity checks
 */

import { env } from '@/lib/env';
import { checkDatabaseHealth, supabase } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      latency?: number;
      error?: string;
    };
    supabase: {
      status: 'healthy' | 'unhealthy';
      connected: boolean;
      error?: string;
    };
  };
}

/**
 * GET /api/health - Health check endpoint
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check database connectivity and performance
    const dbHealth = await checkDatabaseHealth();

    // Check Supabase connection
    let supabaseStatus: HealthStatus['checks']['supabase'] = {
      status: 'healthy',
      connected: true,
    };

    try {
      // Simple connectivity test
      const { error } = await supabase
        .from('email_subscriptions')
        .select('count')
        .limit(0);

      if (error) {
        supabaseStatus = {
          status: 'unhealthy',
          connected: false,
          error: error.message,
        };
      }
    } catch (error) {
      supabaseStatus = {
        status: 'unhealthy',
        connected: false,
        error:
          error instanceof Error ? error.message : 'Unknown connection error',
      };
    }

    // Determine overall status
    let overallStatus: HealthStatus['status'] = 'healthy';

    if (!dbHealth.isHealthy || supabaseStatus.status === 'unhealthy') {
      overallStatus = 'unhealthy';
    } else if (dbHealth.latency && dbHealth.latency > 1000) {
      // Consider degraded if latency is over 1 second
      overallStatus = 'degraded';
    }

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: env.NEXT_PUBLIC_APP_VERSION,
      environment: env.NODE_ENV,
      checks: {
        database: {
          status: dbHealth.isHealthy ? 'healthy' : 'unhealthy',
          latency: dbHealth.latency,
          error: dbHealth.error,
        },
        supabase: supabaseStatus,
      },
    };

    // Set appropriate HTTP status code
    const httpStatus =
      overallStatus === 'healthy'
        ? 200
        : overallStatus === 'degraded'
          ? 200
          : 503;

    return NextResponse.json(healthStatus, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);

    const errorStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: env.NEXT_PUBLIC_APP_VERSION,
      environment: env.NODE_ENV,
      checks: {
        database: {
          status: 'unhealthy',
          error: 'Health check failed',
        },
        supabase: {
          status: 'unhealthy',
          connected: false,
          error: 'Health check failed',
        },
      },
    };

    return NextResponse.json(errorStatus, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
  }
}

/**
 * HEAD /api/health - Simple health check for monitoring systems
 */
export async function HEAD(request: NextRequest) {
  try {
    // Quick database connectivity check
    const { error } = await supabase
      .from('email_subscriptions')
      .select('count')
      .limit(0);

    if (error) {
      return new NextResponse(null, {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}
