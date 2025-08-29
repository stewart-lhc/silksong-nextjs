# Newsletter Kit 📧

A comprehensive, reusable, and type-safe email subscription component library for Next.js applications.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

## ✨ Features

- 🎨 **Complete UI Components** - Form, Modal, Toast with multiple variants
- 🔧 **Multiple Database Support** - Supabase, PostgreSQL, MySQL, SQLite
- 🛡️ **Type-Safe** - Full TypeScript support with branded types
- ⚡ **Performance Optimized** - React Query caching, rate limiting
- 🎯 **Accessible** - WCAG 2.1 compliant with proper ARIA attributes
- 📱 **Responsive** - Works on all screen sizes
- 🧪 **Well Tested** - 90%+ test coverage
- 🔒 **Secure** - Built-in validation, rate limiting, and sanitization
- 📊 **Analytics Ready** - Built-in tracking and monitoring
- 🎛️ **Configurable** - Extensive configuration options

## 🚀 Quick Start

### 1. Installation

Since this is part of your Next.js project, simply import it:

```tsx
import { QuickStart } from '@/lib/newsletter-kit';
```

### 2. Basic Usage

```tsx
export default function HomePage() {
  return (
    <div>
      <h1>Subscribe to our newsletter</h1>
      <QuickStart.Simple 
        supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
        supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}
      />
    </div>
  );
}
```

That's it! You now have a fully functional newsletter subscription form.

## 📖 Complete Examples

### Professional Newsletter Form

```tsx
import { NewsletterKit, createNewsletterConfig, createSupabaseClient } from '@/lib/newsletter-kit';

const config = createNewsletterConfig({
  database: {
    adapter: createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ),
  },
  ui: {
    variant: 'outlined',
    size: 'lg',
    showCount: true,
  },
  messages: {
    placeholder: 'Enter your professional email',
    submitText: 'Subscribe to Newsletter',
    successText: 'Welcome! Check your email for confirmation.',
  },
});

export default function NewsletterSection() {
  return (
    <NewsletterKit.Provider config={config}>
      <div className="max-w-md mx-auto">
        <NewsletterKit.Form 
          showCount
          onSuccess={(result) => {
            console.log('New subscriber:', result.subscription);
          }}
        />
        <NewsletterKit.ToastContainer position="top-right" />
      </div>
    </NewsletterKit.Provider>
  );
}
```

### Modal Newsletter Subscription

```tsx
import { NewsletterKit, useNewsletterModal } from '@/lib/newsletter-kit';

export default function Header() {
  const modal = useNewsletterModal();
  
  return (
    <header>
      <button onClick={modal.open}>
        Subscribe to Newsletter
      </button>
      
      <NewsletterKit.Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Stay Updated!"
        description="Get the latest updates delivered to your inbox"
        closeOnSuccess
      />
    </header>
  );
}
```

### Custom Hook Integration

```tsx
import { useNewsletter, createNewsletterConfig } from '@/lib/newsletter-kit';

const config = createNewsletterConfig({
  // your configuration
});

export default function CustomForm() {
  const [email, setEmail] = useState('');
  const newsletter = useNewsletter({ config });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await newsletter.subscribe(email, {
      source: 'custom-form',
      tags: ['early-access'],
    });
    
    if (result.success) {
      setEmail('');
      alert(`Thank you! You're subscriber #${result.count}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email..."
        disabled={newsletter.isLoading}
      />
      <button type="submit" disabled={newsletter.isLoading}>
        {newsletter.isLoading ? 'Subscribing...' : 'Subscribe'}
      </button>
      
      {newsletter.error && (
        <p className="error">{newsletter.error.message}</p>
      )}
    </form>
  );
}
```

## 🎨 UI Components

### NewsletterForm

The main subscription form component with multiple variants:

```tsx
// Default form
<NewsletterForm />

// Minimal variant
<NewsletterForm variant="minimal" size="sm" />

// Modern variant with emojis
<NewsletterForm 
  variant="modern" 
  placeholder="✨ Your email here"
  submitText="🚀 Join the crew"
/>

// Outlined variant
<NewsletterForm 
  variant="outlined" 
  size="lg"
  showCount
  showSuccess
