/**
 * Session Planner — student context → session plan.
 *
 * The rule-based planner always works and needs no key. When
 * ANTHROPIC_API_KEY is set Claude is tried first; when Ollama is reachable
 * it is tried next. Any AI failure falls back to the rule-based plan, so
 * this never throws for lack of a model.
 */

import { generateJSON, isOllamaAvailable } from "./ollama-client";
import { generateWithClaude, isClaudeAvailable } from "./claude-client";
import { sessionPlanSchema } from "./schemas";
import { buildSessionSystemPrompt, buildSessionUserPrompt, type StudentContext } from "./prompts";
import { assembleStudentContext } from "./context-assembler";
import { getContentInventory } from "./content-index";
import { buildRuleBasedPlan } from "./rule-based-planner";
import type { AISessionPlan } from "./types";

export interface PlanSessionResult {
  plan: AISessionPlan;
  source: "ai" | "fallback";
}

export async function planSession(userId: string): Promise<PlanSessionResult> {
  let context: StudentContext;
  try {
    context = await assembleStudentContext(userId);
  } catch (err) {
    console.error("Failed to assemble student context:", err);
    context = getMinimalContext();
  }

  const systemPrompt = buildSessionSystemPrompt();
  const userPrompt = buildSessionUserPrompt(context);

  if (isClaudeAvailable()) {
    try {
      const plan = await generateWithClaude<AISessionPlan>(systemPrompt, userPrompt, sessionPlanSchema);
      return { plan, source: "ai" };
    } catch (error) {
      console.warn("Claude session planning failed, trying Ollama:", error);
    }
  }

  if (await isOllamaAvailable().catch(() => false)) {
    try {
      const plan = await generateJSON<AISessionPlan>(systemPrompt, userPrompt, sessionPlanSchema);
      return { plan, source: "ai" };
    } catch (error) {
      console.warn("Ollama session planning failed, using rule-based plan:", error);
    }
  }

  return { plan: buildRuleBasedPlan(context), source: "fallback" };
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
