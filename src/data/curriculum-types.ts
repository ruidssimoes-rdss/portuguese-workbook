/**
 * Curriculum lesson structure — content references resolved at runtime from verbs.json, vocab.json, grammar.json, culture data.
 */

export type CEFRLevel = "A1" | "A2" | "B1";

export interface CurriculumLessonStages {
  vocabulary: {
    words: Array<{ categoryId: string; portuguese: string }>;
  };
  verbs: {
    verbs: Array<{ verbKey: string; tenses: string[] }>;
  };
  grammar: {
    topics: string[];
  };
  culture: {
    items: Array<{ type: "saying" | "false-friend" | "etiquette" | "slang"; id: string }>;
  };
  practice: {
    sentences: Array<{
      sentencePt: string;
      sentenceEn: string;
      correctAnswer: string;
      hint?: string;
      acceptedAnswers?: string[];
    }>;
  };
}

export interface CurriculumLesson {
  id: string;
  number: number;
  cefrLevel: CEFRLevel;
  title: string;
  titlePt: string;
  theme: string;
  description: string;
  descriptionPt: string;
  stages: CurriculumLessonStages;
  scoring: {
    gradedStages: ("verbs" | "practice")[];
    passingScore: number;
  };
  requires: string | null;
}

// ─── Resolved lesson shape ───────────────────────────────────────
// What resolve-lessons.ts and the learning engine produce for the player.
// (Moved here from src/data/lessons.ts; the static lessons array was unused.)

export interface VocabItem {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  example: { pt: string; en: string };
}

export interface VerbItem {
  id: string;
  verb: string;
  verbTranslation: string;
  tense: string;
  conjugations: { pronoun: string; form: string }[];
  verbSlug: string;
}

export interface GrammarItem {
  id: string;
  rule: string;
  rulePt: string;
  examples: { pt: string; en: string }[];
  topicSlug: string;
  topicTitle: string;
}

export interface CultureItem {
  id: string;
  expression: string;
  meaning: string;
  literal: string;
  tip: string;
}

export interface PracticeItem {
  id: string;
  sentence: string;
  answer: string;
  fullSentence: string;
  translation: string;
  acceptedAnswers: string[];
}

export interface LessonStage {
  id: string;
  type: "vocabulary" | "verb" | "grammar" | "culture" | "practice" | "summary";
  title: string;
  ptTitle: string;
  description: string;
  items?: VocabItem[];
  verbs?: VerbItem[];
  grammarItems?: GrammarItem[];
  cultureItems?: CultureItem[];
  practiceItems?: PracticeItem[];
}

export interface Lesson {
  id: string;
  title: string;
  ptTitle: string;
  description: string;
  cefr: "A1" | "A2" | "B1";
  estimatedMinutes: number;
  order: number;
  stages: LessonStage[];
}
