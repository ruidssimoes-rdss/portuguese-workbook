"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { getBacklinks, type Backlink } from "@/lib/book/catalog";
import { encodeCard, FICHA_PARAM, type CardRef } from "@/lib/book/types";
import { useBook } from "./book-context";
import { LinkedText } from "./linked-text";
import { PlayButton } from "./play-button";

export function Kicker({ children }: { children: ReactNode }) {
  return <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#5A5A57]">{children}</div>;
}

export function LevelChip({ level }: { level: string }) {
  return (
    <span className="inline-flex h-[18px] items-center rounded-[5px] bg-[#E8ECF6] px-1.5 text-[10.5px] font-semibold text-aula-accent">
      {level}
    </span>
  );
}

export function Callout({
  tone = "navy",
  label,
  children,
}: {
  tone?: "navy" | "plain";
  label: ReactNode;
  children: ReactNode;
}) {
  const navy = tone === "navy";
  return (
    <div className={`rounded-[10px] border px-3.5 py-3 ${navy ? "border-[#D3DAEB] bg-aula-accent-faint" : "border-aula-border bg-aula-sunken"}`}>
      <div className={`mb-1.5 flex items-center gap-2 text-[12px] font-medium ${navy ? "text-aula-accent" : "text-aula-text"}`}>{label}</div>
      <div className="text-[12.5px] leading-relaxed text-aula-text">{children}</div>
    </div>
  );
}

export function Examples({ rows, skip }: { rows: { pt: string; en?: string }[]; skip?: CardRef }) {
  if (rows.length === 0) return null;
  return (
    <div className="mt-3 flex flex-col gap-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2.5 rounded-[10px] border border-aula-line bg-white px-2.5 py-2">
          <PlayButton text={row.pt} />
          <div className="min-w-0">
            <p className="text-[13px] font-medium leading-snug text-aula-text">
              <LinkedText text={row.pt} skip={skip} />
            </p>
            {row.en && <p className="text-[11.5px] leading-snug text-[#5A5A57]">{row.en}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function PropList({ rows }: { rows: { k: ReactNode; v: ReactNode }[] }) {
  return (
    <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1.5 text-[12.5px]">
      {rows.map((row, i) => (
        <div key={i} className="contents">
          <dt className="text-[#5A5A57]">{row.k}</dt>
          <dd className="min-w-0 text-aula-text">{row.v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Round-robin across chapters, culture and cards so one source type does not crowd the rest out. */
function mixBacklinks(items: Backlink[], limit: number): Backlink[] {
  const buckets = [0, 1, 2, 3, 4].map((rank) => items.filter((item) => item.rank === rank));
  const out: Backlink[] = [];
  while (out.length < limit && buckets.some((bucket) => bucket.length > 0)) {
    for (const bucket of buckets) {
      const next = bucket.shift();
      if (!next) continue;
      out.push(next);
      if (out.length >= limit) break;
    }
  }
  return out;
}

function Mark({ text, needle }: { text: string; needle: string }) {
  const i = needle ? text.toLowerCase().indexOf(needle.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="rounded-[3px] bg-[#E8ECF6] px-0.5 text-aula-text">{text.slice(i, i + needle.length)}</span>
      {text.slice(i + needle.length)}
    </>
  );
}

export function Backlinks({ target }: { target: CardRef }) {
  const book = useBook();
  const router = useRouter();
  const { total, items } = getBacklinks(target);
  const shown = mixBacklinks(items, 6);
  if (total === 0) return null;

  function open(item: Backlink) {
    if (item.href) {
      const ficha = book.current ? `?${FICHA_PARAM}=${encodeURIComponent(encodeCard(book.current))}` : "";
      router.push(`${item.href}${ficha}`);
      return;
    }
    if (item.card) book.openCard(item.card);
  }

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#5A5A57]">Aparece em</h3>
        <span className="text-[12px] text-[#5A5A57]">
          {total} {total === 1 ? "nota" : "notas"}
        </span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {shown.map((item) => (
          <li key={item.sourceKey}>
            <button
              type="button"
              onClick={() => open(item)}
              className="w-full rounded-[10px] border border-aula-line px-3 py-2 text-left transition-colors hover:bg-aula-sunken"
            >
              <span className="flex items-baseline gap-2">
                <span className="min-w-0 truncate text-[13px] font-medium text-aula-text">{item.title}</span>
                <span className="ml-auto shrink-0 text-[11px] text-[#5A5A57]">{item.kicker}</span>
              </span>
              <span className="mt-0.5 block text-[12.5px] leading-relaxed text-[#5A5A57]">
                <Mark text={item.excerpt} needle={item.needle} />
              </span>
            </button>
          </li>
        ))}
      </ul>
      {total > shown.length && <p className="mt-2 text-[12px] text-[#5A5A57]">e mais {total - shown.length}</p>}
    </section>
  );
}
