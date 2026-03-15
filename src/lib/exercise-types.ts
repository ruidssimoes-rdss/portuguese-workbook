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
