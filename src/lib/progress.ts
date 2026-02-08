"use client";

import type { UserProgress, SectionProgress } from "@/types/levels";
import { DEFAULT_PROGRESS, PROGRESS_STORAGE_KEY, getNextLevel } from "@/types/levels";

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

function isOldShape(parsed: unknown): boolean {
  if (!parsed || typeof parsed !== "object") return false;
  const p = parsed as Record<string, unknown>;
  if (p.lastTestDate !== undefined && !p.conjugations) return true;
  const conj = p.conjugations as Record<string, unknown> | undefined;
  if (conj && typeof conj === "object") {
    if (conj.completedAt !== undefined || (conj.level !== undefined && !("currentLevel" in conj))) return true;
  }
  return false;
}

function normalizeSection(raw: unknown): SectionProgress {
  if (!raw || typeof raw !== "object") return defaultSection();
  const s = raw as Record<string, unknown>;
  const attempts = s.attempts && typeof s.attempts === "object" && !Array.isArray(s.attempts)
    ? (s.attempts as Record<string, number>)
    : {};
  return {
    currentLevel: typeof s.currentLevel === "string" ? s.currentLevel : "A1.1",
    highestPassed: typeof s.highestPassed === "string" || s.highestPassed === null ? s.highestPassed : null,
    lastTestScore: typeof s.lastTestScore === "number" || s.lastTestScore === null ? s.lastTestScore : null,
    lastTestDate: typeof s.lastTestDate === "string" || s.lastTestDate === null ? s.lastTestDate : null,
    totalTestsTaken: typeof s.totalTestsTaken === "number" ? s.totalTestsTaken : 0,
    attempts,
  };
}

export function getProgress(): UserProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as unknown;
    if (isOldShape(parsed)) return DEFAULT_PROGRESS;
    return {
      conjugations: normalizeSection((parsed as Record<string, unknown>).conjugations),
      vocabulary: normalizeSection((parsed as Record<string, unknown>).vocabulary),
      grammar: normalizeSection((parsed as Record<string, unknown>).grammar),
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

type SectionKey = keyof Pick<UserProgress, "conjugations" | "vocabulary" | "grammar">;

export function saveLevelResult(
  section: SectionKey,
  level: string,
  passed: boolean,
  score: number
): void {
  const progress = getProgress();
  const s = { ...progress[section] };
  s.lastTestScore = score;
  s.lastTestDate = new Date().toISOString();
  s.totalTestsTaken = (s.totalTestsTaken || 0) + 1;
  s.attempts = { ...s.attempts, [level]: (s.attempts[level] || 0) + 1 };

  if (passed) {
    const next = getNextLevel(level);
    s.highestPassed = level;
    s.currentLevel = next ?? level;
  }

  progress[section] = s;
  setProgress(progress);
}
