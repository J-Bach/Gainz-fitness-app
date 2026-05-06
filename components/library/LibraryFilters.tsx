'use client';

import { SplitCategory, MuscleGroup, Equipment } from '@/lib/types';

const SPLIT_TABS: Array<SplitCategory | 'ALL'> = ['ALL', 'PUSH', 'PULL', 'LEGS', 'CORE'];

const SPLIT_TAB_COLORS: Record<SplitCategory | 'ALL', string> = {
  ALL: 'bg-zinc-700 text-zinc-100',
  PUSH: 'bg-blue-500 text-white',
  PULL: 'bg-purple-500 text-white',
  LEGS: 'bg-green-500 text-white',
  CORE: 'bg-amber-500 text-white',
};

const SPLIT_TAB_INACTIVE: Record<SplitCategory | 'ALL', string> = {
  ALL: 'text-zinc-400 hover:text-zinc-200',
  PUSH: 'text-blue-400 hover:text-blue-300',
  PULL: 'text-purple-400 hover:text-purple-300',
  LEGS: 'text-green-400 hover:text-green-300',
  CORE: 'text-amber-400 hover:text-amber-300',
};

const MUSCLE_OPTIONS: Array<{ value: MuscleGroup | ''; label: string }> = [
  { value: '', label: 'All Muscles' },
  { value: 'CHEST', label: 'Chest' },
  { value: 'FRONT_DELTS', label: 'Front Delts' },
  { value: 'SIDE_DELTS', label: 'Side Delts' },
  { value: 'REAR_DELTS', label: 'Rear Delts' },
  { value: 'TRICEPS', label: 'Triceps' },
  { value: 'BICEPS', label: 'Biceps' },
  { value: 'FOREARMS', label: 'Forearms' },
  { value: 'TRAPS', label: 'Traps' },
  { value: 'LATS', label: 'Lats' },
  { value: 'RHOMBOIDS', label: 'Rhomboids' },
  { value: 'LOWER_BACK', label: 'Lower Back' },
  { value: 'ABS', label: 'Abs' },
  { value: 'OBLIQUES', label: 'Obliques' },
  { value: 'QUADS', label: 'Quads' },
  { value: 'HAMSTRINGS', label: 'Hamstrings' },
  { value: 'GLUTES', label: 'Glutes' },
  { value: 'HIP_FLEXORS', label: 'Hip Flexors' },
  { value: 'ADDUCTORS', label: 'Adductors' },
  { value: 'CALVES', label: 'Calves' },
];

const EQUIPMENT_OPTIONS: Array<{ value: Equipment | ''; label: string }> = [
  { value: '', label: 'All Equipment' },
  { value: 'BARBELL', label: 'Barbell' },
  { value: 'DUMBBELL', label: 'Dumbbell' },
  { value: 'CABLE', label: 'Cable' },
  { value: 'MACHINE', label: 'Machine' },
  { value: 'BODYWEIGHT', label: 'Bodyweight' },
  { value: 'KETTLEBELL', label: 'Kettlebell' },
  { value: 'RESISTANCE_BAND', label: 'Resistance Band' },
  { value: 'SMITH_MACHINE', label: 'Smith Machine' },
];

interface LibraryFiltersProps {
  split: SplitCategory | 'ALL';
  muscle: MuscleGroup | '';
  equipment: Equipment | '';
  search: string;
  onSplitChange: (s: SplitCategory | 'ALL') => void;
  onMuscleChange: (m: MuscleGroup | '') => void;
  onEquipmentChange: (e: Equipment | '') => void;
  onSearchChange: (q: string) => void;
}

export default function LibraryFilters({
  split,
  muscle,
  equipment,
  search,
  onSplitChange,
  onMuscleChange,
  onEquipmentChange,
  onSearchChange,
}: LibraryFiltersProps) {
  return (
    <div className="space-y-3 pb-3 border-b border-zinc-800">
      {/* Split tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {SPLIT_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onSplitChange(tab)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
              split === tab
                ? SPLIT_TAB_COLORS[tab]
                : `bg-zinc-800 ${SPLIT_TAB_INACTIVE[tab]}`
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search exercises..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
        />
      </div>

      {/* Dropdowns */}
      <div className="flex gap-2">
        <select
          value={muscle}
          onChange={(e) => onMuscleChange(e.target.value as MuscleGroup | '')}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500"
        >
          {MUSCLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={equipment}
          onChange={(e) => onEquipmentChange(e.target.value as Equipment | '')}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500"
        >
          {EQUIPMENT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
