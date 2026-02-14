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

  const pillActive =
    "px-3 py-1.5 text-[11px] font-medium text-[#475569] bg-white rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.1),0_0px_2px_rgba(0,0,0,0.06)] transition-all duration-200";
  const pillInactive =
    "px-3 py-1.5 text-[11px] font-medium text-[rgba(71,85,105,0.5)] rounded-[8px] hover:text-[#475569] transition-all duration-200 cursor-pointer";
  const groupContainer =
    "flex items-center gap-1 bg-[#FAFAFB] border border-[rgba(71,85,105,0.25)] rounded-[12px] p-[4px]";

  return (
    <>
      <Topbar />
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
        <div className="flex flex-col gap-4 py-5">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[20px] font-semibold text-[#0A0A0A]">
              Grammar
            </h1>
            <div className="w-px h-[18px] bg-[#9AA2AD] self-center" />
            <span className="text-[16px] font-medium text-[rgba(71,85,105,0.5)]">
              Gramática
            </span>
          </div>
          <p className="text-[11px] text-[#9AA2AD]">
            {totalTopics} topics · A1–B1
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className={groupContainer}>
              {CEFR_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setCefrFilter(level)}
                  className={cefrFilter === level ? pillActive : pillInactive}
                >
                  {level}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-[36px] w-full md:w-[200px] px-3 text-[11px] text-[#475569] placeholder:text-[rgba(71,85,105,0.5)] border border-[rgba(71,85,105,0.25)] rounded-[12px] bg-white focus:outline-none focus:border-[#3C5E95] focus:ring-1 focus:ring-[#3C5E95] transition-colors duration-200"
            />
          </div>
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
