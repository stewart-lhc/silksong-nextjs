import { Metadata } from 'next';
import { 
  ReleaseStatusChecker, 
  ETagGenerator, 
  type Language, 
  type OGVariant 
} from '@/lib/og-utils';

/**
 * 动态元数据生成器
 * 用于为页面生成包含动态OG图片的元数据
 */

interface DynamicMetadataOptions {
  title?: string;
  description?: string;
  lang?: Language;
  releaseDate?: string;
  baseUrl?: string;
}

export class DynamicMetadataGenerator {
  /**
   * 生成包含动态OG图片的元数据
   */
  static generateMetadata({
    title = 'Hollow Knight: Silksong',
    description = 'The highly anticipated sequel to Hollow Knight featuring Hornet as the playable protagonist.',
    lang = 'en',
    releaseDate = '2025-12-31',
    baseUrl = 'https://silksong-archive.com'
  }: DynamicMetadataOptions = {}): Metadata {
    
    // 计算状态信息
    const isReleased = ReleaseStatusChecker.isReleased(releaseDate);
    const daysRemaining = ReleaseStatusChecker.getDaysRemaining(releaseDate);
    const variant = ReleaseStatusChecker.getVariant(daysRemaining);
    
    // 生成OG图片URL
    const ogParams = new URLSearchParams();
    ogParams.set('lang', lang);
    ogParams.set('releaseDate', releaseDate);
    const ogImageUrl = `${baseUrl}/api/og?${ogParams.toString()}`;
    
    // 生成动态标题和描述
    const dynamicTitle = this.generateDynamicTitle(title, isReleased, daysRemaining, lang);
    const dynamicDescription = this.generateDynamicDescription(description, isReleased, daysRemaining, lang);
    
    return {
      title: dynamicTitle,
      description: dynamicDescription,
      openGraph: {
        type: 'website',
        url: baseUrl,
        title: dynamicTitle,
        description: dynamicDescription,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: dynamicTitle,
          }
        ],
        siteName: 'Silk Song Archive',
      },
      twitter: {
        card: 'summary_large_image',
        title: dynamicTitle,
        description: dynamicDescription,
        images: [ogImageUrl],
        creator: '@teamcherry',
      },
      other: {
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:type': 'image/png',
        'og:updated_time': new Date().toISOString(),
        'silksong:variant': variant,
        'silksong:days_remaining': daysRemaining.toString(),
        'silksong:lang': lang,
      }
    };
  }

  /**
   * 生成动态标题
   */
  private static generateDynamicTitle(
    baseTitle: string, 
    isReleased: boolean, 
    daysRemaining: number, 
    lang: Language
  ): string {
    if (isReleased) {
      return lang === 'zh' 
        ? `${baseTitle} - 现已推出！` 
        : `${baseTitle} - Now Available!`;
    }
    
    if (daysRemaining <= 7 && daysRemaining > 0) {
      const dayText = daysRemaining === 1 ? 'day' : 'days';
      return lang === 'zh'
        ? `${baseTitle} - 仅剩 ${daysRemaining} 天！`
        : `${baseTitle} - Only ${daysRemaining} ${dayText} left!`;
    }
    
    if (daysRemaining <= 30 && daysRemaining > 7) {
      return lang === 'zh'
        ? `${baseTitle} - ${daysRemaining} 天后发布`
        : `${baseTitle} - ${daysRemaining} days to release`;
    }
    
    return baseTitle;
  }

  /**
   * 生成动态描述
   */
  private static generateDynamicDescription(
    baseDescription: string,
    isReleased: boolean,
    daysRemaining: number,
    lang: Language
  ): string {
    if (isReleased) {
      const releasedText = lang === 'zh' 
        ? '游戏现已正式发布！立即开始您的丝之歌冒险。' 
        : 'The game is now officially released! Start your Silksong adventure today.';
      return `${baseDescription} ${releasedText}`;
    }
    
    if (daysRemaining <= 7 && daysRemaining > 0) {
      const urgentText = lang === 'zh'
        ? `发布在即！仅剩 ${daysRemaining} 天。`
        : `Release is imminent! Only ${daysRemaining} days remaining.`;
      return `${baseDescription} ${urgentText}`;
    }
    
    if (daysRemaining > 0) {
      const countdownText = lang === 'zh'
        ? `距离发布还有 ${daysRemaining} 天。`
        : `${daysRemaining} days until release.`;
      return `${baseDescription} ${countdownText}`;
    }
    
    return baseDescription;
  }

  /**
   * 为特定页面生成元数据
   */
  static generatePageMetadata(
    pageType: 'home' | 'timeline' | 'platforms' | 'faq' | 'checklist',
    options: DynamicMetadataOptions = {}
  ): Metadata {
    const pageConfigs = {
      home: {
        title: 'Hollow Knight: Silksong - Official Info & Release Countdown',
        description: 'Your ultimate destination for Hollow Knight: Silksong news, updates, and comprehensive game information.',
      },
      timeline: {
        title: 'Hollow Knight: Silksong Timeline - Development History',
        description: 'Track the complete development timeline of Hollow Knight: Silksong from announcement to release.',
      },
      platforms: {
        title: 'Hollow Knight: Silksong Platforms - Where to Play',
        description: 'Discover all available platforms for Hollow Knight: Silksong including PC, Steam, Nintendo Switch, PlayStation, and Xbox.',
      },
      faq: {
        title: 'Hollow Knight: Silksong FAQ - Frequently Asked Questions',
        description: 'Find answers to the most frequently asked questions about Hollow Knight: Silksong gameplay, release date, and features.',
      },
      checklist: {
        title: 'Hollow Knight: Silksong Pre-Release Checklist',
        description: 'Get ready for Silksong release with our comprehensive pre-release checklist and preparation guide.',
      },
    };
    
    const config = pageConfigs[pageType];
    
    return this.generateMetadata({
      title: config.title,
      description: config.description,
      ...options,
    });
  }
}

/**
 * 获取当前页面的动态OG图片URL
 */
export function getDynamicOGImageUrl(
  lang: Language = 'en',
  releaseDate: string = '2025-12-31',
  baseUrl: string = 'https://silksong-archive.com'
): string {
  const params = new URLSearchParams();
  params.set('lang', lang);
  params.set('releaseDate', releaseDate);
  return `${baseUrl}/api/og?${params.toString()}`;
}

/**
 * 获取静态备选OG图片URL（基于变体）
 */
export function getStaticOGImageUrl(
  releaseDate: string = '2025-12-31',
  baseUrl: string = 'https://silksong-archive.com'
): string {
  const variant = ReleaseStatusChecker.getVariant(
    ReleaseStatusChecker.getDaysRemaining(releaseDate)
  );
  return `${baseUrl}/og/${variant}.png`;
}

/**
 * 预热动态OG图片缓存
 */
export async function prefetchOGImages(
  lang: Language = 'en',
  releaseDate: string = '2025-12-31',
  baseUrl: string = 'https://silksong-archive.com'
): Promise<void> {
  try {
    const ogUrl = getDynamicOGImageUrl(lang, releaseDate, baseUrl);
    // 在服务端预热缓存
    await fetch(ogUrl, { method: 'HEAD' });
  } catch (error) {
    console.warn('Failed to prefetch OG image:', error);
  }
}