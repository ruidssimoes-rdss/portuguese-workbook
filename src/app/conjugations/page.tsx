"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
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
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
        <div className="flex flex-col gap-2 py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-[22px] font-bold tracking-tight">
              Conjugations
            </h1>
            <input
              type="text"
              placeholder="Search verbs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-[280px] h-10 px-4 rounded-[12px] border border-[#E9E9E9] bg-white text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#3C5E95] focus:ring-1 focus:ring-[#3C5E95] transition-colors duration-200"
            />
          </div>
          <p className="text-[13px] text-text-3">
            {data.order.length} verbs · {data.order.length * 30} conjugations · 6 tenses
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-6 pb-4 border-b border-[#E9E9E9]">
          {filters.map((f, i) =>
            f === "|" ? (
              <div key={i} className="w-px h-5 bg-[#E9E9E9] mx-1 shrink-0" />
            ) : (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  filter === f
                    ? "bg-[#262626] text-white text-[13px] font-medium px-4 py-2 rounded-full"
                    : "bg-white border border-[#E9E9E9] text-[#6B7280] text-[13px] font-medium px-4 py-2 rounded-full hover:border-[#3C5E95] hover:text-[#3C5E95] transition-colors duration-200"
                }
              >
                {f}
              </button>
            )
          )}
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(198px,1fr))] gap-3 pb-16">
          {verbs.map((v) => {
            const m = data.verbs[v].meta;
            return (
              <Link
                key={v}
                href={`/conjugations/${v.toLowerCase()}`}
                className="bg-white border border-[#E5E5E5] rounded-[14px] p-5 flex flex-col min-h-[140px] transition-all duration-200 hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
              >
                <div className="text-[17px] font-bold tracking-[-0.34px] leading-[27px] text-[#111827] mb-1">
                  {v}
                </div>
                <div className="text-[13px] text-[#6B7280] leading-relaxed flex-1">
                  {m.english}
                </div>
                <div className="flex gap-1.5 flex-wrap mt-auto pt-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${
                    m.group === "Irregular"
                      ? "text-amber-700 bg-amber-50"
                      : m.group === "Regular -AR"
                        ? "text-emerald-700 bg-emerald-50"
                        : m.group === "Regular -ER"
                          ? "text-blue-700 bg-blue-50"
                          : "text-violet-700 bg-violet-50"
                  }`}>
                    {m.group}
                  </span>
                  <span className="text-[11px] font-semibold text-[#3C5E95] bg-[#EBF2FA] px-2.5 py-[3px] rounded-full">
                    {m.cefr}
                  </span>
                </div>
              </Link>
            );
          })}
          {verbs.length === 0 && (
            <div className="col-span-full text-center py-12 text-[#6B7280] text-[14px]">
              No verbs match your filter.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
