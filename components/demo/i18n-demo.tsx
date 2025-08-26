'use client';

import { useI18n } from '@/hooks/use-i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { Loader2 } from 'lucide-react';

/**
 * I18n Demo Component
 * 
 * Demonstrates how to use the i18n system:
 * - Dynamic language switching
 * - Translation function usage
 * - Loading states
 * - Error handling
 */
export function I18nDemo() {
  const { 
    locale, 
    translations, 
    isLoading, 
    error, 
    t, 
    availableLocales,
    changeLocale 
  } = useI18n();

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading translations...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-2xl border-destructive">
        <CardContent className="p-8">
          <div className="text-destructive">
            <h3 className="font-semibold">Translation Error</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>I18n System Demo</CardTitle>
          <CardDescription>
            Test the internationalization system with dynamic language switching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Current Language:</strong>
              <div className="mt-1 px-2 py-1 bg-muted rounded text-xs">
                {locale.toUpperCase()} ({locale === 'en' ? 'English' : '中文'})
              </div>
            </div>
            <div>
              <strong>Available Languages:</strong>
              <div className="mt-1 px-2 py-1 bg-muted rounded text-xs">
                {availableLocales.join(', ').toUpperCase()}
              </div>
            </div>
          </div>

          {/* Language Switcher */}
          <div>
            <strong className="text-sm">Language Switcher:</strong>
            <div className="mt-2">
              <LanguageSwitcher variant="outline" showText={true} />
            </div>
          </div>

          {/* Translation Examples */}
          <div>
            <strong className="text-sm">Translation Examples:</strong>
            <div className="mt-2 space-y-2 text-sm">
              <div className="p-2 bg-muted rounded">
                <code className="text-xs text-muted-foreground">t('hero.title')</code>
                <div className="font-medium">{t('hero.title')}</div>
              </div>
              <div className="p-2 bg-muted rounded">
                <code className="text-xs text-muted-foreground">t('nav.timeline')</code>
                <div className="font-medium">{t('nav.timeline')}</div>
              </div>
              <div className="p-2 bg-muted rounded">
                <code className="text-xs text-muted-foreground">t('common.loading')</code>
                <div className="font-medium">{t('common.loading')}</div>
              </div>
            </div>
          </div>

          {/* Quick Language Switch Buttons */}
          <div>
            <strong className="text-sm">Quick Switch:</strong>
            <div className="mt-2 flex gap-2">
              {availableLocales.map((lang) => (
                <Button
                  key={lang}
                  variant={lang === locale ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => changeLocale(lang)}
                  disabled={lang === locale}
                >
                  {lang === 'en' ? '🇺🇸 English' : '🇨🇳 中文'}
                </Button>
              ))}
            </div>
          </div>

          {/* Raw Translation Data (for debugging) */}
          <details className="text-xs">
            <summary className="cursor-pointer font-medium text-sm">
              Debug: Translation Keys
            </summary>
            <div className="mt-2 p-2 bg-muted rounded max-h-40 overflow-y-auto">
              <pre className="text-xs">
                {translations ? 
                  Object.keys(translations).join(', ') : 
                  'No translations loaded'
                }
              </pre>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}