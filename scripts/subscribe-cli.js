#!/usr/bin/env node

/**
 * Command-line utility for testing email subscription
 * Usage: node subscribe-cli.js <email>
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3004';
const SUBSCRIPTION_ENDPOINT = `${API_BASE_URL}/api/subscribe`;

async function subscribeEmail(email) {
  console.log(`📧 Subscribing email: ${email}`);
  console.log(`🔗 Endpoint: ${SUBSCRIPTION_ENDPOINT}\n`);

  try {
    const response = await fetch(SUBSCRIPTION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Response Headers:`);
    console.log(`   - Content-Type: ${response.headers.get('content-type')}`);
    if (response.headers.get('x-ratelimit-limit')) {
      console.log(`   - Rate Limit: ${response.headers.get('x-ratelimit-remaining')}/${response.headers.get('x-ratelimit-limit')}`);
      console.log(`   - Rate Reset: ${new Date(parseInt(response.headers.get('x-ratelimit-reset')) * 1000).toISOString()}`);
    }
    
    console.log(`\n📄 Response Body:`);
    console.log(JSON.stringify(data, null, 2));

    if (response.status === 201) {
      console.log('\n✅ SUCCESS: Email subscription successful!');
      if (data.subscription) {
        console.log(`   ID: ${data.subscription.id}`);
        console.log(`   Email: ${data.subscription.email}`);
        console.log(`   Subscribed At: ${data.subscription.subscribed_at}`);
      }
    } else {
      console.log(`\n❌ FAILED: ${data.error || 'Unknown error'}`);
      if (data.code) {
        console.log(`   Error Code: ${data.code}`);
      }
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Parse command line arguments
const email = process.argv[2];

if (!email) {
  console.log('📧 Email Subscription CLI Tool');
  console.log('==============================');
  console.log('');
  console.log('Usage: node subscribe-cli.js <email>');
  console.log('');
  console.log('Examples:');
  console.log('  node subscribe-cli.js user@example.com');
  console.log('  node subscribe-cli.js test@gmail.com');
  console.log('');
  console.log('Environment Variables:');
  console.log(`  API_BASE_URL=${API_BASE_URL} (current)`);
  process.exit(1);
}

// Check if fetch is available
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ for fetch support');
  process.exit(1);
}

subscribeEmail(email);