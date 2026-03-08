-- Run this in Supabase Dashboard → SQL Editor if not using migration tooling

-- Goal suggestion dismissal (show again after 7 days or 3 more lessons)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS goal_suggestion_dismissed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS goal_suggestion_dismissed_at TIMESTAMPTZ;

-- Streak milestone: last one we showed so we don't repeat
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_milestone_seen INTEGER;

-- Progress milestone: last one we showed (e.g. 'a1-complete', '10-lessons')
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_progress_milestone_seen TEXT;
