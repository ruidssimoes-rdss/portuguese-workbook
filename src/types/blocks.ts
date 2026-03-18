/**
 * Block Type System — Single source of truth for the composable block architecture.
 *
 * Every block component imports its types from this file.
 * Content data types reference (not duplicate) existing types from src/data/lessons.ts.
 */

import type { VocabItem, VerbItem, GrammarItem, CultureItem, PracticeItem, Lesson, LessonStage } from "@/data/lessons";

// ─── Block Type Registry ───────────────────────────────────

export type ContentBlockType =
  | "vocab"
  | "verb"
  | "grammar"
  | "progress"
  | "explanation"
  | "pronunciation";

export type ExerciseBlockType =
  | "exercise-translate"
  | "exercise-conjugate"
  | "exercise-fill-gap"
  | "exercise-build-sentence"
  | "exercise-choose-correct"
  | "exercise-spot-error"
  | "exercise-listen-write"
  | "exercise-match-pairs"
  | "exercise-speak";

export type LayoutBlockType =
  | "session-shell"
  | "content-grid"
  | "learn-carousel"
  | "review-stack";

export type BlockType = ContentBlockType | ExerciseBlockType;

// ─── Variant types ─────────────────────────────────────────

export type VocabVariant = "card" | "row" | "flashcard" | "inline";
export type VerbVariant = "collapsed" | "expanded" | "drill";
export type GrammarVariant = "inline" | "expanded" | "summary";
export type ProgressVariant = "bar" | "ring" | "stat" | "streak";
export type ExplanationVariant = "inline" | "expanded" | "toast";
export type PronunciationVariant = "inline" | "expanded" | "guide";

// ─── Familiarity (for spaced repetition) ───────────────────

export type FamiliarityState = "new" | "learning" | "known" | "mastered";

// ─── Content block data ────────────────────────────────────

export interface VocabBlockData extends VocabItem {
  familiarity?: FamiliarityState;
  gender?: "masculine" | "feminine";
  category?: string;
}

export interface VerbBlockData {
  verb: string;
  verbTranslation: string;
  tense: string;
  tenseLabel: string;
  conjugations: Array<{ pronoun: string; form: string }>;
  verbSlug: string;
  pronunciation?: string;
}

export interface GrammarBlockData {
  topicSlug: string;
  topicTitle: string;
  topicTitlePt: string;
  rules: Array<{
    rule: string;
    rulePt: string;
    examples: Array<{ pt: string; en: string }>;
  }>;
  tips?: string[];
  tipsPt?: string[];
}

export interface ProgressBlockData {
  current: number;
  max: number;
  label: string;
  sublabel?: string;
  trend?: "up" | "down" | "flat";
  unit?: string;
}

export interface ExplanationBlockData {
  explanation: string;
  relatedRule?: {
    topicSlug: string;
    ruleIndex: number;
  };
  examples?: Array<{ pt: string; en: string }>;
  severity?: "info" | "correction" | "tip";
}

export interface PronunciationBlockData {
  word: string;
  translation: string;
  ipa: string;
  phonetic: string;
  audioAvailable: boolean;
  tips?: string[];
  soundCategory?: string;
}

export interface SpeakExerciseData {
  exerciseType: "speak";
  targetText: string;
  targetTranslation: string;
  pronunciation: string;
  acceptedVariants?: string[];
  audioHint?: boolean;
}

// ─── Block Descriptor (the AI/renderer contract) ──────────

export type BlockDescriptor =
  | { type: "vocab"; data: VocabBlockData; variant?: VocabVariant }
  | { type: "verb"; data: VerbBlockData; variant?: VerbVariant }
  | { type: "grammar"; data: GrammarBlockData; variant?: GrammarVariant }
  | { type: "progress"; data: ProgressBlockData; variant?: ProgressVariant }
  | { type: "explanation"; data: ExplanationBlockData; variant?: ExplanationVariant }
  | { type: "pronunciation"; data: PronunciationBlockData; variant?: PronunciationVariant }
  | { type: ExerciseBlockType; data: ExerciseData; variant?: never };

/** Helper to extract data type from block type */
export type BlockDataFor<T extends BlockType> = Extract<BlockDescriptor, { type: T }>["data"];

// ─── Exercise Difficulty ───────────────────────────────────

export type ExerciseDifficulty = "foundation" | "developing" | "confident";

// ─── Answer Result (universal) ─────────────────────────────

