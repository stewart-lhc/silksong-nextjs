/**
 * 配置验证和环境检查工具
 */

import { z } from 'zod';
import type { NewsletterConfig } from '../types';
import { DEFAULT_CONFIG } from '../config/defaults';

// 环境变量验证模式
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
  NEWSLETTER_TABLE_NAME: z.string().optional(),
  NEWSLETTER_RATE_LIMIT_MAX: z.string().transform(Number).pipe(z.number().positive()).optional(),
  NEWSLETTER_RATE_LIMIT_WINDOW: z.string().transform(Number).pipe(z.number().positive()).optional(),
});

// 配置验证模式
const configSchema = z.object({
  supabaseUrl: z.string().url().optional(),
  supabaseAnonKey: z.string().optional(),
  supabaseServiceKey: z.string().optional(),
  tableName: z.string().min(1).optional(),
  rateLimit: z.object({
    maxRequests: z.number().positive(),
    windowMs: z.number().positive(),
    duplicateEmailWindowMs: z.number().positive().optional(),
  }).optional(),
  theme: z.object({
    colors: z.record(z.string()).optional(),
    fonts: z.object({
      sans: z.array(z.string()).optional(),
      mono: z.array(z.string()).optional(),
    }).optional(),
    spacing: z.record(z.string()).optional(),
    radius: z.record(z.string()).optional(),
    variants: z.record(z.string()).optional(),
  }).optional(),
  validation: z.object({
    maxEmailLength: z.number().positive().max(320).optional(),
    customEmailRegex: z.instanceof(RegExp).optional(),
  }).optional(),
  messages: z.object({
    success: z.string().optional(),
    error: z.string().optional(),
    alreadySubscribed: z.string().optional(),
    rateLimit: z.string().optional(),
    invalidEmail: z.string().optional(),
    placeholder: z.string().optional(),
    submitButton: z.string().optional(),
    loadingButton: z.string().optional(),
  }).optional(),
});

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  config?: NewsletterConfig;
}

/**
 * 验证Supabase配置
 */
export function validateSupabaseConfig(config?: {
  url?: string;
  anonKey?: string;
  serviceKey?: string;
}): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    const env = {
      NEXT_PUBLIC_SUPABASE_URL: config?.url || process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: config?.anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: config?.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEWSLETTER_TABLE_NAME: process.env.NEWSLETTER_TABLE_NAME,
      NEWSLETTER_RATE_LIMIT_MAX: process.env.NEWSLETTER_RATE_LIMIT_MAX,
      NEWSLETTER_RATE_LIMIT_WINDOW: process.env.NEWSLETTER_RATE_LIMIT_WINDOW,
    };
    
    const result = envSchema.safeParse(env);
    
    if (!result.success) {
      result.error.errors.forEach(error => {
        errors.push(`${error.path.join('.')}: ${error.message}`);
      });
    }
    
    // 额外检查
    if (env.NEXT_PUBLIC_SUPABASE_URL && !env.NEXT_PUBLIC_SUPABASE_URL.includes('supabase.co')) {
      warnings.push('Supabase URL format may be incorrect');
    }
    
    if (env.NEXT_PUBLIC_SUPABASE_ANON_KEY && env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length < 100) {
      warnings.push('Supabase anon key seems too short');
    }
    
    if (env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_SERVICE_ROLE_KEY.length < 100) {
      warnings.push('Supabase service role key seems too short');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      config: result.success ? {
        supabaseUrl: result.data.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: result.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseServiceKey: result.data.SUPABASE_SERVICE_ROLE_KEY,
        tableName: result.data.NEWSLETTER_TABLE_NAME || DEFAULT_CONFIG.tableName,
      } : undefined,
    };
  } catch (error) {
    errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { valid: false, errors, warnings };
  }
}

/**
 * 验证完整配置
 */
