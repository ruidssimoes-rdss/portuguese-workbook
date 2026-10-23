import { NextResponse } from "next/server";
import { z } from "zod";
import { composeNote, passageFor } from "@/lib/book/elisio";
import type { ElisioAbout } from "@/lib/book/types";

/**
 * A question about a passage or a card.
 * The note is written from the chapter already in the app. Nothing is stored
 * and nothing is sent out.
 */

const aboutSchema = z.discriminatedUnion("about", [
  z.object({
    about: z.literal("lesson"),
    id: z.string().trim().min(1).max(80),
    part: z.string().trim().min(1).max(120).optional(),
  }),
  z.object({
    about: z.literal("grammar"),
    id: z.string().trim().min(1).max(80),
    part: z.string().trim().min(1).max(120).optional(),
  }),
  z.object({
    about: z.literal("verb"),
    id: z.string().trim().min(1).max(80),
  }),
  z.object({
    about: z.literal("word"),
    category: z.string().trim().min(1).max(80),
    word: z.string().trim().min(1).max(120),
  }),
]);

const askSchema = z.object({
  about: aboutSchema,
  question: z.string().trim().min(2).max(400),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const parsed = askSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const passage = passageFor(parsed.data.about as ElisioAbout);
  if (!passage) {
    return NextResponse.json({ error: "Não encontrei este passo." }, { status: 404 });
  }
  return NextResponse.json({ note: composeNote(passage, parsed.data.question) });
}
