/**
 * A small index of curriculum content for goal planning — built on the
 * server and passed to the calendar client component as props.
 */

import "server-only";

import { getResolvedLessons } from "@/data/resolve-lessons";
import verbData from "@/data/verbs.json";
import grammarData from "@/data/grammar.json";
import type { VerbDataSet } from "@/types";
import type { GrammarData } from "@/types/grammar";
import type { CurriculumIndex } from "./goal-items";

let cached: CurriculumIndex | null = null;

export function getCurriculumIndex(): CurriculumIndex {
  if (cached) return cached;
  const verbs = verbData as unknown as VerbDataSet;
  const grammar = grammarData as unknown as GrammarData;
  cached = {
    lessons: getResolvedLessons().map((l) => ({ id: l.id, title: l.title, ptTitle: l.ptTitle, cefr: l.cefr })),
    verbsA1: verbs.order.slice(0, 75).map((key) => ({
      id: key,
      title: `Rever: ${key} (${verbs.verbs[key]?.meta?.english ?? "verbo"})`,
    })),
    grammarA1: Object.values(grammar.topics)
      .filter((t) => t.cefr === "A1")
      .map((t) => ({ id: t.id, title: t.titlePt ?? t.id })),
  };
  return cached;
}
