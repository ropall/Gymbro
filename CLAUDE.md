# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `frontend/`:

```bash
npm run dev          # Dev server at http://localhost:5173
npm run build        # tsc -b && vite build
npm run test         # Vitest (single run)
npm run test:watch   # Vitest in watch mode
npm run typecheck    # TypeScript type-check only
npm run lint         # ESLint
```

To run a single test file:
```bash
npx vitest run src/test/Routine.test.tsx
```

## Architecture

### Stack
- **React 18 + TypeScript + Vite** — frontend only repo; no SSR
- **Tailwind CSS v4** — uses the `@tailwindcss/vite` plugin (not PostCSS config)
- **Zustand v5** — all global state; some stores use `persist` middleware to survive reloads
- **Supabase** — PostgreSQL + Auth (Google OAuth + email/password) + RLS; accessed via `src/lib/supabase.ts`
- **vite-plugin-pwa** — service worker with `NetworkFirst` for Supabase API, otherwise cache-first

### Routing
`App.tsx` uses React Router v7. Protected routes wrap children in `<ProtectedRoute>` + `<Layout>`. Active workout (`/workout/:blockId`) and onboarding (`/bienvenida`, `/onboarding`) are protected but render without the main Layout (no nav bar).

### State stores (`src/stores/`)

| Store | Persistence | Responsibility |
|---|---|---|
| `authStore` | localStorage (`gymbro-auth-state`) | Supabase session, auth methods, onboarding flag |
| `appStore` | localStorage (`gymbro-app-state`) | Active bottom-nav tab |
| `routineStore` | none | Blocks, active cycle, block exercises — all from Supabase |
| `workoutStore` | localStorage via `persist` | In-progress workout state + offline pending-sync queue |
| `exerciseStore` | none | Global + custom exercise catalog |
| `metricsStore` | none | Weight history, body measurements, progress photos |
| `historyStore` | none | Completed workout sessions |
| `nutritionStore` | none | Nutrition menus and meals |
| `progressStore` | none | Per-exercise progress charts |
| `onboardingStore` / `onboardingProfileStore` | none | Multi-step onboarding wizard state |
| `themeStore` | localStorage | Dark/light theme |

### Core domain model (`src/types.ts`)

The training domain: **Cycle** (7-day period) → **Block** (one training day, `posicion` 1–7) → **BlockExercise** → **Session** + **SessionSet** (immutable snapshot of exercise data at completion time).

Key invariants enforced in `routineStore`:
- Only blocks with `posicion > cycle.posicion_actual` can be edited while a cycle is active
- `reorderBlocks` calls the `reorder_blocks` Supabase RPC (not a direct UPDATE) to atomically avoid UNIQUE constraint violations on `posicion`
- `session_sets` rows store snapshot fields (`snapshot_nombre`, etc.) so history is not affected by later edits

### Offline / PWA

`workoutStore` is persisted to localStorage. When `finishWorkout` is called offline, the session is saved as `pendingSync: true`. `syncPendingSession` is called when the app detects connectivity (via `useOnlineStatus` hook in `src/utils/useOnlineStatus.ts`).

### Exercise catalog

Exercises come from two Supabase tables: `global_exercises` (seeded, read-only for users) and `user_exercises` (custom, per-user). Both are unified under the `Exercise` type. `BlockExercise` references one via `global_exercise_id` or `user_exercise_id` (one is always null).

### Database

Migrations in `backend/supabase/migrations/`:
- `001_initial_schema.sql` — base tables
- `002_full_schema.sql` — full schema with RLS policies
- `003_session_snapshot.sql` — adds snapshot columns to `session_sets`

### Testing

Tests live in `src/test/`. Supabase is fully mocked via `src/test/mocks/supabase.ts` — the mock is injected through Vite's module alias (`src/lib/__mocks__/supabase.ts`). Tests use jsdom + Testing Library. There are no integration tests hitting a real database.

To override mock data in a test, mutate `supabaseMock` properties directly before rendering.

### Key conventions

- Spanish is used throughout for UI text, variable names in domain logic (e.g. `posicion`, `es_descanso`, `nombre`), and store method names. English is used for technical React/TS patterns and test identifiers.
- Each store exposes a `reset()` method to clear state on sign-out; call all relevant resets in `authStore.signOut` or logout flows.
- Tailwind v4 has no `tailwind.config.js`; customization goes in CSS with `@theme` directives or via the Vite plugin.
