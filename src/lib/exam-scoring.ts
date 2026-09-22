/**
 * Exam scoring helpers — pure functions, safe to import from client code.
 * Moved out of src/data/exams.ts so the exam player does not pull the
 * exam content into the client bundle.
 */

function stripAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Check how many key phrases are found in a text (case-insensitive, accent-insensitive) */
export function countKeyPhraseMatches(
  text: string,
  keyPhrases: string[]
): number {
  const normalized = stripAccents(text.toLowerCase());
  return keyPhrases.filter((phrase) => {
    const alternatives = phrase.split("|");
    return alternatives.some((alt) =>
      normalized.includes(stripAccents(alt.toLowerCase()))
    );
  }).length;
}

/** Count words in a text */
export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

/** Score a writing task or speaking prompt */
export function scoreWrittenResponse(
  text: string,
  minWords: number,
  keyPhrases: string[],
  maxPoints: number
): number {
  const wordCount = countWords(text);
  if (wordCount < minWords) return 0;

  const matched = countKeyPhraseMatches(text, keyPhrases);
  const matchRatio = keyPhrases.length > 0 ? matched / keyPhrases.length : 1;

  if (matchRatio >= 0.8) return maxPoints;
  if (matchRatio >= 0.5) return Math.round(maxPoints * 0.75);
  return Math.round(maxPoints * 0.5);
}

/** Get CIPLE classification from percentage score */
export function getClassification(percentage: number): {
  label: string;
  labelPt: string;
  tier: "muito-bom" | "bom" | "suficiente" | "not-yet";
} {
  if (percentage >= 85)
    return { label: "Muito Bom", labelPt: "Muito Bom", tier: "muito-bom" };
  if (percentage >= 70)
    return { label: "Bom", labelPt: "Bom", tier: "bom" };
  if (percentage >= 55)
    return {
      label: "Suficiente",
      labelPt: "Suficiente",
      tier: "suficiente",
    };
  return { label: "Not yet", labelPt: "Ainda não", tier: "not-yet" };
}
