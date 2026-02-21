"use client";

import { useMemo, useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import vocabData from "@/data/vocab.json";
import type { VocabData, VocabCategory } from "@/types/vocab";
import Link from "next/link";

const data = vocabData as unknown as VocabData;

const CEFR_LEVELS = ["All", "A1", "A2", "B1"] as const;
type CefrFilter = (typeof CEFR_LEVELS)[number];

const SECTIONS: {
  label: string;
  ptName: string;
  description: string;
  categoryIds: string[];
}[] = [
  {
    label: "Essentials",
    ptName: "O Essencial",
    description:
      "The building blocks of everyday Portuguese. Start here to greet people, count, tell the time, and describe the world around you.",
    categoryIds: ["greetings-expressions", "numbers-time", "colours-weather"],
  },
  {
    label: "Daily Life",
    ptName: "Vida Quotidiana",
    description:
      "Words you need to navigate daily life in Portugal — from ordering food and shopping to talking about your home and family.",
    categoryIds: [
      "food-drink",
      "home-rooms",
      "family-daily-routine",
      "shopping-money",
    ],
  },
  {
    label: "World & Self",
    ptName: "O Mundo e Eu",
    description:
      "Broaden your vocabulary beyond the basics. Talk about travel, work, health, nature, and how you feel.",
    categoryIds: [
      "travel-directions",
      "work-education",
      "health-body",
      "nature-animals",
      "emotions-personality",
      "colloquial-slang",
    ],
  },
];

const CATEGORY_TINT: Record<string, string> = {
  "greetings-expressions": "bg-sky-50",
  "numbers-time": "bg-blue-50",
  "colours-weather": "bg-cyan-50",
  "food-drink": "bg-slate-50",
  "travel-directions": "bg-sky-50/70",
  "home-rooms": "bg-blue-50/70",
  "family-daily-routine": "bg-cyan-50/70",
  "work-education": "bg-slate-50/70",
  "health-body": "bg-sky-50/50",
  "shopping-money": "bg-blue-50/50",
  "nature-animals": "bg-cyan-50/50",
  "emotions-personality": "bg-slate-50/50",
  "colloquial-slang": "bg-teal-50",
};

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
};

const CATEGORY_DESCRIPTION: Record<string, string> = {
  "greetings-expressions":
    "Olá, bom dia, obrigado — essential phrases for every interaction.",
  "numbers-time":
    "Um, dois, três — counting, telling time, and days of the week.",
  "colours-weather":
    "Azul, vermelho, sol, chuva — describe colours and the weather.",
  "food-drink":
    "Café, pão, água — restaurants, groceries, and cooking.",
  "home-rooms":
    "Cozinha, quarto, sala — rooms, furniture, and household items.",
  "family-daily-routine":
    "Mãe, pai, irmão — family, relationships, and everyday routines.",
  "shopping-money":
    "Preço, troco, recibo — shops, payments, and transactions.",
  "travel-directions":
    "Esquerda, direita, hotel — transport, navigation, and getting around.",
  "work-education":
    "Escritório, escola, reunião — professions, workplace, and studies.",
  "health-body":
    "Cabeça, médico, farmácia — body parts, symptoms, and healthcare.",
  "nature-animals":
    "Árvore, cão, praia — animals, plants, and the natural world.",
  "emotions-personality":
    "Feliz, triste, simpático — feelings, moods, and character traits.",
  "colloquial-slang":
    "Fixe, giro, bué — informal expressions and everyday slang.",
};

function countByLevel(categories: VocabCategory[]) {
  const a1 = categories.reduce(
    (s, c) => s + c.words.filter((w) => w.cefr === "A1").length,
    0
  );
  const a2 = categories.reduce(
    (s, c) => s + c.words.filter((w) => w.cefr === "A2").length,
    0
  );
  const b1 = categories.reduce(
    (s, c) => s + c.words.filter((w) => w.cefr === "B1").length,
    0
  );
  return { a1, a2, b1, total: a1 + a2 + b1 };
}

function categoryLevelCount(cat: VocabCategory, level: Exclude<CefrFilter, "All">) {
  return cat.words.filter((w) => w.cefr === level).length;
}

function categoryMatchesSearch(cat: VocabCategory, q: string): number {
  if (!q.trim()) return -1;
  const lower = q.toLowerCase();
  const ptTitle = CATEGORY_PT_TITLE[cat.id] ?? "";
  const desc = CATEGORY_DESCRIPTION[cat.id] ?? cat.description;
  if (
    cat.title.toLowerCase().includes(lower) ||
    ptTitle.toLowerCase().includes(lower) ||
    desc.toLowerCase().includes(lower)
  )
    return -1;
  const inWords = cat.words.filter(
    (w) =>
      w.portuguese.toLowerCase().includes(lower) ||
      w.english.toLowerCase().includes(lower)
  ).length;
  return inWords > 0 ? inWords : -1;
}

