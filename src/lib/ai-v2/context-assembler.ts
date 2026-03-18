/**
 * Context Assembler — queries Supabase for student progress and builds
 * the StudentContext that feeds into the AI prompt.
 */

import { createClient } from "@/lib/supabase/server";
import type { StudentContext } from "./prompts";
import { getContentInventory } from "./content-index";

function determineLevel(lessonsCompleted: number): "A1" | "A2" | "B1" {
  if (lessonsCompleted < 18) return "A1";
  if (lessonsCompleted < 34) return "A2";
  return "B1";
}

export async function assembleStudentContext(userId: string): Promise<StudentContext> {
  const supabase = await createClient();
  const inventory = getContentInventory();

  // Run all queries in parallel
  const [profileRes, progressRes, vocabRes, verbsRes, settingsRes, tutorRes] = await Promise.all([
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
  ]);

  const completedLessons = progressRes.data ?? [];
  const completedCount = completedLessons.length;
  const currentLevel = determineLevel(completedCount);

  // Days since last session
  const lastLessonDate = completedLessons
    .filter((l) => l.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0]?.completed_at;
  const lastTutorDate = tutorRes.data?.[0]?.created_at;
  const lastActivity = [lastLessonDate, lastTutorDate].filter(Boolean).sort().reverse()[0];
  const daysSinceLastSession = lastActivity
    ? Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  // Weak areas
  const weakAreas = identifyWeakAreas(
    vocabRes.data ?? [],
    verbsRes.data ?? [],
    completedLessons,
  );

  // Overdue review items
  const overdueReviewItems = getOverdueItems(
    vocabRes.data ?? [],
    verbsRes.data ?? [],
  );

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

function identifyWeakAreas(
  vocabRows: Array<{ word_portuguese: string; category: string; familiarity: number; next_review: string | null }>,
  verbRows: Array<{ verb: string; familiarity: number; next_review: string | null }>,
  lessonProgress: Array<{ lesson_id: string; accuracy_score: number | null }>,
): string[] {
  const weakAreas: string[] = [];

  // Vocab categories where average familiarity < 2
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

  // Verbs where familiarity < 2
  for (const v of verbRows) {
    if (v.familiarity < 2) {
      weakAreas.push(`verb:${v.verb} (familiarity ${v.familiarity})`);
    }
  }

  // Lessons with low accuracy
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
