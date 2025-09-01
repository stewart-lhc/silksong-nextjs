# 统一Hook系统使用指南

本文档介绍统一的Supabase查询hook系统，它整合了原来的完整版和简化版功能，提供强大且易用的数据访问接口。

## 系统概述

统一的hook系统(`hooks/use-supabase-query.ts`)提供：
- **完整的数据库操作**：CRUD、RPC、实时订阅、身份验证
- **简化的便捷接口**：易用的wrapper函数
- **API路由集成**：直接与HTTP端点交互的hook
- **类型安全**：完整的TypeScript支持
- **性能优化**：React Query集成与智能缓存

## 功能层次结构

```
统一Hook系统
├── 核心数据库操作
│   ├── useSupabaseQuery (表查询)
│   ├── useSupabaseInsert (数据插入)
│   ├── useSupabaseUpdate (数据更新)
│   ├── useSupabaseDelete (数据删除)
│   ├── useSupabaseRpc (RPC调用)
│   ├── useSupabaseSubscription (实时订阅)
│   └── useSupabaseAuth (身份验证)
├── 简化便捷接口
│   ├── useSimpleQuery (简单表查询)
│   ├── useSimpleMutation (简单表操作)
│   ├── useApiQuery (API端点查询)
│   └── useApiMutation (API端点变更)
└── 专用业务Hook
    ├── useSubscriptionCount (订阅数量)
    └── useEmailSubscriptionMutation (邮件订阅)
```

## 使用示例

### 1. 基础表查询

```typescript
import { useSupabaseQuery } from '@/hooks/use-supabase-query';

// 查询所有订阅
const { data: subscriptions, isLoading, error } = useSupabaseQuery(
  'newsletter_subscriptions',
  {
    select: 'id, email, created_at',
    filter: (query) => query.eq('active', true).limit(10)
  }
);

// 查询单个订阅
const { data: subscription } = useSupabaseQuery(
  'newsletter_subscriptions',
  {
    select: '*',
    filter: (query) => query.eq('email', 'user@example.com'),
    single: true
  }
);
```

### 2. 简化查询接口

```typescript
import { useSimpleQuery } from '@/hooks/use-supabase-query';

// 简单过滤查询
const { data: activeSubscriptions } = useSimpleQuery(
  'newsletter_subscriptions',
  {
    select: 'email, created_at',
    filter: { active: true },
    single: false
  }
);

// 查找特定记录
const { data: userSubscription } = useSimpleQuery(
  'newsletter_subscriptions',
  {
    filter: { email: 'user@example.com' },
    single: true
  }
);
```

### 3. API路由集成

```typescript
import { useApiQuery, useApiMutation } from '@/hooks/use-supabase-query';

// 获取API数据
const { data: apiData, isLoading } = useApiQuery<{ count: number }>(
  '/api/subscribe',
  {
    method: 'GET',
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    retry: 2
  }
);

// API变更操作
const mutation = useApiMutation<
  { success: boolean; subscription: any },
  { email: string }
>('/api/subscribe', {
  method: 'POST',
  onSuccess: (data, variables) => {
    console.log(`订阅成功: ${variables.email}`);
  },
  onError: (error) => {
    console.error('订阅失败:', error.message);
  }
});

// 执行变更
mutation.mutate({ email: 'user@example.com' });
```

### 4. 专用业务Hook

```typescript
import { 
  useSubscriptionCount, 
  useEmailSubscriptionMutation 
} from '@/hooks/use-supabase-query';

// 获取订阅数量
const { data: count, isLoading } = useSubscriptionCount();

// 邮件订阅
const subscriptionMutation = useEmailSubscriptionMutation();

const handleSubscribe = async (email: string) => {
  try {
    const result = await subscriptionMutation.mutateAsync(email);
    console.log(`订阅成功！当前总数: ${result.count}`);
  } catch (error) {
    console.error('订阅失败:', error.message);
  }
};
```

### 5. 数据变更操作

