"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { PageContainer } from "@/components/ui/page-container";
import { FilterPill } from "@/components/ui/filter-pill";
import { SearchInput } from "@/components/ui/search-input";
import { Divider } from "@/components/ui/divider";
import { EmptyState } from "@/components/ui/empty-state";
import { StudyLogButton } from "@/components/study-log-button";
import { NoteContextActions } from "@/components/notes/note-context-actions";
import { ContentCalendarInfo } from "@/components/calendar/content-calendar-info";
import vocabData from "@/data/vocab.json";
import type { VocabData, VocabWord } from "@/types/vocab";
import { SmartVocabBlock } from "@/components/blocks/content/smart-vocab-block";

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
        <PageContainer className="py-16">
          <p className="text-[#6B7280]">Category not found.</p>
          <Link href="/vocabulary" className="text-[#6B7280] underline mt-2 block">← Back to vocabulary</Link>
        </PageContainer>
      </>
    );
  }

  const q = search.toLowerCase();
  const filtered = category.words.filter((w: VocabWord) => {
    if (cefrFilter !== "All" && w.cefr !== cefrFilter) return false;
    if (q && !w.portuguese.toLowerCase().includes(q) && !w.english.toLowerCase().includes(q)) return false;
    return true;
  });

  useEffect(() => {
    if (!highlightWord || !category) return;
    const decoded = decodeURIComponent(highlightWord);
    const match = category.words.some((w: VocabWord) =>
      w.portuguese === decoded || w.portuguese.startsWith(decoded + " ") || w.portuguese.includes(" " + decoded)
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
      <PageContainer>
        <div className="py-5">
          <Link href="/vocabulary" className="text-[#6B7280] hover:text-[#111827] text-[13px] transition-all duration-150 ease-out w-fit">← Vocabulary</Link>
          <div className="flex items-baseline justify-between gap-4 mt-2 flex-wrap">
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl font-bold text-[#111827]">{category.title}</h1>
              <span className="text-[13px] font-medium text-[#9CA3AF] italic">{CATEGORY_PT_TITLE[category.id] ?? ""}</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap shrink-0">
              <NoteContextActions contextType="vocabulary" contextId={category.id} contextLabel={category.title} />
              <ContentCalendarInfo contentType="vocabulary" contentId={category.id} />
              <StudyLogButton contextTitle={category.title} contextType="Vocabulary" />
            </div>
          </div>
          <p className="mt-1 text-sm text-[#9CA3AF]">{category.words.length} words</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5">
            {["All", "A1", "A2", "B1"].map((l) => (
              <FilterPill key={l} active={cefrFilter === l} onClick={() => setCefrFilter(l)}>{l}</FilterPill>
            ))}
          </div>
          <div className="w-full sm:w-auto sm:ml-auto">
            <SearchInput value={search} onChange={setSearch} placeholder="Search words..." />
          </div>
        </div>
        <Divider className="mt-4 mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {filtered.length === 0 ? (
            <EmptyState message="No words match your filter." className="col-span-full text-center" />
          ) : (
            filtered.map((w: VocabWord, i: number) => {
              const isHL = !!(highlightWord && w.portuguese === decodeURIComponent(highlightWord));
              return (
                <div key={i} ref={isHL ? highlightedRef : undefined}>
                  <SmartVocabBlock
                    data={{
                      id: `word-${slug}-${i}`,
                      word: w.portuguese,
                      translation: w.english,
                      pronunciation: w.pronunciation || "",
                      gender: w.gender || null,
                      cefr: w.cefr,
                      category: slug,
                      example: w.example ? { pt: w.example, en: w.exampleTranslation || "" } : null,
                      relatedWords: w.relatedWords,
                      tip: w.proTip,
                    }}
                    variant="card"
                    isHighlighted={isHL && flashHighlight}
                  />
                </div>
              );
            })
          )}
        </div>
      </PageContainer>
    </>
  );
}
