import { readFile } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';

/**
 * OG图片生成工具函数
 */

// 多语言文本配置
export const OG_TEXTS = {
  en: {
    title: 'Hollow Knight: Silksong',
    subtitle: 'Release Countdown',
    daysLabel: 'days remaining',
    dayLabel: 'day remaining',
    releasedTitle: 'Released!',
    releasedSubtitle: 'Now Available',
    urgentPrefix: 'Only',
    urgentSuffix: 'left!',
  },
  zh: {
    title: '空洞骑士：丝之歌',
    subtitle: '发布倒计时',
    daysLabel: '天后发布',
    dayLabel: '天后发布',
    releasedTitle: '已发布！',
    releasedSubtitle: '现已推出',
    urgentPrefix: '仅剩',
    urgentSuffix: '',
  },
} as const;

export type Language = keyof typeof OG_TEXTS;
export type OGVariant = 'released' | 'lt7' | 'lt30' | '30plus';

/**
 * 字体加载工具
 */
export class FontLoader {
  private static fontCache = new Map<string, ArrayBuffer>();

  static async loadFont(fontName: string): Promise<ArrayBuffer | null> {
    // 检查缓存
    if (this.fontCache.has(fontName)) {
      return this.fontCache.get(fontName)!;
    }

    try {
      const fontPath = join(process.cwd(), 'public', 'fonts', `${fontName}.woff2`);
      const fontBuffer = await readFile(fontPath);
      const arrayBuffer = fontBuffer.buffer.slice(
        fontBuffer.byteOffset,
        fontBuffer.byteOffset + fontBuffer.byteLength
      ) as ArrayBuffer;
      
      // 缓存字体
      this.fontCache.set(fontName, arrayBuffer);
      return arrayBuffer;
    } catch (error) {
      console.warn(`Failed to load font ${fontName}:`, error);
      return null;
    }
  }

  static async loadFontsFromEnv(): Promise<{ primary?: ArrayBuffer; fallback?: ArrayBuffer }> {
    const primaryFontName = process.env.OG_FONT_PRIMARY;
    const fallbackFontName = process.env.OG_FONT_FALLBACK;

    const results: { primary?: ArrayBuffer; fallback?: ArrayBuffer } = {};

    if (primaryFontName) {
      const primaryFont = await this.loadFont(primaryFontName);
      results.primary = primaryFont || undefined;
    }

    if (fallbackFontName) {
      const fallbackFont = await this.loadFont(fallbackFontName);
      results.fallback = fallbackFont || undefined;
    }

    return results;
  }

  static shouldFailOnMissingFont(): boolean {
    return process.env.FAIL_ON_OG_FONT_MISSING === 'true';
  }
}

/**
 * ETag计算工具
 */
export class ETagGenerator {
  /**
   * 计算OG图片的ETag
   * @param releaseDate - 发布日期（YYYY-MM-DD格式）
   * @param daysRemaining - 剩余天数
   * @param variant - 变体类型
   * @param lang - 语言
   * @returns 16位十六进制ETag
   */
  static calculate(
    releaseDate: string,
    daysRemaining: number,
    variant: OGVariant,
    lang: Language
  ): string {
    const baseString = `${releaseDate}|${daysRemaining}|${variant}|${lang}`;
    const hash = createHash('sha256').update(baseString).digest('hex');
    return hash.substring(0, 16);
  }
}

/**
 * 发布状态检测工具
 */
export class ReleaseStatusChecker {
  /**
   * 检查游戏是否已发布
   * @param releaseDate - 发布日期（YYYY-MM-DD格式）
   * @returns 是否已发布
   */
  static isReleased(releaseDate: string): boolean {
    const today = new Date();
    const release = new Date(releaseDate);
    return today >= release;
  }

  /**
   * 计算剩余天数
   * @param releaseDate - 发布日期（YYYY-MM-DD格式）
   * @returns 剩余天数（已发布返回0）
   */
  static getDaysRemaining(releaseDate: string): number {
    if (this.isReleased(releaseDate)) return 0;
    
    const today = new Date();
    const release = new Date(releaseDate);
    const diffTime = release.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * 根据剩余天数确定变体
   * @param daysRemaining - 剩余天数
   * @returns OG变体类型
   */
  static getVariant(daysRemaining: number): OGVariant {
    if (daysRemaining === 0) return 'released';
    if (daysRemaining <= 7) return 'lt7';
    if (daysRemaining <= 30) return 'lt30';
    return '30plus';
  }
}

/**
 * OG文本生成器
 */
export class OGTextGenerator {
  /**
   * 生成主标题文本
   */
  static getTitle(lang: Language, isReleased: boolean): string {
    const texts = OG_TEXTS[lang];
    return isReleased ? texts.releasedTitle : texts.title;
  }

  /**
   * 生成副标题文本
   */
  static getSubtitle(lang: Language, isReleased: boolean): string {
    const texts = OG_TEXTS[lang];
    return isReleased ? texts.releasedSubtitle : texts.subtitle;
  }

  /**
   * 生成倒计时文本
   */
  static getCountdownText(lang: Language, daysRemaining: number, isUrgent: boolean = false): string {
    const texts = OG_TEXTS[lang];
    
    if (daysRemaining === 0) return '';
    
    const dayText = daysRemaining === 1 ? texts.dayLabel : texts.daysLabel;
    const countText = `${daysRemaining} ${dayText}`;
    
    if (isUrgent && daysRemaining <= 7) {
      return `${texts.urgentPrefix} ${countText}${texts.urgentSuffix}`;
    }
    
    return countText;
  }
}

/**
 * 缓存控制工具
 */
export class CacheControl {
  /**
   * 生成缓存控制头
   * @param maxAge - 最大缓存时间（秒）
   * @param staleWhileRevalidate - 过期后重新验证时间（秒）
   * @returns Cache-Control 头值
   */
  static getCacheControlHeader(
    maxAge: number = 3600,
    staleWhileRevalidate: number = 300
  ): string {
    return `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`;
  }
}

/**
 * URL重定向工具
 */
export class RedirectHelper {
  /**
   * 创建302重定向响应
   * @param location - 重定向目标URL
   * @returns Response对象
   */
  static createRedirect(location: string): Response {
    return new Response(null, {
      status: 302,
      headers: {
        Location: location,
        'Cache-Control': CacheControl.getCacheControlHeader(),
      },
    });
  }
}

/**
 * 日期工具
 */
export class DateHelper {
  /**
   * 获取当前日期的YYYY-MM-DD格式字符串
   */
  static getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * 验证日期格式是否为YYYY-MM-DD
   */
  static isValidDateFormat(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}