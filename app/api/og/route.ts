import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
// Edge runtime compatible hash function
import React from 'react';
import { loadOGFonts, getOGFontFamily } from '@/lib/og-font-loader';

export const runtime = 'edge';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

// 多语言文本配置
const OG_TEXTS = {
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

type Language = keyof typeof OG_TEXTS;
type OGVariant = 'released' | 'lt7' | 'lt30' | '30plus';

/**
 * 获取游戏发布日期
 * 从环境变量SILKSONG_RELEASE_ISO获取
 */
function getReleaseDate(): string {
  return process.env.SILKSONG_RELEASE_ISO || '2025-12-31T00:00:00Z';
}

/**
 * 验证和规范化语言参数
 */
function normalizeLanguage(lang?: string): Language {
  if (lang === 'zh' || lang === 'zh-CN' || lang === 'zh-TW') return 'zh';
  return 'en'; // 默认英文
}

/**
 * 检查游戏是否已发布
 */
function isReleased(releaseDate: string): boolean {
  const today = new Date();
  const release = new Date(releaseDate);
  return today >= release;
}

/**
 * 计算剩余天数
 */
function getDaysRemaining(releaseDate: string): number {
  if (isReleased(releaseDate)) return 0;
  
  const today = new Date();
  const release = new Date(releaseDate);
  const diffTime = release.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * 根据剩余天数确定变体
 */
function getVariant(daysRemaining: number): OGVariant {
  if (daysRemaining === 0) return 'released';
  if (daysRemaining <= 7) return 'lt7';
  if (daysRemaining <= 30) return 'lt30';
  return '30plus';
}

/**
 * 计算OG图片的ETag
 * 基础字符串：releaseDate|daysRemaining|variant|lang
 * Edge runtime compatible hash function
 */
async function calculateETag(
  releaseDate: string,
  daysRemaining: number,
  variant: OGVariant,
  lang: Language
): Promise<string> {
  const baseString = `${releaseDate}|${daysRemaining}|${variant}|${lang}`;
  
  // Use Web Crypto API which is available in Edge Runtime
  const encoder = new TextEncoder();
  const data = encoder.encode(baseString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  const hashHex = Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return hashHex.substring(0, 16);
}

/**
 * 生成标题
 */
function getTitle(lang: Language, isReleasedState: boolean): string {
  const texts = OG_TEXTS[lang];
  return isReleasedState ? texts.releasedTitle : texts.title;
}

/**
 * 生成副标题
 */
function getSubtitle(lang: Language, isReleasedState: boolean): string {
  const texts = OG_TEXTS[lang];
  return isReleasedState ? texts.releasedSubtitle : texts.subtitle;
}

/**
 * 生成倒计时文本
 * <=7天时强调显示
 * 已发布时显示"Released!/已发布！"
 */
function getCountdownText(lang: Language, daysRemaining: number, isUrgent: boolean = false): string {
  const texts = OG_TEXTS[lang];
  
  if (daysRemaining === 0) return '';
  
  const dayText = daysRemaining === 1 ? texts.dayLabel : texts.daysLabel;
  const countText = `${daysRemaining} ${dayText}`;
  
  if (isUrgent && daysRemaining <= 7) {
    return `${texts.urgentPrefix} ${countText}${texts.urgentSuffix}`;
  }
  
  return countText;
}

/**
 * 验证日期格式
 */
function isValidDateFormat(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 生成缓存控制头
 */
function getCacheControlHeader(): string {
  return 'public, max-age=3600, stale-while-revalidate=300';
}

/**
 * 创建302重定向响应（字体缺失时使用）
 */
function createRedirect(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      'Cache-Control': getCacheControlHeader(),
    },
  });
}

/**
 * 主要的GET请求处理器
 * 支持多语言、动态倒计时、ETag缓存、字体加载等功能
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 获取参数
    const langParam = searchParams.get('lang');
    const releaseDateParam = searchParams.get('releaseDate');
    let releaseDate: string;
    
    if (releaseDateParam) {
      // 如果提供了日期参数，验证格式
      if (!isValidDateFormat(releaseDateParam)) {
        return new Response('Invalid date format. Use YYYY-MM-DD.', { status: 400 });
      }
      releaseDate = releaseDateParam;
    } else {
      // 使用环境变量中的日期，并转换为YYYY-MM-DD格式
      const isoDate = getReleaseDate();
      releaseDate = isoDate.split('T')[0]; // 从ISO格式提取日期部分
    }

    // 规范化语言
    const lang = normalizeLanguage(langParam || undefined);
    
    // 计算状态
    const isReleasedState = isReleased(releaseDate);
    const daysRemaining = getDaysRemaining(releaseDate);
    const variant = getVariant(daysRemaining);
    const isUrgent = daysRemaining > 0 && daysRemaining <= 7;

    // 计算ETag
    const etag = await calculateETag(releaseDate, daysRemaining, variant, lang);
    
    // 检查If-None-Match头（304 Not Modified支持）
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new Response(null, {
        status: 304,
        headers: {
          'Cache-Control': getCacheControlHeader(),
          ETag: etag,
        },
      });
    }

    // 加载字体配置
    const fontResult = await loadOGFonts();
    
    // 如果字体加载失败且配置为严格模式，重定向到静态图片
    if (fontResult.source === 'error') {
      const staticImagePath = `/og/current.png`;
      return createRedirect(staticImagePath);
    }

    // 生成文本内容
    const title = getTitle(lang, isReleasedState);
    const subtitle = getSubtitle(lang, isReleasedState);
    const countdownText = getCountdownText(lang, daysRemaining, isUrgent);

    // 根据紧急程度和状态确定颜色
    const getBgColor = () => {
      if (isReleasedState) return '#22c55e'; // 绿色 - 已发布
      if (isUrgent) return '#dc2626'; // 红色 - 紧急（<=7天）
      return '#1e293b'; // 深蓝灰色 - 正常
    };

    const getTextColor = () => {
      if (isReleasedState || isUrgent) return '#ffffff';
      return '#f8fafc';
    };

    const bgColor = getBgColor();
    const textColor = getTextColor();
    const fontFamily = await getOGFontFamily();

    // 生成图片内容（使用React.createElement确保Edge Runtime兼容性）
    const content = React.createElement(
      'div',
      {
        style: {
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bgColor,
          backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
          fontFamily: fontFamily,
          position: 'relative',
        },
      },
      // 背景装饰图案
      React.createElement('div', {
        style: {
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 70%)',
        },
      }),
      // Logo区域
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '32px',
          },
        },
        React.createElement(
          'div',
          {
            style: {
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              marginRight: '24px',
            },
          },
          '🦋'
        )
      ),
      // 主标题
      React.createElement(
        'h1',
        {
          style: {
            fontSize: lang === 'zh' ? '56px' : '64px',
            fontWeight: 800,
            color: textColor,
            textAlign: 'center',
            margin: '0 48px 16px',
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
            lineHeight: '1.1',
          },
        },
        title
      ),
      // 副标题
      React.createElement(
        'p',
        {
          style: {
            fontSize: '28px',
            fontWeight: 500,
            color: textColor,
            textAlign: 'center',
            margin: '0 48px 32px',
            opacity: 0.9,
          },
        },
        subtitle
      ),
      // 倒计时文本（条件渲染）
      countdownText ? React.createElement(
        'div',
        {
          style: {
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '16px',
            padding: '24px 48px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
          },
        },
        React.createElement(
          'p',
          {
            style: {
              fontSize: lang === 'zh' ? '36px' : '40px',
              fontWeight: 700,
              color: textColor,
              textAlign: 'center',
              margin: 0,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            },
          },
          countdownText
        )
      ) : null,
      // 品牌信息
      React.createElement(
        'div',
        {
          style: {
            position: 'absolute',
            bottom: '32px',
            right: '48px',
            display: 'flex',
            alignItems: 'center',
            color: textColor,
            opacity: 0.7,
            fontSize: '18px',
          },
        },
        React.createElement('span', {}, 'Silk Song Archive')
      ),
      // 语言标识
      React.createElement(
        'div',
        {
          style: {
            position: 'absolute',
            top: '32px',
            right: '48px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            color: textColor,
            fontWeight: 600,
            textTransform: 'uppercase',
          },
        },
        lang
      )
    );

    // 返回动态生成的OG图片
    // Temporarily disable custom fonts to test basic functionality
    return new ImageResponse(
      content,
      {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        // fonts: fontResult.fonts.length > 0 ? fontResult.fonts : undefined,
        headers: {
          'Cache-Control': getCacheControlHeader(),
          ETag: etag,
          'Content-Type': 'image/png',
          'X-Font-Source': fontResult.source,
        },
      }
    );

  } catch (error) {
    console.error('OG Image generation error:', error);
    
    // 发生错误时，重定向到当前静态图片
    return createRedirect('/og/current.png');
  }
}