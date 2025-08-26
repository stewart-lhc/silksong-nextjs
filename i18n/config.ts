export const i18nConfig = {
  defaultLocale: 'en' as const,
  locales: ['en', 'zh'] as const,
  supportedLocales: process.env.SUPPORTED_LOCALES?.split(',') || ['en', 'zh'],
} as const;

export type Locale = typeof i18nConfig.locales[number];

export const isValidLocale = (locale: string): locale is Locale => {
  return i18nConfig.locales.includes(locale as Locale);
};

export const getDefaultLocale = (): Locale => {
  const envDefault = process.env.DEFAULT_LOCALE as Locale;
  return envDefault && isValidLocale(envDefault) ? envDefault : i18nConfig.defaultLocale;
};