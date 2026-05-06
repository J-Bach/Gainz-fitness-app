'use client';

import { Exercise } from '@/lib/types';
import ExerciseCard from './ExerciseCard';

interface LibraryGridProps {
  exercises: Exercise[];
  onAddToWorkout: (exercise: Exercise) => void;
}

export default function LibraryGrid({ exercises, onAddToWorkout }: LibraryGridProps) {
  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg className="w-12 h-12 text-zinc-700 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <p className="text-zinc-400 text-sm">No exercises match your filters.</p>
        <p className="text-zinc-600 text-xs mt-1">Try clearing some filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {exercises.map((ex) => (
        <ExerciseCard
          key={ex.id}
          exercise={ex}
          onAddToWorkout={onAddToWorkout}
        />
      ))}
    </div>
  );
}
