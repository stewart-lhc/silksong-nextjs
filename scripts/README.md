# 构建脚本和性能优化

## 脚本概览

本目录包含构建流程中使用的自动化脚本，用于提升应用性能和维护质量。

## 脚本说明

### 1. select-og-current.mjs
**功能**: 基于发布日期自动选择合适的OG图片

**使用方法**:
```bash
npm run select-og
```

**环境变量**:
- `SILKSONG_RELEASE_ISO`: ISO格式的发布日期 (如: `2025-12-31T00:00:00Z`)

**选择规则**:
- `≥30天`: 使用 `30plus.png`
- `7-30天`: 使用 `lt30.png`  
- `<7天`: 使用 `lt7.png`
- `已发布`: 使用 `released.png`

**输出**: `public/og/current.png` (供网站使用的当前OG图片)

### 2. check-performance.mjs
**功能**: 检查应用性能指标和优化建议

**使用方法**:
```bash
npm run check-performance
```

**检查项目**:
- **Bundle大小**: 总体和单个文件大小检查
- **HTML大小**: 静态页面大小 (目标: ≤50KB)
- **CLS优化**: 累积布局偏移优化检查 (目标: ≤0.05)

**性能目标**:
- 最大Bundle大小: 1MB
- 最大页面Bundle: 500KB
- 最大Chunk大小: 250KB
- 最大HTML大小: 50KB

## 集成的构建流程

### package.json 脚本

```json
{
  "build": "npm run prebuild && next build && npm run postbuild",
  "prebuild": "npm run select-og && npm run validate-data",
  "postbuild": "npm run check-performance",
  "build:analyze": "cross-env ANALYZE=true npm run build"
}
```

### 构建阶段

1. **prebuild**: 
   - 选择合适的OG图片
   - 验证数据文件

2. **build**:
   - Next.js 构建
   - 代码分割和优化
   - Bundle分析 (可选)

3. **postbuild**:
   - 性能检查
   - 构建失败处理

## 性能优化配置

### 字体优化
- 启用 `font-display: swap`
- 限制字体族数量 (最多2个主要字体族)
- 预加载关键字体
- 优化字体回退策略

### Bundle优化
- 高级代码分割
- Tree shaking
- Vendor chunk分离
- UI组件独立打包

### Next.js配置优化
- 图片格式优化 (WebP, AVIF)
- 响应式图片配置
- 缓存策略优化
- 压缩启用

## 使用示例

### 日常开发
```bash
npm run dev          # 开发服务器
npm run build        # 完整构建流程
npm run build:analyze # 构建 + Bundle分析
```

### 性能检查
```bash
npm run check-performance  # 单独运行性能检查
npm run select-og          # 单独选择OG图片
```

### 环境变量示例
```bash
# Windows
set SILKSONG_RELEASE_ISO=2025-09-12T00:00:00Z && npm run build

# PowerShell
$env:SILKSONG_RELEASE_ISO="2025-09-12T00:00:00Z"; npm run build

# Unix/Linux/Mac
SILKSONG_RELEASE_ISO=2025-09-12T00:00:00Z npm run build
```

## 错误处理

- 所有脚本都包含详细的错误报告
- 构建失败时会返回正确的退出码
- Windows兼容性已验证
- 缺失文件时会提供明确的错误信息

## 性能监控

构建后的性能报告包括:
- 📦 Bundle大小分析
- 📄 HTML文件大小检查  
- 🎯 CLS优化建议
- 💡 性能优化提示

## 故障排除

**常见问题**:
1. OG图片文件缺失 → 确保 `public/og/` 目录包含所需图片
2. 性能检查失败 → 查看具体检查项目和优化建议
3. 环境变量未生效 → 确认语法和跨平台兼容性

**支持的平台**:
- Windows (MINGW64, PowerShell, CMD)
- macOS
- Linux