"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Badge, groupVariant, cefrVariant } from "@/components/ui/badge";
import verbData from "@/data/verbs.json";
import type { VerbDataSet } from "@/types";
import Link from "next/link";

const data = verbData as unknown as VerbDataSet;

const filters = [
  "All",
  "Irregular",
  "Regular -AR",
  "Regular -ER",
  "Regular -IR",
  "|",
  "A1",
  "A2",
  "B1",
  "|",
  "Essential",
  "Core",
  "Useful",
];

function matchFilter(
  meta: { group: string; cefr: string; priority: string },
  filter: string
): boolean {
  if (filter === "All") return true;
  if (["Irregular", "Regular -AR", "Regular -ER", "Regular -IR"].includes(filter))
    return meta.group === filter;
  if (["A1", "A2", "B1", "B2"].includes(filter)) return meta.cefr === filter;
  if (["Essential", "Core", "Useful"].includes(filter))
    return meta.priority === filter;
  return true;
}

export default function ConjugationsPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const q = search.toLowerCase();
  const verbs = data.order.filter((v) => {
    const m = data.verbs[v].meta;
    if (!matchFilter(m, filter)) return false;
    if (q && !v.toLowerCase().includes(q) && !m.english.toLowerCase().includes(q))
      return false;
    return true;
  });

  return (
    <>
      <Topbar />
      <main className="max-w-[1100px] mx-auto px-4 md:px-6 lg:px-10">
        <section className="py-12 md:py-16">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-[36px] font-bold tracking-tight">
                Conjugations
              </h1>
              <p className="text-[14px] text-text-2 mt-1">
                {data.order.length} verbs · {data.order.length * 30} conjugations · 6 tenses
              </p>
            </div>
            <input
              type="text"
              placeholder="Search verbs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 border border-border rounded-lg text-[13px] bg-white text-text outline-none focus:border-[#999] w-[180px] transition-colors"
            />
          </div>
        </section>

        <div className="flex items-center gap-2 flex-wrap pb-6 border-t border-border-l pt-5">
          {filters.map((f, i) =>
            f === "|" ? (
              <div key={i} className="w-px h-5 bg-border mx-1 shrink-0" />
            ) : (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-colors duration-200 whitespace-nowrap ${
                  filter === f
                    ? "bg-[#5B4FA0] text-white border-[#5B4FA0]"
                    : "bg-white text-text-2 border-border hover:bg-bg-s hover:border-gray-300"
                }`}
              >
                {f}
              </button>
            )
          )}
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(198px,1fr))] gap-2.5 pb-16">
          {verbs.map((v) => {
            const m = data.verbs[v].meta;
            return (
              <Link
                key={v}
                href={`/conjugations/${v.toLowerCase()}`}
                className="group bg-white border border-border rounded-lg p-4 md:p-5 flex flex-col min-h-[160px] transition-all duration-200 hover:border-indigo-200 hover:shadow-[0_4px_16px_rgba(91,79,160,0.08)] hover:-translate-y-px"
              >
                <div className="text-[17px] font-bold tracking-[-0.34px] leading-[27px] mb-2.5">
                  {v}
                </div>
                <div className="text-[13px] text-text-2 leading-[21px] flex-1">
                  {m.english}
                </div>
                <div className="flex gap-1.5 flex-wrap mt-auto">
                  <Badge variant={groupVariant[m.group]}>{m.group}</Badge>
                  <Badge variant={cefrVariant[m.cefr]}>{m.cefr}</Badge>
                </div>
              </Link>
            );
          })}
          {verbs.length === 0 && (
            <div className="col-span-full text-center py-12 text-text-3 text-[14px]">
              No verbs match your filter.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
