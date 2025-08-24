# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Component Development
- `npx shadcn@latest add <component>` - Add new shadcn/ui components
- Example: `npx shadcn@latest add button`, `npx shadcn@latest add dialog`

## Project Architecture

### Framework & Stack
- **Next.js 15** with App Router architecture
- **TypeScript** with strict type checking
- **Tailwind CSS** with custom design system
- **shadcn/ui** components (Radix UI + Tailwind)
- **Supabase** for backend database and authentication
- **React Query** for data fetching and caching
- **Framer Motion** for animations

### Directory Structure
```
├── app/                    # Next.js App Router - pages and layouts
│   ├── api/               # API routes (health, analytics, subscriptions)
│   ├── (pages)/          # Route groups for pages
│   ├── globals.css       # Global styles and CSS variables
│   └── layout.tsx        # Root layout with providers
├── components/           # React components
│   ├── ui/              # shadcn/ui components (reusable)
│   └── *.tsx           # Feature-specific components
├── hooks/               # Custom React hooks
├── lib/                # Utility libraries and configurations
│   ├── supabase/       # Database client and types
│   ├── utils.ts        # Common utilities (cn, formatError, etc.)
│   └── env.ts          # Environment variable validation
├── config/             # Configuration files (site, SEO)
├── data/              # Static JSON data files
├── types/             # TypeScript type definitions
└── styles/            # Additional styles and design tokens
```

### Key Architectural Patterns

#### 1. Path Aliases (tsconfig.json)
- `@/` maps to root directories (./app/*, ./components/*, ./lib/*, ./data/*)
- `@/components/*` maps to `./components/*`
- `@/lib/*` maps to `./lib/*`
- Use these aliases consistently for imports

#### 2. Database Layer (Supabase)
- **Client**: `@/lib/supabase/client.ts` - Main Supabase client configuration
- **Types**: `@/types/supabase.ts` - Auto-generated database types
- **Hooks**: `@/hooks/use-supabase-query.ts` - Custom hooks for type-safe database operations
- All database operations use type-safe hooks with React Query integration
- Authentication handled through `useSupabaseAuth()` hook

#### 3. Component Architecture
- **UI Components**: Located in `components/ui/` - reusable shadcn/ui components
- **Feature Components**: Located in `components/` - business logic components
- All components use TypeScript with proper prop typing
- Styling uses Tailwind CSS with custom design tokens

#### 4. Styling System
- **Design System**: Defined in `tailwind.config.ts` with custom colors, fonts, animations
- **CSS Variables**: Defined in `app/globals.css` for theme consistency
- **Utility Function**: `cn()` from `@/lib/utils` for conditional class merging
- **Custom Fonts**: Inter, JetBrains Mono, and Poppins with optimized loading

#### 5. Data Fetching Patterns
- Use `useSupabaseQuery()` for data fetching with automatic caching
- Use `useSupabaseInsert()`, `useSupabaseUpdate()`, `useSupabaseDelete()` for mutations
- All queries automatically invalidate cache on mutations
- Real-time subscriptions available via `useSupabaseSubscription()`

#### 6. Error Handling
- Custom `SupabaseQueryError` class for database errors
- `formatError()` utility for consistent error message formatting
- All database operations wrapped in `executeQuery()` for uniform error handling

### Development Guidelines

#### TypeScript Usage
- All components must be properly typed
- Use database types from `@/types/supabase.ts`
- Path aliases configured for clean imports
- Strict type checking enabled

#### Component Development
- Follow existing component patterns in `/components`
- Use shadcn/ui components from `/components/ui`
- Import utilities from `@/lib/utils` (especially `cn()` for styling)
- Use custom hooks from `/hooks` for business logic

#### Database Operations
- Always use typed hooks from `@/hooks/use-supabase-query.ts`
- Never use raw Supabase client directly in components
- Follow the established query patterns for consistency

#### Styling
- Use Tailwind classes with the custom design system
- Leverage CSS variables for theme consistency
- Use `cn()` utility for conditional styling
- Follow the established color palette and typography scale

### Performance Considerations
- Image optimization configured in `next.config.js`
- Font optimization with preload and fallbacks
- React Query caching for all database operations
- Performance monitoring component in layout

### SEO & Metadata
- Structured data configured in `@/components/structured-data`
- Meta tags handled in layout with proper OpenGraph and Twitter cards
- Sitemap and robots.txt generation configured