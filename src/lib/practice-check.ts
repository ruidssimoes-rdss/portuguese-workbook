/**
 * Strict answer checking for chapter practice. Pure, no React.
 *
 * Case, spaces and punctuation never count. Accents and hyphens do: an answer
 * that differs from an accepted one only in diacritics or hyphens is a slip,
 * which scores as not correct. Nothing is accepted by fuzzy matching.
 * (src/lib/accent-utils.ts stays accent-tolerant for the older drills.)
 */

export type Verdict = "correct" | "slip" | "wrong";

/** NFC, lowercase, straight quotes, punctuation gone, single spaces. Keeps letters, digits, diacritics, hyphens and apostrophes. */
export function normalizeAnswer(text: string): string {
  return text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[.,!?¿¡;:…«»"()]/g, " ")
    .replace(/[^\p{L}\p{M}\p{N}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The slip comparison: also without diacritics, and hyphens read as spaces. */
function loose(normalized: string): string {
  return normalized
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .normalize("NFC")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function checkPractice(given: string, answer: string, accept: string[] = []): { verdict: Verdict; matched: string } {
  const forms = [answer, ...accept];
  const typed = normalizeAnswer(given);
  if (!typed) return { verdict: "wrong", matched: answer };
  const exact = forms.find((form) => normalizeAnswer(form) === typed);
  if (exact !== undefined) return { verdict: "correct", matched: exact };
  const typedLoose = loose(typed);
  const near = forms.find((form) => loose(normalizeAnswer(form)) === typedLoose);
  if (near !== undefined) return { verdict: "slip", matched: near };
  return { verdict: "wrong", matched: answer };
}