export default function VocabularyPage() {
  const [cefrFilter, setCefrFilter] = useState<CefrFilter>("All");
  const [search, setSearch] = useState("");

  const levelCounts = useMemo(() => countByLevel(data.categories), []);

  const categoriesBySection = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SECTIONS.map((section) => {
      let cats = data.categories.filter((c) =>
        section.categoryIds.includes(c.id)
      );

      if (cefrFilter !== "All") {
        cats = cats.filter(
          (c) => categoryLevelCount(c, cefrFilter as "A1" | "A2" | "B1") > 0
        );
      }

      if (q) {
        cats = cats.filter((c) => {
          const ptTitle = (CATEGORY_PT_TITLE[c.id] ?? "").toLowerCase();
          const desc = (CATEGORY_DESCRIPTION[c.id] ?? c.description).toLowerCase();
          const titleOrDesc =
            c.title.toLowerCase().includes(q) ||
            ptTitle.includes(q) ||
            desc.includes(q);
          const wordMatches = categoryMatchesSearch(c, search);
          return titleOrDesc || wordMatches > 0;
        });
      }

      return { ...section, categories: cats };
    }).filter((s) => s.categories.length > 0);
  }, [cefrFilter, search]);

  const displayTotalWords =
    cefrFilter === "All"
      ? levelCounts.total
      : levelCounts[cefrFilter.toLowerCase() as "a1" | "a2" | "b1"];
  const displayCategoryCount = categoriesBySection.reduce(
    (s, sec) => s + sec.categories.length,
    0
  );

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
              Vocabulary
            </h1>
            <div className="w-px h-[18px] bg-[#9AA2AD] self-center" />
            <span className="text-[16px] font-medium text-[rgba(71,85,105,0.5)]">
              Vocabulário
            </span>
          </div>
          <p className="text-[11px] text-[#9AA2AD]">
            {displayTotalWords.toLocaleString()} words · {displayCategoryCount} categories · A1–B1
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
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-[36px] w-full md:w-[200px] px-3 text-[11px] text-[#475569] placeholder:text-[rgba(71,85,105,0.5)] border border-[rgba(71,85,105,0.25)] rounded-[12px] bg-white focus:outline-none focus:border-[#3C5E95] focus:ring-1 focus:ring-[#3C5E95] transition-colors duration-200"
            />
          </div>
        </div>

        <div className="pb-16">
          {categoriesBySection.map((section, sectionIndex) => (
            <div key={section.label}>
              <div
                className={`${sectionIndex === 0 ? "" : "mt-8"}`}
              >
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                  {section.label}
                  <span className="text-[11px] font-normal normal-case tracking-normal text-[#3C5E95]/60">
                    {" · "}
                    {section.ptName}
                  </span>
                </h2>
                <p className="text-[13px] text-text-muted mt-1 mb-4 max-w-2xl">
                  {section.description}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {section.categories.map((cat) => {
                  const wordCount =
                    cefrFilter === "All"
                      ? cat.words.length
                      : categoryLevelCount(
                          cat,
                          cefrFilter as "A1" | "A2" | "B1"
                        );
                  const matchCount = search.trim()
                    ? categoryMatchesSearch(cat, search)
                    : -1;
                  const showMatchNote =
                    matchCount > 0 &&
                    !cat.title.toLowerCase().includes(search.trim().toLowerCase()) &&
                    !cat.description
                      .toLowerCase()
                      .includes(search.trim().toLowerCase());

                  const cardDesc = CATEGORY_DESCRIPTION[cat.id] ?? cat.description;

                  return (
                    <Link
                      key={cat.id}
                      href={`/vocabulary/${cat.id}`}
                      className="bg-white border border-[#E5E5E5] rounded-[14px] overflow-hidden block transition-all duration-200 hover:border-[#D0D0D0] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3 className="text-[18px] font-bold text-text">
                            {cat.title}
                          </h3>
                          <span className="text-[12px] text-text-muted whitespace-nowrap">
                            {wordCount} word{wordCount !== 1 ? "s" : ""}
                            {showMatchNote && ` · ${matchCount} match${matchCount !== 1 ? "es" : ""}`}
                          </span>
                        </div>
                        <span className="text-[13px] text-[#3C5E95] font-medium">
                          {CATEGORY_PT_TITLE[cat.id] ?? ""}
                        </span>
                        <p className="text-[13px] text-text-muted mt-3 leading-relaxed italic">
                          {cardDesc}
                        </p>
                        <span className="inline-flex items-center justify-center self-start px-[13px] h-8 bg-[#262626] border border-[#262626] rounded-[10px] text-[12.5px] font-medium text-[#FAFAFA] shadow-[0_1px_2px_rgba(38,38,38,0.24),inset_0_1px_0_1px_rgba(255,255,255,0.16)] hover:bg-[#404040] transition-colors duration-200 mt-4">
                          Explore →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {categoriesBySection.length === 0 && (
            <p className="text-[13px] text-text-secondary py-8">
              No categories match your filter.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
