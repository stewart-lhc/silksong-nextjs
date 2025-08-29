#!/usr/bin/env node

/**
 * Pre-build validation script
 * Checks configuration, dependencies, and code quality before building
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Running pre-build checks...\n');

let hasErrors = false;
const warnings = [];

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  hasErrors = true;
  log(`❌ ${message}`, 'red');
}

function warn(message) {
  warnings.push(message);
  log(`⚠️  ${message}`, 'yellow');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Check 1: Package.json validation
info('Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Required fields
  const requiredFields = ['name', 'version', 'description', 'main', 'types'];
  for (const field of requiredFields) {
    if (!packageJson[field]) {
      error(`Missing required field in package.json: ${field}`);
    }
  }
  
  // Check peer dependencies
  if (!packageJson.peerDependencies) {
    warn('No peer dependencies defined');
  } else {
    const expectedPeers = ['@supabase/supabase-js', '@tanstack/react-query', 'next', 'react'];
    for (const peer of expectedPeers) {
      if (!packageJson.peerDependencies[peer]) {
        warn(`Missing peer dependency: ${peer}`);
      }
    }
  }
  
  // Check scripts
  const requiredScripts = ['build', 'test', 'lint', 'type-check'];
  for (const script of requiredScripts) {
    if (!packageJson.scripts[script]) {
      warn(`Missing npm script: ${script}`);
    }
  }
  
  success('Package.json validation passed');
} catch (err) {
  error(`Failed to read or parse package.json: ${err.message}`);
}

// Check 2: TypeScript configuration
info('Checking TypeScript configuration...');
try {
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    // Check compiler options
    const compilerOptions = tsconfig.compilerOptions || {};
    if (compilerOptions.strict !== true) {
      warn('TypeScript strict mode not enabled');
    }
    
    if (!compilerOptions.declaration) {
      error('TypeScript declaration files not enabled (required for npm package)');
    }
    
    if (!compilerOptions.outDir) {
      warn('No output directory specified in tsconfig.json');
    }
    
    success('TypeScript configuration validated');
  } else {
    error('tsconfig.json not found');
  }
} catch (err) {
  error(`Failed to validate TypeScript config: ${err.message}`);
}

// Check 3: Source files structure
info('Checking source files structure...');
const requiredDirs = ['src', 'src/components', 'src/hooks', 'src/types', 'src/utils'];
const requiredFiles = [
  'src/index.ts',
  'src/types/index.ts',
  'src/config/defaults.ts'
];

for (const dir of requiredDirs) {
  if (!fs.existsSync(dir)) {
    error(`Missing required directory: ${dir}`);
  }
}

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    error(`Missing required file: ${file}`);
  }
}

// Check for TypeScript files
const srcFiles = fs.readdirSync('src', { recursive: true })
  .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));

if (srcFiles.length === 0) {
  error('No TypeScript source files found in src/');
} else {
  success(`Found ${srcFiles.length} TypeScript source files`);
}

// Check 4: Dependencies
info('Checking dependencies...');
try {
  // Check if node_modules exists
  if (!fs.existsSync('node_modules')) {
    error('node_modules directory not found. Run npm install.');
  } else {
    // Check critical dependencies
    const criticalDeps = ['typescript', 'react', '@types/react'];
    for (const dep of criticalDeps) {
      const depPath = path.join('node_modules', dep);
      if (!fs.existsSync(depPath)) {
        error(`Critical dependency missing: ${dep}`);
      }
    }
    
    success('Dependencies check passed');
  }
} catch (err) {
  error(`Failed to check dependencies: ${err.message}`);
}

// Check 5: Linting
info('Running ESLint...');
try {
  execSync('npm run lint', { stdio: 'pipe' });
  success('ESLint passed');
} catch (err) {
  const output = err.stdout?.toString() || err.stderr?.toString() || '';
  if (output.includes('error')) {
    error('ESLint found errors - fix before building');
    console.log(output);
  } else if (output.includes('warning')) {
    warn('ESLint found warnings');
    console.log(output);
  }
}

// Check 6: Type checking
info('Running TypeScript type check...');
try {
  execSync('npm run type-check', { stdio: 'pipe' });
  success('TypeScript type check passed');
} catch (err) {
  error('TypeScript type errors found - fix before building');
  const output = err.stdout?.toString() || err.stderr?.toString() || '';
  console.log(output);
}

// Check 7: Tests
info('Running tests...');
try {
  execSync('npm test -- --passWithNoTests', { stdio: 'pipe' });
  success('Tests passed');
} catch (err) {
  error('Tests failed - fix before building');
  const output = err.stdout?.toString() || err.stderr?.toString() || '';
  console.log(output);
}

// Check 8: Build directory cleanup
info('Checking build directory...');
const distDir = 'dist';
if (fs.existsSync(distDir)) {
  warn('dist/ directory exists - will be cleaned during build');
} else {
  info('dist/ directory clean');
}

// Check 9: Documentation
info('Checking documentation...');
const docFiles = ['README.md', 'CHANGELOG.md'];
for (const doc of docFiles) {
  if (fs.existsSync(doc)) {
    const content = fs.readFileSync(doc, 'utf8');
    if (content.length < 100) {
      warn(`${doc} appears to be incomplete`);
    } else {
      success(`${doc} found and appears complete`);
    }
  } else {
    warn(`Missing documentation file: ${doc}`);
  }
}

// Check 10: License
info('Checking license...');
if (fs.existsSync('LICENSE')) {
  success('License file found');
} else {
  warn('No LICENSE file found');
}

// Check 11: Git status
info('Checking git status...');
try {
  const gitStatus = execSync('git status --porcelain', { 
    encoding: 'utf8',
    stdio: 'pipe'
  }).trim();
  
  if (gitStatus) {
    warn('Uncommitted changes detected. Consider committing before building.');
    console.log(gitStatus);
  } else {
    success('Git working directory clean');
  }
} catch (err) {
  info('Not in a git repository or git not available');
}

// Summary
console.log('\n' + '='.repeat(50));
log('📋 BUILD CHECK SUMMARY', 'bold');
console.log('='.repeat(50));

if (hasErrors) {
  error(`Build check failed with ${hasErrors} errors`);
  process.exit(1);
} else {
  success('All critical checks passed!');
  
  if (warnings.length > 0) {
    log(`\n⚠️  ${warnings.length} warnings found:`, 'yellow');
    warnings.forEach(warning => {
      log(`   • ${warning}`, 'yellow');
    });
    console.log('');
  }
  
  log('🚀 Ready to build!', 'green');
}

// Build recommendations
console.log('\n💡 Recommendations:');
log('• Run `npm run build` to create the production build', 'blue');
log('• Use `npm pack` to create a tarball for testing', 'blue');
log('• Test the package locally with `npm install ./package-name.tgz`', 'blue');
log('• Consider running `npm audit` to check for security vulnerabilities', 'blue');

console.log('');