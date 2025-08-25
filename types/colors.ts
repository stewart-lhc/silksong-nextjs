/**
 * Hornet 品牌色彩系统 TypeScript 类型定义
 * 基于品牌色 #C43444 设计的完整色彩系统类型
 */

// ============================================================================
// 基础色彩类型定义
// ============================================================================

/** 色彩强度等级 */
export type ColorIntensity =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;

/** 主题模式类型 */
export type ThemeMode = 'light' | 'dark' | 'system';

/** 解析后的主题类型 */
export type ResolvedTheme = 'light' | 'dark';

/** 颜色格式类型 */
export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'css-var';

// ============================================================================
// Hornet 主色板类型
// ============================================================================

/** Hornet 主色板接口 */
export interface HornetPrimaryColors {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // 品牌主色 #C43444
  600: string;
  700: string;
  800: string;
  900: string;
}

/** 主色板键名类型 */
export type HornetPrimaryKey = keyof HornetPrimaryColors;

// ============================================================================
// 辅助色系统类型
// ============================================================================

/** 辅助色类型 */
export interface HornetSecondaryColors {
  blue: string;
  orange: string;
  purple: string;
}

/** 辅助色键名类型 */
export type HornetSecondaryKey = keyof HornetSecondaryColors;

// ============================================================================
// 中性色系统类型
// ============================================================================

/** 中性色接口 */
export interface HornetNeutralColors {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

/** 中性色键名类型 */
export type HornetNeutralKey = keyof HornetNeutralColors;

// ============================================================================
// 功能状态色类型
// ============================================================================

/** 功能状态色接口 */
export interface HornetSemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

/** 功能状态色键名类型 */
export type HornetSemanticKey = keyof HornetSemanticColors;

// ============================================================================
// 语义化颜色类型
// ============================================================================

/** 表面颜色接口 */
export interface HornetSurfaceColors {
  background: string;
  surface: string;
  'surface-variant': string;
  'on-background': string;
  'on-surface': string;
  'on-surface-variant': string;
}

/** 表面颜色键名类型 */
export type HornetSurfaceKey = keyof HornetSurfaceColors;

/** 文字颜色接口 */
export interface HornetTextColors {
  primary: string;
  secondary: string;
  tertiary: string;
  disabled: string;
  'on-primary': string;
}

/** 文字颜色键名类型 */
export type HornetTextKey = keyof HornetTextColors;

/** 边框颜色接口 */
export interface HornetBorderColors {
  default: string;
  hover: string;
  divider: string;
}

/** 边框颜色键名类型 */
export type HornetBorderKey = keyof HornetBorderColors;

// ============================================================================
// 按钮状态色类型
// ============================================================================

/** 按钮状态接口 */
export interface ButtonStateColors {
  default: string;
  hover: string;
  active: string;
  disabled: string;
}

/** 按钮颜色接口 */
export interface HornetButtonColors {
  primary: ButtonStateColors;
  secondary: ButtonStateColors;
}

/** 按钮类型键名 */
export type HornetButtonType = keyof HornetButtonColors;

/** 按钮状态键名 */
export type ButtonState = keyof ButtonStateColors;

// ============================================================================
// 表单元素颜色类型
// ============================================================================

/** 表单输入框颜色接口 */
export interface HornetInputColors {
  background: string;
  border: string;
  'border-focus': string;
  placeholder: string;
}

/** 表单颜色键名类型 */
export type HornetInputKey = keyof HornetInputColors;

// ============================================================================
// 阴影系统类型
// ============================================================================

/** 阴影等级类型 */
export type ShadowLevel = 'sm' | 'default' | 'md' | 'lg';

/** 阴影颜色接口 */
export interface HornetShadowColors {
  sm: string;
  default: string;
  md: string;
  lg: string;
}

// ============================================================================
// 完整色彩系统接口
// ============================================================================

/** Hornet 完整色彩系统接口 */
export interface HornetColorSystem {
  // 主色板
  primary: HornetPrimaryColors;

  // 辅助色
  secondary: HornetSecondaryColors;

  // 中性色
  neutral: HornetNeutralColors;

  // 功能状态色
  semantic: HornetSemanticColors;

  // 语义化颜色
  surface: HornetSurfaceColors;
  text: HornetTextColors;
  border: HornetBorderColors;

  // 组件颜色
  button: HornetButtonColors;
  input: HornetInputColors;

  // 阴影
  shadow: HornetShadowColors;
}

// ============================================================================
// 主题配置类型
// ============================================================================

/** 主题配置接口 */
export interface ThemeConfig {
  mode: ThemeMode;
  resolvedMode: ResolvedTheme;
  colors: HornetColorSystem;
  storageKey?: string;
  enableSystemTheme?: boolean;
  enableTransitions?: boolean;
}

/** 主题上下文接口 */
export interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isLight: boolean;
  isDark: boolean;
  isSystem: boolean;
}

