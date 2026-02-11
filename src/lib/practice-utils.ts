/**
 * Normalize string for comparison: lowercase, trim, strip diacritics.
 * Used for accepting user answers that may be missing accents.
 */
export function normalizeForCompare(s: string): string {
  return (s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/**
 * Check if user answer matches correct answer (with accent normalization).
 * Returns: 'exact' | 'correct_no_accent' | 'wrong'
 */
export function compareAnswer(user: string, correct: string): "exact" | "correct_no_accent" | "wrong" {
  const u = (user ?? "").trim().toLowerCase();
  const c = (correct ?? "").trim().toLowerCase();
  if (u === c) return "exact";
  const uNorm = u.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const cNorm = c.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  if (uNorm === cNorm) return "correct_no_accent";
  return "wrong";
}

/**
 * For PT -> EN: accept if user input matches any part of answer when split by " / "
 */
export function compareVocabAnswerPtToEn(user: string, correct: string): boolean {
  const u = (user ?? "").trim().toLowerCase();
  const parts = correct.split(/\s*\/\s*/).map((p) => p.trim().toLowerCase());
  return parts.some((p) => p === u);
}

/**
 * For EN -> PT: use accent-normalized comparison
 */
export function compareVocabAnswerEnToPt(user: string, correct: string): "exact" | "correct_no_accent" | "wrong" {
  return compareAnswer(user, correct);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
