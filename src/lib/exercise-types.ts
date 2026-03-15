/**
 * Exercise type definitions for the v3 exercise framework.
 * Every exercise = exactly 1 point.
 */

export type ExerciseType =
  | "mc-pt-to-en"
  | "mc-en-to-pt"
  | "mc-grammar"
  | "mc-verb-form"
  | "mc-culture"
  | "fill-blank"
  | "conjugation"
  | "true-false"
  | "translation"
  | "match-word"
  | "word-bank-blank"
  | "sentence-build"
  | "error-correction";

export type Difficulty = "foundation" | "building" | "consolidating";

export interface Exercise {
  type: ExerciseType;
  id: string;
  instruction: string;
  englishInstruction?: string;
  data: Record<string, unknown>;
}

export interface ExerciseResult {
  exerciseId: string;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  accentHint?: string;
  exerciseType: ExerciseType;
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
