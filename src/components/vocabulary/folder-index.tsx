import Link from "next/link";
import { LevelTag } from "@/components/shell/level-tag";
import { MasteryPips } from "@/components/shell/mastery-pips";
import { daysLabel } from "@/lib/format";
import type { ItemState } from "@/lib/learning-state";
import type { LibraryWord } from "@/lib/library";

export interface IndexRow {
  word: LibraryWord;
  state: ItemState;
}

function Due({ state }: { state: ItemState }) {
  if (state.overdueDays !== null && state.overdueDays >= 1) {
    return <span className="text-state-overdue">{daysLabel(state.overdueDays)}</span>;
  }
  if (state.due) return <span className="text-text-quaternary">hoje</span>;
  if (state.dueInDays !== null) return <span className="text-text-quaternary">em {daysLabel(state.dueInDays)}</span>;
  return <span className="text-text-quaternary">—</span>;
}

/** A folder of words as a table: overdue first, then the rest in their order. */
export function FolderIndex({
  title,
  summary,
  rows,
  emptyText,
}: {
  title: string;
  summary: string;
  rows: IndexRow[];
  emptyText: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[620px] pt-[46px] pb-24">
      <h1 className="text-title font-semibold text-text-primary">{title}</h1>
      <p className="mt-1.5 text-small tabular-nums text-text-quaternary">{summary}</p>

      {rows.length === 0 ? (
        <p className="mt-8 text-ui text-text-secondary">{emptyText}</p>
      ) : (
        <table className="mt-6 w-full table-fixed border-collapse text-ui">
          <colgroup>
            <col className="w-[200px]" />
            <col />
            <col className="w-[64px]" />
            <col className="w-[90px]" />
            <col className="w-[74px]" />
          </colgroup>
          <thead>
            <tr className="h-[30px] border-b border-border-default text-left text-caption text-text-quaternary">
              <th scope="col" className="font-normal">Palavra</th>
              <th scope="col" className="font-normal">Significado</th>
              <th scope="col" className="font-normal">Nível</th>
              <th scope="col" className="font-normal">Domínio</th>
              <th scope="col" className="font-normal">Revisão</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ word, state }) => (
              <tr key={word.href} className="group h-[33px] border-b border-border-subtle transition-colors hover:bg-surface-sunken">
                <td className="truncate pr-3">
                  <Link
                    href={word.href}
                    className="rounded-xs font-medium text-accent transition-colors group-hover:text-accent-hover"
                  >
                    {word.title}
                  </Link>
                </td>
                <td className="truncate pr-3 text-text-secondary">{word.english}</td>
                <td>
                  <LevelTag level={word.cefr} />
                </td>
                <td>
                  <MasteryPips level={state.level} state={state.state} />
                </td>
                <td className="tabular-nums">
                  <Due state={state} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function sortForIndex(rows: IndexRow[]): IndexRow[] {
  return rows
    .map((r, i) => ({ r, i }))
    .sort((a, b) => {
      const ao = a.r.state.overdueDays ?? -1;
      const bo = b.r.state.overdueDays ?? -1;
      const aLate = a.r.state.state === "overdue";
      const bLate = b.r.state.state === "overdue";
      if (aLate !== bLate) return aLate ? -1 : 1;
      if (aLate && bLate && ao !== bo) return bo - ao;
      return a.i - b.i;
    })
    .map(({ r }) => r);
}
