-- Link goal events to parent goal for progress tracking
ALTER TABLE public.user_calendar_events
  ADD COLUMN IF NOT EXISTS goal_id UUID REFERENCES public.user_goals(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_calendar_events_goal_id ON public.user_calendar_events(goal_id);
