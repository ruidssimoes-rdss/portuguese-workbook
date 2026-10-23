/**
 * Content statistics computed at build time from data files.
 * Used by the landing page to show real, current counts.
 */

import vocabData from "@/data/vocab.json";
import grammarData from "@/data/grammar.json";
import verbsData from "@/data/verbs.json";
import sayingsData from "@/data/sayings.json";
import regionalData from "@/data/regional.json";
import falseFriendsData from "@/data/false-friends.json";
import etiquetteData from "@/data/etiquette.json";
import { A1_LESSONS } from "@/data/curriculum";
import { A2_LESSONS, B1_LESSONS } from "@/data/curriculum-a2-b1";

export interface ContentStats {
  words: number;
  grammarTopics: number;
  verbs: number;
  lessons: number;
  cultureItems: number;
}

export function getContentStats(): ContentStats {
  // Flatten vocab categories to get unique words
  const allWords = vocabData.categories.flatMap((cat: any) => cat.words);
  const uniqueWords = new Set(allWords.map((w: any) => w.portuguese.toLowerCase()));

  // Grammar topics (topics is an object, not an array)
  const grammarTopics = Object.keys(grammarData.topics).length;

  // Verbs (order array contains the list of verb keys)
  const verbs = verbsData.order.length;

  // Lessons: A1 + A2 + B1
  const lessons = A1_LESSONS.length + A2_LESSONS.length + B1_LESSONS.length;

  // Culture: sayings + regional + false friends + etiquette
  const cultureItems =
    sayingsData.sayings.length +
    regionalData.expressions.length +
    falseFriendsData.falseFriends.length +
    etiquetteData.tips.length;

  return {
    words: uniqueWords.size,
    grammarTopics,
    verbs,
    lessons,
    cultureItems,
  };
}
