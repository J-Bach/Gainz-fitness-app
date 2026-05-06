# Schema Reference — Fitness Tracker

Full TypeScript types for all data entities.
This is the source of truth for data shapes across the app and any future Supabase migration.

---

## Core Enums

```typescript
// /lib/types.ts

export type SplitCategory = 'PUSH' | 'PULL' | 'LEGS' | 'CORE';

export type MuscleGroup =
  | 'CHEST'
  | 'FRONT_DELTS'
  | 'SIDE_DELTS'
  | 'REAR_DELTS'
  | 'TRICEPS'
  | 'BICEPS'
  | 'FOREARMS'
  | 'TRAPS'
  | 'LATS'
  | 'RHOMBOIDS'
  | 'LOWER_BACK'
  | 'ABS'
  | 'OBLIQUES'
  | 'QUADS'
  | 'HAMSTRINGS'
  | 'GLUTES'
  | 'HIP_FLEXORS'
  | 'ADDUCTORS'
  | 'CALVES';

export type Equipment =
  | 'BARBELL'
  | 'DUMBBELL'
  | 'CABLE'
  | 'MACHINE'
  | 'BODYWEIGHT'
  | 'KETTLEBELL'
  | 'RESISTANCE_BAND'
  | 'SMITH_MACHINE';

export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type WorkoutStatus = 'DRAFT' | 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED';

export type UnitSystem = 'LBS' | 'KG';
```

---

## Exercise

The base unit of the library. Immutable once seeded.

```typescript
export interface Exercise {
  id: string;                        // e.g. "ex_bench_press_barbell"
  name: string;                      // e.g. "Barbell Bench Press"
  split: SplitCategory;              // Primary split classification
  primaryMuscle: MuscleGroup;        // The main muscle targeted
  secondaryMuscles: MuscleGroup[];   // Supporting muscles
  equipment: Equipment;
  difficulty: Difficulty;
  defaultSets: number;               // Suggested sets (e.g. 4)
  defaultReps: string;               // Suggested rep range (e.g. "8-10")
  notes?: string;                    // Optional coaching cue
}
```

**Example:**
```typescript
{
  id: "ex_bench_press_barbell",
  name: "Barbell Bench Press",
  split: "PUSH",
  primaryMuscle: "CHEST",
  secondaryMuscles: ["FRONT_DELTS", "TRICEPS"],
  equipment: "BARBELL",
  difficulty: "INTERMEDIATE",
  defaultSets: 4,
  defaultReps: "8-10",
  notes: "Keep shoulder blades retracted and drive feet into floor"
}
```

---

## Workout Plan

A user-assembled collection of exercises for a given split and date.

```typescript
export interface WorkoutExercise {
  exerciseId: string;               // References Exercise.id
  name: string;                     // Denormalized for display without joins
  primaryMuscle: MuscleGroup;       // Denormalized for diagram rendering
  secondaryMuscles: MuscleGroup[];  // Denormalized for diagram rendering
  split: SplitCategory;             // Denormalized for badge display
  targetSets: number;               // User-set (defaults from Exercise)
  targetReps: string;               // User-set (e.g. "8-10" or "12")
  order: number;                    // Display order within the workout
}

export interface WorkoutPlan {
  id: string;                       // UUID e.g. "wp_abc123"
  name: string;                     // e.g. "Push A", "Heavy Legs"
  split: SplitCategory;             // Primary split of the workout
  status: WorkoutStatus;
  date: string | null;              // ISO 8601 date string, null if unscheduled
  exercises: WorkoutExercise[];
  createdAt: string;                // ISO 8601 timestamp
  lockedAt: string | null;          // ISO 8601 timestamp, null if not locked
}
```

**Status transitions:**
```
DRAFT → (user picks date + locks) → LOCKED
LOCKED → (user opens on/after date) → IN_PROGRESS
IN_PROGRESS → (all sets logged) → COMPLETED
```

---

## Session Log

Recorded when a user performs a LOCKED workout.

```typescript
export interface SetLog {
  setNumber: number;      // 1-indexed
  targetReps: string;     // Snapshot from WorkoutExercise at lock time
  actualReps: number | null;
  weight: number | null;  // In user's preferred unit (LBS or KG)
  notes: string;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;             // Denormalized
  sets: SetLog[];
  totalVolume: number;              // sets × reps × weight (computed)
  completedAt: string | null;       // ISO 8601 timestamp
}

export interface SessionLog {
  id: string;                       // UUID e.g. "sl_abc123"
  workoutId: string;                // References WorkoutPlan.id
  date: string;                     // ISO 8601 date (same as WorkoutPlan.date)
  exercises: ExerciseLog[];
  startedAt: string;                // ISO 8601 timestamp
  completedAt: string | null;       // ISO 8601 timestamp, null if still in progress
  notes: string;
  unitSystem: UnitSystem;           // Snapshot of user preference at log time
}
```

