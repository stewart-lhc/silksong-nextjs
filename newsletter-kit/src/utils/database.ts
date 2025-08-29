/**
 * Database utilities for Newsletter Kit
 */

import { createClient } from '@supabase/supabase-js';
import type { NewsletterConfig } from '../types';

/**
 * 创建newsletter表的SQL脚本
 */
export const CREATE_TABLE_SQL = `
-- Newsletter Kit: Create email subscriptions table
CREATE TABLE IF NOT EXISTS email_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(50) DEFAULT 'web',
    metadata JSONB DEFAULT '{}'::jsonb,
    unsubscribed_at TIMESTAMP WITH TIME ZONE NULL,
    is_active BOOLEAN DEFAULT true,
    
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_source CHECK (source IN ('web', 'api', 'admin', 'import', 'mobile', 'widget'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_subscribed_at ON email_subscriptions(subscribed_at);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_active ON email_subscriptions(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public subscription" ON email_subscriptions
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public count access" ON email_subscriptions
    FOR SELECT TO public USING (true);
`;

/**
 * 检查表是否存在
 */
export async function checkTableExists(
  supabaseUrl: string,
  supabaseServiceKey: string,
  tableName: string = 'email_subscriptions'
): Promise<boolean> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', tableName)
      .eq('table_schema', 'public')
      .single();
    
    return !error && !!data;
  } catch {
    return false;
  }
}

/**
 * 创建newsletter表
 */
export async function createNewsletterTable(
  supabaseUrl: string,
  supabaseServiceKey: string,
  tableName: string = 'email_subscriptions'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 执行创建表的SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: CREATE_TABLE_SQL.replace(/email_subscriptions/g, tableName)
    });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 验证数据库连接和表结构
 */
export async function validateDatabaseSetup(config: {
  supabaseUrl: string;
  supabaseServiceKey: string;
  tableName?: string;
}): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const tableName = config.tableName || 'email_subscriptions';
  
  try {
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
    
    // 1. 检查连接
    const { error: connectionError } = await supabase
      .from('information_schema.tables')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      errors.push(`Database connection failed: ${connectionError.message}`);
      return { valid: false, errors, warnings };
    }
    
    // 2. 检查表是否存在
    const tableExists = await checkTableExists(
      config.supabaseUrl,
      config.supabaseServiceKey,
      tableName
    );
    
    if (!tableExists) {
      errors.push(`Table '${tableName}' does not exist`);
      return { valid: false, errors, warnings };
    }
    
    // 3. 检查表结构
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', tableName)
      .eq('table_schema', 'public');
    
    if (columnsError) {
      errors.push(`Failed to check table structure: ${columnsError.message}`);
      return { valid: false, errors, warnings };
    }
    
    // 验证必需的列
    const requiredColumns = [
      { name: 'id', type: 'uuid' },
      { name: 'email', type: 'character varying' },
      { name: 'subscribed_at', type: 'timestamp with time zone' },
      { name: 'is_active', type: 'boolean' }
    ];
    
    for (const required of requiredColumns) {
      const column = columns?.find(c => c.column_name === required.name);
      if (!column) {
        errors.push(`Missing required column: ${required.name}`);
      } else if (column.data_type !== required.type) {
        warnings.push(`Column '${required.name}' has type '${column.data_type}', expected '${required.type}'`);
      }
    }
    
    // 4. 检查索引
    const { data: indexes, error: indexError } = await supabase
      .from('pg_indexes')
      .select('indexname')
      .eq('tablename', tableName);
    
    if (!indexError && indexes) {
      const requiredIndexes = ['idx_email_subscriptions_email', 'idx_email_subscriptions_active'];
      for (const indexName of requiredIndexes) {
        if (!indexes.find(idx => idx.indexname === indexName)) {
          warnings.push(`Missing recommended index: ${indexName}`);
        }
      }
    }
    
    // 5. 检查RLS是否启用
    const { data: rlsInfo, error: rlsError } = await supabase
      .from('pg_tables')
      .select('rowsecurity')
      .eq('tablename', tableName)
      .eq('schemaname', 'public')
      .single();
    
    if (!rlsError && rlsInfo && !rlsInfo.rowsecurity) {
      warnings.push('Row Level Security (RLS) is not enabled for the table');
    }
    
    // 6. 测试基本操作
    try {
      // 测试计数查询
      const { error: countError } = await supabase
        .from(tableName)
        .select('count')
        .limit(1);
      
      if (countError) {
        errors.push(`Cannot perform SELECT operation: ${countError.message}`);
      }
    } catch (error) {
      errors.push(`Failed to test basic operations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
    
  } catch (error) {
    errors.push(`Database validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { valid: false, errors, warnings };
  }
}

/**
 * 获取数据库统计信息
 */
export async function getDatabaseStats(config: {
  supabaseUrl: string;
  supabaseServiceKey: string;
  tableName?: string;
}): Promise<{
  totalSubscribers: number;
  activeSubscribers: number;
  todaySubscriptions: number;
  weeklySubscriptions: number;
  monthlySubscriptions: number;
  topSources: Array<{ source: string; count: number }>;
}> {
  const tableName = config.tableName || 'email_subscriptions';
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
  
  try {
    // 总订阅者数
    const { count: totalSubscribers } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    // 活跃订阅者数
    const { count: activeSubscribers } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    // 今日订阅数
    const today = new Date().toISOString().split('T')[0];
    const { count: todaySubscriptions } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .gte('subscribed_at', `${today}T00:00:00Z`)
      .lte('subscribed_at', `${today}T23:59:59Z`);
    
    // 本周订阅数
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: weeklySubscriptions } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .gte('subscribed_at', weekAgo.toISOString());
    
    // 本月订阅数
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const { count: monthlySubscriptions } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
      .gte('subscribed_at', monthAgo.toISOString());
    
    // 按来源统计
    const { data: sourceStats } = await supabase
      .from(tableName)
      .select('source')
      .eq('is_active', true);
    
    const sourceCounts = sourceStats?.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    const topSources = Object.entries(sourceCounts)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalSubscribers: totalSubscribers || 0,
      activeSubscribers: activeSubscribers || 0,
      todaySubscriptions: todaySubscriptions || 0,
      weeklySubscriptions: weeklySubscriptions || 0,
      monthlySubscriptions: monthlySubscriptions || 0,
      topSources
    };
  } catch (error) {
    console.error('Failed to get database stats:', error);
    return {
      totalSubscribers: 0,
      activeSubscribers: 0,
      todaySubscriptions: 0,
      weeklySubscriptions: 0,
      monthlySubscriptions: 0,
      topSources: []
    };
  }
}

/**
 * 清理测试数据
 */
export async function cleanupTestData(config: {
  supabaseUrl: string;
  supabaseServiceKey: string;
  tableName?: string;
}): Promise<{ success: boolean; deleted: number }> {
  const tableName = config.tableName || 'email_subscriptions';
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
  
  try {
    // 删除测试邮箱
    const { data, error } = await supabase
      .from(tableName)
      .delete()
      .or('email.like.*test%,email.like.*example%,email.like.*demo%')
      .select();
    
    if (error) {
      return { success: false, deleted: 0 };
    }
    
    return { success: true, deleted: data?.length || 0 };
  } catch {
    return { success: false, deleted: 0 };
  }
}