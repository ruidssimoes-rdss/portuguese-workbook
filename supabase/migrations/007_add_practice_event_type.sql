-- Add auto_practice event type and practice linked_type for calendar
-- If constraint names differ, run: SELECT conname FROM pg_constraint WHERE conrelid = 'public.user_calendar_events'::regclass AND contype = 'c';

ALTER TABLE public.user_calendar_events
  DROP CONSTRAINT IF EXISTS user_calendar_events_event_type_check;

ALTER TABLE public.user_calendar_events
  ADD CONSTRAINT user_calendar_events_event_type_check
  CHECK (event_type IN ('planned', 'auto_lesson', 'auto_exam', 'auto_practice'));

ALTER TABLE public.user_calendar_events
  DROP CONSTRAINT IF EXISTS user_calendar_events_linked_type_check;

ALTER TABLE public.user_calendar_events
  ADD CONSTRAINT user_calendar_events_linked_type_check
  CHECK (linked_type IN ('lesson', 'exam', 'practice') OR linked_type IS NULL);
