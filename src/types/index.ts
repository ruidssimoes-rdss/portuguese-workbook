// ─── Verb / Conjugation Types ───
export interface VerbMeta {
  emoji: string;
  english: string;
  group: "Irregular" | "Regular -AR" | "Regular -ER" | "Regular -IR";
  priority: "Essential" | "Core" | "Useful";
  difficulty: string;
  cefr: "A1" | "A2" | "B1" | "B2";
  /** Simplified phonetic transcription for infinitive (e.g. fah-ZEHR) */
  pronunciation?: string;
}

export interface Conjugation {
  Tense: string;
  Person: string;
  Conjugation: string;
  "Example Sentence": string;
  "English Translation": string;
  Notes: string;
  "CEFR (Tense)": string;
  Type: "Regular Pattern" | "Exception";
}

export interface VerbData {
  meta: VerbMeta;
  conjugations: Conjugation[];
}

export interface VerbDataSet {
  order: string[];
  verbs: Record<string, VerbData>;
}

// ─── Vocabulary Types ───
export interface VocabWord {
  id: string;
  portuguese: string;
  english: string;
  category: string;
  cefr: "A1" | "A2" | "B1" | "B2";
  gender?: "m" | "f";
  example?: string;
  exampleTranslation?: string;
  audio?: string;
}

// ─── Grammar Types ───
export interface GrammarTopic {
  id: string;
  title: string;
  slug: string;
  cefr: "A1" | "A2" | "B1" | "B2";
  category: "tenses" | "pronouns" | "articles" | "prepositions" | "syntax";
  summary: string;
  content: string; // markdown
}

// ─── User Progress Types ───
export interface UserProgress {
  id: string;
  user_id: string;
  content_type: "conjugation" | "vocabulary" | "grammar";
  content_id: string;
  score: number; // 0-100
  attempts: number;
  last_practiced: string;
  next_review: string; // spaced repetition
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  cefr_level: "A1" | "A2" | "B1" | "B2";
  streak_days: number;
  total_xp: number;
  created_at: string;
}

// ─── Practice / Quiz Types ───
export interface QuizQuestion {
  id: string;
  type: "fill-blank" | "multiple-choice" | "translate" | "conjugate";
  prompt: string;
  correct_answer: string;
  options?: string[];
  hint?: string;
  content_type: "conjugation" | "vocabulary" | "grammar";
  content_id: string;
  cefr: string;
}
