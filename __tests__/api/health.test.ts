/**
 * API Route Tests: /api/health
 * Comprehensive testing for health check endpoint
 * Tests database connectivity, Supabase connection, and overall system health
 */

import { NextRequest } from 'next/server';
import { GET, HEAD } from '@/app/api/health/route';
import * as env from '@/lib/env';
import * as supabaseClient from '@/lib/supabase/client';

// Mock dependencies
jest.mock('@/lib/env');
jest.mock('@/lib/supabase/client');

const mockEnv = env as jest.Mocked<typeof env>;
const mockSupabaseClient = supabaseClient as jest.Mocked<typeof supabaseClient>;

// Mock environment variables
mockEnv.env = {
  NEXT_PUBLIC_APP_VERSION: '1.0.0',
  NODE_ENV: 'test',
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key'
} as any;

// Create mock Supabase client
const createMockSupabaseQuery = () => {
  const mockQuery = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis()
  };
  return mockQuery;
};

describe('/api/health API Route', () => {
  let mockSupabaseQuery: ReturnType<typeof createMockSupabaseQuery>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock implementations
    mockSupabaseQuery = createMockSupabaseQuery();
    mockSupabaseClient.supabase = mockSupabaseQuery as any;
    
    // Mock checkDatabaseHealth function
    mockSupabaseClient.checkDatabaseHealth = jest.fn().mockResolvedValue({
      isHealthy: true,
      latency: 50,
      error: undefined
    });
    
    // Default successful Supabase query
    mockSupabaseQuery.limit.mockResolvedValue({
      error: null,
      data: [],
      count: 0
    });
  });

  describe('GET /api/health', () => {
    describe('Healthy System', () => {
      it('should return healthy status when all systems are operational', async () => {
        const response = await GET({} as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe('healthy');
        expect(data.version).toBe('1.0.0');
        expect(data.environment).toBe('test');
        expect(data.checks.database.status).toBe('healthy');
        expect(data.checks.supabase.status).toBe('healthy');
        expect(data.checks.supabase.connected).toBe(true);
        expect(data.timestamp).toBeDefined();
      });

      it('should include database latency information', async () => {
        mockSupabaseClient.checkDatabaseHealth = jest.fn().mockResolvedValue({
          isHealthy: true,
          latency: 100,
          error: undefined
        });

        const response = await GET({} as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe('healthy');
        expect(data.checks.database.latency).toBe(100);
        expect(data.checks.database.error).toBeUndefined();
      });

      it('should set proper cache headers for health responses', async () => {
        const response = await GET({} as NextRequest);

        expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
        expect(response.headers.get('Content-Type')).toBe('application/json');
      });
    });

    describe('Degraded System', () => {
      it('should return degraded status when database latency is high', async () => {
        mockSupabaseClient.checkDatabaseHealth = jest.fn().mockResolvedValue({
          isHealthy: true,
          latency: 1500, // Over 1 second
          error: undefined
        });

        const response = await GET({} as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.status).toBe('degraded');
        expect(data.checks.database.status).toBe('healthy');
        expect(data.checks.database.latency).toBe(1500);
        expect(data.checks.supabase.status).toBe('healthy');
      });
    });

    describe('Unhealthy System', () => {
      it('should return unhealthy status when database is down', async () => {
        mockSupabaseClient.checkDatabaseHealth = jest.fn().mockResolvedValue({
          isHealthy: false,
          latency: undefined,
          error: 'Connection timeout'
        });

        const response = await GET({} as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data.status).toBe('unhealthy');
        expect(data.checks.database.status).toBe('unhealthy');
        expect(data.checks.database.error).toBe('Connection timeout');
      });

      it('should return unhealthy status when Supabase connection fails', async () => {
        mockSupabaseQuery.limit.mockResolvedValue({
          error: { message: 'Connection refused' },
          data: null,
          count: null
        });

        const response = await GET({} as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data.status).toBe('unhealthy');
        expect(data.checks.supabase.status).toBe('unhealthy');
        expect(data.checks.supabase.connected).toBe(false);
        expect(data.checks.supabase.error).toBe('Connection refused');
      });

      it('should handle Supabase connection exceptions', async () => {
        mockSupabaseQuery.limit.mockRejectedValue(new Error('Network error'));

        const response = await GET({} as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data.status).toBe('unhealthy');
        expect(data.checks.supabase.status).toBe('unhealthy');
        expect(data.checks.supabase.connected).toBe(false);
        expect(data.checks.supabase.error).toBe('Network error');
      });
    });

    describe('Error Handling', () => {
      it('should handle unexpected errors gracefully', async () => {
        mockSupabaseClient.checkDatabaseHealth = jest.fn().mockRejectedValue(new Error('Unexpected error'));

        const response = await GET({} as NextRequest);
        const data = await response.json();

        expect(response.status).toBe(503);
        expect(data.status).toBe('unhealthy');
        expect(data.checks.database.status).toBe('unhealthy');
        expect(data.checks.database.error).toBe('Health check failed');
        expect(data.checks.supabase.status).toBe('unhealthy');
        expect(data.checks.supabase.error).toBe('Health check failed');
      });

      it('should include version and environment in error responses', async () => {
        mockSupabaseClient.checkDatabaseHealth = jest.fn().mockRejectedValue(new Error('System failure'));

        const response = await GET({} as NextRequest);
        const data = await response.json();

        expect(data.version).toBe('1.0.0');
        expect(data.environment).toBe('test');
        expect(data.timestamp).toBeDefined();
      });
    });

    describe('Response Format', () => {
      it('should return consistent response structure', async () => {
        const response = await GET({} as NextRequest);
        const data = await response.json();

        // Check required fields
        expect(data).toHaveProperty('status');
        expect(data).toHaveProperty('timestamp');
        expect(data).toHaveProperty('version');
        expect(data).toHaveProperty('environment');
        expect(data).toHaveProperty('checks');
        expect(data.checks).toHaveProperty('database');
        expect(data.checks).toHaveProperty('supabase');
        
        // Check database check structure
        expect(data.checks.database).toHaveProperty('status');
        expect(['healthy', 'unhealthy']).toContain(data.checks.database.status);
        
        // Check Supabase check structure
        expect(data.checks.supabase).toHaveProperty('status');
        expect(data.checks.supabase).toHaveProperty('connected');
        expect(['healthy', 'unhealthy']).toContain(data.checks.supabase.status);
        expect(typeof data.checks.supabase.connected).toBe('boolean');
      });

      it('should have valid ISO timestamp', async () => {
        const response = await GET({} as NextRequest);
        const data = await response.json();

        const timestamp = new Date(data.timestamp);
        expect(timestamp).toBeInstanceOf(Date);
        expect(timestamp.getTime()).not.toBeNaN();
        expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });
    });
  });

  describe('HEAD /api/health', () => {
    describe('Successful Health Check', () => {
      it('should return 200 status with no body when system is healthy', async () => {
        mockSupabaseQuery.limit.mockResolvedValue({
          error: null,
          data: [],
          count: 0
        });

        const response = await HEAD({} as NextRequest);
        const body = await response.text();

        expect(response.status).toBe(200);
        expect(body).toBe('');
        expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
      });
    });

    describe('Failed Health Check', () => {
      it('should return 503 status when Supabase connection fails', async () => {
        mockSupabaseQuery.limit.mockResolvedValue({
          error: { message: 'Database connection failed' },
          data: null,
          count: null
        });

        const response = await HEAD({} as NextRequest);
        const body = await response.text();

        expect(response.status).toBe(503);
        expect(body).toBe('');
        expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
      });

      it('should return 503 status when connection throws exception', async () => {
        mockSupabaseQuery.limit.mockRejectedValue(new Error('Connection timeout'));

        const response = await HEAD({} as NextRequest);
        const body = await response.text();

        expect(response.status).toBe(503);
        expect(body).toBe('');
      });
    });

    describe('Response Headers', () => {
      it('should set proper headers for both success and failure', async () => {
        const successResponse = await HEAD({} as NextRequest);
        expect(successResponse.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');

        // Test failure case
        mockSupabaseQuery.limit.mockRejectedValue(new Error('Test error'));
        const failureResponse = await HEAD({} as NextRequest);
        expect(failureResponse.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle mixed health states correctly', async () => {
      // Database healthy but slow
      mockSupabaseClient.checkDatabaseHealth = jest.fn().mockResolvedValue({
        isHealthy: true,
        latency: 800,
        error: undefined
      });

      // Supabase healthy
      mockSupabaseQuery.limit.mockResolvedValue({
        error: null,
        data: [],
        count: 0
      });

      const response = await GET({} as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy'); // Not degraded since latency < 1000ms
      expect(data.checks.database.status).toBe('healthy');
      expect(data.checks.supabase.status).toBe('healthy');
    });

    it('should prioritize unhealthy over degraded status', async () => {
      // Database slow (would be degraded)
      mockSupabaseClient.checkDatabaseHealth = jest.fn().mockResolvedValue({
        isHealthy: true,
        latency: 1500,
        error: undefined
      });

      // But Supabase fails (makes it unhealthy)
      mockSupabaseQuery.limit.mockResolvedValue({
        error: { message: 'Service unavailable' },
        data: null,
        count: null
      });

      const response = await GET({} as NextRequest);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe('unhealthy'); // Unhealthy takes precedence
      expect(data.checks.database.status).toBe('healthy');
      expect(data.checks.supabase.status).toBe('unhealthy');
    });
  });
});
