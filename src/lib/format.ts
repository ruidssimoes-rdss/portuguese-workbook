/** Display formatting shared by server and client (deterministic across both). */

const count = new Intl.NumberFormat("de-DE");

/** 1377 → "1.377" */
export function formatCount(n: number): string {
  return count.format(n);
}

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** ISO date → "19 set" */
export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

export function daysLabel(n: number): string {
  return n === 1 ? "1 dia" : `${n} dias`;
}
