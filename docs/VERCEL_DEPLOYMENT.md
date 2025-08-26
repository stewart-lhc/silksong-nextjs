# Vercel Deployment Guide

## Required Environment Variables

在 Vercel 项目设置中，你需要设置以下**必需**的环境变量：

### 核心配置 (必需)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 可选配置 (有默认值)

这些变量是可选的，如果不设置会使用默认值：

```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=Silk Song Archive
NEXT_PUBLIC_SITE_DESCRIPTION=Official archive site for Hollow Knight: Silksong...
NEXT_PUBLIC_KEYWORDS=Hollow Knight,Silksong,Team Cherry,Metroidvania...
```

## 在 Vercel 中设置环境变量

### 方法 1: 通过 Vercel Dashboard

1. 进入你的 Vercel 项目
2. 点击 **Settings** 标签
3. 点击 **Environment Variables** 
4. 添加每个环境变量：
   - **Name**: 变量名 (如 `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: 变量值
   - **Environment**: 选择 `Production`, `Preview`, `Development` (建议全选)

### 方法 2: 通过 Vercel CLI

```bash
# 设置生产环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

# 设置预览环境变量  
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
```

## 常见问题排查

### 1. 环境变量验证失败

**错误信息**:
```
Environment validation failed:
NEXT_PUBLIC_SUPABASE_URL: Required
NEXT_PUBLIC_SUPABASE_ANON_KEY: Required
```

**解决方案**:
- 确保在 Vercel Dashboard 中设置了 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- 确保变量值正确（URL 格式有效，密钥不为空）
- 重新部署项目以应用新的环境变量

### 2. 部署后环境变量不生效

**解决方案**:
- 检查环境变量是否设置在正确的环境 (Production/Preview/Development)
- 在修改环境变量后，需要重新部署项目
- 使用 `vercel env ls` 命令检查已设置的环境变量

### 3. Supabase 连接问题

**错误信息**:
```
Error: Invalid Supabase URL format
```

**解决方案**:
- 确保 `NEXT_PUBLIC_SUPABASE_URL` 格式正确：`https://your-project.supabase.co`
- 确保 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是有效的 Supabase 匿名密钥
- 检查 Supabase 项目状态是否正常

## 环境变量检查脚本

创建一个简单的检查脚本来验证环境变量：

```javascript
// scripts/check-env.js
console.log('Environment Variables Check:');
console.log('========================');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'Using default');
console.log('NEXT_PUBLIC_APP_NAME:', process.env.NEXT_PUBLIC_APP_NAME || 'Using default');
```

运行检查：
```bash
node scripts/check-env.js
```

## 部署流程

1. **设置环境变量**（在 Vercel Dashboard 中）
2. **推送代码**到 GitHub/GitLab
3. **Vercel 自动部署**
4. **验证功能**（检查邮件订阅是否正常工作）

## 生产环境特殊配置

在生产环境中，还可以设置这些可选变量：

```
# 分析和监控
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
VERCEL_ANALYTICS_ID=your-vercel-analytics-id

# 安全配置
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 性能配置
ENABLE_COMPRESSION=true
ENABLE_IMAGE_OPTIMIZATION=true
```

## 验证部署

部署完成后，访问你的 Vercel 域名并：

1. 检查首页是否正常加载
2. 尝试邮件订阅功能
3. 检查浏览器控制台是否有错误
4. 验证订阅数据是否正确存储到 Supabase

如果遇到问题，检查 Vercel 的 **Functions** 标签页中的日志信息。