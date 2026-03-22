/**
 * Context Assembler — queries Supabase for student progress and builds
 * the StudentContext that feeds into the AI prompt.
 *
 * Uses both legacy tables (user_lesson_progress, user_vocabulary, user_verbs)
 * and the new user_content_mastery table from the learning engine.
 */

import { createClient } from "@/lib/supabase/server";
import type { StudentContext } from "./prompts";
import { getContentInventory } from "./content-index";

export async function assembleStudentContext(userId: string): Promise<StudentContext> {
  const supabase = await createClient();
  const inventory = getContentInventory();

  // Run all queries in parallel — includes new mastery table
  const [profileRes, progressRes, vocabRes, verbsRes, settingsRes, tutorRes, masteryRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("self_assessed_level")
      .eq("id", userId)
      .single(),
    supabase
      .from("user_lesson_progress")
      .select("lesson_id, accuracy_score, completed, completed_at")
      .eq("user_id", userId)
      .eq("completed", true),
    supabase
      .from("user_vocabulary")
      .select("word_portuguese, category, familiarity, next_review")
      .eq("user_id", userId),
    supabase
      .from("user_verbs")
      .select("verb, familiarity, next_review")
      .eq("user_id", userId),
    supabase
      .from("user_settings")
      .select("daily_goal")
      .eq("user_id", userId)
      .single(),
    supabase
      .from("tutor_sessions")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1),
    // New mastery table — graceful if it doesn't exist yet
    supabase
      .from("user_content_mastery")
      .select("content_type, content_id, content_cefr, mastery_level, times_correct, times_seen, streak, next_review_at")
      .eq("user_id", userId),
  ]);

  const completedLessons = progressRes.data ?? [];
  const completedCount = completedLessons.length;
  const masteryRows = masteryRes.data ?? [];

  // Determine level from mastery data if available, fall back to old method
  const currentLevel = determineLevelFromMastery(masteryRows, completedCount);

  // Days since last session
  const lastLessonDate = completedLessons
    .filter((l) => l.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0]?.completed_at;
  const lastTutorDate = tutorRes.data?.[0]?.created_at;
  const lastActivity = [lastLessonDate, lastTutorDate].filter(Boolean).sort().reverse()[0];
  const daysSinceLastSession = lastActivity
    ? Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  // Build weak areas from mastery data (preferred) or legacy data
  const weakAreas = masteryRows.length > 0
    ? identifyWeakAreasFromMastery(masteryRows)
    : identifyWeakAreas(vocabRes.data ?? [], verbsRes.data ?? [], completedLessons);

  // Overdue review items from mastery data (preferred) or legacy data
  const overdueReviewItems = masteryRows.length > 0
    ? getOverdueFromMastery(masteryRows)
    : getOverdueItems(vocabRes.data ?? [], verbsRes.data ?? []);

  return {
    currentLevel,
    lessonsCompleted: completedCount,
    totalLessons: 54,
    daysSinceLastSession,
    weakAreas,
    availableVocabCategories: inventory.vocab.categoriesByCefr[currentLevel] ?? inventory.vocab.categories,
    availableVerbSlugs: inventory.verbs.slugsByCefr[currentLevel] ?? inventory.verbs.slugs.slice(0, 30),
    availableGrammarTopics: inventory.grammar.topicsByCefr[currentLevel] ?? inventory.grammar.topicSlugs,
    cultureItemCount: inventory.culture.totalItems,
    overdueReviewItems,
  };
}

// ─── Level Detection ────────────────────────────────────

interface MasteryRow {
  content_type: string;
  content_id: string;
  content_cefr: string;
  mastery_level: number;
  times_correct: number;
  times_seen: number;
  streak: number;
  next_review_at: string | null;
}

