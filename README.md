# Silk Song Archive - Next.js

A comprehensive archive website for Hollow Knight: Silksong built with Next.js 15, TypeScript, and modern web technologies.

## 🚀 Features

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** components ready
- **Responsive design** with mobile-first approach
- **SEO optimized** with proper meta tags
- **Performance optimized** with modern best practices

## 📁 Project Structure

```
silksong-nextjs/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   ├── loading.tsx       # Loading UI
│   └── not-found.tsx     # 404 page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── navigation.tsx    # Navigation component
│   └── hero-section.tsx  # Hero section component
├── hooks/                 # Custom React hooks
│   ├── use-media-query.ts
│   └── use-local-storage.ts
├── lib/                   # Utility functions
│   └── utils.ts          # Common utilities
├── types/                 # TypeScript type definitions
│   └── index.ts          # Main types
├── public/               # Static assets
└── ...config files
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18.18.0 or higher
- npm, yarn, or pnpm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration.

3. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🎨 Adding shadcn/ui Components

This project is configured for shadcn/ui. To add components:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
# etc.
```

## 🏗️ Technology Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI + Tailwind)
- **Icons:** Lucide React
- **Linting:** ESLint + TypeScript ESLint
- **Formatting:** Prettier
- **Package Manager:** npm/yarn/pnpm

## 📱 Responsive Design

The application is built with a mobile-first approach:

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px  
- **Desktop:** > 1024px

Custom hooks are available for responsive behavior:
- `useIsMobile()`
- `useIsTablet()`
- `useIsDesktop()`

## 🔧 Configuration

### TypeScript

- Strict mode enabled
- Path aliases configured (`@/` → `src/`)
- Advanced type checking rules

### ESLint

- Next.js recommended rules
- TypeScript integration
- Import order enforcement
- Custom rules for code quality

### Tailwind CSS

- Design system variables
- Dark mode support
- Custom animations
- shadcn/ui integration

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### Other Platforms

Build the application:

```bash
npm run build
```

The `out` directory contains the built application.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and type checking
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎮 About Silk Song Archive

Silk Song Archive is a comprehensive resource for Hollow Knight: Silksong, featuring the latest news, character information, location guides, media galleries, and development timeline.

---

Built with ❤️ for the Hollow Knight community.