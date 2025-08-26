import { MetadataRoute } from 'next';
import { BASE_URL, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '../config/seo';

/**
 * PRD Day3 Sitemap Implementation
 * Implements multi-language URL generation algorithm and comprehensive SEO-compliant sitemap
 */

// Page collection definitions as per PRD Day3 requirements
const PAGE_DEFINITIONS = {
  home: '/',
  compare: '/compare-hollow-knight',
  platforms: '/platforms',
  timeline: '/timeline',
  checklist: '/checklist',
  toolsEmbed: '/tools/embed',
} as const;

// Page metadata configuration for SEO optimization
interface PageConfig {
  path: string;
  priority: number;
  changeFreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  lastModified: Date;
}

const PAGE_CONFIGS: Record<keyof typeof PAGE_DEFINITIONS, PageConfig> = {
  home: {
    path: PAGE_DEFINITIONS.home,
    priority: 1.0,
    changeFreq: 'daily',
    lastModified: new Date('2025-08-26'),
  },
  compare: {
    path: PAGE_DEFINITIONS.compare,
    priority: 0.8,
    changeFreq: 'weekly',
    lastModified: new Date('2025-08-25'),
  },
  platforms: {
    path: PAGE_DEFINITIONS.platforms,
    priority: 0.8,
    changeFreq: 'weekly',
    lastModified: new Date('2025-08-25'),
  },
  timeline: {
    path: PAGE_DEFINITIONS.timeline,
    priority: 0.8,
    changeFreq: 'weekly',
    lastModified: new Date('2025-08-25'),
  },
  checklist: {
    path: PAGE_DEFINITIONS.checklist,
    priority: 0.8,
    changeFreq: 'weekly',
    lastModified: new Date('2025-08-25'),
  },
  toolsEmbed: {
    path: PAGE_DEFINITIONS.toolsEmbed,
    priority: 0.6,
    changeFreq: 'monthly',
    lastModified: new Date('2025-08-25'),
  },
};

/**
 * Multi-language URL generation algorithm implementation
 * As specified in PRD Day3 requirements
 * 
 * Algorithm:
 * urls = []
 * for each locale in SUPPORTED_LOCALES:
 *   prefix = (locale===DEFAULT_LOCALE) ? '' : `/${locale}`
 *   for each basePath in basePaths:
 *     path = (basePath==='/' ? '/' : basePath)
 *     if (prefix) path = prefix + (path==='/' ? '/' : path)
 *     urls.push(path)
 */
function generateMultiLanguageUrls(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];
  
  try {
    // Iterate through each supported locale
    for (const locale of SUPPORTED_LOCALES) {
      // Generate language prefix according to PRD algorithm
      const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
      
      // Iterate through each page in the collection
      for (const [pageKey, pageConfig] of Object.entries(PAGE_CONFIGS)) {
        let path = pageConfig.path;
        
        // Apply PRD algorithm for path construction
        if (pageConfig.path === '/') {
          path = '/';
        } else {
          path = pageConfig.path;
        }
        
        // Add language prefix if required
        if (prefix) {
          path = prefix + (path === '/' ? '/' : path);
        }
        
        // Construct full URL
        const fullUrl = `${BASE_URL}${path === '/' ? '' : path}`;
        
        urls.push({
          url: fullUrl,
          lastModified: pageConfig.lastModified,
          changeFrequency: pageConfig.changeFreq,
          priority: pageConfig.priority,
        });
      }
    }
    
    return urls;
  } catch (error) {
    // PRD requirement: Build failure on sitemap generation failure
    // This prevents publishing incomplete SEO versions
    console.error('Sitemap generation failed:', error);
    throw new Error(`Sitemap generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates sitemap generation results
 * Ensures PRD requirements are met
 */
function validateSitemap(urls: MetadataRoute.Sitemap): void {
  const expectedUrlCount = Object.keys(PAGE_DEFINITIONS).length * SUPPORTED_LOCALES.length;
  
  if (urls.length !== expectedUrlCount) {
    throw new Error(
      `Sitemap validation failed: Expected ${expectedUrlCount} URLs (${Object.keys(PAGE_DEFINITIONS).length} pages × ${SUPPORTED_LOCALES.length} locales), but generated ${urls.length}`
    );
  }
  
  // Validate that /embed/countdown is not included (PRD requirement)
  const embedCountdownUrls = urls.filter(url => url.url.includes('/embed/countdown'));
  if (embedCountdownUrls.length > 0) {
    throw new Error('Sitemap validation failed: /embed/countdown URLs found, but should be excluded per PRD requirements');
  }
  
  // Validate URL structure for different locales
  const defaultLocaleUrls = urls.filter(url => !SUPPORTED_LOCALES.some(locale => 
    locale !== DEFAULT_LOCALE && url.url.includes(`/${locale}/`)
  ));
  const nonDefaultLocaleUrls = urls.filter(url => SUPPORTED_LOCALES.some(locale => 
    locale !== DEFAULT_LOCALE && url.url.includes(`/${locale}/`)
  ));
  
  const expectedDefaultCount = Object.keys(PAGE_DEFINITIONS).length;
  const expectedNonDefaultCount = Object.keys(PAGE_DEFINITIONS).length * (SUPPORTED_LOCALES.length - 1);
  
  if (defaultLocaleUrls.length !== expectedDefaultCount) {
    throw new Error(
      `Sitemap validation failed: Expected ${expectedDefaultCount} default locale URLs, but found ${defaultLocaleUrls.length}`
    );
  }
  
  if (nonDefaultLocaleUrls.length !== expectedNonDefaultCount) {
    throw new Error(
      `Sitemap validation failed: Expected ${expectedNonDefaultCount} non-default locale URLs, but found ${nonDefaultLocaleUrls.length}`
    );
  }
}

/**
 * Main sitemap generation function
 * Implements PRD Day3 requirements with comprehensive error handling
 */
export default function sitemap(): MetadataRoute.Sitemap {
  try {
    // Generate multi-language URLs using PRD algorithm
    const generatedUrls = generateMultiLanguageUrls();
    
    // Validate the generated sitemap
    validateSitemap(generatedUrls);
    
    // Sort URLs for consistent ordering (SEO best practice)
    const sortedUrls = generatedUrls.sort((a, b) => {
      // Sort by priority (highest first), then by URL
      if (a.priority !== b.priority) {
        return (b.priority || 0) - (a.priority || 0);
      }
      return a.url.localeCompare(b.url);
    });
    
    // Log successful generation for monitoring
    console.log(`✅ Sitemap generated successfully: ${sortedUrls.length} URLs across ${SUPPORTED_LOCALES.length} locales`);
    
    return sortedUrls;
  } catch (error) {
    // PRD requirement: Build failure on sitemap generation failure
    console.error('❌ Sitemap generation failed:', error);
    throw error;
  }
}