function determineLevelFromMastery(
  masteryRows: MasteryRow[],
  legacyLessonCount: number
): "A1" | "A2" | "B1" {
  if (masteryRows.length === 0) {
    // Fall back to legacy
    if (legacyLessonCount < 18) return "A1";
    if (legacyLessonCount < 34) return "A2";
    return "B1";
  }

  // Count mastered items per level
  const a1Mastered = masteryRows.filter(r => r.content_cefr === "A1" && r.mastery_level >= 3).length;
  const a1Total = masteryRows.filter(r => r.content_cefr === "A1").length;
  const a2Mastered = masteryRows.filter(r => r.content_cefr === "A2" && r.mastery_level >= 3).length;

  // Simple heuristic: if >75% of seen A1 items mastered and some A2 activity, level is A2+
  const a1Readiness = a1Total > 0 ? a1Mastered / a1Total : 0;
  if (a1Readiness >= 0.75 && a2Mastered > 0) {
    const a2Total = masteryRows.filter(r => r.content_cefr === "A2").length;
    const a2Readiness = a2Total > 0 ? a2Mastered / a2Total : 0;
    if (a2Readiness >= 0.75) return "B1";
    return "A2";
  }

  return "A1";
}

// ─── Weak Areas from Mastery ────────────────────────────

function identifyWeakAreasFromMastery(rows: MasteryRow[]): string[] {
  const weakAreas: string[] = [];
  const now = new Date();

  for (const r of rows) {
    if (r.mastery_level === 0) continue;

    const accuracy = r.times_seen > 0 ? r.times_correct / r.times_seen : 1;

    // Low accuracy items
    if (r.times_seen >= 3 && accuracy < 0.5) {
      weakAreas.push(`${r.content_type}:${r.content_id} (${Math.round(accuracy * 100)}% accuracy)`);
    }

    // Broken streaks on familiar+ items
    if (r.streak === 0 && r.mastery_level >= 2 && r.times_seen >= 3) {
      weakAreas.push(`${r.content_type}:${r.content_id} (broken streak, level ${r.mastery_level})`);
    }
  }

  return weakAreas.slice(0, 15);
}

function getOverdueFromMastery(rows: MasteryRow[]): string[] {
  const now = new Date();
  return rows
    .filter(r => r.next_review_at && new Date(r.next_review_at) < now && r.mastery_level >= 1)
    .sort((a, b) => new Date(a.next_review_at!).getTime() - new Date(b.next_review_at!).getTime())
    .slice(0, 10)
    .map(r => `${r.content_type}:${r.content_id}`);
}

// ─── Legacy Fallbacks ───────────────────────────────────

function identifyWeakAreas(
  vocabRows: Array<{ word_portuguese: string; category: string; familiarity: number; next_review: string | null }>,
  verbRows: Array<{ verb: string; familiarity: number; next_review: string | null }>,
  lessonProgress: Array<{ lesson_id: string; accuracy_score: number | null }>,
): string[] {
  const weakAreas: string[] = [];

  const catFam = new Map<string, { sum: number; count: number }>();
  for (const v of vocabRows) {
    const e = catFam.get(v.category) ?? { sum: 0, count: 0 };
    e.sum += v.familiarity;
    e.count++;
    catFam.set(v.category, e);
  }
  for (const [cat, s] of catFam) {
    if (s.count >= 3 && s.sum / s.count < 2) {
      weakAreas.push(`vocab:${cat} (avg familiarity ${(s.sum / s.count).toFixed(1)})`);
    }
  }

  for (const v of verbRows) {
    if (v.familiarity < 2) {
      weakAreas.push(`verb:${v.verb} (familiarity ${v.familiarity})`);
    }
  }

  for (const l of lessonProgress) {
    if (l.accuracy_score !== null && l.accuracy_score < 0.7) {
      weakAreas.push(`lesson:${l.lesson_id} (${Math.round(l.accuracy_score * 100)}%)`);
    }
  }

  return weakAreas.slice(0, 15);
}

function getOverdueItems(
  vocabRows: Array<{ word_portuguese: string; category: string; next_review: string | null }>,
  verbRows: Array<{ verb: string; next_review: string | null }>,
): string[] {
  const now = new Date();
  const overdue: string[] = [];

  for (const v of vocabRows) {
    if (v.next_review && new Date(v.next_review) < now) {
      overdue.push(`vocab:${v.word_portuguese} (${v.category})`);
    }
  }

  for (const v of verbRows) {
    if (v.next_review && new Date(v.next_review) < now) {
      overdue.push(`verb:${v.verb}`);
    }
  }

  return overdue.slice(0, 10);
}