```typescript
import { 
  useSupabaseInsert, 
  useSupabaseUpdate,
  useSupabaseDelete 
} from '@/hooks/use-supabase-query';

// 插入数据
const insertMutation = useSupabaseInsert('newsletter_subscriptions');

const addSubscription = () => {
  insertMutation.mutate([{
    email: 'new@example.com',
    source: 'web',
    active: true
  }]);
};

// 更新数据
const updateMutation = useSupabaseUpdate('newsletter_subscriptions');

const updateSubscription = () => {
  updateMutation.mutate({
    filter: (query) => query.eq('email', 'user@example.com'),
    data: { active: false }
  });
};

// 删除数据
const deleteMutation = useSupabaseDelete('newsletter_subscriptions');

const deleteSubscription = () => {
  deleteMutation.mutate((query) => query.eq('email', 'user@example.com'));
};
```

### 6. 实时订阅

```typescript
import { useSupabaseSubscription } from '@/hooks/use-supabase-query';

// 监听表变化
useSupabaseSubscription(
  'newsletter_subscriptions',
  (payload) => {
    console.log('订阅变化:', payload);
    // 处理实时更新
  },
  {
    event: 'INSERT', // 只监听新增
    filter: 'active=eq.true' // 只监听活跃订阅
  }
);
```

### 7. 身份验证

```typescript
import { useSupabaseAuth } from '@/hooks/use-supabase-query';

function UserProfile() {
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    signOut,
    isSigningOut
  } = useSupabaseAuth();

  if (isLoading) return <div>加载中...</div>;
  
  if (!isAuthenticated) {
    return <div>请先登录</div>;
  }

  return (
    <div>
      <h1>欢迎, {user?.email}</h1>
      <button 
        onClick={() => signOut()} 
        disabled={isSigningOut}
      >
        {isSigningOut ? '登出中...' : '登出'}
      </button>
    </div>
  );
}
```

## 最佳实践

### 1. 错误处理

```typescript
const { data, error, isLoading } = useSupabaseQuery('table_name', {
  // 配置选项
});

if (error) {
  // 处理错误
  console.error('查询失败:', error.message);
}
```

### 2. 加载状态

```typescript
const { data, isLoading, isFetching } = useSupabaseQuery('table_name');

if (isLoading) return <div>首次加载中...</div>;
if (isFetching) return <div>更新中...</div>;
```

### 3. 缓存控制

```typescript
const { data } = useSupabaseQuery('table_name', {
  staleTime: 5 * 60 * 1000, // 5分钟内不重新获取
  gcTime: 10 * 60 * 1000,   // 10分钟后清理缓存
  refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
});
```

### 4. 条件查询

```typescript
const { data } = useSupabaseQuery('table_name', {
  enabled: !!userId, // 只有在有userId时才执行查询
  filter: (query) => query.eq('user_id', userId)
});
```

## 性能优化

1. **使用合适的缓存时间**：根据数据更新频率设置`staleTime`
2. **启用智能重试**：使用默认的指数退避重试机制
3. **优化查询范围**：使用`select`只获取必要字段
4. **批量操作**：使用数组进行批量插入/更新
5. **实时订阅管理**：及时清理不需要的订阅

## 迁移指南

从旧的简化版本迁移：

```typescript
// 旧版本 (use-supabase-query-simplified.ts)
import { useSubscriptionCount } from '@/hooks/use-supabase-query-simplified';

// 新版本 (统一系统)
import { useSubscriptionCount } from '@/hooks/use-supabase-query';
// API完全兼容，无需修改代码
```

## 类型支持

系统提供完整的TypeScript类型支持：

```typescript
import type { 
  TableRow, 
  TableInsert, 
  TableUpdate,
  SupabaseQueryConfig,
  SupabaseMutationConfig 
} from '@/hooks/use-supabase-query';

// 获取表类型
type NewsletterSubscription = TableRow<'newsletter_subscriptions'>;
type NewSubscription = TableInsert<'newsletter_subscriptions'>;
type UpdateSubscription = TableUpdate<'newsletter_subscriptions'>;
```

## 故障排除

1. **类型错误**：确保导入正确的类型定义
2. **查询失败**：检查Supabase连接和权限配置
3. **缓存问题**：使用`queryClient.invalidateQueries()`手动刷新
4. **实时订阅**：确保RLS策略允许订阅操作

---

通过统一的hook系统，您可以：
- 使用一致的API进行所有数据操作
- 享受完整的TypeScript类型支持
- 利用React Query的强大缓存和同步功能
- 根据需要选择简单或高级接口
- 无缝集成API路由和数据库操作