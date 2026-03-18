/**
 * Answer validation utilities for the block-based exercise system.
 * Wraps and extends src/lib/accent-utils.ts for accent-tolerant comparison.
 */

import { removeAccents, checkAnswer as accentCheck } from "@/lib/accent-utils";

export interface ValidationResult {
  correct: boolean;
  matchedAnswer: string;
}

/**
 * Check a user answer against the correct answer and optional alternatives.
 * Accent-tolerant: "esta" matches "está" etc.
 */
export function checkAnswer(
  userAnswer: string,
  correctAnswer: string,
  acceptedAnswers?: string[],
): ValidationResult {
  const result = accentCheck(userAnswer, correctAnswer, acceptedAnswers);

  return {
    correct: result.correct,
    matchedAnswer: result.correct ? correctAnswer : correctAnswer,
  };
}

/**
 * Normalize a string for display comparison (trim, lowercase).
 */
export function normalizeForDisplay(text: string): string {
  return text.trim().toLowerCase();
}

/**
 * Re-export removeAccents for direct use.
 */
export { removeAccents };
