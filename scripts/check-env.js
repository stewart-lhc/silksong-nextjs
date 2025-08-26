#!/usr/bin/env node

/**
 * Environment Variables Check Script
 * Helps debug environment variable issues in different deployment environments
 */

console.log('🔍 Environment Variables Check');
console.log('='.repeat(50));

// Basic environment info
console.log('📍 Environment Info:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`   Platform: ${process.env.VERCEL ? 'Vercel' : 'Local/Other'}`);
console.log(`   VERCEL: ${process.env.VERCEL || 'undefined'}`);
console.log('');

// Required variables
console.log('🔑 Required Variables:');
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

let missingRequired = 0;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ Set' : '❌ Missing';
  const preview = value ? (value.length > 20 ? `${value.substring(0, 20)}...` : value) : 'undefined';
  console.log(`   ${varName}: ${status}`);
  if (value) {
    console.log(`     Value: ${preview}`);
  }
  if (!value) missingRequired++;
});

console.log('');

// Optional variables with defaults
console.log('⚙️ Optional Variables (with defaults):');
const optionalVars = [
  { name: 'NEXT_PUBLIC_APP_URL', default: 'https://hollowknightsilksong.org' },
  { name: 'NEXT_PUBLIC_APP_NAME', default: 'Silk Song Archive' },
  { name: 'NEXT_PUBLIC_SITE_DESCRIPTION', default: 'Official archive site...' },
  { name: 'NEXT_PUBLIC_KEYWORDS', default: 'Hollow Knight,Silksong...' }
];

optionalVars.forEach(({ name, default: defaultValue }) => {
  const value = process.env[name];
  const status = value ? '✅ Set' : `🔄 Using default`;
  const displayValue = value || defaultValue;
  const preview = displayValue.length > 30 ? `${displayValue.substring(0, 30)}...` : displayValue;
  console.log(`   ${name}: ${status}`);
  console.log(`     Value: ${preview}`);
});

console.log('');

// Additional optional variables
console.log('🎛️ Additional Optional Variables:');
const additionalVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_GA_ID',
  'VERCEL_ANALYTICS_ID',
  'ENABLE_ANALYTICS',
  'ENABLE_PWA'
];

additionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ Set' : '⚪ Not set';
  console.log(`   ${varName}: ${status}`);
});

console.log('');

// Summary
console.log('📋 Summary:');
console.log('='.repeat(50));

if (missingRequired === 0) {
  console.log('✅ All required environment variables are set!');
  console.log('🚀 Your application should deploy successfully.');
} else {
  console.log(`❌ ${missingRequired} required environment variable(s) missing.`);
  console.log('');
  console.log('🔧 To fix this:');
  
  if (process.env.VERCEL) {
    console.log('   1. Go to your Vercel project dashboard');
    console.log('   2. Navigate to Settings → Environment Variables');
    console.log('   3. Add the missing variables');
    console.log('   4. Redeploy your project');
  } else {
    console.log('   1. Create or update your .env.local file');
    console.log('   2. Add the missing variables');
    console.log('   3. Restart your development server');
  }
}

console.log('');

// Validation test
console.log('🧪 Validation Test:');
try {
  // Try to import and validate env
  const { env } = require('../lib/env');
  console.log('✅ Environment validation passed!');
  console.log(`   App URL: ${env.NEXT_PUBLIC_APP_URL}`);
  console.log(`   App Name: ${env.NEXT_PUBLIC_APP_NAME}`);
  console.log(`   Supabase URL: ${env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Valid' : '❌ Invalid'}`);
} catch (error) {
  console.log('❌ Environment validation failed:');
  console.log(`   Error: ${error.message}`);
  
  // Extract specific validation errors
  if (error.message.includes('Environment validation failed:')) {
    const lines = error.message.split('\n');
    const errorLines = lines.filter(line => line.includes(': '));
    if (errorLines.length > 0) {
      console.log('   Specific issues:');
      errorLines.forEach(line => {
        console.log(`     • ${line.trim()}`);
      });
    }
  }
}

// Exit with appropriate code
process.exit(missingRequired > 0 ? 1 : 0);