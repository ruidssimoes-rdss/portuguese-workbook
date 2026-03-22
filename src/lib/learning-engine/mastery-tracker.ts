/**
 * Learning Engine — Mastery Tracker
 *
 * Per-item tracking system that records every interaction a user has with
 * content (vocab words, verbs, grammar topics). Implements spaced repetition
 * with mastery levels 0-5.
 */

import { createClient } from "@/lib/supabase/client";

// ─── Types ──────────────────────────────────────────────

export type ContentType = "vocab" | "verb" | "grammar";
export type CEFRLevel = "A1" | "A2" | "B1";
export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface MasteryRecord {
  id: string;
  user_id: string;
  content_type: ContentType;
  content_id: string;
  content_cefr: CEFRLevel;
  content_category: string | null;
  times_seen: number;
  times_correct: number;
  times_incorrect: number;
  streak: number;
  mastery_level: MasteryLevel;
  last_seen_at: string | null;
  last_correct_at: string | null;
  next_review_at: string | null;
}

export interface MasteryUpdate {
  content_type: ContentType;
  content_id: string;
  was_correct: boolean;
}

// ─── Mastery Level Definitions ──────────────────────────

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  0: "Unseen",
  1: "Introduced",
  2: "Familiar",
  3: "Learned",
  4: "Mastered",
  5: "Permanent",
};

// Spaced repetition intervals (days until next review) per mastery level
// High-frequency items (top 200 words) get shorter intervals
const BASE_INTERVALS = [0, 1, 3, 7, 14, 30];
const HIGH_FREQ_INTERVALS = [0, 0.5, 1, 3, 7, 14];

// ─── Core Functions ─────────────────────────────────────

/**
 * Get all mastery records for a user, optionally filtered
 */
export async function getUserMastery(
  userId: string,
  filters?: {
    contentType?: ContentType;
    cefr?: CEFRLevel;
    masteryLevel?: MasteryLevel;
    dueForReview?: boolean;
  }
): Promise<MasteryRecord[]> {
  const supabase = createClient();

  let query = supabase
    .from("user_content_mastery")
    .select("*")
    .eq("user_id", userId);

  if (filters?.contentType) query = query.eq("content_type", filters.contentType);
  if (filters?.cefr) query = query.eq("content_cefr", filters.cefr);
  if (filters?.masteryLevel !== undefined)
    query = query.eq("mastery_level", filters.masteryLevel);
  if (filters?.dueForReview)
    query = query.lte("next_review_at", new Date().toISOString());

  const { data, error } = await query;
  if (error) {
    console.error("Mastery fetch error:", error);
    return [];
  }
  return data || [];
}

/**
 * Get mastery for a specific content item
 */
export async function getItemMastery(
  userId: string,
  contentType: ContentType,
  contentId: string
): Promise<MasteryRecord | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_content_mastery")
    .select("*")
    .eq("user_id", userId)
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get mastery level for an item (returns 0 if no record exists)
 */
export async function getMasteryLevel(
  userId: string,
  contentType: ContentType,
  contentId: string
): Promise<MasteryLevel> {
  const record = await getItemMastery(userId, contentType, contentId);
  return (record?.mastery_level ?? 0) as MasteryLevel;
}

/**
 * Build a lookup map of all mastery records for fast access during lesson generation
 */
export async function getMasteryMap(
  userId: string,
  cefr?: CEFRLevel
): Promise<Map<string, MasteryRecord>> {
  const records = await getUserMastery(userId, { cefr });
  const map = new Map<string, MasteryRecord>();
  for (const r of records) {
    map.set(`${r.content_type}:${r.content_id}`, r);
  }
  return map;
}

// ─── Mastery Calculation ────────────────────────────────

/**
 * Calculate new mastery state after an answer.
 * Pure function — no side effects.
 */
export function calculateMasteryUpdate(
  current: Partial<MasteryRecord>,
  wasCorrect: boolean,
  isHighFrequency: boolean = false
): Partial<MasteryRecord> {
  const timesSeen = (current.times_seen || 0) + 1;
  const timesCorrect = (current.times_correct || 0) + (wasCorrect ? 1 : 0);
  const timesIncorrect = (current.times_incorrect || 0) + (wasCorrect ? 0 : 1);
  const streak = wasCorrect ? (current.streak || 0) + 1 : 0;
  const accuracy = timesCorrect / timesSeen;

  // Determine mastery level based on stats
  let newLevel: MasteryLevel = (current.mastery_level || 0) as MasteryLevel;

  if (timesSeen === 1) {
    newLevel = 1; // Introduced
  } else if (timesSeen >= 5 && accuracy >= 0.85 && streak >= 3) {
    newLevel = 4; // Mastered
  } else if (timesSeen >= 3 && accuracy >= 0.7) {
    newLevel = 3; // Learned
  } else if (timesSeen >= 2) {
    newLevel = 2; // Familiar
  }

  // Never downgrade mastery level — but streak resets shorten the interval
  const currentLevel = (current.mastery_level || 0) as MasteryLevel;
  if (newLevel < currentLevel) {
    newLevel = currentLevel;
  }

  // Calculate next review date
  const intervals = isHighFrequency ? HIGH_FREQ_INTERVALS : BASE_INTERVALS;
  const intervalDays = intervals[Math.min(newLevel, 5)];
  const nextReview = new Date();

  if (!wasCorrect) {
    // Wrong answer → review tomorrow regardless of level
    nextReview.setDate(nextReview.getDate() + 1);
  } else {
    nextReview.setDate(nextReview.getDate() + intervalDays);
  }

  const now = new Date().toISOString();

  return {
    times_seen: timesSeen,
    times_correct: timesCorrect,
    times_incorrect: timesIncorrect,
    streak,
    mastery_level: newLevel,
    last_seen_at: now,
    last_correct_at: wasCorrect ? now : (current.last_correct_at ?? null),
    next_review_at: nextReview.toISOString(),
  };
}

