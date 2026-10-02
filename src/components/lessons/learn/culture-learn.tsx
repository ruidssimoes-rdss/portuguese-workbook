"use client";

import { AudioButton } from "@/components/primitives";
import type { CultureLearnData } from "@/lib/exercise-generator";

/** Learn phase · expression or saying. */
export function CultureLearn({ data }: { data: CultureLearnData }) {
  const rows = [
    { k: "Significado", v: data.meaning },
    { k: "À letra", v: data.literal },
    { k: "Quando usar", v: data.tip },
  ].filter((r) => r.v);
  return (
    <div className="rounded-xl border border-aula-border bg-white p-6">
      <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3">Cultura</p>
      <div className="flex items-start gap-2">
        <h2 className="text-[22px] font-semibold leading-snug tracking-[-0.02em] text-aula-text">«{data.expression.replace(/\.$/, "")}»</h2>
        <span className="mt-1.5">
          <AudioButton text={data.expression} />
        </span>
      </div>
      <div className="mt-5 divide-y divide-aula-line">
        {rows.map((r) => (
          <div key={r.k} className="grid grid-cols-[110px_1fr] gap-3 py-2.5">
            <span className="text-[12px] text-aula-text-3">{r.k}</span>
            <span className="text-[13.5px] leading-relaxed text-aula-text">{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
