# I18n Internationalization System

This directory contains the complete internationalization (i18n) system for the Hollow Knight: Silksong Next.js application.

## 🌐 Architecture Overview

The i18n system is designed for:
- **Performance**: Dynamic imports to keep main bundle size ≤170KB
- **Type Safety**: Full TypeScript support with strict typing
- **Maintainability**: Centralized translation management
- **Scalability**: Easy addition of new languages
- **Build Safety**: Automatic validation to prevent build failures

## 📁 Directory Structure

```
i18n/
├── README.md           # This documentation
├── config.ts          # I18n configuration and locale definitions
├── types.ts           # TypeScript interfaces for translations
├── en.json            # English translations (base language)
├── zh.json            # Chinese translations
└── [locale].json      # Additional language files
```

## 🚀 Quick Start

### 1. Using the i18n Hook

```tsx
import { useI18n } from '@/hooks/use-i18n';

function MyComponent() {
  const { t, locale, changeLocale, isLoading } = useI18n();
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.description')}</p>
      <button onClick={() => changeLocale('zh')}>
        Switch to Chinese
      </button>
    </div>
  );
}
```

### 2. Using the Language Switcher

```tsx
import { LanguageSwitcher } from '@/components/ui/language-switcher';

function Navigation() {
  return (
    <nav>
      {/* Other nav items */}
      <LanguageSwitcher />
    </nav>
  );
}
```

### 3. Using the I18n Context

```tsx
import { useI18nContext } from '@/components/providers/i18n-provider';

function MyComponent() {
  const { translations, locale, t } = useI18nContext();
  
  return (
    <div>
      <h2>{t('features.title')}</h2>
      <p>Current locale: {locale}</p>
    </div>
  );
}
```

## 🔧 Configuration

### Environment Variables

Add to your `.env.local`:

```bash
# Required
SUPPORTED_LOCALES=en,zh
DEFAULT_LOCALE=en
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

### Supported Locales

Currently supported languages:
- `en` - English (default)
- `zh` - Chinese (Simplified)

To add a new locale:
1. Add it to `i18nConfig.locales` in `config.ts`
2. Create `[locale].json` with all required keys
3. Update environment variables
4. Run validation: `npm run validate:i18n`

## 📝 Translation File Structure

All translation files must follow this structure:

```json
{
  "nav": {
    "home": "Home",
    "timeline": "Timeline"
  },
  "hero": {
    "title": "Hollow Knight: Silksong",
    "description": "Game description..."
  },
  "common": {
    "loading": "Loading...",
    "error": "An error occurred"
  }
}
```

### Key Requirements

- **All text must be plain strings** (no HTML)
- **All files must have identical key structure**
- **zh.json must contain every key from en.json**
- **Use nested objects for organization**
- **Keep keys descriptive but concise**

## 🛠️ API Reference

### `useI18n()` Hook

```tsx
const {
  locale,           // Current locale ('en' | 'zh')
  translations,     // Current translation object
  isLoading,        // Loading state
  error,           // Error message if any
  changeLocale,    // Function to change language
  t,               // Translation function
  preloadLocale,   // Preload a language
  availableLocales, // Array of supported locales
  defaultLocale    // Default locale
} = useI18n();
```

### Translation Function `t()`

```tsx
// Basic usage
t('hero.title') // Returns translated string

// With fallback
t('missing.key', 'Fallback text') // Returns fallback if key missing

// Nested keys
t('features.combat.title') // Access nested translations
```

### Language Switcher Components

```tsx
// Compact version (for headers)
<LanguageSwitcherCompact />

// Full version (for settings)
<LanguageSwitcherFull />

// Customizable version
<LanguageSwitcher 
  variant="outline" 
  size="sm" 
  showText={true}
/>
```

## ⚡ Performance Features

### Code Splitting
- Translations are dynamically imported
- Only current language is loaded initially
- Other languages load on-demand
- Automatic caching prevents re-downloads

### Bundle Size Optimization
- Main bundle stays under 170KB gzipped
- Translation JSON files are separate chunks
- Tree-shaking removes unused translations

### Caching Strategy
- In-memory caching for loaded translations
- LocalStorage persistence for user preference
- Preloading of alternate languages

## 🧪 Development & Testing

### Validation Script

Ensure all translation files are valid:

```bash
npm run validate:i18n
```

This script:
- ✅ Checks that all locales have matching keys
- ✅ Validates JSON structure
- ✅ Reports missing or extra keys
- ✅ Prevents build failures

### Adding New Translations

1. **Add new keys to `en.json`**:
```json
{
  "newFeature": {
    "title": "New Feature",
    "description": "Feature description"
  }
}
```

2. **Add corresponding keys to all other language files**:
```json
{
  "newFeature": {
    "title": "新功能",
    "description": "功能描述"
  }
}
```

3. **Update TypeScript types in `types.ts`**:
```tsx
export interface I18nTranslations {
  newFeature: {
    title: string;
    description: string;
  };
  // ... other interfaces
}
```

4. **Run validation**:
```bash
npm run validate:i18n
```

5. **Test the translation**:
```tsx
const { t } = useI18n();
console.log(t('newFeature.title'));
```

## 🚀 Build Integration

### Pre-build Validation

The build process automatically validates translations:

```bash
npm run build  # Runs validate:i18n first
```

Build fails if:
- Missing translation keys
- Invalid JSON structure
- Mismatched key structure between files

### Next.js Configuration

Internationalization is configured in `next.config.js`:

```js
module.exports = {
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
    localeDetection: true,
  },
  experimental: {
    optimizePackageImports: ['@/i18n'],
  },
};
```

## 🔍 Troubleshooting

### Common Issues

**Build failing with missing keys:**
```bash
npm run validate:i18n
# Fix missing keys in zh.json
```

**Translations not loading:**
- Check browser console for import errors
- Verify file names match locale codes
- Ensure JSON is valid

**Performance issues:**
- Use the `t()` function instead of direct object access
- Avoid loading translations in loops
- Use `preloadLocale()` for better UX

**Type errors:**
- Update `types.ts` when adding new keys
- Ensure all translation files match the interface

### Debug Mode

Add to component for debugging:

```tsx
const { translations, locale, error } = useI18n();
console.log('Current locale:', locale);
console.log('Translations loaded:', !!translations);
console.log('Error:', error);
```

## 📈 Best Practices

### Translation Keys
- Use descriptive, hierarchical keys: `features.combat.title`
- Keep keys short but meaningful
- Group related translations together
- Use consistent naming conventions

### Performance
- Preload alternate languages after initial load
- Cache translations in memory
- Use dynamic imports for code splitting
- Avoid creating translations in render loops

### Maintenance
- Run validation before every commit
- Keep translation files synchronized
- Document context for translators
- Use meaningful fallback text

### User Experience
- Provide loading states during language changes
- Persist user language preference
- Graceful error handling for missing translations
- Quick access to language switcher

## 📚 Examples

See the demo component at `components/demo/i18n-demo.tsx` for complete usage examples.

---

**Need help?** Check the validation script output or create an issue with specific error messages.