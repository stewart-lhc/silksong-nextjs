/**
 * Optimized Subscription Hooks
 * 优化查询策略、缓存管理和错误处理
 */

'use client';

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { optimizedSubscriptionService, queryMonitor } from '@/lib/supabase/optimized-client';

// 查询键工厂 - 统一管理查询键，避免缓存冲突
export const subscriptionQueryKeys = {
  all: ['subscriptions'] as const,
  count: () => [...subscriptionQueryKeys.all, 'count'] as const,
  statistics: () => [...subscriptionQueryKeys.all, 'statistics'] as const,
  health: () => [...subscriptionQueryKeys.all, 'health'] as const,
  retries: (batchSize?: number) => [...subscriptionQueryKeys.all, 'retries', batchSize] as const,
  performance: () => [...subscriptionQueryKeys.all, 'performance'] as const,
} as const;

/**
 * 优化的订阅计数Hook
 * - 使用专用RPC函数避免全表扫描
 * - 智能缓存策略
 * - 性能监控
 */
export function useOptimizedSubscriptionCount(
  options: Omit<UseQueryOptions<number>, 'queryKey' | 'queryFn'> = {}
) {
  return useQuery({
    queryKey: subscriptionQueryKeys.count(),
    queryFn: () => optimizedSubscriptionService.getSubscriptionCount(),
    staleTime: 2 * 60 * 1000, // 2分钟内数据视为新鲜
    gcTime: 5 * 60 * 1000, // 5分钟后清理缓存
    refetchOnMount: false, // 避免不必要的重新获取
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
}

/**
 * 详细统计信息Hook
 * - 单查询获取多个指标
 * - 减少数据库往返
 */
export function useSubscriptionStatistics(
  options: Omit<UseQueryOptions<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    recentSubscriptions: number;
    successRate: number;
  }>, 'queryKey' | 'queryFn'> = {}
) {
  return useQuery({
    queryKey: subscriptionQueryKeys.statistics(),
    queryFn: () => optimizedSubscriptionService.getDetailedStatistics(),
    staleTime: 5 * 60 * 1000, // 5分钟
    gcTime: 10 * 60 * 1000, // 10分钟
    refetchOnWindowFocus: false,
    retry: 2,
    ...options,
  });
}

/**
 * 优化的单个邮箱订阅Hook
 * - 智能缓存失效
 * - 乐观更新
 */
export function useOptimizedEmailSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string): Promise<{
      email: string;
      count: number;
      success: boolean;
      message: string;
    }> => {
      // 使用统一的API路由
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          source: 'optimized-hook'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        email: data.subscription.email,
        count: data.subscriberCount || data.count,
        success: true,
        message: data.message
      };
    },
    onSuccess: (data) => {
      // 乐观更新缓存
      queryClient.setQueryData(subscriptionQueryKeys.count(), data.count);
      
      // 智能失效相关查询
      queryClient.invalidateQueries({ 
        queryKey: subscriptionQueryKeys.statistics(),
        refetchType: 'active' 
      });

      // 清理服务端缓存
      optimizedSubscriptionService.clearCache();
    },
    onError: (error) => {
      console.error('Subscription failed:', error);
      
      // 错误后也要失效缓存，确保数据一致性
      queryClient.invalidateQueries({ 
        queryKey: subscriptionQueryKeys.count(),
        refetchType: 'active'
      });
    },
    // 失败时自动重试一次
    retry: 1,
    retryDelay: 2000,
  });
}

/**
 * 批量邮箱订阅Hook
 * - 减少数据库往返
 * - 批量处理结果
 */
export function useBatchEmailSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (emails: string[]) => 
      optimizedSubscriptionService.batchSubscribe(emails),
    onSuccess: (result) => {
      // 如果有成功的订阅，更新缓存
      if (result.successful.length > 0) {
        // 失效计数缓存，让其重新获取
        queryClient.invalidateQueries({ 
          queryKey: subscriptionQueryKeys.count() 
        });
        queryClient.invalidateQueries({ 
          queryKey: subscriptionQueryKeys.statistics() 
        });

        // 清理服务端缓存
        optimizedSubscriptionService.clearCache();
      }
    },
    onError: (error) => {
      console.error('Batch subscription failed:', error);
    },
  });
}

