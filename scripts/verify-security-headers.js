#!/usr/bin/env node

/**
 * Security Headers Verification Script
 * 
 * This script verifies that all required security headers are properly configured
 * in the Next.js application. Run this after deployment to ensure security measures
 * are active.
 * 
 * Usage:
 *   node scripts/verify-security-headers.js [URL]
 *   
 * Default URL: http://localhost:3000
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Required security headers and their expected values
const REQUIRED_HEADERS = {
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff', 
  'referrer-policy': 'origin-when-cross-origin',
  'strict-transport-security': 'max-age=31536000; includeSubDomains',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  'content-security-policy': {
    required: true,
    contains: [
      'default-src',
      'script-src', 
      'style-src',
      'frame-src',
      'frame-ancestors',
      'connect-src',
      'img-src',
      'font-src',
      'media-src',
      'object-src',
      'base-uri'
    ]
  }
};

// ANSI color codes for terminal output
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

function checkHeaders(url = 'http://localhost:3000') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      timeout: 10000
    };

    const req = client.request(options, (res) => {
      resolve({
        status: res.statusCode,
        headers: res.headers
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

function validateCSP(csp) {
  const directives = REQUIRED_HEADERS['content-security-policy'].contains;
  const missing = [];
  
  for (const directive of directives) {
    if (!csp.includes(directive)) {
      missing.push(directive);
    }
  }
  
  return missing;
}

async function verifySecurityHeaders(url) {
  log('blue', `🔍 Checking security headers for: ${url}`);
  log('blue', '=' .repeat(60));
  
  try {
    const response = await checkHeaders(url);
    
    if (response.status !== 200 && response.status !== 301 && response.status !== 302) {
      log('yellow', `⚠️  Warning: HTTP ${response.status} response`);
    }
    
    let allPassed = true;
    const results = [];
    
    // Check each required header
    for (const [headerName, expectedValue] of Object.entries(REQUIRED_HEADERS)) {
      const actualValue = response.headers[headerName.toLowerCase()];
      
      if (!actualValue) {
        log('red', `❌ ${headerName}: MISSING`);
        results.push({ header: headerName, status: 'MISSING', severity: 'HIGH' });
        allPassed = false;
        continue;
      }
      
      if (headerName === 'content-security-policy') {
        const missingDirectives = validateCSP(actualValue);
        if (missingDirectives.length > 0) {
          log('yellow', `⚠️  ${headerName}: Present but missing directives: ${missingDirectives.join(', ')}`);
          results.push({ 
            header: headerName, 
            status: 'PARTIAL', 
            severity: 'MEDIUM',
            details: `Missing: ${missingDirectives.join(', ')}`
          });
        } else {
          log('green', `✅ ${headerName}: OK`);
          results.push({ header: headerName, status: 'OK', severity: 'NONE' });
        }
      } else if (typeof expectedValue === 'string') {
        if (actualValue.toLowerCase() === expectedValue.toLowerCase()) {
          log('green', `✅ ${headerName}: OK`);
          results.push({ header: headerName, status: 'OK', severity: 'NONE' });
        } else {
          log('yellow', `⚠️  ${headerName}: Expected "${expectedValue}", got "${actualValue}"`);
          results.push({ 
            header: headerName, 
            status: 'MISMATCH', 
            severity: 'MEDIUM',
            expected: expectedValue,
            actual: actualValue
          });
          allPassed = false;
        }
      }
    }
    
    // Check for additional security headers
    log('blue', '\n📋 Additional Headers:');
    
    const additionalHeaders = [
      'x-dns-prefetch-control',
      'x-xss-protection',
      'cross-origin-embedder-policy',
      'cross-origin-opener-policy',
      'cross-origin-resource-policy'
    ];
    
    for (const header of additionalHeaders) {
      const value = response.headers[header.toLowerCase()];
      if (value) {
        log('green', `✅ ${header}: ${value}`);
      } else {
        log('yellow', `⚠️  ${header}: Not set (optional)`);
      }
    }
    
    // Summary
    log('blue', '\n📊 Security Assessment Summary:');
    log('blue', '=' .repeat(40));
    
    const critical = results.filter(r => r.severity === 'HIGH').length;
    const warnings = results.filter(r => r.severity === 'MEDIUM').length;
    const passed = results.filter(r => r.severity === 'NONE').length;
    
    log('green', `✅ Passed: ${passed}`);
    log('yellow', `⚠️  Warnings: ${warnings}`);
    log('red', `❌ Critical: ${critical}`);
    
    if (allPassed && critical === 0) {
      log('green', '\n🎉 All security headers are properly configured!');
      return true;
    } else if (critical === 0) {
      log('yellow', '\n⚠️  Security headers are mostly configured, but some improvements needed.');
      return true;
    } else {
      log('red', '\n🚨 CRITICAL: Missing required security headers!');
      return false;
    }
    
  } catch (error) {
    log('red', `❌ Error checking headers: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      log('yellow', '💡 Tip: Make sure the development server is running (npm run dev)');
    }
    
    return false;
  }
}

// Main execution
async function main() {
  const url = process.argv[2] || 'http://localhost:3000';
  
  log('bold', '🔒 Security Headers Verification Tool');
  log('bold', '====================================\n');
  
  const success = await verifySecurityHeaders(url);
  
  console.log(); // Empty line
  
  if (success) {
    process.exit(0);
  } else {
    log('red', '🚨 Security verification failed! Please review the issues above.');
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log('red', `❌ Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

if (require.main === module) {
  main();
}

module.exports = { verifySecurityHeaders, checkHeaders };