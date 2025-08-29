/**
 * Newsletter Kit - 样式系统和主题预设
 */

import type { NewsletterTheme } from '../types';
import { cn } from '../utils/cn';

// 基础样式类名
export const newsletterStyles = {
  // 容器样式
  container: 'newsletter-container',
  form: 'newsletter-form',
  
  // 输入框样式
  input: {
    base: 'newsletter-input flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    variants: {
      default: '',
      minimal: 'border-0 border-b border-input rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary',
      outlined: 'border-2 border-primary/20 focus-visible:border-primary',
    },
    sizes: {
      sm: 'h-8 px-2 text-xs',
      md: 'h-10 px-3 text-sm',
      lg: 'h-12 px-4 text-base',
    }
  },
  
  // 按钮样式
  button: {
    base: 'newsletter-button inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    variants: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      minimal: 'bg-transparent border border-input hover:bg-accent hover:text-accent-foreground',
      outlined: 'border border-primary text-primary hover:bg-primary hover:text-primary-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
    },
    sizes: {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-8 py-3',
    }
  },
  
  // 计数器样式
  count: {
    base: 'newsletter-count text-muted-foreground',
    variants: {
      default: 'text-sm',
      minimal: 'text-xs',
      badge: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
    }
  },
  
  // 消息样式
  message: {
    base: 'newsletter-message',
    success: 'text-green-600 dark:text-green-400',
    error: 'text-destructive',
    loading: 'text-muted-foreground animate-pulse',
  },
  
  // 布局样式
  layout: {
    vertical: 'flex flex-col space-y-3',
    horizontal: 'flex flex-row space-x-3',
    inline: 'flex flex-row items-center space-x-2',
  }
} as const;

// 主题预设
export const themes: Record<string, NewsletterTheme> = {
  // 默认主题
  default: {
    colors: {
      primary: 'hsl(221.2 83.2% 53.3%)',
      secondary: 'hsl(210 40% 98%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(222.2 84% 4.9%)',
      muted: 'hsl(210 40% 96%)',
      border: 'hsl(214.3 31.8% 91.4%)',
      input: 'hsl(214.3 31.8% 91.4%)',
      ring: 'hsl(221.2 83.2% 53.3%)',
      destructive: 'hsl(0 84.2% 60.2%)',
    },
    fonts: {
      sans: ['system-ui', '-apple-system', 'sans-serif'],
      mono: ['Consolas', 'Monaco', 'monospace'],
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
    },
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
    }
  },

  // 最小化主题
  minimal: {
    colors: {
      primary: 'hsl(0 0% 9%)',
      secondary: 'hsl(0 0% 96%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(0 0% 9%)',
      muted: 'hsl(0 0% 96%)',
      border: 'hsl(0 0% 89%)',
      input: 'hsl(0 0% 89%)',
      ring: 'hsl(0 0% 9%)',
      destructive: 'hsl(0 84.2% 60.2%)',
    },
    fonts: {
      sans: ['-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      mono: ['SF Mono', 'Monaco', 'monospace'],
    },
    radius: {
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.375rem',
    }
  },

  // 深色主题
  dark: {
    colors: {
      primary: 'hsl(210 40% 98%)',
      secondary: 'hsl(222.2 84% 4.9%)',
      background: 'hsl(222.2 84% 4.9%)',
      foreground: 'hsl(210 40% 98%)',
      muted: 'hsl(217.2 32.6% 17.5%)',
      border: 'hsl(217.2 32.6% 17.5%)',
      input: 'hsl(217.2 32.6% 17.5%)',
      ring: 'hsl(212.7 26.8% 83.9%)',
      destructive: 'hsl(0 62.8% 30.6%)',
    },
    fonts: {
      sans: ['system-ui', '-apple-system', 'sans-serif'],
      mono: ['Consolas', 'Monaco', 'monospace'],
    },
    radius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
    }
  },

  // 现代主题
  modern: {
    colors: {
      primary: 'hsl(262.1 83.3% 57.8%)',
      secondary: 'hsl(270 20% 98%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(224 71.4% 4.1%)',
      muted: 'hsl(270 20% 98%)',
      border: 'hsl(270 20% 90%)',
      input: 'hsl(270 20% 90%)',
      ring: 'hsl(262.1 83.3% 57.8%)',
      destructive: 'hsl(0 84.2% 60.2%)',
    },
    fonts: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    },
    radius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
    }
  },

  // 经典主题
  classic: {
    colors: {
      primary: 'hsl(203 89% 53%)',
      secondary: 'hsl(203 23% 96%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(203 89% 13%)',
      muted: 'hsl(203 23% 96%)',
      border: 'hsl(203 23% 85%)',
      input: 'hsl(203 23% 85%)',
      ring: 'hsl(203 89% 53%)',
      destructive: 'hsl(0 84.2% 60.2%)',
    },
    fonts: {
      sans: ['Georgia', 'Times New Roman', 'serif'],
      mono: ['Courier New', 'monospace'],
    },
    radius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
    }
  },

  // Glassmorphism 主题
  glass: {
    colors: {
      primary: 'rgba(255, 255, 255, 0.9)',
      secondary: 'rgba(255, 255, 255, 0.1)',
      background: 'rgba(255, 255, 255, 0.1)',
      foreground: 'rgba(0, 0, 0, 0.9)',
      muted: 'rgba(0, 0, 0, 0.5)',
      border: 'rgba(255, 255, 255, 0.2)',
      input: 'rgba(255, 255, 255, 0.1)',
      ring: 'rgba(255, 255, 255, 0.5)',
      destructive: 'rgba(239, 68, 68, 0.9)',
    },
    fonts: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    radius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
    }
  }
};