// ─── Database Operations ────────────────────────────────

/**
 * Update mastery for a single item after an answer
 */
export async function updateItemMastery(
  userId: string,
  contentType: ContentType,
  contentId: string,
  contentCefr: CEFRLevel,
  wasCorrect: boolean,
  contentCategory?: string,
  isHighFrequency?: boolean
): Promise<void> {
  const supabase = createClient();

  // Get existing record
  const existing = await getItemMastery(userId, contentType, contentId);

  // Calculate update
  const update = calculateMasteryUpdate(
    existing || {},
    wasCorrect,
    isHighFrequency
  );

  if (existing) {
    await supabase
      .from("user_content_mastery")
      .update(update)
      .eq("id", existing.id);
  } else {
    await supabase.from("user_content_mastery").insert({
      user_id: userId,
      content_type: contentType,
      content_id: contentId,
      content_cefr: contentCefr,
      content_category: contentCategory || null,
      ...update,
    });
  }
}

/**
 * Batch update mastery after a lesson.
 * Processes sequentially to avoid race conditions on same items.
 */
export async function batchUpdateMastery(
  userId: string,
  results: Array<{
    contentType: ContentType;
    contentId: string;
    contentCefr: CEFRLevel;
    contentCategory?: string;
    wasCorrect: boolean;
    isHighFrequency?: boolean;
  }>
): Promise<void> {
  for (const result of results) {
    await updateItemMastery(
      userId,
      result.contentType,
      result.contentId,
      result.contentCefr,
      result.wasCorrect,
      result.contentCategory,
      result.isHighFrequency
    );
  }
}

// ─── Aggregation Functions ──────────────────────────────

export interface CEFRProgress {
  level: CEFRLevel;
  totalItems: number;
  mastered: number; // level >= 3 (learned + mastered + permanent)
  familiar: number; // level 2
  introduced: number; // level 1
  unseen: number; // level 0 (inferred from total - tracked)
  readiness: number; // 0-1 percentage
  vocabProgress: number; // 0-1
  verbProgress: number; // 0-1
  grammarProgress: number; // 0-1
}

/**
 * Get CEFR readiness for a level
 */
export async function getCEFRProgress(
  userId: string,
  cefr: CEFRLevel,
  contentTotals: { vocab: number; verbs: number; grammar: number }
): Promise<CEFRProgress> {
  const records = await getUserMastery(userId, { cefr });

  const vocabRecords = records.filter((r) => r.content_type === "vocab");
  const verbRecords = records.filter((r) => r.content_type === "verb");
  const grammarRecords = records.filter((r) => r.content_type === "grammar");

  const countMastered = (arr: MasteryRecord[]) =>
    arr.filter((r) => r.mastery_level >= 3).length;
  const countFamiliar = (arr: MasteryRecord[]) =>
    arr.filter((r) => r.mastery_level === 2).length;
  const countIntroduced = (arr: MasteryRecord[]) =>
    arr.filter((r) => r.mastery_level === 1).length;

  const vocabMastered = countMastered(vocabRecords);
  const verbsMastered = countMastered(verbRecords);
  const grammarMastered = countMastered(grammarRecords);

  const totalTracked = records.length;
  const totalItems =
    contentTotals.vocab + contentTotals.verbs + contentTotals.grammar;
  const totalMastered = vocabMastered + verbsMastered + grammarMastered;

  // Weighted readiness: vocab 40%, verbs 30%, grammar 30%
  const vocabPct =
    contentTotals.vocab > 0 ? vocabMastered / contentTotals.vocab : 0;
  const verbPct =
    contentTotals.verbs > 0 ? verbsMastered / contentTotals.verbs : 0;
  const grammarPct =
    contentTotals.grammar > 0 ? grammarMastered / contentTotals.grammar : 0;
  const readiness = vocabPct * 0.4 + verbPct * 0.3 + grammarPct * 0.3;

  return {
    level: cefr,
    totalItems,
    mastered: totalMastered,
    familiar: countFamiliar(records),
    introduced: countIntroduced(records),
    unseen: totalItems - totalTracked,
    readiness,
    vocabProgress: vocabPct,
    verbProgress: verbPct,
    grammarProgress: grammarPct,
  };
}

/**
 * Get items due for review
 */
export async function getDueForReview(
  userId: string,
  limit: number = 20
): Promise<MasteryRecord[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("user_content_mastery")
    .select("*")
    .eq("user_id", userId)
    .lte("next_review_at", new Date().toISOString())
    .gte("mastery_level", 1) // Only review items that have been introduced
    .order("next_review_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Review fetch error:", error);
    return [];
  }
  return data || [];
}

/**
 * Count items due for review (for showing badge/prompt)
 */
export async function getReviewCount(userId: string): Promise<number> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("user_content_mastery")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .lte("next_review_at", new Date().toISOString())
    .gte("mastery_level", 1);

  if (error) return 0;
  return count || 0;
}
