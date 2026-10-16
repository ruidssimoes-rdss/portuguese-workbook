-- Brief 2 / 1a: six tables the app writes to but production never had,
-- plus the public `audio` Storage bucket for pre-generated pt-PT clips.
--
-- user_vocabulary, user_verbs, user_progress  -> definitions from 001_initial_schema.sql
-- user_section_progress                       -> definition from 002_user_section_progress.sql
-- tutor_sessions                              -> definition from 014_add_tutor_sessions.sql
-- exam_results                                -> shape from src/lib/exam-progress.ts
-- All FKs point at auth.users; every table is owner-only via RLS.

-- ── user_vocabulary ─────────────────────────────────────────────
create table if not exists public.user_vocabulary (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  word_portuguese text not null,
  category text not null,
  familiarity integer default 0,
  last_reviewed timestamptz,
  next_review timestamptz,
  times_correct integer default 0,
  times_incorrect integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, word_portuguese)
);
alter table public.user_vocabulary enable row level security;
create policy "Users can view own vocabulary"   on public.user_vocabulary for select using (auth.uid() = user_id);
create policy "Users can insert own vocabulary" on public.user_vocabulary for insert with check (auth.uid() = user_id);
create policy "Users can update own vocabulary" on public.user_vocabulary for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own vocabulary" on public.user_vocabulary for delete using (auth.uid() = user_id);
create index if not exists idx_user_vocabulary_user_id on public.user_vocabulary(user_id);
create index if not exists idx_user_vocabulary_next_review on public.user_vocabulary(user_id, next_review);

-- ── user_verbs ──────────────────────────────────────────────────
create table if not exists public.user_verbs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  verb text not null,
  familiarity integer default 0,
  last_reviewed timestamptz,
  next_review timestamptz,
  times_correct integer default 0,
  times_incorrect integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, verb)
);
alter table public.user_verbs enable row level security;
create policy "Users can view own verbs"   on public.user_verbs for select using (auth.uid() = user_id);
create policy "Users can insert own verbs" on public.user_verbs for insert with check (auth.uid() = user_id);
create policy "Users can update own verbs" on public.user_verbs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own verbs" on public.user_verbs for delete using (auth.uid() = user_id);
create index if not exists idx_user_verbs_user_id on public.user_verbs(user_id);
create index if not exists idx_user_verbs_next_review on public.user_verbs(user_id, next_review);

-- ── tutor_sessions ──────────────────────────────────────────────
create table if not exists public.tutor_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_title text not null,
  session_title_pt text,
  description text,
  stages jsonb not null,
  rationale text,
  estimated_minutes integer,
  difficulty text,
  accuracy_score real,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now() not null
);
alter table public.tutor_sessions enable row level security;
create policy "Users can read own tutor sessions"   on public.tutor_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own tutor sessions" on public.tutor_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own tutor sessions" on public.tutor_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own tutor sessions" on public.tutor_sessions for delete using (auth.uid() = user_id);
create index if not exists idx_tutor_sessions_user on public.tutor_sessions(user_id);
create index if not exists idx_tutor_sessions_created on public.tutor_sessions(created_at desc);

-- ── exam_results ────────────────────────────────────────────────
-- Upsert key in src/lib/exam-progress.ts: onConflict "user_id,exam_id"
create table if not exists public.exam_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_id text not null,
  overall_score numeric not null,
  classification text not null,
  section_scores jsonb not null,
  answers jsonb not null,
  completed_at timestamptz default now(),
  unique (user_id, exam_id)
);
alter table public.exam_results enable row level security;
create policy "Users can read own exam results"   on public.exam_results for select using (auth.uid() = user_id);
create policy "Users can insert own exam results" on public.exam_results for insert with check (auth.uid() = user_id);
create policy "Users can update own exam results" on public.exam_results for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own exam results" on public.exam_results for delete using (auth.uid() = user_id);
create index if not exists idx_exam_results_user_id on public.exam_results(user_id);

-- ── user_section_progress ───────────────────────────────────────
create table if not exists public.user_section_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  section text not null check (section in ('conjugations', 'vocabulary', 'grammar')),
  current_level text not null default 'A1.1',
  highest_passed text,
  last_test_score integer,
  last_test_date timestamptz,
  total_tests_taken integer not null default 0,
  attempts jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, section)
);
alter table public.user_section_progress enable row level security;
create policy "Users can view own section progress"   on public.user_section_progress for select using (auth.uid() = user_id);
create policy "Users can insert own section progress" on public.user_section_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own section progress" on public.user_section_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own section progress" on public.user_section_progress for delete using (auth.uid() = user_id);
create index if not exists idx_user_section_progress_user_id on public.user_section_progress(user_id);

-- ── user_progress ───────────────────────────────────────────────
create table if not exists public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  level_id text not null,
  status text not null default 'not_started',
  score integer,
  attempts integer default 0,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, level_id)
);
alter table public.user_progress enable row level security;
create policy "Users can view own progress"   on public.user_progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress" on public.user_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own progress" on public.user_progress for delete using (auth.uid() = user_id);
create index if not exists idx_user_progress_user_id on public.user_progress(user_id);

-- ── Storage: public `audio` bucket, read-only to the world ───────
-- Objects live at audio/<VOICE_ID>/<clipKey>.mp3 (see src/lib/audio/speak.ts).
insert into storage.buckets (id, name, public) values ('audio', 'audio', true) on conflict do nothing;

drop policy if exists "Public read audio clips" on storage.objects;
create policy "Public read audio clips" on storage.objects
  for select to public using (bucket_id = 'audio');
-- No insert/update/delete policy: writes only via the service role (scripts/tts).
