-- Allow 'goal' event type on user_calendar_events
ALTER TABLE public.user_calendar_events
  DROP CONSTRAINT IF EXISTS user_calendar_events_event_type_check;
ALTER TABLE public.user_calendar_events
  ADD CONSTRAINT user_calendar_events_event_type_check
  CHECK (event_type IN ('planned', 'auto_lesson', 'auto_exam', 'auto_practice', 'goal'));

-- Allow linked_type for goal (lesson, verb, grammar)
ALTER TABLE public.user_calendar_events
  DROP CONSTRAINT IF EXISTS user_calendar_events_linked_type_check;
ALTER TABLE public.user_calendar_events
  ADD CONSTRAINT user_calendar_events_linked_type_check
  CHECK (linked_type IS NULL OR linked_type IN ('lesson', 'exam', 'practice', 'verb', 'grammar'));

-- User goals table (optional metadata; events are in user_calendar_events)
CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  goal_type TEXT NOT NULL,
  target_date DATE NOT NULL,
  study_days INTEGER[] NOT NULL,
  total_items INTEGER NOT NULL,
  completed_items INTEGER NOT NULL DEFAULT 0,

  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_goals_user_id ON public.user_goals(user_id);

ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals"
  ON public.user_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER user_goals_updated_at
  BEFORE UPDATE ON public.user_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
