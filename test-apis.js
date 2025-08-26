/**
 * API Test Script
 * Tests the /api/log and /api/differences endpoints to verify PRD compliance
 */

const baseUrl = 'http://localhost:3009';

// Test cases for /api/log endpoint
const logTests = [
  {
    name: 'Valid perf log',
    method: 'POST',
    url: '/api/log',
    body: JSON.stringify({ type: 'perf', metric: 'load_time', value: 1234 }),
    expectedStatus: 204
  },
  {
    name: 'Valid embed log',
    method: 'POST',
    url: '/api/log',
    body: JSON.stringify({ type: 'embed', component: 'countdown', action: 'view' }),
    expectedStatus: 204
  },
  {
    name: 'Invalid JSON',
    method: 'POST',
    url: '/api/log',
    body: '{ invalid json',
    expectedStatus: 400,
    expectedError: 'invalid_json'
  },
  {
    name: 'Invalid type',
    method: 'POST',
    url: '/api/log',
    body: JSON.stringify({ type: 'invalid', data: 'test' }),
    expectedStatus: 400,
    expectedError: 'invalid_type'
  },
  {
    name: 'Forbidden key - email',
    method: 'POST',
    url: '/api/log',
    body: JSON.stringify({ type: 'perf', email: 'test@test.com' }),
    expectedStatus: 400,
    expectedError: 'forbidden_key'
  },
  {
    name: 'Forbidden key - user_agent',
    method: 'POST',
    url: '/api/log',
    body: JSON.stringify({ type: 'perf', user_agent: 'Mozilla/5.0' }),
    expectedStatus: 400,
    expectedError: 'forbidden_key'
  },
  {
    name: 'Unsupported method GET',
    method: 'GET',
    url: '/api/log',
    expectedStatus: 405
  }
];

// Test cases for /api/differences endpoint
const differencesTests = [
  {
    name: 'Basic differences request',
    method: 'GET',
    url: '/api/differences',
    expectedStatus: 200
  },
  {
    name: 'Differences with status filter',
    method: 'GET',
    url: '/api/differences?status=confirmed,hinted',
    expectedStatus: 200
  },
  {
    name: 'Differences grouped format',
    method: 'GET',
    url: '/api/differences?format=grouped',
    expectedStatus: 200
  },
  {
    name: 'Differences with empty status',
    method: 'GET',
    url: '/api/differences?status=',
    expectedStatus: 200
  },
  {
    name: 'Differences with invalid status',
    method: 'GET',
    url: '/api/differences?status=invalid,confirmed',
    expectedStatus: 200
  }
];

async function runTest(test) {
  try {
    const options = {
      method: test.method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (test.body) {
      options.body = test.body;
    }
    
    console.log(`\n🧪 Running: ${test.name}`);
    console.log(`   ${test.method} ${baseUrl}${test.url}`);
    
    const response = await fetch(baseUrl + test.url, options);
    
    console.log(`   Status: ${response.status}`);
    
    if (test.expectedStatus && response.status !== test.expectedStatus) {
      console.log(`   ❌ Expected status ${test.expectedStatus}, got ${response.status}`);
      return false;
    }
    
    // Check response headers
    const cacheControl = response.headers.get('Cache-Control');
    if (test.url.includes('/api/differences') && response.status === 200) {
      if (!cacheControl || !cacheControl.includes('public, max-age=300')) {
        console.log(`   ⚠️  Missing or incorrect Cache-Control header: ${cacheControl}`);
      } else {
        console.log(`   ✓ Cache-Control header correct: ${cacheControl}`);
      }
    }
    
    // Check response body for errors
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (test.expectedError && data.error !== test.expectedError) {
        console.log(`   ❌ Expected error '${test.expectedError}', got '${data.error}'`);
        return false;
      }
      
      if (test.expectedError && data.error === test.expectedError) {
        console.log(`   ✓ Error response correct: ${data.error}`);
      }
      
      // Check differences response structure
      if (test.url.includes('/api/differences') && !data.error) {
        const hasUpdated = 'updated' in data;
        const hasTotal = 'total' in data;
        const hasData = 'differences' in data || 'groups' in data;
        
        if (!hasUpdated || !hasTotal || !hasData) {
          console.log(`   ❌ Missing required response fields. Has: updated=${hasUpdated}, total=${hasTotal}, data=${hasData}`);
          return false;
        }
        
        console.log(`   ✓ Response structure valid. Total: ${data.total}`);
      }
    }
    
    console.log(`   ✅ Test passed`);
    return true;
    
  } catch (error) {
    console.log(`   ❌ Test failed with error: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting API Tests');
  console.log(`📍 Base URL: ${baseUrl}`);
  
  let passed = 0;
  let total = 0;
  
  console.log('\n📝 Testing /api/log endpoint');
  for (const test of logTests) {
    const result = await runTest(test);
    if (result) passed++;
    total++;
  }
  
  console.log('\n📊 Testing /api/differences endpoint');
  for (const test of differencesTests) {
    const result = await runTest(test);
    if (result) passed++;
    total++;
  }
  
  console.log('\n📊 Test Summary');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! APIs are compliant with PRD requirements.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
    process.exit(1);
  }
}

// Run the tests
runAllTests().catch(console.error);