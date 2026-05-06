'use client';

export interface DiagramToggleProps {
  view: 'front' | 'back';
  onChange: (view: 'front' | 'back') => void;
}

export default function DiagramToggle({ view, onChange }: DiagramToggleProps) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-[#E8593C] w-full">
      <button
        type="button"
        onClick={() => onChange('front')}
        className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${
          view === 'front'
            ? 'bg-zinc-700 text-zinc-100'
            : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
        }`}
      >
        Front
      </button>
      <button
        type="button"
        onClick={() => onChange('back')}
        className={`flex-1 py-1.5 text-xs font-semibold transition-colors ${
          view === 'back'
            ? 'bg-zinc-700 text-zinc-100'
            : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
        }`}
      >
        Back
      </button>
    </div>
  );
}
