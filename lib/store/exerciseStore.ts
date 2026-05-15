'use client';

import { create } from 'zustand';
import { Exercise } from '../types';
import { EXERCISES } from '../data/exercises';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const CACHE_KEY = 'ft:exercises-cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

interface ExerciseCache {
  exercises: Exercise[];
  fetchedAt: number;
}

interface ExerciseStore {
  exercises: Exercise[];
  initialized: boolean;
  init: () => Promise<void>;
}

/** Map a Supabase row (snake_case) to our Exercise type (camelCase). */
function rowToExercise(row: Record<string, unknown>): Exercise {
  return {
    id: row.id as string,
    name: row.name as string,
    split: row.split as Exercise['split'],
    primaryMuscle: row.primary_muscle as Exercise['primaryMuscle'],
    secondaryMuscles: (row.secondary_muscles as string[]) as Exercise['secondaryMuscles'],
    equipment: row.equipment as Exercise['equipment'],
    difficulty: (row.difficulty as Exercise['difficulty']) ?? 'INTERMEDIATE',
    defaultSets: (row.default_sets as number) ?? 3,
    defaultReps: (row.default_reps as string) ?? '8-12',
    notes: (row.notes as string | undefined) ?? undefined,
  };
}

function readCache(): Exercise[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: ExerciseCache = JSON.parse(raw);
    const age = Date.now() - parsed.fetchedAt;
    if (age > CACHE_TTL) return null;
    if (!Array.isArray(parsed.exercises) || parsed.exercises.length === 0) return null;
    return parsed.exercises;
  } catch {
    return null;
  }
}

function writeCache(exercises: Exercise[]): void {
  try {
    const cache: ExerciseCache = { exercises, fetchedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage errors (private mode, quota exceeded, etc.)
  }
}

async function fetchFromSupabase(): Promise<Exercise[]> {
  // Fetch all rows using pagination (Supabase default limit is 1000)
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/exercises?select=*&limit=2000`,
    {
      headers: {
        apikey: ANON_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
  if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status}`);
  const rows: Record<string, unknown>[] = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('Empty exercises table');
  return rows.map(rowToExercise);
}

export const useExerciseStore = create<ExerciseStore>((set, get) => ({
  exercises: EXERCISES,   // Start with static fallback so UI is never empty
  initialized: false,

  init: async () => {
    if (get().initialized) return;

    // 1. Check localStorage cache first
    const cached = readCache();
    if (cached) {
      set({ exercises: cached, initialized: true });
      return;
    }

    // 2. Fetch from Supabase
    try {
      const exercises = await fetchFromSupabase();
      writeCache(exercises);
      set({ exercises, initialized: true });
    } catch (err) {
      console.warn('[exerciseStore] Supabase fetch failed, using static fallback:', err);
      // 3. Fall back to static EXERCISES
      set({ exercises: EXERCISES, initialized: true });
    }
  },
}));
