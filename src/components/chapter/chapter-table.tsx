"use client";

import type { ReactNode } from "react";
import { PlayButton } from "@/components/book/play-button";

export type TableLayout = "vocab" | "conjugation" | "dialogue";

export interface TableRow {
  /** Portuguese text the row's play button speaks. */
  audio: string;
  c1: string;
  c2: string;
  c3: string;
  c4: string;
  /** When set, c1 is a button (opens the word in the rail). */
  onOpen?: () => void;
}

type Col = { head: string; width: string; text: string };

/** Fixed basis per column; the last column takes what is left. Columns may shrink when the pane is narrow. */
const COLS: Record<TableLayout, [Col, Col, Col, Col]> = {
  vocab: [
    { head: "PT", width: `@min-[560px]:basis-[140px]`, text: "text-[13px] font-medium text-aula-text" },
    { head: "Phonetics", width: `@min-[560px]:basis-[200px]`, text: "text-[12px] text-aula-text-3" },
    { head: "EN", width: `@min-[560px]:basis-[160px]`, text: "text-[12px] text-aula-text-2" },
    { head: "Example", width: "", text: "text-[12px] text-aula-accent" },
  ],
  conjugation: [
    { head: "Pessoa", width: `@min-[560px]:basis-[120px]`, text: "text-[12px] font-medium text-aula-text" },
    { head: "Forma", width: `@min-[560px]:basis-[80px]`, text: "text-[13px] font-medium text-aula-text" },
    { head: "Phonetics", width: `@min-[560px]:basis-[120px]`, text: "text-[12px] text-aula-text-3" },
    { head: "Example", width: "", text: "text-[12px] text-aula-accent" },
  ],
  dialogue: [
    { head: "#", width: `@min-[560px]:basis-[32px]`, text: "text-[12px] text-aula-text-3" },
    { head: "Linha", width: `@min-[560px]:basis-[280px]`, text: "text-[13px] font-medium text-aula-text" },
    { head: "Phonetics", width: `@min-[560px]:basis-[300px]`, text: "text-[12px] text-aula-text-3" },
    { head: "EN", width: "", text: "text-[12px] text-aula-text-2" },
  ],
};

/** Which columns sit on which line when the table is narrower than 560px. Wider, every column shares one row. */
const STACK: Record<TableLayout, [number[], number[], number[]]> = {
  vocab: [[0], [1, 2], [3]],
  conjugation: [[0, 1], [2], [3]],
  dialogue: [[0, 1], [2], [3]],
};

/** `oo-bree-GAH-doo / oo-bree-GAH-duh` becomes `/oo-bree-GAH-doo/ · /oo-bree-GAH-duh/`. */
export function slashPhonetics(source: string): string {
  const parts = source.split(" / ").map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) return "";
  return parts.map((part) => `/${part}/`).join(" · ");
}

export function ChapterTable({
  layout,
  header,
  rows,
}: {
  layout: TableLayout;
  /** Replaces the first column label (e.g. "Pronome"). */
  header?: string;
  rows: TableRow[];
}) {
  const cols = COLS[layout];
  const labels = cols.map((col, i) => (i === 0 && header ? header : col.head));

  function cell(row: TableRow, i: number): ReactNode {
    const col = cols[i];
    const last = i === 3;
    const value = [row.c1, row.c2, row.c3, row.c4][i];
    const isPhonetics = col.head === "Phonetics";
    const shown = isPhonetics ? slashPhonetics(value) || "·" : value;
    const text = isPhonetics && !value ? "text-[12px] text-aula-text-3" : col.text;
    const size = last ? `min-w-0 @min-[560px]:flex-1 @min-[560px]:px-3` : `min-w-0 shrink @min-[560px]:grow-0 ${col.width}`;
    const content =
      i === 0 && row.onOpen ? (
        <button type="button" onClick={row.onOpen} className="text-left transition-colors hover:text-aula-accent">
          {shown}
        </button>
      ) : (
        shown
      );
    return (
      <div key={i} className={`${size} ${text} break-words`}>
        {content}
      </div>
    );
  }

  const [top, mid, bottom] = STACK[layout];

  return (
    <div className="@container overflow-hidden rounded-[10px] border border-aula-line bg-white">
      <div className={`hidden items-center gap-[6px] bg-aula-canvas py-[7px] pr-[6px] pl-[10px] @min-[560px]:flex`}>
        <span className="w-[28px] shrink-0" aria-hidden />
        {labels.map((label, i) => (
          <div
            key={label + i}
            className={`text-[11px] font-medium text-aula-text-3 ${i === 3 ? `min-w-0 flex-1 px-3` : `min-w-0 shrink ${cols[i].width}`}`}
          >
            {label}
          </div>
        ))}
      </div>
      {rows.map((row, r) => (
        <div
          key={r}
          className={`flex flex-col gap-[4px] py-[5px] pr-[6px] pl-[10px] @min-[560px]:flex-row @min-[560px]:items-center @min-[560px]:gap-[6px] ${
            r < rows.length - 1 ? "border-b border-aula-line" : ""
          } ${r % 2 === 1 ? "bg-aula-canvas" : "bg-white"}`}
        >
          <div className={`flex items-center gap-[6px] @min-[560px]:contents`}>
            <PlayButton text={row.audio} />
            {top.map((i) => cell(row, i))}
          </div>
          <div className={`flex flex-col gap-[2px] pl-[34px] @min-[560px]:contents`}>
            {mid.map((i) => cell(row, i))}
          </div>
          <div className={`pl-[34px] @min-[560px]:contents`}>{bottom.map((i) => cell(row, i))}</div>
        </div>
      ))}
    </div>
  );
}
