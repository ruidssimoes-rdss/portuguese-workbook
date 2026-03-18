export { generateJSON, isOllamaAvailable, OllamaError } from "./ollama-client";
export { sessionPlanSchema, explanationSchema } from "./schemas";
export type { ValidatedSessionPlan, ValidatedExplanation } from "./schemas";
export type { AISessionPlan, AIFocusArea, AIExplanation, AIExplanationRequest } from "./types";
export {
  buildSessionSystemPrompt, buildSessionUserPrompt,
  buildExplanationSystemPrompt, buildExplanationUserPrompt,
} from "./prompts";
export type { StudentContext } from "./prompts";

export { getContentInventory, getVocabItems, getVerbItems, getGrammarItems, getCultureItems } from "./content-index";
export type { ContentInventory } from "./content-index";
export { assembleStudentContext } from "./context-assembler";
export { planSession } from "./session-planner";
export type { PlanSessionResult } from "./session-planner";
export { planToBlocks } from "./plan-to-blocks";

export { isClaudeAvailable, generateWithClaude } from "./claude-client";
export { generateTiered } from "./tiered-model";
export type { ModelTier } from "./tiered-model";
export { generateCrossTopicExercises } from "./cross-topic-generator";
export { generateNovelSentences } from "./sentence-generator";
