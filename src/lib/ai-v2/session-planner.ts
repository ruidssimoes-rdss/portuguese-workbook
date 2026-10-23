/**
 * Session planner. Builds the practice session from the student's reviews
 * and level, inside the app. No model, no outbound call.
 */

import { assembleStudentContext } from "./context-assembler";
import { getContentInventory } from "./content-index";
import { buildRuleBasedPlan } from "./rule-based-planner";
import type { StudentContext } from "./prompts";
import type { AISessionPlan } from "./types";

export async function planSession(userId: string): Promise<AISessionPlan> {
  let context: StudentContext;
  try {
    context = await assembleStudentContext(userId);
  } catch (err) {
    console.error("Failed to assemble student context:", err);
    context = getMinimalContext();
  }

  return buildRuleBasedPlan(context);
}

function getMinimalContext(): StudentContext {
  const inventory = getContentInventory();
  return {
    currentLevel: "A1",
    lessonsCompleted: 0,
    totalLessons: 54,
    daysSinceLastSession: 999,
    weakAreas: [],
    availableVocabCategories: inventory.vocab.categoriesByCefr["A1"] ?? inventory.vocab.categories,
    availableVerbSlugs: inventory.verbs.slugsByCefr["A1"] ?? inventory.verbs.slugs.slice(0, 20),
    availableGrammarTopics: inventory.grammar.topicsByCefr["A1"] ?? inventory.grammar.topicSlugs,
    cultureItemCount: inventory.culture.totalItems,
    overdueReviewItems: [],
    dueItems: [],
    weakItems: [],
    seenIds: [],
  };
}
