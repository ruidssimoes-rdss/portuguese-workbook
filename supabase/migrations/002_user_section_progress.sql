-- Section-level progress (one row per user per section: conjugations, vocabulary, grammar)
-- Used by progress-service for dashboard and test results.
CREATE TABLE IF NOT EXISTS public.user_section_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('conjugations', 'vocabulary', 'grammar')),
  current_level TEXT NOT NULL DEFAULT 'A1.1',
  highest_passed TEXT,
  last_test_score INTEGER,
  last_test_date TIMESTAMPTZ,
  total_tests_taken INTEGER NOT NULL DEFAULT 0,
  attempts JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, section)
);

ALTER TABLE public.user_section_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own section progress" ON public.user_section_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own section progress" ON public.user_section_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own section progress" ON public.user_section_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_section_progress_user_id ON public.user_section_progress(user_id);
