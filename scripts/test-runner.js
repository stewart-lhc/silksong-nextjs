#!/usr/bin/env node
/**
 * Test Runner Script
 * Advanced test runner with filtering, parallel execution, and reporting
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
  // Test suites configuration
  suites: {
    unit: {
      command: 'jest',
      args: ['__tests__/unit', '--passWithNoTests'],
      description: 'Unit tests for individual components',
      critical: true,
    },
    integration: {
      command: 'jest',
      args: ['__tests__/integration', '--passWithNoTests'],
      description: 'Integration tests for component interactions',
      critical: true,
    },
    accessibility: {
      command: 'jest',
      args: ['__tests__/accessibility', '--passWithNoTests'],
      description: 'Accessibility and WCAG compliance tests',
      critical: false,
    },
    performance: {
      command: 'jest',
      args: ['__tests__/performance', '--passWithNoTests'],
      description: 'Performance and optimization tests',
      critical: false,
    },
    e2e: {
      command: 'npx',
      args: ['playwright', 'test'],
      description: 'End-to-end browser tests',
      critical: true,
    },
  },
  
  // Default options
  defaults: {
    parallel: true,
    coverage: false,
    verbose: false,
    watch: false,
    bail: false,
    timeout: 300000, // 5 minutes per suite
  },
};

class TestRunner {
  constructor(options = {}) {
    this.options = { ...CONFIG.defaults, ...options };
    this.results = {
      passed: [],
      failed: [],
      skipped: [],
      total: 0,
      duration: 0,
    };
  }

  async run(suites = Object.keys(CONFIG.suites)) {
    console.log('🚀 Starting Email Subscription Test Runner\n');
    
    const startTime = Date.now();
    
    try {
      if (this.options.parallel && suites.length > 1) {
        await this.runParallel(suites);
      } else {
        await this.runSequential(suites);
      }
    } catch (error) {
      console.error('❌ Test runner failed:', error.message);
      process.exit(1);
    }
    
    this.results.duration = Date.now() - startTime;
    this.printSummary();
    
    // Exit with appropriate code
    const hasFailures = this.results.failed.length > 0;
    const hasCriticalFailures = this.results.failed.some(
      result => CONFIG.suites[result.suite]?.critical
    );
    
    if (hasCriticalFailures) {
      process.exit(1);
    } else if (hasFailures && this.options.bail) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }

  async runSequential(suites) {
    console.log('📋 Running tests sequentially...\n');
    
    for (const suite of suites) {
      if (!CONFIG.suites[suite]) {
        console.warn(`⚠️  Unknown test suite: ${suite}`);
        continue;
      }
      
      const result = await this.runSuite(suite);
      
      if (result.success) {
        this.results.passed.push(result);
      } else {
        this.results.failed.push(result);
        
        if (this.options.bail && CONFIG.suites[suite].critical) {
          console.log('\n🛑 Critical test failed, stopping execution (--bail)');
          break;
        }
      }
    }
  }

  async runParallel(suites) {
    console.log('⚡ Running tests in parallel...\n');
    
    const promises = suites.map(suite => this.runSuite(suite));
    const results = await Promise.allSettled(promises);
    
    results.forEach((result, index) => {
      const suite = suites[index];
      
      if (result.status === 'fulfilled' && result.value.success) {
        this.results.passed.push(result.value);
      } else {
        this.results.failed.push({
          suite,
          success: false,
          duration: 0,
          error: result.reason || result.value?.error || 'Unknown error',
        });
      }
    });
  }

  async runSuite(suite) {
    const config = CONFIG.suites[suite];
    const startTime = Date.now();
    
    console.log(`🧪 Running ${suite} tests...`);
    console.log(`   ${config.description}`);
    
    try {
      const args = [...config.args];
      
      // Add common options
      if (this.options.coverage && config.command === 'jest') {
        args.push('--coverage', `--coverageDirectory=coverage/${suite}`);
      }
      
      if (this.options.verbose) {
        args.push('--verbose');
      }
      
      if (this.options.watch && config.command === 'jest') {
        args.push('--watch');
      }
      
      // Run the test command
      const success = await this.executeCommand(config.command, args);
      const duration = Date.now() - startTime;
      
      if (success) {
        console.log(`✅ ${suite} tests passed (${this.formatDuration(duration)})\n`);
      } else {
        console.log(`❌ ${suite} tests failed (${this.formatDuration(duration)})\n`);
      }
      
      return {
        suite,
        success,
        duration,
        critical: config.critical,
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`💥 ${suite} tests crashed (${this.formatDuration(duration)})`);
      console.log(`   Error: ${error.message}\n`);
      
      return {
        suite,
        success: false,
        duration,
        critical: config.critical,
        error: error.message,
      };
    }
  }

  executeCommand(command, args) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: this.options.verbose ? 'inherit' : 'pipe',
        shell: true,
        timeout: this.options.timeout,
      });

      let stdout = '';
      let stderr = '';

      if (!this.options.verbose) {
        child.stdout?.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr?.on('data', (data) => {
          stderr += data.toString();
        });
      }

      child.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          if (!this.options.verbose) {
            console.log('STDOUT:', stdout);
            console.log('STDERR:', stderr);
          }
          resolve(false);
        }
      });

      child.on('error', (error) => {
        reject(error);
      });

      // Handle timeout
      setTimeout(() => {
        child.kill('SIGKILL');
        reject(new Error(`Command timed out after ${this.options.timeout}ms`));
      }, this.options.timeout);
    });
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    const totalTests = this.results.passed.length + this.results.failed.length;
    const passRate = totalTests > 0 ? (this.results.passed.length / totalTests * 100).toFixed(1) : 0;
    
    console.log(`Total test suites: ${totalTests}`);
    console.log(`Passed: ${this.results.passed.length} ✅`);
    console.log(`Failed: ${this.results.failed.length} ❌`);
    console.log(`Pass rate: ${passRate}%`);
    console.log(`Total duration: ${this.formatDuration(this.results.duration)}`);
    
    if (this.results.failed.length > 0) {
      console.log('\n❌ FAILED SUITES:');
      this.results.failed.forEach(result => {
        const critical = CONFIG.suites[result.suite]?.critical ? ' (CRITICAL)' : '';
        console.log(`   • ${result.suite}${critical} - ${result.error || 'Test failures'}`);
      });
    }
    
    if (this.results.passed.length > 0) {
      console.log('\n✅ PASSED SUITES:');
      this.results.passed.forEach(result => {
        console.log(`   • ${result.suite} (${this.formatDuration(result.duration)})`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Quality gate summary
    const criticalFailed = this.results.failed.filter(
      result => CONFIG.suites[result.suite]?.critical
    );
    
    if (criticalFailed.length > 0) {
      console.log('🚨 QUALITY GATE: FAILED (Critical tests failed)');
    } else if (this.results.failed.length > 0) {
      console.log('⚠️  QUALITY GATE: WARNING (Non-critical tests failed)');
    } else {
      console.log('🎉 QUALITY GATE: PASSED (All tests successful)');
    }
  }

  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  }
}

// CLI Interface
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    suites: [],
    parallel: true,
    coverage: false,
    verbose: false,
    watch: false,
    bail: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
        
      case '--sequential':
        options.parallel = false;
        break;
        
      case '--coverage':
        options.coverage = true;
        break;
        
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
        
      case '--watch':
        options.watch = true;
        break;
        
      case '--bail':
        options.bail = true;
        break;
        
      case '--suite':
        if (i + 1 < args.length) {
          options.suites.push(args[i + 1]);
          i++;
        }
        break;
        
      default:
        if (CONFIG.suites[arg]) {
          options.suites.push(arg);
        } else {
          console.warn(`Unknown argument: ${arg}`);
        }
        break;
    }
  }
  
  // Default to all suites if none specified
  if (options.suites.length === 0) {
    options.suites = Object.keys(CONFIG.suites);
  }
  
  return options;
}

function printHelp() {
  console.log(`
🧪 Email Subscription Test Runner

USAGE:
  node scripts/test-runner.js [options] [suites...]

SUITES:
  unit          Unit tests for individual components
  integration   Integration tests for component interactions  
  accessibility Accessibility and WCAG compliance tests
  performance   Performance and optimization tests
  e2e           End-to-end browser tests

OPTIONS:
  --help, -h        Show this help message
  --sequential      Run tests sequentially (default: parallel)
  --coverage        Generate coverage reports
  --verbose, -v     Show detailed output
  --watch           Watch mode for development
  --bail            Stop on first critical failure
  --suite <name>    Run specific suite

EXAMPLES:
  node scripts/test-runner.js                    # Run all tests
  node scripts/test-runner.js unit integration  # Run specific suites
  node scripts/test-runner.js --coverage        # Run with coverage
  node scripts/test-runner.js --verbose --bail  # Verbose with early exit
  
ENVIRONMENT VARIABLES:
  CI=true           Optimize for CI environment
  DEBUG=true        Enable debug output
`);
}

// Main execution
if (require.main === module) {
  const options = parseArgs();
  const runner = new TestRunner(options);
  
  runner.run(options.suites).catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = TestRunner;