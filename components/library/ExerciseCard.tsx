'use client';

import { Exercise, SplitCategory, Difficulty, Equipment } from '@/lib/types';

const SPLIT_COLORS: Record<SplitCategory, string> = {
  PUSH: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PULL: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  LEGS: 'bg-green-500/20 text-green-400 border-green-500/30',
  CORE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  BEGINNER: 'text-emerald-400',
  INTERMEDIATE: 'text-yellow-400',
  ADVANCED: 'text-red-400',
};

const EQUIPMENT_LABEL: Record<Equipment, string> = {
  BARBELL: 'Barbell',
  DUMBBELL: 'Dumbbell',
  CABLE: 'Cable',
  MACHINE: 'Machine',
  BODYWEIGHT: 'Bodyweight',
  KETTLEBELL: 'Kettlebell',
  RESISTANCE_BAND: 'Band',
  SMITH_MACHINE: 'Smith',
};

interface ExerciseCardProps {
  exercise: Exercise;
  onAddToWorkout: (exercise: Exercise) => void;
}

export default function ExerciseCard({ exercise, onAddToWorkout }: ExerciseCardProps) {
  const primaryLabel = exercise.primaryMuscle.replace(/_/g, ' ');
  const secondaryLabels = exercise.secondaryMuscles.map((m) => m.replace(/_/g, ' '));

  return (
    <div className="bg-zinc-900 rounded-xl p-4 flex flex-col gap-3 border border-zinc-800 hover:border-zinc-700 transition-colors">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-zinc-100 text-sm leading-tight flex-1">
          {exercise.name}
        </h3>
        <span
          className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${SPLIT_COLORS[exercise.split]}`}
        >
          {exercise.split}
        </span>
      </div>

      {/* Primary muscle */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-[11px] font-semibold text-[#E8593C] bg-[#E8593C]/10 px-2 py-0.5 rounded-full">
          {primaryLabel}
        </span>
        {secondaryLabels.map((m) => (
          <span
            key={m}
            className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full"
          >
            {m}
          </span>
        ))}
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-[11px] text-zinc-400">
        <span>{EQUIPMENT_LABEL[exercise.equipment]}</span>
        <span className="text-zinc-700">·</span>
        <span className={DIFFICULTY_COLORS[exercise.difficulty]}>
          {exercise.difficulty.charAt(0) + exercise.difficulty.slice(1).toLowerCase()}
        </span>
        <span className="text-zinc-700">·</span>
        <span className="tabular-nums text-zinc-300 font-medium">
          {exercise.defaultSets} × {exercise.defaultReps}
        </span>
      </div>

      {/* Notes */}
      {exercise.notes && (
        <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">
          {exercise.notes}
        </p>
      )}

      {/* Add button */}
      <button
        onClick={() => onAddToWorkout(exercise)}
        className="mt-auto w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors border border-zinc-700 hover:border-zinc-600"
      >
        + Add to Workout
      </button>
    </div>
  );
}