export function validateNewsletterConfig(config: Partial<NewsletterConfig>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    const result = configSchema.safeParse(config);
    
    if (!result.success) {
      result.error.errors.forEach(error => {
        errors.push(`${error.path.join('.')}: ${error.message}`);
      });
    }
    
    // 合并默认配置
    const mergedConfig: NewsletterConfig = {
      ...DEFAULT_CONFIG,
      ...config,
      rateLimit: {
        ...DEFAULT_CONFIG.rateLimit,
        ...config.rateLimit,
      },
      theme: {
        ...DEFAULT_CONFIG.theme,
        ...config.theme,
        colors: {
          ...DEFAULT_CONFIG.theme?.colors,
          ...config.theme?.colors,
        },
        fonts: {
          ...DEFAULT_CONFIG.theme?.fonts,
          ...config.theme?.fonts,
        },
        spacing: {
          ...DEFAULT_CONFIG.theme?.spacing,
          ...config.theme?.spacing,
        },
        radius: {
          ...DEFAULT_CONFIG.theme?.radius,
          ...config.theme?.radius,
        },
        variants: {
          ...DEFAULT_CONFIG.theme?.variants,
          ...config.theme?.variants,
        },
      },
      validation: {
        ...DEFAULT_CONFIG.validation,
        ...config.validation,
      },
      messages: {
        ...DEFAULT_CONFIG.messages,
        ...config.messages,
      },
    };
    
    // 验证email regex
    if (mergedConfig.validation?.customEmailRegex) {
      try {
        const testEmail = 'test@example.com';
        mergedConfig.validation.customEmailRegex.test(testEmail);
      } catch (error) {
        errors.push('Custom email regex is invalid');
      }
    }
    
    // 验证速率限制配置
    if (mergedConfig.rateLimit) {
      if (mergedConfig.rateLimit.maxRequests <= 0) {
        errors.push('Rate limit maxRequests must be positive');
      }
      if (mergedConfig.rateLimit.windowMs <= 0) {
        errors.push('Rate limit windowMs must be positive');
      }
      if (mergedConfig.rateLimit.duplicateEmailWindowMs && mergedConfig.rateLimit.duplicateEmailWindowMs <= 0) {
        errors.push('Rate limit duplicateEmailWindowMs must be positive');
      }
    }
    
    // 验证邮箱长度限制
    if (mergedConfig.validation?.maxEmailLength) {
      if (mergedConfig.validation.maxEmailLength > 320) {
        warnings.push('Email max length exceeds RFC standard (320 characters)');
      }
      if (mergedConfig.validation.maxEmailLength < 6) {
        warnings.push('Email max length is very short, may reject valid emails');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      config: mergedConfig,
    };
  } catch (error) {
    errors.push(`Configuration validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { valid: false, errors, warnings };
  }
}

/**
 * 验证Next.js项目环境
 */
export function validateNextJSEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // 检查是否在Next.js环境中
    if (typeof window !== 'undefined') {
      // 客户端环境检查
      if (!window.location) {
        errors.push('Browser environment not properly initialized');
      }
    } else {
      // 服务端环境检查
      if (!process.env.NODE_ENV) {
        warnings.push('NODE_ENV not set');
      }
    }
    
    // 检查必要的依赖
    const requiredDeps = ['react', 'next'];
    const missingDeps: string[] = [];
    
    for (const dep of requiredDeps) {
      try {
        require.resolve(dep);
      } catch {
        missingDeps.push(dep);
      }
    }
    
    if (missingDeps.length > 0) {
      errors.push(`Missing required dependencies: ${missingDeps.join(', ')}`);
    }
    
    // 检查推荐的依赖
    const recommendedDeps = ['@tanstack/react-query', '@supabase/supabase-js'];
    const missingRecommended: string[] = [];
    
    for (const dep of recommendedDeps) {
      try {
        require.resolve(dep);
      } catch {
        missingRecommended.push(dep);
      }
    }
    
    if (missingRecommended.length > 0) {
      warnings.push(`Missing recommended dependencies: ${missingRecommended.join(', ')}`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push(`Environment validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { valid: false, errors, warnings };
  }
}

/**
 * 运行完整验证
 */
export function validateAll(config?: Partial<NewsletterConfig>): ValidationResult {
  const results = [
    validateNextJSEnvironment(),
    validateSupabaseConfig(),
    ...(config ? [validateNewsletterConfig(config)] : []),
  ];
  
  const allErrors = results.flatMap(r => r.errors);
  const allWarnings = results.flatMap(r => r.warnings);
  
  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    config: results.find(r => r.config)?.config,
  };
}

/**
 * Email验证工具
 */
export function validateEmail(email: string, config?: NewsletterConfig): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  // 基础清理
  const sanitized = email.trim().toLowerCase();
  
  // 长度检查
  const maxLength = config?.validation?.maxEmailLength || DEFAULT_CONFIG.validation?.maxEmailLength || 254;
  if (!sanitized) {
    return { isValid: false, sanitized, error: 'Email is required' };
  }
  
  if (sanitized.length > maxLength) {
    return { isValid: false, sanitized, error: `Email is too long (max ${maxLength} characters)` };
  }
  
  // 正则验证
  const regex = config?.validation?.customEmailRegex || DEFAULT_CONFIG.validation?.customEmailRegex;
  if (regex && !regex.test(sanitized)) {
    return { isValid: false, sanitized, error: 'Invalid email format' };
  }
  
  // 额外检查
  if (sanitized.includes('..')) {
    return { isValid: false, sanitized, error: 'Email contains consecutive dots' };
  }
  
  if (sanitized.startsWith('.') || sanitized.endsWith('.')) {
    return { isValid: false, sanitized, error: 'Email cannot start or end with a dot' };
  }
  
  return { isValid: true, sanitized };
}