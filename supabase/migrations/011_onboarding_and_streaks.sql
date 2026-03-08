-- Run this in Supabase Dashboard → SQL Editor if not using migration tooling

-- Add onboarding fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS learning_motivation TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS self_assessed_level TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS study_days_per_week INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_goal TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Streak tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_date DATE;

-- Index for quick onboarding check
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(id, onboarding_completed);
