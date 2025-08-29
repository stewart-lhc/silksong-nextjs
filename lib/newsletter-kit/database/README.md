# Newsletter Kit Database

Complete database solution for newsletter subscription management with support for multiple database backends, comprehensive analytics, and operational excellence features.

## Features

### Core Functionality
- **Multi-Database Support**: Supabase, PostgreSQL, MySQL, SQLite
- **Subscription Management**: Full CRUD operations with status tracking
- **Email Verification**: Confirmation tokens and secure unsubscribe links
- **Analytics & Reporting**: Growth metrics, conversion funnels, trend analysis
- **Audit Logging**: Complete activity tracking for compliance
- **Bounce Management**: Email delivery failure tracking and resolution
- **Tag System**: Subscription categorization and segmentation

### Operational Excellence
- **Automated Backups**: Scheduled backups with retention policies
- **Real-time Monitoring**: Performance metrics and alerting
- **Health Checks**: Comprehensive database health validation
- **Migration System**: Version-controlled schema evolution
- **Connection Pooling**: Optimized database connections
- **Row Level Security**: Fine-grained access control (Supabase/PostgreSQL)

## Quick Start

### Installation

```bash
npm install @newsletter-kit/database
# or
yarn add @newsletter-kit/database
```

### Basic Usage

```typescript
import { createSupabaseClient } from '@newsletter-kit/database';

// Initialize client
const client = createSupabaseClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Connect and auto-migrate
await client.connect(true);

// Create subscription
const subscription = await client.createSubscription({
  email: 'user@example.com',
  status: 'active',
  source: 'web',
  tags: ['updates', 'releases'],
  metadata: { referrer: 'homepage' },
  subscribedAt: new Date(),
  unsubscribeToken: generateToken()
});

// Get analytics
const stats = await client.getSubscriptionStats();
console.log(`Total subscriptions: ${stats.total}`);
console.log(`Growth today: ${stats.growthToday}`);
```

## Database Schema

### Core Tables

#### newsletter_subscriptions
- **id**: Primary key (UUID)
- **email**: Subscriber email (unique)
- **status**: Subscription status (pending, active, unsubscribed, bounced, blocked)
- **source**: Subscription source (web, mobile_app, landing_page, etc.)
- **tags**: Array of tags for categorization
- **metadata**: JSON metadata (UTM parameters, custom fields)
- **subscribed_at**: Subscription timestamp
- **confirmed_at**: Email confirmation timestamp
- **unsubscribed_at**: Unsubscription timestamp
- **confirmation_token**: Email verification token
- **unsubscribe_token**: Secure unsubscribe token
- **ip_address**: Subscriber IP address
- **user_agent**: Browser/client information
- **referrer**: Page referrer
- **utm_source/medium/campaign/content/term**: UTM tracking parameters
- **created_at/updated_at**: Record timestamps

#### newsletter_unsubscribe_tokens
- **id**: Primary key (UUID)
- **subscription_id**: Foreign key to subscriptions
- **token**: Unique unsubscribe token
- **email**: Subscriber email
- **expires_at**: Token expiration timestamp
- **used_at**: Token usage timestamp
- **metadata**: Additional token data

#### newsletter_analytics
- **id**: Primary key (UUID)
- **date**: Analytics date
- **source**: Traffic source
- **tag**: Subscription tag
- **subscriptions_count**: New subscriptions
- **unsubscriptions_count**: Unsubscriptions
- **confirmations_count**: Email confirmations
- **bounces_count**: Email bounces
- **net_growth**: Computed growth metric

#### newsletter_audit_logs
- **id**: Primary key (UUID)
- **subscription_id**: Related subscription
- **email**: Subscriber email
- **action**: Action type (subscribe, confirm, unsubscribe, etc.)
- **previous_status**: Status before action
- **new_status**: Status after action
- **metadata**: Action details
- **ip_address**: Action IP
- **user_agent**: Action client
- **timestamp**: Action timestamp

#### newsletter_email_bounces
- **id**: Primary key (UUID)
- **email**: Bounced email address
- **bounce_type**: Bounce category (hard, soft, complaint, suppression)
- **bounce_reason**: Detailed bounce reason
- **bounced_at**: Bounce timestamp
- **provider_response**: Email provider response
- **resolved**: Resolution status
- **resolved_at**: Resolution timestamp

