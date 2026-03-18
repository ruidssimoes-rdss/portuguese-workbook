/**
 * Difficulty modifiers — how difficulty affects each exercise type.
 */

import type { ExerciseDifficulty } from "@/types/blocks";

export interface DifficultyModifiers {
  showTranslation: boolean;
  showPronunciation: boolean;
  acceptPartialMatch: boolean;
  timeLimit?: number;
  hintAvailable: boolean;
  reducedOptions?: number;
}

export function getModifiers(difficulty: ExerciseDifficulty): DifficultyModifiers {
  switch (difficulty) {
    case "foundation":
      return {
        showTranslation: true,
        showPronunciation: true,
        acceptPartialMatch: true,
        hintAvailable: true,
        reducedOptions: 3,
      };
    case "developing":
      return {
        showTranslation: true,
        showPronunciation: false,
        acceptPartialMatch: false,
        hintAvailable: true,
      };
    case "confident":
      return {
        showTranslation: false,
        showPronunciation: false,
        acceptPartialMatch: false,
        hintAvailable: false,
      };
  }
}
