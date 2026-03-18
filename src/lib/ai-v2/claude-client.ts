/**
 * Claude API client — optional cloud model for higher-quality outputs.
 * Only used when ANTHROPIC_API_KEY is set. Uses plain fetch (no SDK).
 */

import type { ZodSchema } from "zod";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export function isClaudeAvailable(): boolean {
  return !!ANTHROPIC_API_KEY;
}

export async function generateWithClaude<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: ZodSchema<T>,
): Promise<T> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("Claude API key not configured");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Claude API error ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = await response.json();
  const text: string = data.content?.[0]?.text || "";

  // Parse JSON (Claude may wrap in markdown fences)
  const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error(`Claude returned invalid JSON: ${jsonStr.slice(0, 200)}`);
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Claude response validation failed: ${result.error.issues.map((i) => i.message).join(", ")}`);
  }

  return result.data;
}
