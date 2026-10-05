import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { findWordByAnswer, getCategories, getWord, slugify } from "@/lib/library";
import { attemptsFor, confusionsFor } from "../attempts";
import type { WrongItem } from "@/lib/lesson-progress";

describe("library slugs", () => {
  it("slugifies without accents or punctuation", () => {
    expect(slugify("Olá, como estás?")).toBe("ola-como-estas");
  });

  it("gives every word a unique slug within its category that resolves back", () => {
    for (const c of getCategories()) {
      const slugs = new Set(c.words.map((w) => w.slug));
      expect(slugs.size).toBe(c.words.length);
      for (const w of c.words) expect(getWord(c.id, w.slug)?.portuguese).toBe(w.portuguese);
    }
  });

  it("matches typed answers ignoring case, accents and articles", () => {
    const olá = findWordByAnswer("  OLA ");
    expect(olá?.portuguese).toBe("olá");
  });
});

describe("attempts and confusions", () => {
  const word = findWordByAnswer("bom dia")!;
  const other = findWordByAnswer("boa tarde")!;
  const at = "2026-09-18T10:00:00Z";
  const items: { at: string; item: WrongItem }[] = [
    { at, item: { type: "practice", userAnswer: "boa tarde", correctAnswer: "x", contentType: "vocab", contentId: word.portuguese } },
    { at, item: { type: "practice", userAnswer: "bom dai", correctAnswer: "Bom dia" } },
    { at, item: { type: "practice", userAnswer: "bom dia", correctAnswer: "boa tarde" } },
    { at, item: { type: "practice", userAnswer: "casa", correctAnswer: "carro", contentType: "vocab", contentId: "carro" } },
  ];

  it("finds attempts by content id, and by expected answer on older rows", () => {
    expect(attemptsFor(items, word).map((a) => a.typed)).toEqual(["boa tarde", "bom dai"]);
  });

  it("counts confusions in both directions", () => {
    expect(confusionsFor(items, word)).toEqual([{ word: other, times: 2 }]);
  });
});
