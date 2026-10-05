/**
 * Learning Engine — Mastery Tracker
 *
 * `user_content_mastery` is the sole source of truth for what a user knows.
 * One row per (user, content item). Scheduling is SM-2 (see ./sm2.ts);
 * mastery_level is derived from repetitions and accuracy, never set by hand.
 */

import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { applySm2, deriveMasteryLevel } from "./sm2";
import { selectReviewCandidates } from "./review-selector";

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
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  last_seen_at: string | null;
  last_correct_at: string | null;
  next_review_at: string | null;
}

export interface MasteryUpdate {
  content_type: ContentType;
  content_id: string;
  was_correct: boolean;
}

export interface MasteryAnswer {
  contentType: ContentType;
  contentId: string;
  contentCefr: CEFRLevel;
  contentCategory?: string;
  wasCorrect: boolean;
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

// ─── Reads ──────────────────────────────────────────────

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
  },
  client?: SupabaseClient
): Promise<MasteryRecord[]> {
  const supabase = client ?? createClient();

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
  contentId: string,
  client?: SupabaseClient
): Promise<MasteryRecord | null> {
  const supabase = client ?? createClient();

  const { data, error } = await supabase
    .from("user_content_mastery")
    .select("*")
    .eq("user_id", userId)
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .maybeSingle();

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
  cefr?: CEFRLevel,
  client?: SupabaseClient
): Promise<Map<string, MasteryRecord>> {
  const records = await getUserMastery(userId, { cefr }, client);
  const map = new Map<string, MasteryRecord>();
  for (const r of records) {
    map.set(`${r.content_type}:${r.content_id}`, r);
  }
  return map;
}

// ─── Mastery Calculation ────────────────────────────────

/**
 * Calculate the new mastery state after an answer.
 * Pure function — SM-2 scheduling plus derived mastery level.
 */
export function calculateMasteryUpdate(
  current: Partial<MasteryRecord>,
  wasCorrect: boolean,
  now: Date = new Date()
): Partial<MasteryRecord> {
  const timesSeen = (current.times_seen || 0) + 1;
  const timesCorrect = (current.times_correct || 0) + (wasCorrect ? 1 : 0);
  const timesIncorrect = (current.times_incorrect || 0) + (wasCorrect ? 0 : 1);
  const streak = wasCorrect ? (current.streak || 0) + 1 : 0;

  const sm2 = applySm2(
    {
      ease_factor: current.ease_factor,
      interval_days: current.interval_days,
      repetitions: current.repetitions,
    },
    wasCorrect,
    now
  );

  const nowIso = now.toISOString();

  return {
    times_seen: timesSeen,
    times_correct: timesCorrect,
    times_incorrect: timesIncorrect,
    streak,
    ease_factor: sm2.ease_factor,
    interval_days: sm2.interval_days,
    repetitions: sm2.repetitions,
    mastery_level: deriveMasteryLevel(sm2.repetitions, timesSeen, timesCorrect),
    last_seen_at: nowIso,
    last_correct_at: wasCorrect ? nowIso : (current.last_correct_at ?? null),
    next_review_at: sm2.next_review_at,
  };
}

// ─── Writes ─────────────────────────────────────────────

/**
 * Update mastery for a single item after an answer.
 * Throws on a database error so callers can surface it.
 */
export async function updateItemMastery(
  userId: string,
  contentType: ContentType,
  contentId: string,
  contentCefr: CEFRLevel,
  wasCorrect: boolean,
  contentCategory?: string
): Promise<void> {
  const supabase = createClient();

  const existing = await getItemMastery(userId, contentType, contentId);
  const update = calculateMasteryUpdate(existing || {}, wasCorrect);

  if (existing) {
    const { error } = await supabase
      .from("user_content_mastery")
      .update(update)
      .eq("id", existing.id);
    if (error) throw new Error(`Mastery update failed for ${contentType}:${contentId}: ${error.message}`);
  } else {
    const { error } = await supabase.from("user_content_mastery").insert({
      user_id: userId,
      content_type: contentType,
      content_id: contentId,
      content_cefr: contentCefr,
      content_category: contentCategory || null,
      ...update,
    });
    if (error) throw new Error(`Mastery insert failed for ${contentType}:${contentId}: ${error.message}`);
  }
}

/**
 * Batch update mastery after a lesson. Every entry is one real answer.
 * Processes sequentially to avoid races on the same item.
 * Throws if any item failed, after attempting all of them.
 */
export async function batchUpdateMastery(
  userId: string,
  results: MasteryAnswer[]
): Promise<void> {
  const failures: string[] = [];
  for (const result of results) {
    try {
      await updateItemMastery(
        userId,
        result.contentType,
        result.contentId,
        result.contentCefr,
        result.wasCorrect,
        result.contentCategory
      );
    } catch (e) {
      failures.push(e instanceof Error ? e.message : String(e));
    }
  }
  if (failures.length > 0) {
    throw new Error(
      `${failures.length} of ${results.length} mastery updates failed. ${failures[0]}`
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
  contentTotals: { vocab: number; verbs: number; grammar: number },
  client?: SupabaseClient
): Promise<CEFRProgress> {
  const records = await getUserMastery(userId, { cefr }, client);
  return summarizeCEFRProgress(records, cefr, contentTotals);
}

/** Pure: CEFR readiness from mastery records already in hand (filtered to any levels). */
export function summarizeCEFRProgress(
  allRecords: MasteryRecord[],
  cefr: CEFRLevel,
  contentTotals: { vocab: number; verbs: number; grammar: number }
): CEFRProgress {
  const records = allRecords.filter((r) => r.content_cefr === cefr);

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
 * Get items due for review (ordered by most overdue)
 */
export async function getDueForReview(
  userId: string,
  limit: number = 20,
  client?: SupabaseClient
): Promise<MasteryRecord[]> {
  const supabase = client ?? createClient();

  const { data, error } = await supabase
    .from("user_content_mastery")
    .select("*")
    .eq("user_id", userId)
    .lte("next_review_at", new Date().toISOString())
    .gte("mastery_level", 1)
    .order("next_review_at", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Review fetch error:", error);
    return [];
  }
  return data || [];
}

/**
 * Count the items a review session would deliver right now.
 * Uses the same selector as generateReviewSession so the two always agree.
 */
export async function getReviewCount(userId: string, client?: SupabaseClient): Promise<number> {
  const records = await getUserMastery(userId, undefined, client);
  return selectReviewCandidates(records).length;
}
