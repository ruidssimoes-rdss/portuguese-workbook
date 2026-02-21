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

const PILL_ACTIVE =
  "px-3 py-1.5 rounded-full text-sm font-medium border border-[#111827] bg-[#111827] text-white cursor-pointer";
const PILL_INACTIVE =
  "px-3 py-1.5 rounded-full text-sm font-medium border border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#111827] transition-colors cursor-pointer bg-white";

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
        <div className="py-5">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-[#111827]">
              Conjugations
            </h1>
            <span className="text-[13px] font-medium text-[#9CA3AF] italic">
              Conjugações
            </span>
          </div>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            {data.order.length} verbs · {totalConjugations.toLocaleString()} conjugations · 6 tenses
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="flex items-center gap-1.5">
              {["All", "Irregular", "Regular -AR", "Regular -ER", "Regular -IR"].map((f) => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className={typeFilter === f ? PILL_ACTIVE : PILL_INACTIVE}
                >
                  {f === "Regular -AR" ? "-AR" : f === "Regular -ER" ? "-ER" : f === "Regular -IR" ? "-IR" : f}
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-[#E5E7EB]" />
            <div className="flex items-center gap-1.5">
              {["A1", "A2", "B1"].map((f) => (
                <button
                  key={f}
                  onClick={() => setLevelFilter((prev) => (prev === f ? null : f))}
                  className={levelFilter === f ? PILL_ACTIVE : PILL_INACTIVE}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-[#E5E7EB]" />
            <div className="flex items-center gap-1.5">
              {["Essential", "Core", "Useful"].map((f) => (
                <button
                  key={f}
                  onClick={() => setPriorityFilter((prev) => (prev === f ? null : f))}
                  className={priorityFilter === f ? PILL_ACTIVE : PILL_INACTIVE}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="w-full sm:w-auto sm:ml-auto">
              <input
                type="text"
                placeholder="Search verbs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-[240px] px-3 py-1.5 rounded-full text-sm border border-[#E5E7EB] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#D1D5DB] transition-colors bg-white"
              />
            </div>
          </div>
          <div className="border-t border-[#F3F4F6] mt-4 mb-6" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-16">
          {verbs.map((v) => {
            const m = data.verbs[v].meta;
            return (
              <Link
                key={v}
                href={`/conjugations/${v.toLowerCase()}`}
                className="block group"
              >
                <div className="border border-[#E5E7EB] rounded-xl p-5 bg-white flex flex-col min-h-[140px] hover:border-[#D1D5DB] hover:shadow-sm transition-all duration-200 h-full">
                  <div className="text-[15px] font-semibold text-text mb-1">
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
                </div>
              </Link>
            );
          })}
          {verbs.length === 0 && (
            <div className="col-span-full text-center py-12 text-text-secondary text-[13px]">
              No verbs match your filter.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
