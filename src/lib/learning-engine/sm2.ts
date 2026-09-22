/**
 * Learning Engine — SM-2 spaced repetition (pure, no I/O).
 *
 * Correct answer:  repetitions + 1; interval = 1 day (1st), 6 days (2nd),
 *                  then round(previous interval × ease); ease + 0.1.
 * Wrong answer:    repetitions = 0; interval = 1 day; ease − 0.2.
 * Ease is clamped to [1.3, 3.0]. Interval is capped at 365 days.
 */

export const SM2_DEFAULT_EASE = 2.5;
export const SM2_MIN_EASE = 1.3;
export const SM2_MAX_EASE = 3.0;
export const SM2_MAX_INTERVAL_DAYS = 365;

export interface Sm2State {
  ease_factor: number;
  interval_days: number;
  repetitions: number;
}

export interface Sm2Result extends Sm2State {
  next_review_at: string;
}

function clampEase(ease: number): number {
  const clamped = Math.min(SM2_MAX_EASE, Math.max(SM2_MIN_EASE, ease));
  return Math.round(clamped * 100) / 100;
}

export function applySm2(
  current: Partial<Sm2State>,
  wasCorrect: boolean,
  now: Date = new Date()
): Sm2Result {
  const prevEase = current.ease_factor ?? SM2_DEFAULT_EASE;
  const prevInterval = current.interval_days ?? 0;
  const prevReps = current.repetitions ?? 0;

  let repetitions: number;
  let interval: number;
  let ease: number;

  if (wasCorrect) {
    repetitions = prevReps + 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(prevInterval * prevEase);
    ease = clampEase(prevEase + 0.1);
  } else {
    repetitions = 0;
    interval = 1;
    ease = clampEase(prevEase - 0.2);
  }

  interval = Math.min(SM2_MAX_INTERVAL_DAYS, Math.max(1, interval));

  const next = new Date(now);
  next.setDate(next.getDate() + interval);

  return {
    ease_factor: ease,
    interval_days: interval,
    repetitions,
    next_review_at: next.toISOString(),
  };
}

/**
 * Mastery level (0–5) is derived from SM-2 repetitions and lifetime accuracy.
 * It is never stored independently of these inputs.
 *
 * 0 unseen · 1 introduced (or lapsed) · 2 familiar · 3 learned · 4 mastered · 5 permanent
 */
export function deriveMasteryLevel(
  repetitions: number,
  timesSeen: number,
  timesCorrect: number
): 0 | 1 | 2 | 3 | 4 | 5 {
  if (timesSeen <= 0) return 0;
  const accuracy = timesCorrect / timesSeen;
  if (repetitions <= 0) return 1;
  if (repetitions === 1) return 2;
  if (repetitions <= 3) return accuracy >= 0.6 ? 3 : 2;
  if (repetitions <= 5) return accuracy >= 0.8 ? 4 : 3;
  return accuracy >= 0.85 ? 5 : 4;
}
