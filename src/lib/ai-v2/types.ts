/**
 * AI-specific TypeScript types for the v2 AI integration.
 * These define the contract between the AI and the content resolver.
 */

// ── AI Session Plan ────────────────────────────────────────
// The AI says WHAT to practice; the resolver fetches the actual content.

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
