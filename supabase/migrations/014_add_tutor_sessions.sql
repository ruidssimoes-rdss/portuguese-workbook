-- Tutor sessions: stores AI-generated review session history

create table public.tutor_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
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

create policy "Users can read own tutor sessions"
  on public.tutor_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own tutor sessions"
  on public.tutor_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tutor sessions"
  on public.tutor_sessions for update
  using (auth.uid() = user_id);

create index idx_tutor_sessions_user on public.tutor_sessions(user_id);
create index idx_tutor_sessions_created on public.tutor_sessions(created_at desc);
