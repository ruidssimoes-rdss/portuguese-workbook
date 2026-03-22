-- Learning Engine: Per-item content mastery tracking
-- Replaces the old lesson-based progress system with item-level mastery

CREATE TABLE IF NOT EXISTS user_content_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- What content this tracks
  content_type TEXT NOT NULL CHECK (content_type IN ('vocab', 'verb', 'grammar')),
  content_id TEXT NOT NULL,          -- vocab: portuguese word, verb: UPPERCASE key, grammar: topic ID
  content_cefr TEXT NOT NULL CHECK (content_cefr IN ('A1', 'A2', 'B1')),
  content_category TEXT,             -- vocab: category ID, verb: group, grammar: null

  -- Interaction stats
  times_seen INT NOT NULL DEFAULT 0,
  times_correct INT NOT NULL DEFAULT 0,
  times_incorrect INT NOT NULL DEFAULT 0,
  streak INT NOT NULL DEFAULT 0,     -- consecutive correct answers (resets on wrong)

  -- Mastery progression
  -- 0=unseen, 1=introduced, 2=familiar, 3=learned, 4=mastered, 5=permanent
  mastery_level INT NOT NULL DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),

  -- Timing for spaced repetition
  last_seen_at TIMESTAMPTZ,
  last_correct_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,        -- when this item is due for re-testing

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One record per user per content item
  UNIQUE(user_id, content_type, content_id)
);

-- Indexes for the lesson generator queries
CREATE INDEX idx_mastery_user_type_level ON user_content_mastery(user_id, content_type, mastery_level);
CREATE INDEX idx_mastery_user_cefr ON user_content_mastery(user_id, content_cefr);
CREATE INDEX idx_mastery_next_review ON user_content_mastery(user_id, next_review_at) WHERE next_review_at IS NOT NULL;
CREATE INDEX idx_mastery_user_type_cefr ON user_content_mastery(user_id, content_type, content_cefr);

-- RLS policies
ALTER TABLE user_content_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own mastery" ON user_content_mastery
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mastery" ON user_content_mastery
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mastery" ON user_content_mastery
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_mastery_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mastery_updated_at
  BEFORE UPDATE ON user_content_mastery
  FOR EACH ROW
  EXECUTE FUNCTION update_mastery_timestamp();
