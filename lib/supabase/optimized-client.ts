/**
 * Optimized Supabase Client
 * 解决N+1查询问题，提供批量操作和智能缓存
 */

import { supabase, executeQuery } from './client';
import { supabaseAdmin } from './server';

// Extended client type for custom RPC functions
type SubscriptionStatsResult = {
  total_subscriptions: number;
  active_subscriptions: number;
  recent_subscriptions: number;
  success_rate: number;
}[];

type PendingRetryResult = {
  id: string;
  email: string;
  template_id: string;
  attempt_number: number;
  error_message: string;
  retry_after: string;
}[];

// Note: Type is defined but not used, keeping for future RPC function type safety
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ExtendedSupabaseClient = typeof supabase & {
  rpc(fn: 'get_subscription_statistics'): Promise<{ data: SubscriptionStatsResult | null; error: Error | null }>;
  rpc(fn: 'get_pending_retries_batch', params: { batch_size: number }): Promise<{ data: PendingRetryResult | null; error: Error | null }>;
};

// 查询性能监控
interface QueryMetrics {
  queryKey: string;
  executionTime: number;
  cacheHit: boolean;
  timestamp: Date;
}

class QueryPerformanceMonitor {
  private metrics: QueryMetrics[] = [];
  private readonly maxMetrics = 1000;

  recordQuery(queryKey: string, executionTime: number, cacheHit: boolean) {
    this.metrics.push({
      queryKey,
      executionTime,
      cacheHit,
      timestamp: new Date()
    });

    // 保持metrics数组大小限制
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getSlowQueries(threshold: number = 1000): QueryMetrics[] {
    return this.metrics.filter(m => m.executionTime > threshold);
  }

  getCacheHitRate(): number {
    if (this.metrics.length === 0) return 0;
    const hits = this.metrics.filter(m => m.cacheHit).length;
    return (hits / this.metrics.length) * 100;
  }

  getAverageExecutionTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, m) => sum + m.executionTime, 0);
    return total / this.metrics.length;
  }
}

export const queryMonitor = new QueryPerformanceMonitor();

// 批量查询缓存
class BatchQueryCache {
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5分钟

  set(key: string, data: unknown, ttl: number = this.defaultTTL) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): unknown | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(pattern: string) {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    );
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clear() {
    this.cache.clear();
  }

  // 清理过期缓存
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const batchCache = new BatchQueryCache();

// 定期清理缓存
setInterval(() => {
  batchCache.cleanup();
}, 60000); // 每分钟清理一次

/**
 * 优化的订阅查询服务
 * 解决N+1问题，提供批量操作
 */
export class OptimizedSubscriptionService {
  
  /**
   * 高性能订阅计数 - 使用专用函数避免全表扫描
   */
  async getSubscriptionCount(useCache: boolean = true): Promise<number> {
    const cacheKey = 'subscription-count';
    const startTime = Date.now();
    
    if (useCache) {
      const cached = batchCache.get(cacheKey);
      if (cached !== null && typeof cached === 'number') {
        queryMonitor.recordQuery(cacheKey, Date.now() - startTime, true);
        return cached;
      }
    }

    try {
      const client = supabaseAdmin || supabase;
      const result = await executeQuery(async () => 
        client.rpc('get_subscription_count')
      );
      
      if (typeof result !== 'number') {
        console.warn('Unexpected subscription count result type:', typeof result);
        return 0;
      }

      const count = result;
      
      if (useCache) {
        batchCache.set(cacheKey, count, 2 * 60 * 1000); // 2分钟缓存
      }

      queryMonitor.recordQuery(cacheKey, Date.now() - startTime, false);
      return count;
    } catch (error) {
      console.error('Error fetching subscription count:', error);
      return 0;
    }
  }

