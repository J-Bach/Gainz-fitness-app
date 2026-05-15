'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWorkoutStore } from '@/lib/store/workoutStore';
import { WorkoutPlan, SplitCategory, WorkoutExercise } from '@/lib/types';
import { useExerciseStore } from '@/lib/store/exerciseStore';
import SplitSelector from './SplitSelector';
import ExerciseSlot from './ExerciseSlot';

function generateId(): string {
  return `wp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const SPLIT_TABS: Array<SplitCategory | 'ALL'> = ['ALL', 'PUSH', 'PULL', 'LEGS', 'CORE'];

interface PlanBuilderProps {
  onSelectWorkout?: (id: string | null) => void;
}

export default function PlanBuilder({ onSelectWorkout }: PlanBuilderProps) {
  const { workouts, init, addWorkout, updateWorkout, deleteWorkout, removeExerciseFromWorkout, reorderExercises, addExerciseToWorkout, activeWorkoutId, setActiveWorkout } =
    useWorkoutStore();
  const { exercises, init: initExercises } = useExerciseStore();

  // Inline exercise picker state
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerSplit, setPickerSplit] = useState<SplitCategory | 'ALL'>('ALL');

  function selectId(id: string | null) {
    setActiveWorkout(id);
    setShowPicker(false);
    onSelectWorkout?.(id);
  }

  useEffect(() => {
    init();
    initExercises();
  }, [init, initExercises]);

  // Notify parent about restored activeWorkoutId after init
  useEffect(() => {
    if (activeWorkoutId) {
      onSelectWorkout?.(activeWorkoutId);
    }
    // Only run once after init
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const draftWorkouts = workouts.filter((w) => w.status === 'DRAFT');
  const selected = workouts.find((w) => w.id === activeWorkoutId) ?? null;

  // Picker filtered exercises
  const pickerExercises = useMemo(() => {
    return exercises.filter((ex) => {
      if (pickerSplit !== 'ALL' && ex.split !== pickerSplit) return false;
      if (pickerSearch) {
        const q = pickerSearch.toLowerCase();
        if (!ex.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [exercises, pickerSplit, pickerSearch]);

  function handleNewWorkout() {
    const plan: WorkoutPlan = {
      id: generateId(),
      name: 'New Workout',
      splits: ['PUSH'],
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

  function handleSplitChange(splits: SplitCategory[]) {
    if (!selected) return;
    updateWorkout(selected.id, { splits });
  }

  function handleRemoveExercise(exerciseId: string) {
    if (!selected) return;
    removeExerciseFromWorkout(selected.id, exerciseId);
  }

  function handleUpdateExercise(exerciseId: string, updates: Partial<WorkoutExercise>) {
    if (!selected) return;
    const updated = selected.exercises.map((e) =>
      e.exerciseId === exerciseId ? { ...e, ...updates } : e
    );
    reorderExercises(selected.id, updated);
  }

  function handleDelete() {
    if (!selected) return;
    deleteWorkout(selected.id);
    selectId(null);
  }

  function handlePickerAdd(exerciseId: string) {
    if (!selected) return;
    const ex = exercises.find((e) => e.id === exerciseId);
    if (!ex) return;
    const we: WorkoutExercise = {
      exerciseId: ex.id,
      name: ex.name,
      primaryMuscle: ex.primaryMuscle,
      secondaryMuscles: ex.secondaryMuscles,
      split: ex.split,
      targetSets: ex.defaultSets,
      targetReps: ex.defaultReps,
      lastWeight: null,
      lastWeightDate: null,
      order: selected.exercises.length,
    };
    addExerciseToWorkout(selected.id, we);
    setShowPicker(false);
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
              activeWorkoutId === w.id
                ? 'bg-zinc-800 border-zinc-600'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <p className="text-sm font-semibold text-zinc-100 truncate">{w.name}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              {w.splits.join(' · ')} · {w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''}
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
            <SplitSelector value={selected.splits} onChange={handleSplitChange} />

            {/* Exercises */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                  Exercises ({selected.exercises.length})
                </h3>
              </div>

              {selected.exercises.length === 0 && !showPicker ? (
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

              {/* Add Exercise button */}
              {!showPicker && (
                <button
                  onClick={() => { setShowPicker(true); setPickerSearch(''); setPickerSplit('ALL'); }}
                  className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 text-sm font-semibold transition-colors flex items-center justify-center gap-2 mt-1"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Exercise
                </button>
              )}

              {/* Inline exercise picker panel */}
              {showPicker && (
                <div className="border border-zinc-700 rounded-xl bg-zinc-900 overflow-hidden mt-1">
                  {/* Picker header */}
                  <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-zinc-800">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Pick an Exercise</span>
                    <button
                      onClick={() => setShowPicker(false)}
                      className="text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>

                  {/* Search */}
                  <div className="px-3 pt-2 pb-2">
                    <input
                      type="text"
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      placeholder="Search exercises..."
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
                      autoFocus
                    />
                  </div>

                  {/* Split filter tabs */}
                  <div className="flex gap-1 px-3 pb-2 overflow-x-auto">
                    {SPLIT_TABS.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setPickerSplit(tab)}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide whitespace-nowrap transition-colors ${
                          pickerSplit === tab
                            ? 'bg-[#E8593C] text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Exercise list */}
                  <div className="max-h-56 overflow-y-auto divide-y divide-zinc-800">
                    {pickerExercises.length === 0 ? (
                      <p className="text-center text-xs text-zinc-600 py-6">No exercises match.</p>
                    ) : (
                      pickerExercises.map((ex) => (
                        <div key={ex.id} className="flex items-center justify-between px-3 py-2 hover:bg-zinc-800 transition-colors">
                          <div className="min-w-0">
                            <p className="text-sm text-zinc-100 font-medium truncate">{ex.name}</p>
                            <p className="text-[10px] text-zinc-500">{ex.split} · {ex.primaryMuscle.replace('_', ' ')}</p>
                          </div>
                          <button
                            onClick={() => handlePickerAdd(ex.id)}
                            className="ml-2 shrink-0 px-2.5 py-1 rounded-lg bg-[#E8593C] hover:bg-[#d44e33] text-white text-xs font-bold transition-colors"
                          >
                            Add
                          </button>
                        </div>
                      ))
                    )}
                  </div>
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
