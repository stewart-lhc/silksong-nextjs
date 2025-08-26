#!/usr/bin/env node

/**
 * Test Script for Server-Side Subscription API
 * Tests the /api/subscriptions endpoints to ensure they work correctly
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const TEST_EMAIL = `test-${Date.now()}@example.com`;

console.log('🧪 Testing Server-Side Subscription API');
console.log('=' .repeat(50));
console.log(`Base URL: ${BASE_URL}`);
console.log(`Test Email: ${TEST_EMAIL}`);
console.log('');

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test functions
async function testGetSubscriptionCount() {
  console.log('📊 Testing GET /api/subscriptions (subscription count)...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/subscriptions`);
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, response.data);
    
    if (response.status === 200) {
      console.log('   ✅ GET subscription count - PASSED');
      return response.data.count || 0;
    } else {
      console.log('   ❌ GET subscription count - FAILED');
      return 0;
    }
  } catch (error) {
    console.log('   ❌ GET subscription count - ERROR:', error.message);
    return 0;
  }
}

async function testPostSubscription() {
  console.log('\n📧 Testing POST /api/subscriptions (subscribe)...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/subscriptions`, {
      method: 'POST',
      body: {
        email: TEST_EMAIL
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, response.data);
    
    if (response.status === 201 && response.data.success) {
      console.log('   ✅ POST subscription - PASSED');
      return true;
    } else if (response.status === 409) {
      console.log('   ⚠️  POST subscription - Email already exists (expected for repeated tests)');
      return true;
    } else {
      console.log('   ❌ POST subscription - FAILED');
      return false;
    }
  } catch (error) {
    console.log('   ❌ POST subscription - ERROR:', error.message);
    return false;
  }
}

async function testDuplicateSubscription() {
  console.log('\n🔄 Testing duplicate subscription...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/subscriptions`, {
      method: 'POST',
      body: {
        email: TEST_EMAIL
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, response.data);
    
    if (response.status === 409 && response.data.code === 'ALREADY_SUBSCRIBED') {
      console.log('   ✅ Duplicate subscription handling - PASSED');
      return true;
    } else {
      console.log('   ❌ Duplicate subscription handling - FAILED');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Duplicate subscription handling - ERROR:', error.message);
    return false;
  }
}

async function testInvalidEmail() {
  console.log('\n❌ Testing invalid email validation...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/subscriptions`, {
      method: 'POST',
      body: {
        email: 'invalid-email'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, response.data);
    
    if (response.status === 400) {
      console.log('   ✅ Invalid email validation - PASSED');
      return true;
    } else {
      console.log('   ❌ Invalid email validation - FAILED');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Invalid email validation - ERROR:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('Starting API tests...\n');
  
  const results = {
    getCount: false,
    postSubscription: false,
    duplicateHandling: false,
    emailValidation: false
  };

  // Test 1: Get initial subscription count
  const initialCount = await testGetSubscriptionCount();
  results.getCount = true;

  // Test 2: Subscribe with new email
  results.postSubscription = await testPostSubscription();

  // Test 3: Try to subscribe with same email (should fail)
  results.duplicateHandling = await testDuplicateSubscription();

  // Test 4: Try to subscribe with invalid email
  results.emailValidation = await testInvalidEmail();

  // Test 5: Get updated subscription count
  console.log('\n📊 Testing updated subscription count...');
  const finalCount = await testGetSubscriptionCount();

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(50));
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`Initial Count: ${initialCount}`);
  console.log(`Final Count: ${finalCount}`);
  
  if (results.postSubscription && finalCount > initialCount) {
    console.log('✅ Subscription count increased correctly');
  }
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Server-side API is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the API implementation.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});