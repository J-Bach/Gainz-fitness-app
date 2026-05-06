'use client';

import { useState } from 'react';
import { useWorkoutStore } from '@/lib/store/workoutStore';
import { deriveCoverage } from '@/lib/utils/coverage';
import MuscleDiagram from './MuscleDiagram';
import DiagramToggle from './DiagramToggle';

export interface MuscleOverlayProps {
  workoutId: string | null;
}

export default function MuscleOverlay({ workoutId }: MuscleOverlayProps) {
  const [view, setView] = useState<'front' | 'back'>('front');
  const workouts = useWorkoutStore((s) => s.workouts);

  const workout = workoutId ? workouts.find((w) => w.id === workoutId) ?? null : null;
  const coverage = deriveCoverage(workout?.exercises ?? []);

  return (
    <div className="flex flex-col gap-3">
      <DiagramToggle view={view} onChange={setView} />

      <div className="w-full" style={{ maxHeight: 340, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 180 }}>
          <MuscleDiagram coverage={coverage} view={view} />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4">
        <span className="flex items-center gap-1.5 text-[10px] text-zinc-400">
          <span
            className="inline-block rounded-full"
            style={{ width: 8, height: 8, background: '#E8593C', flexShrink: 0 }}
          />
          Primary
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-zinc-400">
          <span
            className="inline-block rounded-full"
            style={{ width: 8, height: 8, background: '#EF9F27', flexShrink: 0 }}
          />
          Secondary
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-zinc-400">
          <span
            className="inline-block rounded-full"
            style={{ width: 8, height: 8, background: '#4B4B4B', flexShrink: 0 }}
          />
          Untargeted
        </span>
      </div>
    </div>
  );
}
