// Simple i18n system for the project
export type Locale = 'en' | 'zh' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'pt' | 'ru';

export const defaultLocale: Locale = 'en';

export const locales: Locale[] = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'pt', 'ru'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ru: 'Русский',
};

// Timeline translations
export const timelineTranslations = {
  en: {
    title: 'Silksong Timeline',
    subtitle: 'A comprehensive timeline of Hollow Knight: Silksong announcements, updates, and community moments',
    legend: {
      official: 'Official',
      media: 'Media',
      community: 'Community',
    },
    loading: 'Loading timeline...',
    error: 'Failed to load timeline data',
    loadMore: 'Load More',
    noMoreItems: 'No more items to load',
    viewSource: 'View Source',
    footerNote: 'This timeline is maintained by the community and may not include every announcement. For the most up-to-date information, follow',
    officialWebsite: "Team Cherry's official website",
    filters: {
      all: 'All',
      official: 'Official',
      media: 'Media',
      community: 'Community',
      announcements: 'Announcements',
      gameplay: 'Gameplay',
      development: 'Development',
    },
    dateFormat: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    } as Intl.DateTimeFormatOptions,
  },
  zh: {
    title: '丝之歌时间线',
    subtitle: '空洞骑士：丝之歌公告、更新和社区动态的完整时间线',
    legend: {
      official: '官方',
      media: '媒体',
      community: '社区',
    },
    loading: '正在加载时间线...',
    error: '加载时间线数据失败',
    loadMore: '加载更多',
    noMoreItems: '没有更多项目了',
    viewSource: '查看来源',
    footerNote: '此时间线由社区维护，可能不包括所有公告。要获取最新信息，请关注',
    officialWebsite: 'Team Cherry官方网站',
    filters: {
      all: '全部',
      official: '官方',
      media: '媒体',
      community: '社区',
      announcements: '公告',
      gameplay: '游戏玩法',
      development: '开发',
    },
    dateFormat: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    } as Intl.DateTimeFormatOptions,
  },
  ja: {
    title: 'シルクソング タイムライン',
    subtitle: 'Hollow Knight: Silksongの発表、アップデート、コミュニティの瞬間の包括的なタイムライン',
    legend: {
      official: '公式',
      media: 'メディア',
      community: 'コミュニティ',
    },
    loading: 'タイムラインを読み込み中...',
    error: 'タイムラインデータの読み込みに失敗しました',
    loadMore: 'さらに読み込む',
    noMoreItems: 'これ以上読み込むアイテムはありません',
    viewSource: 'ソースを表示',
    footerNote: 'このタイムラインはコミュニティによって維持されており、すべての発表を含んでいない可能性があります。最新情報については、',
    officialWebsite: 'Team Cherryの公式ウェブサイト',
    filters: {
      all: 'すべて',
      official: '公式',
      media: 'メディア',
      community: 'コミュニティ',
      announcements: '発表',
      gameplay: 'ゲームプレイ',
      development: '開発',
    },
    dateFormat: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    } as Intl.DateTimeFormatOptions,
  },
  // Add more languages as needed
} as const;

