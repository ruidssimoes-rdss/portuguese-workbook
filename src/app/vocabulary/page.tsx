"use client";

import { Topbar } from "@/components/layout/topbar";
import { Badge, cefrVariant } from "@/components/ui/badge";
import vocabData from "@/data/vocab.json";
import type { VocabData } from "@/types/vocab";
import Link from "next/link";

const data = vocabData as unknown as VocabData;

export default function VocabularyPage() {
  const totalWords = data.categories.reduce((s, c) => s + c.words.length, 0);

  return (
    <>
      <Topbar />
      <main className="max-w-[1100px] mx-auto px-6 md:px-10">
        <section className="py-12 md:py-16">
          <h1 className="text-3xl md:text-[36px] font-bold tracking-tight">
            Vocabulary
          </h1>
          <p className="text-[14px] text-text-2 mt-1">
            {totalWords} words · {data.categories.length} categories · A1–B1
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-16">
          {data.categories.map((cat) => {
            const levels: Record<string, number> = {};
            cat.words.forEach((w) => {
              levels[w.cefr] = (levels[w.cefr] || 0) + 1;
            });

            return (
              <Link
                key={cat.id}
                href={`/vocabulary/${cat.id}`}
                className="group border border-border rounded-xl p-6 transition-all hover:border-[#ccc] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-lg font-bold tracking-tight">
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
