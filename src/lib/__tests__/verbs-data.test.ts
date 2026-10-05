import { describe, expect, it } from "vitest";

import verbData from "@/data/verbs.json";

type Row = { Person: string; Tense: string; Conjugation: string };
type Verb = { meta: { group: string }; conjugations: Row[] };

const verbs = verbData.verbs as Record<string, Verb>;

/** Stem as it appears before -e: c→qu, g→gu, ç→c. */
function subjunctiveStem(infinitive: string): string {
  const stem = infinitive.toLowerCase().slice(0, -2);
  return stem.replace(/c$/, "qu").replace(/g$/, "gu").replace(/ç$/, "c");
}

const regularAr = Object.entries(verbs).filter(([, verb]) => verb.meta.group === "Regular -AR");

describe("verbs.json Present Subjunctive for regular -AR verbs", () => {
  it("covers the regular -AR verbs", () => {
    expect(regularAr.length).toBeGreaterThan(50);
  });

  it.each(regularAr)("%s keeps the infinitive stem in every person", (infinitive, verb) => {
    const stem = subjunctiveStem(infinitive);
    const rows = verb.conjugations.filter((row) => row.Tense === "Present Subjunctive");

    expect(rows).toHaveLength(5);
    expect(rows[0].Person).toMatch(/^eu\b/);
    for (const row of rows) {
      expect(row.Conjugation, `${infinitive} ${row.Person}`).toMatch(new RegExp(`^${stem}`));
    }
  });
});
