'use client';

import { SplitCategory } from '@/lib/types';

const SPLITS: Array<{ value: SplitCategory; label: string; color: string; active: string }> = [
  { value: 'PUSH', label: 'Push', color: 'border-blue-500/40 text-blue-400/50 hover:bg-blue-500/10', active: 'bg-blue-500 text-white border-blue-500' },
  { value: 'PULL', label: 'Pull', color: 'border-purple-500/40 text-purple-400/50 hover:bg-purple-500/10', active: 'bg-purple-500 text-white border-purple-500' },
  { value: 'LEGS', label: 'Legs', color: 'border-green-500/40 text-green-400/50 hover:bg-green-500/10', active: 'bg-green-500 text-white border-green-500' },
  { value: 'CORE', label: 'Core', color: 'border-amber-500/40 text-amber-400/50 hover:bg-amber-500/10', active: 'bg-amber-500 text-white border-amber-500' },
];

interface SplitSelectorProps {
  value: SplitCategory[];
  onChange: (splits: SplitCategory[]) => void;
}

export default function SplitSelector({ value, onChange }: SplitSelectorProps) {
  function toggle(split: SplitCategory) {
    const isActive = value.includes(split);
    // Prevent deselecting all — must keep at least one
    if (isActive && value.length === 1) return;
    const next = isActive ? value.filter((s) => s !== split) : [...value, split];
    onChange(next);
  }

  return (
    <div className="flex gap-2">
      {SPLITS.map((s) => {
        const isActive = value.includes(s.value);
        return (
          <button
            key={s.value}
            onClick={() => toggle(s.value)}
            className={`flex-1 py-2 rounded-lg border text-xs font-bold uppercase tracking-wide transition-colors ${
              isActive ? s.active : `bg-transparent ${s.color}`
            }`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
