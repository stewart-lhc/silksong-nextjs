# Hornet 色彩系统使用指南

基于 Hornet 品牌色 `#C43444` 设计的完整色彩系统使用文档。

## 📋 目录

- [快速开始](#快速开始)
- [色彩系统概览](#色彩系统概览)
- [使用方法](#使用方法)
- [组件示例](#组件示例)
- [明暗模式](#明暗模式)
- [无障碍标准](#无障碍标准)
- [最佳实践](#最佳实践)

## 🚀 快速开始

### 1. 导入样式文件

在您的项目中导入色彩系统样式：

```tsx
// app/layout.tsx 或 app/globals.css
import '@/styles/colors.css';
```

### 2. 基本使用

```tsx
// 使用 Tailwind 类名
<div className="bg-hornet-500 text-white p-4 rounded">
  Hornet 主题内容
</div>

// 使用 CSS 变量
<div style={{ backgroundColor: 'var(--hornet-500)' }}>
  使用 CSS 变量
</div>
```

## 🎨 色彩系统概览

### 主色板 (Hornet Colors)

基于品牌色 `#C43444` 生成的完整色阶：

| 色阶    | 颜色值    | CSS 变量       | Tailwind 类     | 用途         |
| ------- | --------- | -------------- | --------------- | ------------ |
| 50      | `#FDF2F3` | `--hornet-50`  | `bg-hornet-50`  | 浅色背景     |
| 100     | `#FCE7E9` | `--hornet-100` | `bg-hornet-100` | 悬停状态     |
| 200     | `#F9CFD3` | `--hornet-200` | `bg-hornet-200` | 边框颜色     |
| 300     | `#F5A8B0` | `--hornet-300` | `bg-hornet-300` | 禁用状态     |
| 400     | `#EE7A87` | `--hornet-400` | `bg-hornet-400` | 次要按钮     |
| **500** | `#C43444` | `--hornet-500` | `bg-hornet-500` | **主品牌色** |
| 600     | `#B12A3A` | `--hornet-600` | `bg-hornet-600` | 悬停状态     |
| 700     | `#942230` | `--hornet-700` | `bg-hornet-700` | 激活状态     |
| 800     | `#7A1D2A` | `--hornet-800` | `bg-hornet-800` | 深色主题     |
| 900     | `#651A25` | `--hornet-900` | `bg-hornet-900` | 最深色调     |

### 辅助色系

#### 蓝色系 (Blue)

```css
--blue-50: #eff6ff;
--blue-500: #3b82f6; /* 主蓝色 */
--blue-900: #1e3a8a;
```

#### 橙色系 (Orange)

```css
--orange-50: #fff7ed;
--orange-500: #f97316; /* 主橙色 */
--orange-900: #9a3412;
```

#### 紫色系 (Purple)

```css
--purple-50: #faf5ff;
--purple-500: #a855f7; /* 主紫色 */
--purple-900: #581c87;
```

### 中性色系 (Neutral)

完整的灰度色板，支持明暗模式：

```css
--neutral-50: #fafafa; /* 最浅灰 */
--neutral-100: #f5f5f5;
--neutral-200: #e5e5e5;
--neutral-300: #d4d4d4;
--neutral-400: #a3a3a3;
--neutral-500: #737373; /* 中性灰 */
--neutral-600: #525252;
--neutral-700: #404040;
--neutral-800: #262626;
--neutral-900: #171717; /* 最深灰 */
```

### 功能状态色 (Semantic Colors)

#### 成功色 (Success)

```css
--success-50: #f0fdf4;
--success-500: #22c55e; /* 主成功色 */
--success-700: #15803d;
```

#### 警告色 (Warning)

```css
--warning-50: #fffbeb;
--warning-500: #f59e0b; /* 主警告色 */
--warning-700: #b45309;
```

#### 错误色 (Error)

```css
--error-50: #fef2f2;
--error-500: #ef4444; /* 主错误色 */
--error-700: #c53030;
```

#### 信息色 (Info)

```css
--info-50: #eff6ff;
--info-500: #3b82f6; /* 主信息色 */
--info-700: #1d4ed8;
```

## 💻 使用方法

### 1. CSS 变量方式

```css
.my-component {
  background-color: var(--hornet-500);
  color: var(--neutral-50);
  border: 1px solid var(--hornet-300);
}

/* 明暗模式适配 */
.my-component {
  background-color: var(--hornet-500);
  color: var(--neutral-50);
}

.dark .my-component {
  background-color: var(--hornet-600);
  color: var(--neutral-100);
}
```

### 2. Tailwind CSS 类名

```tsx
// 基本使用
<button className="bg-hornet-500 hover:bg-hornet-600 text-white">
  主要按钮
</button>

// 明暗模式
<div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50">
  自适应内容
</div>

// 状态色
<div className="bg-success-100 text-success-700 border border-success-300">
  成功提示
</div>
```

### 3. SCSS 变量

```scss
// 导入 SCSS 变量
@import '@/styles/colors.scss';

.button {
  background-color: $hornet-500;
  color: $neutral-50;

  &:hover {
    background-color: $hornet-600;
  }

  &:disabled {
    background-color: $neutral-300;
    color: $neutral-500;
  }
}
```

### 4. TypeScript 常量

```tsx
import { COLORS } from '@/styles/colors';
import type { HornetColor, NeutralColor } from '@/types/colors';

interface ButtonProps {
  variant?: HornetColor;
  size?: 'sm' | 'md' | 'lg';
}

function Button({ variant = 'hornet-500' }: ButtonProps) {
  return (
    <button
      style={{
        backgroundColor: COLORS[variant],
        color: COLORS['neutral-50']
      }}
    >
      动态颜色按钮
    </button>
  );
}
```

## 🧩 组件示例

### 按钮组件

```tsx
// 主要按钮
<button className="bg-hornet-500 hover:bg-hornet-600 active:bg-hornet-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
  主要操作
</button>

// 次要按钮
<button className="bg-hornet-100 hover:bg-hornet-200 text-hornet-700 px-4 py-2 rounded-md font-medium transition-colors">
  次要操作
</button>

// 危险按钮
<button className="bg-error-500 hover:bg-error-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
  删除操作
</button>
```

### 卡片组件

```tsx
<div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm p-6">
  <h3 className="text-lg font-semibold text-hornet-700 dark:text-hornet-300 mb-2">
    卡片标题
  </h3>
  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
    卡片描述内容，支持明暗模式自动适配。
  </p>
  <button className="bg-hornet-500 hover:bg-hornet-600 text-white px-3 py-1.5 rounded text-sm font-medium">
    了解更多
  </button>
</div>
```

### 表单组件

```tsx
<div className="space-y-4">
  {/* 输入框 */}
  <div>
    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
      用户名
    </label>
    <input
      type="text"
      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-hornet-500 focus:border-hornet-500"
      placeholder="请输入用户名"
    />
  </div>

  {/* 成功提示 */}
  <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-md">
    <div className="flex items-center">
      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      操作成功完成！
    </div>
  </div>
</div>
```

### 导航组件

```tsx
<nav className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between h-16">
      <div className="flex items-center">
        <div className="text-xl font-bold text-hornet-600 dark:text-hornet-400">
          Hornet
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <a href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-hornet-600 dark:hover:text-hornet-400 px-3 py-2 rounded-md text-sm font-medium">
          首页
        </a>
        <a href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-hornet-600 dark:hover:text-hornet-400 px-3 py-2 rounded-md text-sm font-medium">
          产品
        </a>
        <button className="bg-hornet-500 hover:bg-hornet-600 text-white px-4 py-2 rounded-md text-sm font-medium">
          登录
        </button>
      </div>
    </div>
  </div>
</nav>
```

## 🌓 明暗模式

### 主题切换

```tsx
import { useThemeContext } from '@/components/theme-provider';

function ThemeToggle() {
  const { theme, setTheme } = useThemeContext();

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="p-2 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

### 明暗模式适配规则

```tsx
// 背景色适配
<div className="bg-white dark:bg-neutral-900">

// 文字颜色适配
<p className="text-neutral-900 dark:text-neutral-100">

// 边框颜色适配
<div className="border border-neutral-200 dark:border-neutral-800">

// 主题色在明暗模式下的调整
<button className="bg-hornet-500 dark:bg-hornet-600 text-white">
```

## ♿ 无障碍标准

### WCAG 对比度验证

我们提供了 WCAG 对比度验证工具：

```tsx
import { WCAGContrastChecker } from '@/components/wcag-contrast-checker';

<WCAGContrastChecker
  foregroundColor="#C43444"
  backgroundColor="#FFFFFF"
/>
```

### 推荐的颜色组合

#### 高对比度组合 (AAA 级别)

```tsx
// 深色背景 + 浅色文字
<div className="bg-hornet-800 text-neutral-50">AAA 级别对比度</div>

// 浅色背景 + 深色文字
<div className="bg-hornet-50 text-hornet-900">AAA 级别对比度</div>
```

#### 标准对比度组合 (AA 级别)

```tsx
// 主色背景 + 白色文字
<div className="bg-hornet-500 text-white">AA 级别对比度</div>

// 中性背景 + 主色文字
<div className="bg-neutral-100 text-hornet-700">AA 级别对比度</div>
```

### 状态色无障碍使用

```tsx
// 成功状态 - 不仅依赖颜色，还有图标
<div className="bg-success-50 border border-success-200 text-success-700 p-3 rounded flex items-center">
  <svg className="w-5 h-5 mr-2" fill="currentColor">
    {/* 成功图标 */}
  </svg>
  操作成功完成
</div>

// 错误状态 - 结合图标和文字说明
<div className="bg-error-50 border border-error-200 text-error-700 p-3 rounded flex items-center">
  <svg className="w-5 h-5 mr-2" fill="currentColor">
    {/* 错误图标 */}
  </svg>
  请检查输入内容
</div>
```

## 📝 最佳实践

### 1. 颜色层次使用

```tsx
// 主要内容 - 使用主色
<h1 className="text-hornet-700 dark:text-hornet-300">主标题</h1>

// 次要内容 - 使用中性色
<p className="text-neutral-600 dark:text-neutral-400">描述文字</p>

// 辅助信息 - 使用浅色
<span className="text-neutral-500 dark:text-neutral-500">辅助信息</span>
```

### 2. 交互状态设计

```tsx
// 按钮状态变化
<button className="
  bg-hornet-500 hover:bg-hornet-600 active:bg-hornet-700
  disabled:bg-neutral-300 disabled:text-neutral-500
  focus:ring-2 focus:ring-hornet-500 focus:ring-offset-2
  transition-all duration-200
">
  交互按钮
</button>
```

### 3. 语义化使用

```tsx
// 使用语义化的状态色
<div className="bg-success-100 text-success-700">成功状态</div>
<div className="bg-warning-100 text-warning-700">警告状态</div>
<div className="bg-error-100 text-error-700">错误状态</div>
<div className="bg-info-100 text-info-700">信息状态</div>
```

### 4. 响应式设计

```tsx
// 在不同屏幕尺寸下调整颜色
<div className="
  bg-white sm:bg-neutral-50 lg:bg-neutral-100
  dark:bg-neutral-900 dark:sm:bg-neutral-800 dark:lg:bg-neutral-700
">
  响应式背景色
</div>
```

## 🔗 相关资源

- [色彩系统文档页面](http://localhost:3001/color-system-docs) - 完整的色彩展示和示例
- [WCAG 对比度演示](http://localhost:3001/wcag-demo) - 无障碍标准验证
- [主题切换演示](http://localhost:3001/theme-demo) - 明暗模式切换示例

## 📁 文件结构

```
styles/
├── colors.css          # CSS 变量定义
├── colors.scss         # SCSS 变量定义
└── colors.ts           # TypeScript 常量

types/
├── colors.ts           # 颜色类型定义
├── theme.ts            # 主题类型定义
└── color-utils.ts      # 颜色工具类型

components/
├── theme-provider.tsx  # 主题提供者
├── theme-toggle.tsx    # 主题切换组件
└── wcag-contrast-checker.tsx  # 对比度检查器

utils/
└── wcag-validator.ts   # WCAG 验证工具
```

## 🎯 总结

Hornet 色彩系统提供了：

- ✅ **完整的色彩体系** - 主色、辅助色、中性色、功能色
- ✅ **多种使用方式** - CSS 变量、Tailwind 类、SCSS 变量、TypeScript 常量
- ✅ **明暗模式支持** - 完整的主题切换功能
- ✅ **无障碍标准** - 符合 WCAG 2.1 AA/AAA 标准
- ✅ **开发工具** - 对比度验证、色彩系统验证器
- ✅ **完整文档** - 使用指南、示例代码、最佳实践

现在您可以在项目中自信地使用这套基于 #C43444 的完整 Hornet 色彩系统了！
