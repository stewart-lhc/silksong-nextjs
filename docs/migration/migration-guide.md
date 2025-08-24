# Silk Song Archive - Next.js Migration Guide

This document provides comprehensive guidance for migrating from the existing Vite-based React application to Next.js with enterprise-grade TypeScript configuration.

## 📋 Migration Overview

### Current Stack (Vite)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Database**: Supabase
- **UI**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query

### Target Stack (Next.js)
- **Framework**: Next.js 15 + React 19 + TypeScript 5.6
- **Build Tool**: Next.js with SWC
- **Database**: Supabase (maintained)
- **UI**: Tailwind CSS + shadcn/ui (maintained)
- **State Management**: TanStack Query (maintained)

## 🚀 Getting Started

### 1. Environment Setup

```bash
# Navigate to the Next.js project directory
cd silksong-nextjs

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local with your actual values
# See the .env.local.example file for required variables
```

### 2. Key Configuration Files

| File | Purpose | Migration Notes |
|------|---------|-----------------|
| `tsconfig.json` | TypeScript configuration with strict enterprise settings | Enhanced with advanced type checking |
| `eslint.config.mjs` | ESLint with Next.js and strict TypeScript rules | Comprehensive rule set for code quality |
| `next.config.js` | Next.js configuration with performance optimizations | Security headers, image optimization, bundling |
| `prettier.config.js` | Code formatting configuration | Tailwind CSS integration and file-specific overrides |
| `global.d.ts` | Global TypeScript declarations | Environment variables and utility types |

## 🔧 Configuration Details

### TypeScript Configuration

The `tsconfig.json` includes enterprise-grade settings:

- **Strict Mode**: All strict checks enabled
- **Advanced Checks**: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- **Path Mapping**: Comprehensive alias system for clean imports
- **Performance**: Incremental compilation and declaration maps

```typescript
// Example of strict typing in the new configuration
interface GameInfo {
  readonly id: string;
  readonly title: string;
  readonly status: GameStatus; // Strictly typed enum
  readonly platforms: readonly Platform[]; // Readonly array
}
```

### Environment Variables

Enhanced environment variable system with:

- **Type Safety**: Strict TypeScript types in `global.d.ts`
- **Validation**: Runtime validation using Zod in `lib/env.ts`
- **Feature Flags**: Boolean flags for enabling/disabling features

```typescript
// Access environment variables with full type safety
import { env, features } from '@/lib/env';

if (features.analytics) {
  // Analytics code here - TypeScript knows this is boolean
}
```

### ESLint Configuration

Comprehensive linting setup:

- **Next.js Rules**: All Next.js-specific optimizations
- **TypeScript Rules**: Strict TypeScript checking
- **React Rules**: Modern React patterns and hooks
- **Accessibility**: Built-in a11y checking
- **Import Organization**: Automatic import sorting

### Performance Optimizations

- **Bundle Splitting**: Optimized chunk splitting for better caching
- **Image Optimization**: Next.js Image component with modern formats
- **Compression**: Gzip/Brotli compression
- **Security Headers**: Comprehensive security header configuration
- **Tree Shaking**: Advanced dead code elimination

## 📁 Project Structure

```
silksong-nextjs/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── loading.tsx        # Loading UI
│   ├── not-found.tsx      # 404 page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utilities and configurations
│   ├── env.ts            # Environment validation
│   ├── utils.ts          # Utility functions
│   └── supabase/         # Supabase client
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── public/               # Static assets
├── .vscode/              # VSCode configuration
├── __mocks__/            # Jest mocks
├── global.d.ts           # Global TypeScript declarations
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
├── jest.config.js        # Jest configuration
└── prettier.config.js    # Prettier configuration
```

## 🔄 Migration Steps

### Phase 1: Setup and Configuration
1. ✅ Configure TypeScript with strict settings
2. ✅ Set up ESLint with comprehensive rules
3. ✅ Configure environment variables with validation
4. ✅ Set up development tools (Prettier, VSCode)

### Phase 2: Component Migration
1. Migrate page components to App Router
2. Update component imports to use new path aliases
3. Convert class components to functional components (if any)
4. Update styling to use Tailwind CSS with new configuration

### Phase 3: Data Layer Migration
1. Update Supabase client configuration
2. Migrate API calls to new error handling system
3. Update TanStack Query configuration for SSR
4. Implement proper TypeScript types for database operations

### Phase 4: Testing and Optimization
1. Set up Jest with Next.js integration
2. Write component tests using React Testing Library
3. Set up Playwright for E2E testing
4. Implement performance monitoring

## 🛠️ Development Workflow

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run dev:debug        # Start with Node.js debugging
npm run dev:turbo        # Start with Turbo mode

# Building
npm run build            # Production build
npm run build:analyze    # Build with bundle analysis
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # TypeScript type checking
npm run format          # Format code with Prettier
npm run validate        # Run all quality checks

# Testing
npm run test            # Run Jest tests
npm run test:watch      # Jest in watch mode
npm run test:e2e        # Playwright E2E tests
npm run test:all        # Run all tests

