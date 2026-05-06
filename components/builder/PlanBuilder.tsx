'use client';

import { useState, useEffect } from 'react';
import { useWorkoutStore } from '@/lib/store/workoutStore';
import { WorkoutPlan, SplitCategory } from '@/lib/types';
import SplitSelector from './SplitSelector';
import ExerciseSlot from './ExerciseSlot';

function generateId(): string {
  return `wp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

interface PlanBuilderProps {
  onSelectWorkout?: (id: string | null) => void;
}

export default function PlanBuilder({ onSelectWorkout }: PlanBuilderProps) {
  const { workouts, init, addWorkout, updateWorkout, deleteWorkout, removeExerciseFromWorkout, reorderExercises } =
    useWorkoutStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function selectId(id: string | null) {
    setSelectedId(id);
    onSelectWorkout?.(id);
  }

  useEffect(() => {
    init();
  }, [init]);

  const draftWorkouts = workouts.filter((w) => w.status === 'DRAFT');
  const selected = workouts.find((w) => w.id === selectedId) ?? null;

  function handleNewWorkout() {
    const plan: WorkoutPlan = {
      id: generateId(),
      name: 'New Workout',
      split: 'PUSH',
      status: 'DRAFT',
      date: null,
      exercises: [],
      createdAt: new Date().toISOString(),
      lockedAt: null,
    };
    addWorkout(plan);
    selectId(plan.id);
  }

  function handleNameChange(name: string) {
    if (!selected) return;
    updateWorkout(selected.id, { name });
  }

  function handleSplitChange(split: SplitCategory) {
    if (!selected) return;
    updateWorkout(selected.id, { split });
  }

  function handleRemoveExercise(exerciseId: string) {
    if (!selected) return;
    removeExerciseFromWorkout(selected.id, exerciseId);
  }

  function handleUpdateExercise(
    exerciseId: string,
    field: 'targetSets' | 'targetReps' | 'lastWeight',
    value: string | number | null
  ) {
    if (!selected) return;
    const updated = selected.exercises.map((e) =>
      e.exerciseId === exerciseId ? { ...e, [field]: value } : e
    );
    reorderExercises(selected.id, updated);
  }

  function handleDelete() {
    if (!selected) return;
    deleteWorkout(selected.id);
    selectId(null);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Workout list panel */}
      <div className="lg:w-64 shrink-0 space-y-2">
        <button
          onClick={handleNewWorkout}
          className="w-full py-2.5 rounded-xl bg-[#E8593C] hover:bg-[#d44e33] text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Workout
        </button>

        {draftWorkouts.length === 0 && (
          <p className="text-xs text-zinc-500 text-center pt-4">
            No draft workouts yet.
          </p>
        )}

        {draftWorkouts.map((w) => (
          <button
            key={w.id}
            onClick={() => selectId(w.id)}
            className={`w-full text-left px-3 py-3 rounded-xl border transition-colors ${
              selectedId === w.id
                ? 'bg-zinc-800 border-zinc-600'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <p className="text-sm font-semibold text-zinc-100 truncate">{w.name}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              {w.split} · {w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''}
            </p>
          </button>
        ))}
      </div>

      {/* Detail panel */}
      <div className="flex-1 min-w-0">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-64 lg:h-full border-2 border-dashed border-zinc-800 rounded-2xl text-center p-8">
            <svg className="w-12 h-12 text-zinc-700 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <p className="text-zinc-400 text-sm font-medium">Select or create a workout</p>
            <p className="text-zinc-600 text-xs mt-1">Your exercises will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Workout name */}
            <input
              type="text"
              value={selected.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-transparent border-b border-zinc-700 focus:border-zinc-400 text-xl font-bold text-zinc-100 pb-1 focus:outline-none transition-colors"
              placeholder="Workout name..."
            />

            {/* Split selector */}
            <SplitSelector value={selected.split} onChange={handleSplitChange} />

            {/* Exercises */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Exercises ({selected.exercises.length})
                </h3>
                <span className="text-[10px] text-zinc-600">
                  Browse library to add
                </span>
              </div>

              {selected.exercises.length === 0 ? (
                <div className="text-center py-10 text-zinc-600 text-sm border border-dashed border-zinc-800 rounded-xl">
                  No exercises added yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {selected.exercises
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((ex) => (
                      <ExerciseSlot
                        key={ex.exerciseId}
                        exercise={ex}
                        onRemove={handleRemoveExercise}
                        onUpdate={handleUpdateExercise}
                      />
                    ))}
                </div>
              )}
            </div>

            {/* Delete workout */}
            <div className="pt-2 border-t border-zinc-800">
              <button
                onClick={handleDelete}
                className="text-xs text-zinc-600 hover:text-red-400 transition-colors"
              >
                Delete workout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
