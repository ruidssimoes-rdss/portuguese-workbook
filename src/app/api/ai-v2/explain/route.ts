import { NextResponse } from "next/server";
import { generateTiered } from "@/lib/ai-v2/tiered-model";
import { isOllamaAvailable } from "@/lib/ai-v2/ollama-client";
import { isClaudeAvailable } from "@/lib/ai-v2/claude-client";
import { explanationSchema } from "@/lib/ai-v2/schemas";
import { buildExplanationSystemPrompt, buildExplanationUserPrompt } from "@/lib/ai-v2/prompts";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if any AI is available
    const ollamaUp = await isOllamaAvailable();
    if (!ollamaUp && !isClaudeAvailable()) {
      return NextResponse.json({ explanation: null, tip: null });
    }

    const { data: result } = await generateTiered(
      "quality", // Use Claude for better explanation quality when available
      buildExplanationSystemPrompt(),
      buildExplanationUserPrompt(body),
      explanationSchema,
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ explanation: null, tip: null });
  }
}
