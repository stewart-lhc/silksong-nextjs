/**
 * Timeline API Test Script - PRD Day 3 Compliance
 * Tests the /api/timeline endpoint to verify all PRD specifications
 */

const baseUrl = 'http://localhost:3000';

// Utility function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data
    };
  } catch (error) {
    return {
      status: 0,
      error: error.message,
      data: null
    };
  }
}

// Test cases for /api/timeline endpoint
const timelineTests = [
  {
    name: 'Basic request - should return JSON array sorted by date descending',
    url: `${baseUrl}/api/timeline`,
    expectedStatus: 200,
    validate: (response) => {
      if (!Array.isArray(response.data)) {
        throw new Error('Response should be JSON array, got: ' + typeof response.data);
      }
      
      if (response.data.length === 0) {
        throw new Error('Response should contain timeline events');
      }
      
      // Verify default limit (20)
      if (response.data.length > 20) {
        throw new Error(`Expected max 20 events by default, got: ${response.data.length}`);
      }
      
      // Verify sorting (newest first)
      for (let i = 1; i < response.data.length; i++) {
        const prevDate = new Date(response.data[i-1].date);
        const currDate = new Date(response.data[i].date);
        if (prevDate < currDate) {
          throw new Error(`Events not sorted by date descending: ${prevDate} < ${currDate}`);
        }
      }
      
      // Verify event structure
      const event = response.data[0];
      const requiredFields = ['id', 'date', 'title', 'description', 'type', 'source', 'category'];
      for (const field of requiredFields) {
        if (!(field in event)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      console.log(`✓ Returned ${response.data.length} events correctly sorted`);
    }
  },
  
  {
    name: 'Limit parameter - clamp to valid range',
    tests: [
      {
        name: 'limit=3 should return 3 events',
        url: `${baseUrl}/api/timeline?limit=3`,
        expectedStatus: 200,
        validate: (response) => {
          if (!Array.isArray(response.data) || response.data.length !== 3) {
            throw new Error(`Expected 3 events, got: ${response.data?.length}`);
          }
          console.log('✓ limit=3 returned 3 events');
        }
      },
      {
        name: 'limit=0 should clamp to 1',
        url: `${baseUrl}/api/timeline?limit=0`,
        expectedStatus: 200,
        validate: (response) => {
          if (!Array.isArray(response.data) || response.data.length !== 1) {
            throw new Error(`Expected 1 event (clamped from 0), got: ${response.data?.length}`);
          }
          console.log('✓ limit=0 clamped to 1 event');
        }
      },
      {
        name: 'limit=100 should clamp to 50',
        url: `${baseUrl}/api/timeline?limit=100`,
        expectedStatus: 200,
        validate: (response) => {
          if (!Array.isArray(response.data) || response.data.length > 50) {
            throw new Error(`Expected max 50 events (clamped from 100), got: ${response.data?.length}`);
          }
          console.log(`✓ limit=100 clamped to ${response.data.length} events (max 50)`);
        }
      },
      {
        name: 'limit=abc should use default (20)',
        url: `${baseUrl}/api/timeline?limit=abc`,
        expectedStatus: 200,
        validate: (response) => {
          if (!Array.isArray(response.data) || response.data.length > 20) {
            throw new Error(`Expected default 20 events for invalid limit, got: ${response.data?.length}`);
          }
          console.log(`✓ Invalid limit defaulted to ${response.data.length} events (max 20)`);
        }
      }
    ]
  },
  
  {
    name: 'After parameter - UTC ISO8601 validation',
    tests: [
      {
        name: 'Valid UTC with Z should work',
        url: `${baseUrl}/api/timeline?after=2024-01-01T00:00:00Z&limit=5`,
        expectedStatus: 200,
        validate: (response) => {
          if (!Array.isArray(response.data)) {
            throw new Error('Should return JSON array for valid after parameter');
          }
          // All returned events should be before 2024-01-01T00:00:00Z
          for (const event of response.data) {
            const eventDate = new Date(event.date);
            const afterDate = new Date('2024-01-01T00:00:00Z');
            if (eventDate >= afterDate) {
              throw new Error(`Event ${event.id} (${event.date}) should be before ${afterDate}`);
            }
          }
          console.log(`✓ Valid UTC with Z returned ${response.data.length} events before 2024-01-01`);
        }
      },
      {
        name: 'Valid UTC with offset should work',
        url: `${baseUrl}/api/timeline?after=2024-01-01T05:00:00%2B05:00&limit=5`,
        expectedStatus: 200,
        validate: (response) => {
          if (!Array.isArray(response.data)) {
            throw new Error('Should return JSON array for valid after parameter');
          }
          console.log(`✓ Valid UTC with offset returned ${response.data.length} events`);
        }
      },
      {
        name: 'Invalid format without timezone should return 400',
        url: `${baseUrl}/api/timeline?after=2024-01-01T00:00:00`,
        expectedStatus: 400,
        validate: (response) => {
          if (response.data?.error !== 'invalid_after') {
            throw new Error(`Expected {"error": "invalid_after"}, got: ${JSON.stringify(response.data)}`);
          }
          console.log('✓ Invalid format (no timezone) returned 400 with correct error');
        }
      },
      {
        name: 'Invalid date format should return 400',
        url: `${baseUrl}/api/timeline?after=invalid-date`,
        expectedStatus: 400,
        validate: (response) => {
          if (response.data?.error !== 'invalid_after') {
            throw new Error(`Expected {"error": "invalid_after"}, got: ${JSON.stringify(response.data)}`);
          }
          console.log('✓ Invalid date format returned 400 with correct error');
        }
      },
      {
        name: 'Partial ISO8601 should return 400',
        url: `${baseUrl}/api/timeline?after=2024-01-01`,
        expectedStatus: 400,
        validate: (response) => {
          if (response.data?.error !== 'invalid_after') {
            throw new Error(`Expected {"error": "invalid_after"}, got: ${JSON.stringify(response.data)}`);
          }
          console.log('✓ Partial ISO8601 returned 400 with correct error');
        }
      }
    ]
  }
];

// Main test runner
async function runTests() {
  console.log('=== Timeline API PRD Day 3 Compliance Tests ===\\n');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = [];
  
  for (const testGroup of timelineTests) {
    console.log(`\\n🧪 ${testGroup.name}`);
    console.log('─'.repeat(50));
    
    if (testGroup.tests) {
      // Test group with subtests
      for (const test of testGroup.tests) {
        totalTests++;
        try {
          const response = await makeRequest(test.url);
          
          if (response.status !== test.expectedStatus) {
            throw new Error(`Expected status ${test.expectedStatus}, got ${response.status}`);
          }
          
          await test.validate(response);
          passedTests++;
          
        } catch (error) {
          console.log(`✗ ${test.name}: ${error.message}`);
          failedTests.push({ name: test.name, error: error.message });
        }
      }
    } else {
      // Single test
      totalTests++;
      try {
        const response = await makeRequest(testGroup.url);
        
        if (response.status !== testGroup.expectedStatus) {
          throw new Error(`Expected status ${testGroup.expectedStatus}, got ${response.status}`);
        }
        
        await testGroup.validate(response);
        passedTests++;
        
      } catch (error) {
        console.log(`✗ ${testGroup.name}: ${error.message}`);
        failedTests.push({ name: testGroup.name, error: error.message });
      }
    }
  }
  
  console.log('\\n=== Test Results ===');
  console.log(`Total tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests.length}`);
  
  if (failedTests.length > 0) {
    console.log('\\nFailed tests:');
    failedTests.forEach(test => {
      console.log(`- ${test.name}: ${test.error}`);
    });
    process.exit(1);
  } else {
    console.log('\\n🎉 All tests passed! API is PRD Day 3 compliant.');
    process.exit(0);
  }
}

// Run tests if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests, timelineTests };