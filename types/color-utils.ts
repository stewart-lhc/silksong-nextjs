/**
 * Hornet 色彩系统工具函数类型定义
 * 颜色转换、验证、计算等工具函数的类型声明
 */

import type {
  AccessibilityValidation,
  ColorFormat,
  ColorGenerationOptions,
  ContrastResult,
  GeneratedPalette,
  HornetColorSystem,
  WCAGLevel,
} from './colors';

// ============================================================================
// 颜色转换工具类型
// ============================================================================

/** RGB 颜色值接口 */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/** HSL 颜色值接口 */
export interface HSLColor {
  h: number;
  s: number;
  l: number;
  a?: number;
}

/** HSV 颜色值接口 */
export interface HSVColor {
  h: number;
  s: number;
  v: number;
  a?: number;
}

/** 颜色转换函数集合接口 */
export interface ColorConverters {
  hexToRgb: (hex: string) => RGBColor | null;
  rgbToHex: (rgb: RGBColor) => string;
  hexToHsl: (hex: string) => HSLColor | null;
  hslToHex: (hsl: HSLColor) => string;
  rgbToHsl: (rgb: RGBColor) => HSLColor;
  hslToRgb: (hsl: HSLColor) => RGBColor;
  hexToHsv: (hex: string) => HSVColor | null;
  hsvToHex: (hsv: HSVColor) => string;
  toCssVar: (colorName: string) => string;
  fromCssVar: (cssVar: string) => string;
}

// ============================================================================
// 颜色验证工具类型
// ============================================================================

/** 颜色验证规则接口 */
export interface ColorValidationRule {
  name: string;
  validator: (color: string) => boolean;
  message: string;
}

/** 颜色验证结果接口 */
export interface ColorValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  format?: ColorFormat;
}

/** 颜色验证器接口 */
export interface ColorValidators {
  isValidHex: (hex: string) => boolean;
  isValidRgb: (rgb: string) => boolean;
  isValidHsl: (hsl: string) => boolean;
  isValidCssVar: (cssVar: string) => boolean;
  validateColor: (color: string) => ColorValidationResult;
  validateColorPalette: (
    palette: Record<string, string>
  ) => Record<string, ColorValidationResult>;
}

// ============================================================================
// 颜色计算工具类型
// ============================================================================

/** 颜色计算函数接口 */
export interface ColorCalculators {
  // 亮度计算
  getLuminance: (color: string) => number;

  // 对比度计算
  getContrast: (foreground: string, background: string) => number;

  // 颜色混合
  mixColors: (color1: string, color2: string, ratio: number) => string;

  // 颜色调整
  lighten: (color: string, amount: number) => string;
  darken: (color: string, amount: number) => string;
  saturate: (color: string, amount: number) => string;
  desaturate: (color: string, amount: number) => string;

  // 色相调整
  adjustHue: (color: string, degrees: number) => string;

  // 透明度调整
  setAlpha: (color: string, alpha: number) => string;

  // 颜色距离计算
  getColorDistance: (color1: string, color2: string) => number;
}

// ============================================================================
// 调色板生成工具类型
// ============================================================================

/** 调色板生成策略类型 */
export type PaletteGenerationStrategy =
  | 'linear'
  | 'exponential'
  | 'logarithmic'
  | 'custom';

/** 调色板生成配置接口 */
export interface PaletteGenerationConfig extends ColorGenerationOptions {
  strategy?: PaletteGenerationStrategy;
  customCurve?: (step: number, total: number) => number;
  preserveHue?: boolean;
  maintainSaturation?: boolean;
}

/** 调色板生成器接口 */
export interface PaletteGenerator {
  generatePalette: (config: PaletteGenerationConfig) => GeneratedPalette;
  generateTints: (baseColor: string, steps: number) => string[];
  generateShades: (baseColor: string, steps: number) => string[];
  generateTones: (baseColor: string, steps: number) => string[];
  generateAnalogous: (baseColor: string, count: number) => string[];
  generateComplementary: (baseColor: string) => string[];
  generateTriadic: (baseColor: string) => string[];
  generateTetradic: (baseColor: string) => string[];
}

// ============================================================================
// 无障碍工具类型
// ============================================================================

/** 无障碍检查配置接口 */
export interface AccessibilityCheckConfig {
  level: WCAGLevel;
  fontSize: 'normal' | 'large';
  checkAllCombinations?: boolean;
  includeRecommendations?: boolean;
}

/** 无障碍工具接口 */
export interface AccessibilityTools {
  checkContrast: (
    foreground: string,
    background: string,
    config?: AccessibilityCheckConfig
  ) => ContrastResult;

  validateColorSystem: (
    colorSystem: HornetColorSystem,
    config?: AccessibilityCheckConfig
  ) => AccessibilityValidation[];

  findAccessibleColors: (baseColor: string, targetContrast: number) => string[];

  suggestImprovements: (validation: AccessibilityValidation) => string[];

  generateAccessiblePalette: (
    baseColor: string,
    config: AccessibilityCheckConfig
  ) => GeneratedPalette;
}

// ============================================================================
// 主题工具类型
// ============================================================================

/** 主题生成配置接口 */
export interface ThemeGenerationConfig {
  baseColors: {
    primary: string;
    secondary?: string[];
    neutral?: string;
  };
  generateDarkMode?: boolean;
  contrastLevel?: WCAGLevel;
  customMappings?: Record<string, string>;
}

