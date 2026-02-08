/**
 * CEFR Level Tracker — linear progression system.
 * Data lives in src/data/levels.json; progress in localStorage (aula-pt-progress).
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

/** Sub-levels in order (A1.1 … B1.5). */
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

export function getLevelIndex(level: string): number {
  const i = SUB_LEVEL_ORDER.indexOf(level as SubLevelKey);
  return i >= 0 ? i : 0;
}

/** Shape of each sub-level in levels.json (conjugations). */
export interface ConjugationSubLevel {
  label: string;
  description: string;
  requiredVerbs: string[] | "all";
  requiredTenses: string[];
  targetAccuracy: number;
}

/** Shape of each sub-level in levels.json (vocabulary). */
export interface VocabSubLevel {
  label: string;
  description: string;
  requiredCategories: string[] | "all";
  requiredSubcategories: string[] | "all_A1" | "all_A1_A2" | "all_B1" | "all";
  targetWordCount?: number;
  targetAccuracy: number;
}

/** Shape of each sub-level in levels.json (grammar). */
export interface GrammarSubLevel {
  label: string;
  description: string;
  topics: string[] | string;
  targetAccuracy: number;
}

export type SubLevel = ConjugationSubLevel | VocabSubLevel | GrammarSubLevel;

/** Levels data file shape. */
export interface LevelsData {
  version: string;
  levels: string[];
  subLevelsPerLevel: number;
  totalSubLevels: number;
  sections: string[];
  conjugations: Record<string, ConjugationSubLevel>;
  vocabulary: Record<string, VocabSubLevel>;
  grammar: Record<string, GrammarSubLevel>;
}

/** A single test question. */
export interface TestQuestion {
  questionText: string;
  questionTextPt?: string;
  options: string[];
  correctAnswer: string;
  correctIndex: number;
  explanation?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  levelKey: string;
}

export const PROGRESS_STORAGE_KEY = "aula-pt-progress";