---

## User Preferences

```typescript
export interface UserPreferences {
  unitSystem: UnitSystem;           // 'LBS' | 'KG'
  theme: 'dark' | 'light' | 'system';
  defaultRestTimer: number;         // Seconds between sets (e.g. 90)
  showSecondaryMuscles: boolean;    // Toggle on muscle diagram
}
```

---

## localStorage Key Map

```typescript
// Keys used in localStorage
const STORAGE_KEYS = {
  EXERCISES: 'ft:exercises',        // Exercise[]
  WORKOUTS:  'ft:workouts',         // WorkoutPlan[]
  LOGS:      'ft:logs',             // SessionLog[]
  PREFS:     'ft:prefs',            // UserPreferences
} as const;
```

---

## Muscle → SVG Region Map

Maps each `MuscleGroup` to the SVG element ID used in the body diagram.

```typescript
export const MUSCLE_SVG_IDS: Record<MuscleGroup, { front?: string; back?: string }> = {
  CHEST:        { front: 'svg-chest' },
  FRONT_DELTS:  { front: 'svg-front-delts' },
  SIDE_DELTS:   { front: 'svg-side-delts-front',  back: 'svg-side-delts-back' },
  REAR_DELTS:   { back: 'svg-rear-delts' },
  TRICEPS:      { back: 'svg-triceps' },
  BICEPS:       { front: 'svg-biceps' },
  FOREARMS:     { front: 'svg-forearms-front',    back: 'svg-forearms-back' },
  TRAPS:        { back: 'svg-traps' },
  LATS:         { back: 'svg-lats' },
  RHOMBOIDS:    { back: 'svg-rhomboids' },
  LOWER_BACK:   { back: 'svg-lower-back' },
  ABS:          { front: 'svg-abs' },
  OBLIQUES:     { front: 'svg-obliques-front',    back: 'svg-obliques-back' },
  QUADS:        { front: 'svg-quads' },
  HAMSTRINGS:   { back: 'svg-hamstrings' },
  GLUTES:       { back: 'svg-glutes' },
  HIP_FLEXORS:  { front: 'svg-hip-flexors' },
  ADDUCTORS:    { front: 'svg-adductors' },
  CALVES:       { front: 'svg-calves-front',      back: 'svg-calves-back' },
};
```

---

## Volume Calculation

```typescript
// /lib/utils/volume.ts

/**
 * Parse a rep range string into its numeric midpoint.
 * "8-10" → 9, "12" → 12, "AMRAP" → 0
 */
export function parseReps(repString: string): number {
  if (repString.includes('-')) {
    const [lo, hi] = repString.split('-').map(Number);
    return Math.round((lo + hi) / 2);
  }
  const n = parseInt(repString, 10);
  return isNaN(n) ? 0 : n;
}

/**
 * Total volume for a single set.
 */
export function setVolume(reps: number, weight: number): number {
  return reps * weight;
}

/**
 * Total volume for an exercise across all sets.
 */
export function exerciseVolume(sets: SetLog[]): number {
  return sets.reduce((sum, s) => {
    if (s.actualReps == null || s.weight == null) return sum;
    return sum + s.actualReps * s.weight;
  }, 0);
}
```

---

## Muscle Coverage Derivation

```typescript
// /lib/utils/coverage.ts

export type MuscleCoverageMap = Partial<Record<MuscleGroup, 'primary' | 'secondary'>>;

/**
 * Given a list of exercises in the current plan,
 * returns a map of which muscles are hit and at what level.
 * Primary beats secondary if a muscle appears in both.
 */
export function deriveCoverage(exercises: WorkoutExercise[]): MuscleCoverageMap {
  const coverage: MuscleCoverageMap = {};

  for (const ex of exercises) {
    // Secondary first so primary can overwrite
    for (const muscle of ex.secondaryMuscles) {
      if (!coverage[muscle]) coverage[muscle] = 'secondary';
    }
    coverage[ex.primaryMuscle] = 'primary';
  }

  return coverage;
}
```

---

## Future Supabase Migration Notes

When migrating from localStorage to Supabase:

- `Exercise` → `exercises` table (read-only, seeded via migration)
- `WorkoutPlan` → `workout_plans` table with `user_id` FK
- `WorkoutExercise` → `workout_exercises` table with `workout_id` FK, ordered by `order` column
- `SessionLog` → `session_logs` table with `workout_id` FK
- `ExerciseLog` → `exercise_logs` table with `session_id` FK
- `SetLog` → `set_logs` table with `exercise_log_id` FK
- `UserPreferences` → `user_preferences` table with `user_id` PK (1:1)

All `id` fields use UUID v4. All timestamps use ISO 8601 with UTC timezone.
