// MOCK MODE: returning mockData — swap with real API in Phase 2
// This script fetches all exercises from wger and upserts them to Supabase.
// Run with: node scripts/import-exercises.mjs

const SUPABASE_URL = 'https://ahtpgdeideidwybcaqxi.supabase.co';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodHBnZGVpZGVpZHd5YmNhcXhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTUyNTgsImV4cCI6MjA5MzkzMTI1OH0.jtixZfk2uiwTHe5G4rEh93VsNvEXuycRJR5dKrcN4-s';

const WGER_BASE = 'https://wger.de/api/v2/exerciseinfo/?format=json&language=2&limit=100';

// ── Category → SplitCategory mapping ─────────────────────────────────────────
// wger category IDs observed in the API (language=2 English exercises):
//   8 = Arms, 9 = Legs, 10 = Abs, 11 = Chest, 12 = Back, 13 = Shoulders, 15 = Cardio
const CATEGORY_TO_SPLIT = {
  8: null,      // Arms — determined by primary muscle (see below)
  9: 'LEGS',
  10: 'CORE',
  11: 'PUSH',
  12: 'PULL',
  13: 'PUSH',
  14: 'LEGS',   // Calves (if present)
  15: 'CORE',   // Cardio — map to CORE as closest fit
};

// ── Muscle ID → MuscleGroup mapping ──────────────────────────────────────────
// Based on actual wger muscle IDs observed in the API:
//   1 = Biceps brachii, 2 = Anterior deltoid, 3 = Serratus anterior,
//   4 = Pectoralis major, 5 = Triceps brachii, 6 = Rectus abdominis,
//   7 = Gastrocnemius, 8 = Gluteus maximus, 9 = Trapezius,
//   10 = Quadriceps femoris, 11 = Biceps femoris, 12 = Latissimus dorsi,
//   13 = Brachialis, 14 = Obliquus externus abdominis, 15 = Soleus
const MUSCLE_ID_TO_GROUP = {
  1: 'BICEPS',
  2: 'FRONT_DELTS',
  3: 'CHEST',          // Serratus anterior — closest mapping is chest/push area
  4: 'CHEST',
  5: 'TRICEPS',
  6: 'ABS',
  7: 'CALVES',
  8: 'GLUTES',
  9: 'TRAPS',
  10: 'QUADS',
  11: 'HAMSTRINGS',
  12: 'LATS',
  13: 'FOREARMS',      // Brachialis → group with forearms/arms
  14: 'OBLIQUES',
  15: 'CALVES',        // Soleus
};

// ── Equipment ID → Equipment mapping ─────────────────────────────────────────
// Based on actual wger equipment IDs observed in the API:
//   1 = Barbell, 2 = SZ-Bar, 3 = Dumbbell, 4 = Gym mat, 5 = Swiss Ball,
//   6 = Pull-up bar, 7 = none (bodyweight), 8 = Bench, 9 = Incline bench,
//   10 = Kettlebell, 11 = Resistance band
const EQUIPMENT_ID_TO_TYPE = {
  1: 'BARBELL',
  2: 'BARBELL',         // SZ-Bar is an EZ/curl bar — map to barbell
  3: 'DUMBBELL',
  4: 'BODYWEIGHT',      // Gym mat
  5: 'BODYWEIGHT',      // Swiss Ball
  6: 'BODYWEIGHT',      // Pull-up bar
  7: 'BODYWEIGHT',      // none (bodyweight exercise)
  8: 'BODYWEIGHT',      // Bench — use bodyweight; context determines
  9: 'BODYWEIGHT',      // Incline bench
  10: 'KETTLEBELL',
  11: 'RESISTANCE_BAND',
  12: 'BODYWEIGHT',     // none
  13: 'RESISTANCE_BAND',// Resistance band (alt ID)
};

function mapSplit(categoryId, primaryMuscle) {
  if (categoryId === 8) {
    // Arms: check primary muscle to decide PUSH vs PULL
    return primaryMuscle === 'TRICEPS' ? 'PUSH' : 'PULL';
  }
  return CATEGORY_TO_SPLIT[categoryId] ?? 'CORE';
}

