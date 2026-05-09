'use client';

import { create } from 'zustand';
import { PREntry } from '../types';
import { supabase } from '../supabase/client';

interface PRStore {
  prs: PREntry[];
  initialized: boolean;
  init: () => Promise<void>;
  addPR: (entry: PREntry) => Promise<void>;
  deletePR: (id: string) => Promise<void>;
  getPRsForExercise: (exerciseId: string) => PREntry[];
}

export const usePRStore = create<PRStore>((set, get) => ({
  prs: [],
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { set({ initialized: true }); return; }

    const { data } = await supabase.from('pr_entries').select('*').eq('user_id', user.id);
    const prs: PREntry[] = (data ?? []).map((row) => ({
      id: row.id,
      exerciseId: row.exercise_id,
      exerciseName: row.exercise_name,
      weight: row.weight,
      unitSystem: row.unit_system,
      date: row.date,
    }));
    set({ prs, initialized: true });
  },

  addPR: async (entry) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('pr_entries').insert({
      id: entry.id,
      user_id: user.id,
      exercise_id: entry.exerciseId,
      exercise_name: entry.exerciseName,
      weight: entry.weight,
      unit_system: entry.unitSystem,
      date: entry.date,
    });
    set({ prs: [...get().prs, entry] });
  },

  deletePR: async (id) => {
    await supabase.from('pr_entries').delete().eq('id', id);
    set({ prs: get().prs.filter((p) => p.id !== id) });
  },

  getPRsForExercise: (exerciseId) =>
    get().prs
      .filter((p) => p.exerciseId === exerciseId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
}));
