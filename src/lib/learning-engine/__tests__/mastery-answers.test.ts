import { describe, it, expect } from "vitest";
import { buildMasteryAnswers } from "../mastery-answers";
import type { SectionResult } from "@/lib/exercise-types";

const sections = [
  {
    key: "vocab",
    namePt: "",
    nameEn: "",
    data: {},
    totalQuestions: 2,
    attribution: {
      "vocab-0": { contentType: "vocab" as const, contentId: "casa" },
      "vocab-1": { contentType: "vocab" as const, contentId: "água" },
    },
  },
  {
    key: "fill-blank",
    namePt: "",
    nameEn: "",
    data: {},
    totalQuestions: 2,
    attribution: {
      "fill-0": { contentType: "vocab" as const, contentId: "casa" },
      "fill-1": { contentType: "grammar" as const, contentId: "articles" },
    },
  },
];

function result(sectionKey: string, answers: Array<[string, boolean]>): SectionResult {
  return {
    sectionKey,
    sectionName: sectionKey,
    answers: answers.map(([questionId, correct]) => ({ questionId, correct, userAnswer: "", correctAnswer: "" })),
    totalCorrect: answers.filter(([, c]) => c).length,
    totalQuestions: answers.length,
  };
}

describe("buildMasteryAnswers", () => {
  it("records real correctness per asked item and ignores unasked items", () => {
    const out = buildMasteryAnswers(
      { sections },
      [result("vocab", [["vocab-0", true], ["vocab-1", false]])],
      [
        { contentType: "vocab", contentId: "casa", contentCefr: "A1", contentCategory: "home", isHighFrequency: true, data: {} as never },
        { contentType: "vocab", contentId: "pão", contentCefr: "A1", isHighFrequency: false, data: {} as never },
      ],
      "A2"
    );
    expect(out).toHaveLength(2);
    expect(out.find((a) => a.contentId === "casa")).toMatchObject({ wasCorrect: true, contentCefr: "A1", contentCategory: "home" });
    expect(out.find((a) => a.contentId === "água")).toMatchObject({ wasCorrect: false, contentCefr: "A2" });
    expect(out.find((a) => a.contentId === "pão")).toBeUndefined(); // shown, never asked
  });

  it("counts an item asked twice once, correct only if every attempt was correct", () => {
    const out = buildMasteryAnswers(
      { sections },
      [
        result("vocab", [["vocab-0", true]]),
        result("fill-blank", [["fill-0", false], ["fill-1", true]]),
      ],
      [],
      "A1"
    );
    const casa = out.filter((a) => a.contentId === "casa");
    expect(casa).toHaveLength(1);
    expect(casa[0].wasCorrect).toBe(false);
    expect(out.find((a) => a.contentType === "grammar")?.wasCorrect).toBe(true);
  });

  it("skips answers with no attribution", () => {
    const out = buildMasteryAnswers({ sections }, [result("vocab", [["vocab-99", true]])], [], "A1");
    expect(out).toHaveLength(0);
  });
});
