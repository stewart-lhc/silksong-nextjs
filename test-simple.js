/**
 * Simple API Test - Direct HTTP calls to test API functionality
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Test the log API directly by simulating the POST handler
const { POST } = require('./app/api/log/route.ts');

console.log('🧪 Testing API functions directly...');

// Mock NextRequest
class MockNextRequest {
  constructor(method, url, headers = {}, body = '') {
    this.method = method;
    this.url = url;
    this.headers = new Map(Object.entries(headers));
    this._body = body;
  }
  
  async text() {
    return this._body;
  }
  
  headers = {
    get: (key) => this.headers.get(key) || null
  }
}

// Test log API with various payloads
async function testLogAPI() {
  console.log('\n📝 Testing /api/log directly...');
  
  const tests = [
    {
      name: 'Valid perf log',
      body: JSON.stringify({ type: 'perf', metric: 'load_time', value: 1234 }),
      expectedStatus: 204
    },
    {
      name: 'Invalid type',
      body: JSON.stringify({ type: 'invalid' }),
      expectedStatus: 400
    },
    {
      name: 'Forbidden key - email',
      body: JSON.stringify({ type: 'perf', email: 'test@test.com' }),
      expectedStatus: 400
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`\n🧪 ${test.name}`);
      
      const mockRequest = new MockNextRequest('POST', '/api/log', {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(test.body, 'utf8').toString()
      }, test.body);
      
      const response = await POST(mockRequest);
      console.log(`   Status: ${response.status}`);
      
      if (test.expectedStatus && response.status === test.expectedStatus) {
        console.log(`   ✅ Test passed`);
      } else {
        console.log(`   ❌ Expected ${test.expectedStatus}, got ${response.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

// Test the differences API files exist
function testDifferencesFiles() {
  console.log('\n📊 Testing /api/differences data files...');
  
  const files = [
    'data/differences.json',
    'data/differences-unconfirmed.json'
  ];
  
  for (const file of files) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`   ✅ ${file} exists (modified: ${stats.mtime.toISOString()})`);
    } else {
      console.log(`   ❌ ${file} not found`);
    }
  }
}

// Run tests
async function runTests() {
  try {
    await testLogAPI();
    testDifferencesFiles();
    console.log('\n✅ Direct tests completed');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTests();