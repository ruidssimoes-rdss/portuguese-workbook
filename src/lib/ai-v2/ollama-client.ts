/**
 * Typed HTTP client for the Ollama API with Zod schema validation.
 */

import type { ZodSchema } from "zod";

// ── Config ────────────────────────────────────────────────

export interface OllamaConfig {
  baseUrl: string;
  model: string;
  timeoutMs: number;
}

function getConfig(): OllamaConfig {
  return {
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: process.env.OLLAMA_MODEL || "qwen2.5:7b-instruct",
    timeoutMs: 60_000,
  };
}

// ── Error class ────────────────────────────────────────────

export class OllamaError extends Error {
  constructor(
    message: string,
    public code: "TIMEOUT" | "PARSE_ERROR" | "VALIDATION_ERROR" | "CONNECTION_ERROR" | "UNKNOWN",
    public cause?: unknown,
  ) {
    super(message);
    this.name = "OllamaError";
  }
}

// ── Core: generateJSON ─────────────────────────────────────

export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  schema: ZodSchema<T>,
  options?: { maxRetries?: number },
): Promise<T> {
  const config = getConfig();
  const maxRetries = options?.maxRetries ?? 1;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

      let response: Response;
      try {
        response = await fetch(`${config.baseUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: config.model,
            system: systemPrompt,
            prompt: userPrompt,
            format: "json",
            stream: false,
            options: {
              temperature: 0.3,
              num_predict: 2048,
            },
          }),
          signal: controller.signal,
        });
      } catch (err) {
        clearTimeout(timeout);
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new OllamaError("Ollama request timed out", "TIMEOUT");
        }
        throw new OllamaError(
          "Cannot connect to Ollama. Is it running?",
          "CONNECTION_ERROR",
          err,
        );
      }

      clearTimeout(timeout);

      if (!response.ok) {
        throw new OllamaError(
          `Ollama returned ${response.status}: ${response.statusText}`,
          "CONNECTION_ERROR",
        );
      }

      const data = await response.json();
      const rawText: string = data.response ?? "";

      // Parse JSON
      let parsed: unknown;
      try {
        // Strip markdown code fences if present
        const cleaned = rawText
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```\s*$/, "")
          .trim();
        parsed = JSON.parse(cleaned);
      } catch (e) {
        throw new OllamaError(
          `Invalid JSON from Ollama: ${rawText.slice(0, 200)}`,
          "PARSE_ERROR",
          e,
        );
      }

      // Validate with Zod
      const result = schema.safeParse(parsed);
      if (!result.success) {
        throw new OllamaError(
          `Zod validation failed: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ")}`,
          "VALIDATION_ERROR",
          result.error,
        );
      }

      return result.data;
    } catch (error) {
      lastError = error;

      // Retry only on parse/validation errors
      if (
        error instanceof OllamaError &&
        (error.code === "PARSE_ERROR" || error.code === "VALIDATION_ERROR") &&
        attempt < maxRetries
      ) {
        console.warn(`Ollama attempt ${attempt + 1} failed, retrying: ${(error as OllamaError).message}`);
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

// ── Health check ────────────────────────────────────────────

export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const config = getConfig();
    const response = await fetch(`${config.baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
