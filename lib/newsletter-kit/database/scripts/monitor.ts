#!/usr/bin/env node
/**
 * Database Monitoring Script
 * 
 * Real-time monitoring and alerting for Newsletter Kit database
 */

import { createDatabaseClient } from '../client';
import { PerformanceMonitor, ConnectionMonitor, AnalyticsHelper } from '../utils';
import type { DatabaseConfig, SubscriptionStats } from '../types';

interface MonitoringConfig {
  interval: number; // seconds
  alerts: {
    email?: string;
    webhook?: string;
    slack?: string;
  };
  thresholds: {
    maxResponseTime: number; // ms
    minActiveConnections: number;
    maxIdleConnections: number;
    maxErrorRate: number; // percentage
    minGrowthRate: number; // daily
  };
}

interface MetricSnapshot {
  timestamp: Date;
  subscriptionStats: SubscriptionStats;
  performanceStats: any;
  connectionStats: any;
  healthCheck: boolean;
  responseTime: number;
}

class DatabaseMonitor {
  private client: any;
  private config: MonitoringConfig;
  private performanceMonitor: PerformanceMonitor;
  private connectionMonitor: ConnectionMonitor;
  private analyticsHelper: AnalyticsHelper;
  private metrics: MetricSnapshot[] = [];
  private intervalId: NodeJS.Timeout | null = null;

  constructor(dbConfig: DatabaseConfig, monitoringConfig: Partial<MonitoringConfig> = {}) {
    this.client = createDatabaseClient(dbConfig);
    this.performanceMonitor = new PerformanceMonitor();
    this.connectionMonitor = new ConnectionMonitor();
    this.analyticsHelper = new AnalyticsHelper(this.client.getAdapter());

    this.config = {
      interval: monitoringConfig.interval || 60,
      alerts: monitoringConfig.alerts || {},
      thresholds: {
        maxResponseTime: 5000,
        minActiveConnections: 1,
        maxIdleConnections: 10,
        maxErrorRate: 5,
        minGrowthRate: 0,
        ...monitoringConfig.thresholds
      }
    };
  }

  /**
   * Start monitoring
   */
  async start(): Promise<void> {
    console.log('Starting database monitoring...');
    
    await this.client.connect();
    
    // Take initial snapshot
    await this.takeSnapshot();
    
    // Start periodic monitoring
    this.intervalId = setInterval(async () => {
      try {
        await this.takeSnapshot();
        await this.checkAlerts();
      } catch (error) {
        console.error('Monitoring error:', error);
        await this.sendAlert('monitoring_error', { error: error.message });
      }
    }, this.config.interval * 1000);

    console.log(`Monitoring started (interval: ${this.config.interval}s)`);
  }

  /**
   * Stop monitoring
   */
  async stop(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    await this.client.disconnect();
    console.log('Monitoring stopped');
  }

  /**
   * Get current status
   */
  async getStatus(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    metrics: MetricSnapshot;
  }> {
    const metrics = await this.takeSnapshot();
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check response time
    if (metrics.responseTime > this.config.thresholds.maxResponseTime) {
      issues.push(`High response time: ${metrics.responseTime}ms`);
      status = status === 'healthy' ? 'warning' : status;
    }

    // Check health
    if (!metrics.healthCheck) {
      issues.push('Health check failed');
      status = 'critical';
    }

    // Check connections
    const connStats = metrics.connectionStats;
    if (connStats.active < this.config.thresholds.minActiveConnections) {
      issues.push(`Low active connections: ${connStats.active}`);
      status = status === 'healthy' ? 'warning' : status;
    }

    if (connStats.idle > this.config.thresholds.maxIdleConnections) {
      issues.push(`High idle connections: ${connStats.idle}`);
      status = status === 'healthy' ? 'warning' : status;
    }

    return { status, issues, metrics };
  }

  /**
   * Get historical metrics
   */
  getHistoricalMetrics(hours = 24): MetricSnapshot[] {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);
    
    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  /**
   * Generate monitoring report
   */
  async generateReport(): Promise<{
    summary: any;
    trends: any;
    recommendations: string[];
  }> {
    const currentStatus = await this.getStatus();
    const historical = this.getHistoricalMetrics();
    
    // Calculate trends
    const trends = this.calculateTrends(historical);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(currentStatus, trends);

    return {
      summary: {
        status: currentStatus.status,
        issues: currentStatus.issues,
        totalSubscriptions: currentStatus.metrics.subscriptionStats.total,
        activeSubscriptions: currentStatus.metrics.subscriptionStats.active,
        growthToday: currentStatus.metrics.subscriptionStats.growthToday
      },
      trends,
      recommendations
    };
  }

  private async takeSnapshot(): Promise<MetricSnapshot> {
    const startTime = Date.now();
    
    try {
      // Get subscription stats
      const subscriptionStats = await this.client.getSubscriptionStats();
      
      // Get performance stats
      const performanceStats = this.performanceMonitor.getStats();
      
      // Get connection stats
      const connectionStats = this.connectionMonitor.getConnectionStats();
      
      // Health check
      const healthCheck = await this.client.healthCheck();
      
      const responseTime = Date.now() - startTime;

      const snapshot: MetricSnapshot = {
        timestamp: new Date(),
        subscriptionStats,
        performanceStats,
        connectionStats,
        healthCheck,
        responseTime
      };

      // Store snapshot (keep last 1000)
      this.metrics.push(snapshot);
      if (this.metrics.length > 1000) {
        this.metrics.shift();
      }

      return snapshot;
    } catch (error) {
      console.error('Error taking snapshot:', error);
      throw error;
    }
  }

