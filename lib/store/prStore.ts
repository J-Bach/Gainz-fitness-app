'use client';

import { create } from 'zustand';
import { PREntry } from '../types';

const STORAGE_KEY = 'ft:prs';

function loadFromStorage(): PREntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PREntry[];
  } catch {
    return [];
  }
}

function saveToStorage(prs: PREntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prs));
  } catch {
    // storage unavailable
  }
}

interface PRStore {
  prs: PREntry[];
  initialized: boolean;
  init: () => void;
  addPR: (entry: PREntry) => void;
  deletePR: (id: string) => void;
  getPRsForExercise: (exerciseId: string) => PREntry[];
}

export const usePRStore = create<PRStore>((set, get) => ({
  prs: [],
  initialized: false,

  init: () => {
    if (get().initialized) return;
    set({ prs: loadFromStorage(), initialized: true });
  },

  addPR: (entry) => {
    const next = [...get().prs, entry];
    saveToStorage(next);
    set({ prs: next });
  },

  deletePR: (id) => {
    const next = get().prs.filter((p) => p.id !== id);
    saveToStorage(next);
    set({ prs: next });
  },

  getPRsForExercise: (exerciseId) => {
    return get()
      .prs.filter((p) => p.exerciseId === exerciseId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
}));