export interface AnswerResult {
  correct: boolean;
  userAnswer: string;
  expectedAnswer: string;
  acceptedAnswers?: string[];
  explanation?: string;
  points: number;
  maxPoints: number;
}

// ─── Exercise Props (shared interface) ─────────────────────

export interface ExerciseProps<T extends ExerciseData = ExerciseData> {
  data: T;
  difficulty: ExerciseDifficulty;
  onAnswer: (result: AnswerResult) => void;
  showFeedback?: boolean;
  showEnglish?: boolean;
  disabled?: boolean;
  className?: string;
}

// ─── Exercise Data (discriminated union) ───────────────────

export type ExerciseData =
  | TranslateExerciseData
  | ConjugateExerciseData
  | FillGapExerciseData
  | BuildSentenceExerciseData
  | ChooseCorrectExerciseData
  | SpotErrorExerciseData
  | ListenWriteExerciseData
  | MatchPairsExerciseData
  | SpeakExerciseData;

export interface TranslateExerciseData {
  exerciseType: "translate";
  word: string;
  correctAnswer: string;
  acceptedAnswers: string[];
  pronunciation?: string;
  direction: "pt-to-en" | "en-to-pt";
}

export interface ConjugateExerciseData {
  exerciseType: "conjugate";
  verb: string;
  verbTranslation: string;
  pronoun: string;
  tense: string;
  tenseLabel: string;
  correctForm: string;
  acceptedForms?: string[];
}

export interface FillGapExerciseData {
  exerciseType: "fill-gap";
  sentence: string;
  correctAnswer: string;
  acceptedAnswers: string[];
  fullSentence: string;
  translation: string;
}

export interface BuildSentenceExerciseData {
  exerciseType: "build-sentence";
  correctOrder: string[];
  scrambledWords: string[];
  translation: string;
}

export interface ChooseCorrectExerciseData {
  exerciseType: "choose-correct";
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface SpotErrorExerciseData {
  exerciseType: "spot-error";
  sentence: string;
  errorWord: string;
  correctWord: string;
  correctedSentence: string;
}

export interface ListenWriteExerciseData {
  exerciseType: "listen-write";
  audioText: string;
  correctAnswer: string;
  acceptedAnswers: string[];
  translation: string;
}

export interface MatchPairsExerciseData {
  exerciseType: "match-pairs";
  pairs: Array<{
    left: string;
    right: string;
  }>;
}

// ─── Layout Props ──────────────────────────────────────────

export interface SessionShellProps {
  lessonTitle: string;
  lessonTitlePt: string;
  cefr: "A1" | "A2" | "B1";
  stages: Array<{
    id: string;
    label: string;
    type: "learn" | "exercise" | "results";
  }>;
  currentStageIndex: number;
  onStageChange: (index: number) => void;
  onComplete: (results: SessionResults) => void;
  children: React.ReactNode;
}

export interface SessionResults {
  totalPoints: number;
  maxPoints: number;
  accuracy: number;
  passed: boolean;
  answers: AnswerResult[];
  completedAt: string;
  timeSpentSeconds: number;
}

export interface ContentGridProps {
  blocks: BlockDescriptor[];
  columns?: 1 | 2 | 3 | 4;
  gap?: "tight" | "normal" | "loose";
  className?: string;
}

export interface LearnCarouselProps {
  items: BlockDescriptor[];
  onComplete: () => void;
  className?: string;
}

export interface ReviewStackProps {
  exercises: Array<{ type: ExerciseBlockType; data: ExerciseData }>;
  difficulty: ExerciseDifficulty;
  showEnglish: boolean;
  passThreshold?: number;
  onComplete: (results: SessionResults) => void;
  className?: string;
}

// ─── Lesson Adapter ────────────────────────────────────────

export interface LessonBlockPlan {
  meta: {
    id: string;
    title: string;
    ptTitle: string;
    cefr: "A1" | "A2" | "B1";
    estimatedMinutes: number;
  };
  learnBlocks: BlockDescriptor[];
  exerciseBlocks: Array<{
    type: ExerciseBlockType;
    data: ExerciseData;
  }>;
  stages: SessionShellProps["stages"];
}

// ─── Re-exports for convenience ────────────────────────────

export type {
  VocabItem,
  VerbItem,
  GrammarItem,
  CultureItem,
  PracticeItem,
  Lesson,
  LessonStage,
} from "@/data/lessons";
