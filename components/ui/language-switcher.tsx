'use client';

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18n } from '@/hooks/use-i18n';
import { cn } from '@/lib/utils';
import type { Locale } from '@/i18n/config';

const localeNames: Record<Locale, { native: string; english: string }> = {
  en: { native: 'English', english: 'English' },
  zh: { native: '中文', english: 'Chinese' },
};

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

export function LanguageSwitcher({ 
  className,
  variant = 'ghost',
  size = 'default',
  showText = true,
}: LanguageSwitcherProps) {
  const { locale, changeLocale, availableLocales, isLoading, t } = useI18n();
  const [isChanging, setIsChanging] = useState(false);

  const handleLocaleChange = async (newLocale: Locale) => {
    if (newLocale === locale || isChanging) return;
    
    setIsChanging(true);
    try {
      await changeLocale(newLocale);
    } catch (error) {
      console.error('Failed to change locale:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const currentLocaleName = localeNames[locale];
  const isDisabled = isLoading || isChanging;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            'gap-2',
            isDisabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          disabled={isDisabled}
          aria-label={t('common.switchLanguage', 'Switch Language')}
        >
          <Globe className="h-4 w-4" />
          {showText && size !== 'icon' && (
            <span className="hidden sm:inline-block">
              {currentLocaleName?.native || locale.toUpperCase()}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {availableLocales.map((availableLocale) => {
          const localeName = localeNames[availableLocale];
          const isActive = availableLocale === locale;
          
          return (
            <DropdownMenuItem
              key={availableLocale}
              onClick={() => handleLocaleChange(availableLocale)}
              className={cn(
                'cursor-pointer gap-2',
                isActive && 'bg-accent font-medium',
                isDisabled && 'opacity-50 pointer-events-none'
              )}
              disabled={isDisabled || isActive}
            >
              <span className="text-sm">{localeName?.native}</span>
              <span className="text-xs text-muted-foreground">
                {localeName?.english}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact variant for mobile/header use
export function LanguageSwitcherCompact({ className }: { className?: string }) {
  return (
    <LanguageSwitcher
      className={className}
      variant="ghost"
      size="sm"
      showText={false}
    />
  );
}

// Full variant for settings/preferences
export function LanguageSwitcherFull({ className }: { className?: string }) {
  return (
    <LanguageSwitcher
      className={className}
      variant="outline"
      size="default"
      showText={true}
    />
  );
}