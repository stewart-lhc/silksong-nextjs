'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { i18nConfig, type Locale, isValidLocale, getDefaultLocale } from '@/i18n/config';
import type { I18nTranslations } from '@/i18n/types';

// Cache for loaded translations
const translationCache = new Map<Locale, I18nTranslations>();
const loadingPromises = new Map<Locale, Promise<I18nTranslations>>();

export function useI18n() {
  const [locale, setLocaleState] = useState<Locale>(getDefaultLocale());
  const [translations, setTranslations] = useState<I18nTranslations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef<boolean>(false);

  const loadTranslations = useCallback(async (targetLocale: Locale): Promise<I18nTranslations> => {
    // Return cached translations if available
    if (translationCache.has(targetLocale)) {
      return translationCache.get(targetLocale)!;
    }

    // Return existing promise if already loading
    if (loadingPromises.has(targetLocale)) {
      return loadingPromises.get(targetLocale)!;
    }

    const loadPromise = (async () => {
      try {
        // Dynamic import for code splitting (keeps main bundle small)
        const translationsModule = await import(`../i18n/${targetLocale}.json`);
        const translations = translationsModule.default || translationsModule;
        
        // Cache the translations
        translationCache.set(targetLocale, translations);
        
        return translations;
      } catch (err) {
        console.error(`Failed to load translations for locale: ${targetLocale}`, err);
        throw new Error(`Failed to load ${targetLocale} translations`);
      } finally {
        loadingPromises.delete(targetLocale);
      }
    })();

    loadingPromises.set(targetLocale, loadPromise);
    return loadPromise;
  }, []);

  const changeLocale = useCallback(async (newLocale: Locale) => {
    if (!isValidLocale(newLocale) || newLocale === locale) {
      return;
    }

    setIsLoading(true);
    setError(null);
    loadingRef.current = true;

    try {
      const newTranslations = await loadTranslations(newLocale);
      
      // Only update state if we're still loading the same locale
      if (loadingRef.current) {
        setLocaleState(newLocale);
        setTranslations(newTranslations);
        
        // Store in localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('silksong-locale', newLocale);
        }
      }
    } catch (err) {
      if (loadingRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load translations');
      }
    } finally {
      if (loadingRef.current) {
        setIsLoading(false);
        loadingRef.current = false;
      }
    }
  }, [locale, loadTranslations]);

  // Initialize translations
  useEffect(() => {
    const initializeI18n = async () => {
      let initialLocale = getDefaultLocale();
      
      // Check localStorage for saved locale
      if (typeof window !== 'undefined') {
        const savedLocale = localStorage.getItem('silksong-locale');
        if (savedLocale && isValidLocale(savedLocale)) {
          initialLocale = savedLocale;
        }
      }

      // Check environment variables
      const envLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;
      if (envLocale && isValidLocale(envLocale)) {
        initialLocale = envLocale;
      }

      setIsLoading(true);
      setError(null);
      loadingRef.current = true;

      try {
        const initialTranslations = await loadTranslations(initialLocale);
        
        if (loadingRef.current) {
          setLocaleState(initialLocale);
          setTranslations(initialTranslations);
        }
      } catch (err) {
        if (loadingRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to initialize translations');
          
          // Fallback to default locale if initial locale fails
          if (initialLocale !== i18nConfig.defaultLocale) {
            try {
              const fallbackTranslations = await loadTranslations(i18nConfig.defaultLocale);
              if (loadingRef.current) {
                setLocaleState(i18nConfig.defaultLocale);
                setTranslations(fallbackTranslations);
                setError(null);
              }
            } catch (fallbackErr) {
              if (loadingRef.current) {
                setError('Failed to load any translations');
              }
            }
          }
        }
      } finally {
        if (loadingRef.current) {
          setIsLoading(false);
          loadingRef.current = false;
        }
      }
    };

    initializeI18n();

    return () => {
      loadingRef.current = false;
    };
  }, [loadTranslations]);

  // Helper function to get nested translation values
  const t = useCallback((key: string, fallback?: string): string => {
    if (!translations) {
      return fallback || key;
    }

    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }

    return typeof value === 'string' ? value : (fallback || key);
  }, [translations]);

  // Preload a locale for better performance
  const preloadLocale = useCallback(async (targetLocale: Locale) => {
    if (isValidLocale(targetLocale) && !translationCache.has(targetLocale)) {
      try {
        await loadTranslations(targetLocale);
      } catch (err) {
        console.warn(`Failed to preload locale: ${targetLocale}`, err);
      }
    }
  }, [loadTranslations]);

  return {
    locale,
    translations,
    isLoading,
    error,
    changeLocale,
    t,
    preloadLocale,
    availableLocales: i18nConfig.locales,
    defaultLocale: i18nConfig.defaultLocale,
  };
}