  /**
   * 获取详细统计信息 - 单查询获取多个指标
   */
  async getDetailedStatistics(useCache: boolean = true): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    recentSubscriptions: number;
    successRate: number;
  }> {
    const cacheKey = 'detailed-statistics';
    const startTime = Date.now();
    
    if (useCache) {
      const cached = batchCache.get(cacheKey);
      if (cached && typeof cached === 'object' && cached !== null && 'totalSubscriptions' in cached) {
        queryMonitor.recordQuery(cacheKey, Date.now() - startTime, true);
        return cached as {
          totalSubscriptions: number;
          activeSubscriptions: number;
          recentSubscriptions: number;
          successRate: number;
        };
      }
    }

    try {
      const client = supabaseAdmin || supabase;
      const result = await executeQuery(async () => 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Custom RPC function not in generated types
        (client as any).rpc('get_subscription_statistics')
      );

      const stats = (Array.isArray(result) ? result[0] : null) || {
        total_subscriptions: 0,
        active_subscriptions: 0,
        recent_subscriptions: 0,
        success_rate: 0
      };

      const formattedStats = {
        totalSubscriptions: stats.total_subscriptions,
        activeSubscriptions: stats.active_subscriptions,
        recentSubscriptions: stats.recent_subscriptions,
        successRate: stats.success_rate
      };

      if (useCache) {
        batchCache.set(cacheKey, formattedStats, 5 * 60 * 1000); // 5分钟缓存
      }

      queryMonitor.recordQuery(cacheKey, Date.now() - startTime, false);
      return formattedStats;
    } catch (error) {
      console.error('Error fetching detailed statistics:', error);
      return {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        recentSubscriptions: 0,
        successRate: 0
      };
    }
  }

  /**
   * 批量获取重试任务 - 避免N+1查询
   */
  async getPendingRetries(batchSize: number = 100): Promise<Array<{
    id: string;
    email: string;
    templateId: string;
    attemptNumber: number;
    errorMessage: string;
    retryAfter: string;
  }>> {
    const cacheKey = `pending-retries-${batchSize}`;
    const startTime = Date.now();

    try {
      const client = supabaseAdmin || supabase;
      const result = await executeQuery(async () => 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Custom RPC function not in generated types
        (client as any).rpc('get_pending_retries_batch', { batch_size: batchSize })
      );

      const tasks = (Array.isArray(result) ? result : []).map((task: Record<string, unknown>) => ({
        id: String(task.id),
        email: String(task.email),
        templateId: String(task.template_id),
        attemptNumber: Number(task.attempt_number),
        errorMessage: String(task.error_message),
        retryAfter: String(task.retry_after)
      })) || [];

      queryMonitor.recordQuery(cacheKey, Date.now() - startTime, false);
      return tasks;
    } catch (error) {
      console.error('Error fetching pending retries:', error);
      return [];
    }
  }

  /**
   * 批量订阅处理 - 减少数据库往返次数
   */
  async batchSubscribe(emails: string[]): Promise<{
    successful: Array<{ email: string; id: string }>;
    failed: Array<{ email: string; error: string }>;
    duplicates: string[];
  }> {
    const startTime = Date.now();
    const result = {
      successful: [] as Array<{ email: string; id: string }>,
      failed: [] as Array<{ email: string; error: string }>,
      duplicates: [] as string[]
    };

    if (!supabaseAdmin) {
      emails.forEach(email => {
        result.failed.push({ email, error: 'Database configuration error' });
      });
      return result;
    }

    // 验证所有邮箱
    const validEmails = emails
      .map(email => email.trim().toLowerCase())
      .filter(email => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!isValid) {
          result.failed.push({ email, error: 'Invalid email format' });
        }
        return isValid;
      });

    if (validEmails.length === 0) {
      return result;
    }

    try {
      // 批量检查已存在的邮箱
      const { data: existingEmails } = await supabaseAdmin
        .from('email_subscriptions')
        .select('email')
        .in('email', validEmails);

      const existingSet = new Set(existingEmails?.map(e => e.email) || []);
      const newEmails = validEmails.filter(email => {
        if (existingSet.has(email)) {
          result.duplicates.push(email);
          return false;
        }
        return true;
      });

      if (newEmails.length > 0) {
        // 批量插入新订阅
        const subscriptionData = newEmails.map(email => ({ email }));
        
        const { data: insertedData, error } = await supabaseAdmin
          .from('email_subscriptions')
          .insert(subscriptionData)
          .select('id, email');

        if (error) {
          newEmails.forEach(email => {
            result.failed.push({ email, error: 'Database insertion failed' });
          });
        } else if (insertedData) {
          insertedData.forEach(subscription => {
            result.successful.push({
              email: subscription.email,
              id: subscription.id
            });
          });
        }
      }

      // 使缓存失效
      batchCache.invalidate('subscription');
      
      queryMonitor.recordQuery('batch-subscribe', Date.now() - startTime, false);
      return result;
    } catch (error) {
      console.error('Error in batch subscribe:', error);
      validEmails.forEach(email => {
        result.failed.push({ email, error: 'Unexpected error' });
      });
      return result;
    }
  }

  /**
   * 健康检查 - 使用轻量级查询
   */
  async healthCheck(): Promise<{
    isHealthy: boolean;
    latency: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      // 使用 RPC 函数而不是表扫描
      const client = supabaseAdmin || supabase;
      const { error } = await client.rpc('get_subscription_count');

      const latency = Date.now() - startTime;

      if (error) {
        return {
          isHealthy: false,
          latency,
          error: error.message
        };
      }

      return {
        isHealthy: true,
        latency
      };
    } catch (error) {
      return {
        isHealthy: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 获取查询性能指标
   */
  getPerformanceMetrics() {
    return {
      cacheHitRate: queryMonitor.getCacheHitRate(),
      averageExecutionTime: queryMonitor.getAverageExecutionTime(),
      slowQueries: queryMonitor.getSlowQueries(),
      cacheSize: batchCache['cache'].size
    };
  }

  /**
   * 清理缓存和指标
   */
  clearCache() {
    batchCache.clear();
  }
}

// 导出单例实例
export const optimizedSubscriptionService = new OptimizedSubscriptionService();

// 导出类型
export type {
  QueryMetrics
};