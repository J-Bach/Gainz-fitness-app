'use client';

import { MuscleCoverageMap } from '@/lib/utils/coverage';

export interface MuscleDiagramProps {
  coverage: MuscleCoverageMap;
  view: 'front' | 'back';
}

function muscleStyle(
  id: string,
  coverage: MuscleCoverageMap,
  view: 'front' | 'back'
): React.CSSProperties {
  // Determine which MuscleGroup keys map to this SVG id in this view
  // We look at coverage by scanning MUSCLE_SVG_IDS-equivalent logic inline
  // to avoid importing types that already live in lib/types
  const fill = getMuscleColor(id, coverage, view);
  const opacity = getMuscleOpacity(id, coverage, view);
  return {
    fill,
    opacity,
    transition: 'fill 0.2s ease, opacity 0.2s ease',
  };
}

// Map SVG ids to MuscleGroup keys (mirrors MUSCLE_SVG_IDS in lib/types.ts)
const SVG_ID_TO_MUSCLE: Record<string, string> = {
  'svg-chest': 'CHEST',
  'svg-front-delts': 'FRONT_DELTS',
  'svg-side-delts-front': 'SIDE_DELTS',
  'svg-side-delts-back': 'SIDE_DELTS',
  'svg-rear-delts': 'REAR_DELTS',
  'svg-biceps': 'BICEPS',
  'svg-triceps': 'TRICEPS',
  'svg-forearms-front': 'FOREARMS',
  'svg-forearms-back': 'FOREARMS',
  'svg-traps': 'TRAPS',
  'svg-lats': 'LATS',
  'svg-rhomboids': 'RHOMBOIDS',
  'svg-lower-back': 'LOWER_BACK',
  'svg-abs': 'ABS',
  'svg-obliques-front': 'OBLIQUES',
  'svg-obliques-back': 'OBLIQUES',
  'svg-quads': 'QUADS',
  'svg-hamstrings': 'HAMSTRINGS',
  'svg-glutes': 'GLUTES',
  'svg-hip-flexors': 'HIP_FLEXORS',
  'svg-adductors': 'ADDUCTORS',
  'svg-calves-front': 'CALVES',
  'svg-calves-back': 'CALVES',
};

function getMuscleColor(id: string, coverage: MuscleCoverageMap, _view: 'front' | 'back'): string {
  const muscle = SVG_ID_TO_MUSCLE[id] as keyof MuscleCoverageMap | undefined;
  if (!muscle) return '#4B4B4B';
  const level = coverage[muscle];
  if (level === 'primary') return '#E8593C';
  if (level === 'secondary') return '#EF9F27';
  return '#4B4B4B';
}

function getMuscleOpacity(id: string, coverage: MuscleCoverageMap, _view: 'front' | 'back'): number {
  const muscle = SVG_ID_TO_MUSCLE[id] as keyof MuscleCoverageMap | undefined;
  if (!muscle) return 0.5;
  const level = coverage[muscle];
  if (level === 'primary') return 0.9;
  if (level === 'secondary') return 0.75;
  return 0.5;
}

function ms(id: string, coverage: MuscleCoverageMap, view: 'front' | 'back') {
  return muscleStyle(id, coverage, view);
}

