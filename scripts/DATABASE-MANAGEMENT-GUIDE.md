# Database Management Guide

## 📋 Overview

This guide provides comprehensive instructions for managing the Silksong project database using our automated scripts. All operations are performed programmatically - **no manual SQL execution required**.

## 🎯 Quick Start

### For Windows Users
```bash
# Run the Windows setup script
scripts/run-db-setup.bat
```

### For Linux/macOS/WSL Users
```bash
# Make script executable (first time only)
chmod +x scripts/run-db-setup.sh

# Run the setup
./scripts/run-db-setup.sh setup
```

### Using Node.js Directly
```bash
# Interactive mode - recommended for beginners
node scripts/db-admin.js

# Direct commands
node scripts/db-admin.js status
node scripts/db-admin.js setup
```

## 🔧 Available Operations

### 1. Database Status Check
**Purpose**: Comprehensive health check of database state, tables, data integrity, and performance.

```bash
# Command line
node scripts/db-admin.js status

# Shell script
./scripts/run-db-setup.sh status
```

**What it checks**:
- ✅ Database connection health and latency
- ✅ Table structure and required columns
- ✅ Data integrity and orphaned records
- ✅ Database functions and indexes
- ✅ Row Level Security policies
- ✅ Performance metrics

### 2. Full Database Setup
**Purpose**: Complete database initialization for transactional email system.

```bash
node scripts/db-admin.js setup
```

**What it does**:
1. **Backup**: Creates backup of existing data
2. **Extend Tables**: Adds required columns to `email_subscriptions`
3. **Create Tables**: Creates `email_send_attempts` and `email_rollback_tasks`
4. **Add Enums**: Creates email status and task type enums
5. **Create Indexes**: Adds performance indexes
6. **Install Functions**: Creates database functions for operations
7. **Enable Security**: Sets up Row Level Security
8. **Migrate Data**: Moves data from legacy `newsletter_subscriptions`
9. **Verify**: Validates the entire setup

### 3. Database Repair
**Purpose**: Fix common database issues and inconsistencies.

```bash
node scripts/db-admin.js repair

# With options
node scripts/db-admin.js repair --skip-migration --drop-old-table
```

**What it repairs**:
- 🔧 Missing columns in existing tables
- 🔧 Orphaned records without valid references
- 🔧 Missing performance indexes
- 🔧 Row Level Security policies
- 🔧 Data migration from legacy tables

### 4. Data Migration
**Purpose**: Migrate data from `newsletter_subscriptions` to `email_subscriptions`.

```bash
node scripts/db-admin.js migrate
```

**Migration process**:
1. Scans `newsletter_subscriptions` for data
2. Checks for existing emails in `email_subscriptions`
3. Migrates unique records with proper field mapping
4. Reports migration statistics

### 5. Database Backup
**Purpose**: Create secure backup of current database state.

```bash
node scripts/db-admin.js backup
```

**Backup includes**:
- All data from `email_subscriptions`
- Legacy data from `newsletter_subscriptions`
- Email send attempts and rollback tasks
- Timestamp and metadata

### 6. Performance Monitoring
**Purpose**: Real-time database metrics and performance dashboard.

```bash
node scripts/db-admin.js monitor
```

**Monitoring data**:
- Connection health and response times
- Email sending statistics (last 30 days)
- Pending retry operations
- Pending rollback tasks
- Data growth trends

## 🗄️ Database Schema

### Core Tables

#### `email_subscriptions` (Enhanced)
```sql
-- Core subscription data
id UUID PRIMARY KEY
email VARCHAR(254) UNIQUE NOT NULL
subscribed_at TIMESTAMP WITH TIME ZONE

-- Email tracking fields (added by setup)
email_sent BOOLEAN DEFAULT false
email_sent_at TIMESTAMP WITH TIME ZONE
email_send_attempts INTEGER DEFAULT 0
last_email_error TEXT
last_email_template VARCHAR(100)

-- Subscription management
is_active BOOLEAN DEFAULT true
unsubscribed_at TIMESTAMP WITH TIME ZONE
```

#### `email_send_attempts` (New)
```sql
-- Tracks every email send attempt
id UUID PRIMARY KEY
email VARCHAR(254) NOT NULL
subscription_id UUID REFERENCES email_subscriptions(id)
template_id VARCHAR(100) NOT NULL
status email_send_status DEFAULT 'pending'
attempt_number INTEGER DEFAULT 1
sent_at TIMESTAMP WITH TIME ZONE
error_message TEXT
retry_after TIMESTAMP WITH TIME ZONE
provider_response JSONB
email_content JSONB
metadata JSONB
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

#### `email_rollback_tasks` (New)
```sql
-- Manages rollback operations for failed processes
id UUID PRIMARY KEY
task_type rollback_task_type NOT NULL
email VARCHAR(254) NOT NULL
subscription_id UUID REFERENCES email_subscriptions(id)
send_attempt_id UUID REFERENCES email_send_attempts(id)
reason TEXT
task_data JSONB
status rollback_task_status DEFAULT 'pending'
processed_at TIMESTAMP WITH TIME ZONE
error_message TEXT
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

