/**
 * Complete Newsletter Kit Database Example
 * 
 * Demonstrates all major features and best practices
 */

import {
  createSupabaseClient,
  createPostgreSQLClient,
  createMySQLClient,
  createSQLiteClient,
  NewsletterBackupSystem,
  DatabaseMonitor,
  DataValidator,
  AnalyticsHelper,
  MaintenanceManager
} from '../index';

// Example: Multi-database setup
async function databaseSetupExample() {
  console.log('=== Database Setup Example ===');

  // Supabase setup (production)
  const supabaseClient = createSupabaseClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  // PostgreSQL setup (self-hosted)
  const postgresClient = createPostgreSQLClient(
    process.env.DATABASE_URL!
  );

  // SQLite setup (development/testing)
  const sqliteClient = createSQLiteClient('./newsletter-dev.db');

  // Connect with auto-migration
  await supabaseClient.connect(true);
  console.log('✅ Supabase connected and migrated');

  // Health check
  const isHealthy = await supabaseClient.healthCheck();
  console.log(`Health status: ${isHealthy ? 'Healthy' : 'Unhealthy'}`);

  return supabaseClient;
}

// Example: Subscription lifecycle management
async function subscriptionLifecycleExample(client: any) {
  console.log('\n=== Subscription Lifecycle Example ===');

  // 1. Create subscription
  const subscriptionData = {
    email: 'user@example.com',
    status: 'pending' as const,
    source: 'web',
    tags: ['updates', 'releases'],
    metadata: {
      referrer: 'https://example.com/signup',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'newsletter_signup',
      browser: 'Chrome',
      country: 'US'
    },
    subscribedAt: new Date(),
    confirmationToken: generateToken(),
    unsubscribeToken: generateToken(),
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  };

  // Validate before creating
  const validation = DataValidator.validateSubscription(subscriptionData);
  if (!validation.valid) {
    console.error('Validation errors:', validation.errors);
    return;
  }

  const subscription = await client.createSubscription(subscriptionData);
  console.log(`✅ Created subscription: ${subscription.id}`);

  // 2. Confirm subscription
  const confirmedSubscription = await client.updateSubscription(subscription.id, {
    status: 'active',
    confirmedAt: new Date()
  });
  console.log(`✅ Confirmed subscription: ${confirmedSubscription.email}`);

  // 3. Add tags
  await client.createTag({
    name: 'premium',
    description: 'Premium subscribers',
    color: '#FFD700',
    isSystem: false
  });

  // Update subscription with new tag
  await client.updateSubscription(subscription.id, {
    tags: [...confirmedSubscription.tags, 'premium']
  });
  console.log('✅ Added premium tag');

  // 4. Create unsubscribe token for secure unsubscribe
  const unsubscribeToken = await client.createUnsubscribeToken({
    subscriptionId: subscription.id,
    token: generateToken(),
    email: subscription.email,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    metadata: { reason: 'user_request' }
  });
  console.log(`✅ Created unsubscribe token: ${unsubscribeToken.token}`);

  return { subscription, unsubscribeToken };
}

// Example: Analytics and reporting
async function analyticsExample(client: any) {
  console.log('\n=== Analytics Example ===');

  // Get current statistics
  const stats = await client.getSubscriptionStats();
  console.log('📊 Current Stats:');
  console.log(`  Total: ${stats.total}`);
  console.log(`  Active: ${stats.active}`);
  console.log(`  Pending: ${stats.pending}`);
  console.log(`  Growth Today: ${stats.growthToday}`);
  console.log(`  Growth Week: ${stats.growthWeek}`);
  console.log(`  Growth Month: ${stats.growthMonth}`);

  // Get growth statistics for last 30 days
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const growthStats = await client.getGrowthStats(startDate, endDate);
  console.log('\n📈 Growth Stats (Last 30 days):');
  console.log(`  Subscriptions: ${growthStats.subscriptions}`);
  console.log(`  Unsubscriptions: ${growthStats.unsubscriptions}`);
  console.log(`  Net Growth: ${growthStats.netGrowth}`);
  console.log(`  Growth Rate: ${growthStats.growthRate.toFixed(2)}%`);

  // Get analytics data
  const analytics = await client.getAnalytics({
    startDate,
    endDate,
    groupBy: 'date',
    interval: 'day'
  });

  console.log(`\n📋 Analytics Entries: ${analytics.length}`);
  
  // Get popular tags
  const popularTags = await client.getPopularTags(5);
  console.log('\n🏷️ Popular Tags:');
  popularTags.forEach(tag => {
    console.log(`  ${tag.tag}: ${tag.count} (${tag.percentage}%)`);
  });

  // Advanced analytics with helper
  const analyticsHelper = new AnalyticsHelper(client.getAdapter());
  const trends = await analyticsHelper.getSubscriptionTrends(30);
  console.log(`\n📊 Trend Analysis:`);
  console.log(`  Direction: ${trends.trend}`);
  console.log(`  Total Growth: ${trends.growth}`);

  const conversionFunnel = await analyticsHelper.getConversionFunnel();
  console.log(`\n🔄 Conversion Funnel:`);
  console.log(`  Subscribed: ${conversionFunnel.subscribed}`);
  console.log(`  Confirmed: ${conversionFunnel.confirmed}`);
  console.log(`  Active: ${conversionFunnel.active}`);
  console.log(`  Conversion Rate: ${conversionFunnel.conversionRate.toFixed(2)}%`);
}