export default function MuscleDiagram({ coverage, view }: MuscleDiagramProps) {
  if (view === 'front') {
    return (
      <svg
        viewBox="0 0 200 400"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="Front body muscle diagram"
      >
        {/* ── Body outline ── */}
        {/* Head */}
        <circle cx="100" cy="30" r="22" fill="#27272a" />
        {/* Neck */}
        <rect x="92" y="50" width="16" height="15" fill="#27272a" />
        {/* Torso */}
        <path
          d="M60,65 L65,200 L135,200 L140,65 C130,62 118,60 100,60 C82,60 70,62 60,65 Z"
          fill="#27272a"
        />
        {/* Left upper arm */}
        <rect x="44" y="68" width="16" height="62" rx="8" fill="#27272a" />
        {/* Right upper arm */}
        <rect x="140" y="68" width="16" height="62" rx="8" fill="#27272a" />
        {/* Left forearm */}
        <rect x="46" y="132" width="14" height="50" rx="7" fill="#27272a" />
        {/* Right forearm */}
        <rect x="140" y="132" width="14" height="50" rx="7" fill="#27272a" />
        {/* Left thigh */}
        <rect x="68" y="200" width="30" height="70" rx="12" fill="#27272a" />
        {/* Right thigh */}
        <rect x="102" y="200" width="30" height="70" rx="12" fill="#27272a" />
        {/* Left lower leg */}
        <rect x="70" y="272" width="26" height="80" rx="10" fill="#27272a" />
        {/* Right lower leg */}
        <rect x="104" y="272" width="26" height="80" rx="10" fill="#27272a" />

        {/* ── Muscle regions (front) ── */}

        {/* Chest — two pec ellipses */}
        <g id="svg-chest" style={ms('svg-chest', coverage, view)}>
          <ellipse cx="82" cy="100" rx="18" ry="15" />
          <ellipse cx="118" cy="100" rx="18" ry="15" />
        </g>

        {/* Front delts */}
        <g id="svg-front-delts" style={ms('svg-front-delts', coverage, view)}>
          <ellipse cx="63" cy="78" rx="10" ry="8" />
          <ellipse cx="137" cy="78" rx="10" ry="8" />
        </g>

        {/* Side delts front */}
        <g id="svg-side-delts-front" style={ms('svg-side-delts-front', coverage, view)}>
          <ellipse cx="52" cy="78" rx="6" ry="5" />
          <ellipse cx="148" cy="78" rx="6" ry="5" />
        </g>

        {/* Biceps */}
        <g id="svg-biceps" style={ms('svg-biceps', coverage, view)}>
          <ellipse cx="52" cy="110" rx="8" ry="18" />
          <ellipse cx="148" cy="110" rx="8" ry="18" />
        </g>

        {/* Forearms front */}
        <g id="svg-forearms-front" style={ms('svg-forearms-front', coverage, view)}>
          <ellipse cx="53" cy="155" rx="7" ry="18" />
          <ellipse cx="147" cy="155" rx="7" ry="18" />
        </g>

        {/* Abs — 6 rounded rects, 3 rows × 2 cols */}
        <g id="svg-abs" style={ms('svg-abs', coverage, view)}>
          <rect x="86" y="122" width="13" height="12" rx="3" />
          <rect x="101" y="122" width="13" height="12" rx="3" />
          <rect x="86" y="138" width="13" height="12" rx="3" />
          <rect x="101" y="138" width="13" height="12" rx="3" />
          <rect x="86" y="154" width="13" height="12" rx="3" />
          <rect x="101" y="154" width="13" height="12" rx="3" />
        </g>

        {/* Obliques front */}
        <g id="svg-obliques-front" style={ms('svg-obliques-front', coverage, view)}>
          <ellipse cx="72" cy="155" rx="8" ry="20" />
          <ellipse cx="128" cy="155" rx="8" ry="20" />
        </g>

        {/* Hip flexors */}
        <g id="svg-hip-flexors" style={ms('svg-hip-flexors', coverage, view)}>
          <ellipse cx="83" cy="210" rx="10" ry="8" />
          <ellipse cx="117" cy="210" rx="10" ry="8" />
        </g>

        {/* Quads */}
        <g id="svg-quads" style={ms('svg-quads', coverage, view)}>
          <ellipse cx="78" cy="240" rx="16" ry="35" />
          <ellipse cx="122" cy="240" rx="16" ry="35" />
        </g>

        {/* Adductors */}
        <g id="svg-adductors" style={ms('svg-adductors', coverage, view)}>
          <ellipse cx="90" cy="245" rx="8" ry="28" />
          <ellipse cx="110" cy="245" rx="8" ry="28" />
        </g>

        {/* Calves front */}
        <g id="svg-calves-front" style={ms('svg-calves-front', coverage, view)}>
          <ellipse cx="78" cy="330" rx="10" ry="22" />
          <ellipse cx="122" cy="330" rx="10" ry="22" />
        </g>
      </svg>
    );
  }

  // Back view
  return (
    <svg
      viewBox="0 0 200 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-label="Back body muscle diagram"
    >
      {/* ── Body outline (back) ── */}
      {/* Head */}
      <circle cx="100" cy="30" r="22" fill="#27272a" />
      {/* Neck */}
      <rect x="92" y="50" width="16" height="15" fill="#27272a" />
      {/* Torso */}
      <path
        d="M60,65 L65,200 L135,200 L140,65 C130,62 118,60 100,60 C82,60 70,62 60,65 Z"
        fill="#27272a"
      />
      {/* Left upper arm */}
      <rect x="44" y="68" width="16" height="62" rx="8" fill="#27272a" />
      {/* Right upper arm */}
      <rect x="140" y="68" width="16" height="62" rx="8" fill="#27272a" />
      {/* Left forearm */}
      <rect x="46" y="132" width="14" height="50" rx="7" fill="#27272a" />
      {/* Right forearm */}
      <rect x="140" y="132" width="14" height="50" rx="7" fill="#27272a" />
      {/* Left thigh */}
      <rect x="68" y="200" width="30" height="70" rx="12" fill="#27272a" />
      {/* Right thigh */}
      <rect x="102" y="200" width="30" height="70" rx="12" fill="#27272a" />
      {/* Left lower leg */}
      <rect x="70" y="272" width="26" height="80" rx="10" fill="#27272a" />
      {/* Right lower leg */}
      <rect x="104" y="272" width="26" height="80" rx="10" fill="#27272a" />

      {/* ── Muscle regions (back) ── */}

      {/* Traps */}
      <g id="svg-traps" style={ms('svg-traps', coverage, view)}>
        <path d="M75,68 C85,95 100,100 115,95 C130,90 125,68 115,68 C108,82 92,82 85,68 Z" />
      </g>

      {/* Rear delts */}
      <g id="svg-rear-delts" style={ms('svg-rear-delts', coverage, view)}>
        <ellipse cx="63" cy="78" rx="10" ry="8" />
        <ellipse cx="137" cy="78" rx="10" ry="8" />
      </g>

      {/* Side delts back */}
      <g id="svg-side-delts-back" style={ms('svg-side-delts-back', coverage, view)}>
        <ellipse cx="52" cy="78" rx="6" ry="5" />
        <ellipse cx="148" cy="78" rx="6" ry="5" />
      </g>

      {/* Rhomboids */}
      <g id="svg-rhomboids" style={ms('svg-rhomboids', coverage, view)}>
        <ellipse cx="88" cy="110" rx="10" ry="14" />
        <ellipse cx="112" cy="110" rx="10" ry="14" />
      </g>

      {/* Lats */}
      <g id="svg-lats" style={ms('svg-lats', coverage, view)}>
        <path d="M62,95 L68,185 L85,185 L78,100 Z" />
        <path d="M138,95 L132,185 L115,185 L122,100 Z" />
      </g>

      {/* Lower back */}
      <g id="svg-lower-back" style={ms('svg-lower-back', coverage, view)}>
        <ellipse cx="100" cy="175" rx="20" ry="18" />
      </g>

      {/* Triceps */}
      <g id="svg-triceps" style={ms('svg-triceps', coverage, view)}>
        <ellipse cx="52" cy="110" rx="8" ry="18" />
        <ellipse cx="148" cy="110" rx="8" ry="18" />
      </g>

      {/* Forearms back */}
      <g id="svg-forearms-back" style={ms('svg-forearms-back', coverage, view)}>
        <ellipse cx="53" cy="155" rx="7" ry="18" />
        <ellipse cx="147" cy="155" rx="7" ry="18" />
      </g>

      {/* Obliques back */}
      <g id="svg-obliques-back" style={ms('svg-obliques-back', coverage, view)}>
        <ellipse cx="72" cy="170" rx="8" ry="20" />
        <ellipse cx="128" cy="170" rx="8" ry="20" />
      </g>

      {/* Glutes */}
      <g id="svg-glutes" style={ms('svg-glutes', coverage, view)}>
        <ellipse cx="83" cy="215" rx="20" ry="20" />
        <ellipse cx="117" cy="215" rx="20" ry="20" />
      </g>

      {/* Hamstrings */}
      <g id="svg-hamstrings" style={ms('svg-hamstrings', coverage, view)}>
        <ellipse cx="80" cy="262" rx="15" ry="35" />
        <ellipse cx="120" cy="262" rx="15" ry="35" />
      </g>

      {/* Calves back */}
      <g id="svg-calves-back" style={ms('svg-calves-back', coverage, view)}>
        <ellipse cx="78" cy="335" rx="11" ry="25" />
        <ellipse cx="122" cy="335" rx="11" ry="25" />
      </g>
    </svg>
  );
}
