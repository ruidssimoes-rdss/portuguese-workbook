/**
 * Types for the v4 section-based exercise system.
 */

export type Difficulty = "foundation" | "building" | "consolidating";

export interface SectionAnswer {
  questionId: string;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  accentHint?: string;
}

export interface SectionResult {
  sectionKey: string;
  sectionName: string;
  answers: SectionAnswer[];
  totalCorrect: number;
  totalQuestions: number;
}

export function getDifficulty(lessonNumber: number, cefrLevel: string): Difficulty {
  if (cefrLevel === "A1") {
    if (lessonNumber <= 6) return "foundation";
    if (lessonNumber <= 12) return "building";
    return "consolidating";
  }
  if (cefrLevel === "A2") {
    if (lessonNumber <= 22) return "foundation";
    if (lessonNumber <= 28) return "building";
    return "consolidating";
  }
  if (lessonNumber <= 38) return "foundation";
  if (lessonNumber <= 42) return "building";
  return "consolidating";
}

/* ─── Content attribution ─── */

import type { PracticeItem as LessonPracticeItem, VocabItem, VerbItem, GrammarItem } from "@/data/lessons";

export type TrackedContentType = "vocab" | "verb" | "grammar";

/** Which content-pool item a question tests. */
export interface ContentRef {
  contentType: TrackedContentType;
  contentId: string;
}

/** A practice sentence that knows which pool item it tests. */
export type AttributedPracticeItem = LessonPracticeItem & { contentRef?: ContentRef };

/**
 * Content that is exercised but never shown in the learn phase
 * (review, spot-check and carry-forward items).
 */
export interface ExerciseOnlyContent {
  vocabItems?: VocabItem[];
  verbItems?: VerbItem[];
  grammarItems?: GrammarItem[];
  practiceItems?: AttributedPracticeItem[];
}
