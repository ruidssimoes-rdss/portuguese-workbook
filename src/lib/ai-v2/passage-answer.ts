/**
 * A margin note about a passage.
 * Claude, then Ollama, then the rule-based note. Same order as session planning.
 * Does not read the student's progress and does not write a tutor session.
 */

import { composeNote, passageFor } from "@/lib/book/elisio";
import type { ElisioAbout } from "@/lib/book/types";
import { generateWithClaude, isClaudeAvailable } from "./claude-client";
import { generateJSON, isOllamaAvailable } from "./ollama-client";
import { buildPassageSystemPrompt, buildPassageUserPrompt } from "./prompts";
import { passageNoteSchema } from "./schemas";

export async function answerPassage(
  about: ElisioAbout,
  question: string,
): Promise<{ note: string; source: "claude" | "ollama" | "fallback" } | null> {
  const passage = passageFor(about);
  if (!passage) return null;

  const system = buildPassageSystemPrompt();
  const user = buildPassageUserPrompt(passage, question);

  if (isClaudeAvailable()) {
    try {
      const data = await generateWithClaude(system, user, passageNoteSchema);
      return { note: data.note, source: "claude" };
    } catch (error) {
      console.warn("Claude passage note failed, trying Ollama:", error);
    }
  }

  if (await isOllamaAvailable().catch(() => false)) {
    try {
      const data = await generateJSON(system, user, passageNoteSchema);
      return { note: data.note, source: "ollama" };
    } catch (error) {
      console.warn("Ollama passage note failed, using the passage note:", error);
    }
  }

  return { note: composeNote(passage, question), source: "fallback" };
}
