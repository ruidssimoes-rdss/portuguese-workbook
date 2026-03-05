-- User calendar: planned study sessions and auto-logged lesson/exam activity
CREATE TABLE IF NOT EXISTS public.user_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,

  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  all_day BOOLEAN NOT NULL DEFAULT true,

  event_type TEXT NOT NULL CHECK (event_type IN ('planned', 'auto_lesson', 'auto_exam')),
  linked_type TEXT CHECK (linked_type IN ('lesson', 'exam')),
  linked_id TEXT,
  linked_label TEXT,
  linked_score NUMERIC,
  linked_passed BOOLEAN,

  color TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_calendar_user_date ON public.user_calendar_events(user_id, event_date);
CREATE INDEX idx_calendar_user_type ON public.user_calendar_events(user_id, event_type);

ALTER TABLE public.user_calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own events"
  ON public.user_calendar_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
  ON public.user_calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
  ON public.user_calendar_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON public.user_calendar_events FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER user_calendar_events_updated_at
  BEFORE UPDATE ON public.user_calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
