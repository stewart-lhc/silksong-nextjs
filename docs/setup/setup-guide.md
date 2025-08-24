# Silk Song Archive - Next.js 迁移设置指南

## 📋 依赖包安装清单

### 🚀 一键安装脚本

```bash
# 安装所有必需的 shadcn/ui 和 Tailwind 依赖
npm install \
  @radix-ui/react-accordion \
  @radix-ui/react-alert-dialog \
  @radix-ui/react-avatar \
  @radix-ui/react-button \
  @radix-ui/react-card \
  @radix-ui/react-checkbox \
  @radix-ui/react-collapsible \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-hover-card \
  @radix-ui/react-label \
  @radix-ui/react-menubar \
  @radix-ui/react-navigation-menu \
  @radix-ui/react-popover \
  @radix-ui/react-progress \
  @radix-ui/react-radio-group \
  @radix-ui/react-scroll-area \
  @radix-ui/react-select \
  @radix-ui/react-separator \
  @radix-ui/react-sheet \
  @radix-ui/react-slider \
  @radix-ui/react-slot \
  @radix-ui/react-switch \
  @radix-ui/react-tabs \
  @radix-ui/react-toast \
  @radix-ui/react-toggle \
  @radix-ui/react-toggle-group \
  @radix-ui/react-tooltip \
  clsx \
  tailwind-merge \
  class-variance-authority \
  tailwindcss-animate \
  cmdk \
  date-fns \
  embla-carousel-react \
  input-otp \
  react-hook-form \
  @hookform/resolvers \
  zod \
  sonner \
  vaul \
  next-themes
```

### 📦 分类安装

#### 核心 shadcn/ui 基础依赖
```bash
npm install clsx tailwind-merge class-variance-authority tailwindcss-animate
```

#### Radix UI 组件 (批次1)
```bash
npm install \
  @radix-ui/react-slot \
  @radix-ui/react-button \
  @radix-ui/react-card \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-label \
  @radix-ui/react-popover \
  @radix-ui/react-select \
  @radix-ui/react-separator \
  @radix-ui/react-sheet \
  @radix-ui/react-tabs \
  @radix-ui/react-tooltip
```

#### Radix UI 组件 (批次2)
```bash
npm install \
  @radix-ui/react-accordion \
  @radix-ui/react-alert-dialog \
  @radix-ui/react-avatar \
  @radix-ui/react-checkbox \
  @radix-ui/react-collapsible \
  @radix-ui/react-hover-card \
  @radix-ui/react-menubar \
  @radix-ui/react-navigation-menu \
  @radix-ui/react-progress \
  @radix-ui/react-radio-group \
  @radix-ui/react-scroll-area \
  @radix-ui/react-slider \
  @radix-ui/react-switch \
  @radix-ui/react-toast \
  @radix-ui/react-toggle \
  @radix-ui/react-toggle-group
```

#### 扩展功能依赖
```bash
npm install \
  cmdk \
  date-fns \
  embla-carousel-react \
  input-otp \
  react-hook-form \
  @hookform/resolvers \
  zod \
  sonner \
  vaul \
  next-themes
```

## 🛠️ shadcn/ui 组件初始化

### 基础组件安装
```bash
# 使用 shadcn/ui CLI 安装核心组件
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add tooltip
```

### 高级组件安装
```bash
# 高级 UI 组件
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add scroll-area
npx shadcn-ui@latest add menubar
npx shadcn-ui@latest add hover-card
npx shadcn-ui@latest add toggle
npx shadcn-ui@latest add collapsible
npx shadcn-ui@latest add command
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table
npx shadcn-ui@latest add carousel
npx shadcn-ui@latest add drawer
npx shadcn-ui@latest add sonner
```

## 📁 项目结构设置

### 创建目录结构
```bash
# 在 Next.js 项目根目录执行
mkdir -p styles/tokens
mkdir -p components/ui
mkdir -p lib/utils
mkdir -p hooks
mkdir -p types
```

### 创建工具函数
```bash
# 创建 lib/utils.ts
echo 'import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}' > lib/utils.ts
```

## 🎨 设计系统文件复制

### 从原项目复制设计 Token
需要复制以下文件到新的 Next.js 项目：

1. **设计 Token 系统**
   ```bash
   # 复制 design-tokens.ts 到新项目
   cp ../src/styles/tokens/design-tokens.ts ./styles/tokens/
   ```

2. **字体配置**
   ```bash
   # 复制字体相关配置
   cp -r ../src/styles/typography ./styles/
   ```

3. **组件样式变体**
   ```bash
   # 复制组件样式变体
   cp -r ../src/styles/components ./styles/
   ```

## ⚙️ Next.js 特定配置

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    domains: ['your-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
    };
    return config;
  },
}

module.exports = nextConfig
```

### postcss.config.js
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## 🚀 启动和验证

### 开发环境启动
```bash
# 启动开发服务器
npm run dev

# 在浏览器中访问 http://localhost:3000
```

### 构建验证
```bash
# 生产构建测试
npm run build
npm run start
```

### 代码质量检查
```bash
# 运行 ESLint
npm run lint

# 运行类型检查
npm run type-check
```

## 🎯 迁移检查清单

### ✅ 配置文件
- [ ] `components.json` - shadcn/ui 配置
- [ ] `tailwind.config.ts` - Tailwind CSS 配置
- [ ] `app/globals.css` - 全局样式
- [ ] `tsconfig.json` - TypeScript 配置
- [ ] `next.config.js` - Next.js 配置
- [ ] `postcss.config.js` - PostCSS 配置

### ✅ 依赖安装
- [ ] 所有 Radix UI 组件已安装
- [ ] shadcn/ui 核心依赖已安装
- [ ] Tailwind CSS 相关包已安装
- [ ] 表单处理依赖已安装
- [ ] 动画和主题依赖已安装

### ✅ 文件结构
- [ ] `styles/tokens/` 目录已创建
- [ ] `components/ui/` 目录已创建
- [ ] `lib/utils/` 目录已创建
- [ ] `hooks/` 目录已创建
- [ ] `types/` 目录已创建

### ✅ 设计系统
- [ ] Design tokens 已迁移
- [ ] 全局样式已配置
- [ ] 奇幻主题变量已设置
- [ ] 响应式断点已配置
- [ ] 动画系统已迁移

## 🔧 故障排除

### 常见问题解决

1. **样式不生效**
   ```bash
   # 检查 Tailwind 编译
   npm run build
   # 检查 globals.css 导入
   ```

2. **TypeScript 路径错误**
   ```bash
   # 重启 TypeScript 服务器
   # VSCode: Cmd/Ctrl + Shift + P > TypeScript: Restart TS Server
   ```

3. **shadcn/ui 组件导入错误**
   ```bash
   # 重新安装组件
   npx shadcn-ui@latest add [component-name]
   ```

4. **字体加载问题**
   - 确认 Poppins 字体已在 `app/layout.tsx` 中配置
   - 检查字体 preload 设置

## 📚 参考资料

- [Next.js App Router 文档](https://nextjs.org/docs/app)
- [shadcn/ui 组件库](https://ui.shadcn.com/)
- [Tailwind CSS 配置](https://tailwindcss.com/docs/configuration)
- [Radix UI 组件文档](https://www.radix-ui.com/)

---

💡 **提示**: 建议按照此顺序进行迁移：配置文件 → 依赖安装 → 设计系统 → 组件迁移 → 功能验证