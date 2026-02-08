"use client";

import type { UserProgress } from "@/types/levels";
import { DEFAULT_PROGRESS, PROGRESS_STORAGE_KEY } from "@/types/levels";

export function getProgress(): UserProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    return {
      conjugations: parsed.conjugations ?? DEFAULT_PROGRESS.conjugations,
      vocabulary: parsed.vocabulary ?? DEFAULT_PROGRESS.vocabulary,
      grammar: parsed.grammar ?? DEFAULT_PROGRESS.grammar,
      lastTestDate: parsed.lastTestDate ?? null,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function setProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function updateSectionProgress(
  section: keyof Pick<UserProgress, "conjugations" | "vocabulary" | "grammar">,
  level: string,
  testScore: number
): void {
  const progress = getProgress();
  progress[section] = {
    level,
    completedAt: new Date().toISOString(),
    testScore,
  };
  progress.lastTestDate = new Date().toISOString();
  setProgress(progress);
}
