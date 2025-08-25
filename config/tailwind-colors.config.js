/**
 * Hornet Brand Color System - Tailwind CSS Configuration
 * 基于品牌色 #C43444 的 Tailwind CSS 颜色扩展配置
 * 支持明暗模式和WCAG无障碍标准
 */

const hornetColors = {
  // Hornet Primary Colors (主色板)
  hornet: {
    50: '#fdf2f3',
    100: '#fce7e9',
    200: '#f8cdd1',
    300: '#f1a8b0',
    400: '#e67284',
    500: '#c43444', // 品牌主色
    600: '#a82a38',
    700: '#8b222d',
    800: '#6e1b23',
    900: '#4a1218',
    DEFAULT: '#c43444',
  },

  // Secondary Colors (辅助配色)
  'hornet-secondary': {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#2563eb', // 次要色 - 蓝色
    600: '#1d4ed8',
    700: '#1e40af',
    800: '#1e3a8a',
    900: '#1e3a8a',
    DEFAULT: '#2563eb',
  },

  // Accent Colors (强调色)
  'hornet-accent': {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // 强调色 - 橙色
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    DEFAULT: '#f59e0b',
  },

  // Brand Auxiliary Colors (品牌辅助色)
  'hornet-auxiliary': {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#7c3aed', // 品牌辅助色 - 紫色
    600: '#6d28d9',
    700: '#5b21b6',
    800: '#4c1d95',
    900: '#3c1361',
    DEFAULT: '#7c3aed',
  },

  // Neutral Colors (中性色系)
  'hornet-neutral': {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    DEFAULT: '#71717a',
  },

  // Semantic Colors (功能状态色)
  'hornet-success': {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // 成功色
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    DEFAULT: '#10b981',
  },

  'hornet-warning': {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // 警告色
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    DEFAULT: '#f59e0b',
  },

  'hornet-error': {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // 错误色
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    DEFAULT: '#ef4444',
  },

  'hornet-info': {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // 信息色
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    DEFAULT: '#3b82f6',
  },
};

// 扩展现有的 Tailwind 配置
const tailwindColorsExtension = {
  extend: {
    colors: {
      ...hornetColors,

      // 语义化颜色别名
      primary: hornetColors.hornet,
      secondary: hornetColors['hornet-secondary'],
      accent: hornetColors['hornet-accent'],
      auxiliary: hornetColors['hornet-auxiliary'],
      neutral: hornetColors['hornet-neutral'],
      success: hornetColors['hornet-success'],
      warning: hornetColors['hornet-warning'],
      error: hornetColors['hornet-error'],
      info: hornetColors['hornet-info'],

      // 品牌色快捷方式
      brand: {
        primary: '#c43444',
        secondary: '#2563eb',
        accent: '#f59e0b',
        auxiliary: '#7c3aed',
      },
    },

    // 背景颜色
    backgroundColor: {
      'hornet-surface': 'var(--hornet-bg-surface)',
      'hornet-elevated': 'var(--hornet-bg-elevated)',
      'hornet-overlay': 'var(--hornet-bg-overlay)',
    },

    // 文字颜色
    textColor: {
      'hornet-primary': 'var(--hornet-text-primary)',
      'hornet-secondary': 'var(--hornet-text-secondary)',
      'hornet-tertiary': 'var(--hornet-text-tertiary)',
      'hornet-disabled': 'var(--hornet-text-disabled)',
      'hornet-inverse': 'var(--hornet-text-inverse)',
      'hornet-on-primary': 'var(--hornet-text-on-primary)',
      'hornet-on-secondary': 'var(--hornet-text-on-secondary)',
      'hornet-on-accent': 'var(--hornet-text-on-accent)',
    },

    // 边框颜色
    borderColor: {
      'hornet-primary': 'var(--hornet-border-primary)',
      'hornet-secondary': 'var(--hornet-border-secondary)',
      'hornet-focus': 'var(--hornet-border-focus)',
      'hornet-error': 'var(--hornet-border-error)',
      'hornet-success': 'var(--hornet-border-success)',
    },

    // 阴影
    boxShadow: {
      'hornet-sm': 'var(--hornet-shadow-sm)',
      'hornet-md': 'var(--hornet-shadow-md)',
      'hornet-lg': 'var(--hornet-shadow-lg)',
      'hornet-xl': 'var(--hornet-shadow-xl)',
    },

    // 按钮变体
    animation: {
      'hornet-pulse': 'hornet-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      'hornet-bounce': 'hornet-bounce 1s infinite',
    },

    keyframes: {
      'hornet-pulse': {
        '0%, 100%': {
          opacity: '1',
        },
        '50%': {
          opacity: '.5',
        },
      },
      'hornet-bounce': {
        '0%, 100%': {
          transform: 'translateY(-25%)',
          animationTimingFunction: 'cubic-bezier(0.8,0,1,1)',
        },
        '50%': {
          transform: 'none',
          animationTimingFunction: 'cubic-bezier(0,0,0.2,1)',
        },
      },
    },
  },
};

