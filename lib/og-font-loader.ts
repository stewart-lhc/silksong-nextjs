/**
 * OpenGraph Font Loader with Module-Level Caching and Fallback Logic
 * PRD Day3 Implementation - Edge Runtime Compatible
 * 
 * Features:
 * - Module-level caching for optimal performance in edge runtime
 * - Fallback mechanism with multiple font sources
 * - Environment-based configuration
 * - Error handling with graceful degradation
 * - Font file validation and format checking
 * - FAIL_ON_OG_FONT_MISSING configuration support
 * - Edge runtime compatible (uses fetch instead of fs)
 */
import { env } from '@/lib/env';

// Font configuration interface
interface FontConfig {
  name: string;
  data: ArrayBuffer;
  style: 'normal' | 'italic';
  weight?: number;
}

interface FontLoadResult {
  fonts: FontConfig[];
  source: 'primary' | 'fallback' | 'system' | 'error';
  message?: string;
}

// Module-level cache for font buffers
const fontCache = new Map<string, ArrayBuffer>();

// Font loading status tracking
let fontLoadingAttempted = false;
let lastLoadResult: FontLoadResult | null = null;

/**
 * Get the font file URL based on environment variable name
 * Edge runtime compatible - uses fetch instead of filesystem
 */
function getFontFileUrl(fontName: string): string {
  // In edge runtime, we need absolute URLs for fetch
  // Use APP_URL as base but detect current port in development
  let baseUrl = env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // In development, try to detect current port from process.env.PORT
  if (process.env.NODE_ENV === 'development' && process.env.PORT) {
    baseUrl = `http://localhost:${process.env.PORT}`;
  }
  
  const fontFileName = `${fontName}.woff2`;
  return `${baseUrl}/fonts/${fontFileName}`;
}

/**
 * Validate if a buffer is a valid WOFF2 font file
 */
function isValidWOFF2(buffer: ArrayBuffer): boolean {
  try {
    const view = new Uint8Array(buffer);
    
    // WOFF2 files start with 'wOF2' magic bytes
    const magic = String.fromCharCode(view[0], view[1], view[2], view[3]);
    return magic === 'wOF2';
  } catch {
    return false;
  }
}

/**
 * Fetch font file via HTTP with error handling
 * Edge runtime compatible
 */
