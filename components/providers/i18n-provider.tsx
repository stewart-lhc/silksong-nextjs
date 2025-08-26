'use client';

import { createContext, useContext, useEffect } from 'react';
import { useI18n } from '@/hooks/use-i18n';
import type { Locale } from '@/i18n/config';
import type { I18nTranslations } from '@/i18n/types';

interface I18nContextType {
  locale: Locale;
  translations: I18nTranslations | null;
  isLoading: boolean;
  error: string | null;
  changeLocale: (locale: Locale) => Promise<void>;
  t: (key: string, fallback?: string) => string;
  preloadLocale: (locale: Locale) => Promise<void>;
  availableLocales: readonly Locale[];
  defaultLocale: Locale;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const i18nHook = useI18n();
  
  // Preload alternate locale for better performance
  useEffect(() => {
    const preloadAlternateLocale = async () => {
      const alternateLocale = i18nHook.locale === 'en' ? 'zh' : 'en';
      await i18nHook.preloadLocale(alternateLocale);
    };
    
    // Preload after initial load is complete
    if (!i18nHook.isLoading && i18nHook.translations) {
      const timeoutId = setTimeout(preloadAlternateLocale, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [i18nHook.isLoading, i18nHook.translations, i18nHook.locale, i18nHook.preloadLocale]);

  return (
    <I18nContext.Provider value={i18nHook}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18nContext(): I18nContextType {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18nContext must be used within an I18nProvider');
  }
  return context;
}

// Re-export useI18n for backwards compatibility
export { useI18n };