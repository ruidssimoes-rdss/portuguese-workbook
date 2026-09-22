"use client";

import { useState, useMemo } from "react";
import { SegmentedFilter, SectionLabel, AudioButton } from "@/components/primitives";

export interface ConjugationRow {
  person: string;
  form: string;
  tense: string;
  example?: string;
}

export function ConjugationTables({ rows, tenses }: { rows: ConjugationRow[]; tenses: string[] }) {
  const [tenseFilter, setTenseFilter] = useState("All");

  const grouped = useMemo(() => {
    const groups: Record<string, ConjugationRow[]> = {};
    for (const r of rows) {
      if (tenseFilter !== "All" && r.tense !== tenseFilter) continue;
      (groups[r.tense] ??= []).push(r);
    }
    return groups;
  }, [rows, tenseFilter]);

  return (
    <>
      <div className="mb-6 overflow-x-auto">
        <SegmentedFilter options={["All", ...tenses]} value={tenseFilter} onChange={setTenseFilter} />
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([tense, list]) => (
          <div key={tense}>
            <SectionLabel>{tense}</SectionLabel>
            <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg overflow-hidden">
              {list.map((row, i) => (
                <div
                  key={i}
                  className={`group grid grid-cols-[120px_1fr] md:grid-cols-[140px_1fr_1fr] items-center px-4 py-2.5 text-[13px] ${
                    i > 0 ? "border-t-[0.5px] border-[rgba(0,0,0,0.06)]" : ""
                  }`}
                >
                  <span className="text-[#9B9DA3] text-[12px]">{row.person}</span>
                  <span className="text-[#111111] font-medium flex items-center gap-1">
                    {row.form}
                    <AudioButton text={row.form} />
                  </span>
                  <span className="text-[#6C6B71] text-[12px] hidden md:block">{row.example}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
