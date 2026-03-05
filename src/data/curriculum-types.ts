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
