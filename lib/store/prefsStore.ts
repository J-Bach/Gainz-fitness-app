'use client';

import { create } from 'zustand';
import { UserPreferences } from '../types';

const STORAGE_KEY = 'ft:prefs';

const DEFAULT_PREFS: UserPreferences = {
  unitSystem: 'LBS',
  theme: 'dark',
  defaultRestTimer: 90,
  showSecondaryMuscles: true,
};

function loadFromStorage(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) } as UserPreferences;
  } catch {
    return DEFAULT_PREFS;
  }
}

function saveToStorage(prefs: UserPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // storage unavailable
  }
}

interface PrefsStore {
  prefs: UserPreferences;
  initialized: boolean;
  init: () => void;
  updatePrefs: (updates: Partial<UserPreferences>) => void;
}

export const usePrefsStore = create<PrefsStore>((set, get) => ({
  prefs: DEFAULT_PREFS,
  initialized: false,

  init: () => {
    if (get().initialized) return;
    set({ prefs: loadFromStorage(), initialized: true });
  },

  updatePrefs: (updates) => {
    const next = { ...get().prefs, ...updates };
    saveToStorage(next);
    set({ prefs: next });
  },
}));