  private async checkAlerts(): Promise<void> {
    const latest = this.metrics[this.metrics.length - 1];
    if (!latest) return;

    // Response time alert
    if (latest.responseTime > this.config.thresholds.maxResponseTime) {
      await this.sendAlert('high_response_time', {
        responseTime: latest.responseTime,
        threshold: this.config.thresholds.maxResponseTime
      });
    }

    // Health check alert
    if (!latest.healthCheck) {
      await this.sendAlert('health_check_failed', {
        timestamp: latest.timestamp
      });
    }

    // Growth rate alert
    const growthRate = this.calculateGrowthRate();
    if (growthRate < this.config.thresholds.minGrowthRate) {
      await this.sendAlert('low_growth_rate', {
        growthRate,
        threshold: this.config.thresholds.minGrowthRate
      });
    }
  }

  private calculateGrowthRate(): number {
    if (this.metrics.length < 2) return 0;
    
    const latest = this.metrics[this.metrics.length - 1];
    const previous = this.metrics[this.metrics.length - 2];
    
    return latest.subscriptionStats.growthToday - previous.subscriptionStats.growthToday;
  }

  private calculateTrends(historical: MetricSnapshot[]): any {
    if (historical.length === 0) return {};

    const responseTimeTrend = this.calculateTrend(
      historical.map(m => m.responseTime)
    );

    const subscriptionTrend = this.calculateTrend(
      historical.map(m => m.subscriptionStats.total)
    );

    return {
      responseTime: responseTimeTrend,
      subscriptions: subscriptionTrend,
      period: {
        start: historical[0]?.timestamp,
        end: historical[historical.length - 1]?.timestamp
      }
    };
  }

  private calculateTrend(values: number[]): {
    direction: 'up' | 'down' | 'stable';
    change: number;
    average: number;
  } {
    if (values.length === 0) {
      return { direction: 'stable', change: 0, average: 0 };
    }

    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;

    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(change) > average * 0.1) { // 10% threshold
      direction = change > 0 ? 'up' : 'down';
    }

    return { direction, change, average };
  }

  private generateRecommendations(status: any, trends: any): string[] {
    const recommendations: string[] = [];

    if (status.status === 'critical') {
      recommendations.push('Immediate attention required - health check failing');
    }

    if (trends.responseTime.direction === 'up') {
      recommendations.push('Response times increasing - consider optimizing queries');
    }

    if (trends.subscriptions.direction === 'down') {
      recommendations.push('Subscription growth declining - review acquisition strategies');
    }

    if (status.metrics.connectionStats.idle > 5) {
      recommendations.push('High number of idle connections - consider connection pooling optimization');
    }

    return recommendations;
  }

  private async sendAlert(type: string, data: any): Promise<void> {
    const alert = {
      type,
      timestamp: new Date(),
      data,
      severity: this.getAlertSeverity(type)
    };

    console.log(`ALERT [${alert.severity}]: ${type}`, data);

    // Send to configured alert channels
    if (this.config.alerts.webhook) {
      await this.sendWebhookAlert(alert);
    }

    if (this.config.alerts.email) {
      await this.sendEmailAlert(alert);
    }

    if (this.config.alerts.slack) {
      await this.sendSlackAlert(alert);
    }
  }

  private getAlertSeverity(type: string): 'info' | 'warning' | 'critical' {
    const criticalAlerts = ['health_check_failed', 'database_down'];
    const warningAlerts = ['high_response_time', 'low_growth_rate'];
    
    if (criticalAlerts.includes(type)) return 'critical';
    if (warningAlerts.includes(type)) return 'warning';
    return 'info';
  }

  private async sendWebhookAlert(alert: any): Promise<void> {
    try {
      // Implementation would send HTTP POST to webhook URL
      console.log('Webhook alert sent:', alert);
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  private async sendEmailAlert(alert: any): Promise<void> {
    try {
      // Implementation would send email
      console.log('Email alert sent:', alert);
    } catch (error) {
      console.error('Failed to send email alert:', error);
    }
  }

  private async sendSlackAlert(alert: any): Promise<void> {
    try {
      // Implementation would send Slack message
      console.log('Slack alert sent:', alert);
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const dbConfig: DatabaseConfig = {
    type: 'supabase',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_SERVICE_KEY || ''
  };

  const monitor = new DatabaseMonitor(dbConfig);

  switch (command) {
    case 'start':
      await monitor.start();
      
      // Keep process alive
      process.on('SIGINT', async () => {
        console.log('Shutting down monitor...');
        await monitor.stop();
        process.exit(0);
      });
      
      // Keep running
      await new Promise(() => {});
      break;

    case 'status':
      const status = await monitor.getStatus();
      console.log(JSON.stringify(status, null, 2));
      process.exit(0);

    case 'report':
      const report = await monitor.generateReport();
      console.log(JSON.stringify(report, null, 2));
      process.exit(0);

    default:
      console.log('Usage: npm run monitor [start|status|report]');
      console.log('');
      console.log('Commands:');
      console.log('  start   Start continuous monitoring');
      console.log('  status  Get current status');
      console.log('  report  Generate monitoring report');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { DatabaseMonitor };