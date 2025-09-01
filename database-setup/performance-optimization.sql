-- ================================================
-- Database Performance Optimization Script
-- 数据库性能优化脚本
-- ================================================

-- ================================================
-- 1. 索引优化策略
-- ================================================

-- 主要表的唯一索引优化
DROP INDEX IF EXISTS idx_email_subscriptions_email;
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_subscriptions_email_unique 
    ON email_subscriptions(email);

-- 复合索引用于状态查询和排序
CREATE INDEX IF NOT EXISTS idx_email_send_attempts_status_created 
    ON email_send_attempts(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_rollback_tasks_status_created 
    ON email_rollback_tasks(status, created_at DESC);

-- 部分索引：只索引活跃订阅
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_active 
    ON email_subscriptions(subscribed_at DESC) 
    WHERE is_active = true;

-- 部分索引：只索引失败状态的发送尝试
CREATE INDEX IF NOT EXISTS idx_email_send_attempts_failed 
    ON email_send_attempts(error_message, created_at DESC) 
    WHERE status = 'failed';

-- 外键性能索引
CREATE INDEX IF NOT EXISTS idx_email_send_attempts_subscription_id 
    ON email_send_attempts(subscription_id) 
    WHERE subscription_id IS NOT NULL;

-- ================================================
-- 2. 查询性能优化函数
-- ================================================

-- 高性能订阅计数函数
CREATE OR REPLACE FUNCTION get_active_subscription_count()
RETURNS bigint
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    count_result bigint;
BEGIN
    -- 使用覆盖索引进行快速计数
    SELECT COUNT(*) INTO count_result
    FROM email_subscriptions
    WHERE is_active = true;
    
    RETURN count_result;
END;
$$;

-- 优化的订阅统计函数
CREATE OR REPLACE FUNCTION get_subscription_statistics()
RETURNS TABLE(
    total_subscriptions bigint,
    active_subscriptions bigint,
    recent_subscriptions bigint,
    success_rate numeric
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE is_active = true) as active,
            COUNT(*) FILTER (WHERE subscribed_at >= NOW() - INTERVAL '7 days') as recent
        FROM email_subscriptions
    ),
    email_stats AS (
        SELECT 
            COUNT(*) as total_attempts,
            COUNT(*) FILTER (WHERE status = 'sent') as successful_attempts
        FROM email_send_attempts
        WHERE created_at >= NOW() - INTERVAL '30 days'
    )
    SELECT 
        s.total,
        s.active,
        s.recent,
        CASE 
            WHEN es.total_attempts > 0 THEN 
                ROUND((es.successful_attempts::numeric / es.total_attempts::numeric) * 100, 2)
            ELSE 0
        END as success_rate
    FROM stats s, email_stats es;
END;
$$;

-- 批量查询优化：获取待处理的重试任务
CREATE OR REPLACE FUNCTION get_pending_retries_batch(batch_size int DEFAULT 100)
RETURNS TABLE(
    id uuid,
    email varchar,
    template_id varchar,
    attempt_number integer,
    error_message text,
    retry_after timestamptz
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        esa.id,
        esa.email,
        esa.template_id,
        esa.attempt_number,
        esa.error_message,
        esa.retry_after
    FROM email_send_attempts esa
    WHERE esa.status = 'failed'
        AND esa.retry_after <= NOW()
        AND esa.attempt_number < 3  -- 最大重试次数
    ORDER BY esa.retry_after ASC
    LIMIT batch_size;
END;
$$;

-- ================================================
-- 3. 性能监控视图
-- ================================================

-- 查询性能监控视图
CREATE OR REPLACE VIEW query_performance_stats AS
SELECT 
    schemaname,
    tablename,
    attname as column_name,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public' 
    AND tablename IN ('email_subscriptions', 'email_send_attempts', 'email_rollback_tasks')
ORDER BY tablename, attname;

-- 索引使用情况监控
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- 表统计信息视图
CREATE OR REPLACE VIEW table_stats AS
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- ================================================
-- 4. 数据清理和维护函数
-- ================================================

-- 清理旧的已完成任务
CREATE OR REPLACE FUNCTION cleanup_completed_tasks(days_to_keep int DEFAULT 30)
RETURNS integer
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count integer;
BEGIN
    -- 清理已完成的回滚任务
    DELETE FROM email_rollback_tasks
    WHERE status = 'completed'
        AND processed_at < NOW() - (days_to_keep || ' days')::interval;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- 清理成功的旧发送尝试记录
    DELETE FROM email_send_attempts
    WHERE status = 'sent'
        AND sent_at < NOW() - (days_to_keep || ' days')::interval;
        
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- ================================================
-- 5. 缓存优化配置
-- ================================================

-- 设置表的自动清理参数
ALTER TABLE email_subscriptions SET (
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE email_send_attempts SET (
    autovacuum_vacuum_scale_factor = 0.2,
    autovacuum_analyze_scale_factor = 0.1
);

-- ================================================
-- 6. 查询计划分析函数
-- ================================================

-- 分析慢查询的函数
CREATE OR REPLACE FUNCTION analyze_subscription_queries()
RETURNS TABLE(
    query_type text,
    execution_plan text,
    estimated_cost numeric
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- 分析订阅计数查询
    RETURN QUERY
    SELECT 
        'subscription_count'::text,
        (EXPLAIN (FORMAT JSON, ANALYZE false) 
         SELECT COUNT(*) FROM email_subscriptions WHERE is_active = true
        )[1]::text,
        0::numeric;
        
    -- 可以添加更多查询分析
END;
$$;

-- ================================================
-- 验证优化效果
-- ================================================

-- 检查索引创建状态
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('email_subscriptions', 'email_send_attempts', 'email_rollback_tasks')
ORDER BY tablename, indexname;

-- 分析表统计信息
ANALYZE email_subscriptions;
ANALYZE email_send_attempts;
ANALYZE email_rollback_tasks;

-- 输出优化完成信息
SELECT 'Database performance optimization completed successfully!' as result;