# Database
npm run db:generate     # Generate TypeScript types from Supabase
npm run db:migrate      # Run database migrations
```

### VSCode Integration

The project includes comprehensive VSCode configuration:

- **Auto-formatting**: Prettier integration with save actions
- **Type checking**: Real-time TypeScript error detection
- **Debugging**: Launch configurations for Next.js and tests
- **Extensions**: Recommended extensions for optimal development experience

## 🔍 Key Differences from Vite

### File-based Routing
- **Vite**: Manual route configuration with React Router
- **Next.js**: File-based routing in the `app/` directory

### Server-Side Rendering
- **Vite**: Client-side rendering only
- **Next.js**: SSR, SSG, and ISR capabilities

### API Routes
- **Vite**: Separate backend required
- **Next.js**: Built-in API routes in `app/api/`

### Image Optimization
- **Vite**: Manual optimization
- **Next.js**: Automatic optimization with `next/image`

### Bundle Optimization
- **Vite**: Basic code splitting
- **Next.js**: Advanced optimization with automatic splitting

## 🔐 Security Considerations

### Environment Variables
- All sensitive variables prefixed with `NEXT_PUBLIC_` for client access
- Server-only variables kept secure
- Runtime validation prevents configuration errors

### Security Headers
- CSP (Content Security Policy) configured
- HSTS, X-Frame-Options, and other security headers
- Referrer policy and permissions policy set

### Type Safety
- Strict TypeScript configuration prevents runtime errors
- Environment variables are strictly typed
- Database operations have full type safety

## 📊 Performance Monitoring

### Web Vitals
- Built-in Web Vitals monitoring
- Performance metrics collection
- Lighthouse CI integration

### Bundle Analysis
- Webpack Bundle Analyzer integration
- Performance budget monitoring
- Dependency analysis tools

## 🐛 Troubleshooting

### Common Issues

1. **TypeScript Errors**: The strict configuration may reveal existing type issues
   - Solution: Fix types incrementally or adjust strictness temporarily

2. **Import Path Issues**: New path aliases may conflict with existing imports
   - Solution: Use the VSCode path completion and auto-fix features

3. **Environment Variable Access**: Different patterns between client/server
   - Solution: Use the `env` helper from `@/lib/env` for type-safe access

4. **Styling Issues**: Tailwind configuration differences
   - Solution: Check the new `tailwind.config.ts` for custom configurations

### Getting Help

1. Check the [Next.js documentation](https://nextjs.org/docs)
2. Review TypeScript errors in VSCode
3. Use the development tools and debugging configurations
4. Run the validation scripts to identify issues

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run deploy:vercel
```

### Docker
```bash
npm run deploy:docker
```

### Static Export
```bash
npm run build:static
```

## 📈 Next Steps

After successful migration:

1. **Performance Optimization**: Analyze bundle size and optimize imports
2. **SEO Enhancement**: Implement meta tags and structured data
3. **Testing Coverage**: Increase test coverage to 80%+
4. **Monitoring**: Set up error tracking and performance monitoring
5. **CI/CD**: Implement automated testing and deployment pipelines

## 📂 Directory Mapping

### From Vite Structure → To Next.js Structure

| Vite Location | Next.js Location | Notes |
|---------------|------------------|-------|
| `/src/pages/Index.tsx` | `/app/page.tsx` | Main homepage |
| `/src/pages/[Page].tsx` | `/app/[route]/page.tsx` | Individual pages |
| `/src/components/` | `/components/` | Direct copy (minor import updates) |
| `/src/assets/` | `/public/` | Static assets |
| `/src/lib/` | `/lib/` | Utility functions |
| `/src/hooks/` | `/hooks/` | Custom React hooks |
| `/src/types/` | `/types/` | TypeScript definitions |
| `/index.html` | `/app/layout.tsx` | HTML structure → React component |

## 📋 Detailed Migration Checklist

### Phase 1: Setup & Basic Structure
- [x] ✅ Next.js 15 project created
- [x] ✅ TypeScript configured with strict settings
- [x] ✅ Tailwind CSS setup
- [x] ✅ ESLint & Prettier configured
- [x] ✅ Path aliases configured
- [x] ✅ Basic components created
- [x] ✅ VSCode configuration added
- [x] ✅ Jest testing setup

### Phase 2: Asset Migration
- [ ] Copy `/public/` assets (images, icons, etc.)
- [ ] Update asset references in components
- [ ] Copy `/public/pressKit/` directory
- [ ] Copy `/public/Music/` directory
- [ ] Update manifest.json for Next.js

### Phase 3: Component Migration
- [ ] Copy `/src/components/` to `/components/`
- [ ] Update import paths to use `@/` aliases
- [ ] Convert any Vite-specific code
- [ ] Update component exports if needed
- [ ] Add 'use client' directives where needed

### Phase 4: Page Structure
- [ ] Convert `/src/pages/Index.tsx` to `/app/page.tsx`
- [ ] Create individual routes:
  - [ ] `/app/news/page.tsx`
  - [ ] `/app/characters/page.tsx`
  - [ ] `/app/locations/page.tsx`
  - [ ] `/app/media/page.tsx`
  - [ ] `/app/timeline/page.tsx`

### Phase 5: Data & Configuration
- [ ] Copy `/src/data/` directory structure
- [ ] Update data imports and usage
- [ ] Copy `/src/config/` files
- [ ] Update SEO configuration for Next.js
- [ ] Configure Supabase for SSR

### Phase 6: Hooks & Utilities
- [ ] Copy custom hooks from `/src/hooks/`
- [ ] Copy utilities from `/src/lib/`
- [ ] Update type definitions
- [ ] Test all custom functionality

### Phase 7: Styling & UI
- [ ] Copy existing Tailwind components
- [ ] Update CSS imports for Next.js
- [ ] Verify responsive design works
- [ ] Test dark mode functionality

### Phase 8: Testing & Optimization
- [ ] Test all routes and navigation
- [ ] Verify images and media load correctly
- [ ] Check SEO meta tags
- [ ] Performance audit
- [ ] Mobile responsiveness test

## 📝 Notes

- The migration maintains full compatibility with existing Supabase setup
- All shadcn/ui components work without modification
- TanStack Query configuration is enhanced for SSR support
- The development experience is significantly improved with better tooling

For questions or issues during migration, refer to the comprehensive configuration files and this documentation.