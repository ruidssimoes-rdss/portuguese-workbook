"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { cefrPillClass } from "@/lib/cefr";
import verbData from "@/data/verbs.json";
import type { VerbDataSet } from "@/types";
import Link from "next/link";

const data = verbData as unknown as VerbDataSet;

const totalConjugations = data.order.reduce(
  (sum, key) => sum + (data.verbs[key]?.conjugations?.length ?? 0),
  0
);

function matchFilters(
  meta: { group: string; cefr: string; priority: string },
  typeFilter: string,
  levelFilter: string | null,
  priorityFilter: string | null
): boolean {
  if (typeFilter !== "All") {
    if (typeFilter === "Irregular" && !meta.group.startsWith("Irregular")) return false;
    if (typeFilter === "Regular -AR" && !meta.group.startsWith("Regular -AR")) return false;
    if (typeFilter === "Regular -ER" && !meta.group.startsWith("Regular -ER")) return false;
    if (typeFilter === "Regular -IR" && !meta.group.startsWith("Regular -IR")) return false;
  }
  if (levelFilter && meta.cefr !== levelFilter) return false;
  if (priorityFilter && meta.priority !== priorityFilter) return false;
  return true;
}

function shortGroup(group: string): string {
  if (group.startsWith("Irregular")) return "Irregular";
  if (group.startsWith("Regular -AR")) return "-AR";
  if (group.startsWith("Regular -ER")) return "-ER";
  if (group.startsWith("Regular -IR")) return "-IR";
  return group;
}

const pillActive =
  "px-3 py-1.5 text-[11px] font-medium text-[#475569] bg-white rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.1),0_0px_2px_rgba(0,0,0,0.06)] transition-all duration-200";
const pillInactive =
  "px-3 py-1.5 text-[11px] font-medium text-[rgba(71,85,105,0.5)] rounded-[8px] hover:text-[#475569] transition-all duration-200 cursor-pointer";
const groupContainer =
  "flex items-center gap-1 bg-[#FAFAFB] border border-[rgba(71,85,105,0.25)] rounded-[12px] p-[4px]";

export default function ConjugationsPage() {
  const [typeFilter, setTypeFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const q = search.toLowerCase();
  const verbs = data.order.filter((v) => {
    const m = data.verbs[v].meta;
    if (!matchFilters(m, typeFilter, levelFilter, priorityFilter)) return false;
    if (q && !v.toLowerCase().includes(q) && !m.english.toLowerCase().includes(q))
      return false;
    return true;
  });

  return (
    <>
      <Topbar />
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
        <div className="flex flex-col gap-4 py-5">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[20px] font-semibold text-text">
              Conjugations
            </h1>
            <div className="w-px h-[18px] bg-[#9AA2AD] self-center" />
            <span className="text-[16px] font-medium text-[rgba(71,85,105,0.5)]">
              Conjugações
            </span>
          </div>
          <p className="text-[11px] text-[#9AA2AD]">
            {data.order.length} verbs · {totalConjugations.toLocaleString()} conjugations · 6 tenses
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className={groupContainer}>
              {["All", "Irregular", "Regular -AR", "Regular -ER", "Regular -IR"].map((f) => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={typeFilter === f ? pillActive : pillInactive}
                >
                  {f === "Regular -AR" ? "-AR" : f === "Regular -ER" ? "-ER" : f === "Regular -IR" ? "-IR" : f}
                </button>
              ))}
            </div>
            <div className={groupContainer}>
              {["A1", "A2", "B1"].map((f) => (
                <button
                  key={f}
                  onClick={() => setLevelFilter((prev) => (prev === f ? null : f))}
                  className={levelFilter === f ? pillActive : pillInactive}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className={groupContainer}>
              {["Essential", "Core", "Useful"].map((f) => (
                <button
                  key={f}
                  onClick={() => setPriorityFilter((prev) => (prev === f ? null : f))}
                  className={priorityFilter === f ? pillActive : pillInactive}
                >
                  {f}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search verbs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-[36px] w-full md:w-[200px] px-3 text-[11px] text-[#475569] placeholder:text-[rgba(71,85,105,0.5)] border border-[rgba(71,85,105,0.25)] rounded-[12px] bg-white focus:outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827] transition-colors duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(198px,1fr))] gap-4 pb-16">
          {verbs.map((v) => {
            const m = data.verbs[v].meta;
            return (
              <Link
                key={v}
                href={`/conjugations/${v.toLowerCase()}`}
                className="bg-white border border-[#E5E5E5] rounded-[14px] p-5 flex flex-col min-h-[140px] transition-all duration-200 hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
              >
                <div className="text-[17px] font-bold tracking-[-0.34px] leading-[27px] text-text mb-1">
                  {v}
                </div>
                <div className="text-[13px] text-text-secondary leading-relaxed flex-1">
                  {m.english}
                </div>
                <div className="flex gap-1.5 flex-wrap mt-auto pt-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${
                    m.group.startsWith("Irregular")
                      ? "text-amber-700 bg-amber-50"
                      : m.group.startsWith("Regular -AR")
                        ? "text-emerald-700 bg-emerald-50"
                        : m.group.startsWith("Regular -ER")
                          ? "text-blue-700 bg-blue-50"
                          : "text-violet-700 bg-violet-50"
                  }`}>
                    {shortGroup(m.group)}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${cefrPillClass(m.cefr)}`}>
                    {m.cefr}
                  </span>
                </div>
              </Link>
            );
          })}
          {verbs.length === 0 && (
            <div className="col-span-full text-center py-12 text-text-secondary text-[14px]">
              No verbs match your filter.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
