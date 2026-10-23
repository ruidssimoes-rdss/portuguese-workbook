"use client";

import { encodeCard, type ElisioAbout } from "@/lib/book/types";
import { useBook } from "./book-context";

function openClass(on: boolean): string {
  return on
    ? "border-[#D3DAEB] bg-aula-accent-faint text-aula-accent"
    : "border-aula-border bg-white text-aula-text hover:bg-aula-sunken";
}

function useAsking(about: ElisioAbout): { open: () => void; on: boolean } {
  const book = useBook();
  const on = book.current?.kind === "elisio" && encodeCard(book.current) === encodeCard({ kind: "elisio", about });
  return { open: () => book.openCard({ kind: "elisio", about }), on };
}

/** A quiet control on a paragraph. Visible on hover, focus, and touch. */
export function AskPassage({ about, children }: { about: ElisioAbout; children: React.ReactNode }) {
  const { open } = useAsking(about);
  return (
    <div className="group/ask">
      {children}
      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-150 group-focus-within/ask:grid-rows-[1fr] group-hover/ask:grid-rows-[1fr] [@media(hover:none)]:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <button
            type="button"
            onClick={open}
            className="mt-1 inline-flex h-6 items-center text-[12px] font-medium text-[#5A5A57] hover:text-aula-accent"
          >
            Perguntar ao Elísio
          </button>
        </div>
      </div>
    </div>
  );
}

/** The chapter's own entry point. Always visible. */
export function AskChapter({ about, tall = false }: { about: ElisioAbout; tall?: boolean }) {
  const { open, on } = useAsking(about);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={open}
      className={`inline-flex items-center rounded-lg border text-[13px] font-medium transition-colors ${tall ? "h-9 px-4" : "h-8 px-3"} ${openClass(on)}`}
    >
      Perguntar ao Elísio
    </button>
  );
}

/** On a word, verb or grammar card. */
export function AskCardButton({ about }: { about: ElisioAbout }) {
  const { open, on } = useAsking(about);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={open}
      className={`inline-flex h-8 items-center rounded-lg border px-3 text-[13px] font-medium transition-colors ${openClass(on)}`}
    >
      Perguntar ao Elísio
    </button>
  );
}
