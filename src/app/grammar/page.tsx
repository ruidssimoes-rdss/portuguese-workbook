"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Badge, cefrVariant } from "@/components/ui/badge";
import grammarData from "@/data/grammar.json";
import type { GrammarData, GrammarTopic } from "@/types/grammar";

const data = grammarData as unknown as GrammarData;

const GRAMMAR_COLORS = {
  track: "#4B5563",
  border: "#9CA3AF",
  bg: "#F4F5F7",
  title: "#4B5563",
};

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
      <main className="max-w-[1100px] mx-auto px-6 md:px-10">
        <section className="py-12 md:py-16">
          <h1 className="text-3xl md:text-[36px] font-bold tracking-tight text-text">
            Grammar
          </h1>
          <p className="text-[14px] text-text-2 mt-1">
            {totalTopics} topics · A1–B1
          </p>
          <div className="mt-4">
            <input
              type="search"
              placeholder="Search topics…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md px-4 py-2.5 rounded-lg border border-border text-[14px] text-text placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#9CA3AF]"
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
                <h2
                  className="text-[12px] font-semibold uppercase tracking-wider text-text-2 mb-3"
                  style={{ color: GRAMMAR_COLORS.title }}
                >
                  {label}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {topics.map((topic) => (
                    <Link
                      key={topic.id}
                      href={`/grammar/${topic.id}`}
                      className="group border rounded-xl p-5 transition-all duration-200 hover:border-[#9CA3AF] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-px"
                      style={{
                        backgroundColor: GRAMMAR_COLORS.bg,
                        borderColor: GRAMMAR_COLORS.border,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-bold tracking-tight text-text">
                          {topic.title}
                        </h3>
                        <Badge variant={cefrVariant[topic.cefr] || "gray"}>
                          {topic.cefr}
                        </Badge>
                      </div>
                      <p className="text-[13px] text-text-2 mt-1">
                        {topic.titlePt}
                      </p>
                      <p className="text-[12px] text-text-3 mt-2 line-clamp-2">
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
