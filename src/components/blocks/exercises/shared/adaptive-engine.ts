/**
 * Adaptive Engine — pure logic for real-time difficulty adjustment.
 * No side effects, no API calls, no UI. Just decisions.
 */

import type { ExerciseDifficulty, AnswerResult } from "@/types/blocks";

// ── Adaptation Actions ─────────────────────────────────────

export type AdaptationAction =
  | { type: "increase-difficulty" }
  | { type: "decrease-difficulty" }
  | { type: "inject-explanation"; topic: string }
  | { type: "show-hint-next" }
  | { type: "milestone"; message: string; streak: number }
  | { type: "none" };

// ── Thresholds ─────────────────────────────────────────────

const CORRECT_STREAK_THRESHOLD = 3;
const INCORRECT_STREAK_THRESHOLD = 3;
const MILESTONE_STREAKS: Record<number, string> = {
  5: "5 in a row \u2014 nice rhythm!",
  10: "10 in a row \u2014 you're on fire!",
  15: "15 in a row \u2014 unstoppable!",
  20: "20 in a row \u2014 incredible focus!",
};

// ── Core Logic ─────────────────────────────────────────────

export function getAdaptation(
  correctStreak: number,
  incorrectStreak: number,
  currentDifficulty: ExerciseDifficulty,
  totalAnswered: number,
  recentResults: AnswerResult[],
): AdaptationAction {
  // Milestone check (highest priority)
  if (MILESTONE_STREAKS[correctStreak]) {
    return {
      type: "milestone",
      message: MILESTONE_STREAKS[correctStreak],
      streak: correctStreak,
    };
  }

  // Difficulty increase
  if (correctStreak >= CORRECT_STREAK_THRESHOLD && currentDifficulty !== "confident") {
    return { type: "increase-difficulty" };
  }

  // Difficulty decrease / help injection
  if (incorrectStreak >= INCORRECT_STREAK_THRESHOLD) {
    const wrongPattern = detectWeakPattern(recentResults);
    if (wrongPattern) {
      return { type: "inject-explanation", topic: wrongPattern };
    }
    if (currentDifficulty !== "foundation") {
      return { type: "decrease-difficulty" };
    }
    return { type: "show-hint-next" };
  }

  return { type: "none" };
}

// ── Pattern Detection ──────────────────────────────────────

function detectWeakPattern(recentResults: AnswerResult[]): string | null {
  const wrongResults = recentResults.filter((r) => !r.correct).slice(-5);
  if (wrongResults.length < 2) return null;

  // Check for common mistake patterns (simplified heuristic)
  // Could be enhanced with AI in later phases
  return null;
}

// ── Difficulty Transitions ─────────────────────────────────

export function adjustDifficulty(
  current: ExerciseDifficulty,
  action: "increase" | "decrease",
): ExerciseDifficulty {
  const levels: ExerciseDifficulty[] = ["foundation", "developing", "confident"];
  const currentIndex = levels.indexOf(current);

  if (action === "increase") {
    return levels[Math.min(currentIndex + 1, levels.length - 1)];
  }
  return levels[Math.max(currentIndex - 1, 0)];
}
