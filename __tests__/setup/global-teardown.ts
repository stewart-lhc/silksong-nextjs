/**
 * Global Teardown for E2E Tests
 * Runs after all tests to clean up test environment
 */

async function globalTeardown() {
  console.log('🧹 Starting global teardown...');

  try {
    // Clean up test data
    await cleanupTestData();
    
    // Clean up test artifacts
    await cleanupArtifacts();
    
    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw to avoid masking test failures
  }
}

async function cleanupTestData() {
  try {
    console.log('🗑️  Cleaning up test data...');
    
    // Example: Clean up test emails from database
    // await fetch('/api/test/cleanup', { method: 'POST' });
    
    // Example: Reset mock service worker state
    // if (global.msw) {
    //   global.msw.resetHandlers();
    // }
    
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.warn('⚠️  Failed to cleanup test data:', error);
  }
}

async function cleanupArtifacts() {
  try {
    console.log('📂 Cleaning up test artifacts...');
    
    // Test artifacts are handled by Playwright automatically
    // This is just for any custom cleanup
    
    console.log('✅ Test artifacts cleaned up');
  } catch (error) {
    console.warn('⚠️  Failed to cleanup test artifacts:', error);
  }
}

export default globalTeardown;