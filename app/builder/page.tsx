'use client';

import { useState } from 'react';
import PlanBuilder from '@/components/builder/PlanBuilder';
import MuscleOverlay from '@/components/diagram/MuscleOverlay';

export default function BuilderPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <main className="max-w-5xl mx-auto px-4 pt-6 pb-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-100">Plan Builder</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Create and manage your workout plans</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* PlanBuilder takes up all available space */}
        <div className="flex-1 min-w-0">
          <PlanBuilder onSelectWorkout={setSelectedId} />
        </div>

        {/* Diagram panel — stacks below on mobile, 220px column on desktop */}
        <div className="lg:w-[220px] shrink-0">
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              Muscle Coverage
            </p>
            <MuscleOverlay workoutId={selectedId} />
          </div>
        </div>
      </div>
    </main>
  );
}
