# Quick Start Guide

Get your newsletter subscription system up and running in under 5 minutes.

## 📋 Prerequisites

- Next.js 13+ project
- Supabase account (free tier works fine)
- Node.js 18+

## 🚀 Method 1: CLI Setup (Recommended)

The fastest way to get started:

```bash
# In your Next.js project directory
npx @silksong/newsletter-kit init
```

This interactive CLI will:
1. ✅ Detect your project setup
2. ✅ Configure environment variables
3. ✅ Set up database tables
4. ✅ Install required dependencies  
5. ✅ Generate example components
6. ✅ Add npm scripts

### Follow the prompts:
```
? Choose your database provider: Supabase
? Select styling approach: Tailwind CSS  
? Which features do you want?
  ◉ Email validation
  ◉ Rate limiting
  ◉ Subscriber count
  ◉ Success animations
? Use TypeScript? Yes
```

Then:
```bash
# Configure your environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run the database migration
npm run newsletter:migrate

# Start your dev server
npm run dev
```

## 🛠️ Method 2: Manual Setup

### Step 1: Install Dependencies

```bash
npm install @silksong/newsletter-kit @supabase/supabase-js @tanstack/react-query
```

### Step 2: Database Setup

1. Create a new table in your Supabase SQL editor:

```sql
CREATE TABLE email_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(50) DEFAULT 'web',
  is_active BOOLEAN DEFAULT true
);

-- Add indexes for performance
CREATE INDEX idx_email_subscriptions_email ON email_subscriptions(email);
CREATE INDEX idx_email_subscriptions_active ON email_subscriptions(is_active);

-- Enable Row Level Security
ALTER TABLE email_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public subscription" ON email_subscriptions
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public count access" ON email_subscriptions
  FOR SELECT TO public USING (true);
```

### Step 3: Environment Variables

Create `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 4: Add API Routes

Create `app/api/newsletter/subscribe/route.ts`:

```typescript
import { createSubscribeRoute } from '@silksong/newsletter-kit';

export const POST = createSubscribeRoute();
```

Create `app/api/newsletter/count/route.ts`:

```typescript
import { createCountRoute } from '@silksong/newsletter-kit';

export const GET = createCountRoute();
```

### Step 5: Add Components

Create your first newsletter form:

```tsx
// components/NewsletterSignup.tsx
import { NewsletterForm } from '@silksong/newsletter-kit';

export default function NewsletterSignup() {
  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
      <NewsletterForm 
        showCount={true}
        placeholder="Enter your email address..."
        onSuccess={(data) => {
          console.log('New subscriber:', data);
        }}
      />
    </div>
  );
}
```

### Step 6: Use in Your App

```tsx
// app/page.tsx
import NewsletterSignup from '@/components/NewsletterSignup';

export default function HomePage() {
  return (
    <main>
      <h1>Welcome to My App</h1>
      <NewsletterSignup />
    </main>
  );
}
```

## ✅ Verification

Test your setup:

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Visit your page** and try subscribing with a test email

3. **Check Supabase** - You should see the email in your `email_subscriptions` table

4. **Verify the API** by visiting:
   - `http://localhost:3000/api/newsletter/count` - Should return subscriber count

## 🎨 Customization

### Basic Styling
```tsx
<NewsletterForm 
  variant="outlined"
  size="lg"
  className="bg-blue-50 p-4 rounded-lg"
/>
```

### Custom Theme
```tsx
import { NewsletterProvider } from '@silksong/newsletter-kit';

const customTheme = {
  colors: {
    primary: '#6366f1',
    background: '#ffffff'
  }
};

<NewsletterProvider config={{ theme: customTheme }}>
  <NewsletterForm />
</NewsletterProvider>
```

## 🚦 Next Steps

Now that you have the basics working:

1. **[Explore Components](./COMPONENTS.md)** - Learn about all available components
2. **[Theming Guide](./THEMING.md)** - Customize the appearance  
3. **[API Reference](./API.md)** - Dive deeper into configuration
4. **[Examples](./EXAMPLES.md)** - See real-world implementations

## 🐛 Troubleshooting

### Common Issues

**"Module not found" error**
```bash
# Make sure all dependencies are installed
npm install @silksong/newsletter-kit @supabase/supabase-js @tanstack/react-query
```

**Database connection fails**
- Check your Supabase credentials in `.env.local`
- Ensure your Supabase project is not paused
- Verify the database URL format

**Form doesn't submit**
- Check browser developer tools for API errors
- Verify API routes are created correctly
- Test API endpoint directly: `POST /api/newsletter/subscribe`

**Styling looks broken**
- Ensure Tailwind CSS is configured in your project
- Check that component classes are not being purged
- Import the newsletter kit styles if needed

### Getting Help

1. **Check the logs** - Look for errors in browser console and terminal
2. **Validate config** - Run `npx newsletter-kit validate`  
3. **Test components** - Use `npx newsletter-kit examples` to generate test pages
4. **Community** - Join our [Discord](https://discord.gg/newsletter-kit) for help

## 📊 Monitoring

Track your newsletter performance:

```tsx
import { useNewsletterStats } from '@silksong/newsletter-kit';

function Stats() {
  const stats = useNewsletterStats();
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <div>Total: {stats.totalSubscribers}</div>
      <div>Today: {stats.todaySubscriptions}</div>
      <div>This Week: {stats.weeklySubscriptions}</div>
    </div>
  );
}
```

---

🎉 **Congratulations!** You now have a production-ready newsletter subscription system. 

Ready to level up? Check out our [Advanced Configuration Guide](./ADVANCED_CONFIG.md).