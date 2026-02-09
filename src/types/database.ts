export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  level_id: string;
  status: "not_started" | "in_progress" | "completed";
  score: number | null;
  attempts: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserVocabulary {
  id: string;
  user_id: string;
  word_portuguese: string;
  category: string;
  familiarity: number; // 0-4
  last_reviewed: string | null;
  next_review: string | null;
  times_correct: number;
  times_incorrect: number;
  created_at: string;
  updated_at: string;
}

export interface UserVerb {
  id: string;
  user_id: string;
  verb: string;
  familiarity: number;
  last_reviewed: string | null;
  next_review: string | null;
  times_correct: number;
  times_incorrect: number;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  pronunciation_speed: number;
  show_phonetics: boolean;
  daily_goal: number;
  created_at: string;
  updated_at: string;
}
