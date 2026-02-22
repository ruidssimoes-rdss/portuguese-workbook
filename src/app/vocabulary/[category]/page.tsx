"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { cefrPillClass } from "@/lib/cefr";
import { PronunciationButton } from "@/components/pronunciation-button";
import vocabData from "@/data/vocab.json";
import type { VocabData, VocabWord } from "@/types/vocab";

const data = vocabData as unknown as VocabData;

const CATEGORY_PT_TITLE: Record<string, string> = {
  "greetings-expressions": "Cumprimentos e Expressões",
  "numbers-time": "Números e Tempo",
  "colours-weather": "Cores e Clima",
  "food-drink": "Comida e Bebida",
  "home-rooms": "Casa e Divisões",
  "family-daily-routine": "Família e Rotina Diária",
  "shopping-money": "Compras e Dinheiro",
  "travel-directions": "Viagens e Direções",
  "work-education": "Trabalho e Educação",
  "health-body": "Saúde e Corpo",
  "nature-animals": "Natureza e Animais",
  "emotions-personality": "Emoções e Personalidade",
  "colloquial-slang": "Coloquial e Calão",
  "technology-internet": "Tecnologia e Internet",
  "clothing-appearance": "Roupa e Aparência",
};

function Popover({
  trigger,
  children,
  align = "left",
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => {
          if (window.matchMedia("(hover: hover)").matches) setOpen(true);
        }}
        onMouseLeave={() => {
          if (window.matchMedia("(hover: hover)").matches) setOpen(false);
        }}
        className="cursor-pointer"
      >
        {trigger}
      </button>
      {open && (
        <div
          className={`absolute bottom-full mb-2 z-50 w-[280px] bg-white border border-[#E5E7EB] rounded-[12px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

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
      className={`bg-white border border-[#E5E7EB] rounded-xl p-5 flex flex-col gap-3 transition-all duration-200 hover:border-[#D1D5DB] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] ${
        isHighlight && flashHighlight
          ? "ring-2 ring-[#111827] ring-offset-2"
          : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[18px] font-semibold leading-tight text-text break-words">
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
        <span className="font-mono text-[12px] text-text-muted -mt-1.5">
          /{w.pronunciation}/
        </span>
      )}
      <span className="text-[15px] font-medium text-[#374151] break-words">
        {w.english}
      </span>
      {w.example && (
        <div className="bg-[#F8F8FA] rounded-[8px] px-3 py-2.5 flex items-start gap-2">
          <PronunciationButton
            text={w.example}
            variant="muted"
            size="sm"
            className="shrink-0 mt-0.5"
          />
          <div className="min-w-0">
            <span className="text-[13px] italic leading-snug text-[#1F2937] break-words">
              &ldquo;{w.example}&rdquo;
            </span>
            {w.exampleTranslation && (
              <span className="text-[11px] text-text-muted block mt-0.5 break-words">
                {w.exampleTranslation}
              </span>
            )}
          </div>
        </div>
      )}
      {/* CEFR + Gender + Related + Pro Tip badges */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full ${cefrPillClass(w.cefr)}`}>
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
        {w.relatedWords && w.relatedWords.length > 0 && (
          <Popover
            trigger={
              <span className="text-[11px] font-semibold text-text-secondary bg-border-light px-2.5 py-[3px] rounded-full hover:bg-[#E5E7EB] transition-colors duration-150">
                Related ({w.relatedWords.length})
              </span>
            }
          >
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.08em] text-text-muted font-medium mb-1">
                Related Words
              </span>
              {w.relatedWords.map((rw, j) => (
                <div key={j} className="flex items-baseline gap-1.5">
                  <span className="text-[13px] font-medium text-text">{rw.word}</span>
                  <span className="text-[12px] text-text-muted">— {rw.meaning}</span>
                </div>
              ))}
            </div>
          </Popover>
        )}
        {w.proTip && (
          <Popover
            trigger={
              <span className="text-[11px] font-semibold text-amber-600 bg-[#FFFBEB] border border-[#FEF3C7] px-2.5 py-[3px] rounded-full hover:bg-[#FEF3C7] transition-colors duration-150">
                Pro Tip
              </span>
            }
            align="right"
          >
            <div>
              <span className="text-[10px] uppercase tracking-[0.08em] text-amber-600 font-semibold">
                Pro Tip
              </span>
              <p className="text-[13px] text-[#374151] leading-relaxed mt-1">
                {w.proTip}
              </p>
            </div>
          </Popover>
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
        <div className="py-5">
          <Link
            href="/vocabulary"
            className="text-text-2 hover:text-text text-[13px] transition-colors w-fit"
          >
            ← Vocabulary
          </Link>
          <div className="flex items-baseline gap-3 mt-2">
            <h1 className="text-2xl font-bold text-[#111827]">
              {category.title}
            </h1>
            <span className="text-[13px] font-medium text-[#9CA3AF] italic">
              {CATEGORY_PT_TITLE[category.id] ?? ""}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#9CA3AF]">{category.words.length} words</p>
        </div>

        {/* Filters + search */}
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5">
            {["All", "A1", "A2", "B1"].map((l) => (
              <button
                key={l}
                onClick={() => setCefrFilter(l)}
                className={
                  cefrFilter === l
                    ? "px-3 py-1.5 rounded-full text-sm font-medium border border-[#111827] bg-[#111827] text-white cursor-pointer"
                    : "px-3 py-1.5 rounded-full text-sm font-medium border border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#111827] transition-colors cursor-pointer bg-white"
                }
              >
                {l}
              </button>
            ))}
          </div>
          <div className="w-full sm:w-auto sm:ml-auto">
            <input
              type="text"
              placeholder="Search words..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-[240px] px-3 py-1.5 rounded-full text-sm border border-[#E5E7EB] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#D1D5DB] transition-colors bg-white"
            />
          </div>
        </div>
        <div className="border-t border-[#F3F4F6] mt-4 mb-6" />

        {/* Word cards — responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {filtered.length === 0 ? (
            <p className="col-span-full text-center py-12 text-text-secondary text-[13px]">
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
