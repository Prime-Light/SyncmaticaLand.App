# SyncmaticaLand - AI Agent Guide

## Project Overview

**SyncmaticaLand** (投影共和国) is a web application for sharing Minecraft schematics. It provides a platform where users can upload their works, discover inspiration, and download schematics for reuse, making the building process more efficient.

This is a modern React-based web application built with Next.js 16, featuring internationalization (i18n), authentication via Appwrite, and a polished UI using shadcn/ui components.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) 16.1.6 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19.2.3
- **Styling**: 
  - Tailwind CSS 4
  - CSS Variables for theming
  - Dark/Light mode support via next-themes
- **UI Components**: 
  - shadcn/ui (radix-nova style)
  - Base UI (@base-ui/react)
  - Radix UI primitives
  - Lucide React icons
- **Authentication**: [Appwrite](https://appwrite.io/) (self-hosted)
  - appwrite (client SDK)
  - node-appwrite (server SDK)
- **Internationalization**: next-intl 4.8.2
- **Animation**: GSAP 3.14.2, typewriter-effect
- **Package Manager**: pnpm (with workspace support)

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/           # Localized routes (i18n)
│   │   │   ├── auth/           # Authentication pages
│   │   │   │   ├── login/
│   │   │   │   ├── signup/
│   │   │   │   └── recover/
│   │   │   ├── globals.css     # Global styles with Tailwind
│   │   │   ├── layout.tsx      # Root layout with providers
│   │   │   └── page.tsx        # Home page
│   │   └── api/                # API routes
│   │       └── auth/           # Auth-related API endpoints
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── auth/               # Authentication forms
│   │   ├── basic/              # Layout components (Navbar, Footer, etc.)
│   │   ├── icons/              # Custom icon components
│   │   └── index.ts            # Centralized exports
│   ├── i18n/                   # Internationalization
│   │   ├── messages/           # Translation files (JSON)
│   │   ├── navigation.ts       # Navigation utilities
│   │   ├── request.ts          # next-intl request config
│   │   └── routing.ts          # Locale routing config
│   └── lib/                    # Utility libraries
│       ├── appwrite/           # Appwrite client/server setup
│       ├── auth/               # Authentication actions
│       └── utils.ts            # Utility functions (cn, etc.)
├── public/                     # Static assets
├── components.json             # shadcn/ui configuration
├── next.config.ts              # Next.js configuration
├── postcss.config.mjs          # PostCSS configuration
├── eslint.config.mjs           # ESLint configuration
├── tsconfig.json               # TypeScript configuration
├── .prettierrc                 # Prettier configuration
├── crowdin.yml                 # Crowdin localization config
└── .env                        # Environment variables
```

## Build and Development Commands

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

## Code Style Guidelines

### Formatting (Prettier)
- **Tab Width**: 4 spaces
- **Print Width**: 144 characters
- **Line Ending**: CRLF (`\r\n`)
- **Trailing Comma**: ES5 style
- **Bracket Same Line**: Enabled
- **Vue Indent**: Script and style blocks are indented

### TypeScript
- Strict mode enabled
- Target: ES2017
- Module: ESNext with bundler resolution
- Path alias: `@/*` maps to `./src/*`

### Component Conventions
- Use functional components with TypeScript
- Server Components by default (Next.js App Router)
- Use `"use client"` directive for client components
- Use `"use server"` directive for Server Actions
- Components are organized by feature in `src/components/`
- UI components follow shadcn/ui patterns with Radix UI primitives

### Styling Conventions
- Use Tailwind CSS utility classes
- Use `cn()` utility from `lib/utils.ts` for conditional class merging
- CSS variables for theming (defined in `globals.css`)
- Support for both light and dark modes
- Global `select-none` applied by default (excludes inputs, textareas, selects, and `.selectable` class)

## Authentication System

The app uses Appwrite for authentication with the following features:

- **Email/Password Authentication**: Login and signup with email verification
- **Session Management**: HTTP-only cookies with secure flags
- **OAuth Providers**: UI prepared for Microsoft, Google, GitHub, Discord (implementation pending)
- **User Roles**: Support for `admin` and `premium` labels

### Auth Flow
1. User submits credentials via Server Actions (`lib/auth/login.ts`, `lib/auth/signup.ts`)
2. Appwrite validates and creates a session
3. Session secret stored in HTTP-only cookie
4. User data fetched via `/api/auth/me` endpoint
5. Email verification via `/api/auth/verify-email` endpoint

## Internationalization (i18n)

- **Supported Locales**: zh-CN (default), zh-TW, en-US, en-GB, en-UD
- **Translation Files**: JSON files in `src/i18n/messages/`
- **Route Structure**: `[locale]` dynamic segment for all pages
- **Crowdin Integration**: Configured for collaborative translation

### Adding Translations
1. Add new keys to `src/i18n/messages/zh-CN.json` (source language)
2. Use `useTranslations()` hook in components
3. Access nested keys with dot notation (e.g., `t("Pages.Auth.Login.Title")`)

## Environment Variables

Required environment variables (see `.env`):

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT    # Appwrite server endpoint
NEXT_PUBLIC_APPWRITE_PROJECT     # Appwrite project ID
APPWRITE_API_KEY                 # Appwrite API key (server-side only)
NEXT_PUBLIC_APP_URL              # Application base URL
```

## Testing

Currently, there is no test suite configured. Consider adding:
- Jest or Vitest for unit testing
- Playwright or Cypress for E2E testing

## Security Considerations

- **HTTP-only Cookies**: Session tokens are stored in HTTP-only cookies
- **CSRF Protection**: SameSite=strict cookie attribute
- **Secure Flag**: Cookies use secure flag in production
- **Input Validation**: Server-side validation in Server Actions
- **Email Verification**: Required for full account functionality

## Key Dependencies Notes

- **next-intl**: Handles i18n routing and translations
- **next-themes**: Theme switching with system preference support
- **GSAP**: Animation library (used in hero section)
- **typewriter-effect**: Typewriter animation for hero text
- **class-variance-authority**: Component variant management
- **tailwind-merge**: Tailwind class deduplication

## Development Tips

1. **Adding New Pages**: Create under `src/app/[locale]/` with appropriate layout
2. **Adding Components**: Use shadcn CLI or add to `src/components/ui/`
3. **Adding API Routes**: Create under `src/app/api/`
4. **Modifying Auth**: Check both Server Actions and API routes
5. **Styling**: Use CSS variables in `globals.css` for theme customization
