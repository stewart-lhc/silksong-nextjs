# Troubleshooting Guide

Common issues and solutions when using Newsletter Kit.

## 🔧 Installation Issues

### "Module not found" Error

**Problem**: Getting module resolution errors after installation.

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Install peer dependencies
npm install @supabase/supabase-js @tanstack/react-query

# For TypeScript projects
npm install -D @types/node @types/react
```

### CLI Command Not Found

**Problem**: `newsletter-kit` command not recognized.

**Solution**:
```bash
# Use npx to run without global installation
npx @silksong/newsletter-kit init

# Or install globally
npm install -g @silksong/newsletter-kit
newsletter-kit init
```

## 🗄️ Database Issues

### "Table doesn't exist" Error

**Problem**: API returns database errors about missing tables.

**Solution**:
1. Run the migration:
   ```bash
   npx newsletter-kit migrate
   ```

2. Or manually create the table in Supabase SQL editor:
   ```sql
   CREATE TABLE email_subscriptions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     is_active BOOLEAN DEFAULT true
   );
   ```

### "Permission denied" Error

**Problem**: RLS (Row Level Security) blocking operations.

**Solution**:
1. Check your RLS policies in Supabase
2. Add the required policies:
   ```sql
   -- Allow public subscriptions
   CREATE POLICY "Allow public subscription" ON email_subscriptions
     FOR INSERT TO public WITH CHECK (true);
   
   -- Allow public count access  
   CREATE POLICY "Allow public count access" ON email_subscriptions
     FOR SELECT TO public USING (true);
   ```

### Connection Timeout

**Problem**: Database operations timing out.

**Solution**:
1. Check your Supabase project status (not paused)
2. Verify environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-key
   ```
3. Test connection:
   ```bash
   npx newsletter-kit validate
   ```

## 🎨 Styling Issues

### Styles Not Applied

**Problem**: Components appear unstyled or broken.

**Solutions**:

1. **Tailwind CSS not configured**:
   ```js
   // tailwind.config.js
   module.exports = {
     content: [
       './node_modules/@silksong/newsletter-kit/**/*.{js,ts,jsx,tsx}',
       // ... your other content paths
     ]
   }
   ```

2. **Missing CSS imports**:
   ```tsx
   // In your root layout or _app.tsx
   import '@silksong/newsletter-kit/styles';
   ```

3. **CSS purging issue**:
   ```js
   // tailwind.config.js - safelist important classes
   module.exports = {
     safelist: [
       'newsletter-form',
       'newsletter-input', 
       'newsletter-button'
     ]
   }
   ```

### Custom Theme Not Working

**Problem**: Custom theme configuration ignored.

**Solution**:
```tsx
// Wrap with NewsletterProvider at the right level
import { NewsletterProvider } from '@silksong/newsletter-kit';

// App level
<NewsletterProvider config={{ theme: customTheme }}>
  <YourApp />
</NewsletterProvider>

// Or component level
<NewsletterProvider config={{ theme: customTheme }}>
  <NewsletterForm />
</NewsletterProvider>
```

## 🚦 API Issues

### 404 API Route Not Found

**Problem**: Newsletter API endpoints returning 404.

**Solution**:
1. Create the API routes:
   ```tsx
   // app/api/newsletter/subscribe/route.ts
   export { POST } from '@silksong/newsletter-kit/api/subscribe';
   
   // app/api/newsletter/count/route.ts
   export { GET } from '@silksong/newsletter-kit/api/count';
   ```

2. For custom routes:
   ```tsx
   import { createSubscribeRoute } from '@silksong/newsletter-kit';
   export const POST = createSubscribeRoute();
   ```

### Rate Limit Errors

**Problem**: "Rate limit exceeded" errors during testing.

**Solution**:
1. **Adjust rate limits for development**:
   ```js
   // newsletter.config.js
   module.exports = {
     rateLimit: {
       maxRequests: 100, // Higher limit for dev
       windowMs: 60 * 1000 // 1 minute window
     }
   }
   ```

2. **Clear rate limit store** (development only):
   ```bash
   # Restart your dev server
   npm run dev
   ```

### CORS Errors

**Problem**: CORS errors when calling API from different domain.

**Solution**:
```js
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/newsletter/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
        ],
      },
    ]
  },
}
```

## ⚛️ React Issues

### Hydration Mismatch

**Problem**: React hydration errors with newsletter components.

**Solution**:
```tsx
// Use dynamic imports for client-only components
import dynamic from 'next/dynamic';

const NewsletterForm = dynamic(
  () => import('@silksong/newsletter-kit').then(mod => mod.NewsletterForm),
  { ssr: false }
);
```

