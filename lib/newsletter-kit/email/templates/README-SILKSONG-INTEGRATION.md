# Silksong HTML Template Integration

This document explains how the Silksong HTML template is integrated into the Newsletter Kit email system.

## Overview

The system now supports loading HTML templates directly from the filesystem and using them with the existing email trigger engine. The specific `silksong.html` template has been integrated to provide personalized welcome emails.

## Implementation

### 1. File Template Loader (`file-loader.ts`)

A new utility module that:
- Loads HTML templates from the filesystem
- Supports both `{{variable}}` and `{variable}` placeholder formats
- Automatically extracts template variables from HTML content
- Creates EmailTemplate objects from HTML files

### 2. Enhanced Template Rendering

The template rendering system has been updated to handle mixed placeholder formats:
- `{{DAYS_REMAINING}}` - Double brace format (original system)
- `{URL_HOME}` - Single brace format (new for HTML files)

### 3. Template Integration

The `silksong.html` template is loaded as `silksong-welcome-html` template with ID:
```typescript
const silksongHtmlTemplate: EmailTemplate = createTemplateFromHtmlFile(
  'silksong-welcome-html',
  'Silksong Welcome (HTML File)',
  '🎉 You\'re In – Silksong Tracking Activated',
  'lib/newsletter-kit/email/templates/silksong.html'
);
```

### 4. Token Mapping

All required tokens from the HTML template are provided by the welcome email route:

| Template Token | Route Variable | Description |
|---|---|---|
| `{URL_HOME}` | `emailConfig.baseUrl` | Base website URL |
| `{URL_COMPARE}` | `${baseUrl}/compare-hollow-knight` | Compare page URL |
| `{URL_TIMELINE}` | `${baseUrl}/timeline` | Timeline page URL |
| `{URL_EMBED}` | `${baseUrl}/tools/embed` | Embed tools URL |
| `{URL_CHECKLIST}` | `${baseUrl}/checklist` | Checklist page URL |
| `{URL_DOCS_API}` | `${baseUrl}/developers` | API documentation URL |
| `{URL_EMBED_IFRAME}` | `${baseUrl}/embed/countdown` | Countdown iframe URL |
| `{{DAYS_REMAINING}}` | Calculated days until release | Dynamic countdown |
| `{URL_UNSUBSCRIBE}` | Generated unsubscribe URL | Personalized unsubscribe link |
| `{TRACKING_PIXEL_URL}` | Generated tracking URL | Email tracking pixel |
| `{YEAR}` | `new Date().getFullYear()` | Current year |

## Usage

The HTML template is automatically used when the welcome email trigger is activated:

```typescript
// The route creates this trigger
triggerEngine.addTrigger({
  id: 'silksong-welcome-html-trigger',
  name: 'Silksong Welcome Email (HTML File)',
  type: 'subscription_confirmed',
  enabled: true,
  templateId: 'silksong-welcome-html', // Uses the HTML file template
  delay: 0,
});
```

## Template File Location

The HTML template file is located at:
```
lib/newsletter-kit/email/templates/silksong.html
```

## Benefits

1. **Direct HTML Control**: Use the exact HTML template provided by the user
2. **Token Replacement**: All placeholders are properly replaced with dynamic values
3. **Mixed Format Support**: Handles both `{{}}` and `{}` placeholder formats
4. **Easy Updates**: HTML file can be updated without changing code
5. **Integration**: Works seamlessly with existing trigger system

## Future Enhancements

- Template validation for missing tokens
- Hot reloading of template files in development
- Template caching for better performance
- Support for additional template formats (Handlebars, Mustache, etc.)