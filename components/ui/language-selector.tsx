'use client';

import * as React from 'react';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { locales, localeNames, type Locale } from '@/lib/i18n';

interface LanguageSelectorProps {
  value: Locale;
  onValueChange: (locale: Locale) => void;
}

export function LanguageSelector({ value, onValueChange }: LanguageSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          aria-label="Select language"
        >
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{localeNames[value]}</span>
          <span className="sm:hidden">{value.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => onValueChange(locale)}
            className={`cursor-pointer ${
              value === locale ? 'bg-accent' : ''
            }`}
          >
            <span className="mr-2">{locale.toUpperCase()}</span>
            {localeNames[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}