import { SetLog } from '../types';

export function parseReps(repString: string): number {
  if (repString.includes('-')) {
    const [lo, hi] = repString.split('-').map(Number);
    return Math.round((lo + hi) / 2);
  }
  const n = parseInt(repString, 10);
  return isNaN(n) ? 0 : n;
}

export function setVolume(reps: number, weight: number): number {
  return reps * weight;
}

export function exerciseVolume(sets: SetLog[]): number {
  return sets.reduce((sum, s) => {
    if (s.actualReps == null || s.weight == null) return sum;
    return sum + s.actualReps * s.weight;
  }, 0);
}
