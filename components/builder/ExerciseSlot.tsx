'use client';

import { WorkoutExercise } from '@/lib/types';

interface ExerciseSlotProps {
  exercise: WorkoutExercise;
  onRemove: (exerciseId: string) => void;
  onUpdate: (exerciseId: string, field: 'targetSets' | 'targetReps' | 'lastWeight', value: string | number | null) => void;
  unitSystem?: 'LBS' | 'KG';
}

export default function ExerciseSlot({ exercise, onRemove, onUpdate, unitSystem = 'LBS' }: ExerciseSlotProps) {
  const primaryLabel = exercise.primaryMuscle.replace(/_/g, ' ');

  return (
    <div className="flex items-center gap-3 bg-zinc-800 rounded-lg px-3 py-3 border border-zinc-700 group">
      {/* Drag handle (visual only) */}
      <div className="shrink-0 text-zinc-600 cursor-grab select-none">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <circle cx="9" cy="5" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="9" cy="19" r="1.5" />
          <circle cx="15" cy="5" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="15" cy="19" r="1.5" />
        </svg>
      </div>

      {/* Exercise info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-100 truncate">{exercise.name}</p>
        <p className="text-[10px] text-[#E8593C]">{primaryLabel}</p>
      </div>

      {/* Sets input */}
      <div className="flex flex-col items-center gap-0.5">
        <label className="text-[9px] text-zinc-500 uppercase tracking-wide">Sets</label>
        <input
          type="number"
          min={1}
          max={20}
          value={exercise.targetSets}
          onChange={(e) => onUpdate(exercise.exerciseId, 'targetSets', parseInt(e.target.value, 10) || 1)}
          className="w-10 bg-zinc-700 border border-zinc-600 rounded text-center text-sm font-bold text-zinc-100 tabular-nums focus:outline-none focus:border-zinc-400 py-1"
        />
      </div>

      {/* Reps input */}
      <div className="flex flex-col items-center gap-0.5">
        <label className="text-[9px] text-zinc-500 uppercase tracking-wide">Reps</label>
        <input
          type="text"
          value={exercise.targetReps}
          onChange={(e) => onUpdate(exercise.exerciseId, 'targetReps', e.target.value)}
          className="w-14 bg-zinc-700 border border-zinc-600 rounded text-center text-sm font-bold text-zinc-100 tabular-nums focus:outline-none focus:border-zinc-400 py-1"
          placeholder="8-12"
        />
      </div>

      {/* Weight input */}
      <div className="flex flex-col items-center gap-0.5">
        <label className="text-[9px] text-zinc-500 uppercase tracking-wide">{unitSystem}</label>
        <input
          type="number"
          min={0}
          step={2.5}
          value={exercise.lastWeight ?? ''}
          onChange={(e) => {
            const val = e.target.value === '' ? null : parseFloat(e.target.value);
            onUpdate(exercise.exerciseId, 'lastWeight', val);
          }}
          className="w-16 bg-zinc-700 border border-zinc-600 rounded text-center text-sm font-bold text-zinc-100 tabular-nums focus:outline-none focus:border-[#E8593C] py-1 placeholder:text-zinc-600"
          placeholder="—"
        />
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(exercise.exerciseId)}
        className="shrink-0 p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        aria-label="Remove exercise"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
