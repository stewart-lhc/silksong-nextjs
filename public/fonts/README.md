# OG Image Fonts Directory

This directory contains fonts used for dynamic OG image generation.

## Font Files

The following font files should be placed in this directory:

### Primary Font
- **File**: `OGFontPrimary.woff2` (configured via `OG_FONT_PRIMARY` environment variable)
- **Purpose**: Main font for OG image text
- **Recommended**: Inter, Roboto, or similar modern sans-serif font
- **Weight**: 400-800 range supported

### Fallback Font  
- **File**: `OGFontFallback.woff2` (configured via `OG_FONT_FALLBACK` environment variable)
- **Purpose**: Fallback font when primary font fails to load
- **Recommended**: System font like Arial or similar
- **Weight**: 400-800 range supported

## Environment Configuration

Set these environment variables in your `.env.local`:

```bash
# OG Font Configuration
OG_FONT_PRIMARY=OGFontPrimary
OG_FONT_FALLBACK=OGFontFallback
FAIL_ON_OG_FONT_MISSING=false
```

## Font Loading Behavior

1. **Both fonts available**: Uses primary font with fallback support
2. **Only primary available**: Uses primary font only
3. **Only fallback available**: Uses fallback font only
4. **No fonts available**:
   - If `FAIL_ON_OG_FONT_MISSING=true`: Redirects to static `/og/current.png`
   - If `FAIL_ON_OG_FONT_MISSING=false`: Uses system fonts

## Font Requirements

- **Format**: WOFF2 (Web Open Font Format 2.0)
- **Size**: Recommend < 200KB per file for performance
- **Subset**: Consider using font subsets for common characters only
- **License**: Ensure fonts are licensed for web use

## Adding Custom Fonts

1. Download your preferred font in WOFF2 format
2. Rename files to match environment variable names
3. Place in this directory
4. Update environment variables if using different names
5. Test OG image generation: `/api/og?lang=en`

## Multilingual Support

For Chinese language support (`?lang=zh`), ensure your fonts include:
- CJK (Chinese, Japanese, Korean) character sets
- Or use fonts specifically designed for Chinese text
- Consider using Noto Sans CJK or similar

## Performance Tips

1. Use font subsets for faster loading
2. Enable font caching in production
3. Monitor font loading times in edge environments
4. Consider font preloading for critical paths

## Troubleshooting

If OG images are not generating:
1. Check font files exist and are readable
2. Verify environment variables are set correctly
3. Test individual font loading in development
4. Check server logs for font loading errors
5. Ensure fonts are valid WOFF2 format