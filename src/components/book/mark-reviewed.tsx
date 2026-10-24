"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { getGrammar, getVerb, getWord } from "@/lib/book/catalog";
import { encodeCard, FICHA_PARAM, type CardRef } from "@/lib/book/types";
import { updateItemMastery, type CEFRLevel, type ContentType } from "@/lib/learning-engine/mastery-tracker";

function targetOf(card: CardRef): { type: ContentType; id: string; cefr: CEFRLevel; category?: string } | null {
  if (card.kind === "verb") {
    const verb = getVerb(card.id);
    if (!verb) return null;
    const cefr = (verb.cefr === "A2" || verb.cefr === "B1" ? verb.cefr : "A1") as CEFRLevel;
    return { type: "verb", id: verb.id.toUpperCase(), cefr, category: verb.group };
  }
  if (card.kind === "word") {
    const word = getWord(card);
    if (!word) return null;
    const cefr = (word.cefr === "A2" || word.cefr === "B1" ? word.cefr : "A1") as CEFRLevel;
    return { type: "vocab", id: word.portuguese, cefr, category: word.category };
  }
  if (card.kind === "grammar") {
    const topic = getGrammar(card.id);
    if (!topic) return null;
    const cefr = (topic.cefr === "A2" || topic.cefr === "B1" ? topic.cefr : "A1") as CEFRLevel;
    return { type: "grammar", id: topic.id, cefr };
  }
  return null;
}

/** Saves a review on the card. Does not touch the course resume pointer. */
export function MarkReviewed({ card }: { card: CardRef }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const params = useSearchParams();
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const target = targetOf(card);
  if (!target) return null;

  if (!user) {
    const next = new URLSearchParams(params.toString());
    if (!next.get(FICHA_PARAM)) next.set(FICHA_PARAM, encodeCard(card));
    const query = next.toString();
    const href = `/auth/login?next=${encodeURIComponent(query ? `${pathname}?${query}` : pathname)}`;
    return (
      <p className="text-[12.5px] leading-relaxed text-[#5A5A57]">
        <Link href={href} className="font-medium text-aula-accent">
          Entrar
        </Link>{" "}
        to mark this reviewed. That saves the card only — it does not move the course.
      </p>
    );
  }

  async function mark() {
    if (!target || !user) return;
    setState("saving");
    try {
      await updateItemMastery(user.id, target.type, target.id, target.cefr, true, target.category);
      window.dispatchEvent(new Event("aula-mastery"));
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex flex-col items-start gap-heading">
      <button
        type="button"
        onClick={() => {
          void mark();
        }}
        disabled={state === "saving" || state === "done"}
        className="tablet-target inline-flex h-8 items-center rounded-lg border border-aula-border bg-white px-3 text-[13px] font-medium text-aula-text transition-colors hover:bg-aula-sunken disabled:opacity-50"
      >
        {state === "done" ? "Revista" : state === "saving" ? "A guardar…" : "Marcar como revista"}
      </button>
      <p className="text-[12.5px] leading-relaxed text-[#5A5A57]">
        {state === "error"
          ? "Could not save that review."
          : "Marks this card reviewed. Your place in the course stays where it was."}
      </p>
    </div>
  );
}
