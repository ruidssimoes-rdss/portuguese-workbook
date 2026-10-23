"use client";

import { linkPlain, type CardRef } from "@/lib/book/catalog";
import { encodeCard } from "@/lib/book/types";
import { useBook } from "./book-context";

const linkClass =
  "rounded-[3px] px-[2px] font-medium text-aula-accent transition-colors hover:bg-[#E8ECF6]";

/** Running text with the words, verbs, grammar topics and culture notes linked. */
export function LinkedText({ text, skip, className = "" }: { text: string; skip?: CardRef; className?: string }) {
  const book = useBook();
  const parts = linkPlain(text, skip);
  const active = book.current ? encodeCard(book.current) : null;

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.kind !== "link" || !part.ref) return <span key={i}>{part.text}</span>;
        const key = encodeCard(part.ref);
        const on = key === active;
        return (
          <button
            key={i}
            type="button"
            onClick={() => book.openCard(part.ref!)}
            aria-current={on ? "true" : undefined}
            className={`${linkClass} ${on ? "bg-[#E8ECF6]" : ""}`}
          >
            {part.text}
          </button>
        );
      })}
    </span>
  );
}

/** A chip that opens a card. Used for the word row at the top of a lesson. */
export function CardChip({ refCard, children }: { refCard: CardRef; children: React.ReactNode }) {
  const book = useBook();
  const on = book.current ? encodeCard(book.current) === encodeCard(refCard) : false;
  return (
    <button
      type="button"
      onClick={() => book.openCard(refCard)}
      aria-current={on ? "true" : undefined}
      className={`${linkClass} ${on ? "bg-[#E8ECF6]" : ""}`}
    >
      {children}
    </button>
  );
}