### Database Functions

#### Email Retry Management
- `get_pending_email_retries(max_attempts, limit)` - Find emails that need retry
- `update_email_send_tracking(attempt_id, status, error, response)` - Update send status

#### Rollback Task Management
- `get_pending_rollback_tasks(task_type, limit)` - Find pending rollback operations
- `process_email_rollback(task_id)` - Execute rollback task

#### Statistics and Monitoring
- `get_email_send_statistics(start_date, end_date)` - Email performance metrics
- `cleanup_old_attempts(retention_days, batch_size)` - Clean up old records

## ⚡ Performance Features

### Indexes
All critical operations are optimized with indexes:
- Email lookups by address
- Status-based queries for processing
- Time-based queries for monitoring
- Foreign key relationships

### Row Level Security
- Service role has full access for API operations
- Authenticated users can read their own data
- Anonymous access blocked by default

### Automatic Cleanup
- Old successful send attempts are automatically cleaned
- Completed rollback tasks are archived
- Configurable retention periods

## 🚨 Troubleshooting

### Common Issues

#### 1. Connection Errors
```
Error: Missing environment variables
```
**Solution**: Ensure `.env.local` contains:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 2. Permission Errors
```
Error: insufficient_privilege
```
**Solution**: Verify that the `SUPABASE_SERVICE_ROLE_KEY` has the correct permissions.

#### 3. Table Already Exists
```
Error: relation "email_send_attempts" already exists
```
**Solution**: This is normal. The scripts use `IF NOT EXISTS` to safely handle existing tables.

#### 4. Missing Functions
```
Error: function get_pending_email_retries() does not exist
```
**Solution**: Run the full setup or repair command to install database functions.

### Recovery Procedures

#### Rollback Failed Setup
```bash
# 1. Check what backups are available
ls database-backups/

# 2. Use the repair tool to fix issues
node scripts/db-admin.js repair

# 3. Or restore from backup manually if needed
```

#### Clean Slate Setup
```bash
# 1. Create backup of any important data
node scripts/db-admin.js backup

# 2. Drop all related tables (CAREFUL!)
# This should only be done in development
node scripts/db-admin.js cleanup

# 3. Run full setup
node scripts/db-admin.js setup
```

## 📊 Monitoring and Maintenance

### Regular Health Checks
```bash
# Weekly health check
node scripts/db-admin.js status

# Performance monitoring
node scripts/db-admin.js monitor
```

### Data Maintenance
```bash
# Clean up old records (runs automatically)
# Manual cleanup if needed:
SELECT * FROM cleanup_old_attempts(30, 1000);
```

### Backup Schedule
```bash
# Create regular backups
node scripts/db-admin.js backup

# Store backups in database-backups/ directory
```

## 🎛️ Advanced Usage

### Interactive Mode
For hands-on database management:
```bash
node scripts/db-admin.js
# Provides interactive command prompt
```

### Scripted Operations
For CI/CD pipelines:
```bash
# Silent setup for deployment
node scripts/db-admin.js setup --skip-confirmation

# Status check with exit code
node scripts/db-admin.js status && echo "Database healthy"
```

### Custom Operations
The scripts are modular and can be imported:
```javascript
const { DatabaseManager } = require('./scripts/database-manager');
const manager = new DatabaseManager();
// Custom operations...
```

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env.local` to version control
- Use strong service role keys
- Rotate keys periodically

### Database Access
- Scripts use service role for admin operations
- Application uses anon key for user operations
- Row Level Security enforces access control

### Backup Security
- Backups contain sensitive email data
- Store backups securely
- Consider encryption for production backups

## 📝 Changelog

### Version 1.0 (Current)
- ✅ Automated database setup and management
- ✅ Comprehensive health checking
- ✅ Data migration from legacy tables
- ✅ Performance monitoring
- ✅ Automated repair and cleanup
- ✅ Cross-platform support (Windows/Linux/macOS)

## 🤝 Support

If you encounter issues:
1. Run `node scripts/db-admin.js status` for diagnostics
2. Check the generated reports in `database-backups/`
3. Review this guide for troubleshooting steps
4. Create backups before attempting fixes

## 📚 Next Steps

After successful database setup:
1. Test API endpoints (`/api/newsletter/subscribe`, `/api/newsletter/health`)
2. Configure email provider (Resend/SendGrid)
3. Set up monitoring and alerting
4. Configure backup automation
5. Review and customize email templates