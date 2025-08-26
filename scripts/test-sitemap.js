#!/usr/bin/env node

/**
 * PRD Day3 Sitemap Validation Script
 * Tests the sitemap generation according to PRD requirements
 */

const { SUPPORTED_LOCALES, DEFAULT_LOCALE } = require('../config/seo');

// Import the sitemap function (we need to simulate the Next.js environment)
const sitemapModule = require('../app/sitemap');

console.log('🧪 Testing PRD Day3 Sitemap Implementation\n');

try {
  // Test configuration
  console.log('📋 Configuration:');
  console.log(`   Default Locale: ${DEFAULT_LOCALE}`);
  console.log(`   Supported Locales: ${SUPPORTED_LOCALES.join(', ')}`);
  console.log(`   Expected URL Count: ${6 * SUPPORTED_LOCALES.length}\n`);

  // Mock Next.js environment
  global.process = process;
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
  }

  // Generate sitemap
  const sitemap = sitemapModule.default();
  
  console.log('✅ Sitemap generated successfully');
  console.log(`   Total URLs: ${sitemap.length}`);
  
  // Validate URL structure
  const defaultLocaleUrls = sitemap.filter(entry => 
    !SUPPORTED_LOCALES.some(locale => 
      locale !== DEFAULT_LOCALE && entry.url.includes(`/${locale}/`)
    )
  );
  
  const nonDefaultLocaleUrls = sitemap.filter(entry => 
    SUPPORTED_LOCALES.some(locale => 
      locale !== DEFAULT_LOCALE && entry.url.includes(`/${locale}/`)
    )
  );

  console.log(`   Default locale URLs: ${defaultLocaleUrls.length}`);
  console.log(`   Non-default locale URLs: ${nonDefaultLocaleUrls.length}\n`);

  // Display all URLs
  console.log('🌍 Generated URLs:');
  sitemap.forEach((entry, index) => {
    const relativePath = entry.url.replace(/^https?:\/\/[^\/]+/, '');
    console.log(`   ${index + 1}. ${relativePath} (${entry.priority}, ${entry.changeFrequency})`);
  });

  // Validate /embed/countdown exclusion
  const embedCountdownUrls = sitemap.filter(entry => 
    entry.url.includes('/embed/countdown')
  );
  
  if (embedCountdownUrls.length === 0) {
    console.log('\n✅ /embed/countdown correctly excluded');
  } else {
    console.log('\n❌ /embed/countdown should be excluded');
    process.exit(1);
  }

  // Validate expected structure
  if (sitemap.length === 6 * SUPPORTED_LOCALES.length) {
    console.log('✅ URL count matches PRD requirements');
  } else {
    console.log('❌ URL count does not match PRD requirements');
    process.exit(1);
  }

  console.log('\n🎉 All PRD Day3 requirements validated successfully!');

} catch (error) {
  console.error('❌ Sitemap validation failed:', error.message);
  process.exit(1);
}