// ============================================================================
// 颜色工具函数类型
// ============================================================================

/** 颜色转换函数类型 */
export type ColorConverter = (color: string) => string;

/** 颜色验证函数类型 */
export type ColorValidator = (color: string) => boolean;

/** 对比度计算函数类型 */
export type ContrastCalculator = (
  foreground: string,
  background: string
) => number;

/** 颜色混合函数类型 */
export type ColorMixer = (
  color1: string,
  color2: string,
  ratio: number
) => string;

// ============================================================================
// CSS 变量类型
// ============================================================================

/** CSS 变量名称类型 */
export type CSSVariableName =
  // 主色板变量
  | `--hornet-${HornetPrimaryKey}`
  // 辅助色变量
  | `--hornet-secondary-${HornetSecondaryKey}`
  // 中性色变量
  | `--hornet-neutral-${HornetNeutralKey}`
  // 功能色变量
  | `--hornet-${HornetSemanticKey}`
  // 语义化颜色变量
  | `--hornet-${HornetSurfaceKey}`
  | `--hornet-text-${HornetTextKey}`
  | `--hornet-border`
  | `--hornet-border-hover`
  | `--hornet-divider`
  // 按钮变量
  | `--hornet-button-${HornetButtonType}-${ButtonState}`
  // 输入框变量
  | `--hornet-input-${HornetInputKey}`
  // 阴影变量
  | `--hornet-shadow-${ShadowLevel}`;

/** CSS 变量值类型 */
export interface CSSVariableValue {
  name: CSSVariableName;
  value: string;
  description?: string;
}

// ============================================================================
// 无障碍相关类型
// ============================================================================

/** WCAG 等级类型 */
export type WCAGLevel = 'AA' | 'AAA';

/** 对比度要求类型 */
export interface ContrastRequirement {
  level: WCAGLevel;
  normalText: number;
  largeText: number;
}

/** 颜色对比度结果接口 */
export interface ContrastResult {
  ratio: number;
  passAA: boolean;
  passAAA: boolean;
  level: WCAGLevel | 'fail';
}

/** 无障碍验证结果接口 */
export interface AccessibilityValidation {
  colorPair: {
    foreground: string;
    background: string;
  };
  contrast: ContrastResult;
  recommendations?: string[];
}

// ============================================================================
// 颜色生成器类型
// ============================================================================

/** 颜色生成选项接口 */
export interface ColorGenerationOptions {
  baseColor: string;
  steps?: number;
  lightnessRange?: [number, number];
  saturationAdjustment?: number;
  hueShift?: number;
}

/** 颜色调色板生成结果接口 */
export interface GeneratedPalette {
  colors: Record<ColorIntensity, string>;
  metadata: {
    baseColor: string;
    generatedAt: Date;
    options: ColorGenerationOptions;
  };
}

// ============================================================================
// 导出工具类型
// ============================================================================

/** 导出格式类型 */
export type ExportFormat = 'css' | 'scss' | 'json' | 'js' | 'ts' | 'tailwind';

/** 导出选项接口 */
export interface ExportOptions {
  format: ExportFormat;
  includeComments?: boolean;
  minify?: boolean;
  prefix?: string;
  theme?: ThemeMode;
}

/** 导出结果接口 */
export interface ExportResult {
  content: string;
  filename: string;
  format: ExportFormat;
  size: number;
}

// ============================================================================
// 颜色系统事件类型
// ============================================================================

/** 主题变更事件类型 */
export interface ThemeChangeEvent {
  oldTheme: ThemeMode;
  newTheme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  timestamp: Date;
}

/** 颜色系统事件监听器类型 */
export type ThemeChangeListener = (event: ThemeChangeEvent) => void;

// ============================================================================
// 实用工具类型
// ============================================================================

/** 深度只读类型 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/** 可选属性类型 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** 颜色系统配置类型（部分可选） */
export type HornetColorSystemConfig = Optional<HornetColorSystem, 'shadow'>;

// ============================================================================
// 类型守卫函数类型
// ============================================================================

/** 主题模式类型守卫 */
export type IsThemeMode = (value: unknown) => value is ThemeMode;

/** 颜色强度类型守卫 */
export type IsColorIntensity = (value: unknown) => value is ColorIntensity;

/** CSS 变量名类型守卫 */
export type IsCSSVariableName = (value: unknown) => value is CSSVariableName;

// ============================================================================
// 默认导出类型
// ============================================================================

/** 默认导出的主要类型 */
export type {
  HornetPrimaryColors as PrimaryColors,
  HornetSemanticColors as SemanticColors,
  ThemeContextValue as ThemeContext,
  HornetColorSystem as default,
};
