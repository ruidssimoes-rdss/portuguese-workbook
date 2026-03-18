/**
 * Tiered model strategy — unified interface for AI generation.
 *
 * "orchestration" tier: always Ollama (fast, free, structured)
 * "quality" tier: Claude first (if available), then Ollama fallback
 */

import { generateJSON, isOllamaAvailable } from "./ollama-client";
import { generateWithClaude, isClaudeAvailable } from "./claude-client";
import type { ZodSchema } from "zod";

export type ModelTier = "orchestration" | "quality";

export async function generateTiered<T>(
  tier: ModelTier,
  systemPrompt: string,
  userPrompt: string,
  schema: ZodSchema<T>,
): Promise<{ data: T; model: "claude" | "ollama" }> {
  // Orchestration tier: always Ollama
  if (tier === "orchestration") {
    const data = await generateJSON(systemPrompt, userPrompt, schema);
    return { data, model: "ollama" };
  }

  // Quality tier: Claude → Ollama
  if (isClaudeAvailable()) {
    try {
      const data = await generateWithClaude(systemPrompt, userPrompt, schema);
      return { data, model: "claude" };
    } catch (error) {
      console.warn("Claude API failed, falling back to Ollama:", error);
    }
  }

  // Fallback to Ollama
  if (await isOllamaAvailable()) {
    const data = await generateJSON(systemPrompt, userPrompt, schema);
    return { data, model: "ollama" };
  }

  throw new Error("No AI model available");
}
