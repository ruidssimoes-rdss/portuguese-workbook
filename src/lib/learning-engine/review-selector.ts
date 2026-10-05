/**
 * Learning Engine — Review Selector (pure).
 *
 * The single place that decides which mastery records make up a review
 * session. Both getReviewCount and generateReviewSession go through this,
 * so the count promised on the home page equals the count delivered.
 */

import type { MasteryRecord } from "./mastery-tracker";

export type ReviewReason = "overdue" | "low_accuracy" | "broken_streak";

export const REVIEW_SESSION_MAX = 20;

/**
 * Narrows the records a review draws from. Used by the vocabulary folder
 * panels, which promise a session and must start exactly that session.
 */
export interface ReviewScope {
  contentType?: MasteryRecord["content_type"];
  /** Restrict to these content ids (e.g. the words of one category). */
  contentIds?: string[];
  /** Only items at least one full day past their review date. */
  overdueOnly?: boolean;
}

const DAY = 86_400_000;

export function scopeRecords(
  records: MasteryRecord[],
  scope: ReviewScope | undefined,
  now: Date = new Date()
): MasteryRecord[] {
  if (!scope) return records;
  const ids = scope.contentIds ? new Set(scope.contentIds) : null;
  return records.filter((r) => {
    if (scope.contentType && r.content_type !== scope.contentType) return false;
    if (ids && !ids.has(r.content_id)) return false;
    if (scope.overdueOnly) {
      if (!r.next_review_at) return false;
      if (now.getTime() - new Date(r.next_review_at).getTime() < DAY) return false;
    }
    return true;
  });
}

export interface ReviewCandidate {
  record: MasteryRecord;
  reason: ReviewReason;
}

export function selectReviewCandidates(
  records: MasteryRecord[],
  now: Date = new Date(),
  maxItems: number = REVIEW_SESSION_MAX
): ReviewCandidate[] {
  const scored: Array<ReviewCandidate & { priority: number }> = [];

  for (const record of records) {
    // Unseen items have nothing to review
    if (record.mastery_level === 0) continue;

    if (record.next_review_at && new Date(record.next_review_at) <= now) {
      const daysOverdue =
        (now.getTime() - new Date(record.next_review_at).getTime()) / 86_400_000;
      scored.push({ record, reason: "overdue", priority: 100 + daysOverdue });
    }

    if (record.times_seen >= 3) {
      const accuracy = record.times_correct / record.times_seen;
      if (accuracy < 0.6) {
        scored.push({ record, reason: "low_accuracy", priority: 80 + (1 - accuracy) * 50 });
      }
    }

    if (record.streak === 0 && record.mastery_level >= 2 && record.times_incorrect > 0) {
      scored.push({ record, reason: "broken_streak", priority: 60 });
    }
  }

  scored.sort((a, b) => b.priority - a.priority);

  // Deduplicate — an item can qualify for several reasons; keep the strongest
  const seen = new Set<string>();
  const deduped: ReviewCandidate[] = [];
  for (const c of scored) {
    const key = `${c.record.content_type}:${c.record.content_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push({ record: c.record, reason: c.reason });
  }

  return deduped.slice(0, maxItems);
}
