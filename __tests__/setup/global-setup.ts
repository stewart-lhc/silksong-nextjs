/**
 * Global Setup for E2E Tests
 * Runs before all tests to prepare test environment
 */

import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for email subscription tests...');

  // Get the base URL from config
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';

  // Launch a browser to warm up the application
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('🔥 Warming up the application...');
    
    // Navigate to the main page to ensure it's ready
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    
    // Wait for the email subscription form to be ready
    await page.waitForSelector('input[type="email"]', { timeout: 30000 });
    
    console.log('✅ Application is ready for testing');
    
    // Optional: Seed test data or prepare mock services
    await seedTestData(page);
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('✨ Global setup completed successfully');
}

async function seedTestData(page: any) {
  try {
    // Reset subscription data if needed
    console.log('🌱 Seeding test data...');
    
    // You could make API calls here to reset test database
    // Or set up mock service worker
    
    // Example: Reset subscriber count to a known value
    // await page.evaluate(() => {
    //   localStorage.setItem('test-subscriber-count', '1337');
    // });
    
    console.log('✅ Test data seeded');
  } catch (error) {
    console.warn('⚠️  Failed to seed test data:', error);
    // Don't fail the entire setup for optional seeding
  }
}

export default globalSetup;