// Example: Bounce handling
async function bounceHandlingExample(client: any) {
  console.log('\n=== Bounce Handling Example ===');

  // Simulate email bounce
  const bounce = await client.createBounce({
    email: 'bounced@example.com',
    bounceType: 'hard',
    bounceReason: 'Invalid recipient address',
    bouncedAt: new Date(),
    providerResponse: {
      code: 550,
      message: 'Requested action not taken: mailbox unavailable'
    },
    resolved: false
  });

  console.log(`⚠️ Created bounce record: ${bounce.id}`);

  // Update subscription status based on bounce
  const subscription = await client.getSubscriptionByEmail('bounced@example.com');
  if (subscription) {
    await client.updateSubscription(subscription.id, {
      status: 'bounced'
    });
    console.log('✅ Updated subscription status to bounced');
  }

  // Get bounce history
  const bounces = await client.getBounces('bounced@example.com');
  console.log(`📧 Found ${bounces.length} bounce records`);

  // Resolve bounce after manual investigation
  await client.resolveBounce(bounce.id);
  console.log('✅ Bounce resolved');
}

// Example: Audit logging
async function auditExample(client: any) {
  console.log('\n=== Audit Logging Example ===');

  // Manual audit log (automatic logging happens in adapters)
  await client.createAuditLog({
    subscriptionId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'user@example.com',
    action: 'export',
    metadata: {
      exportType: 'csv',
      recordCount: 1000,
      requestedBy: 'admin@example.com'
    },
    ipAddress: '192.168.1.100',
    userAgent: 'AdminTool/1.0'
  });

  // Get audit logs with filtering
  const auditLogs = await client.getAuditLogs({
    page: 1,
    limit: 10,
    sortBy: 'timestamp',
    sortOrder: 'desc',
    filters: { action: 'export' }
  });

  console.log(`📝 Found ${auditLogs.total} audit log entries`);
  auditLogs.data.forEach(log => {
    console.log(`  ${log.timestamp.toISOString()}: ${log.action} - ${log.email}`);
  });
}

// Example: Bulk operations
async function bulkOperationsExample(client: any) {
  console.log('\n=== Bulk Operations Example ===');

  // Create multiple subscriptions
  const bulkSubscriptions = [
    {
      email: 'bulk1@example.com',
      status: 'active' as const,
      source: 'import',
      tags: ['updates'],
      metadata: { batch: 'import_2024' },
      subscribedAt: new Date(),
      unsubscribeToken: generateToken()
    },
    {
      email: 'bulk2@example.com',
      status: 'active' as const,
      source: 'import',
      tags: ['updates', 'news'],
      metadata: { batch: 'import_2024' },
      subscribedAt: new Date(),
      unsubscribeToken: generateToken()
    }
  ];

  const createdSubscriptions = [];
  for (const sub of bulkSubscriptions) {
    const created = await client.createSubscription(sub);
    createdSubscriptions.push(created);
  }

  console.log(`✅ Created ${createdSubscriptions.length} subscriptions`);

  // Bulk update
  const bulkUpdates = createdSubscriptions.map(sub => ({
    id: sub.id,
    data: { tags: [...sub.tags, 'bulk_processed'] }
  }));

  const updatedCount = await client.bulkUpdateSubscriptions(bulkUpdates);
  console.log(`✅ Updated ${updatedCount} subscriptions`);

  // Export filtered data
  const exportData = await client.exportSubscriptions({
    filters: { source: 'import' },
    format: 'json',
    fields: ['email', 'status', 'tags', 'subscribedAt']
  });

  console.log(`📤 Exported ${exportData.length} subscriptions`);
}