// Checklist translations
export const checklistTranslations = {
  en: {
    title: 'Silksong Readiness Checklist',
    subtitle: 'Prepare yourself for the ultimate Hollow Knight: Silksong experience',
    usernamePlaceholder: 'Enter your name...',
    overallProgress: 'Overall Progress',
    userProgress: '{name}\'s Progress',
    loading: 'Loading checklist...',
    error: 'Failed to load checklist data',
    resetConfirm: 'Are you sure you want to reset all progress? This action cannot be undone.',
    shareProgress: '{name}\'s Silksong Readiness Progress: {progress}% complete! 🦋\n\nGet ready for Hollow Knight: Silksong with this comprehensive checklist.',
    shareProgressAnonymous: 'Silksong Readiness Progress: {progress}% complete! 🦋\n\nGet ready for Hollow Knight: Silksong with this comprehensive checklist.',
    shareCopied: 'Share link copied to clipboard!',
    tooltips: {
      print: 'Print Checklist',
      share: 'Share Progress',
      reset: 'Reset Progress',
    },
    completed: 'completed',
    summary: {
      title: 'Checklist Summary',
      userTitle: '{name}\'s Checklist Summary',
      subtitle: 'Keep track of your preparation progress and ensure you\'re ready for Silksong\'s release!',
    },
    categories: {
      account: '👤 Account Setup',
      lore: '📚 Lore Knowledge',
      hardware: '⚙️ Hardware Ready',
      community: '👥 Community',
    },
  },
  zh: {
    title: '丝之歌准备清单',
    subtitle: '为终极的空洞骑士：丝之歌体验做好准备',
    usernamePlaceholder: '输入您的姓名...',
    overallProgress: '总体进度',
    userProgress: '{name}的进度',
    loading: '正在加载清单...',
    error: '加载清单数据失败',
    resetConfirm: '您确定要重置所有进度吗？此操作无法撤销。',
    shareProgress: '{name}的丝之歌准备进度：{progress}%完成！🦋\n\n使用这个综合清单为空洞骑士：丝之歌做好准备。',
    shareProgressAnonymous: '丝之歌准备进度：{progress}%完成！🦋\n\n使用这个综合清单为空洞骑士：丝之歌做好准备。',
    shareCopied: '分享链接已复制到剪贴板！',
    tooltips: {
      print: '打印清单',
      share: '分享进度',
      reset: '重置进度',
    },
    completed: '已完成',
    summary: {
      title: '清单摘要',
      userTitle: '{name}的清单摘要',
      subtitle: '跟踪您的准备进度，确保您为丝之歌的发布做好准备！',
    },
    categories: {
      account: '👤 账户设置',
      lore: '📚 传说知识',
      hardware: '⚙️ 硬件就绪',
      community: '👥 社区',
    },
  },
  // Add more languages as needed
} as const;

// Type-safe translation getters with proper fallbacks
export function getTranslation(
  type: 'timeline',
  locale?: Locale
): typeof timelineTranslations['en'];
export function getTranslation(
  type: 'checklist',
  locale?: Locale
): typeof checklistTranslations['en'];
export function getTranslation(
  type: 'timeline' | 'checklist',
  locale: Locale = defaultLocale
): any {
  const translations = type === 'timeline' ? timelineTranslations : checklistTranslations;
  
  // Check if the translation exists for the requested locale
  if ((translations as any)[locale]) {
    return (translations as any)[locale];
  }
  
  // Fallback to default locale
  return (translations as any)[defaultLocale];
}

export function formatDate(date: string | Date, locale: Locale = defaultLocale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const translation = getTranslation('timeline', locale);
  
  return dateObj.toLocaleDateString(
    locale === 'zh' ? 'zh-CN' : 
    locale === 'ja' ? 'ja-JP' :
    locale === 'ko' ? 'ko-KR' :
    locale === 'es' ? 'es-ES' :
    locale === 'fr' ? 'fr-FR' :
    locale === 'de' ? 'de-DE' :
    locale === 'pt' ? 'pt-BR' :
    locale === 'ru' ? 'ru-RU' :
    'en-US',
    translation.dateFormat
  );
}

export function getRelativeTime(date: string | Date, locale: Locale = defaultLocale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - dateObj.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Use Intl.RelativeTimeFormat for better i18n support
  const rtf = new Intl.RelativeTimeFormat(
    locale === 'zh' ? 'zh-CN' : 
    locale === 'ja' ? 'ja-JP' :
    locale === 'ko' ? 'ko-KR' :
    locale === 'es' ? 'es-ES' :
    locale === 'fr' ? 'fr-FR' :
    locale === 'de' ? 'de-DE' :
    locale === 'pt' ? 'pt-BR' :
    locale === 'ru' ? 'ru-RU' :
    'en-US',
    { numeric: 'auto' }
  );

  if (diffDays < 1) return rtf.format(0, 'day');
  if (diffDays < 30) return rtf.format(-diffDays, 'day');
  if (diffDays < 365) return rtf.format(-Math.floor(diffDays / 30), 'month');
  return rtf.format(-Math.floor(diffDays / 365), 'year');
}

export function interpolate(template: string, values: Record<string, any>): string {
  return template.replace(/\{([^}]+)\}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match;
  });
}