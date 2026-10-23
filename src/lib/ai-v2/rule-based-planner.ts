/**
 * Session planner. Builds a practice session from mastery state.
 * This is how Professor Elísio plans a session. Nothing leaves the app.
 *
 * Order of priority:
 *   1. items due for spaced-repetition review (most overdue first)
 *   2. the student's weakest grammar topic
 *   3. new items at the current level
 */

import type { AISessionPlan, AIFocusArea } from "./types";
import type { StudentContext } from "./prompts";
import { pickNewVocabWords, pickNewVerbSlugs, pickNewGrammarTopics } from "./content-index";

const VOCAB_TARGET = 8;
const VERB_TARGET = 3;
const GRAMMAR_TARGET = 2;
const CULTURE_COUNT = 2;

const TENSES_BY_LEVEL: Record<StudentContext["currentLevel"], string[]> = {
  A1: ["Present"],
  A2: ["Present", "Preterite"],
  B1: ["Preterite", "Imperfect"],
};

const DIFFICULTY: Record<StudentContext["currentLevel"], AISessionPlan["difficulty"]> = {
  A1: "foundation",
  A2: "developing",
  B1: "confident",
};

function uniq<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export function buildRuleBasedPlan(context: StudentContext): AISessionPlan {
  const level = context.currentLevel;
  const seen = new Set(context.seenIds);

  // 1. Due SRS items first
  const dueWords = uniq(context.dueItems.filter((i) => i.type === "vocab").map((i) => i.id)).slice(0, VOCAB_TARGET);
  const dueVerbs = uniq(context.dueItems.filter((i) => i.type === "verb").map((i) => i.id)).slice(0, VERB_TARGET);
  const dueGrammar = uniq(context.dueItems.filter((i) => i.type === "grammar").map((i) => i.id)).slice(0, 1);

  // 2. Weakest grammar topic (lowest accuracy), unless it is already due
  const weakestGrammar = context.weakItems.find((i) => i.type === "grammar" && !dueGrammar.includes(i.id))?.id;
  const grammar = uniq([...dueGrammar, ...(weakestGrammar ? [weakestGrammar] : [])]);

  // 3. New items at the current level to fill the session
  const words = uniq([...dueWords, ...pickNewVocabWords(level, seen, VOCAB_TARGET - dueWords.length)]);
  const verbs = uniq([...dueVerbs, ...pickNewVerbSlugs(level, seen, VERB_TARGET - dueVerbs.length)]);
  if (grammar.length < GRAMMAR_TARGET) {
    grammar.push(...pickNewGrammarTopics(level, seen, GRAMMAR_TARGET - grammar.length).filter((t) => !grammar.includes(t)));
  }

  const focusAreas: AIFocusArea[] = [];
  if (words.length > 0) focusAreas.push({ type: "vocabulary", vocabWords: words, vocabCefr: level, vocabCount: words.length });
  if (verbs.length > 0) focusAreas.push({ type: "verbs", verbSlugs: verbs, verbTenses: TENSES_BY_LEVEL[level], verbCount: verbs.length });
  if (grammar.length > 0) focusAreas.push({ type: "grammar", grammarTopicSlugs: grammar });
  focusAreas.push({ type: "culture", cultureCount: CULTURE_COUNT });

  const reviewCount = dueWords.length + dueVerbs.length + dueGrammar.length;
  const hasReview = reviewCount > 0;

  return {
    sessionTitle: hasReview ? "Review and new ground" : "Practice session",
    sessionTitlePt: hasReview ? "Revisão e novidades" : "Sessão de prática",
    difficulty: DIFFICULTY[level],
    estimatedMinutes: 15,
    focusAreas,
    reviewPriority: hasReview ? "weak" : "new",
  };
}
