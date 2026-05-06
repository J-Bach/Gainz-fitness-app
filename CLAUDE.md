# Fitness Tracker — Project Brief

## Overview
A personal fitness tracking app focused on structured workout planning and progress logging.
Built mobile-first with a clean, dark-mode-preferred aesthetic.

## Core Features
1. **Workout Library** — 40+ exercises organized by muscle group and split type
2. **Plan Builder** — drag-and-drop composer for PUSH / PULL / LEGS / CORE workouts
3. **Muscle Coverage Map** — live SVG body diagram showing targeted muscles
4. **Workout Locking** — assign a workout to a date; locks it from further edits
5. **Session Logging** — log actual sets/reps/weight against targets; track progress over time

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand (global store)
- **Persistence**: localStorage (MVP) — schema designed for easy Supabase migration
- **Auth**: None (MVP)

## Project Structure
```
/app                  → Next.js App Router pages
  /library            → Workout library browser
  /builder            → Plan builder
  /calendar           → Workout calendar view
  /log/[workoutId]    → Session logging page
/components
  /library            → ExerciseCard, LibraryFilters, LibraryGrid
  /builder            → PlanBuilder, ExerciseSlot, SplitSelector
  /diagram            → MuscleDiagram, MuscleOverlay, DiagramToggle
  /logging            → LoggingTable, SetRow, VolumeBar
  /ui                 → shadcn primitives (auto-generated)
/lib
  /types.ts           → All TypeScript types (source of truth)
  /data/exercises.ts  → Seeded exercise library (40+ exercises)
  /store              → Zustand stores (workouts, logs, preferences)
  /utils              → Volume calc, muscle coverage, date helpers
/docs
  /schema.md          → Data shapes reference (this file's companion)
```

## Data Layer
All data persisted to localStorage under these keys:
- `ft:exercises` — full exercise library (seeded on first load)
- `ft:workouts` — all workout plans (DRAFT + LOCKED + COMPLETED)
- `ft:logs` — all session logs keyed by workoutId + date
- `ft:prefs` — user preferences (unit system, theme, etc.)

Schema is designed for a 1:1 migration to Supabase — see `/docs/schema.md`.

## Design System
- **Theme**: Dark mode default, light mode toggle
- **Accent colors**:
  - Primary target muscle → coral/red (`#E8593C`)
  - Secondary/synergist muscle → amber (`#EF9F27`)
  - Untargeted → gray (`#4B4B4B`)
  - PUSH split → blue badge
  - PULL split → purple badge
  - LEGS split → green badge
  - CORE split → amber badge
- **Typography**: System font stack, clean tabular numbers for logging
- **Spacing**: 4px base unit, generous padding on mobile

## Key Constraints
- Mobile-first (320px minimum width)
- All inputs accessible (proper labels, focus states)
- No rounding errors in volume calculations — use integer math where possible
- Locked workouts are immutable — never mutate, only append logs
- TypeScript strict mode — no `any` types

## Build Phases

### Phase 1 — Library + Plan Builder
- [ ] Seed 40 exercises into `/lib/data/exercises.ts`
- [ ] Library browser with filter by muscle group + split category
- [ ] Plan builder: left panel (library) + right panel (current plan)
- [ ] LocalStorage persistence for workouts in DRAFT state
- [ ] Split selector (PUSH / PULL / LEGS / CORE)

### Phase 2 — Muscle Diagram
- [ ] SVG front body silhouette with named muscle regions
- [ ] SVG back body silhouette with named muscle regions
- [ ] Highlight logic: primary = coral, secondary = amber, none = gray
- [ ] Live updates as exercises are added/removed from plan
- [ ] Front / Back / Split toggle

### Phase 3 — Lock, Calendar, Logging
- [ ] Date picker to assign and lock a workout
- [ ] Calendar view (monthly) showing locked/completed workouts
- [ ] Logging table: target sets/reps vs actual, weight input per set
- [ ] Color coding: actual ≥ target = green, actual < target = amber, empty = gray
- [ ] Volume summary per exercise (sets × reps × weight)
- [ ] Previous session weight auto-populated as suggestion

## Claude Code Instructions
- Always read this file at the start of a session
- Work one phase at a time — confirm phase completion before starting the next
- Run `npm run build` after each phase to catch type errors early
- Write tests for all utility functions in `/lib/utils`
- Use the types in `/lib/types.ts` — do not redefine types locally in components
- When adding exercises to the library, follow the exact shape in `/docs/schema.md`
