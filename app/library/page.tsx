'use client';

import { useState, useEffect, useMemo } from 'react';
import { EXERCISES } from '@/lib/data/exercises';
import { Exercise, SplitCategory, MuscleGroup, Equipment, WorkoutExercise, WorkoutPlan } from '@/lib/types';
import LibraryFilters from '@/components/library/LibraryFilters';
import LibraryGrid from '@/components/library/LibraryGrid';
import { useWorkoutStore } from '@/lib/store/workoutStore';

function generateId(): string {
  return `wp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function LibraryPage() {
  const { workouts, init, addWorkout, addExerciseToWorkout } = useWorkoutStore();

  const [split, setSplit] = useState<SplitCategory | 'ALL'>('ALL');
  const [muscle, setMuscle] = useState<MuscleGroup | ''>('');
  const [equipment, setEquipment] = useState<Equipment | ''>('');
  const [search, setSearch] = useState('');

  // Modal state
  const [pendingExercise, setPendingExercise] = useState<Exercise | null>(null);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>('');
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [addedMsg, setAddedMsg] = useState('');

  useEffect(() => {
    init();
  }, [init]);

  const draftWorkouts = workouts.filter((w) => w.status === 'DRAFT');

  const filtered = useMemo(() => {
    return EXERCISES.filter((ex) => {
      if (split !== 'ALL' && ex.split !== split) return false;
      if (muscle && ex.primaryMuscle !== muscle && !ex.secondaryMuscles.includes(muscle)) return false;
      if (equipment && ex.equipment !== equipment) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!ex.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [split, muscle, equipment, search]);

  function openModal(exercise: Exercise) {
    setPendingExercise(exercise);
    setSelectedWorkoutId(draftWorkouts[0]?.id ?? '__new__');
    setNewWorkoutName('');
    setAddedMsg('');
  }

  function closeModal() {
    setPendingExercise(null);
  }

  function handleConfirmAdd() {
    if (!pendingExercise) return;

    let targetId = selectedWorkoutId;

    if (selectedWorkoutId === '__new__') {
      const plan: WorkoutPlan = {
        id: generateId(),
        name: newWorkoutName || 'New Workout',
        split: pendingExercise.split,
        status: 'DRAFT',
        date: null,
        exercises: [],
        createdAt: new Date().toISOString(),
        lockedAt: null,
      };
      addWorkout(plan);
      targetId = plan.id;
    }

    const workout = workouts.find((w) => w.id === targetId);
    const existingCount = workout?.exercises.length ?? 0;

    const we: WorkoutExercise = {
      exerciseId: pendingExercise.id,
      name: pendingExercise.name,
      primaryMuscle: pendingExercise.primaryMuscle,
      secondaryMuscles: pendingExercise.secondaryMuscles,
      split: pendingExercise.split,
      targetSets: pendingExercise.defaultSets,
      targetReps: pendingExercise.defaultReps,
      lastWeight: null,
      order: existingCount,
    };

    addExerciseToWorkout(targetId, we);
    const workoutName = workout?.name ?? (newWorkoutName || 'New Workout');
    setAddedMsg(`Added to "${workoutName}"`);;

    setTimeout(() => {
      closeModal();
    }, 800);
  }

  return (
    <main className="max-w-2xl mx-auto px-4 pt-6 pb-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-100">Exercise Library</h1>
        <p className="text-xs text-zinc-500 mt-0.5">{filtered.length} exercises</p>
      </div>

      <div className="mb-4">
        <LibraryFilters
          split={split}
          muscle={muscle}
          equipment={equipment}
          search={search}
          onSplitChange={setSplit}
          onMuscleChange={setMuscle}
          onEquipmentChange={setEquipment}
          onSearchChange={setSearch}
        />
      </div>

      <LibraryGrid exercises={filtered} onAddToWorkout={openModal} />

      {/* Add to Workout Modal */}
      {pendingExercise && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 w-full max-w-sm mx-4 mb-4 sm:mb-0 space-y-4">
            <div>
              <h2 className="text-base font-bold text-zinc-100">Add to Workout</h2>
              <p className="text-sm text-zinc-400 mt-0.5 truncate">{pendingExercise.name}</p>
            </div>

            {addedMsg ? (
              <p className="text-center text-sm text-emerald-400 py-2">{addedMsg}</p>
            ) : (
              <>
                <div className="space-y-2">
                  {draftWorkouts.length > 0 && (
                    <>
                      {draftWorkouts.map((w) => (
                        <label
                          key={w.id}
                          className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                        >
                          <input
                            type="radio"
                            name="workout"
                            value={w.id}
                            checked={selectedWorkoutId === w.id}
                            onChange={() => setSelectedWorkoutId(w.id)}
                            className="accent-[#E8593C]"
                          />
                          <div>
                            <p className="text-sm font-semibold text-zinc-100">{w.name}</p>
                            <p className="text-[10px] text-zinc-500">{w.split} · {w.exercises.length} exercises</p>
                          </div>
                        </label>
                      ))}
                      <div className="border-t border-zinc-800 pt-2" />
                    </>
                  )}

                  {/* New workout option */}
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-zinc-800 transition-colors">
                    <input
                      type="radio"
                      name="workout"
                      value="__new__"
                      checked={selectedWorkoutId === '__new__'}
                      onChange={() => setSelectedWorkoutId('__new__')}
                      className="accent-[#E8593C]"
                    />
                    <span className="text-sm text-zinc-300">Create new workout</span>
                  </label>

                  {selectedWorkoutId === '__new__' && (
                    <input
                      type="text"
                      value={newWorkoutName}
                      onChange={(e) => setNewWorkoutName(e.target.value)}
                      placeholder="Workout name..."
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 ml-6"
                      autoFocus
                    />
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm font-semibold hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAdd}
                    className="flex-1 py-2 rounded-lg bg-[#E8593C] text-white text-sm font-semibold hover:bg-[#d44e33] transition-colors"
                  >
                    Add
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