// 样式生成器函数
export function createThemeStyles(theme: NewsletterTheme): string {
  const css = `
:root {
  ${Object.entries(theme.colors || {}).map(([key, value]) => 
    `--newsletter-${key}: ${value};`
  ).join('\n  ')}
  
  ${theme.fonts?.sans ? `--newsletter-font-sans: ${theme.fonts.sans.join(', ')};` : ''}
  ${theme.fonts?.mono ? `--newsletter-font-mono: ${theme.fonts.mono.join(', ')};` : ''}
  
  ${Object.entries(theme.spacing || {}).map(([key, value]) => 
    `--newsletter-spacing-${key}: ${value};`
  ).join('\n  ')}
  
  ${Object.entries(theme.radius || {}).map(([key, value]) => 
    `--newsletter-radius-${key}: ${value};`
  ).join('\n  ')}
}

.newsletter-container {
  font-family: var(--newsletter-font-sans);
  color: var(--newsletter-foreground);
  background-color: var(--newsletter-background);
}

.newsletter-input {
  border-color: var(--newsletter-border);
  background-color: var(--newsletter-input);
  border-radius: var(--newsletter-radius-md);
}

.newsletter-input:focus {
  outline-color: var(--newsletter-ring);
}

.newsletter-button {
  background-color: var(--newsletter-primary);
  color: var(--newsletter-primary-foreground);
  border-radius: var(--newsletter-radius-md);
}

.newsletter-count {
  color: var(--newsletter-muted);
}

.newsletter-success {
  color: var(--newsletter-success, #10b981);
}

.newsletter-error {
  color: var(--newsletter-destructive);
}
`;
  
  return css;
}

// 工具函数：合并样式类
export function mergeStyles(...classes: (string | undefined | null | false)[]): string {
  return cn(...classes);
}

// 工具函数：获取组件样式
export function getComponentStyles(
  component: keyof typeof newsletterStyles,
  variant?: string,
  size?: string,
  className?: string
) {
  const styles = newsletterStyles[component];
  
  if (typeof styles === 'string') {
    return cn(styles, className);
  }
  
  if (typeof styles === 'object' && 'base' in styles) {
    const variantClass = variant && 'variants' in styles ? styles.variants[variant as keyof typeof styles.variants] : '';
    const sizeClass = size && 'sizes' in styles ? styles.sizes[size as keyof typeof styles.sizes] : '';
    
    return cn(styles.base, variantClass, sizeClass, className);
  }
  
  return cn(className);
}

// CSS-in-JS 生成器
export function generateCSSVariables(theme: NewsletterTheme): Record<string, string> {
  const variables: Record<string, string> = {};
  
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([key, value]) => {
      variables[`--newsletter-${key}`] = value;
    });
  }
  
  if (theme.spacing) {
    Object.entries(theme.spacing).forEach(([key, value]) => {
      variables[`--newsletter-spacing-${key}`] = value;
    });
  }
  
  if (theme.radius) {
    Object.entries(theme.radius).forEach(([key, value]) => {
      variables[`--newsletter-radius-${key}`] = value;
    });
  }
  
  if (theme.fonts?.sans) {
    variables['--newsletter-font-sans'] = theme.fonts.sans.join(', ');
  }
  
  if (theme.fonts?.mono) {
    variables['--newsletter-font-mono'] = theme.fonts.mono.join(', ');
  }
  
  return variables;
}

// 导出所有主题名称
export const themeNames = Object.keys(themes) as Array<keyof typeof themes>;