/**
 * 数据库健康检查Hook
 * - 轻量级健康检查
 * - 不缓存结果（实时状态）
 */
export function useDatabaseHealth(
  options: Omit<UseQueryOptions<{
    isHealthy: boolean;
    latency: number;
    error?: string;
  }>, 'queryKey' | 'queryFn'> = {}
) {
  return useQuery({
    queryKey: subscriptionQueryKeys.health(),
    queryFn: () => optimizedSubscriptionService.healthCheck(),
    staleTime: 30 * 1000, // 30秒
    gcTime: 60 * 1000, // 1分钟
    refetchInterval: 60 * 1000, // 每分钟自动刷新
    refetchIntervalInBackground: false,
    retry: false, // 健康检查失败不重试
    ...options,
  });
}

/**
 * 查询性能指标Hook
 * - 监控查询性能
 * - 开发调试用
 */
export function useQueryPerformance(enabled: boolean = process.env.NODE_ENV === 'development') {
  return useQuery({
    queryKey: subscriptionQueryKeys.performance(),
    queryFn: () => optimizedSubscriptionService.getPerformanceMetrics(),
    enabled,
    staleTime: 10 * 1000, // 10秒
    refetchInterval: enabled ? 10 * 1000 : false,
    refetchIntervalInBackground: false,
  });
}

/**
 * 待重试任务Hook
 * - 批量获取重试任务
 * - 管理员功能
 */
export function usePendingRetries(
  batchSize: number = 100,
  options: Omit<UseQueryOptions<Array<{
    id: string;
    email: string;
    templateId: string;
    attemptNumber: number;
    errorMessage: string;
    retryAfter: string;
  }>>, 'queryKey' | 'queryFn'> = {}
) {
  return useQuery({
    queryKey: subscriptionQueryKeys.retries(batchSize),
    queryFn: () => optimizedSubscriptionService.getPendingRetries(batchSize),
    staleTime: 30 * 1000, // 30秒
    gcTime: 2 * 60 * 1000, // 2分钟
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    // 仅在需要时启用
    enabled: false,
    ...options,
  });
}

/**
 * 缓存管理Hook
 * - 手动缓存控制
 * - 开发和管理工具
 */
export function useCacheManagement() {
  const queryClient = useQueryClient();

  const clearAllCache = () => {
    // 清理React Query缓存
    queryClient.clear();
    
    // 清理服务端缓存
    optimizedSubscriptionService.clearCache();
  };

  const invalidateSubscriptionCache = () => {
    queryClient.invalidateQueries({ 
      queryKey: subscriptionQueryKeys.all 
    });
  };

  const refreshCount = () => {
    queryClient.invalidateQueries({ 
      queryKey: subscriptionQueryKeys.count() 
    });
  };

  const refreshStatistics = () => {
    queryClient.invalidateQueries({ 
      queryKey: subscriptionQueryKeys.statistics() 
    });
  };

  return {
    clearAllCache,
    invalidateSubscriptionCache,
    refreshCount,
    refreshStatistics,
  };
}

/**
 * 组合Hook：完整的订阅管理
 * - 结合多个功能
 * - 简化使用
 */
export function useSubscriptionManager() {
  const countQuery = useOptimizedSubscriptionCount();
  const statisticsQuery = useSubscriptionStatistics({
    // 仅在需要详细信息时获取
    enabled: false
  });
  const subscriptionMutation = useOptimizedEmailSubscription();
  const batchSubscriptionMutation = useBatchEmailSubscription();
  const cacheManager = useCacheManagement();

  return {
    // 数据
    count: countQuery.data ?? 0,
    statistics: statisticsQuery.data,
    
    // 状态
    isLoading: countQuery.isLoading,
    isError: countQuery.isError,
    error: countQuery.error,
    
    // 操作
    subscribe: subscriptionMutation.mutate,
    batchSubscribe: batchSubscriptionMutation.mutate,
    
    // 状态
    isSubscribing: subscriptionMutation.isPending,
    isBatchSubscribing: batchSubscriptionMutation.isPending,
    
    // 缓存管理
    refreshData: cacheManager.refreshCount,
    clearCache: cacheManager.clearAllCache,
    
    // 高级功能
    getDetailedStatistics: () => {
      statisticsQuery.refetch();
      return statisticsQuery.data;
    },
  };
}

// subscriptionQueryKeys已在文件顶部导出