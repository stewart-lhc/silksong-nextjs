/**
 * Hollow Knight: Silksong Design System Tokens
 * 统一的设计语言系统，确保UI的一致性和可维护性
 * Next.js 优化版本
 */

// ============================================================================
// COLOR SYSTEM - 颜色系统
// ============================================================================

export const colorTokens = {
  // Primary Colors - 主色调 (神秘的苔藓绿)
  primary: {
    50: '110 50% 95%',   // 极浅苔藓绿
    100: '110 50% 90%',  // 浅苔藓绿
    200: '110 50% 80%',  // 中浅苔藓绿
    300: '110 50% 65%',  // 中等苔藓绿
    400: '110 50% 50%',  // 标准苔藓绿
    500: '110 50% 35%',  // 主色 (默认)
    600: '110 50% 25%',  // 深苔藓绿
    700: '110 50% 15%',  // 极深苔藓绿
    800: '110 50% 10%',  // 最深苔藓绿
    900: '110 50% 5%',   // 纯深苔藓绿
    glow: '110 60% 45%', // 发光效果
  },

  // Secondary Colors - 辅助色 (深邃森林色)
  secondary: {
    50: '120 25% 95%',
    100: '120 25% 85%',
    200: '120 25% 70%',
    300: '120 25% 55%',
    400: '120 25% 40%',
    500: '120 25% 25%',  // 默认辅助色
    600: '120 25% 20%',
    700: '120 25% 15%',
    800: '120 25% 12%',
    900: '120 25% 8%',
  },

  // Accent Colors - 强调色 (幻想金色)
  accent: {
    50: '45 85% 95%',
    100: '45 85% 90%',
    200: '45 85% 80%',
    300: '45 85% 70%',
    400: '45 85% 60%',   // 默认强调色
    500: '45 75% 55%',
    600: '45 65% 50%',
    700: '45 55% 45%',
    800: '45 45% 40%',
    900: '45 35% 35%',
  },

  // Neutral Colors - 中性色 (暗色主题)
  neutral: {
    50: '120 20% 95%',   // 最亮文字
    100: '120 15% 85%',  // 亮文字
    200: '120 15% 75%',  // 中亮文字
    300: '120 20% 65%',  // 静音文字
    400: '120 20% 45%',  // 次要文字
    500: '120 20% 25%',  // 边框/分割线
    600: '120 20% 15%',  // 输入框背景
    700: '120 20% 10%',  // 卡片背景
    800: '120 20% 6%',   // 弹出层背景
    900: '120 20% 4%',   // 主背景
    950: '120 30% 2%',   // 深阴影
  },

  // Status Colors - 状态色
  status: {
    success: {
      light: '142 76% 36%',
      default: '142 76% 26%',
      dark: '142 76% 16%',
    },
    warning: {
      light: '43 89% 50%',
      default: '43 89% 40%',
      dark: '43 89% 30%',
    },
    error: {
      light: '0 75% 60%',
      default: '0 75% 50%',
      dark: '0 75% 40%',
    },
    info: {
      light: '210 100% 60%',
      default: '210 100% 50%',
      dark: '210 100% 40%',
    },
  },

  // Fantasy Theme Colors - 奇幻主题色
  fantasy: {
    gold: '45 85% 60%',
    silver: '210 10% 85%',
    mystical: '110 60% 45%',
    shadow: '120 30% 2%',
    moss: {
      light: '110 40% 55%',
      dark: '110 40% 25%',
    },
  },
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM - 字体系统
// ============================================================================

export const typographyTokens = {
  // Font Families - 字体族
  fontFamily: {
    primary: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
    heading: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
    body: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
  },

  // Font Sizes - 字体大小 (使用rem单位)
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1' }],         // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
    '7xl': ['4.5rem', { lineHeight: '1' }],       // 72px
    '8xl': ['6rem', { lineHeight: '1' }],         // 96px
    '9xl': ['8rem', { lineHeight: '1' }],         // 128px
  },

  // Font Weights - 字体粗细
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Letter Spacing - 字符间距
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Line Height - 行高
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
} as const;

// ============================================================================
// SPACING SYSTEM - 间距系统
// ============================================================================

export const spacingTokens = {
  // Base unit: 0.25rem (4px)
  0: '0',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  96: '24rem',     // 384px
} as const;

// ============================================================================
// SHADOW SYSTEM - 阴影系统
// ============================================================================

