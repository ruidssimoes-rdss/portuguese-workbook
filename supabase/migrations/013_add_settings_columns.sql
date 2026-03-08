-- Phase 4: Expanded Settings — theme, show_translations, preferred_study_time
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'system';
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS show_translations BOOLEAN DEFAULT true;
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS preferred_study_time TEXT DEFAULT 'evening';
