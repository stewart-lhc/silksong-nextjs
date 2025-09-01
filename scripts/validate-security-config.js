#!/usr/bin/env node

/**
 * Security Configuration Validation Script
 * 
 * Validates the security configuration in next.config.js and other security-related files
 * Ensures CSP, security headers, and other security measures are properly configured
 * 
 * Usage: node scripts/validate-security-config.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Expected CSP directives for this application
const REQUIRED_CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com", 
    "https://www.clarity.ms"
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com"
  ],
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com"
  ],
  'img-src': [
    "'self'",
    "data:",
    "https:",
    "blob:",
    "https://i.ytimg.com",
    "https://img.youtube.com"
  ],
  'media-src': [
    "'self'",
    "https://www.youtube.com",
    "https://youtube.com"
  ],
  'frame-src': [
    "'self'",
    "https://www.youtube.com",
    "https://youtube.com"
  ],
  'connect-src': [
    "'self'",
    "https://www.google-analytics.com",
    "https://www.clarity.ms",
    "https://*.supabase.co",
    "https://analytics.google.com"
  ],
  'child-src': [
    "'self'",
    "https://www.youtube.com",
    "https://youtube.com"
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'manifest-src': ["'self'"],
  'worker-src': ["'self'", "blob:"]
};

// Expected security headers
const REQUIRED_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'X-DNS-Prefetch-Control': 'on',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
};

function parseCSP(cspString) {
  const directives = {};
  const parts = cspString.split(';').map(part => part.trim()).filter(part => part);
  
  for (const part of parts) {
    const [directive, ...values] = part.split(/\s+/);
    if (directive) {
      directives[directive] = values;
    }
  }
  
  return directives;
}

function validateNextConfig() {
  log('blue', '📋 Validating next.config.js security configuration...');
  
  const configPath = path.join(process.cwd(), 'next.config.js');
  
  if (!fs.existsSync(configPath)) {
    log('red', '❌ next.config.js not found');
    return false;
  }
  
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    let passed = true;
    
    // Check if headers function exists
    if (!configContent.includes('async headers()')) {
      log('red', '❌ Missing headers() function in next.config.js');
      passed = false;
    } else {
      log('green', '✅ Headers function found');
    }
    
    // Extract CSP from the file
    const cspMatch = configContent.match(/Content-Security-Policy['"]\s*,\s*value:\s*(?:\[[\s\S]*?\]\.join\(['"]; ['"]?\)|['"`](.*?)['"`])/);
    
    if (!cspMatch) {
      log('red', '❌ Content-Security-Policy not found in configuration');
      passed = false;
    } else {
      log('green', '✅ Content-Security-Policy found');
      
      // If using array.join format, we need to parse the array
      if (cspMatch[0].includes('.join')) {
        // Extract array elements
        const arrayMatch = configContent.match(/\[([\s\S]*?)\]\.join\(['"]; ['"]?\)/);
        if (arrayMatch) {
          const arrayContent = arrayMatch[1];
          const directives = arrayContent.match(/"([^"]+)"/g);
          if (directives) {
            const cspString = directives.map(d => d.slice(1, -1)).join('; ');
            passed = validateCSPDirectives(parseCSP(cspString)) && passed;
          }
        }
      } else {
        // Single string format
        passed = validateCSPDirectives(parseCSP(cspMatch[1])) && passed;
      }
    }
    
    // Check other required headers
    for (const [header, expectedValue] of Object.entries(REQUIRED_HEADERS)) {
      const headerRegex = new RegExp(`key:\\s*['"\`]${header}['"\`]`, 'i');
      if (!headerRegex.test(configContent)) {
        log('red', `❌ Missing header: ${header}`);
        passed = false;
      } else {
        log('green', `✅ Header found: ${header}`);
      }
    }
    
    return passed;
    
  } catch (error) {
    log('red', `❌ Error reading next.config.js: ${error.message}`);
    return false;
  }
}

function validateCSPDirectives(actualDirectives) {
  log('blue', '\n🔍 Validating CSP directives...');
  
  let passed = true;
  
  for (const [directive, expectedSources] of Object.entries(REQUIRED_CSP_DIRECTIVES)) {
    if (!actualDirectives[directive]) {
      log('red', `❌ Missing CSP directive: ${directive}`);
      passed = false;
      continue;
    }
    
    const actualSources = actualDirectives[directive];
    const missingSource = expectedSources.filter(source => !actualSources.includes(source));
    
    if (missingSource.length > 0) {
      log('yellow', `⚠️  ${directive}: Missing sources - ${missingSource.join(', ')}`);
      // Don't fail for missing sources, just warn
    } else {
      log('green', `✅ ${directive}: All required sources present`);
    }
    
    // Check for potentially dangerous sources
    const dangerousSources = actualSources.filter(source => 
      source === '*' || 
      source === 'data:' && directive === 'script-src' ||
      source === "'unsafe-eval'" && directive !== 'script-src'
    );
    
    if (dangerousSources.length > 0) {
      log('yellow', `⚠️  ${directive}: Potentially dangerous sources - ${dangerousSources.join(', ')}`);
    }
  }
  
  return passed;
}

function validateLayoutAnalytics() {
  log('blue', '\n📊 Validating analytics implementation in layout.tsx...');
  
  const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx');
  
  if (!fs.existsSync(layoutPath)) {
    log('yellow', '⚠️  app/layout.tsx not found');
    return true; // Not critical
  }
  
  try {
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    let passed = true;
    
    // Check for Google Analytics
    if (layoutContent.includes('googletagmanager.com') && layoutContent.includes('gtag')) {
      log('green', '✅ Google Analytics implementation found');
    } else {
      log('yellow', '⚠️  Google Analytics not found in layout');
    }
    
    // Check for Microsoft Clarity
    if (layoutContent.includes('clarity.ms') && layoutContent.includes('clarity')) {
      log('green', '✅ Microsoft Clarity implementation found');
    } else {
      log('yellow', '⚠️  Microsoft Clarity not found in layout');
    }
    
    // Check for proper Script tags
    if (layoutContent.includes('Script') && layoutContent.includes('afterInteractive')) {
      log('green', '✅ Proper Script component usage found');
    } else {
      log('yellow', '⚠️  Script component usage not optimal');
    }
    
    return passed;
    
  } catch (error) {
    log('red', `❌ Error reading layout.tsx: ${error.message}`);
    return false;
  }
}

function validateYouTubeImplementation() {
  log('blue', '\n🎥 Validating YouTube implementation...');
  
  const componentPaths = [
    path.join(process.cwd(), 'components', 'hero-section.tsx'),
    path.join(process.cwd(), 'components', 'trailer-section.tsx')
  ];
  
  let foundYouTube = false;
  
  for (const componentPath of componentPaths) {
    if (fs.existsSync(componentPath)) {
      try {
        const content = fs.readFileSync(componentPath, 'utf8');
        
        if (content.includes('youtube.com/embed') || content.includes('youtu.be')) {
          log('green', `✅ YouTube implementation found in ${path.basename(componentPath)}`);
          foundYouTube = true;
          
          // Check for proper iframe attributes
          if (content.includes('allowFullScreen') && content.includes('title=')) {
            log('green', '   ✅ Proper iframe attributes found');
          } else {
            log('yellow', '   ⚠️  Missing some iframe accessibility attributes');
          }
        }
      } catch (error) {
        log('yellow', `⚠️  Error reading ${componentPath}: ${error.message}`);
      }
    }
  }
  
  if (!foundYouTube) {
    log('yellow', '⚠️  No YouTube implementation found');
  }
  
  return true; // Not critical for security
}

async function main() {
  log('bold', '🔒 Security Configuration Validation');
  log('bold', '====================================\n');
  
  let allPassed = true;
  
  // Validate each component
  const validations = [
    ['Next.js Configuration', validateNextConfig],
    ['Layout Analytics', validateLayoutAnalytics],
    ['YouTube Implementation', validateYouTubeImplementation]
  ];
  
  for (const [testName, validationFn] of validations) {
    try {
      const passed = await validationFn();
      if (!passed) {
        allPassed = false;
      }
    } catch (error) {
      log('red', `❌ ${testName} validation failed: ${error.message}`);
      allPassed = false;
    }
    console.log(); // Add spacing
  }
  
  // Summary
  log('blue', '📊 Validation Summary:');
  log('blue', '=' .repeat(30));
  
  if (allPassed) {
    log('green', '🎉 All security configurations are valid!');
    log('blue', '\n📋 Next Steps:');
    log('blue', '1. Run the development server: npm run dev');
    log('blue', '2. Test the headers: node scripts/verify-security-headers.js');
    log('blue', '3. Test CSP compatibility: node scripts/test-csp-compatibility.js');
    process.exit(0);
  } else {
    log('red', '🚨 Some security configuration issues were found!');
    log('yellow', 'Please review the issues above and fix them before proceeding.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    log('red', `❌ Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { 
  validateNextConfig, 
  validateCSPDirectives, 
  validateLayoutAnalytics,
  validateYouTubeImplementation 
};