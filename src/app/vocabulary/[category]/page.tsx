"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { PronunciationButton } from "@/components/pronunciation-button";
import vocabData from "@/data/vocab.json";
import type { VocabData, VocabWord } from "@/types/vocab";

const data = vocabData as unknown as VocabData;

function WordCard({
  word: w,
  isHighlight,
  flashHighlight,
  highlightedRef,
}: {
  word: VocabWord;
  isHighlight: boolean;
  flashHighlight: boolean;
  highlightedRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={isHighlight ? highlightedRef : undefined}
      className={`bg-white/50 border border-[#E9E9E9] rounded-[20px] p-[5px] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(60,94,149,0.10)] ${
        isHighlight && flashHighlight
          ? "ring-2 ring-[#3C5E95] ring-offset-2"
          : ""
      }`}
    >
      <div className="border border-[#E9E9E9] rounded-[16px] overflow-hidden bg-white p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[22px] font-bold text-[#111827] break-words">
            {w.portuguese}
          </h3>
          <PronunciationButton
            text={w.portuguese}
            size="md"
            variant="dark"
            className="shrink-0"
          />
        </div>
        {w.pronunciation && (
          <span className="font-mono text-[13px] text-[#9CA3AF] -mt-2">
            /{w.pronunciation}/
          </span>
        )}
        <span className="text-[16px] font-medium text-[#374151] break-words">
          {w.english}
        </span>
        <div className="h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent" />
        {w.example && (
          <div className="bg-[#FCFCFC] border-[0.5px] border-[#E9E9E9] rounded-[10px] p-3.5 flex flex-col gap-1">
            <div className="flex items-start gap-2">
              <PronunciationButton
                text={w.example}
                variant="dark"
                size="sm"
                className="shrink-0 mt-0.5"
              />
              <div className="min-w-0">
                <span className="text-[14px] italic text-[#1F2937] break-words">
                  &ldquo;{w.example}&rdquo;
                </span>
                {w.exampleTranslation && (
                  <span className="text-[12px] text-[#9CA3AF] block mt-0.5 break-words">
                    {w.exampleTranslation}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-[#3C5E95] bg-[#EBF2FA] px-2.5 py-[3px] rounded-full">
            {w.cefr}
          </span>
          {w.gender && (
            <span
              className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${
                w.gender === "m"
                  ? "text-blue-700 bg-blue-50"
                  : "text-pink-700 bg-pink-50"
              }`}
            >
              {w.gender}
            </span>
          )}
        </div>
        {w.relatedWords && w.relatedWords.length > 0 && (
          <div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#E5E7EB] to-transparent mb-3" />
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#9CA3AF] font-medium">
              Related
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {w.relatedWords.map((rw, j) => (
                <span
                  key={j}
                  className="text-[12px] text-[#374151] bg-[#F3F4F6] px-2.5 py-1 rounded-full"
                >
                  {rw.word} — <span className="text-[#9CA3AF]">{rw.meaning}</span>
                </span>
              ))}
            </div>
          </div>
        )}
        {w.proTip && (
          <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-[10px] p-3.5">
            <span className="text-[11px] uppercase tracking-[0.08em] text-amber-600 font-semibold">
              Pro Tip
            </span>
            <p className="text-[13px] text-[#92400E] leading-relaxed mt-1">
              {w.proTip}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

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
              className="w-full md:w-[280px] h-10 px-4 rounded-[12px] border border-[#E9E9E9] bg-white text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#3C5E95] focus:ring-1 focus:ring-[#3C5E95] transition-colors duration-200"
            />
          </div>
          <p className="text-[13px] text-text-3">{category.words.length} words</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap mb-6 pb-4 border-b border-[#E9E9E9]">
          {["All", "A1", "A2", "B1"].map((l) => (
            <button
              key={l}
              onClick={() => setCefrFilter(l)}
              className={
                cefrFilter === l
                  ? "bg-[#262626] text-white text-[13px] font-medium px-4 py-2 rounded-full"
                  : "bg-white border border-[#E9E9E9] text-[#6B7280] text-[13px] font-medium px-4 py-2 rounded-full hover:border-[#3C5E95] hover:text-[#3C5E95] transition-colors duration-200"
              }
            >
              {l}
            </button>
          ))}
        </div>

        {/* Word cards — responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-12">
          {filtered.length === 0 ? (
            <p className="col-span-full text-center py-12 text-[#6B7280] text-[14px]">
              No words match your filter.
            </p>
          ) : (
            filtered.map((w, i) => (
              <WordCard
                key={i}
                word={w}
                isHighlight={
                  !!(highlightWord && w.portuguese === decodeURIComponent(highlightWord))
                }
                flashHighlight={flashHighlight}
                highlightedRef={highlightedRef}
              />
            ))
          )}
        </div>
      </main>
    </>
  );
}