/>
```

**Props:**
- `variant`: `'default' | 'outlined' | 'minimal' | 'modern'`
- `size`: `'sm' | 'md' | 'lg'`
- `theme`: `'light' | 'dark' | 'auto'`
- `showCount`: Show subscriber count
- `showSuccess`: Show success message
- `placeholder`: Custom placeholder text
- `submitText`: Custom submit button text
- `onSuccess`: Success callback
- `onError`: Error callback

### NewsletterModal

Modal dialog for newsletter subscriptions:

```tsx
const modal = useNewsletterModal();

<NewsletterModal
  isOpen={modal.isOpen}
  onClose={modal.close}
  title="Subscribe to Newsletter"
  description="Get weekly updates"
  closeOnSuccess={true}
/>
```

**Variants:**
- `NewsletterModalSimple` - Minimal modal
- `NewsletterModalModern` - Contemporary styling
- `NewsletterModalPromo` - Marketing focused

### NewsletterToast

Toast notifications for feedback:

```tsx
// Auto-managed toasts
<NewsletterToastContainer position="top-right" />

// Manual toast control
const toast = useNewsletterToast();
toast.showToast(status);
```

## ⚙️ Configuration

### Basic Configuration

```tsx
import { createNewsletterConfig, configPresets } from '@/lib/newsletter-kit';

// Use presets
const config = createNewsletterConfig(configPresets.professional());

// Custom configuration
const config = createNewsletterConfig({
  database: {
    adapter: myDatabaseAdapter,
    tableName: 'subscriptions',
  },
  api: {
    baseUrl: 'https://api.mysite.com',
    endpoints: {
      subscribe: '/newsletter/subscribe',
      unsubscribe: '/newsletter/unsubscribe',
      stats: '/newsletter/stats',
    },
  },
  validation: {
    allowedDomains: ['gmail.com', 'company.com'],
    blockedDomains: ['tempmail.org'],
  },
  rateLimit: {
    enabled: true,
    maxRequests: 5,
    windowMs: 900000, // 15 minutes
  },
  messages: {
    placeholder: 'Enter your email',
    submitText: 'Subscribe',
    successText: 'Successfully subscribed!',
  },
});
```

### Configuration Builder

```tsx
import { config } from '@/lib/newsletter-kit';

const myConfig = config()
  .withDatabase(myAdapter, 'newsletter_subscriptions')
  .withApi('https://api.example.com')
  .withUI('dark', 'modern', 'lg')
  .withMessages({ placeholder: 'Your email...' })
  .withRateLimit(3, 600000)
  .build('production');
```

### Available Presets

- `configPresets.minimal()` - Simple, lightweight setup
- `configPresets.professional()` - Business-focused configuration  
- `configPresets.modern()` - Contemporary design with emojis
- `configPresets.secure()` - High-security setup with strict validation

## 🗄️ Database Support

### Supabase (Recommended)

```tsx
import { createSupabaseClient } from '@/lib/newsletter-kit/database';

const adapter = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Use service key for server-side
);
```

### PostgreSQL

```tsx
import { createPostgreSQLClient } from '@/lib/newsletter-kit/database';

const adapter = createPostgreSQLClient({
  connectionString: process.env.DATABASE_URL!,
});
```

### MySQL

```tsx
import { createMySQLClient } from '@/lib/newsletter-kit/database';

const adapter = createMySQLClient({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'newsletter',
});
```

### SQLite (Development)

```tsx
import { createSQLiteClient } from '@/lib/newsletter-kit/database';

const adapter = createSQLiteClient({
  filename: './newsletter.db',
});
```

## 🔄 Database Migration

### Run Migrations

```tsx
import { runMigrations } from '@/lib/newsletter-kit/database';

// Automatic migration on startup
await runMigrations(adapter, { autoMigrate: true });

// Manual migration
await runMigrations(adapter, {
  targetVersion: 'latest',
  seedData: true,
});
```

### Migration Scripts

```bash
# Run migrations
npm run newsletter:migrate

# Create backup
npm run newsletter:backup

# Monitor database health
npm run newsletter:monitor

# Health check
npm run newsletter:health
```

## 🎯 API Routes

The library provides ready-to-use API routes for Next.js App Router:

### Subscribe API
`POST /api/newsletter/subscribe`

```json
{
  "email": "user@example.com",
  "source": "homepage",
  "tags": ["newsletter", "updates"],
  "metadata": { "campaign": "summer-2024" }
}
```

### Unsubscribe API
`POST /api/newsletter/unsubscribe`

```json
{
  "token": "unsubscribe-token-here",
  "reason": "Too many emails"
}
```

### Stats API (Admin)
`GET /api/newsletter/stats`

Returns comprehensive analytics and subscriber statistics.

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm run test

# Integration tests  
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Test Utilities

```tsx
import { 
  createMockConfig,
  createMockSubscription,
  mockSupabaseClient,
} from '@/lib/newsletter-kit/__tests__/mocks';