#### newsletter_subscription_tags
- **id**: Primary key (UUID)
- **name**: Tag name (unique)
- **description**: Tag description
- **color**: Display color (hex)
- **is_system**: System tag flag
- **subscription_count**: Usage count
- **created_at/updated_at**: Record timestamps

## Database Adapters

### Supabase Adapter
```typescript
import { createSupabaseClient } from '@newsletter-kit/database';

const client = createSupabaseClient(supabaseUrl, supabaseKey);
```

**Features:**
- Real-time subscriptions
- Row Level Security policies
- Built-in authentication integration
- Edge functions support
- Automatic backups

### PostgreSQL Adapter
```typescript
import { createPostgreSQLClient } from '@newsletter-kit/database';

const client = createPostgreSQLClient(connectionString);
```

**Features:**
- Native PostgreSQL performance
- Advanced indexing
- Stored procedures and functions
- Full-text search capabilities
- Master-slave replication support

### MySQL Adapter
```typescript
import { createMySQLClient } from '@newsletter-kit/database';

const client = createMySQLClient(connectionString);
```

**Features:**
- InnoDB engine optimization
- JSON data type support
- Stored procedures
- Master-slave replication
- Performance schema monitoring

### SQLite Adapter
```typescript
import { createSQLiteClient } from '@newsletter-kit/database';

const client = createSQLiteClient('./newsletter.db');
```

**Features:**
- Zero-configuration setup
- File-based database
- ACID compliance
- Compact size
- Perfect for development/testing

## Operations & Management

### Database Migrations

```bash
# Run all pending migrations
npm run db:migrate

# Check migration status
npm run db:status

# Rollback last migration
npm run db:rollback

# Reset database (drop + create)
npm run db:reset --force

# Seed with sample data
npm run db:seed
```

### Backup Management

```bash
# Create backup
npm run db:backup

# List available backups
npm run db:backup list

# Restore from backup
npm run db:backup restore backup-2024-01-01.json
```

### Health Monitoring

```bash
# Run health check
npm run db:health

# Start continuous monitoring
npm run db:monitor start

# Get current status
npm run db:monitor status

# Generate monitoring report
npm run db:monitor report
```

## Configuration

### Environment Variables

```bash
# Database Type
DB_TYPE=supabase  # supabase | postgresql | mysql | sqlite

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key

# PostgreSQL/MySQL Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# Or individual parameters
DB_HOST=localhost
DB_PORT=5432
DB_NAME=newsletter
DB_USER=username
DB_PASSWORD=password

# SQLite Configuration
DB_PATH=./newsletter.db

# Optional Settings
DB_POOL_SIZE=20
DB_TIMEOUT=10000
DB_SSL=true
```

### Programmatic Configuration

```typescript
import { createDatabaseClient } from '@newsletter-kit/database';

const client = createDatabaseClient({
  type: 'postgresql',
  host: 'localhost',
  port: 5432,
  database: 'newsletter',
  username: 'user',
  password: 'password',
  poolSize: 20,
  timeout: 10000,
  ssl: true
});
```

## Performance Optimization

### Indexing Strategy

The database schema includes optimized indexes for:
- Email lookups (unique constraint + index)
- Status filtering (status + created_at composite)
- Date range queries (timestamp columns)
- Tag searches (GIN index for arrays)
- Full-text search (metadata JSONB)
- Analytics aggregation (date + source + tag)

### Query Optimization

```typescript
// Efficient pagination
const subscriptions = await client.getSubscriptions({
  page: 1,
  limit: 50,
  sortBy: 'created_at',
  sortOrder: 'desc',
  filters: { status: 'active' }
});

// Optimized analytics queries
const analytics = await client.getAnalytics({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31'),
  groupBy: 'date',
  interval: 'day'
});
```

### Connection Pooling

```typescript
const client = createPostgreSQLClient({
  connectionString: process.env.DATABASE_URL,
  poolSize: 20,           // Max connections
  timeout: 10000,         // Connection timeout
  idleTimeoutMillis: 30000, // Idle connection timeout
});
```

## Security Features

### Row Level Security (Supabase/PostgreSQL)

```sql
-- Service role has full access
CREATE POLICY "service_role_all_access" ON newsletter_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Anonymous users can only insert subscriptions
CREATE POLICY "anonymous_insert_only" ON newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

-- Users can only update their own subscriptions via unsubscribe token
CREATE POLICY "user_update_own" ON newsletter_subscriptions
  FOR UPDATE USING (
    unsubscribe_token = current_setting('newsletter.unsubscribe_token', true)
  );
```

