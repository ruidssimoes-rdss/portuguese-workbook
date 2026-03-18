/**
 * Session Planner — orchestrates context → AI prompt → Ollama → validated plan.
 * Always falls back gracefully if Ollama is unavailable.
 */

import { generateJSON, isOllamaAvailable, OllamaError } from "./ollama-client";
import { sessionPlanSchema } from "./schemas";
import { buildSessionSystemPrompt, buildSessionUserPrompt, type StudentContext } from "./prompts";
import { assembleStudentContext } from "./context-assembler";
import { getContentInventory } from "./content-index";
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
    // Use minimal context for fallback
    context = getMinimalContext();
  }

  try {
    const available = await isOllamaAvailable();
    if (!available) {
      console.warn("Ollama unavailable, using fallback session plan");
      return { plan: generateFallbackPlan(context), source: "fallback" };
    }

    const systemPrompt = buildSessionSystemPrompt();
    const userPrompt = buildSessionUserPrompt(context);

    const plan = await generateJSON<AISessionPlan>(systemPrompt, userPrompt, sessionPlanSchema);
    return { plan, source: "ai" };
  } catch (error) {
    if (error instanceof OllamaError) {
      console.error(`Ollama error (${error.code}): ${error.message}`);
    } else {
      console.error("Session planning error:", error);
    }
    return { plan: generateFallbackPlan(context), source: "fallback" };
  }
}

function generateFallbackPlan(context: StudentContext): AISessionPlan {
  const inventory = getContentInventory();
  const level = context.currentLevel;

  // Pick content based on level
  const vocabCats = inventory.vocab.categoriesByCefr[level] ?? inventory.vocab.categories;
  const verbSlugs = inventory.verbs.slugsByCefr[level] ?? inventory.verbs.slugs;
  const grammarTopics = inventory.grammar.topicsByCefr[level] ?? inventory.grammar.topicSlugs;

  // Select 1-2 vocab categories, 2-3 verbs, 1 grammar topic
  const selectedVocab = vocabCats.slice(0, 2);
  const selectedVerbs = verbSlugs.slice(0, 3);
  const selectedGrammar = grammarTopics.slice(0, 1);

  return {
    sessionTitle: "Practice Session",
    sessionTitlePt: "Sessão de Prática",
    difficulty: level === "A1" ? "foundation" : level === "A2" ? "developing" : "confident",
    estimatedMinutes: 15,
    focusAreas: [
      {
        type: "vocabulary",
        vocabCategories: selectedVocab,
        vocabCefr: level,
        vocabCount: 6,
      },
      {
        type: "verbs",
        verbSlugs: selectedVerbs,
        verbTenses: ["Present"],
        verbCount: 3,
      },
      {
        type: "grammar",
        grammarTopicSlugs: selectedGrammar,
      },
    ],
    reviewPriority: context.overdueReviewItems.length > 0 ? "weak" : "mixed",
  };
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
  };
}
