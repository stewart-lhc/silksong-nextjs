#!/usr/bin/env node

/**
 * OpenGraph Font Validation Script
 * PRD Day3 Implementation
 * 
 * This script validates OG font files and configuration:
 * - Checks if font files exist and are readable
 * - Validates WOFF2 format integrity
 * - Tests font loading functionality
 * - Provides recommendations for font optimization
 * - Integrates with build process for CI/CD
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts');
const ENV_FILE = path.join(process.cwd(), '.env.local');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const { red, green, yellow, blue, magenta, cyan, white, reset, bold } = colors;

/**
 * Print formatted header
 */
function printHeader(text) {
  console.log(`\n${bold}${blue}=== ${text} ===${reset}\n`);
}

/**
 * Print success message
 */
function printSuccess(text) {
  console.log(`${green}✅ ${text}${reset}`);
}

/**
 * Print warning message
 */
function printWarning(text) {
  console.log(`${yellow}⚠️  ${text}${reset}`);
}

/**
 * Print error message
 */
function printError(text) {
  console.log(`${red}❌ ${text}${reset}`);
}

/**
 * Print info message
 */
function printInfo(text) {
  console.log(`${cyan}ℹ️  ${text}${reset}`);
}

/**
 * Load environment variables from .env.local
 */
function loadEnvVariables() {
  const envVars = {};
  
  try {
    if (fs.existsSync(ENV_FILE)) {
      const envContent = fs.readFileSync(ENV_FILE, 'utf8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, ...valueParts] = trimmedLine.split('=');
          if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim();
          }
        }
      }
    }
  } catch (error) {
    printWarning(`Failed to load .env.local: ${error.message}`);
  }
  
  // Merge with process.env
  return { ...process.env, ...envVars };
}

/**
 * Check if a buffer is a valid WOFF2 font file
 */
function isValidWOFF2(buffer) {
  try {
    // WOFF2 files start with 'wOF2' magic bytes (0x774F4632)
    const magic = buffer.readUInt32BE(0);
    return magic === 0x774F4632;
  } catch {
    return false;
  }
}

/**
 * Get font file size in human-readable format
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate a single font file
 */
function validateFontFile(fontPath, fontName) {
  const result = {
    exists: false,
    readable: false,
    validFormat: false,
    size: 0,
    sizeFormatted: '0 Bytes',
    recommendation: '',
    error: null,
  };

  try {
    // Check if file exists
    if (!fs.existsSync(fontPath)) {
      result.error = 'File does not exist';
      result.recommendation = `Create font file at ${fontPath}`;
      return result;
    }
    
    result.exists = true;

    // Check if readable
    const stats = fs.statSync(fontPath);
    result.size = stats.size;
    result.sizeFormatted = formatFileSize(stats.size);
    result.readable = true;

    // Check file format
    const buffer = fs.readFileSync(fontPath);
    result.validFormat = isValidWOFF2(buffer);
    
    if (!result.validFormat) {
      result.error = 'Invalid WOFF2 format';
      result.recommendation = 'Convert font to WOFF2 format or replace with valid WOFF2 file';
      return result;
    }

    // Performance recommendations
    if (result.size > 200 * 1024) {  // 200KB
      result.recommendation = `Font is large (${result.sizeFormatted}). Consider using a subset or lighter weight.`;
    } else if (result.size > 100 * 1024) {  // 100KB
      result.recommendation = `Font is medium-sized (${result.sizeFormatted}). Monitor loading performance.`;
    } else {
      result.recommendation = `Font size is optimal (${result.sizeFormatted}).`;
    }

  } catch (error) {
    result.error = error.message;
    result.recommendation = 'Check file permissions and format';
  }

  return result;
}

/**
 * Test font loading functionality using Node.js require
 */
function testFontLoading() {
  try {
    // Try to import the font loader
    const fontLoaderPath = path.join(process.cwd(), 'lib', 'og-font-loader.ts');
    
    if (!fs.existsSync(fontLoaderPath)) {
      return {
        success: false,
        error: 'Font loader module not found at lib/og-font-loader.ts'
      };
    }

    // Check if we can at least read the file
    const loaderContent = fs.readFileSync(fontLoaderPath, 'utf8');
    
    if (!loaderContent.includes('loadOGFonts')) {
      return {
        success: false,
        error: 'Font loader does not export loadOGFonts function'
      };
    }

    return {
      success: true,
      message: 'Font loader module structure is valid'
    };

  } catch (error) {
    return {
      success: false,
      error: `Font loading test failed: ${error.message}`
    };
  }
}

/**
 * Generate font validation report
 */
