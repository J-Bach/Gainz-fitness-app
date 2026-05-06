'use client';

import { create } from 'zustand';
import { WorkoutPlan, WorkoutExercise } from '../types';

const STORAGE_KEY = 'ft:workouts';

function loadFromStorage(): WorkoutPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as WorkoutPlan[];
  } catch {
    return [];
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

interface WorkoutStore {
  workouts: WorkoutPlan[];
  initialized: boolean;
  init: () => void;
  addWorkout: (plan: WorkoutPlan) => void;
  updateWorkout: (id: string, updates: Partial<WorkoutPlan>) => void;
  deleteWorkout: (id: string) => void;
  addExerciseToWorkout: (workoutId: string, exercise: WorkoutExercise) => void;
  removeExerciseFromWorkout: (workoutId: string, exerciseId: string) => void;
  reorderExercises: (workoutId: string, exercises: WorkoutExercise[]) => void;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  workouts: [],
  initialized: false,

  init: () => {
    if (get().initialized) return;
    set({ workouts: loadFromStorage(), initialized: true });
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
}));
