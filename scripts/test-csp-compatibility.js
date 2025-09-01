#!/usr/bin/env node

/**
 * CSP Compatibility Test Script
 * 
 * Tests specific functionality that requires CSP permissions:
 * - YouTube video embedding
 * - Microsoft Clarity analytics
 * - Google Analytics
 * 
 * Usage: node scripts/test-csp-compatibility.js [URL]
 */

const puppeteer = require('puppeteer');
const { URL } = require('url');

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

async function testCSPCompatibility(url = 'http://localhost:3000') {
  log('blue', `🔍 Testing CSP compatibility for: ${url}`);
  log('blue', '=' .repeat(60));
  
  let browser;
  let results = {
    youtube: { passed: false, errors: [] },
    clarity: { passed: false, errors: [] },
    analytics: { passed: false, errors: [] },
    general: { cspViolations: [] }
  };
  
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Listen for console errors and CSP violations
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        
        // Check for CSP violations
        if (text.includes('Content Security Policy')) {
          results.general.cspViolations.push(text);
          
          // Categorize CSP violations
          if (text.includes('youtube.com') || text.includes('frame')) {
            results.youtube.errors.push(text);
          }
          if (text.includes('clarity.ms')) {
            results.clarity.errors.push(text);
          }
          if (text.includes('google-analytics.com') || text.includes('googletagmanager.com')) {
            results.analytics.errors.push(text);
          }
        }
      }
    });
    
    // Navigate to the page
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Test 1: YouTube Video Embedding
    log('yellow', '\n🎥 Testing YouTube video embedding...');
    try {
      // Look for YouTube iframes
      const youtubeIframes = await page.$$('iframe[src*="youtube.com"], iframe[src*="youtu.be"]');
      
      if (youtubeIframes.length > 0) {
        log('green', `✅ Found ${youtubeIframes.length} YouTube iframe(s)`);
        
        // Check if iframes can load
        for (let i = 0; i < youtubeIframes.length; i++) {
          try {
            const src = await youtubeIframes[i].getAttribute('src');
            log('blue', `   📹 Iframe ${i + 1}: ${src}`);
            
            // Try to access iframe content (will fail due to CORS, but CSP should allow the frame)
            const isVisible = await youtubeIframes[i].isIntersectingViewport();
            if (isVisible) {
              log('green', `   ✅ Iframe ${i + 1} is visible and loaded`);
            }
          } catch (error) {
            log('yellow', `   ⚠️  Iframe ${i + 1}: ${error.message}`);
          }
        }
        
        results.youtube.passed = results.youtube.errors.length === 0;
      } else {
        log('yellow', '⚠️  No YouTube iframes found on page');
        results.youtube.passed = true; // No test needed
      }
    } catch (error) {
      log('red', `❌ YouTube test error: ${error.message}`);
      results.youtube.errors.push(error.message);
    }
    
    // Test 2: Microsoft Clarity
    log('yellow', '\n📊 Testing Microsoft Clarity...');
    try {
      // Check if Clarity script is loaded
      const clarityExists = await page.evaluate(() => {
        return typeof window.clarity !== 'undefined' || 
               document.querySelector('script[src*="clarity.ms"]') !== null;
      });
      
      if (clarityExists) {
        log('green', '✅ Microsoft Clarity script detected');
        results.clarity.passed = results.clarity.errors.length === 0;
      } else {
        log('yellow', '⚠️  Microsoft Clarity not detected');
        results.clarity.passed = true; // May not be implemented
      }
    } catch (error) {
      log('red', `❌ Clarity test error: ${error.message}`);
      results.clarity.errors.push(error.message);
    }
    
    // Test 3: Google Analytics
    log('yellow', '\n📈 Testing Google Analytics...');
    try {
      const analyticsExists = await page.evaluate(() => {
        return typeof window.gtag !== 'undefined' || 
               typeof window.ga !== 'undefined' ||
               document.querySelector('script[src*="googletagmanager.com"]') !== null ||
               document.querySelector('script[src*="google-analytics.com"]') !== null;
      });
      
      if (analyticsExists) {
        log('green', '✅ Google Analytics script detected');
        results.analytics.passed = results.analytics.errors.length === 0;
      } else {
        log('yellow', '⚠️  Google Analytics not detected');
        results.analytics.passed = true; // May not be implemented
      }
    } catch (error) {
      log('red', `❌ Analytics test error: ${error.message}`);
      results.analytics.errors.push(error.message);
    }
    
    // Wait a bit more for any delayed CSP violations
    await page.waitForTimeout(3000);
    
  } catch (error) {
    log('red', `❌ Test execution error: ${error.message}`);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Results Summary
  log('blue', '\n📊 CSP Compatibility Test Results:');
  log('blue', '=' .repeat(40));
  
  const testResults = [
    ['YouTube Embedding', results.youtube.passed],
    ['Microsoft Clarity', results.clarity.passed],
    ['Google Analytics', results.analytics.passed]
  ];
  
  let allPassed = true;
  for (const [testName, passed] of testResults) {
    if (passed) {
      log('green', `✅ ${testName}: PASSED`);
    } else {
      log('red', `❌ ${testName}: FAILED`);
      allPassed = false;
    }
  }
  
  // Show CSP violations if any
  if (results.general.cspViolations.length > 0) {
    log('red', '\n🚨 CSP Violations Detected:');
    results.general.cspViolations.forEach((violation, i) => {
      log('red', `${i + 1}. ${violation}`);
    });
  }
  
  // Show detailed errors
  const allErrors = [
    ...results.youtube.errors,
    ...results.clarity.errors,
    ...results.analytics.errors
  ];
  
  if (allErrors.length > 0) {
    log('yellow', '\n⚠️  Detailed Error Information:');
    allErrors.forEach((error, i) => {
      log('yellow', `${i + 1}. ${error}`);
    });
  }
  
  if (allPassed && results.general.cspViolations.length === 0) {
    log('green', '\n🎉 All CSP compatibility tests passed!');
    return true;
  } else {
    log('red', '\n🚨 Some CSP compatibility issues detected. Please review the CSP configuration.');
    return false;
  }
}

// Main execution
async function main() {
  const url = process.argv[2] || 'http://localhost:3000';
  
  log('bold', '🔒 CSP Compatibility Test Tool');
  log('bold', '===============================\n');
  
  // Check if puppeteer is available
  try {
    require.resolve('puppeteer');
  } catch (error) {
    log('red', '❌ Puppeteer not found. Please install it:');
    log('yellow', '   npm install --save-dev puppeteer');
    process.exit(1);
  }
  
  const success = await testCSPCompatibility(url);
  
  console.log();
  
  if (success) {
    log('green', '🎉 CSP configuration is compatible with required functionality!');
    process.exit(0);
  } else {
    log('red', '🚨 CSP compatibility test failed! Please review and fix the issues above.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    log('red', `❌ Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { testCSPCompatibility };