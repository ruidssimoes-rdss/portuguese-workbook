/**
 * The shape of a practice session Elísio plans from the student's progress.
 * The planner names what to practise; the resolver loads it from the course.
 */

// ── Session plan ───────────────────────────────────────────

export interface AISessionPlan {
  sessionTitle: string;
  sessionTitlePt: string;
  difficulty: "foundation" | "developing" | "confident";
  estimatedMinutes: number;
  focusAreas: AIFocusArea[];
  reviewPriority: "new" | "weak" | "mixed";
}

export interface AIFocusArea {
  type: "vocabulary" | "verbs" | "grammar" | "culture";

  // For vocabulary
  vocabCategories?: string[];
  /** Exact words (vocab.json `portuguese`), used by the rule-based planner for due/new items. */
  vocabWords?: string[];
  vocabCefr?: "A1" | "A2" | "B1";
  vocabCount?: number;

  // For verbs
  verbSlugs?: string[];
  verbTenses?: string[];
  verbCount?: number;

  // For grammar
  grammarTopicSlugs?: string[];

  // For culture
  cultureCount?: number;
}

// ── Explanation (Level 2 — optional) ──────────────────────

export interface AIExplanationRequest {
  wrongAnswer: string;
  correctAnswer: string;
  exerciseType: string;
  context: string;
  studentLevel: "A1" | "A2" | "B1";
}

export interface AIExplanation {
  explanation: string;
  tip: string;
  relatedRule?: string;
}
