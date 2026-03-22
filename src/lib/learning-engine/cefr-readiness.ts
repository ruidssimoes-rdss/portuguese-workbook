/**
 * Learning Engine — CEFR Readiness
 *
 * Determines level progression: which CEFR level is unlocked,
 * what the user should be studying, and full progression data.
 */

import { getCEFRProgress, type CEFRLevel, type CEFRProgress } from "./mastery-tracker";
import { getContentTotals } from "./content-pool";

// ─── Constants ──────────────────────────────────────────

/** 75% readiness to unlock next level (not 100% — perfection kills motivation) */
export const READINESS_THRESHOLD = 0.75;

// ─── Functions ──────────────────────────────────────────

/**
 * Check if a CEFR level is unlocked for a user
 */
export async function isCEFRUnlocked(
  userId: string,
  cefr: CEFRLevel
): Promise<boolean> {
  if (cefr === "A1") return true;

  const prevLevel: CEFRLevel = cefr === "A2" ? "A1" : "A2";
  const prevTotals = getContentTotals(prevLevel);
  const prevProgress = await getCEFRProgress(userId, prevLevel, prevTotals);

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
  userId: string
): Promise<{
  a1: LevelProgression;
  a2: LevelProgression;
  b1: LevelProgression;
}> {
  const a1Totals = getContentTotals("A1");
  const a2Totals = getContentTotals("A2");
  const b1Totals = getContentTotals("B1");

  const a1Progress = await getCEFRProgress(userId, "A1", a1Totals);
  const a2Progress = await getCEFRProgress(userId, "A2", a2Totals);
  const b1Progress = await getCEFRProgress(userId, "B1", b1Totals);

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
  userId: string
): Promise<CEFRLevel> {
  const progression = await getFullProgression(userId);

  if (progression.b1.unlocked && progression.b1.progress.readiness < 0.95)
    return "B1";

  if (progression.a2.unlocked && progression.a2.progress.readiness < 0.95)
    return "A2";

  return "A1";
}
