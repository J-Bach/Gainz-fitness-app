'use client';

import { SplitCategory } from '@/lib/types';

const SPLITS: Array<{ value: SplitCategory; label: string; color: string; active: string }> = [
  { value: 'PUSH', label: 'Push', color: 'border-blue-500/40 text-blue-400 hover:bg-blue-500/10', active: 'bg-blue-500 text-white border-blue-500' },
  { value: 'PULL', label: 'Pull', color: 'border-purple-500/40 text-purple-400 hover:bg-purple-500/10', active: 'bg-purple-500 text-white border-purple-500' },
  { value: 'LEGS', label: 'Legs', color: 'border-green-500/40 text-green-400 hover:bg-green-500/10', active: 'bg-green-500 text-white border-green-500' },
  { value: 'CORE', label: 'Core', color: 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10', active: 'bg-amber-500 text-white border-amber-500' },
];

interface SplitSelectorProps {
  value: SplitCategory;
  onChange: (split: SplitCategory) => void;
}

export default function SplitSelector({ value, onChange }: SplitSelectorProps) {
  return (
    <div className="flex gap-2">
      {SPLITS.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={`flex-1 py-2 rounded-lg border text-xs font-bold uppercase tracking-wide transition-colors ${
            value === s.value ? s.active : `bg-transparent ${s.color}`
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
