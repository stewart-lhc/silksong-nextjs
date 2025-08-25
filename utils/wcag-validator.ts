/**
 * WCAG 无障碍标准验证工具
 * 用于检查颜色对比度是否符合 WCAG 2.1 标准
 */

/**
 * 将十六进制颜色转换为 RGB 值
 * @param hex 十六进制颜色值
 * @returns RGB 颜色对象
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // 移除 # 前缀
  hex = hex.replace(/^#/, '');

  // 处理缩写形式 (#RGB)
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // 解析 RGB 值
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * 计算颜色的相对亮度
 * 根据 WCAG 2.1 标准: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 * @param rgb RGB 颜色对象
 * @returns 相对亮度值 (0-1 范围)
 */
export function calculateRelativeLuminance(rgb: {
  r: number;
  g: number;
  b: number;
}): number {
  // 将 RGB 值标准化到 0-1 范围
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  // 应用 sRGB 转换
  const rsrgb = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsrgb = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsrgb = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

  // 计算相对亮度
  return 0.2126 * rsrgb + 0.7152 * gsrgb + 0.0722 * bsrgb;
}

/**
 * 计算两个颜色之间的对比度
 * 根据 WCAG 2.1 标准: https://www.w3.org/TR/WCAG21/#contrast-minimum
 * @param color1 第一个颜色 (十六进制)
 * @param color2 第二个颜色 (十六进制)
 * @returns 对比度比值 (1:1 到 21:1)
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  const luminance1 = calculateRelativeLuminance(rgb1);
  const luminance2 = calculateRelativeLuminance(rgb2);

  // 确保亮的颜色在前面，暗的颜色在后面
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  // 计算对比度
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 检查对比度是否符合 WCAG 2.1 AA 标准
 * @param contrastRatio 对比度比值
 * @param isLargeText 是否为大号文本 (18px+ 或 14px+ 粗体)
 * @returns 是否符合 AA 标准
 */
export function meetsWCAGAA(
  contrastRatio: number,
  isLargeText: boolean = false
): boolean {
  return isLargeText ? contrastRatio >= 3 : contrastRatio >= 4.5;
}

/**
 * 检查对比度是否符合 WCAG 2.1 AAA 标准
 * @param contrastRatio 对比度比值
 * @param isLargeText 是否为大号文本 (18px+ 或 14px+ 粗体)
 * @returns 是否符合 AAA 标准
 */
export function meetsWCAGAAA(
  contrastRatio: number,
  isLargeText: boolean = false
): boolean {
  return isLargeText ? contrastRatio >= 4.5 : contrastRatio >= 7;
}

/**
 * 获取对比度评级
 * @param contrastRatio 对比度比值
 * @returns 对比度评级 (AAA, AA, Fail)
 */
export function getContrastRating(contrastRatio: number): {
  normalText: 'AAA' | 'AA' | 'Fail';
  largeText: 'AAA' | 'AA' | 'Fail';
} {
  return {
    normalText: meetsWCAGAAA(contrastRatio)
      ? 'AAA'
      : meetsWCAGAA(contrastRatio)
        ? 'AA'
        : 'Fail',
    largeText: meetsWCAGAAA(contrastRatio, true)
      ? 'AAA'
      : meetsWCAGAA(contrastRatio, true)
        ? 'AA'
        : 'Fail',
  };
}

/**
 * 调整颜色亮度以满足 WCAG 标准
 * @param foreground 前景色 (十六进制)
 * @param background 背景色 (十六进制)
 * @param targetRatio 目标对比度比值
 * @param adjustForeground 是否调整前景色 (true) 或背景色 (false)
 * @returns 调整后的颜色 (十六进制)
 */
export function adjustColorForContrast(
  foreground: string,
  background: string,
  targetRatio: number = 4.5,
  adjustForeground: boolean = true
): string {
  const currentRatio = calculateContrastRatio(foreground, background);

  // 如果已经满足目标对比度，则不需要调整
  if (currentRatio >= targetRatio) {
    return adjustForeground ? foreground : background;
  }

  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  const fgLuminance = calculateRelativeLuminance(fgRgb);
  const bgLuminance = calculateRelativeLuminance(bgRgb);

  // 确定是需要增加还是减少亮度
  const needLighten = fgLuminance < bgLuminance === adjustForeground;

  // 调整的颜色
  const colorToAdjust = adjustForeground ? fgRgb : bgRgb;
  const otherColor = adjustForeground ? bgRgb : fgRgb;

  // 二分查找合适的亮度
  let min = 0;
  let max = 255;
  let bestColor = { ...colorToAdjust };
  let bestRatio = currentRatio;

  for (let i = 0; i < 15; i++) {
    // 15次迭代通常足够接近最佳值
    const adjustedColor = { ...colorToAdjust };
    const mid = (min + max) / 2;

    if (needLighten) {
      adjustedColor.r = Math.min(255, adjustedColor.r + mid);
      adjustedColor.g = Math.min(255, adjustedColor.g + mid);
      adjustedColor.b = Math.min(255, adjustedColor.b + mid);
    } else {
      adjustedColor.r = Math.max(0, adjustedColor.r - mid);
      adjustedColor.g = Math.max(0, adjustedColor.g - mid);
      adjustedColor.b = Math.max(0, adjustedColor.b - mid);
    }

    const adjustedLuminance = calculateRelativeLuminance(adjustedColor);
    const testColors = adjustForeground
      ? [adjustedColor, otherColor]
      : [otherColor, adjustedColor];

    const testRatio =
      (Math.max(adjustedLuminance, bgLuminance) + 0.05) /
      (Math.min(adjustedLuminance, bgLuminance) + 0.05);

    if (Math.abs(testRatio - targetRatio) < Math.abs(bestRatio - targetRatio)) {
      bestColor = { ...adjustedColor };
      bestRatio = testRatio;
    }

    if (testRatio < targetRatio) {
      if (needLighten) {
        min = mid;
      } else {
        max = mid;
      }
    } else {
      if (needLighten) {
        max = mid;
      } else {
        min = mid;
      }
    }
  }

  // 将 RGB 转换回十六进制
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(bestColor.r)}${toHex(bestColor.g)}${toHex(bestColor.b)}`;
}

export default {
  hexToRgb,
  calculateRelativeLuminance,
  calculateContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  getContrastRating,
  adjustColorForContrast,
};
