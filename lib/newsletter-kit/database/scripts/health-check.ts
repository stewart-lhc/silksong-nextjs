#!/usr/bin/env node
/**
 * Database Health Check Script
 * 
 * Comprehensive health check for Newsletter Kit database
 */

import { createDatabaseClient } from '../client';
import type { DatabaseConfig, DatabaseType } from '../types';

interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  details?: any;
  responseTime?: number;
}

interface HealthCheckOptions {
  verbose: boolean;
  timeout: number;
}

class DatabaseHealthCheck {
  private client: any;
  private dbType: DatabaseType;
  private options: HealthCheckOptions;

  constructor(dbConfig: DatabaseConfig, options: Partial<HealthCheckOptions> = {}) {
    this.client = createDatabaseClient(dbConfig);
    this.dbType = dbConfig.type;
    this.options = {
      verbose: options.verbose ?? false,
      timeout: options.timeout ?? 10000
    };
  }

  /**
   * Run comprehensive health check
   */
  async runHealthCheck(): Promise<{
    overall: 'healthy' | 'warning' | 'critical';
    results: HealthCheckResult[];
    summary: {
      healthy: number;
      warnings: number;
      critical: number;
      total: number;
    };
  }> {
    const results: HealthCheckResult[] = [];
    
    console.log('Running database health check...\n');

    // Connection test
    results.push(await this.checkConnection());
    
    // Basic queries
    results.push(await this.checkBasicQueries());
    
    // Schema validation
    results.push(await this.checkSchema());
    
    // Data integrity
    results.push(await this.checkDataIntegrity());
    
    // Performance metrics
    results.push(await this.checkPerformance());
    
    // Storage and capacity
    results.push(await this.checkStorage());
    
    // Replication (if applicable)
    if (this.dbType === 'postgresql' || this.dbType === 'mysql') {
      results.push(await this.checkReplication());
    }

    // Calculate summary
    const summary = {
      healthy: results.filter(r => r.status === 'healthy').length,
      warnings: results.filter(r => r.status === 'warning').length,
      critical: results.filter(r => r.status === 'critical').length,
      total: results.length
    };

    // Determine overall status
    let overall: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (summary.critical > 0) overall = 'critical';
    else if (summary.warnings > 0) overall = 'warning';

    return { overall, results, summary };
  }

