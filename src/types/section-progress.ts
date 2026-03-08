/**
 * Section progress types for the legacy level-test progress (conjugations, vocabulary, grammar).
 * Used by progress-service, progress.ts, migration-banner, and home-progress-banner.
 * Level definitions (levels.json) and test routes have been removed.
 */

export interface SectionProgress {
  currentLevel: string;
  highestPassed: string | null;
  lastTestScore: number | null;
  lastTestDate: string | null;
  totalTestsTaken: number;
  attempts: Record<string, number>;
}

export interface UserProgress {
  conjugations: SectionProgress;
  vocabulary: SectionProgress;
  grammar: SectionProgress;
}

function defaultSectionProgress(): SectionProgress {
  return {
    currentLevel: "A1.1",
    highestPassed: null,
    lastTestScore: null,
    lastTestDate: null,
    totalTestsTaken: 0,
    attempts: {},
  };
}

export const DEFAULT_PROGRESS: UserProgress = {
  conjugations: defaultSectionProgress(),
  vocabulary: defaultSectionProgress(),
  grammar: defaultSectionProgress(),
};

export const SUB_LEVEL_ORDER = [
  "A1.1", "A1.2", "A1.3", "A1.4", "A1.5",
  "A2.1", "A2.2", "A2.3", "A2.4", "A2.5",
  "B1.1", "B1.2", "B1.3", "B1.4", "B1.5",
] as const;

export type SubLevelKey = (typeof SUB_LEVEL_ORDER)[number];

export function getNextLevel(level: string): string | null {
  const i = SUB_LEVEL_ORDER.indexOf(level as SubLevelKey);
  if (i < 0 || i >= SUB_LEVEL_ORDER.length - 1) return null;
  return SUB_LEVEL_ORDER[i + 1];
}

export const PROGRESS_STORAGE_KEY = "aula-pt-progress";
