/**
 * 统一Hook系统测试
 * 验证简化接口和完整接口的兼容性
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock React Query
const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn();
const mockUseQueryClient = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQuery: mockUseQuery,
  useMutation: mockUseMutation,
  useQueryClient: mockUseQueryClient,
}));

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        maybeSingle: jest.fn(),
        limit: jest.fn(),
      })),
      limit: jest.fn(),
      maybeSingle: jest.fn(),
    })),
    insert: jest.fn(() => ({ select: jest.fn() })),
    update: jest.fn(() => ({ select: jest.fn() })),
    delete: jest.fn(() => ({ select: jest.fn() })),
  })),
  rpc: jest.fn(),
  auth: {
    getSession: jest.fn(),
    getUser: jest.fn(),
    signOut: jest.fn(),
  },
  channel: jest.fn(() => ({
    on: jest.fn(() => ({ subscribe: jest.fn() })),
  })),
};

const mockExecuteQuery = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabase,
  executeQuery: mockExecuteQuery,
  SupabaseQueryError: class SupabaseQueryError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'SupabaseQueryError';
    }
  },
}));

// Mock fetch for API hooks
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('统一Hook系统测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default successful responses
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
    
    mockUseMutation.mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isLoading: false,
    });
    
    mockUseQueryClient.mockReturnValue({
      invalidateQueries: jest.fn(),
      setQueryData: jest.fn(),
    });
    
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ count: 5 }),
      headers: new Headers(),
      status: 200,
      statusText: 'OK',
    } as Response);
  });

  describe('简化Hook接口', () => {
    it('useSubscriptionCount 应该调用正确的API端点', async () => {
      // 动态导入，避免模块加载时的副作用
      const { useSubscriptionCount } = await import('@/hooks/use-supabase-query');
      
      useSubscriptionCount();
      
      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['subscription-count'],
        queryFn: expect.any(Function),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2,
      });
    });

    it('useEmailSubscriptionMutation 应该配置正确的mutation', async () => {
      const { useEmailSubscriptionMutation } = await import('@/hooks/use-supabase-query');
      
      useEmailSubscriptionMutation();
      
      expect(mockUseMutation).toHaveBeenCalledWith({
        mutationFn: expect.any(Function),
        onSuccess: expect.any(Function),
      });
    });
  });

  describe('便捷接口', () => {
    it('useSimpleQuery 应该支持基础过滤器', async () => {
      const { useSimpleQuery } = await import('@/hooks/use-supabase-query');
      
      useSimpleQuery('newsletter_subscriptions', {
        filter: { active: true },
        single: false,
      });
      
      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: expect.arrayContaining(['supabase', 'newsletter_subscriptions']),
        queryFn: expect.any(Function),
        enabled: true,
      });
    });

    it('useApiQuery 应该支持GET请求', async () => {
      const { useApiQuery } = await import('@/hooks/use-supabase-query');
      
      useApiQuery('/api/test', {
        method: 'GET',
        staleTime: 1000,
      });
      
      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: ['api', '/api/test', 'GET', undefined],
        queryFn: expect.any(Function),
        enabled: true,
        staleTime: 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2,
      });
    });

    it('useApiMutation 应该支持POST请求', async () => {
      const { useApiMutation } = await import('@/hooks/use-supabase-query');
      
      useApiMutation('/api/test', {
        method: 'POST',
        onSuccess: jest.fn(),
      });
      
      expect(mockUseMutation).toHaveBeenCalledWith({
        mutationFn: expect.any(Function),
        onSuccess: expect.any(Function),
        onError: undefined,
      });
    });
  });

  describe('核心数据库操作', () => {
    it('useSupabaseQuery 应该支持表查询', async () => {
      const { useSupabaseQuery } = await import('@/hooks/use-supabase-query');
      
      useSupabaseQuery('newsletter_subscriptions', {
        select: 'email, created_at',
        filter: (query) => query.eq('active', true),
        single: false,
      });
      
      expect(mockUseQuery).toHaveBeenCalledWith({
        queryKey: expect.arrayContaining(['supabase', 'newsletter_subscriptions']),
        queryFn: expect.any(Function),
      });
    });

    it('useSupabaseInsert 应该支持数据插入', async () => {
      const { useSupabaseInsert } = await import('@/hooks/use-supabase-query');
      
      useSupabaseInsert('newsletter_subscriptions');
      
      expect(mockUseMutation).toHaveBeenCalledWith({
        mutationFn: expect.any(Function),
        onSuccess: expect.any(Function),
      });
    });

    it('useSupabaseAuth 应该提供认证状态', async () => {
      const { useSupabaseAuth } = await import('@/hooks/use-supabase-query');
      
      mockUseQuery
        .mockReturnValueOnce({ data: null, isLoading: false, error: null }) // session query
        .mockReturnValueOnce({ data: null, isLoading: false, error: null }); // user query
      
      useSupabaseAuth();
      
      expect(mockUseQuery).toHaveBeenCalledTimes(2); // session and user queries
      expect(mockUseMutation).toHaveBeenCalledTimes(1); // signOut mutation
    });
  });

  describe('API函数测试', () => {
    it('useSubscriptionCount queryFn 应该正确获取数据', async () => {
      const { useSubscriptionCount } = await import('@/hooks/use-supabase-query');
      
      // 获取queryFn
      useSubscriptionCount();
      const queryFnCall = mockUseQuery.mock.calls[0][0];
      const queryFn = queryFnCall.queryFn;
      
      // 模拟成功响应
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ count: 10 }),
        headers: new Headers(),
        status: 200,
        statusText: 'OK',
      } as Response);
      
      const result = await queryFn();
      expect(result).toBe(10);
      expect(global.fetch).toHaveBeenCalledWith('/api/subscribe', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('useSubscriptionCount queryFn 应该处理错误', async () => {
      const { useSubscriptionCount } = await import('@/hooks/use-supabase-query');
      
      useSubscriptionCount();
      const queryFnCall = mockUseQuery.mock.calls[0][0];
      const queryFn = queryFnCall.queryFn;
      
      // 模拟失败响应
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);
      
      const result = await queryFn();
      expect(result).toBe(0); // 应该返回默认值0
    });

    it('useEmailSubscriptionMutation mutationFn 应该正确提交数据', async () => {
      const { useEmailSubscriptionMutation } = await import('@/hooks/use-supabase-query');
      
      useEmailSubscriptionMutation();
      const mutationCall = mockUseMutation.mock.calls[0][0];
      const mutationFn = mutationCall.mutationFn;
      
      // 模拟成功响应
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          subscription: { email: 'test@example.com' },
          subscriberCount: 15,
        }),
        headers: new Headers(),
        status: 201,
        statusText: 'Created',
      } as Response);
      
      const result = await mutationFn('test@example.com');
      
      expect(result).toEqual({
        email: 'test@example.com',
        count: 15,
      });
      
      expect(global.fetch).toHaveBeenCalledWith('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          source: 'web',
        }),
      });
    });
  });

  describe('类型兼容性', () => {
    it('应该导出所有必要的类型', async () => {
      const hookModule = await import('@/hooks/use-supabase-query');
      
      // 验证函数导出
      expect(typeof hookModule.useSupabaseQuery).toBe('function');
      expect(typeof hookModule.useSupabaseInsert).toBe('function');
      expect(typeof hookModule.useSupabaseUpdate).toBe('function');
      expect(typeof hookModule.useSupabaseDelete).toBe('function');
      expect(typeof hookModule.useSupabaseRpc).toBe('function');
      expect(typeof hookModule.useSupabaseSubscription).toBe('function');
      expect(typeof hookModule.useSupabaseAuth).toBe('function');
      
      // 验证简化接口导出
      expect(typeof hookModule.useSubscriptionCount).toBe('function');
      expect(typeof hookModule.useEmailSubscriptionMutation).toBe('function');
      expect(typeof hookModule.useSimpleQuery).toBe('function');
      expect(typeof hookModule.useSimpleMutation).toBe('function');
      expect(typeof hookModule.useApiQuery).toBe('function');
      expect(typeof hookModule.useApiMutation).toBe('function');
    });
  });
});

describe('向后兼容性', () => {
  it('简化版本的接口应该完全兼容', async () => {
    const { useSubscriptionCount, useEmailSubscriptionMutation } = await import('@/hooks/use-supabase-query');
    
    // 这些函数应该存在并且可调用
    expect(typeof useSubscriptionCount).toBe('function');
    expect(typeof useEmailSubscriptionMutation).toBe('function');
    
    // 调用时不应该抛出错误
    expect(() => useSubscriptionCount()).not.toThrow();
    expect(() => useEmailSubscriptionMutation()).not.toThrow();
  });
});