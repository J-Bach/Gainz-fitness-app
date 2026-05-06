import { MuscleGroup, WorkoutExercise } from '../types';

export type MuscleCoverageMap = Partial<Record<MuscleGroup, 'primary' | 'secondary'>>;

export function deriveCoverage(exercises: WorkoutExercise[]): MuscleCoverageMap {
  const coverage: MuscleCoverageMap = {};
  for (const ex of exercises) {
    for (const muscle of ex.secondaryMuscles) {
      if (!coverage[muscle]) coverage[muscle] = 'secondary';
    }
    coverage[ex.primaryMuscle] = 'primary';
  }
  return coverage;
}