// Use in your tests
const config = createMockConfig();
const subscription = createMockSubscription();
```

## 📊 Analytics & Monitoring

### Built-in Analytics

```tsx
// Track subscription events
const config = createNewsletterConfig({
  analytics: {
    trackSubscriptions: true,
    trackErrors: true,
    customEvents: {
      'newsletter_view': { category: 'engagement' },
    },
  },
});

// Custom tracking
import { trackEvent } from '@/lib/newsletter-kit';

trackEvent('newsletter_opened', { 
  source: 'email',
  campaign: 'weekly-update',
});
```

### Database Monitoring

```tsx
import { monitorDatabase } from '@/lib/newsletter-kit/database';

// Start monitoring
const monitor = await monitorDatabase(adapter, {
  checkInterval: 60000, // 1 minute
  alertThreshold: { latency: 1000, errorRate: 0.05 },
});

// Health check
const health = await adapter.healthCheck();
console.log('Database health:', health);
```

## 🔒 Security Features

### Rate Limiting

Built-in rate limiting prevents abuse:

```tsx
const config = createNewsletterConfig({
  rateLimit: {
    enabled: true,
    maxRequests: 5, // 5 requests
    windowMs: 900000, // per 15 minutes
    skipSuccessfulRequests: true,
  },
});
```

### Email Validation

Comprehensive email validation:

```tsx
import { validateEmail, isDisposableEmail } from '@/lib/newsletter-kit';

const validation = validateEmail('user@example.com', {
  allowedDomains: ['gmail.com'],
  blockedDomains: ['tempmail.org'],
  suggestCorrections: true,
});

if (isDisposableEmail(email)) {
  // Handle disposable email
}
```

### Input Sanitization

All inputs are automatically sanitized:

```tsx
import { sanitizeHtml } from '@/lib/newsletter-kit';

const clean = sanitizeHtml(userInput); // XSS protection
```

## ♿ Accessibility

Newsletter Kit is fully accessible:

- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Readers**: Proper ARIA labels and announcements
- **Focus Management**: Clear focus indicators
- **Color Contrast**: Meets WCAG 2.1 AA standards
- **Responsive**: Works on all screen sizes

```tsx
// Accessibility features are automatic
<NewsletterForm 
  autoFocus // Focus email input on render
  id="newsletter-form" // Proper labeling
  aria-label="Subscribe to newsletter" // Screen reader support
/>
```

## 🎨 Styling & Theming

### Tailwind CSS Classes

All components use semantic CSS classes:

```css
/* Form styling */
.newsletter-form { /* Base form */ }
.newsletter-form--minimal { /* Minimal variant */ }
.newsletter-form--modern { /* Modern variant */ }

/* Size variants */
.newsletter-form--sm { /* Small size */ }
.newsletter-form--md { /* Medium size */ }  
.newsletter-form--lg { /* Large size */ }

/* State classes */
.newsletter-form--loading { /* Loading state */ }
.newsletter-form--error { /* Error state */ }
.newsletter-form--success { /* Success state */ }
```

### Dark Mode Support

Automatic dark mode support:

```tsx
<NewsletterForm theme="auto" /> // Follows system preference
<NewsletterForm theme="dark" />  // Force dark mode
<NewsletterForm theme="light" /> // Force light mode
```

### Custom Styling

```tsx
<NewsletterForm 
  className="my-custom-form"
  style={{ maxWidth: '400px' }}
/>
```

## 🔧 Advanced Usage

### Custom Database Adapter

```tsx
import { DatabaseAdapter } from '@/lib/newsletter-kit/types';

class MyCustomAdapter implements DatabaseAdapter {
  async insert(data) {
    // Custom insert logic
  }
  
  async findByEmail(email) {
    // Custom find logic  
  }
  
  // ... implement other methods
}

const config = createNewsletterConfig({
  database: {
    adapter: new MyCustomAdapter(),
  },
});
```

### Custom Validation

```tsx
<NewsletterForm
  customValidation={(email) => {
    if (email.includes('test')) {
      return { isValid: false, error: 'Test emails not allowed' };
    }
    return { isValid: true, sanitizedEmail: email };
  }}
