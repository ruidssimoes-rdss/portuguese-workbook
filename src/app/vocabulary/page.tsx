"use client";

import { Topbar } from "@/components/layout/topbar";
import { Badge, cefrVariant } from "@/components/ui/badge";
import vocabData from "@/data/vocab.json";
import type { VocabData } from "@/types/vocab";
import Link from "next/link";

const data = vocabData as unknown as VocabData;

const CATEGORY_TINTS: Record<string, string> = {
  "greetings-expressions": "bg-indigo-50 border-indigo-100",
  "numbers-time": "bg-purple-50 border-purple-100",
  "colours-weather": "bg-violet-50 border-violet-100",
  "food-drink": "bg-slate-50 border-slate-200",
  "travel-directions": "bg-indigo-100 border-indigo-200",
  "home-rooms": "bg-purple-100 border-purple-200",
  "family-daily-routine": "bg-violet-100 border-violet-200",
  "work-education": "bg-slate-100 border-slate-200",
  "health-body": "bg-indigo-50 border-indigo-200",
  "shopping-money": "bg-purple-50 border-purple-200",
  "nature-animals": "bg-violet-50 border-violet-200",
  "emotions-personality": "bg-slate-100 border-slate-300",
  "colloquial-slang": "bg-fuchsia-50 border-fuchsia-100",
};

export default function VocabularyPage() {
  const totalWords = data.categories.reduce((s, c) => s + c.words.length, 0);

  return (
    <>
      <Topbar />
      <main className="max-w-[1100px] mx-auto px-4 md:px-6 lg:px-10">
        <section className="py-12 md:py-16">
          <h1 className="text-3xl md:text-[36px] font-bold tracking-tight text-text">
            Vocabulary
          </h1>
          <p className="text-[14px] text-text-2 mt-1">
            {totalWords.toLocaleString()} words · {data.categories.length} categories · A1–B1
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-16 auto-rows-fr">
          {data.categories.map((cat) => {
            const levels: Record<string, number> = {};
            cat.words.forEach((w) => {
              levels[w.cefr] = (levels[w.cefr] || 0) + 1;
            });
            const tint = CATEGORY_TINTS[cat.id] ?? "bg-slate-50 border-slate-200";

            return (
              <Link
                key={cat.id}
                href={`/vocabulary/${cat.id}`}
                className={`group border rounded-lg p-4 md:p-6 transition-all duration-200 hover:shadow-[0_4px_16px_rgba(91,79,160,0.08)] hover:-translate-y-px hover:border-indigo-200 ${tint}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-lg font-bold tracking-tight text-text">
                        {cat.title}
                      </h2>
                      <span className="text-[12px] text-text-3 font-medium whitespace-nowrap">
                        {cat.words.length} words
                      </span>
                    </div>
                    <p className="text-[13px] text-text-2 mt-1">
                      {cat.description}
                    </p>
                    <div className="flex gap-1.5 mt-3">
                      {Object.entries(levels)
                        .sort()
                        .map(([level, count]) => (
                          <Badge
                            key={level}
                            variant={cefrVariant[level] || "gray"}
                          >
                            {level}: {count}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
