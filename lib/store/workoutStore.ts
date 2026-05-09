'use client';

import { create } from 'zustand';
import { WorkoutPlan, WorkoutExercise, SplitCategory } from '../types';
import { supabase } from '../supabase/client';

// Keep migration for safety
function migrateWorkout(w: Record<string, unknown>): WorkoutPlan {
  if (!w.splits && w.split) w.splits = [w.split as SplitCategory];
  if (!Array.isArray(w.splits)) w.splits = ['PUSH'];
  if (Array.isArray(w.exercises)) {
    w.exercises = (w.exercises as Record<string, unknown>[]).map((ex) => ({
      lastWeight: null,
      lastWeightDate: null,
      ...ex,
    }));
  }
  return w as unknown as WorkoutPlan;
}

function rowToWorkout(row: Record<string, unknown>): WorkoutPlan {
  return migrateWorkout({
    id: row.id,
    name: row.name,
    splits: row.splits,
    status: row.status,
    date: row.date ?? null,
    exercises: row.exercises ?? [],
    createdAt: row.created_at,
    lockedAt: row.locked_at ?? null,
  });
}

interface WorkoutStore {
  workouts: WorkoutPlan[];
  initialized: boolean;
  activeWorkoutId: string | null;
  init: () => Promise<void>;
  addWorkout: (plan: WorkoutPlan) => Promise<void>;
  updateWorkout: (id: string, updates: Partial<WorkoutPlan>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  addExerciseToWorkout: (workoutId: string, exercise: WorkoutExercise) => Promise<void>;
  removeExerciseFromWorkout: (workoutId: string, exerciseId: string) => Promise<void>;
  reorderExercises: (workoutId: string, exercises: WorkoutExercise[]) => Promise<void>;
  setActiveWorkout: (id: string | null) => Promise<void>;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  workouts: [],
  initialized: false,
  activeWorkoutId: null,

  init: async () => {
    if (get().initialized) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { set({ initialized: true }); return; }

    const [{ data: plans }, { data: active }] = await Promise.all([
      supabase.from('workout_plans').select('*').eq('user_id', user.id),
      supabase.from('active_workout').select('workout_id').eq('user_id', user.id).maybeSingle(),
    ]);

    set({
      workouts: (plans ?? []).map(rowToWorkout),
      activeWorkoutId: active?.workout_id ?? null,
      initialized: true,
    });
  },

  addWorkout: async (plan) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('workout_plans').insert({
      id: plan.id,
      user_id: user.id,
      name: plan.name,
      splits: plan.splits,
      status: plan.status,
      date: plan.date,
      exercises: plan.exercises,
      created_at: plan.createdAt,
      locked_at: plan.lockedAt,
    });
    set({ workouts: [...get().workouts, plan] });
  },

  updateWorkout: async (id, updates) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.splits !== undefined) dbUpdates.splits = updates.splits;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.exercises !== undefined) dbUpdates.exercises = updates.exercises;
    if (updates.lockedAt !== undefined) dbUpdates.locked_at = updates.lockedAt;

    await supabase.from('workout_plans').update(dbUpdates).eq('id', id);
    set({ workouts: get().workouts.map((w) => w.id === id ? { ...w, ...updates } : w) });
  },

  deleteWorkout: async (id) => {
    await supabase.from('workout_plans').delete().eq('id', id);
    set({ workouts: get().workouts.filter((w) => w.id !== id) });
  },

  addExerciseToWorkout: async (workoutId, exercise) => {
    const workout = get().workouts.find((w) => w.id === workoutId);
    if (!workout) return;
    const exercises = [...workout.exercises, exercise];
    await supabase.from('workout_plans').update({ exercises }).eq('id', workoutId);
    set({ workouts: get().workouts.map((w) => w.id === workoutId ? { ...w, exercises } : w) });
  },

  removeExerciseFromWorkout: async (workoutId, exerciseId) => {
    const workout = get().workouts.find((w) => w.id === workoutId);
    if (!workout) return;
    const exercises = workout.exercises
      .filter((e) => e.exerciseId !== exerciseId)
      .map((e, i) => ({ ...e, order: i }));
    await supabase.from('workout_plans').update({ exercises }).eq('id', workoutId);
    set({ workouts: get().workouts.map((w) => w.id === workoutId ? { ...w, exercises } : w) });
  },

  reorderExercises: async (workoutId, exercises) => {
    await supabase.from('workout_plans').update({ exercises }).eq('id', workoutId);
    set({ workouts: get().workouts.map((w) => w.id === workoutId ? { ...w, exercises } : w) });
  },

  setActiveWorkout: async (id) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('active_workout').upsert({ user_id: user.id, workout_id: id });
    set({ activeWorkoutId: id });
  },
}));
