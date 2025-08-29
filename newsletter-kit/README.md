# @silksong/newsletter-kit

> 🚀 Drop-in newsletter subscription component for Next.js projects with best-in-class developer experience.

[![npm version](https://badge.fury.io/js/@silksong/newsletter-kit.svg)](https://www.npmjs.com/package/@silksong/newsletter-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- **⚡ 5-minute integration** - Get up and running instantly
- **🎨 Multiple UI variants** - From minimal to hero sections
- **🔒 Production-ready** - Built-in validation, rate limiting, and error handling
- **📱 Fully responsive** - Works perfectly on all screen sizes
- **🎯 Type-safe** - Full TypeScript support with excellent IntelliSense
- **🎨 Themeable** - 6 built-in themes + full customization
- **📊 Analytics ready** - Built-in subscriber counting and stats
- **🚦 Rate limiting** - Prevent spam and abuse
- **🔄 Real-time updates** - Supabase integration with live updates
- **♿ Accessible** - WCAG compliant components

## 🎯 Quick Start

### Installation

```bash
npm install @silksong/newsletter-kit
# or
yarn add @silksong/newsletter-kit
# or
pnpm add @silksong/newsletter-kit
```

### CLI Setup (Recommended)

The fastest way to get started is with our interactive CLI:

```bash
npx @silksong/newsletter-kit init
```

This will:
- ✅ Set up database tables automatically
- ✅ Create configuration files
- ✅ Add environment variables template
- ✅ Install dependencies
- ✅ Generate example components

### Manual Setup

If you prefer manual setup:

1. **Install the package**:
```bash
npm install @silksong/newsletter-kit @supabase/supabase-js @tanstack/react-query
```

2. **Set up your database** (Supabase):
```sql
-- Run this in your Supabase SQL editor
CREATE TABLE email_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source VARCHAR(50) DEFAULT 'web',
  is_active BOOLEAN DEFAULT true
);
```

3. **Configure environment variables**:
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key  
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

4. **Add to your page**:
```tsx
import { NewsletterForm } from '@silksong/newsletter-kit';

export default function HomePage() {
  return (
    <div>
      <h1>Subscribe to our newsletter</h1>
      <NewsletterForm 
        showCount={true}
        onSuccess={(data) => console.log('New subscriber:', data)}
      />
    </div>
  );
}
```

That's it! 🎉

## 📖 Usage Examples

### Basic Form
```tsx
import { NewsletterForm } from '@silksong/newsletter-kit';

<NewsletterForm />
```

### With Custom Styling
```tsx
<NewsletterForm 
  variant="outlined"
  size="lg"
  className="max-w-md mx-auto"
  showCount={true}
/>
```

### Hero Section
```tsx
import { NewsletterFormHero } from '@silksong/newsletter-kit';

<NewsletterFormHero
  title="Stay in the loop"
  description="Get updates on product releases and exclusive content"
  showCount={true}
/>
```

### Modal Form
```tsx
import { NewsletterFormModal } from '@silksong/newsletter-kit';

<NewsletterFormModal
  trigger={<button>Subscribe</button>}
  title="Join our newsletter"
/>
```

### With Provider (Advanced)
```tsx
import { NewsletterProvider, NewsletterForm, NewsletterCount } from '@silksong/newsletter-kit';

const config = {
  theme: {
    colors: { primary: '#3b82f6' }
  },
  messages: {
    success: 'Welcome aboard! 🚀'
  }
};

<NewsletterProvider config={config}>
  <div>
    <NewsletterCount />
    <NewsletterForm />
  </div>
</NewsletterProvider>
```

## 🎨 Components

### Core Components

| Component | Description | Use Case |
|-----------|-------------|----------|
| `NewsletterForm` | Basic subscription form | General use, sidebars |
| `NewsletterFormMinimal` | Clean, minimal design | Footers, compact spaces |
| `NewsletterFormInline` | Horizontal layout | Headers, navigation |
| `NewsletterFormModal` | Popup subscription | Call-to-actions |
| `NewsletterFormHero` | Large, prominent form | Landing pages |
| `NewsletterCount` | Subscriber counter | Social proof |
| `NewsletterProvider` | Configuration context | App-wide settings |

### Component Props

```tsx
interface NewsletterFormProps {
  // Appearance
  variant?: 'default' | 'minimal' | 'outlined' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  
  // Behavior  
  showCount?: boolean;
  autoFocus?: boolean;
  clearOnSuccess?: boolean;
  
  // Content
  placeholder?: string;
  submitText?: string;
  loadingText?: string;
  successMessage?: string;
  
  // Events
  onSuccess?: (data: { email: string; count?: number }) => void;
  onError?: (error: string) => void;
  onSubmit?: (email: string) => void;
  
  // Advanced
  config?: Partial<NewsletterConfig>;
  source?: string;
  customValidation?: (email: string) => { isValid: boolean; error?: string };
}
```

## 🎨 Themes

Newsletter Kit comes with 6 built-in themes:

```tsx
import { themes } from '@silksong/newsletter-kit';

// Available themes
themes.default   // Clean, professional
themes.minimal   // Ultra-minimal design  
themes.dark      // Dark mode optimized
themes.modern    // Contemporary styling
themes.classic   // Traditional design
themes.glass     // Glassmorphism effect
```

### Custom Theme
```tsx
const customTheme = {
  colors: {
    primary: '#8b5cf6',
    background: '#ffffff', 
    border: '#e5e7eb'
  },
  radius: {
    md: '0.75rem'
  }
};

<NewsletterProvider config={{ theme: customTheme }}>
  <NewsletterForm />
</NewsletterProvider>
```

## 🛠️ API Routes

The package can automatically generate API routes for you:

```tsx
// app/api/newsletter/subscribe/route.ts
export { POST } from '@silksong/newsletter-kit/api/subscribe';

// app/api/newsletter/count/route.ts  
export { GET } from '@silksong/newsletter-kit/api/count';
```

Or create custom routes:
```tsx
import { createSubscribeRoute } from '@silksong/newsletter-kit';

export const POST = createSubscribeRoute({
  tableName: 'my_subscribers',
  rateLimit: { maxRequests: 10, windowMs: 60000 },
  onSuccess: async (email) => {
    // Custom logic after subscription
    await sendWelcomeEmail(email);
  }
});
```

## 📊 Analytics & Statistics

```tsx
import { useNewsletterStats } from '@silksong/newsletter-kit';

function Dashboard() {
  const { 
    totalSubscribers,
    activeSubscribers, 
    todaySubscriptions,
    topSources 
  } = useNewsletterStats();
  
  return (
    <div>
      <p>Total: {totalSubscribers}</p>
      <p>Today: {todaySubscriptions}</p>
    </div>
  );
}
```

## 🔧 Configuration

### Environment Variables
```env
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Optional
NEWSLETTER_TABLE_NAME=email_subscriptions
NEWSLETTER_RATE_LIMIT_MAX=5
NEWSLETTER_RATE_LIMIT_WINDOW=900000
```

### Configuration File
```js
// newsletter.config.js
module.exports = {
  tableName: 'email_subscriptions',
  rateLimit: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  theme: {
    colors: {
      primary: '#3b82f6'
    }
  },
  messages: {
    success: 'Thank you for subscribing!',
    placeholder: 'Your email address...'
  }
};
```

## 🚀 CLI Commands

```bash
# Initialize in new or existing project
npx newsletter-kit init

# Add specific components
npx newsletter-kit add form
npx newsletter-kit add modal  
npx newsletter-kit add hero

# Run database migrations
npx newsletter-kit migrate

# Validate configuration
npx newsletter-kit validate

# Generate examples
npx newsletter-kit examples --type advanced
```

## 🔒 Security Features

- ✅ **Input validation** - Email format and length validation
- ✅ **Rate limiting** - Prevent spam and abuse
- ✅ **SQL injection protection** - Parameterized queries
- ✅ **CSRF protection** - Built-in Next.js protection
- ✅ **Row Level Security** - Supabase RLS policies
- ✅ **Duplicate prevention** - Automatic duplicate handling

## 🧪 Testing

```bash
# Run tests
npm test

# Test with coverage
npm run test:coverage

# Test specific component
npm test -- --testNamePattern="NewsletterForm"
```

## 📱 Framework Support

| Framework | Status | Notes |
|-----------|--------|--------|
| Next.js 13+ | ✅ Full support | App Router + Pages Router |
| Next.js 12 | ⚠️ Partial | Some features may not work |
| React 18+ | ✅ Full support | |
| React 17 | ⚠️ Partial | Limited features |

## 🗄️ Database Support

| Database | Status | Notes |
|----------|--------|--------|
| Supabase | ✅ Full support | Recommended |
| PlanetScale | 🔄 Coming soon | MySQL support |
| Neon | 🔄 Coming soon | PostgreSQL |
| Custom | ⚠️ Manual setup | Bring your own |

## 🔧 Migration Guide

### From v0.x to v1.x
```tsx
// Before
import { NewsletterForm } from '@silksong/newsletter-kit/components';

// After  
import { NewsletterForm } from '@silksong/newsletter-kit';
```

### From other libraries
See our [migration guide](./MIGRATION.md) for switching from:
- `react-mailchimp-subscribe`
- `@convertkit/react`
- Custom implementations

## 🎯 Roadmap

- [ ] **Email service integrations** (Mailchimp, ConvertKit, etc.)
- [ ] **Advanced analytics dashboard**
- [ ] **A/B testing support**
- [ ] **Multi-language support**
- [ ] **WordPress plugin**
- [ ] **Shopify integration**
- [ ] **Double opt-in support**
- [ ] **GDPR compliance tools**

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Setup
```bash
git clone https://github.com/your-org/newsletter-kit
cd newsletter-kit
npm install
npm run dev
```

## 📄 License

MIT © [Your Name](LICENSE)

## 🙏 Acknowledgments

Built with:
- [React](https://reactjs.org/)
- [Next.js](https://nextjs.org/) 
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://radix-ui.com/)

## 💬 Community

- [Discord](https://discord.gg/newsletter-kit) - Chat with the community
- [GitHub Discussions](https://github.com/your-org/newsletter-kit/discussions) - Q&A and ideas
- [Twitter](https://twitter.com/newsletter_kit) - Updates and tips

---

<div align="center">
  <p>Made with ❤️ for the developer community</p>
  <p>
    <a href="https://twitter.com/newsletter_kit">Follow us on Twitter</a> •
    <a href="https://newsletter-kit.dev">Website</a> •
    <a href="https://newsletter-kit.dev/docs">Documentation</a>
  </p>
</div>