function mapMuscle(muscleId) {
  return MUSCLE_ID_TO_GROUP[muscleId] ?? null;
}

function mapEquipment(equipmentIds) {
  // Prefer the most "specific" equipment — barbell > dumbbell > kettlebell > cable > machine > resistance_band > bodyweight
  const priority = ['BARBELL', 'DUMBBELL', 'KETTLEBELL', 'CABLE', 'MACHINE', 'RESISTANCE_BAND', 'SMITH_MACHINE', 'BODYWEIGHT'];
  const mapped = equipmentIds.map((id) => EQUIPMENT_ID_TO_TYPE[id]).filter(Boolean);
  if (mapped.length === 0) return 'BODYWEIGHT';
  // Return highest priority equipment found
  for (const p of priority) {
    if (mapped.includes(p)) return p;
  }
  return 'BODYWEIGHT';
}

function getEnglishName(exercise) {
  // translations is an array; language=2 in query pre-filters but some have no translation
  const t = exercise.translations?.find((tr) => tr.language === 2 && tr.name && tr.name.trim());
  return t?.name?.trim() ?? null;
}

function mapExercise(ex) {
  const name = getEnglishName(ex);
  if (!name) return null;

  const primaryMuscleId = ex.muscles?.[0]?.id;
  if (!primaryMuscleId) return null;

  const primaryMuscle = mapMuscle(primaryMuscleId);
  if (!primaryMuscle) return null;

  const categoryId = ex.category?.id;
  const split = mapSplit(categoryId, primaryMuscle);

  const secondaryMuscleIds = (ex.muscles_secondary ?? []).map((m) => m.id);
  const secondaryMuscles = [...new Set(
    secondaryMuscleIds.map(mapMuscle).filter(Boolean).filter((m) => m !== primaryMuscle)
  )];

  const equipmentIds = (ex.equipment ?? []).map((e) => e.id);
  const equipment = mapEquipment(equipmentIds);

  return {
    id: `ex_${ex.id}`,
    name,
    split,
    primary_muscle: primaryMuscle,
    secondary_muscles: secondaryMuscles,
    equipment,
    difficulty: 'INTERMEDIATE',
    default_sets: 3,
    default_reps: '8-12',
    notes: null,
  };
}

async function fetchAllPages() {
  const all = [];
  let url = `${WGER_BASE}&offset=0`;
  let page = 0;

  while (url) {
    page++;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`wger fetch failed: ${res.status} ${res.statusText}`);
    const data = await res.json();
    const results = data.results ?? [];
    all.push(...results);
    console.log(`Fetched page ${page}, ${all.length} exercises total (of ${data.count})`);
    url = data.next ?? null;
  }
  return all;
}

async function upsertBatch(batch) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/exercises`, {
    method: 'POST',
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(batch),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase upsert failed: ${res.status} ${text}`);
  }
}

async function main() {
  console.log('=== wger → Supabase Exercise Import ===\n');

  // Step 1: Fetch all pages from wger
  console.log('Fetching exercises from wger API...');
  const raw = await fetchAllPages();
  console.log(`\nTotal raw exercises fetched: ${raw.length}`);

  // Step 2: Map to our schema
  const mapped = raw.map(mapExercise).filter(Boolean);
  console.log(`Mapped (with valid name + primary muscle): ${mapped.length}`);

  // Deduplicate by id (same exercise may appear multiple times if pages overlap)
  const seen = new Set();
  const deduped = mapped.filter((ex) => {
    if (seen.has(ex.id)) return false;
    seen.add(ex.id);
    return true;
  });
  console.log(`After deduplication: ${deduped.length}`);

  // Step 3: Upsert in batches of 50
  const BATCH_SIZE = 50;
  let upserted = 0;
  for (let i = 0; i < deduped.length; i += BATCH_SIZE) {
    const batch = deduped.slice(i, i + BATCH_SIZE);
    await upsertBatch(batch);
    upserted += batch.length;
    console.log(`Upserted batch of ${batch.length} (${upserted}/${deduped.length} total)`);
  }

  console.log(`\n=== Import complete: ${upserted} exercises upserted to Supabase ===`);
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