// Example: Backup and monitoring
async function operationsExample(client: any) {
  console.log('\n=== Operations Example ===');

  // Database backup
  const backupSystem = new NewsletterBackupSystem(
    { type: 'supabase', supabaseUrl: process.env.SUPABASE_URL!, supabaseKey: process.env.SUPABASE_SERVICE_KEY! },
    {
      outputDir: './backups',
      format: 'json',
      compress: true,
      retention: 30
    }
  );

  const backupPath = await backupSystem.createBackup();
  console.log(`💾 Backup created: ${backupPath}`);

  // List available backups
  const backups = await backupSystem.listBackups();
  console.log(`📂 Available backups: ${backups.length}`);

  // Database monitoring
  const monitor = new DatabaseMonitor(
    { type: 'supabase', supabaseUrl: process.env.SUPABASE_URL!, supabaseKey: process.env.SUPABASE_SERVICE_KEY! },
    {
      interval: 60,
      thresholds: {
        maxResponseTime: 5000,
        minActiveConnections: 1,
        maxErrorRate: 5,
        minGrowthRate: 0
      }
    }
  );

  const status = await monitor.getStatus();
  console.log(`🔍 Database Status: ${status.status}`);
  if (status.issues.length > 0) {
    console.log('  Issues:', status.issues);
  }

  const report = await monitor.generateReport();
  console.log('📊 Monitoring Report:');
  console.log(`  Status: ${report.summary.status}`);
  console.log(`  Total Subscriptions: ${report.summary.totalSubscriptions}`);
  console.log(`  Growth Today: ${report.summary.growthToday}`);
  if (report.recommendations.length > 0) {
    console.log('  Recommendations:', report.recommendations);
  }

  // Database maintenance
  const maintenanceManager = new MaintenanceManager(client.getAdapter());
  const cleanupResults = await maintenanceManager.cleanup({
    cleanExpiredTokens: true,
    cleanAuditLogs: true,
    auditLogRetentionDays: 90
  });

  console.log('🧹 Cleanup Results:');
  console.log(`  Expired tokens: ${cleanupResults.expiredTokens}`);
  console.log(`  Old audit logs: ${cleanupResults.oldAuditLogs}`);
}

// Example: Advanced querying
async function advancedQueryExample(client: any) {
  console.log('\n=== Advanced Querying Example ===');

  // Complex filtering
  const activeSubscriptions = await client.getSubscriptions({
    page: 1,
    limit: 50,
    sortBy: 'created_at',
    sortOrder: 'desc',
    filters: {
      status: 'active',
      source: 'web'
    },
    search: '@gmail.com'
  });

  console.log(`🔍 Found ${activeSubscriptions.total} Gmail subscribers from web`);

  // Date range analytics
  const weeklyAnalytics = await client.getAnalytics({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    groupBy: 'source',
    interval: 'day'
  });

  console.log('📈 Weekly Analytics by Source:');
  weeklyAnalytics.forEach(entry => {
    console.log(`  ${entry.source}: ${entry.subscriptionsCount} subscriptions, ${entry.unsubscriptionsCount} unsubscriptions`);
  });

  // Tag-based segmentation
  const premiumSubscribers = await client.getSubscriptions({
    filters: { status: 'active' },
    limit: 1000
  });

  const premiumCount = premiumSubscribers.data.filter(sub => 
    sub.tags.includes('premium')
  ).length;

  console.log(`💎 Premium subscribers: ${premiumCount}/${premiumSubscribers.total}`);
}

// Helper function to generate tokens
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Main example runner
async function main() {
  try {
    console.log('🚀 Starting Newsletter Kit Database Examples\n');

    // Setup
    const client = await databaseSetupExample();

    // Run all examples
    await subscriptionLifecycleExample(client);
    await analyticsExample(client);
    await bounceHandlingExample(client);
    await auditExample(client);
    await bulkOperationsExample(client);
    await advancedQueryExample(client);
    await operationsExample(client);

    // Cleanup
    await client.cleanup();
    await client.disconnect();

    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Example failed:', error);
    process.exit(1);
  }
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Run examples if this file is executed directly
if (require.main === module) {
  main();
}

export {
  databaseSetupExample,
  subscriptionLifecycleExample,
  analyticsExample,
  bounceHandlingExample,
  auditExample,
  bulkOperationsExample,
  operationsExample,
  advancedQueryExample
};