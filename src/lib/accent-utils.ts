/**
 * Accent-tolerant answer checking for Portuguese language exercises.
 * Accepts answers without diacritics but teaches the correct accented form.
 */

/** Remove diacritics and normalize for comparison */
export function removeAccents(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export interface CheckAnswerResult {
  correct: boolean;
  exactMatch: boolean;
  accentHint?: string;
}

/**
 * Compare user answer against correct answer with accent tolerance.
 * Returns correct=true if the answer matches ignoring diacritics,
 * with accentHint showing the properly accented form when needed.
 */
export function checkAnswer(
  userAnswer: string,
  correctAnswer: string,
  acceptedAlternatives?: string[]
): CheckAnswerResult {
  const userClean = removeAccents(userAnswer);
  const correctClean = removeAccents(correctAnswer);

  // Exact match (with accents)
  if (userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase()) {
    return { correct: true, exactMatch: true };
  }

  // Accent-tolerant match against primary answer
  if (userClean === correctClean) {
    return { correct: true, exactMatch: false, accentHint: correctAnswer };
  }

  // Check accepted alternatives (also accent-tolerant)
  if (acceptedAlternatives) {
    for (const alt of acceptedAlternatives) {
      if (userAnswer.trim().toLowerCase() === alt.toLowerCase()) {
        return { correct: true, exactMatch: true };
      }
      if (userClean === removeAccents(alt)) {
        return { correct: true, exactMatch: false, accentHint: alt };
      }
    }
  }

  return { correct: false, exactMatch: false };
}