async function fetchFontFile(fontUrl: string): Promise<ArrayBuffer | null> {
  try {
    // Check cache first
    const cacheKey = fontUrl;
    if (fontCache.has(cacheKey)) {
      return fontCache.get(cacheKey)!;
    }

    const response = await fetch(fontUrl);
    if (!response.ok) {
      console.warn(`⚠️  Failed to fetch font from ${fontUrl}: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const arrayBuffer = await response.arrayBuffer();
    
    // Validate WOFF2 format
    if (!isValidWOFF2(arrayBuffer)) {
      console.warn(`⚠️  Font file at ${fontUrl} is not a valid WOFF2 file`);
      return null;
    }
    
    // Cache the buffer for future use
    fontCache.set(cacheKey, arrayBuffer);
    
    return arrayBuffer;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️  Failed to fetch font file from ${fontUrl}: ${errorMessage}`);
    return null;
  }
}

/**
 * Create a system font configuration as ultimate fallback
 */
function createSystemFontConfig(): FontConfig[] {
  // Return empty array to use system fonts
  // Next.js ImageResponse will use system fonts when no fonts are provided
  return [];
}

/**
 * Load primary font with caching
 */
async function loadPrimaryFont(): Promise<FontConfig | null> {
  try {
    const primaryFontName = env.OG_FONT_PRIMARY;
    if (!primaryFontName?.trim()) {
      console.warn('⚠️  OG_FONT_PRIMARY is not configured');
      return null;
    }

    const fontUrl = getFontFileUrl(primaryFontName);
    const fontData = await fetchFontFile(fontUrl);
    
    if (!fontData) {
      return null;
    }

    return {
      name: primaryFontName,
      data: fontData,
      style: 'normal',
      weight: 400, // Default weight
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️  Failed to load primary font: ${errorMessage}`);
    return null;
  }
}

/**
 * Load fallback font with caching
 */
async function loadFallbackFont(): Promise<FontConfig | null> {
  try {
    const fallbackFontName = env.OG_FONT_FALLBACK;
    if (!fallbackFontName?.trim()) {
      return null;
    }

    const fontUrl = getFontFileUrl(fallbackFontName);
    const fontData = await fetchFontFile(fontUrl);
    
    if (!fontData) {
      return null;
    }

    return {
      name: fallbackFontName,
      data: fontData,
      style: 'normal',
      weight: 400, // Default weight
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️  Failed to load fallback font: ${errorMessage}`);
    return null;
  }
}

/**
 * Main font loading function with comprehensive fallback logic
 * Implements the PRD Day3 logic: primaryFont → fallbackFont → systemFont (based on FAIL_ON_OG_FONT_MISSING)
 */
export async function loadOGFonts(): Promise<FontLoadResult> {
  // Return cached result if already loaded
  if (fontLoadingAttempted && lastLoadResult) {
    return lastLoadResult;
  }

  fontLoadingAttempted = true;

  const result: FontLoadResult = {
    fonts: [],
    source: 'error',
    message: 'Font loading failed'
  };

  // Try to load primary font
  const primaryFont = await loadPrimaryFont();
  if (primaryFont) {
    result.fonts = [primaryFont];
    result.source = 'primary';
    result.message = `Successfully loaded primary font: ${primaryFont.name}`;
    
    // Also try to load fallback as additional font
    const fallbackFont = await loadFallbackFont();
    if (fallbackFont && fallbackFont.name !== primaryFont.name) {
      result.fonts.push(fallbackFont);
      result.message += ` (with fallback: ${fallbackFont.name})`;
    }
    
    lastLoadResult = result;
    return result;
  }

  // Primary font failed, try fallback
  const fallbackFont = await loadFallbackFont();
  if (fallbackFont) {
    result.fonts = [fallbackFont];
    result.source = 'fallback';
    result.message = `Primary font failed, using fallback: ${fallbackFont.name}`;
    
    lastLoadResult = result;
    return result;
  }

  // Both fonts failed - check FAIL_ON_OG_FONT_MISSING setting
  const failOnMissing = env.FAIL_ON_OG_FONT_MISSING === 'true';
  
  if (failOnMissing) {
    result.source = 'error';
    result.message = 'FAIL_ON_OG_FONT_MISSING=true and no fonts available';
    result.fonts = [];
    
    lastLoadResult = result;
    return result;
  }

  // Use system fonts as last resort
  result.fonts = createSystemFontConfig();
  result.source = 'system';
  result.message = 'Using system fonts - no custom fonts available';
  
  lastLoadResult = result;
  return result;
}

/**
 * Get font names for CSS font-family property
 * Returns a CSS-compatible font-family string
 */
export async function getOGFontFamily(): Promise<string> {
  const result = await loadOGFonts();
  
  if (result.fonts.length === 0) {
    // System fonts fallback chain
    return 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';
  }
  
  const fontNames = result.fonts.map(font => `"${font.name}"`).join(', ');
  
  // Add system font fallback chain
  return `${fontNames}, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`;
}

/**
 * Check if fonts are available and valid
 * Useful for health checks and validation
 * Edge runtime compatible - simplified for basic validation
 */
export async function validateOGFonts(): Promise<{
  isValid: boolean;
  primaryFont: { available: boolean; url?: string; error?: string };
  fallbackFont: { available: boolean; url?: string; error?: string };
  recommendation?: string;
}> {
  const result = {
    isValid: false,
    primaryFont: { available: false } as { available: boolean; url?: string; error?: string },
    fallbackFont: { available: false } as { available: boolean; url?: string; error?: string },
    recommendation: undefined as string | undefined,
  };

  // Check primary font
  try {
    const primaryFontName = env.OG_FONT_PRIMARY;
    if (primaryFontName?.trim()) {
      const primaryUrl = getFontFileUrl(primaryFontName);
      const primaryData = await fetchFontFile(primaryUrl);
      
      result.primaryFont = {
        available: !!primaryData,
        url: primaryUrl,
        error: !primaryData ? 'File not found or invalid WOFF2 format' : undefined,
      };
    } else {
      result.primaryFont.error = 'OG_FONT_PRIMARY not configured';
    }
  } catch (error) {
    result.primaryFont.error = error instanceof Error ? error.message : String(error);
  }

  // Check fallback font
  try {
    const fallbackFontName = env.OG_FONT_FALLBACK;
    if (fallbackFontName?.trim()) {
      const fallbackUrl = getFontFileUrl(fallbackFontName);
      const fallbackData = await fetchFontFile(fallbackUrl);
      
      result.fallbackFont = {
        available: !!fallbackData,
        url: fallbackUrl,
        error: !fallbackData ? 'File not found or invalid WOFF2 format' : undefined,
      };
    }
  } catch (error) {
    result.fallbackFont.error = error instanceof Error ? error.message : String(error);
  }

  // Determine overall validity
  const hasWorkingFont = result.primaryFont.available || result.fallbackFont.available;
  const failOnMissing = env.FAIL_ON_OG_FONT_MISSING === 'true';
  
  result.isValid = hasWorkingFont || !failOnMissing;

  // Add recommendation
  if (!result.primaryFont.available && !result.fallbackFont.available) {
    if (failOnMissing) {
      result.recommendation = 'No fonts available and FAIL_ON_OG_FONT_MISSING=true. Add font files or set FAIL_ON_OG_FONT_MISSING=false.';
    } else {
      result.recommendation = 'No custom fonts available. System fonts will be used. Consider adding font files for better consistency.';
    }
  } else if (!result.primaryFont.available) {
    result.recommendation = 'Primary font not available. Using fallback font.';
  } else if (!result.fallbackFont.available && env.OG_FONT_FALLBACK) {
    result.recommendation = 'Fallback font configured but not available. Primary font will be used without fallback.';
  }

  return result;
}

/**
 * Clear font cache (useful for testing or hot reloading)
 */
export function clearOGFontCache(): void {
  fontCache.clear();
  fontLoadingAttempted = false;
  lastLoadResult = null;
}

/**
 * Get cache statistics (useful for debugging)
 */
export function getOGFontCacheStats(): {
  cacheSize: number;
  cachedFonts: string[];
  loadingAttempted: boolean;
  lastResult?: FontLoadResult;
} {
  return {
    cacheSize: fontCache.size,
    cachedFonts: Array.from(fontCache.keys()),
    loadingAttempted: fontLoadingAttempted,
    lastResult: lastLoadResult || undefined,
  };
}

// Development logging
if (process.env.NODE_ENV === 'development') {
  console.log('🔤 OG Font Loader initialized with configuration:', {
    primaryFont: env.OG_FONT_PRIMARY,
    fallbackFont: env.OG_FONT_FALLBACK || 'none',
    failOnMissing: env.FAIL_ON_OG_FONT_MISSING === 'true',
    cacheEnabled: true,
  });
}