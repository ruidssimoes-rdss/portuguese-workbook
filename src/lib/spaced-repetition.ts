/**
 * Simplified SM-2 spaced repetition algorithm for language learning.
 *
 * Familiarity levels: 0 (new) → 1 (seen) → 2 (learning) → 3 (known) → 4 (mastered)
 *
 * Review intervals (days):
 *   familiarity 0 → review same day
 *   familiarity 1 → review in 1 day
 *   familiarity 2 → review in 3 days
 *   familiarity 3 → review in 7 days
 *   familiarity 4 → review in 14 days
 */

export interface ReviewUpdate {
  newFamiliarity: number;
  nextReview: Date;
  timesCorrect: number;
  timesIncorrect: number;
}

const REVIEW_INTERVALS: Record<number, number> = {
  0: 0,
  1: 1,
  2: 3,
  3: 7,
  4: 14,
};

export function calculateReview(
  currentFamiliarity: number,
  wasCorrect: boolean,
  currentTimesCorrect: number,
  currentTimesIncorrect: number,
): ReviewUpdate {
  let newFamiliarity: number;

  if (wasCorrect) {
    newFamiliarity = Math.min(4, currentFamiliarity + 1);
  } else {
    newFamiliarity = Math.max(0, currentFamiliarity - 1);
  }

  const intervalDays = REVIEW_INTERVALS[newFamiliarity] ?? 7;
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + intervalDays);

  return {
    newFamiliarity,
    nextReview,
    timesCorrect: currentTimesCorrect + (wasCorrect ? 1 : 0),
    timesIncorrect: currentTimesIncorrect + (wasCorrect ? 0 : 1),
  };
}

export function familiarityToState(
  familiarity: number,
): "new" | "learning" | "known" | "mastered" {
  if (familiarity === 0) return "new";
  if (familiarity <= 2) return "learning";
  if (familiarity === 3) return "known";
  return "mastered";
}

export function isOverdue(nextReview: string | null): boolean {
  if (!nextReview) return false;
  return new Date(nextReview) < new Date();
}

/** Priority score for sorting review items. Higher = more urgent. */
export function reviewPriority(
  familiarity: number,
  nextReview: string | null,
): number {
  let score = 0;

  // Low familiarity = high priority
  score += (4 - familiarity) * 10;

  // Overdue = extra priority
  if (nextReview) {
    const daysOverdue = Math.max(
      0,
      (Date.now() - new Date(nextReview).getTime()) / (1000 * 60 * 60 * 24),
    );
    score += Math.min(daysOverdue * 5, 50);
  }

  return score;
}
