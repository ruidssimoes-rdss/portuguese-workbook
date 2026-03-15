/**
 * Accent-tolerant answer checking for Portuguese language exercises.
 * Accepts answers without diacritics but teaches the correct accented form.
 * Handles gender variants ("obrigado / obrigada"), parenthetical annotations,
 * trailing punctuation, and case differences.
 */

/** Remove diacritics for comparison */
export function removeAccents(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Normalize an answer for comparison: trim, lowercase, strip punctuation, collapse spaces, remove accents */
function normalizeForComparison(text: string): string {
  return removeAccents(
    text.trim().replace(/[.!?]+$/, "").replace(/\s+/g, " ")
  );
}

/** Basic normalization (no accent removal): trim, lowercase, strip trailing punctuation, collapse spaces */
function normalizeBasic(text: string): string {
  return text.trim().toLowerCase().replace(/[.!?]+$/, "").replace(/\s+/g, " ").trim();
}

/**
 * Expand gender variants and parenthetical annotations into separate accepted forms.
 * "obrigado / obrigada" → ["obrigado / obrigada", "obrigado", "obrigada"]
 * "thank you (m/f)" → ["thank you (m/f)", "thank you"]
 * "filho / filha" → ["filho / filha", "filho", "filha"]
 */
function expandVariants(answer: string): string[] {
  const variants: string[] = [answer];

  // Split " / " patterns (gender variants)
  if (answer.includes(" / ")) {
    const parts = answer.split(" / ").map((p) => p.trim()).filter(Boolean);
    variants.push(...parts);
  }

  // Split "/" within single words: "está/estás" → ["está", "estás"]
  if (answer.includes("/") && !answer.includes(" / ") && !answer.includes("(")) {
    const parts = answer.split("/").map((p) => p.trim()).filter(Boolean);
    variants.push(...parts);
  }

  // Remove parenthetical annotations: "(m/f)", "(m.)", "(f.)", "(formal)", etc.
  const withoutParens = answer.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  if (withoutParens !== answer && withoutParens.length > 0) {
    variants.push(withoutParens);
  }

  // Deduplicate
  return [...new Set(variants)];
}

export interface CheckAnswerResult {
  correct: boolean;
  exactMatch: boolean;
  accentHint?: string;
}

/**
 * Compare user answer against correct answer with:
 * - Gender variant expansion ("obrigado / obrigada" accepts either form)
 * - Parenthetical annotation removal ("tudo bem (m/f)" accepts "tudo bem")
 * - Case tolerance ("Olá" matches "olá")
 * - Trailing punctuation tolerance ("olá." matches "olá")
 * - Accent tolerance with hint ("portugues" matches "português" with hint)
 */
export function checkAnswer(
  userAnswer: string,
  correctAnswer: string,
  acceptedAlternatives?: string[],
): CheckAnswerResult {
  const userNorm = normalizeForComparison(userAnswer);
  const userBasic = normalizeBasic(userAnswer);

  // Build full list of accepted forms
  const allAccepted = [
    ...expandVariants(correctAnswer),
    ...(acceptedAlternatives ?? []).flatMap((a) => expandVariants(a)),
  ];

  // Pass 1: Exact match (with accents, after basic normalization)
  for (const accepted of allAccepted) {
    if (userBasic === normalizeBasic(accepted)) {
      return { correct: true, exactMatch: true };
    }
  }

  // Pass 2: Accent-tolerant match
  for (const accepted of allAccepted) {
    if (userNorm === normalizeForComparison(accepted)) {
      // Find the best accented form to show as hint
      return { correct: true, exactMatch: false, accentHint: accepted };
    }
  }

  return { correct: false, exactMatch: false };
}
