/**
 * What the rule-based planner knows about a student.
 * Assembled from the account's own progress. Nothing here calls out.
 */

export interface ContextItem {
  type: "vocab" | "verb" | "grammar";
  /** vocab: the word; verb: lowercase slug; grammar: topic id */
  id: string;
  cefr: "A1" | "A2" | "B1";
  /** times_correct / times_seen, when known */
  accuracy?: number;
}

export interface StudentContext {
  currentLevel: "A1" | "A2" | "B1";
  lessonsCompleted: number;
  totalLessons: number;
  daysSinceLastSession: number;
  weakAreas: string[];
  availableVocabCategories: string[];
  availableVerbSlugs: string[];
  availableGrammarTopics: string[];
  cultureItemCount: number;
  overdueReviewItems: string[];
  /** Structured mastery state for the rule-based planner (most urgent first). */
  dueItems: ContextItem[];
  weakItems: ContextItem[];
  /** "type:id" of every item the student has already met. */
  seenIds: string[];
}
