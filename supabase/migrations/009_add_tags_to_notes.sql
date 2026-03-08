-- Add tags array to user_notes
ALTER TABLE public.user_notes ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
