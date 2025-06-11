# GitHub Copilot Instructions for Taufiq Najmi Photo Blog

This project is a Next.js-based photo blog built on the [EXIF Photo Blog](https://github.com/sambecker/exif-photo-blog) template. It's a modern web application that displays photos with their EXIF metadata, featuring AI-generated descriptions, custom tagging, and various photo organization methods.

## Project Architecture

### Core Technologies
- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript 5.8.3
- **Styling**: TailwindCSS 4.1.8
- **Database**: PostgreSQL (managed by Coolify)
- **Storage**: Cloudflare R2 (primary) / AWS S3 (alternative)
- **Authentication**: NextAuth 5.0.0-beta.28
- **AI Integration**: OpenAI API for text generation
- **Deployment**: Coolify (self-hosted alternative to Vercel)

### Key Directories

- `/app` - Next.js App Router pages and layouts
- `/src` - Source code organized by feature
  - `/admin` - Admin panel components and functionality
  - `/photo` - Photo processing, display, and management
  - `/auth` - Authentication components and logic
  - `/db` - Database connection and queries
  - `/i18n` - Internationalization support
  - `/state` - Global state management
  - `/tag` - Photo tagging functionality
  - `/components` - Shared UI components
  - `/utility` - Helper functions and utilities

### Important Files

- `/app/layout.tsx` - Root layout with global providers
- `/app/config.ts` - Primary configuration file
- `/src/db/config.ts` - Database configuration
- `/app/page.tsx` - Homepage
- `/app/admin/**` - Admin interface pages
- `/app/p/[photoId]` - Individual photo page

## Data Flow

1. **Photo Upload**: Admin uploads photos via admin panel
2. **Processing**:
   - EXIF data extraction (camera, lens, settings)
   - Image resizing/optimization
   - Optional AI text generation
   - Storage in Cloudflare R2 or AWS S3
   - Metadata stored in PostgreSQL
3. **Display**:
   - Photos served through optimized Next.js Image component
   - EXIF data displayed alongside photos
   - Various views (grid, infinite scroll)

## Key Components

### AppStateProvider
Central state management wrapping the application, providing context for UI state:

```tsx
// From /app/layout.tsx
<AppStateProvider>
  <AppTextProvider>
    <ThemeProvider attribute="class" defaultTheme={DEFAULT_THEME}>
      {/* App content */}
    </ThemeProvider>
  </AppTextProvider>
</AppStateProvider>
```

### Authentication
NextAuth provides authentication for admin users. Protected routes check authentication status:

```tsx
// Authentication check pattern
const session = await auth();
if (!session?.user) {
  redirect('/sign-in');
}
```

### Photo Components
Photo components handle display in various formats, EXIF data extraction, and organization:

```tsx
// Example photo component pattern
<Photo
  photo={photo}
  priority={index < 2}
  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
  className="aspect-square object-cover"
/>
```

### Storage Providers
The application supports both Cloudflare R2 and AWS S3, with a preference mechanism:

```typescript
// Storage selection logic
export const CURRENT_STORAGE: StorageType =
  (process.env.NEXT_PUBLIC_STORAGE_PREFERENCE as StorageType | undefined) || (
    HAS_CLOUDFLARE_R2_STORAGE_CLIENT
      ? 'cloudflare-r2'
      : 'aws-s3'
  );
```

## Common Development Tasks

### Adding a New Page
1. Create a new file in `/app/your-route/page.tsx`
2. Import necessary components
3. Follow Next.js App Router conventions

### Adding New Components
1. Create component in appropriate feature directory (`/src/[feature]`)
2. Follow component naming conventions (PascalCase)
3. Use TypeScript for props interface

### Adding Storage Features
1. Implement in `/src/platforms/storage`
2. Follow existing patterns for consistency

### Working with Database
1. Use Postgres client from `/src/db/client.ts`
2. Follow existing query patterns

### Adding Admin Features
1. Extend components in `/src/admin`
2. Update admin routes in `/app/admin`

## Configuration

Environment variables control most configuration. Key variables:

### Essential Configuration
- `NEXT_PUBLIC_DOMAIN` - Site domain
- `POSTGRES_URL` - PostgreSQL connection
- `AUTH_SECRET` - NextAuth secret
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` - Admin credentials

### Storage Configuration
- `NEXT_PUBLIC_STORAGE_PREFERENCE` - Default storage provider
- `NEXT_PUBLIC_CLOUDFLARE_R2_*` - Cloudflare R2 configuration
- `NEXT_PUBLIC_AWS_S3_*` - AWS S3 configuration

### UI Configuration
- `NEXT_PUBLIC_SITE_TITLE` - Site title
- `NEXT_PUBLIC_META_DESCRIPTION` - Site description
- `NEXT_PUBLIC_DEFAULT_THEME` - Default theme (light/dark)

### AI Features
- `OPENAI_SECRET_KEY` - OpenAI API key for text generation
- `AI_TEXT_AUTO_GENERATED_FIELDS` - Fields to auto-generate (title, description)

## Deployment

This project uses Coolify for deployment:

1. Code is built with Nixpacks (configured in `nixpacks.toml`)
2. Environment checks occur before startup (`scripts/env-check.sh`, `scripts/db-check.sh`)
3. Next.js app is served

The deployment configuration prioritizes:
- Self-hosting capability
- PostgreSQL integration
- R2/S3 storage support
- Environment variable verification

## Development Guidelines

### Styling
- Use Tailwind CSS for styling
- Leverage `clsx` for conditional classes
- Follow mobile-first responsive design

### TypeScript
- Use proper typing for all components and functions
- Create interfaces for component props
- Leverage Next.js types for pages and API routes

### State Management
- Use React context for global state (`/src/state`)
- Leverage SWR for data fetching and caching

### Error Handling
- Implement proper error boundaries
- Use try/catch blocks for async operations
- Provide user-friendly error messages

## Features to Note

1. **EXIF Data Extraction**: The app extracts and displays camera metadata from photos
2. **AI Text Generation**: Optional OpenAI integration for auto-generating photo descriptions
3. **Tag System**: Photos can be organized by user-defined tags
4. **Film Simulation**: Special support for Fujifilm recipes and simulations
5. **Responsive Design**: Optimized for mobile, tablet, and desktop viewing
6. **Multiple Views**: Grid view, individual photo view, and specialized category views
7. **Command-K Search**: Quick search functionality with keyboard shortcut
