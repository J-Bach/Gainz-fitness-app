'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWorkoutStore } from '@/lib/store/workoutStore';
import { usePRStore } from '@/lib/store/prStore';
import { usePrefsStore } from '@/lib/store/prefsStore';
import { PREntry } from '@/lib/types';
import { deriveAutoPRs } from '@/lib/utils/prUtils';

function generateId(): string {
  return `pr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Returns the ISO date string "YYYY-MM-DD" for a given Date
function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Today as "YYYY-MM-DD"
const TODAY = toDateString(new Date());

export default function CalendarPage() {
  const { workouts, init: initWorkouts, updateWorkout } = useWorkoutStore();
  const { prs, init: initPRs, addPR, deletePR } = usePRStore();
  const { prefs, init: initPrefs } = usePrefsStore();

  // ── Calendar state ──────────────────────────────────────────────
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Modal state: 'assign' = pick a draft plan, 'detail' = show assigned workout
  const [modalMode, setModalMode] = useState<'assign' | 'detail' | null>(null);

  // PR override state: exerciseId → expanded inline form
  const [expandedOverride, setExpandedOverride] = useState<string | null>(null);
  const [overrideInput, setOverrideInput] = useState('');

  useEffect(() => {
    initWorkouts();
    initPRs();
    initPrefs();
  }, [initWorkouts, initPRs, initPrefs]);

  // ── Calendar computation ─────────────────────────────────────────
  const calendarDays = useMemo(() => {
    const first = new Date(year, month, 1);
    const startDow = (first.getDay() + 6) % 7; // Mon-based
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: Array<{ date: string | null; day: number | null }> = [];
    for (let i = 0; i < startDow; i++) cells.push({ date: null, day: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      cells.push({ date: toDateString(dateObj), day: d });
    }
    return cells;
  }, [year, month]);

  // Map date string → workout (only one per date; first match wins)
  const workoutByDate = useMemo(() => {
    const map: Record<string, typeof workouts[number]> = {};
    for (const w of workouts) {
      if (w.date && (w.status === 'LOCKED' || w.status === 'COMPLETED') && !map[w.date]) {
        map[w.date] = w;
      }
    }
    return map;
  }, [workouts]);

  const draftWorkouts = useMemo(() => workouts.filter((w) => w.status === 'DRAFT'), [workouts]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const monthLabel = new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });

  function handleDayTap(date: string) {
    setSelectedDate(date);
    const assigned = workoutByDate[date];
    if (assigned) {
      setModalMode('detail');
    } else {
      setModalMode('assign');
    }
  }

  function handleAssign(workoutId: string) {
    if (!selectedDate) return;
    updateWorkout(workoutId, { date: selectedDate, status: 'LOCKED' });
    setModalMode(null);
    setSelectedDate(null);
  }

  function handleMarkDone(workoutId: string) {
    updateWorkout(workoutId, { status: 'COMPLETED', lockedAt: new Date().toISOString() });
    setModalMode(null);
    setSelectedDate(null);
  }

  function handleUnschedule(workoutId: string) {
    updateWorkout(workoutId, { date: null, status: 'DRAFT' });
    setModalMode(null);
    setSelectedDate(null);
  }

  function closeModal() {
    setModalMode(null);
    setSelectedDate(null);
  }

  // ── PR computation ───────────────────────────────────────────────
  const autoPRs = useMemo(() => deriveAutoPRs(workouts), [workouts]);

  // Manual overrides: latest PR per exerciseId
  const manualOverrideByExercise = useMemo(() => {
    const map: Record<string, PREntry> = {};
    for (const pr of prs) {
      const existing = map[pr.exerciseId];
      if (!existing || new Date(pr.date) > new Date(existing.date)) {
        map[pr.exerciseId] = pr;
      }
    }
    return map;
  }, [prs]);

  function handleSaveOverride(exerciseId: string, exerciseName: string) {
    const val = parseFloat(overrideInput);
    if (isNaN(val) || val <= 0) return;
    const entry: PREntry = {
      id: generateId(),
      exerciseId,
      exerciseName,
      weight: val,
      unitSystem: prefs.unitSystem,
      date: TODAY,
    };
    addPR(entry);
    setExpandedOverride(null);
    setOverrideInput('');
  }

  function handleClearOverride(exerciseId: string) {
    const override = manualOverrideByExercise[exerciseId];
    if (override) deletePR(override.id);
  }

  const selectedWorkout = selectedDate ? workoutByDate[selectedDate] : null;

  return (
    <main className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-8">

      {/* ── Section 1: Monthly Calendar ─────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-zinc-100">Progress</h1>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-zinc-100">{monthLabel}</span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_HEADERS.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-zinc-500 uppercase py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((cell, i) => {
              if (!cell.date || !cell.day) {
                return <div key={`empty-${i}`} />;
              }
              const isToday = cell.date === TODAY;
              const isSelected = cell.date === selectedDate;
              const assigned = workoutByDate[cell.date];
              const isPast = cell.date <= TODAY;

              return (
                <button
                  key={cell.date}
                  onClick={() => handleDayTap(cell.date!)}
                  className={`min-h-[56px] rounded-lg p-1 flex flex-col items-start text-left transition-colors ${
                    isSelected
                      ? 'bg-zinc-700 border border-zinc-600'
                      : isToday
                      ? 'border border-[#E8593C] bg-zinc-800'
                      : 'border border-transparent hover:bg-zinc-800'
                  }`}
                >
                  <span className={`text-xs font-medium leading-none ${
                    isToday ? 'text-[#E8593C]' : 'text-zinc-400'
                  }`}>
                    {cell.day}
                  </span>

                  {assigned && assigned.status === 'LOCKED' && (
                    <>
                      <span className="mt-1 block w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <span className="mt-0.5 block truncate text-[9px] leading-tight text-blue-300 w-full">
                        {assigned.name}
                      </span>
                      {isPast && (
                        <span className="mt-0.5 text-[8px] font-bold text-zinc-400 uppercase tracking-wide">
                          ✓ Done?
                        </span>
                      )}
                    </>
                  )}

                  {assigned && assigned.status === 'COMPLETED' && (
                    <>
                      <span className="mt-1 block w-2 h-2 rounded-full bg-[#E8593C] shrink-0" />
                      <span className="mt-0.5 block truncate text-[9px] leading-tight text-[#E8593C]/80 w-full">
                        {assigned.name}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 2: Auto-PR Tracker ──────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-zinc-100 mb-3">Personal Records</h2>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          {autoPRs.length === 0 ? (
            <p className="text-center text-sm text-zinc-500 py-4">
              Log weights in the Builder to auto-track your PRs.
            </p>
          ) : (
            <div className="space-y-1">
              {autoPRs.map((autoPR) => {
                const override = manualOverrideByExercise[autoPR.exerciseId];
                const effectiveWeight = override ? override.weight : autoPR.weight;
                const effectiveDate = override ? override.date : autoPR.date;
                const isExpanded = expandedOverride === autoPR.exerciseId;

                return (
                  <div key={autoPR.exerciseId}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors">
                      {/* Exercise name */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-100 truncate">{autoPR.exerciseName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-zinc-300 font-bold tabular-nums">
                            {effectiveWeight} {prefs.unitSystem}
                          </span>
                          {effectiveDate && (
                            <span className="text-[10px] text-zinc-500">{effectiveDate.slice(0, 10)}</span>
                          )}
                          {override ? (
                            <span className="text-[9px] font-bold uppercase tracking-wide text-amber-500 bg-amber-500/10 rounded px-1 py-0.5">
                              override
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase tracking-wide text-zinc-500 bg-zinc-700 rounded px-1 py-0.5">
                              auto
                            </span>
                          )}
                          {override && (
                            <button
                              onClick={() => handleClearOverride(autoPR.exerciseId)}
                              className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors underline"
                            >
                              clear override
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Pencil icon to open inline override form */}
                      <button
                        onClick={() => {
                          if (isExpanded) {
                            setExpandedOverride(null);
                            setOverrideInput('');
                          } else {
                            setExpandedOverride(autoPR.exerciseId);
                            setOverrideInput('');
                          }
                        }}
                        className="shrink-0 p-1 rounded text-zinc-600 hover:text-zinc-300 transition-colors"
                        aria-label="Override PR"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>

                    {/* Inline override form */}
                    {isExpanded && (
                      <div className="mx-3 mb-2 flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={overrideInput}
                          onChange={(e) => setOverrideInput(e.target.value)}
                          placeholder={`${effectiveWeight}`}
                          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 tabular-nums"
                          autoFocus
                        />
                        <span className="text-xs text-zinc-500 shrink-0">{prefs.unitSystem}</span>
                        <button
                          onClick={() => handleSaveOverride(autoPR.exerciseId, autoPR.exerciseName)}
                          disabled={!overrideInput || isNaN(parseFloat(overrideInput))}
                          className="px-3 py-1.5 rounded-lg bg-[#E8593C] hover:bg-[#d44e33] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Assignment Modal ─────────────────────────────────────── */}
      {modalMode === 'assign' && selectedDate && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-zinc-900 border border-zinc-700 rounded-t-2xl w-full max-w-lg p-5 pb-24 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-100">Schedule Workout</h2>
                <p className="text-xs text-zinc-500 mt-0.5">{selectedDate}</p>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {draftWorkouts.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-4">
                No workout plans yet — create one in the Builder.
              </p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {draftWorkouts.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => handleAssign(w.id)}
                    className="w-full text-left px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 hover:border-zinc-500 transition-colors"
                  >
                    <p className="text-sm font-semibold text-zinc-100">{w.name}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {w.splits.join(' · ')} · {w.exercises.length} exercise{w.exercises.length !== 1 ? 's' : ''}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Detail Modal (assigned workout) ─────────────────────── */}
      {modalMode === 'detail' && selectedDate && selectedWorkout && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-zinc-900 border border-zinc-700 rounded-t-2xl w-full max-w-lg p-5 pb-24 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-zinc-100">{selectedWorkout.name}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">{selectedDate}</p>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Workout info */}
            <div className="flex gap-3">
              <span className="text-xs text-zinc-400 bg-zinc-800 rounded-lg px-2.5 py-1">
                {selectedWorkout.splits.join(' · ')}
              </span>
              <span className="text-xs text-zinc-400 bg-zinc-800 rounded-lg px-2.5 py-1">
                {selectedWorkout.exercises.length} exercise{selectedWorkout.exercises.length !== 1 ? 's' : ''}
              </span>
              <span className={`text-xs rounded-lg px-2.5 py-1 font-semibold ${
                selectedWorkout.status === 'COMPLETED'
                  ? 'text-[#E8593C] bg-[#E8593C]/10'
                  : 'text-blue-400 bg-blue-500/10'
              }`}>
                {selectedWorkout.status}
              </span>
            </div>

            {/* Exercise list */}
            {selectedWorkout.exercises.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {selectedWorkout.exercises.slice().sort((a, b) => a.order - b.order).map((ex) => (
                  <div key={ex.exerciseId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-zinc-800">
                    <span className="text-xs text-zinc-300 flex-1 truncate">{ex.name}</span>
                    <span className="text-[10px] text-zinc-500 shrink-0">{ex.targetSets}×{ex.targetReps}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleUnschedule(selectedWorkout.id)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-semibold hover:bg-zinc-700 transition-colors"
              >
                Unschedule
              </button>
              {selectedWorkout.status === 'LOCKED' && (
                <button
                  onClick={() => handleMarkDone(selectedWorkout.id)}
                  className="flex-1 py-2 rounded-xl bg-[#E8593C] text-white text-sm font-bold hover:bg-[#d44e33] transition-colors"
                >
                  ✓ Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
