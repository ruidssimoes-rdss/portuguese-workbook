/**
 * Reference-library totals read from the course data files.
 * Imported by the public landing so the figures match this build.
 */

import vocabData from "@/data/vocab.json";
import verbsData from "@/data/verbs.json";
import grammarData from "@/data/grammar.json";
import sayingsData from "@/data/sayings.json";
import falseFriendsData from "@/data/false-friends.json";
import etiquetteData from "@/data/etiquette.json";
import regionalData from "@/data/regional.json";
import { A1_LESSONS, A2_LESSONS, B1_LESSONS, EXTRA_LESSONS } from "@/data/curriculum";
import type { CEFRLevel } from "@/data/curriculum-types";

type VocabFile = { categories: { words: unknown[] }[] };
type VerbsFile = {
  order: string[];
  verbs: Record<string, { conjugations: { Tense: string }[] }>;
};
type GrammarFile = { topics: Record<string, { cefr?: string }> };
type ListFile<K extends string> = Record<K, unknown[]>;

const vocab = vocabData as VocabFile;
const verbs = verbsData as VerbsFile;
const grammar = grammarData as GrammarFile;
const sayings = sayingsData as ListFile<"sayings">;
const falseFriends = falseFriendsData as ListFile<"falseFriends">;
const etiquette = etiquetteData as ListFile<"tips">;
const regional = regionalData as ListFile<"expressions">;

const CORE_TENSES = [
  "Present",
  "Preterite",
  "Imperfect",
  "Future",
  "Conditional",
  "Present Subjunctive",
  "Imperfect Subjunctive",
  "Future Subjunctive",
  "Imperative",
] as const;

const lessons = [...A1_LESSONS, ...A2_LESSONS, ...B1_LESSONS, ...EXTRA_LESSONS];

const tenseNames = new Set<string>();
for (const verb of Object.values(verbs.verbs)) {
  for (const row of verb.conjugations) tenseNames.add(row.Tense);
}

const grammarByLevel: Record<CEFRLevel, number> = { A1: 0, A2: 0, B1: 0 };
for (const topic of Object.values(grammar.topics)) {
  if (topic.cefr === "A1" || topic.cefr === "A2" || topic.cefr === "B1") {
    grammarByLevel[topic.cefr] += 1;
  }
}

function countLessons(level: CEFRLevel): number {
  return lessons.filter((lesson) => lesson.cefrLevel === level).length;
}

export const libraryCounts = {
  words: vocab.categories.reduce((sum, category) => sum + category.words.length, 0),
  themes: vocab.categories.length,
  verbs: verbs.order.length,
  grammarTopics: Object.keys(grammar.topics).length,
  grammarByLevel,
  tenses: tenseNames.size,
  hasCoreTenses: CORE_TENSES.every((tense) => tenseNames.has(tense)),
  sayings: sayings.sayings.length,
  falseFriends: falseFriends.falseFriends.length,
  etiquette: etiquette.tips.length,
  regional: regional.expressions.length,
  culture:
    sayings.sayings.length +
    falseFriends.falseFriends.length +
    etiquette.tips.length +
    regional.expressions.length,
  lessons: lessons.length,
  lessonsA1: countLessons("A1"),
  lessonsA2: countLessons("A2"),
  lessonsB1: countLessons("B1"),
} as const;

export function formatCount(value: number): string {
  return value.toLocaleString("pt-PT", { maximumFractionDigits: 0, useGrouping: true });
}
