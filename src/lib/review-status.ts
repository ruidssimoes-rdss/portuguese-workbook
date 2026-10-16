/**
 * Review status — the one definition of «due» and «overdue» for a mastery
 * record. No imports, so scripts/check-status-logic.js can run it directly.
 *
 *   due      the item has been seen and its review time has come
 *            (next_review_at <= now). It can be reviewed now.
 *   overdue  due, AND the review date is before the start of today in the
 *            user's local day, AND the item has not been seen since it came due.
 *
 * So an item due earlier today is due but not overdue, an item with no
 * scheduled review is never overdue, and an item reviewed since its due date
 * is not overdue.
 */

export interface ReviewRecord {
  mastery_level: number;
  next_review_at: string | null;
  last_seen_at: string | null;
}

/** Midnight at the start of the user's local day containing `now` (ms). */
export function startOfLocalDay(now: number = Date.now()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Seen before and scheduled, with a review time that has arrived. */
export function isDue(r: ReviewRecord | null | undefined, now: number = Date.now()): boolean {
  if (!r || r.mastery_level < 1 || !r.next_review_at) return false;
  return Date.parse(r.next_review_at) <= now;
}

/** Genuinely overdue: see the rule above. */
export function isOverdue(r: ReviewRecord | null | undefined, now: number = Date.now()): boolean {
  if (!r || r.mastery_level < 1 || !r.next_review_at) return false;
  const due = Date.parse(r.next_review_at);
  if (!(due < startOfLocalDay(now))) return false;
  const seen = r.last_seen_at ? Date.parse(r.last_seen_at) : null;
  return !(seen !== null && seen >= due);
}

/** Whole local calendar days from today to the review date (0 = today). */
export function daysUntilReview(r: ReviewRecord, now: number = Date.now()): number {
  const due = Date.parse(r.next_review_at as string);
  return Math.round((startOfLocalDay(due) - startOfLocalDay(now)) / 86_400_000);
}
