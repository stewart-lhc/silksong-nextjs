#!/usr/bin/env node

/**
 * OG 图片生成测试工具
 * 用于测试动态 OG 图片生成 API 的各种功能
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// 测试用例配置
const TEST_CASES = [
  {
    name: 'Default English',
    url: '/api/og',
    expected: {
      contentType: 'image/png',
      statusCode: 200,
    }
  },
  {
    name: 'Chinese Language',
    url: '/api/og?lang=zh',
    expected: {
      contentType: 'image/png',
      statusCode: 200,
    }
  },
  {
    name: 'Custom Release Date',
    url: '/api/og?releaseDate=2024-12-25&lang=en',
    expected: {
      contentType: 'image/png',
      statusCode: 200,
    }
  },
  {
    name: 'Released Status',
    url: '/api/og?releaseDate=2024-01-01',
    expected: {
      contentType: 'image/png',
      statusCode: 200,
    }
  },
  {
    name: 'Urgent Status (7 days)',
    url: '/api/og?releaseDate=2024-12-31',
    expected: {
      contentType: 'image/png',
      statusCode: 200,
    }
  },
  {
    name: 'Invalid Date Format',
    url: '/api/og?releaseDate=invalid-date',
    expected: {
      statusCode: 400,
    }
  },
];

// HTTP 请求工具
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

// 测试缓存功能
async function testCaching(url) {
  console.log('\n🔄 Testing ETag caching...');
  
  try {
    // 第一次请求
    const firstResponse = await makeRequest(`${BASE_URL}${url}`);
    const etag = firstResponse.headers.etag;
    
    if (!etag) {
      console.log('❌ No ETag header found');
      return false;
    }
    
    console.log(`✅ First request: ETag = ${etag}`);
    
    // 第二次请求带 If-None-Match
    const secondUrl = `${BASE_URL}${url}`;
    const secondResponse = await new Promise((resolve, reject) => {
      const isHttps = secondUrl.startsWith('https://');
      const client = isHttps ? https : http;
      
      const req = client.request(secondUrl, {
        headers: {
          'If-None-Match': etag
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
          });
        });
      });
      
      req.on('error', reject);
      req.end();
    });
    
    if (secondResponse.statusCode === 304) {
      console.log('✅ ETag caching working: Got 304 Not Modified');
      return true;
    } else {
      console.log(`❌ Expected 304, got ${secondResponse.statusCode}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Caching test failed: ${error.message}`);
    return false;
  }
}

// 性能测试
async function performanceTest(url, iterations = 5) {
  console.log(`\n⚡ Performance test (${iterations} requests)...`);
  
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now();
    
    try {
      await makeRequest(`${BASE_URL}${url}`);
      const endTime = Date.now();
      times.push(endTime - startTime);
      console.log(`Request ${i + 1}: ${endTime - startTime}ms`);
    } catch (error) {
      console.log(`❌ Request ${i + 1} failed: ${error.message}`);
    }
  }
  
  if (times.length > 0) {
    const average = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    console.log(`\n📊 Performance Results:`);
    console.log(`   Average: ${average.toFixed(2)}ms`);
    console.log(`   Min: ${min}ms`);
    console.log(`   Max: ${max}ms`);
  }
}

// 下载测试图片
async function downloadTestImage(url, filename) {
  try {
    const response = await makeRequest(`${BASE_URL}${url}`);
    
    if (response.statusCode === 200 && response.headers['content-type'] === 'image/png') {
      const outputDir = path.join(__dirname, '../test-outputs');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, response.data, 'binary');
      console.log(`💾 Downloaded test image: ${filepath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.log(`❌ Download failed: ${error.message}`);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('🚀 Starting OG Image Generation Tests');
  console.log(`📍 Testing URL: ${BASE_URL}`);
  console.log('=' .repeat(50));
  
  let passedTests = 0;
  let totalTests = TEST_CASES.length;
  
  // 运行基本测试
  for (const testCase of TEST_CASES) {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`   URL: ${testCase.url}`);
    
    try {
      const response = await makeRequest(`${BASE_URL}${testCase.url}`);
      
      // 检查状态码
      if (response.statusCode === testCase.expected.statusCode) {
        console.log(`✅ Status: ${response.statusCode}`);
        
        // 检查 Content-Type (如果期望是图片)
        if (testCase.expected.contentType) {
          const actualContentType = response.headers['content-type'];
          if (actualContentType === testCase.expected.contentType) {
            console.log(`✅ Content-Type: ${actualContentType}`);
            passedTests++;
          } else {
            console.log(`❌ Content-Type: expected ${testCase.expected.contentType}, got ${actualContentType}`);
          }
        } else {
          passedTests++;
        }
        
        // 检查缓存头
        if (response.headers['cache-control']) {
          console.log(`✅ Cache-Control: ${response.headers['cache-control']}`);
        }
        
        if (response.headers.etag) {
          console.log(`✅ ETag: ${response.headers.etag}`);
        }
        
      } else {
        console.log(`❌ Status: expected ${testCase.expected.statusCode}, got ${response.statusCode}`);
      }
      
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
  }
  
  // 缓存测试
  const cacheWorking = await testCaching('/api/og');
  if (cacheWorking) passedTests++;
  totalTests++;
  
  // 性能测试
  await performanceTest('/api/og');
  
  // 下载示例图片
  console.log('\n📸 Downloading test images...');
  await downloadTestImage('/api/og?lang=en', 'og-test-en.png');
  await downloadTestImage('/api/og?lang=zh', 'og-test-zh.png');
  await downloadTestImage('/api/og?releaseDate=2024-01-01', 'og-test-released.png');
  
  // 最终结果
  console.log('\n' + '=' .repeat(50));
  console.log(`📊 Test Results: ${passedTests}/${totalTests} passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed');
    process.exit(1);
  }
}

// 命令行参数处理
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node test-og-generation.js [options]

Options:
  --url <url>     Base URL for testing (default: http://localhost:3000)
  --help, -h      Show this help message

Environment Variables:
  TEST_URL        Base URL for testing (alternative to --url)

Examples:
  node test-og-generation.js
  node test-og-generation.js --url http://localhost:3000
  TEST_URL=https://your-domain.com node test-og-generation.js
    `);
    process.exit(0);
  }
  
  const urlIndex = args.indexOf('--url');
  if (urlIndex !== -1 && args[urlIndex + 1]) {
    process.env.TEST_URL = args[urlIndex + 1];
  }
  
  runTests().catch(console.error);
}