export const shadowTokens = {
  // Standard Shadows - 标准阴影
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  
  // Fantasy Theme Shadows - 奇幻主题阴影
  mystical: '0 10px 40px -10px hsl(110 50% 35% / 0.3)',
  glow: '0 0 30px hsl(110 60% 45% / 0.4)',
  'deep-lg': '0 25px 50px -12px hsl(120 30% 2% / 0.8)',
  'gold-glow': '0 0 20px hsl(45 85% 60% / 0.3)',
  'inner-glow': 'inset 0 0 20px hsl(110 60% 45% / 0.2)',
} as const;

// ============================================================================
// BORDER RADIUS SYSTEM - 边框圆角系统
// ============================================================================

export const borderRadiusTokens = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// ============================================================================
// ANIMATION SYSTEM - 动画系统
// ============================================================================

export const animationTokens = {
  // Duration - 持续时间
  duration: {
    fast: '0.15s',
    normal: '0.3s',
    slow: '0.5s',
    slower: '0.75s',
    slowest: '1s',
  },

  // Timing Functions - 缓动函数
  timing: {
    linear: 'linear',
    ease: 'ease',
    'ease-in': 'ease-in',
    'ease-out': 'ease-out',
    'ease-in-out': 'ease-in-out',
    'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    'mystical': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'glow': 'ease-in-out',
  },

  // Keyframes - 关键帧动画
  keyframes: {
    'fade-in': {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    'fade-out': {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' },
    },
    'slide-up': {
      '0%': { transform: 'translateY(20px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    'slide-down': {
      '0%': { transform: 'translateY(-20px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    'glow-pulse': {
      '0%, 100%': { filter: 'drop-shadow(0 0 10px hsl(110 60% 45% / 0.3))' },
      '50%': { filter: 'drop-shadow(0 0 30px hsl(110 60% 45% / 0.6))' },
    },
    'mystical-float': {
      '0%, 100%': { 
        transform: 'translateY(0) scale(1)', 
        opacity: '0.6' 
      },
      '50%': { 
        transform: 'translateY(-20px) scale(1.1)', 
        opacity: '1' 
      },
    },
    'float': {
      '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
      '50%': { transform: 'translateY(-10px) rotate(1deg)' },
    },
  },
} as const;

// ============================================================================
// BREAKPOINT SYSTEM - 断点系统
// ============================================================================

export const breakpointTokens = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================================================
// Z-INDEX SYSTEM - 层级系统
// ============================================================================

export const zIndexTokens = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// ============================================================================
// GRADIENT SYSTEM - 渐变系统
// ============================================================================

export const gradientTokens = {
  mystical: 'linear-gradient(135deg, hsl(110 50% 35%), hsl(110 60% 45%))',
  shadow: 'linear-gradient(180deg, hsl(120 30% 2%), hsl(120 20% 4%))',
  moss: 'linear-gradient(45deg, hsl(110 40% 25%), hsl(110 40% 55%))',
  gold: 'linear-gradient(135deg, hsl(45 85% 60%), hsl(45 75% 55%))',
  'radial-mystical': 'radial-gradient(circle at center, hsl(110 50% 35%), hsl(110 40% 25%))',
  'conic-fantasy': 'conic-gradient(from 180deg, hsl(110 50% 35%), hsl(45 85% 60%), hsl(110 50% 35%))',
} as const;

// ============================================================================
// TYPE EXPORTS - 类型导出
// ============================================================================

export type ColorToken = keyof typeof colorTokens;
export type TypographyToken = keyof typeof typographyTokens;
export type SpacingToken = keyof typeof spacingTokens;
export type ShadowToken = keyof typeof shadowTokens;
export type BorderRadiusToken = keyof typeof borderRadiusTokens;
export type AnimationToken = keyof typeof animationTokens;
export type BreakpointToken = keyof typeof breakpointTokens;
export type ZIndexToken = keyof typeof zIndexTokens;
export type GradientToken = keyof typeof gradientTokens;

// ============================================================================
// UTILITY FUNCTIONS - 工具函数
// ============================================================================

/**
 * 获取 HSL 颜色值
 * @param token - 颜色 token 路径
 * @returns HSL 颜色字符串
 */
export function getColorValue(token: string): string {
  const parts = token.split('.');
  let current: any = colorTokens;
  
  for (const part of parts) {
    current = current?.[part];
  }
  
  return current ? `hsl(${current})` : '';
}

/**
 * 获取间距值
 * @param token - 间距 token
 * @returns CSS 间距值
 */
export function getSpacingValue(token: keyof typeof spacingTokens): string {
  return spacingTokens[token];
}

/**
 * 获取阴影值
 * @param token - 阴影 token
 * @returns CSS 阴影值
 */
export function getShadowValue(token: keyof typeof shadowTokens): string {
  return shadowTokens[token];
}