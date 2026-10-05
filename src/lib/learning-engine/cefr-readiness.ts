/**
 * Learning Engine — CEFR Readiness
 *
 * Determines level progression: which CEFR level is unlocked,
 * what the user should be studying, and full progression data.
 */

import {
  getCEFRProgress,
  summarizeCEFRProgress,
  type CEFRLevel,
  type CEFRProgress,
  type MasteryRecord,
} from "./mastery-tracker";
import { getContentTotals } from "./content-pool";
import type { SupabaseClient } from "@supabase/supabase-js";

// ─── Constants ──────────────────────────────────────────

/** 75% readiness to unlock next level (not 100% — perfection kills motivation) */
export const READINESS_THRESHOLD = 0.75;

// ─── Functions ──────────────────────────────────────────

/**
 * Check if a CEFR level is unlocked for a user
 */
export async function isCEFRUnlocked(
  userId: string,
  cefr: CEFRLevel,
  client?: SupabaseClient
): Promise<boolean> {
  if (cefr === "A1") return true;

  const prevLevel: CEFRLevel = cefr === "A2" ? "A1" : "A2";
  const prevTotals = getContentTotals(prevLevel);
  const prevProgress = await getCEFRProgress(userId, prevLevel, prevTotals, client);

  return prevProgress.readiness >= READINESS_THRESHOLD;
}

interface LevelProgression {
  progress: CEFRProgress;
  unlocked: boolean;
}

/**
 * Get full progression data for all CEFR levels
 */
export async function getFullProgression(
  userId: string,
  client?: SupabaseClient
): Promise<{
  a1: LevelProgression;
  a2: LevelProgression;
  b1: LevelProgression;
}> {
  const a1Totals = getContentTotals("A1");
  const a2Totals = getContentTotals("A2");
  const b1Totals = getContentTotals("B1");

  const [a1Progress, a2Progress, b1Progress] = await Promise.all([
    getCEFRProgress(userId, "A1", a1Totals, client),
    getCEFRProgress(userId, "A2", a2Totals, client),
    getCEFRProgress(userId, "B1", b1Totals, client),
  ]);

  return {
    a1: { progress: a1Progress, unlocked: true },
    a2: {
      progress: a2Progress,
      unlocked: a1Progress.readiness >= READINESS_THRESHOLD,
    },
    b1: {
      progress: b1Progress,
      unlocked: a2Progress.readiness >= READINESS_THRESHOLD,
    },
  };
}

/**
 * Determine which CEFR level the user should be studying.
 * Returns the highest unlocked level that isn't fully mastered.
 */
export async function getCurrentStudyLevel(
  userId: string,
  client?: SupabaseClient
): Promise<CEFRLevel> {
  const progression = await getFullProgression(userId, client);

  if (progression.b1.unlocked && progression.b1.progress.readiness < 0.95)
    return "B1";

  if (progression.a2.unlocked && progression.a2.progress.readiness < 0.95)
    return "A2";

  return "A1";
}

export interface LevelStanding {
  /** The level being studied */
  level: CEFRLevel;
  /** The level it unlocks, or null at the top */
  next: CEFRLevel | null;
  /** 0–1 progress toward unlocking `next` (or toward full readiness at the top) */
  progress: number;
}

/**
 * Pure: where the learner stands, from mastery records already in hand.
 * Same rules as getCurrentStudyLevel; progress is readiness over the unlock threshold.
 */
export function standingFromRecords(records: MasteryRecord[]): LevelStanding {
  const a1 = summarizeCEFRProgress(records, "A1", getContentTotals("A1"));
  const a2 = summarizeCEFRProgress(records, "A2", getContentTotals("A2"));
  const b1 = summarizeCEFRProgress(records, "B1", getContentTotals("B1"));
  const a2Unlocked = a1.readiness >= READINESS_THRESHOLD;
  const b1Unlocked = a2.readiness >= READINESS_THRESHOLD;

  const clamp = (n: number) => Math.max(0, Math.min(1, n));
  if (b1Unlocked && b1.readiness < 0.95) return { level: "B1", next: null, progress: clamp(b1.readiness) };
  if (a2Unlocked && a2.readiness < 0.95) {
    return { level: "A2", next: "B1", progress: clamp(a2.readiness / READINESS_THRESHOLD) };
  }
  return { level: "A1", next: "A2", progress: clamp(a1.readiness / READINESS_THRESHOLD) };
}
