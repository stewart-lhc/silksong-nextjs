# Dynamic OG Image System

本文档描述了项目中实现的动态OG图片生成系统，基于PRD Day3的要求。

## 概述

动态OG系统使用`@vercel/og`和Satori渲染引擎，根据游戏发布状态和语言设置生成个性化的社交媒体分享图片。

## 核心功能

### 1. 动态图片生成
- **API端点**: `/api/og`
- **尺寸**: 1200x630像素（标准OG尺寸）
- **格式**: PNG
- **运行时**: Edge Runtime

### 2. 多语言支持
- **英文** (`en`): 默认语言
- **中文** (`zh`): 支持简体中文显示
- **参数**: `?lang=en` 或 `?lang=zh`

### 3. 发布状态变体
- **已发布** (`released`): 游戏已发布，绿色背景
- **紧急** (`lt7`): ≤7天，红色背景，紧急提醒
- **临近** (`lt30`): ≤30天，正常背景
- **正常** (`30plus`): >30天，正常背景

### 4. 缓存优化
- **ETag**: 基于`releaseDate|daysRemaining|variant|lang`的SHA256摘要
- **Cache-Control**: `public, max-age=3600, stale-while-revalidate=300`
- **条件请求**: 支持`If-None-Match`头，304响应

### 5. 字体系统
- **主字体**: 环境变量`OG_FONT_PRIMARY`配置
- **备选字体**: 环境变量`OG_FONT_FALLBACK`配置
- **格式**: WOFF2
- **位置**: `/public/fonts/`
- **错误处理**: 字体缺失时可重定向到静态图片

## 使用方法

### API调用

```bash
# 默认英文
GET /api/og

# 中文版本
GET /api/og?lang=zh

# 自定义发布日期
GET /api/og?lang=en&releaseDate=2024-12-25

# 已发布状态（日期在过去）
GET /api/og?releaseDate=2024-01-01
```

### 在页面元数据中使用

```typescript
import { DynamicMetadataGenerator } from '@/lib/dynamic-metadata';

export function generateMetadata(): Metadata {
  return DynamicMetadataGenerator.generateMetadata({
    title: 'Page Title',
    description: 'Page description',
    lang: 'en',
    releaseDate: '2025-12-31',
    baseUrl: 'https://your-domain.com',
  });
}
```

### 预热缓存

```typescript
import { prefetchOGImages } from '@/lib/dynamic-metadata';

// 在服务端预热OG图片缓存
await prefetchOGImages('en', '2025-12-31', 'https://your-domain.com');
```

## 环境配置

在`.env.local`中配置：

```bash
# OG字体配置
OG_FONT_PRIMARY=OGFontPrimary
OG_FONT_FALLBACK=OGFontFallback
FAIL_ON_OG_FONT_MISSING=false

# 游戏发布日期
GAME_RELEASE_DATE=2025-12-31

# 应用URL（用于生成完整OG URL）
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 字体配置

### 1. 字体文件
在`/public/fonts/`目录下放置：
- `OGFontPrimary.woff2` - 主字体
- `OGFontFallback.woff2` - 备选字体

### 2. 字体要求
- **格式**: WOFF2
- **大小**: 建议 < 200KB
- **字符集**: 英文版本需要Latin字符集，中文版本需要CJK字符集
- **授权**: 确保字体有Web使用授权

### 3. 字体加载逻辑
1. 尝试加载主字体
2. 主字体失败时加载备选字体
3. 全部失败时：
   - `FAIL_ON_OG_FONT_MISSING=true`: 重定向到静态图片
   - `FAIL_ON_OG_FONT_MISSING=false`: 使用系统字体渲染

## 文件结构

```
├── app/api/og/route.ts          # OG图片生成API
├── lib/og-utils.ts              # OG工具函数
├── lib/dynamic-metadata.ts      # 动态元数据生成器
├── public/fonts/                # 字体文件目录
│   ├── OGFontPrimary.woff2     # 主字体
│   ├── OGFontFallback.woff2    # 备选字体
│   └── README.md               # 字体配置说明
└── public/og/                   # 静态OG图片备选
    ├── current.png
    ├── released.png
    ├── lt7.png
    ├── lt30.png
    └── 30plus.png
```

## 性能优化

### 1. 缓存策略
- Edge Runtime执行，全球CDN分发
- ETag机制避免重复渲染
- 1小时缓存 + 5分钟后台更新

### 2. 字体优化
- 字体文件缓存在内存中
- 支持字体子集以减小文件大小
- 异步字体加载，不阻塞渲染

### 3. 错误处理
- 字体加载失败时降级处理
- 网络错误时重定向到静态图片
- 完善的错误日志记录

## 测试

### 1. 测试页面
访问 `/og-test` 查看完整的测试界面。

### 2. 手动测试
```bash
# 测试不同语言
curl -I "http://localhost:3000/api/og?lang=en"
curl -I "http://localhost:3000/api/og?lang=zh"

# 测试ETag缓存
curl -H "If-None-Match: abcdef1234567890" "http://localhost:3000/api/og"

# 测试不同状态
curl -I "http://localhost:3000/api/og?releaseDate=2024-01-01"  # 已发布
curl -I "http://localhost:3000/api/og?releaseDate=2024-12-30"  # 紧急
```

### 3. 性能测试
```bash
# 压力测试
ab -n 100 -c 10 "http://localhost:3000/api/og"

# 缓存效果测试
curl -w "%{time_total}" "http://localhost:3000/api/og"  # 第一次
curl -w "%{time_total}" "http://localhost:3000/api/og"  # 缓存命中
```

## 故障排除

### 1. 字体相关问题
- 检查字体文件是否存在且可读
- 验证字体文件格式是否为WOFF2
- 确认环境变量配置正确

### 2. 图片不显示
- 检查API路由是否正常响应
- 验证OG URL是否可访问
- 确认Content-Type为image/png

### 3. 缓存问题
- 清除CDN缓存
- 检查ETag计算是否正确
- 验证Cache-Control头设置

### 4. 多语言问题
- 确认字体支持相应语言字符集
- 检查语言参数是否正确传递
- 验证文本显示是否正常

## 扩展功能

### 1. 添加新语言
1. 在`OG_TEXTS`中添加新语言配置
2. 更新`Language`类型定义
3. 确保字体支持新语言字符集

### 2. 自定义样式
1. 修改`generateOGContent`函数
2. 添加新的样式变体
3. 更新ETag计算逻辑

### 3. 动态内容
1. 从数据库获取发布日期
2. 添加更多动态元素（如下载量、评分等）
3. 实现实时数据更新

## 最佳实践

1. **字体选择**: 使用Web安全字体，确保跨平台兼容性
2. **图片优化**: 控制渲染复杂度，避免过度装饰
3. **缓存策略**: 合理设置缓存时间，平衡性能与实时性
4. **错误处理**: 提供降级方案，确保系统健壮性
5. **测试覆盖**: 全面测试各种场景和边界条件

通过以上系统，项目实现了完全符合PRD要求的动态OG图片生成功能，提供了优秀的社交媒体分享体验。