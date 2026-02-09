"use client";

import { createClient } from "@/lib/supabase/client";
import { getProgress as getLocalProgressSync, setProgress as setLocalProgress } from "@/lib/progress";
import {
  DEFAULT_PROGRESS,
  PROGRESS_STORAGE_KEY,
  getNextLevel,
  type UserProgress,
  type SectionProgress,
} from "@/types/levels";

type SectionKey = "conjugations" | "vocabulary" | "grammar";

function defaultSection(): SectionProgress {
  return {
    currentLevel: "A1.1",
    highestPassed: null,
    lastTestScore: null,
    lastTestDate: null,
    totalTestsTaken: 0,
    attempts: {},
  };
}

function rowToSection(row: {
  current_level: string;
  highest_passed: string | null;
  last_test_score: number | null;
  last_test_date: string | null;
  total_tests_taken: number;
  attempts: Record<string, number> | null;
}): SectionProgress {
  return {
    currentLevel: row.current_level ?? "A1.1",
    highestPassed: row.highest_passed ?? null,
    lastTestScore: row.last_test_score ?? null,
    lastTestDate: row.last_test_date ?? null,
    totalTestsTaken: row.total_tests_taken ?? 0,
    attempts: row.attempts && typeof row.attempts === "object" ? row.attempts : {},
  };
}

function sectionToRow(section: SectionProgress) {
  return {
    current_level: section.currentLevel,
    highest_passed: section.highestPassed,
    last_test_score: section.lastTestScore,
    last_test_date: section.lastTestDate,
    total_tests_taken: section.totalTestsTaken,
    attempts: section.attempts ?? {},
  };
}

/**
 * Returns the user's progress (from Supabase if logged in, localStorage if not).
 */
export async function getProgress(userId?: string): Promise<UserProgress> {
  if (!userId) {
    if (typeof window === "undefined") return DEFAULT_PROGRESS;
    return getLocalProgressSync();
  }

  try {
    const supabase = createClient();
    const { data: rows, error } = await supabase
      .from("user_section_progress")
      .select("section, current_level, highest_passed, last_test_score, last_test_date, total_tests_taken, attempts")
      .eq("user_id", userId);

    if (error) {
      console.warn("[progress-service] getProgress Supabase error:", error.message);
      if (typeof window !== "undefined") return getLocalProgressSync();
      return DEFAULT_PROGRESS;
    }

    const progress: UserProgress = {
      conjugations: defaultSection(),
      vocabulary: defaultSection(),
      grammar: defaultSection(),
    };

    for (const row of rows ?? []) {
      const section = row.section as SectionKey;
      if (section in progress) {
        progress[section] = rowToSection({
          current_level: row.current_level,
          highest_passed: row.highest_passed,
          last_test_score: row.last_test_score,
          last_test_date: row.last_test_date,
          total_tests_taken: row.total_tests_taken ?? 0,
          attempts: (row.attempts as Record<string, number>) ?? {},
        });
      }
    }

    return progress;
  } catch (e) {
    console.warn("[progress-service] getProgress error:", e);
    if (typeof window !== "undefined") return getLocalProgressSync();
    return DEFAULT_PROGRESS;
  }
}

/**
 * Updates a section's progress (saves to Supabase if logged in, localStorage if not).
 */
