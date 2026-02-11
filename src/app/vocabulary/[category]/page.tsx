"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Badge, cefrVariant } from "@/components/ui/badge";
import { PronunciationButton } from "@/components/pronunciation-button";
import vocabData from "@/data/vocab.json";
import type { VocabData } from "@/types/vocab";

const data = vocabData as unknown as VocabData;

export default function VocabCategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.category as string;
  const category = data.categories.find((c) => c.id === slug);
  const highlightWord = searchParams.get("highlight");
  const highlightedRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState("");
  const [cefrFilter, setCefrFilter] = useState("All");
  const [flashHighlight, setFlashHighlight] = useState(false);

  if (!category) {
    return (
      <>
        <Topbar />
        <main className="max-w-[1280px] mx-auto px-10 py-16">
          <p className="text-text-2">Category not found.</p>
          <Link href="/vocabulary" className="text-text-2 underline mt-2 block">
            ← Back to vocabulary
          </Link>
        </main>
      </>
    );
  }

  const q = search.toLowerCase();
  const filtered = category.words.filter((w) => {
    if (cefrFilter !== "All" && w.cefr !== cefrFilter) return false;
    if (
      q &&
      !w.portuguese.toLowerCase().includes(q) &&
      !w.english.toLowerCase().includes(q)
    )
      return false;
    return true;
  });

  // Scroll to and flash highlight when ?highlight= is set
  useEffect(() => {
    if (!highlightWord || !category) return;
    const decoded = decodeURIComponent(highlightWord);
    const match = category.words.some(
      (w) => w.portuguese === decoded || w.portuguese.startsWith(decoded + " ") || w.portuguese.includes(" " + decoded)
    );
    if (!match) return;
    setFlashHighlight(true);
    setTimeout(() => highlightedRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    const t = setTimeout(() => setFlashHighlight(false), 2000);
    return () => clearTimeout(t);
  }, [highlightWord, category]);

  return (
    <>
      <Topbar />
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col gap-2 py-5">
          <Link
            href="/vocabulary"
            className="text-text-2 hover:text-text text-[14px] transition-colors w-fit"
          >
            ← {category.title}
          </Link>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-[22px] font-bold tracking-tight">
              {category.title}
            </h1>
            <input
            type="text"
            placeholder="Search words…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 border border-border rounded-lg text-[13px] bg-white text-text outline-none focus:border-[#999] w-[180px] transition-colors"
          />
          </div>
          <p className="text-[13px] text-text-3">{category.words.length} words</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap mb-4 pb-3 border-b border-border-l">
          <div className="flex gap-1.5 flex-wrap">
            {["All", "A1", "A2", "B1"].map((l) => (
              <button
                key={l}
                onClick={() => setCefrFilter(l)}
                className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all whitespace-nowrap ${
                  cefrFilter === l
                    ? "bg-text text-white border-text"
                    : "bg-white text-text-2 border-border hover:bg-bg-s hover:border-[#ccc]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Word cards — responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {filtered.length === 0 ? (
            <p className="col-span-full text-center py-12 text-text-3 text-[14px]">
              No words match your filter.
            </p>
          ) : (
            filtered.map((w, i) => {
              const decodedHighlight = highlightWord ? decodeURIComponent(highlightWord) : "";
              const isHighlight = decodedHighlight && w.portuguese === decodedHighlight;
              return (
              <div
                key={i}
                ref={isHighlight ? highlightedRef : undefined}
                className={`border rounded-lg p-4 min-h-[120px] flex flex-col transition-colors duration-200 hover:border-blue-200 ${
                  isHighlight && flashHighlight
                    ? "border-blue-300 bg-blue-100"
                    : "border-border bg-white"
                }`}
              >
                <div className="flex items-start gap-2">
                  <p className="text-[17px] font-bold tracking-tight text-text break-words">
                    {w.portuguese}
                  </p>
                  <PronunciationButton text={w.portuguese} size="sm" className="shrink-0 mt-0.5" />
                </div>
                {w.pronunciation && (
                  <p className="text-sm text-gray-400 font-mono mt-0.5 break-words">
                    {w.pronunciation}
                  </p>
                )}
                <p className="text-[14px] text-text-2 mt-0.5 break-words">
                  {w.english}
                </p>
                {w.example && (
                  <>
                    <div className="flex items-start gap-2 mt-2">
                      <PronunciationButton text={w.example} size="sm" className="shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[13px] text-text-2 italic break-words">
                          {w.example}
                        </p>
                        {w.exampleTranslation && (
                          <p className="text-[12px] text-text-3 mt-0.5 break-words">
                            {w.exampleTranslation}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
                <div className="flex gap-1.5 flex-wrap mt-3 mt-auto">
                  <Badge variant={cefrVariant[w.cefr] || "gray"}>{w.cefr}</Badge>
                  {w.gender === "m" && (
                    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-[2px] rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      m
                    </span>
                  )}
                  {w.gender === "f" && (
                    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-[2px] rounded-full bg-pink-100 text-pink-800 border border-pink-200">
                      f
                    </span>
                  )}
                </div>
              </div>
              );
            })
          )}
        </div>
      </main>
    </>
  );
}
