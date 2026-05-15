-- workout_plans: stores each user's workout plans
-- exercises stored as JSONB to avoid complex joins
create table if not exists workout_plans (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  splits text[] not null default '{}',
  status text not null default 'DRAFT',
  date text,
  exercises jsonb not null default '[]',
  created_at text not null,
  locked_at text
);

alter table workout_plans enable row level security;

create policy "Users manage own workout_plans"
  on workout_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- pr_entries: manual PR overrides per user
create table if not exists pr_entries (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  exercise_id text not null,
  exercise_name text not null,
  weight float not null,
  unit_system text not null default 'LBS',
  date text not null
);

alter table pr_entries enable row level security;

create policy "Users manage own pr_entries"
  on pr_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- user_preferences: one row per user
create table if not exists user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  unit_system text not null default 'LBS',
  theme text not null default 'dark',
  default_rest_timer int not null default 90,
  show_secondary_muscles boolean not null default true
);

alter table user_preferences enable row level security;

create policy "Users manage own preferences"
  on user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- active_workout: persists the last selected workout per user
create table if not exists active_workout (
  user_id uuid primary key references auth.users(id) on delete cascade,
  workout_id text
);

alter table active_workout enable row level security;

create policy "Users manage own active_workout"
  on active_workout for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- exercises: seeded from wger API, public read-only
create table if not exists exercises (
  id text primary key,
  name text not null,
  split text not null,
  primary_muscle text not null,
  secondary_muscles text[] not null default '{}',
  equipment text not null,
  difficulty text not null default 'INTERMEDIATE',
  default_sets int not null default 3,
  default_reps text not null default '8-12',
  notes text
);

-- Public read, no auth required (exercise data is not user-specific)
alter table exercises enable row level security;

create policy "Exercises are publicly readable"
  on exercises for select
  using (true);

create policy "Exercises are insertable by anon for seeding"
  on exercises for insert
  with check (true);

create policy "Exercises are updatable by anon for seeding"
  on exercises for update
  using (true);
