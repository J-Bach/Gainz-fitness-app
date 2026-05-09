'use client';

import { create } from 'zustand';
import { WorkoutPlan, WorkoutExercise } from '../types';

const STORAGE_KEY = 'ft:workouts';
const ACTIVE_KEY = 'ft:active-workout';

function migrateWorkout(w: Record<string, unknown>): WorkoutPlan {
  // Migrate split (string) → splits (array)
  if (!w.splits && w.split) {
    w.splits = [w.split];
  }
  if (!Array.isArray(w.splits)) {
    w.splits = ['PUSH'];
  }
  // Ensure exercises have lastWeight / lastWeightDate fields
  if (Array.isArray(w.exercises)) {
    w.exercises = (w.exercises as Record<string, unknown>[]).map((ex) => ({
      lastWeight: null,
      lastWeightDate: null,
      ...ex,
    }));
  }
  return w as unknown as WorkoutPlan;
}

function loadFromStorage(): WorkoutPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    return parsed.map(migrateWorkout);
  } catch {
    return [];
  }
}

function loadActiveId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

function saveToStorage(plans: WorkoutPlan[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch {
    // storage unavailable
  }
}

function saveActiveId(id: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (id === null) {
      localStorage.removeItem(ACTIVE_KEY);
    } else {
      localStorage.setItem(ACTIVE_KEY, id);
    }
  } catch {
    // storage unavailable
  }
}

interface WorkoutStore {
  workouts: WorkoutPlan[];
  initialized: boolean;
  activeWorkoutId: string | null;
  init: () => void;
  addWorkout: (plan: WorkoutPlan) => void;
  updateWorkout: (id: string, updates: Partial<WorkoutPlan>) => void;
  deleteWorkout: (id: string) => void;
  addExerciseToWorkout: (workoutId: string, exercise: WorkoutExercise) => void;
  removeExerciseFromWorkout: (workoutId: string, exerciseId: string) => void;
  reorderExercises: (workoutId: string, exercises: WorkoutExercise[]) => void;
  setActiveWorkout: (id: string | null) => void;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  workouts: [],
  initialized: false,
  activeWorkoutId: null,

  init: () => {
    if (get().initialized) return;
    set({
      workouts: loadFromStorage(),
      activeWorkoutId: loadActiveId(),
      initialized: true,
    });
  },

  addWorkout: (plan) => {
    const next = [...get().workouts, plan];
    saveToStorage(next);
    set({ workouts: next });
  },

  updateWorkout: (id, updates) => {
    const next = get().workouts.map((w) =>
      w.id === id ? { ...w, ...updates } : w
    );
    saveToStorage(next);
    set({ workouts: next });
  },

  deleteWorkout: (id) => {
    const next = get().workouts.filter((w) => w.id !== id);
    saveToStorage(next);
    set({ workouts: next });
  },

  addExerciseToWorkout: (workoutId, exercise) => {
    const next = get().workouts.map((w) => {
      if (w.id !== workoutId) return w;
      return { ...w, exercises: [...w.exercises, exercise] };
    });
    saveToStorage(next);
    set({ workouts: next });
  },

  removeExerciseFromWorkout: (workoutId, exerciseId) => {
    const next = get().workouts.map((w) => {
      if (w.id !== workoutId) return w;
      return {
        ...w,
        exercises: w.exercises
          .filter((e) => e.exerciseId !== exerciseId)
          .map((e, i) => ({ ...e, order: i })),
      };
    });
    saveToStorage(next);
    set({ workouts: next });
  },

  reorderExercises: (workoutId, exercises) => {
    const next = get().workouts.map((w) =>
      w.id === workoutId ? { ...w, exercises } : w
    );
    saveToStorage(next);
    set({ workouts: next });
  },

  setActiveWorkout: (id) => {
    saveActiveId(id);
    set({ activeWorkoutId: id });
  },
}));