/** 主题工具接口 */
export interface ThemeTools {
  generateTheme: (config: ThemeGenerationConfig) => HornetColorSystem;
  generateDarkTheme: (lightTheme: HornetColorSystem) => HornetColorSystem;
  optimizeForAccessibility: (
    theme: HornetColorSystem,
    level: WCAGLevel
  ) => HornetColorSystem;
  validateTheme: (theme: HornetColorSystem) => AccessibilityValidation[];
  compareThemes: (
    theme1: HornetColorSystem,
    theme2: HornetColorSystem
  ) => {
    differences: string[];
    similarities: string[];
    recommendations: string[];
  };
}

// ============================================================================
// 导出工具类型
// ============================================================================

/** CSS 导出选项接口 */
export interface CSSExportOptions {
  includeRoot?: boolean;
  includeDarkMode?: boolean;
  includeComments?: boolean;
  customProperties?: boolean;
  minify?: boolean;
  prefix?: string;
}

/** SCSS 导出选项接口 */
export interface SCSSExportOptions extends CSSExportOptions {
  includeVariables?: boolean;
  includeFunctions?: boolean;
  includeMixins?: boolean;
  useMap?: boolean;
}

/** Tailwind 导出选项接口 */
export interface TailwindExportOptions {
  includeExtend?: boolean;
  customPrefix?: string;
  includeUtilities?: boolean;
  includeComponents?: boolean;
}

/** 导出工具接口 */
export interface ExportTools {
  toCSS: (colorSystem: HornetColorSystem, options?: CSSExportOptions) => string;
  toSCSS: (
    colorSystem: HornetColorSystem,
    options?: SCSSExportOptions
  ) => string;
  toJSON: (colorSystem: HornetColorSystem, pretty?: boolean) => string;
  toJavaScript: (colorSystem: HornetColorSystem, esModule?: boolean) => string;
  toTypeScript: (
    colorSystem: HornetColorSystem,
    includeTypes?: boolean
  ) => string;
  toTailwind: (
    colorSystem: HornetColorSystem,
    options?: TailwindExportOptions
  ) => string;
}

// ============================================================================
// 颜色分析工具类型
// ============================================================================

/** 颜色分析结果接口 */
export interface ColorAnalysis {
  dominantColors: string[];
  colorHarmony:
    | 'monochromatic'
    | 'analogous'
    | 'complementary'
    | 'triadic'
    | 'tetradic'
    | 'custom';
  averageLuminance: number;
  contrastRange: {
    min: number;
    max: number;
    average: number;
  };
  accessibilityScore: number;
  recommendations: string[];
}

/** 颜色分析工具接口 */
export interface ColorAnalysisTools {
  analyzeColorSystem: (colorSystem: HornetColorSystem) => ColorAnalysis;
  findDominantColors: (colors: string[], count?: number) => string[];
  detectColorHarmony: (colors: string[]) => ColorAnalysis['colorHarmony'];
  calculateAccessibilityScore: (colorSystem: HornetColorSystem) => number;
  generateRecommendations: (analysis: ColorAnalysis) => string[];
}

// ============================================================================
// 实用工具函数类型
// ============================================================================

/** 工具函数集合接口 */
export interface ColorUtils {
  converters: ColorConverters;
  validators: ColorValidators;
  calculators: ColorCalculators;
  paletteGenerator: PaletteGenerator;
  accessibilityTools: AccessibilityTools;
  themeTools: ThemeTools;
  exportTools: ExportTools;
  analysisTools: ColorAnalysisTools;
}

// ============================================================================
// 类型守卫函数
// ============================================================================

/** RGB 颜色类型守卫 */
export type IsRGBColor = (value: unknown) => value is RGBColor;

/** HSL 颜色类型守卫 */
export type IsHSLColor = (value: unknown) => value is HSLColor;

/** HSV 颜色类型守卫 */
export type IsHSVColor = (value: unknown) => value is HSVColor;

/** 颜色格式检测函数类型 */
export type DetectColorFormat = (color: string) => ColorFormat | null;

// ============================================================================
// 错误类型定义
// ============================================================================

/** 颜色工具错误基类 */
export class ColorUtilsError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'ColorUtilsError';
  }
}

/** 颜色转换错误 */
export class ColorConversionError extends ColorUtilsError {
  constructor(
    message: string,
    public inputColor: string,
    public targetFormat: ColorFormat
  ) {
    super(message, 'COLOR_CONVERSION_ERROR');
    this.name = 'ColorConversionError';
  }
}

/** 颜色验证错误 */
export class ColorValidationError extends ColorUtilsError {
  constructor(
    message: string,
    public invalidColor: string
  ) {
    super(message, 'COLOR_VALIDATION_ERROR');
    this.name = 'ColorValidationError';
  }
}

/** 无障碍检查错误 */
export class AccessibilityError extends ColorUtilsError {
  constructor(
    message: string,
    public colorPair: { foreground: string; background: string }
  ) {
    super(message, 'ACCESSIBILITY_ERROR');
    this.name = 'AccessibilityError';
  }
}

// ============================================================================
// 常量类型定义
// ============================================================================

/** WCAG 对比度要求常量 */
export const WCAG_CONTRAST_REQUIREMENTS = {
  AA: {
    normalText: 4.5,
    largeText: 3.0,
  },
  AAA: {
    normalText: 7.0,
    largeText: 4.5,
  },
} as const;

/** 颜色格式正则表达式常量 */
export const COLOR_FORMAT_REGEX = {
  hex: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  rgb: /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/,
  rgba: /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/,
  hsl: /^hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/,
  hsla: /^hsla\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([\d.]+)\s*\)$/,
  cssVar: /^var\(--[\w-]+\)$/,
} as const;

// ============================================================================
// 默认导出
// ============================================================================

export type { ColorUtils as default };
