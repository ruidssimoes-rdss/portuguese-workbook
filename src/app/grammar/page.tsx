"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { cefrPillClass } from "@/lib/cefr";
import grammarData from "@/data/grammar.json";
import type { GrammarData, GrammarTopic } from "@/types/grammar";

const data = grammarData as unknown as GrammarData;

const CEFR_LEVELS = ["All", "A1", "A2", "B1"] as const;
type CefrFilter = (typeof CEFR_LEVELS)[number];

export default function GrammarPage() {
  const [search, setSearch] = useState("");
  const [cefrFilter, setCefrFilter] = useState<CefrFilter>("All");

  const filteredTopics = useMemo(() => {
    let list = Object.values(data.topics);

    if (cefrFilter !== "All") {
      list = list.filter((t) => t.cefr === cefrFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.titlePt.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => a.title.localeCompare(b.title));
  }, [search, cefrFilter]);

  const totalTopics = Object.keys(data.topics).length;

  return (
    <>
      <Topbar />
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
        <div className="py-5">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-[#111827]">
              Grammar
            </h1>
            <span className="text-lg text-[#9CA3AF] italic">
              Gramática
            </span>
          </div>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            {totalTopics} topics · A1–B1
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="flex items-center gap-1.5">
              {CEFR_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setCefrFilter(level)}
                  className={cefrFilter === level
                    ? "px-3 py-1.5 rounded-full text-sm font-medium border border-[#111827] bg-[#111827] text-white cursor-pointer"
                    : "px-3 py-1.5 rounded-full text-sm font-medium border border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#111827] transition-colors cursor-pointer bg-white"
                  }
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="w-full sm:w-auto sm:ml-auto">
              <input
                type="text"
                placeholder="Search topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-[240px] px-3 py-1.5 rounded-full text-sm border border-[#E5E7EB] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#D1D5DB] transition-colors bg-white"
              />
            </div>
          </div>
          <div className="border-t border-[#F3F4F6] mt-4 mb-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
          {filteredTopics.map((topic) => (
            <Link
              key={topic.id}
              href={`/grammar/${topic.id}`}
              className="group block border border-[#E5E7EB] rounded-xl p-5 bg-white hover:border-[#D1D5DB] transition-colors duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[15px] font-bold tracking-tight text-text">
                  {topic.title}
                </h3>
                <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full shrink-0 ${cefrPillClass(topic.cefr)}`}>
                  {topic.cefr}
                </span>
              </div>
              <p className="text-[13px] text-text-secondary mt-1">
                {topic.titlePt}
              </p>
              <p className="text-[12px] text-text-muted mt-2 line-clamp-2">
                {topic.summary}
              </p>
            </Link>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <p className="text-[13px] text-text-secondary py-8">
            No topics match your filter.
          </p>
        )}
      </main>
    </>
  );
}