export async function updateSectionProgress(
  section: SectionKey,
  update: Partial<SectionProgress>,
  userId?: string
): Promise<void> {
  if (!userId) {
    if (typeof window === "undefined") return;
    const current = getLocalProgressSync();
    const merged: SectionProgress = { ...current[section], ...update };
    current[section] = merged;
    setLocalProgress(current);
    return;
  }

  try {
    const supabase = createClient();
    const currentProgress = await getProgress(userId);
    const merged: SectionProgress = { ...currentProgress[section], ...update };
    const row = sectionToRow(merged);

    const { error } = await supabase.from("user_section_progress").upsert(
      {
        user_id: userId,
        section,
        ...row,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,section" }
    );

    if (error) {
      console.warn("[progress-service] updateSectionProgress Supabase error:", error.message);
      if (typeof window !== "undefined") {
        const local = getLocalProgressSync();
        local[section] = merged;
        setLocalProgress(local);
      }
    }
  } catch (e) {
    console.warn("[progress-service] updateSectionProgress error:", e);
    if (typeof window !== "undefined") {
      const current = getLocalProgressSync();
      const merged: SectionProgress = { ...current[section], ...update };
      current[section] = merged;
      setLocalProgress(current);
    }
  }
}

/**
 * Saves a level test result (same semantics as progress.saveLevelResult).
 * Use this from the test page so progress goes to Supabase when logged in.
 */
export async function saveLevelResult(
  section: SectionKey,
  level: string,
  passed: boolean,
  score: number,
  userId?: string
): Promise<{ savedToCloud: boolean; fallbackToLocal?: boolean }> {
  const current = userId ? await getProgress(userId) : getLocalProgressSync();
  const s = { ...current[section] };
  s.lastTestScore = score;
  s.lastTestDate = new Date().toISOString();
  s.totalTestsTaken = (s.totalTestsTaken || 0) + 1;
  s.attempts = { ...s.attempts, [level]: (s.attempts[level] || 0) + 1 };
  if (passed) {
    const next = getNextLevel(level);
    s.highestPassed = level;
    s.currentLevel = next ?? level;
  }

  if (!userId) {
    if (typeof window !== "undefined") {
      current[section] = s;
      setLocalProgress(current);
    }
    return { savedToCloud: false };
  }

  try {
    const supabase = createClient();
    const row = sectionToRow(s);
    const { error } = await supabase.from("user_section_progress").upsert(
      {
        user_id: userId,
        section,
        ...row,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,section" }
    );

    if (error) {
      console.warn("[progress-service] saveLevelResult Supabase error:", error.message);
      if (typeof window !== "undefined") {
        current[section] = s;
        setLocalProgress(current);
      }
      return { savedToCloud: false, fallbackToLocal: true };
    }
    return { savedToCloud: true };
  } catch (e) {
    console.warn("[progress-service] saveLevelResult error:", e);
    if (typeof window !== "undefined") {
      current[section] = s;
      setLocalProgress(current);
    }
    return { savedToCloud: false, fallbackToLocal: true };
  }
}

/**
 * Checks if localStorage has progress data worth migrating.
 */
export function hasLocalProgress(): boolean {
  if (typeof window === "undefined") return false;
  const progress = getLocalProgressSync();
  const sections: SectionKey[] = ["conjugations", "vocabulary", "grammar"];
  return sections.some(
    (sec) =>
      progress[sec].currentLevel !== "A1.1" || progress[sec].totalTestsTaken > 0
  );
}

/**
 * Gets localStorage progress for migration preview (uses same normalization as progress.ts).
 */
export function getLocalProgress(): UserProgress | null {
  if (typeof window === "undefined") return null;
  const progress = getLocalProgressSync();
  const hasAny =
    progress.conjugations.currentLevel !== "A1.1" ||
    progress.conjugations.totalTestsTaken > 0 ||
    progress.vocabulary.currentLevel !== "A1.1" ||
    progress.vocabulary.totalTestsTaken > 0 ||
    progress.grammar.currentLevel !== "A1.1" ||
    progress.grammar.totalTestsTaken > 0;
  return hasAny ? progress : null;
}

/**
 * Migrates localStorage data to Supabase, then clears localStorage.
 */
export async function migrateLocalToSupabase(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  if (typeof window === "undefined") return { success: true };
  const local = getLocalProgressSync();
  const hasAny =
    local.conjugations.currentLevel !== "A1.1" ||
    local.conjugations.totalTestsTaken > 0 ||
    local.vocabulary.currentLevel !== "A1.1" ||
    local.vocabulary.totalTestsTaken > 0 ||
    local.grammar.currentLevel !== "A1.1" ||
    local.grammar.totalTestsTaken > 0;
  if (!hasAny) return { success: true };

  try {
    const supabase = createClient();
    const sections: SectionKey[] = ["conjugations", "vocabulary", "grammar"];

    for (const section of sections) {
      const s = local[section];
      const hasData = s.currentLevel !== "A1.1" || s.totalTestsTaken > 0;
      if (!hasData) continue;

      const row = sectionToRow(s);
      const { error } = await supabase.from("user_section_progress").upsert(
        {
          user_id: userId,
          section,
          ...row,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,section" }
      );

      if (error) {
        return { success: false, error: error.message };
      }
    }

    try {
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
    } catch {
      // ignore
    }
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { success: false, error: message };
  }
}
