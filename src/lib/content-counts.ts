/**
 * Content counts for navigation — computed on the server from src/data and
 * passed to client components as props. Never import this from a client file.
 */

import "server-only";

import { getResolvedLessons } from "@/data/resolve-lessons";
import verbData from "@/data/verbs.json";
import vocabData from "@/data/vocab.json";
import grammarData from "@/data/grammar.json";
import type { VerbDataSet } from "@/types";
import type { VocabData } from "@/types/vocab";
import type { GrammarData } from "@/types/grammar";

export interface ContentCounts {
  lessons: number;
  verbs: number;
  tenses: number;
  words: number;
  categories: number;
  topics: number;
}

let cached: ContentCounts | null = null;

export function getContentCounts(): ContentCounts {
  if (cached) return cached;
  const verbs = verbData as unknown as VerbDataSet;
  const vocab = vocabData as unknown as VocabData;
  const grammar = grammarData as unknown as GrammarData;
  cached = {
    lessons: getResolvedLessons().length,
    verbs: verbs.order.length,
    tenses: new Set(
      verbs.order.flatMap((k) => verbs.verbs[k]?.conjugations?.map((c) => c.Tense) ?? [])
    ).size,
    words: vocab.categories.reduce((s, c) => s + (c.words?.length ?? 0), 0),
    categories: vocab.categories.length,
    topics: Object.keys(grammar.topics).length,
  };
  return cached;
}
