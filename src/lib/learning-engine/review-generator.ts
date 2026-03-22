/**
 * Learning Engine — Review Generator
 *
 * Generates targeted review sessions focusing on weak items:
 * overdue for review, low accuracy, broken streaks.
 */

import {
  getUserMastery,
  type MasteryRecord,
  type CEFRLevel,
  type ContentType,
} from "./mastery-tracker";

import {
  getVocabPool,
  getVerbPool,
  getGrammarPool,
  isHighFrequency,
  type PoolVocabItem,
  type PoolVerbItem,
  type PoolGrammarItem,
} from "./content-pool";

// ─── Types ──────────────────────────────────────────────

export type ReviewReason = "overdue" | "low_accuracy" | "broken_streak";

export interface ReviewSession {
  id: string;
  generatedAt: string;
  items: ReviewItem[];
  totalItems: number;
  overdueCount: number;
  lowAccuracyCount: number;
  brokenStreakCount: number;
}

export interface ReviewItem {
  contentType: ContentType;
  contentId: string;
  contentCefr: CEFRLevel;
  contentCategory?: string;
  isHighFrequency: boolean;
  reason: ReviewReason;
  data: PoolVocabItem | PoolVerbItem | PoolGrammarItem;
}

// ─── Generator ──────────────────────────────────────────

/**
 * Generate a targeted review session.
 * Focuses on weak items: overdue, low accuracy, broken streaks.
 */
export async function generateReviewSession(
  userId: string,
  maxItems: number = 15
): Promise<ReviewSession> {
  const allRecords = await getUserMastery(userId);

  const now = new Date();
  const candidates: Array<{
    record: MasteryRecord;
    reason: ReviewReason;
    priority: number;
  }> = [];

  for (const record of allRecords) {
    // Skip unseen items (nothing to review)
    if (record.mastery_level === 0) continue;

    // Overdue for review
    if (record.next_review_at && new Date(record.next_review_at) <= now) {
      const daysOverdue =
        (now.getTime() - new Date(record.next_review_at).getTime()) /
        (1000 * 60 * 60 * 24);
      candidates.push({
        record,
        reason: "overdue",
        priority: 100 + daysOverdue,
      });
    }

    // Low accuracy (seen 3+ times, <60% correct)
    if (record.times_seen >= 3) {
      const accuracy = record.times_correct / record.times_seen;
      if (accuracy < 0.6) {
        candidates.push({
          record,
          reason: "low_accuracy",
          priority: 80 + (1 - accuracy) * 50,
        });
      }
    }

    // Broken streak (was doing well, then got it wrong)
    if (
      record.streak === 0 &&
      record.mastery_level >= 2 &&
      record.times_incorrect > 0
    ) {
      candidates.push({ record, reason: "broken_streak", priority: 60 });
    }
  }

  // Sort by priority (highest first)
  candidates.sort((a, b) => b.priority - a.priority);

  // Deduplicate — same item might appear for multiple reasons
  const seen = new Set<string>();
  const deduped = candidates.filter((c) => {
    const key = `${c.record.content_type}:${c.record.content_id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const selected = deduped.slice(0, maxItems);

  const items: ReviewItem[] = selected.map(({ record, reason }) => ({
    contentType: record.content_type as ContentType,
    contentId: record.content_id,
    contentCefr: record.content_cefr as CEFRLevel,
    contentCategory: record.content_category || undefined,
    isHighFrequency: isHighFrequency(record.content_type, record.content_id),
    reason,
    data: lookupContent(record.content_type as ContentType, record.content_id),
  }));

  return {
    id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    generatedAt: new Date().toISOString(),
    items,
    totalItems: items.length,
    overdueCount: items.filter((i) => i.reason === "overdue").length,
    lowAccuracyCount: items.filter((i) => i.reason === "low_accuracy").length,
    brokenStreakCount: items.filter((i) => i.reason === "broken_streak").length,
  };
}

// ─── Content Lookup ─────────────────────────────────────

function lookupContent(
  contentType: ContentType,
  contentId: string
): PoolVocabItem | PoolVerbItem | PoolGrammarItem {
  if (contentType === "vocab") {
    const found = getVocabPool().find((v) => v.portuguese === contentId);
    if (found) return found;
  }
  if (contentType === "verb") {
    const found = getVerbPool().find((v) => v.key === contentId);
    if (found) return found;
  }
  if (contentType === "grammar") {
    const found = getGrammarPool().find((g) => g.id === contentId);
    if (found) return found;
  }
  // Fallback — should never happen with valid data
  return {
    portuguese: contentId,
    english: "",
    cefr: "A1",
    gender: null,
    category: "",
    categoryTitle: "",
    pronunciation: "",
    example: "",
    exampleTranslation: "",
  } as PoolVocabItem;
}
