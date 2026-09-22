import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { search } from "../search";

describe("server-side conjugated-form search", () => {
  it("finds both ir and ser for fomos with its tense and person", () => {
    const results = search("fomos").results.filter((result) => result.type === "verb");
    for (const verb of ["IR", "SER"]) {
      expect(results.find((result) => result.title === verb)).toMatchObject({
        matchField: "conjugation",
        matchedForms: expect.arrayContaining([
          { form: "fomos", tense: "Preterite", person: "nós (we)" },
        ]),
      });
    }
  });

  it("matches forms regardless of accents and case", () => {
    expect(search(" VAO ").results.find((result) => result.title === "IR")?.matchedForms)
      .toEqual(expect.arrayContaining([expect.objectContaining({ form: "vão" })]));
  });

  it("returns matching forms on ambiguous conjugation cards", () => {
    const card = search("conjugate fomos").smartCard;
    expect(card?.type).toBe("conjugation_multi");
    if (card?.type !== "conjugation_multi") throw new Error("Missing verb cards");
    expect(card.verbs.map((verb) => verb.infinitive)).toEqual(expect.arrayContaining(["IR", "SER"]));
    for (const verb of card.verbs) {
      expect(verb.forms.every((form) => form.form === "fomos")).toBe(true);
    }
  });

  it("returns a small preview of the requested tense without full tables", () => {
    const card = search("past tense of ir").smartCard;
    expect(card?.type).toBe("tense");
    if (card?.type !== "tense") throw new Error("Missing tense card");
    expect(card.forms.length).toBeGreaterThan(0);
    expect(card.forms.length).toBeLessThanOrEqual(6);
    expect(card.forms.every((form) => form.tense === "Preterite")).toBe(true);
    expect(card.forms).toEqual(expect.arrayContaining([expect.objectContaining({ form: "fomos" })]));
  });
});
