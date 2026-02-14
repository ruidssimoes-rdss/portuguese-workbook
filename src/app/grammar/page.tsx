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
        <div className="flex flex-col gap-2 py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-[22px] font-bold tracking-tight">
              Grammar
            </h1>
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-[280px] h-10 px-4 rounded-[12px] border border-[#E9E9E9] bg-white text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#3C5E95] focus:ring-1 focus:ring-[#3C5E95] transition-colors duration-200"
            />
          </div>
          <p className="text-[13px] text-text-3">
            {filteredTopics.length} of {totalTopics} topics · A1–B1
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap mb-6 pb-4 border-b border-[#E9E9E9]">
          {CEFR_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setCefrFilter(level)}
              className={
                cefrFilter === level
                  ? "bg-[#262626] text-white text-[13px] font-medium px-4 py-2 rounded-full"
                  : "bg-white border border-[#E9E9E9] text-[#6B7280] text-[13px] font-medium px-4 py-2 rounded-full hover:border-[#3C5E95] hover:text-[#3C5E95] transition-colors duration-200"
              }
            >
              {level}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
          {filteredTopics.map((topic) => (
            <Link
              key={topic.id}
              href={`/grammar/${topic.id}`}
              className="group block bg-white border border-[#E5E5E5] rounded-[14px] p-5 transition-all duration-200 hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[15px] font-bold tracking-tight text-[#111827]">
                  {topic.title}
                </h3>
                <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full shrink-0 ${cefrPillClass(topic.cefr)}`}>
                  {topic.cefr}
                </span>
              </div>
              <p className="text-[13px] text-[#6B7280] mt-1">
                {topic.titlePt}
              </p>
              <p className="text-[12px] text-[#9CA3AF] mt-2 line-clamp-2">
                {topic.summary}
              </p>
            </Link>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <p className="text-[13px] text-[#6B7280] py-8">
            No topics match your filter.
          </p>
        )}
      </main>
    </>
  );
}
