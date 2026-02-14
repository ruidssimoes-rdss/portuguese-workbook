"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import grammarData from "@/data/grammar.json";
import type { GrammarData, GrammarTopic } from "@/types/grammar";

const data = grammarData as unknown as GrammarData;

const CEFR_ORDER = ["A1", "A2", "B1"] as const;

export default function GrammarPage() {
  const [search, setSearch] = useState("");

  const topicsByCefr = useMemo(() => {
    const map: Record<string, GrammarTopic[]> = { A1: [], A2: [], B1: [] };
    Object.values(data.topics).forEach((topic) => {
      if (map[topic.cefr]) map[topic.cefr].push(topic);
    });
    CEFR_ORDER.forEach((cefr) => {
      map[cefr].sort((a, b) => a.title.localeCompare(b.title));
    });
    return map;
  }, []);

  const filteredBySearch = useMemo(() => {
    if (!search.trim()) return topicsByCefr;
    const q = search.trim().toLowerCase();
    const map: Record<string, GrammarTopic[]> = { A1: [], A2: [], B1: [] };
    CEFR_ORDER.forEach((cefr) => {
      map[cefr] = topicsByCefr[cefr].filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.titlePt.toLowerCase().includes(q) ||
          t.summary.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
      );
    });
    return map;
  }, [topicsByCefr, search]);

  const totalTopics = Object.keys(data.topics).length;

  return (
    <>
      <Topbar />
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
        <section className="py-5">
          <h1 className="text-[22px] font-bold tracking-tight text-text">
            Grammar
          </h1>
          <p className="text-[13px] text-text-3 mt-0.5">
            {totalTopics} topics · A1–B1
          </p>
          <div className="flex items-center justify-between gap-4 flex-wrap mt-4">
            <input
              type="search"
              placeholder="Search topics…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-[280px] h-10 px-4 rounded-[12px] border border-[#E9E9E9] bg-white text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#3C5E95] focus:ring-1 focus:ring-[#3C5E95] transition-colors duration-200"
              aria-label="Search grammar topics"
            />
          </div>
        </section>

        <div className="space-y-10 pb-16">
          {CEFR_ORDER.map((cefr) => {
            const topics = filteredBySearch[cefr];
            if (topics.length === 0) return null;
            const label = cefr === "A1" ? "A1 — Beginner" : cefr === "A2" ? "A2 — Elementary" : "B1 — Intermediate";
            return (
              <div key={cefr}>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF] mb-3">
                  {label}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topics.map((topic) => (
                    <Link
                      key={topic.id}
                      href={`/grammar/${topic.id}`}
                      className="bg-white border border-[#E5E5E5] rounded-[14px] p-5 transition-all duration-200 hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] block"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[17px] font-bold tracking-tight text-[#111827]">
                          {topic.title}
                        </h3>
                        <span className="text-[11px] font-semibold text-[#3C5E95] bg-[#EBF2FA] px-2.5 py-[3px] rounded-full shrink-0">
                          {topic.cefr}
                        </span>
                      </div>
                      <p className="text-[13px] text-[#3C5E95] font-medium mt-1">
                        {topic.titlePt}
                      </p>
                      <p className="text-[13px] text-[#9CA3AF] mt-2 leading-relaxed line-clamp-2">
                        {topic.summary}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