### Hook Errors

**Problem**: "Cannot use hooks outside function component" error.

**Solution**:
```tsx
// Make sure React Query is properly configured
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  <NewsletterForm />
</QueryClientProvider>
```

### State Not Updating

**Problem**: Form state not updating after submission.

**Solution**:
```tsx
// Use onSuccess callback to handle state updates
<NewsletterForm 
  onSuccess={(data) => {
    // Custom success handling
    setShowSuccess(true);
    console.log('Subscribed:', data);
  }}
  clearOnSuccess={true} // Clear form after success
/>
```

## 🔐 Environment Issues

### Environment Variables Not Loading

**Problem**: Environment variables undefined in runtime.

**Solution**:
1. **Check file name**: Must be `.env.local` (not `.env`)
2. **Restart dev server** after adding variables
3. **Public variables**: Must start with `NEXT_PUBLIC_`
4. **Server-side variables**: Don't need prefix but only work server-side

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... # Client-side access
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Server-side only
```

### Wrong Environment

**Problem**: Development config used in production.

**Solution**:
```bash
# Check current environment
echo $NODE_ENV

# Verify environment-specific config
npx newsletter-kit validate --env production
```

## 📱 TypeScript Issues

### Type Errors

**Problem**: TypeScript compilation errors.

**Solution**:
1. **Install type definitions**:
   ```bash
   npm install -D @types/react @types/node
   ```

2. **Import types correctly**:
   ```tsx
   import type { NewsletterFormProps } from '@silksong/newsletter-kit';
   ```

3. **Configure tsconfig.json**:
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true,
       "allowSyntheticDefaultImports": true
     }
   }
   ```

### Missing Type Declarations

**Problem**: "Could not find declaration file" errors.

**Solution**:
```tsx
// Create types/newsletter-kit.d.ts
declare module '@silksong/newsletter-kit' {
  export * from '@silksong/newsletter-kit/dist/types';
}
```

## 🧪 Testing Issues

### Jest Configuration

**Problem**: Tests failing with module resolution errors.

**Solution**:
```js
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@silksong/newsletter-kit$': '<rootDir>/node_modules/@silksong/newsletter-kit/dist'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
}
```

### Mock Supabase in Tests

**Problem**: Tests trying to make real API calls.

**Solution**:
```js
// jest.setup.js
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn(),
      select: jest.fn(),
      count: jest.fn()
    }))
  }))
}));
```

## 🚀 Performance Issues

### Slow Form Submission

**Problem**: Newsletter form takes too long to submit.

**Solution**:
1. **Check database indexes**:
   ```sql
   CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email 
   ON email_subscriptions(email);
   ```

2. **Enable connection pooling** in Supabase project settings

3. **Optimize API route**:
   ```tsx
   // Use proper error handling and connection management
   import { createSubscribeRoute } from '@silksong/newsletter-kit';
   
   export const POST = createSubscribeRoute({
     timeout: 5000, // 5 second timeout
     retries: 2
   });
   ```

### Bundle Size Issues

**Problem**: Newsletter Kit adding too much to bundle size.

**Solution**:
```js
// next.config.js - Enable tree shaking
module.exports = {
  experimental: {
    optimizePackageImports: ['@silksong/newsletter-kit']
  }
}
```

```tsx
// Import only what you need
import { NewsletterForm } from '@silksong/newsletter-kit/components/NewsletterForm';
// instead of
import { NewsletterForm } from '@silksong/newsletter-kit';
```

## 🆘 Getting Help

### Debug Mode

Enable debug logging:
```tsx
<NewsletterProvider config={{ debug: true }}>
  <NewsletterForm />
</NewsletterProvider>
```

### Diagnostic Command

Run the built-in diagnostics:
```bash
npx newsletter-kit validate --verbose
```

### Create Minimal Reproduction

When reporting issues:
1. Create a minimal example that reproduces the problem
2. Include your configuration
3. Share relevant error messages
4. Specify your environment (Node.js, Next.js versions)

### Community Support

- **GitHub Issues**: [Report bugs](https://github.com/your-org/newsletter-kit/issues)
- **Discussions**: [Ask questions](https://github.com/your-org/newsletter-kit/discussions)  
- **Discord**: [Real-time help](https://discord.gg/newsletter-kit)
- **Stack Overflow**: Tag with `newsletter-kit`

### Professional Support

For enterprise customers, we offer:
- Priority support
- Custom implementation help
- Architecture review
- Performance optimization

Contact: support@newsletter-kit.dev

---

**Still stuck?** Don't hesitate to reach out - we're here to help! 🤝