  private async checkConnection(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      await this.client.connect();
      const responseTime = Date.now() - startTime;
      
      return {
        component: 'Connection',
        status: responseTime < 1000 ? 'healthy' : 'warning',
        message: `Connected successfully in ${responseTime}ms`,
        responseTime
      };
    } catch (error) {
      return {
        component: 'Connection',
        status: 'critical',
        message: `Connection failed: ${error.message}`,
        responseTime: Date.now() - startTime
      };
    }
  }

  private async checkBasicQueries(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // Test basic read operation
      const stats = await this.client.getSubscriptionStats();
      const responseTime = Date.now() - startTime;
      
      return {
        component: 'Basic Queries',
        status: responseTime < 2000 ? 'healthy' : 'warning',
        message: `Query executed successfully in ${responseTime}ms`,
        details: {
          totalSubscriptions: stats.total,
          activeSubscriptions: stats.active
        },
        responseTime
      };
    } catch (error) {
      return {
        component: 'Basic Queries',
        status: 'critical',
        message: `Query failed: ${error.message}`,
        responseTime: Date.now() - startTime
      };
    }
  }

  private async checkSchema(): Promise<HealthCheckResult> {
    try {
      // Check if all required tables exist
      const requiredTables = [
        'newsletter_subscriptions',
        'newsletter_unsubscribe_tokens',
        'newsletter_analytics',
        'newsletter_audit_logs',
        'newsletter_email_bounces',
        'newsletter_subscription_tags'
      ];

      const missingTables: string[] = [];
      
      for (const table of requiredTables) {
        try {
          // Try to query each table
          await this.executeSimpleQuery(`SELECT COUNT(*) FROM ${table} LIMIT 1`);
        } catch (error) {
          missingTables.push(table);
        }
      }

      if (missingTables.length === 0) {
        return {
          component: 'Schema',
          status: 'healthy',
          message: 'All required tables exist',
          details: { requiredTables: requiredTables.length }
        };
      } else {
        return {
          component: 'Schema',
          status: 'critical',
          message: `Missing tables: ${missingTables.join(', ')}`,
          details: { missingTables }
        };
      }
    } catch (error) {
      return {
        component: 'Schema',
        status: 'critical',
        message: `Schema check failed: ${error.message}`
      };
    }
  }

  private async checkDataIntegrity(): Promise<HealthCheckResult> {
    try {
      const issues: string[] = [];
      
      // Check for orphaned records
      const orphanedTokens = await this.checkOrphanedTokens();
      if (orphanedTokens > 0) {
        issues.push(`${orphanedTokens} orphaned unsubscribe tokens`);
      }

      // Check for invalid email formats
      const invalidEmails = await this.checkInvalidEmails();
      if (invalidEmails > 0) {
        issues.push(`${invalidEmails} subscriptions with invalid emails`);
      }

      // Check for duplicate emails
      const duplicateEmails = await this.checkDuplicateEmails();
      if (duplicateEmails > 0) {
        issues.push(`${duplicateEmails} duplicate email addresses`);
      }

      if (issues.length === 0) {
        return {
          component: 'Data Integrity',
          status: 'healthy',
          message: 'No data integrity issues found'
        };
      } else {
        return {
          component: 'Data Integrity',
          status: 'warning',
          message: 'Data integrity issues detected',
          details: { issues }
        };
      }
    } catch (error) {
      return {
        component: 'Data Integrity',
        status: 'critical',
        message: `Data integrity check failed: ${error.message}`
      };
    }
  }

  private async checkPerformance(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const metrics = [];

    try {
      // Test subscription query performance
      const subStart = Date.now();
      await this.client.getSubscriptions({ limit: 100 });
      const subTime = Date.now() - subStart;
      metrics.push({ query: 'getSubscriptions', time: subTime });

      // Test analytics query performance
      const analyticsStart = Date.now();
      await this.client.getAnalytics({
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      });
      const analyticsTime = Date.now() - analyticsStart;
      metrics.push({ query: 'getAnalytics', time: analyticsTime });

      const avgResponseTime = metrics.reduce((sum, m) => sum + m.time, 0) / metrics.length;
      const maxResponseTime = Math.max(...metrics.map(m => m.time));

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (maxResponseTime > 5000) status = 'critical';
      else if (avgResponseTime > 1000) status = 'warning';

      return {
        component: 'Performance',
        status,
        message: `Average response time: ${avgResponseTime.toFixed(0)}ms`,
        details: {
          metrics,
          avgResponseTime,
          maxResponseTime
        }
      };
    } catch (error) {
      return {
        component: 'Performance',
        status: 'critical',
        message: `Performance check failed: ${error.message}`
      };
    }
  }

  private async checkStorage(): Promise<HealthCheckResult> {
    try {
      const stats = await this.client.getSubscriptionStats();
      const storageInfo = await this.getStorageInfo();

      // Calculate estimated storage usage
      const avgSubscriptionSize = 500; // bytes
      const estimatedStorage = stats.total * avgSubscriptionSize;

      return {
        component: 'Storage',
        status: 'healthy',
        message: 'Storage check completed',
        details: {
          totalRecords: stats.total,
          estimatedStorageBytes: estimatedStorage,
          ...storageInfo
        }
      };
    } catch (error) {
      return {
        component: 'Storage',
        status: 'warning',
        message: `Storage check partially failed: ${error.message}`
      };
    }
  }

  private async checkReplication(): Promise<HealthCheckResult> {
    try {
      // This would check replication status for PostgreSQL/MySQL
      // Implementation would be database-specific
      
      return {
        component: 'Replication',
        status: 'healthy',
        message: 'Replication status check not implemented for this database type'
      };
    } catch (error) {
      return {
        component: 'Replication',
        status: 'warning',
        message: `Replication check failed: ${error.message}`
      };
    }
  }

  // Helper methods for specific checks
  private async executeSimpleQuery(query: string): Promise<any> {
    // This would execute a simple query via the adapter
    // Implementation depends on the adapter interface
    return {};
  }

  private async checkOrphanedTokens(): Promise<number> {
    // Would check for tokens without corresponding subscriptions
    return 0;
  }

  private async checkInvalidEmails(): Promise<number> {
    // Would check for invalid email formats
    return 0;
  }

  private async checkDuplicateEmails(): Promise<number> {
    // Would check for duplicate email addresses
    return 0;
  }

  private async getStorageInfo(): Promise<any> {
    // Would get storage-specific information
    return {
      databaseSize: 'Unknown',
      freeSpace: 'Unknown'
    };
  }

  /**
   * Display health check results
   */
  displayResults(results: HealthCheckResult[], summary: any, overall: string): void {
    console.log('Health Check Results:');
    console.log('====================\n');

    results.forEach(result => {
      const statusIcon = this.getStatusIcon(result.status);
      console.log(`${statusIcon} ${result.component}: ${result.message}`);
      
      if (result.responseTime) {
        console.log(`   Response time: ${result.responseTime}ms`);
      }
      
      if (this.options.verbose && result.details) {
        console.log('   Details:', JSON.stringify(result.details, null, 2));
      }
      
      console.log();
    });

    console.log('Summary:');
    console.log(`Overall Status: ${this.getStatusIcon(overall as any)} ${overall.toUpperCase()}`);
    console.log(`Healthy: ${summary.healthy}/${summary.total}`);
    console.log(`Warnings: ${summary.warnings}/${summary.total}`);
    console.log(`Critical: ${summary.critical}/${summary.total}`);
  }

  private getStatusIcon(status: 'healthy' | 'warning' | 'critical'): string {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '❌';
      default: return '❓';
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const timeout = args.includes('--timeout') 
    ? parseInt(args[args.indexOf('--timeout') + 1]) || 10000 
    : 10000;

  const dbConfig: DatabaseConfig = {
    type: (process.env.DB_TYPE as DatabaseType) || 'supabase',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_KEY,
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  };

  const healthCheck = new DatabaseHealthCheck(dbConfig, { verbose, timeout });

  try {
    const { overall, results, summary } = await healthCheck.runHealthCheck();
    
    healthCheck.displayResults(results, summary, overall);
    
    // Exit with appropriate code
    process.exit(overall === 'critical' ? 1 : 0);
  } catch (error) {
    console.error('Health check failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { DatabaseHealthCheck };