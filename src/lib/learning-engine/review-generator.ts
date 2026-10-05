/**
 * Learning Engine — Review Generator
 *
 * Builds a targeted review session from the shared review selector
 * (overdue, low accuracy, broken streak). Review items are never shown
 * in a learn phase — the adapter sends them straight to exercises.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getUserMastery,
  type CEFRLevel,
  type ContentType,
} from "./mastery-tracker";
import {
  scopeRecords,
  selectReviewCandidates,
  REVIEW_SESSION_MAX,
  type ReviewReason,
  type ReviewScope,
} from "./review-selector";
import {
  getVocabPool,
  getVerbPool,
  getGrammarPool,
  isHighFrequency,
  type PoolVocabItem,
  type PoolVerbItem,
  type PoolGrammarItem,
} from "./content-pool";

export type { ReviewReason } from "./review-selector";

// ─── Types ──────────────────────────────────────────────

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

export async function generateReviewSession(
  userId: string,
  maxItems: number = REVIEW_SESSION_MAX,
  client?: SupabaseClient,
  scope?: ReviewScope
): Promise<ReviewSession> {
  const now = new Date();
  const allRecords = await getUserMastery(userId, undefined, client);
  const selected = selectReviewCandidates(scopeRecords(allRecords, scope, now), now, maxItems);

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
