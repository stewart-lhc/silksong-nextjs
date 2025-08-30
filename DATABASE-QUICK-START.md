# 🚀 Database Quick Start Guide

## ⚡ 30-Second Setup

### 1. Check Your Database Status
```bash
npm run db:status
```

### 2. Set Up Database (First Time)
```bash
npm run db:setup
```

### 3. Test Everything Works
```bash
npm run db:test
```

## 🎯 What Just Happened?

The setup automatically:
- ✅ **Extended** `email_subscriptions` table with tracking fields
- ✅ **Created** `email_send_attempts` and `email_rollback_tasks` tables  
- ✅ **Added** performance indexes and database functions
- ✅ **Migrated** data from legacy `newsletter_subscriptions` table
- ✅ **Enabled** Row Level Security for data protection
- ✅ **Created** backup of your existing data

## 🔧 Common Commands

| Command | Purpose |
|---------|---------|
| `npm run db:status` | Check database health |
| `npm run db:setup` | Complete database setup |
| `npm run db:repair` | Fix database issues |
| `npm run db:backup` | Create data backup |
| `npm run db:monitor` | View performance metrics |
| `npm run db:test` | Validate functionality |

## 🗂️ New Database Schema

### Enhanced Email Subscriptions
Your `email_subscriptions` table now has these new fields:
- `email_sent` - Track if welcome email was sent
- `email_sent_at` - When email was sent
- `email_send_attempts` - Number of send attempts
- `last_email_error` - Last error message
- `is_active` - Subscription status

### Email Send Tracking
- `email_send_attempts` - Complete send attempt history
- `email_rollback_tasks` - Failed operation recovery

### Database Functions
- Email retry management
- Rollback task processing  
- Performance statistics
- Automated cleanup

## 🚨 Troubleshooting

### Environment Issues
```bash
# Missing .env.local file?
echo "NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key" > .env.local
```

### Permission Issues
```bash
# Check your service role key has proper permissions
npm run db:status
```

### Database Problems
```bash
# Automatically fix common issues
npm run db:repair
```

## 📊 Monitoring

### Real-Time Dashboard
```bash
npm run db:monitor
```

### Health Checks
```bash
# Quick status
npm run db:status

# Full test suite
npm run db:test
```

## 🔒 Security Features

- **Row Level Security** enabled on all tables
- **Service role** access for API operations
- **Data encryption** in transit and at rest
- **Backup encryption** for sensitive data

## 📈 Performance

- **Optimized indexes** for email lookups
- **Automatic cleanup** of old records
- **Connection pooling** ready
- **Query optimization** built-in

## 🆘 Need Help?

1. **Run diagnostics**: `npm run db:status`
2. **Check logs**: Look in `database-backups/` folder
3. **Reset safely**: `npm run db:repair` 
4. **Interactive mode**: `npm run db:admin`

## ✨ What's Next?

After successful setup:

1. **Test your API**: Try `/api/newsletter/subscribe`
2. **Configure emails**: Set up your email provider
3. **Monitor performance**: Use `npm run db:monitor`
4. **Schedule backups**: Use `npm run db:backup`

---

🎉 **That's it!** Your database is ready for production-grade transactional email handling.