import { NextResponse } from "next/server";

/**
 * A wrong answer, explained from the answers that were posted.
 * Nothing is sent to a model.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(explainLocally(body));
  } catch {
    return NextResponse.json({ explanation: null, tip: null });
  }
}

function explainLocally(body: unknown): { explanation: string | null; tip: string | null } {
  if (!body || typeof body !== "object") return { explanation: null, tip: null };
  const record = body as Record<string, unknown>;
  const correct = text(record.correctAnswer);
  const wrong = text(record.wrongAnswer);
  const context = text(record.context);
  if (!correct) return { explanation: null, tip: null };
  const explanation = wrong
    ? `A resposta certa é «${clip(correct, 120)}». «${clip(wrong, 80)}» não é a forma deste exercício.`
    : `A resposta certa é «${clip(correct, 160)}».`;
  const tip = context ? clip(context, 180) : "Volta ao exemplo do capítulo e compara as duas frases.";
  return { explanation, tip };
}

function text(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function clip(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).replace(/\s+\S*$/, "").trim()}…`;
}
