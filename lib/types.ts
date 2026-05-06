export type SplitCategory = 'PUSH' | 'PULL' | 'LEGS' | 'CORE';

export type MuscleGroup =
  | 'CHEST' | 'FRONT_DELTS' | 'SIDE_DELTS' | 'REAR_DELTS'
  | 'TRICEPS' | 'BICEPS' | 'FOREARMS' | 'TRAPS' | 'LATS'
  | 'RHOMBOIDS' | 'LOWER_BACK' | 'ABS' | 'OBLIQUES'
  | 'QUADS' | 'HAMSTRINGS' | 'GLUTES' | 'HIP_FLEXORS'
  | 'ADDUCTORS' | 'CALVES';

export type Equipment =
  | 'BARBELL' | 'DUMBBELL' | 'CABLE' | 'MACHINE'
  | 'BODYWEIGHT' | 'KETTLEBELL' | 'RESISTANCE_BAND' | 'SMITH_MACHINE';

export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type WorkoutStatus = 'DRAFT' | 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED';

export type UnitSystem = 'LBS' | 'KG';

export interface Exercise {
  id: string;
  name: string;
  split: SplitCategory;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  difficulty: Difficulty;
  defaultSets: number;
  defaultReps: string;
  notes?: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  split: SplitCategory;
  targetSets: number;
  targetReps: string;
  lastWeight: number | null;
  lastWeightDate: string | null; // ISO timestamp, set when lastWeight is updated
  order: number;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  splits: SplitCategory[];
  status: WorkoutStatus;
  date: string | null;
  exercises: WorkoutExercise[];
  createdAt: string;
  lockedAt: string | null;
}

export interface PREntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  unitSystem: UnitSystem;
  date: string; // ISO 8601
}

export interface SetLog {
  setNumber: number;
  targetReps: string;
  actualReps: number | null;
  weight: number | null;
  notes: string;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
  totalVolume: number;
  completedAt: string | null;
}

export interface SessionLog {
  id: string;
  workoutId: string;
  date: string;
  exercises: ExerciseLog[];
  startedAt: string;
  completedAt: string | null;
  notes: string;
  unitSystem: UnitSystem;
}

export interface UserPreferences {
  unitSystem: UnitSystem;
  theme: 'dark' | 'light' | 'system';
  defaultRestTimer: number;
  showSecondaryMuscles: boolean;
}

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
