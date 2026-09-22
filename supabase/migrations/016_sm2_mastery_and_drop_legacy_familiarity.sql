-- Phase 1a: one mastery model.
-- user_content_mastery becomes the sole source of truth and gains SM-2 state.
-- The legacy familiarity ladder on user_vocabulary / user_verbs is dropped
-- (tables are kept; only the unused columns go).

ALTER TABLE public.user_content_mastery
  ADD COLUMN IF NOT EXISTS ease_factor   NUMERIC NOT NULL DEFAULT 2.5,
  ADD COLUMN IF NOT EXISTS interval_days INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS repetitions   INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.user_vocabulary
  DROP COLUMN IF EXISTS familiarity,
  DROP COLUMN IF EXISTS next_review;

ALTER TABLE public.user_verbs
  DROP COLUMN IF EXISTS familiarity,
  DROP COLUMN IF EXISTS next_review;