/>
```

### Event Handling

```tsx
<NewsletterForm
  onSuccess={(result) => {
    // Track successful subscription
    analytics.track('newsletter_subscribed', {
      email: result.subscription.email,
      count: result.count,
    });
  }}
  
  onError={(error) => {
    // Handle errors
    console.error('Subscription error:', error);
    
    if (error.retryable) {
      // Show retry option
    }
  }}
  
  onStatusChange={(status) => {
    // Track status changes
    console.log('Status:', status.type);
  }}
/>
```

## 📱 Mobile Optimization

Newsletter Kit is fully optimized for mobile:

```tsx
// Responsive by default
<NewsletterForm size="lg" /> // Auto-adjusts on mobile

// Mobile-specific props
<NewsletterForm 
  autoFocus={false} // Disable on mobile to prevent keyboard pop-up
  placeholder="Email" // Shorter text for mobile
/>
```

## 🌐 Internationalization

Support for multiple languages:

```tsx
const config = createNewsletterConfig({
  messages: {
    placeholder: 'Ingresa tu correo electrónico',
    submitText: 'Suscribirse',
    successText: '¡Suscripción exitosa!',
    // ... other Spanish messages
  },
});
```

## 🚀 Performance

### Optimization Features

- **Code Splitting**: Components are lazy-loaded
- **Caching**: React Query handles API caching
- **Debounced Validation**: Reduces API calls
- **Rate Limiting**: Prevents spam
- **Minimal Bundle Size**: Tree-shakeable exports

### Bundle Size

```bash
# Check bundle impact
npx bundlephobia @/lib/newsletter-kit

# Approximate sizes:
# - Core components: ~15kb gzipped  
# - Database adapters: ~5kb each
# - Full bundle: ~25kb gzipped
```

## 🐛 Troubleshooting

### Common Issues

**Email validation failing:**
```tsx
// Check your email regex
const config = createNewsletterConfig({
  validation: {
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
});
```

**Database connection errors:**
```tsx
// Enable debug logging
const config = createNewsletterConfig({
  debug: true, // Shows detailed error logs
});
```

**Rate limiting too strict:**
```tsx
// Adjust rate limits
const config = createNewsletterConfig({
  rateLimit: {
    maxRequests: 10, // Increase limit
    windowMs: 300000, // 5 minutes
  },
});
```

### Debug Mode

```tsx
const config = createNewsletterConfig({
  debug: process.env.NODE_ENV === 'development',
});
```

## 📚 API Reference

### Components

- [`NewsletterProvider`](./components/NewsletterProvider.tsx) - Context provider
- [`NewsletterForm`](./components/NewsletterForm.tsx) - Main form component
- [`NewsletterModal`](./components/NewsletterModal.tsx) - Modal component
- [`NewsletterToast`](./components/NewsletterToast.tsx) - Toast notification

### Hooks

- [`useNewsletter`](./hooks/use-newsletter.ts) - Main subscription hook
- [`useNewsletterStats`](./hooks/use-newsletter.ts) - Statistics hook
- [`useNewsletterModal`](./components/NewsletterModal.tsx) - Modal control hook
- [`useNewsletterToast`](./components/NewsletterToast.tsx) - Toast control hook

### Utilities

- [`validateEmail`](./utils/index.ts) - Email validation
- [`formatSubscriberCount`](./utils/index.ts) - Number formatting
- [`createSubscriptionError`](./utils/index.ts) - Error creation
- [`trackEvent`](./utils/index.ts) - Analytics tracking

## 🤝 Contributing

This is part of your Next.js project. To extend Newsletter Kit:

1. **Add new components** in `lib/newsletter-kit/components/`
2. **Add new hooks** in `lib/newsletter-kit/hooks/`  
3. **Add new utilities** in `lib/newsletter-kit/utils/`
4. **Write tests** in `__tests__/newsletter-kit/`
5. **Update documentation** in this README

## 📄 License

This Newsletter Kit is part of your project and follows your project's license.

## 🙏 Acknowledgments

- **Next.js** - Full-stack React framework
- **Supabase** - Backend-as-a-service
- **React Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript

---

**Happy Newsletter Building! 🎉**

For more examples and advanced usage, check out the [`examples/`](./examples/) directory.