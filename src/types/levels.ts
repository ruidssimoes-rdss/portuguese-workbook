/**
 * CEFR Level Tracker & Placement Test types.
 * Data lives in src/data/levels.json; progress in localStorage (aula-pt-progress).
 */

export interface UserProgress {
  conjugations: SectionProgress;
  vocabulary: SectionProgress;
  grammar: SectionProgress;
  lastTestDate: string | null;
}

export interface SectionProgress {
  level: string;
  completedAt: string | null;
  testScore: number | null;
}

export const DEFAULT_PROGRESS: UserProgress = {
  conjugations: { level: "A1.1", completedAt: null, testScore: null },
  vocabulary: { level: "A1.1", completedAt: null, testScore: null },
  grammar: { level: "A1.1", completedAt: null, testScore: null },
  lastTestDate: null,
};

/** Sub-levels in order for the progress track (A1.1 … B1.5). */
export const SUB_LEVEL_ORDER = [
  "A1.1", "A1.2", "A1.3", "A1.4", "A1.5",
  "A2.1", "A2.2", "A2.3", "A2.4", "A2.5",
  "B1.1", "B1.2", "B1.3", "B1.4", "B1.5",
] as const;

export type SubLevelKey = (typeof SUB_LEVEL_ORDER)[number];

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
  placementTest?: {
    questionsPerTest: number;
    startLevel: string;
    resultMapping?: Record<string, string>;
  };
}

/** State during a placement test. */
export interface PlacementTestState {
  section: "conjugations" | "vocabulary" | "grammar";
  phase: "start" | "question" | "results";
  currentQuestionIndex: number;
  totalQuestions: number;
  adaptiveLevelIndex: number; // index into SUB_LEVEL_ORDER
  correctStreak: number;
  incorrectStreak: number;
  answers: { correct: boolean; levelKey: string }[];
  levelScores: Record<string, { correct: number; total: number }>; // per sub-level
}

/** A single test question. */
export interface TestQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  correctIndex: number;
  explanation?: string;
  levelKey: string;
}

export const PROGRESS_STORAGE_KEY = "aula-pt-progress";