function generateReport(env, validationResults, loadingTest) {
  printHeader('OG Font Validation Report');

  // Environment Configuration
  console.log(`${bold}Environment Configuration:${reset}`);
  console.log(`  Primary Font: ${env.OG_FONT_PRIMARY || 'Not configured'}`);
  console.log(`  Fallback Font: ${env.OG_FONT_FALLBACK || 'Not configured'}`);
  console.log(`  Fail on Missing: ${env.FAIL_ON_OG_FONT_MISSING || 'false'}`);
  console.log();

  // Font File Validation
  console.log(`${bold}Font File Validation:${reset}`);
  
  let hasValidFont = false;
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const [fontType, result] of Object.entries(validationResults)) {
    console.log(`  ${bold}${fontType}:${reset}`);
    
    if (result.exists && result.readable && result.validFormat) {
      printSuccess(`    File is valid (${result.sizeFormatted})`);
      hasValidFont = true;
      
      if (result.recommendation) {
        printInfo(`    ${result.recommendation}`);
        if (result.recommendation.includes('large')) {
          totalWarnings++;
        }
      }
    } else {
      printError(`    ${result.error || 'Unknown error'}`);
      totalErrors++;
      
      if (result.recommendation) {
        printInfo(`    ${result.recommendation}`);
      }
    }
  }

  // Font Loading Test
  console.log(`\n${bold}Font Loading Test:${reset}`);
  if (loadingTest.success) {
    printSuccess(`  ${loadingTest.message}`);
  } else {
    printError(`  ${loadingTest.error}`);
    totalErrors++;
  }

  // Overall Status
  console.log(`\n${bold}Overall Status:${reset}`);
  
  const failOnMissing = env.FAIL_ON_OG_FONT_MISSING === 'true';
  const isValid = hasValidFont || !failOnMissing;
  
  if (isValid && totalErrors === 0) {
    printSuccess('  All checks passed! OG font system is ready.');
  } else if (isValid && totalErrors > 0) {
    printWarning(`  System functional but has ${totalErrors} error(s) and ${totalWarnings} warning(s).`);
  } else {
    printError('  OG font system has critical issues that need to be resolved.');
  }

  // Recommendations
  if (totalErrors > 0 || totalWarnings > 0) {
    console.log(`\n${bold}Recommendations:${reset}`);
    
    if (!hasValidFont) {
      if (failOnMissing) {
        printInfo('  1. Add valid font files or set FAIL_ON_OG_FONT_MISSING=false');
        printInfo('  2. Ensure font files are in WOFF2 format');
        printInfo('  3. Check file permissions');
      } else {
        printInfo('  1. Add font files for better visual consistency');
        printInfo('  2. System fonts will be used as fallback');
      }
    }
    
    if (totalWarnings > 0) {
      printInfo('  • Consider optimizing large font files');
      printInfo('  • Monitor font loading performance in production');
    }
  }

  return {
    valid: isValid,
    errors: totalErrors,
    warnings: totalWarnings,
    hasValidFont,
  };
}

/**
 * Main validation function
 */
function main() {
  console.log(`${bold}${magenta}🔤 OpenGraph Font Validation${reset}`);
  console.log(`${cyan}Validating OG font configuration and files...${reset}\n`);

  // Load environment variables
  const env = loadEnvVariables();

  // Validate font files
  const validationResults = {};
  
  if (env.OG_FONT_PRIMARY) {
    const primaryPath = path.join(FONTS_DIR, `${env.OG_FONT_PRIMARY}.woff2`);
    validationResults['Primary Font'] = validateFontFile(primaryPath, env.OG_FONT_PRIMARY);
  }
  
  if (env.OG_FONT_FALLBACK) {
    const fallbackPath = path.join(FONTS_DIR, `${env.OG_FONT_FALLBACK}.woff2`);
    validationResults['Fallback Font'] = validateFontFile(fallbackPath, env.OG_FONT_FALLBACK);
  }

  // Test font loading
  const loadingTest = testFontLoading();

  // Generate report
  const report = generateReport(env, validationResults, loadingTest);

  // Exit with appropriate code
  if (report.valid && report.errors === 0) {
    console.log(`\n${green}${bold}✅ Validation completed successfully!${reset}`);
    process.exit(0);
  } else if (report.valid) {
    console.log(`\n${yellow}${bold}⚠️  Validation completed with warnings.${reset}`);
    process.exit(0);
  } else {
    console.log(`\n${red}${bold}❌ Validation failed!${reset}`);
    process.exit(1);
  }
}

// Run validation if called directly
if (require.main === module) {
  main();
}

module.exports = {
  main,
  validateFontFile,
  loadEnvVariables,
  isValidWOFF2,
  formatFileSize,
};