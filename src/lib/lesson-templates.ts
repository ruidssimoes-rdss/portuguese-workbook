/**
 * Fixed exercise templates per CEFR level.
 * Every lesson at a given level has the same exercise MIX.
 * Shuffle only changes ORDER within each round.
 */

import type { ExerciseType } from "./exercise-types";

interface TemplateSlot {
  type: ExerciseType;
  source: "vocab" | "verbs" | "grammar" | "culture" | "practice";
}

export interface LessonTemplate {
  round2: TemplateSlot[];
  round3: TemplateSlot[];
  totalPoints: number;
  passPoints: number;
}

export const A1_TEMPLATE: LessonTemplate = {
  round2: [
    // Vocab: 10
    { type: "mc-pt-to-en", source: "vocab" },
    { type: "mc-pt-to-en", source: "vocab" },
    { type: "mc-pt-to-en", source: "vocab" },
    { type: "mc-pt-to-en", source: "vocab" },
    { type: "mc-en-to-pt", source: "vocab" },
    { type: "mc-en-to-pt", source: "vocab" },
    { type: "mc-en-to-pt", source: "vocab" },
    { type: "mc-en-to-pt", source: "vocab" },
    { type: "match-word", source: "vocab" },
    { type: "match-word", source: "vocab" },
    // Verbs: 6
    { type: "conjugation", source: "verbs" },
    { type: "conjugation", source: "verbs" },
    { type: "conjugation", source: "verbs" },
    { type: "conjugation", source: "verbs" },
    { type: "mc-verb-form", source: "verbs" },
    { type: "mc-verb-form", source: "verbs" },
    // Grammar: 2
    { type: "true-false", source: "grammar" },
    { type: "mc-grammar", source: "grammar" },
    // Practice + Culture: 2
    { type: "fill-blank", source: "practice" },
    { type: "mc-culture", source: "culture" },
  ],
  round3: [
    { type: "fill-blank", source: "practice" },
    { type: "fill-blank", source: "practice" },
    { type: "fill-blank", source: "practice" },
    { type: "translation", source: "practice" },
    { type: "translation", source: "practice" },
    { type: "sentence-build", source: "practice" },
    { type: "error-correction", source: "practice" },
    { type: "word-bank-blank", source: "practice" },
    { type: "word-bank-blank", source: "practice" },
    { type: "mc-grammar", source: "grammar" },
  ],
  totalPoints: 30,
  passPoints: 24,
};

export const A2_TEMPLATE: LessonTemplate = {
  round2: [
    // Vocab: 13
    { type: "mc-pt-to-en", source: "vocab" },
    { type: "mc-pt-to-en", source: "vocab" },
    { type: "mc-pt-to-en", source: "vocab" },
    { type: "mc-pt-to-en", source: "vocab" },
    { type: "mc-pt-to-en", source: "vocab" },
    { type: "mc-en-to-pt", source: "vocab" },
    { type: "mc-en-to-pt", source: "vocab" },
    { type: "mc-en-to-pt", source: "vocab" },
    { type: "mc-en-to-pt", source: "vocab" },
    { type: "mc-en-to-pt", source: "vocab" },
    { type: "match-word", source: "vocab" },
    { type: "match-word", source: "vocab" },
    { type: "match-word", source: "vocab" },
    // Verbs: 7
    { type: "conjugation", source: "verbs" },
    { type: "conjugation", source: "verbs" },
    { type: "conjugation", source: "verbs" },
    { type: "conjugation", source: "verbs" },
    { type: "conjugation", source: "verbs" },
    { type: "mc-verb-form", source: "verbs" },
    { type: "mc-verb-form", source: "verbs" },
    // Grammar: 2
    { type: "true-false", source: "grammar" },
    { type: "mc-grammar", source: "grammar" },
    // Practice + Culture: 2
    { type: "fill-blank", source: "practice" },
    { type: "mc-culture", source: "culture" },
  ],
  round3: [
    { type: "fill-blank", source: "practice" },
    { type: "fill-blank", source: "practice" },
    { type: "fill-blank", source: "practice" },
    { type: "translation", source: "practice" },
    { type: "translation", source: "practice" },
    { type: "translation", source: "practice" },
    { type: "sentence-build", source: "practice" },
    { type: "sentence-build", source: "practice" },
    { type: "error-correction", source: "practice" },
    { type: "word-bank-blank", source: "practice" },
    { type: "word-bank-blank", source: "practice" },
    { type: "mc-grammar", source: "grammar" },
  ],
  totalPoints: 36,
  passPoints: 29,
};

export const B1_TEMPLATE: LessonTemplate = {
  round2: [
    // Vocab: 13
    { type: "mc-pt-to-en", source: "vocab" },
    { type: "mc-pt-to-en", source: "vocab" },
    { type: "mc-pt-to-en", source: "vocab" },
    { type: "mc-pt-to-en", source: "vocab" },
    { type: "mc-pt-to-en", source: "vocab" },
    { type: "mc-en-to-pt", source: "vocab" },
    { type: "mc-en-to-pt", source: "vocab" },
    { type: "mc-en-to-pt", source: "vocab" },
    { type: "mc-en-to-pt", source: "vocab" },
    { type: "mc-en-to-pt", source: "vocab" },
    { type: "match-word", source: "vocab" },
    { type: "match-word", source: "vocab" },
    { type: "match-word", source: "vocab" },
    // Verbs: 9
    { type: "conjugation", source: "verbs" },
    { type: "conjugation", source: "verbs" },
    { type: "conjugation", source: "verbs" },
    { type: "conjugation", source: "verbs" },
    { type: "conjugation", source: "verbs" },
    { type: "conjugation", source: "verbs" },
    { type: "mc-verb-form", source: "verbs" },
    { type: "mc-verb-form", source: "verbs" },
    { type: "mc-verb-form", source: "verbs" },
    // Grammar: 4
    { type: "true-false", source: "grammar" },
    { type: "true-false", source: "grammar" },
    { type: "mc-grammar", source: "grammar" },
    { type: "mc-grammar", source: "grammar" },
    // Practice + Culture: 2
    { type: "fill-blank", source: "practice" },
    { type: "mc-culture", source: "culture" },
  ],
  round3: [
    { type: "fill-blank", source: "practice" },
    { type: "fill-blank", source: "practice" },
    { type: "fill-blank", source: "practice" },
    { type: "translation", source: "practice" },
    { type: "translation", source: "practice" },
    { type: "translation", source: "practice" },
    { type: "translation", source: "practice" },
    { type: "sentence-build", source: "practice" },
    { type: "sentence-build", source: "practice" },
    { type: "error-correction", source: "practice" },
    { type: "error-correction", source: "practice" },
    { type: "word-bank-blank", source: "practice" },
    { type: "word-bank-blank", source: "practice" },
    { type: "mc-grammar", source: "grammar" },
  ],
  totalPoints: 42,
  passPoints: 34,
};

export function getTemplate(cefrLevel: string): LessonTemplate {
  if (cefrLevel === "A2") return A2_TEMPLATE;
  if (cefrLevel === "B1") return B1_TEMPLATE;
  return A1_TEMPLATE;
}
