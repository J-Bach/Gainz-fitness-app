import { WorkoutPlan } from '../types';

export interface AutoPR {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  date: string | null; // lastWeightDate of the winning entry
}

export function deriveAutoPRs(workouts: WorkoutPlan[]): AutoPR[] {
  const map = new Map<string, AutoPR>();
  for (const workout of workouts) {
    for (const ex of workout.exercises) {
      if (ex.lastWeight == null) continue;
      const existing = map.get(ex.exerciseId);
      if (!existing || ex.lastWeight > existing.weight) {
        map.set(ex.exerciseId, {
          exerciseId: ex.exerciseId,
          exerciseName: ex.name,
          weight: ex.lastWeight,
          date: ex.lastWeightDate ?? null,
        });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.exerciseName.localeCompare(b.exerciseName)
  );
}
