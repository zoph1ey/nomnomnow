# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev      # Start development server at localhost:3000
bun run build    # Production build
bun run lint     # Run ESLint
```

## Code Style & Organization

### One Component Per File
- Each component should be in its own file — no multiple components in one file
- Keep files short and focused (<200 lines ideally)
- If a component grows too large, split it into smaller sub-components

### Page Files Should Be Minimal
- `page.tsx` files should only handle:
  - Route-level layout
  - Importing and composing components
  - Top-level data fetching (if server component)
- Move all business logic, handlers, and complex JSX to dedicated components
- Example of a clean page:
  ```tsx
  export default function SomePage() {
    return (
      <main>
        <Header />
        <SomeFeature />
        <Footer />
      </main>
    )
  }
  ```

### Component Organization
- `src/components/` - App-specific components (one per file)
- `src/components/ui/` - shadcn/ui primitives (don't modify these)
- Name components clearly: `RestaurantFilters.tsx`, `LandingHero.tsx`, etc.

### Constants & Types
- Move label mappings and constants to a shared file (e.g., `src/lib/constants.ts`)
- Keep types close to where they're used, or in `src/types/` for shared types

## Architecture

NomNomNow is a Next.js 16 restaurant recommendation app with Supabase backend and AI-powered picker.

### Core Flow
1. Users save restaurants with metadata (tags, ratings, dietary info, context/occasion tags)
2. AI Picker (`/picker`) asks about mood/context and recommends from saved list
3. Public profiles (`/user/[username]`) let users share their restaurant lists

### Key Directories

- `src/app/` - Next.js App Router pages (keep these minimal)
- `src/components/` - Feature components (one per file)
- `src/components/ui/` - shadcn/ui component library
- `src/lib/supabase/` - Database client and data functions
- `src/lib/ai.ts` - Groq LLM integration (server-side only)

### Supabase Pattern

Two client factories exist — use the correct one:
- **Client components**: `import { createClient } from '@/lib/supabase/client'`
- **Server components/API routes**: `import { createClient } from '@/lib/supabase/server'`

### AI Chat System

The `/api/chat` route handles AI recommendations:
- Builds a system prompt with user's saved restaurants
- Uses `[DISCOVER: "query"]` markers to trigger Google Places search for open-now restaurants
- Requires user location for discovery feature

### Data Types

Restaurant tags are typed enums defined in `src/lib/supabase/restaurants.ts`:
- `DietaryTag`: halal, vegetarian, vegan, gluten-free, dairy-free, nut-free
- `ContextTag`: date-night, solo-friendly, group-friendly, special-occasion, quick-lunch, late-night, family-friendly, work-meeting, casual-hangout

### Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`
- `GROQ_API_KEY`

