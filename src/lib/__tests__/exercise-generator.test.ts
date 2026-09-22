import { describe, it, expect } from "vitest";
import { generateLessonExercises } from "../exercise-generator";
import type { Lesson } from "@/data/lessons";
import type { ExerciseOnlyContent } from "../exercise-types";

const lesson: Lesson = {
  id: "t1",
  title: "t",
  ptTitle: "t",
  description: "",
  cefr: "A1",
  estimatedMinutes: 10,
  order: 1,
  stages: [
    {
      id: "s-vocab",
      type: "vocabulary",
      title: "",
      ptTitle: "",
      description: "",
      items: [
        { id: "v1", word: "casa", translation: "house", pronunciation: "", example: { pt: "A casa é grande.", en: "The house is big." } },
        { id: "v2", word: "água", translation: "water", pronunciation: "", example: { pt: "Bebo água.", en: "I drink water." } },
        { id: "v3", word: "pão", translation: "bread", pronunciation: "", example: { pt: "Como pão.", en: "I eat bread." } },
      ],
    },
    {
      id: "s-verb",
      type: "verb",
      title: "",
      ptTitle: "",
      description: "",
      verbs: [
        {
          id: "verb-ser",
          verb: "ser",
          verbTranslation: "to be",
          tense: "Present",
          verbSlug: "ser",
          conjugations: [
            { pronoun: "eu", form: "sou" },
            { pronoun: "tu", form: "és" },
          ],
        },
      ],
    },
    {
      id: "s-practice",
      type: "practice",
      title: "",
      ptTitle: "",
      description: "",
      practiceItems: [
        { id: "p1", sentence: "A ___ é grande.", answer: "casa", fullSentence: "A casa é grande.", translation: "The house is big.", acceptedAnswers: ["casa"] },
        { id: "p2", sentence: "Bebo ___.", answer: "água", fullSentence: "Bebo água.", translation: "I drink water.", acceptedAnswers: ["água"] },
        { id: "p3", sentence: "Como ___.", answer: "pão", fullSentence: "Como pão.", translation: "I eat bread.", acceptedAnswers: ["pão"] },
      ],
    },
  ],
};

function allQuestionIds(section: { key: string; data: Record<string, unknown> }): string[] {
  const d = section.data;
  if (Array.isArray(d.questions)) return (d.questions as Array<{ id: string }>).map((q) => q.id);
  if (Array.isArray(d.sentences)) return (d.sentences as Array<{ id: string }>).map((q) => q.id);
  if (Array.isArray(d.verbs)) {
    return (d.verbs as Array<{ verb: string; tense: string; persons: Array<{ pronoun: string }> }>).flatMap((v) =>
      v.persons.map((p) => `${v.verb}-${v.tense}-${p.pronoun}`)
    );
  }
  const para = d.paragraph as { blanks: Array<{ id: string }> } | undefined;
  if (para) return para.blanks.map((b) => b.id);
  return [];
}

describe("generateLessonExercises", () => {
  it("attributes every emitted question to a pool item", () => {
    const g = generateLessonExercises(lesson);
    expect(g.sections.length).toBeGreaterThan(0);
    for (const s of g.sections) {
      for (const id of allQuestionIds(s)) {
        expect(s.attribution[id], `${s.key}:${id}`).toBeDefined();
      }
    }
    const conj = g.sections.find((s) => s.key === "conjugation")!;
    expect(conj.attribution["ser-Presente-eu"]).toEqual({ contentType: "verb", contentId: "SER" });
  });

  it("exercises review content without showing it in the learn phase", () => {
    const exerciseOnly: ExerciseOnlyContent = {
      vocabItems: [
        { id: "r1", word: "livro", translation: "book", pronunciation: "", example: { pt: "O livro é novo.", en: "The book is new." } },
      ],
      practiceItems: [
        { id: "rp1", sentence: "O ___ é novo.", answer: "livro", fullSentence: "O livro é novo.", translation: "The book is new.", acceptedAnswers: ["livro"], contentRef: { contentType: "vocab", contentId: "livro" } },
      ],
    };
    const g = generateLessonExercises(lesson, exerciseOnly);
    const learnWords = g.learnItems.filter((i) => i.type === "vocab").map((i) => (i.data as { word: string }).word);
    expect(learnWords).not.toContain("livro");
    const refs = g.sections.flatMap((s) => Object.values(s.attribution)).map((r) => r.contentId);
    expect(refs).toContain("livro");
  });

  it("never emits a grammar section whose true/false answers are all Verdadeiro", () => {
    let sawTrueFalse = false;
    for (let i = 0; i < 25; i++) {
      const g = generateLessonExercises({
        ...lesson,
        stages: [
          ...lesson.stages,
          {
            id: "s-grammar",
            type: "grammar",
            title: "",
            ptTitle: "",
            description: "",
            grammarItems: [
              { id: "g1", rule: "", rulePt: "", examples: [], topicSlug: "noun-gender", topicTitle: "Noun gender" },
              { id: "g2", rule: "", rulePt: "", examples: [], topicSlug: "articles", topicTitle: "Articles" },
              { id: "g3", rule: "", rulePt: "", examples: [], topicSlug: "ser-vs-estar", topicTitle: "Ser vs estar" },
            ],
          },
        ],
      });
      const grammar = g.sections.find((s) => s.key === "grammar");
      if (!grammar) continue;
      const questions = grammar.data.questions as Array<{ id: string; type: string; isTrue?: boolean }>;
      const tf = questions.filter((q) => q.type === "true-false");
      if (tf.length > 0) {
        sawTrueFalse = true;
        expect(tf.some((q) => q.isTrue === false)).toBe(true);
      }
      for (const q of questions) expect(grammar.attribution[q.id]).toBeDefined();
    }
    expect(sawTrueFalse).toBe(true);
  });
});