// 完整的 Tailwind 配置对象
const hornetTailwindConfig = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: tailwindColorsExtension,
  plugins: [
    // 自定义插件：Hornet 组件样式
    function ({ addComponents, theme }) {
      addComponents({
        // 按钮组件
        '.btn-hornet-primary': {
          backgroundColor: 'var(--hornet-btn-primary-bg)',
          color: 'var(--hornet-btn-primary-text)',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          fontWeight: '500',
          transition: 'all 0.2s ease-in-out',
          '&:hover:not(:disabled)': {
            backgroundColor: 'var(--hornet-btn-primary-hover)',
          },
          '&:active:not(:disabled)': {
            backgroundColor: 'var(--hornet-btn-primary-active)',
          },
          '&:disabled': {
            backgroundColor: 'var(--hornet-btn-primary-disabled)',
            color: 'var(--hornet-btn-primary-text-disabled)',
            cursor: 'not-allowed',
          },
        },

        '.btn-hornet-secondary': {
          backgroundColor: 'var(--hornet-btn-secondary-bg)',
          color: 'var(--hornet-btn-secondary-text)',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          fontWeight: '500',
          border: '1px solid var(--hornet-btn-secondary-border)',
          transition: 'all 0.2s ease-in-out',
          '&:hover:not(:disabled)': {
            backgroundColor: 'var(--hornet-btn-secondary-hover)',
          },
          '&:active:not(:disabled)': {
            backgroundColor: 'var(--hornet-btn-secondary-active)',
          },
          '&:disabled': {
            backgroundColor: 'var(--hornet-btn-secondary-disabled)',
            color: 'var(--hornet-btn-secondary-text-disabled)',
            borderColor: 'var(--hornet-btn-secondary-border-disabled)',
            cursor: 'not-allowed',
          },
        },

        '.btn-hornet-outline': {
          backgroundColor: 'var(--hornet-btn-outline-bg)',
          color: 'var(--hornet-btn-outline-text)',
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          fontWeight: '500',
          border: '1px solid var(--hornet-btn-outline-border)',
          transition: 'all 0.2s ease-in-out',
          '&:hover:not(:disabled)': {
            backgroundColor: 'var(--hornet-btn-outline-hover)',
          },
          '&:active:not(:disabled)': {
            backgroundColor: 'var(--hornet-btn-outline-active)',
          },
          '&:disabled': {
            backgroundColor: 'var(--hornet-btn-outline-disabled)',
            color: 'var(--hornet-btn-outline-text-disabled)',
            borderColor: 'var(--hornet-btn-outline-border-disabled)',
            cursor: 'not-allowed',
          },
        },

        // 输入框组件
        '.input-hornet': {
          backgroundColor: 'var(--hornet-input-bg)',
          border: '1px solid var(--hornet-input-border)',
          color: 'var(--hornet-input-text)',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          transition: 'all 0.2s ease-in-out',
          '&::placeholder': {
            color: 'var(--hornet-input-placeholder)',
          },
          '&:hover:not(:disabled):not(:focus)': {
            borderColor: 'var(--hornet-input-border-hover)',
          },
          '&:focus': {
            borderColor: 'var(--hornet-input-border-focus)',
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(196, 52, 68, 0.1)',
          },
          '&.error': {
            borderColor: 'var(--hornet-input-border-error)',
          },
          '&:disabled': {
            backgroundColor: 'var(--hornet-input-disabled-bg)',
            color: 'var(--hornet-input-disabled-text)',
            cursor: 'not-allowed',
          },
        },

        // 卡片组件
        '.card-hornet': {
          backgroundColor: 'var(--hornet-bg-surface)',
          borderRadius: '0.5rem',
          boxShadow: 'var(--hornet-shadow-md)',
          border: '1px solid var(--hornet-border-primary)',
          padding: '1.5rem',
        },

        '.card-hornet-elevated': {
          backgroundColor: 'var(--hornet-bg-elevated)',
          borderRadius: '0.5rem',
          boxShadow: 'var(--hornet-shadow-lg)',
          border: '1px solid var(--hornet-border-primary)',
          padding: '1.5rem',
        },
      });
    },

    // 自定义插件：工具类
    function ({ addUtilities }) {
      addUtilities({
        '.text-hornet-gradient': {
          background: 'linear-gradient(135deg, var(--hornet-primary-500), var(--hornet-accent-500))',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.bg-hornet-gradient': {
          background: 'linear-gradient(135deg, var(--hornet-primary-500), var(--hornet-accent-500))',
        },
        '.bg-hornet-gradient-subtle': {
          background: 'linear-gradient(135deg, var(--hornet-primary-50), var(--hornet-accent-50))',
        },
        '.border-hornet-gradient': {
          border: '1px solid transparent',
          background:
            'linear-gradient(white, white) padding-box, linear-gradient(135deg, var(--hornet-primary-500), var(--hornet-accent-500)) border-box',
        },
      });
    },
  ],
};

// 导出配置
module.exports = {
  hornetColors,
  tailwindColorsExtension,
  hornetTailwindConfig,
};

// 默认导出完整配置
module.exports.default = hornetTailwindConfig;