### Data Validation

```typescript
import { DataValidator } from '@newsletter-kit/database/utils';

// Validate email format
if (!DataValidator.isValidEmail(email)) {
  throw new Error('Invalid email format');
}

// Validate subscription data
const validation = DataValidator.validateSubscription(data);
if (!validation.valid) {
  throw new Error(validation.errors.join(', '));
}

// Sanitize user input
const sanitized = DataValidator.sanitizeInput(userInput);
```

### Audit Trail

All subscription activities are automatically logged:
- Subscribe/unsubscribe actions
- Status changes
- Email confirmations
- Bounce handling
- Data exports
- Administrative actions

## Monitoring & Alerting

### Performance Metrics

- Query response times
- Connection pool utilization
- Database growth rates
- Error rates and types
- Index usage statistics

### Health Checks

- Connection availability
- Query execution
- Schema validation
- Data integrity
- Replication status (if applicable)
- Storage capacity

### Alert Channels

```typescript
const monitor = new DatabaseMonitor(dbConfig, {
  alerts: {
    email: 'admin@example.com',
    webhook: 'https://hooks.example.com/alert',
    slack: 'https://hooks.slack.com/webhook'
  },
  thresholds: {
    maxResponseTime: 5000,
    minActiveConnections: 1,
    maxErrorRate: 5
  }
});
```

## Backup & Recovery

### Automated Backups

```typescript
const backupSystem = new NewsletterBackupSystem(config, {
  outputDir: './backups',
  format: 'json',
  compress: true,
  retention: 30 // days
});

// Schedule daily backups
setInterval(async () => {
  await backupSystem.createBackup();
}, 24 * 60 * 60 * 1000);
```

### Disaster Recovery

1. **Point-in-time Recovery**: Restore to specific timestamp
2. **Cross-region Replication**: Automatic failover
3. **Data Validation**: Integrity checks post-recovery
4. **Service Continuity**: Minimal downtime procedures

## API Reference

### Client Methods

#### Subscription Management
- `createSubscription(data)`: Create new subscription
- `getSubscription(id)`: Get subscription by ID
- `getSubscriptionByEmail(email)`: Get by email address
- `getSubscriptionByToken(token)`: Get by unsubscribe token
- `updateSubscription(id, data)`: Update subscription
- `deleteSubscription(id)`: Delete subscription
- `getSubscriptions(options)`: List with pagination/filtering
- `bulkUpdateSubscriptions(updates)`: Batch updates
- `exportSubscriptions(options)`: Export data

#### Analytics & Reporting
- `getSubscriptionStats()`: Current statistics
- `getGrowthStats(start, end)`: Growth analysis
- `getAnalytics(options)`: Analytics data
- `createAnalyticsEntry(data)`: Manual analytics entry

#### Token Management
- `createUnsubscribeToken(data)`: Generate secure token
- `getUnsubscribeToken(token)`: Validate token
- `useUnsubscribeToken(token)`: Mark token as used

#### Audit & Compliance
- `createAuditLog(data)`: Log activity
- `getAuditLogs(options)`: Retrieve audit trail

#### Bounce Management
- `createBounce(data)`: Record bounce
- `getBounces(email?)`: Get bounce history
- `resolveBounce(id)`: Mark bounce resolved

#### Tag Management
- `createTag(data)`: Create tag
- `getTags()`: Get all tags
- `getPopularTags(limit)`: Get usage statistics

#### Maintenance
- `healthCheck()`: Database health status
- `cleanup()`: Maintenance operations
- `runMigrations()`: Schema updates

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Run database tests (`npm run test:db`)
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push branch (`git push origin feature/amazing-feature`)
8. Open Pull Request

## Testing

```bash
# Run all tests
npm test

# Run database tests
npm run test:db

# Run specific adapter tests
npm run test:supabase
npm run test:postgresql
npm run test:mysql
npm run test:sqlite

# Integration tests
npm run test:integration

# Performance tests
npm run test:performance
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- Documentation: [docs.newsletter-kit.dev](https://docs.newsletter-kit.dev)
- Issues: [GitHub Issues](https://github.com/newsletter-kit/database/issues)
- Discussions: [GitHub Discussions](https://github.com/newsletter-kit/database/discussions)
- Email: support@newsletter-kit.dev