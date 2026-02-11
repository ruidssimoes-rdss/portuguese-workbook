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

  return (
    <>
      <Topbar />
      <main className="max-w-[1100px] mx-auto px-4 md:px-6 lg:px-10">
        <section className="py-12 md:py-16">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-[36px] font-bold tracking-tight text-gray-900">
                Vocabulary
              </h1>
              <p className="text-lg text-[#3C5E95]/70 font-medium -mt-1">
                Vocabulário
              </p>
              <p className="text-[14px] text-gray-500 mt-1">
                {displayTotalWords.toLocaleString()} words · {displayCategoryCount} categories · A1–B1
              </p>
              <div className="flex gap-6 text-sm text-gray-400 mt-2">
                <span>
                  A1: <span className="font-medium text-gray-600">{levelCounts.a1} words</span>
                </span>
                <span>
                  A2: <span className="font-medium text-gray-600">{levelCounts.a2} words</span>
                </span>
                <span>
                  B1: <span className="font-medium text-gray-600">{levelCounts.b1} words</span>
                </span>
              </div>
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] bg-white text-gray-900 outline-none focus:border-[#3C5E95]/50 w-[200px] transition-colors"
            />
          </div>
        </section>

        <div className="flex items-center gap-2 flex-wrap pb-6 border-t border-gray-200 pt-5">
          {CEFR_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setCefrFilter(level)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                cefrFilter === level
                  ? "bg-[#3C5E95] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="pb-16">
          {categoriesBySection.map((section, sectionIndex) => (
            <div key={section.label}>
              <div
                className={`${sectionIndex === 0 ? "" : "mt-8"}`}
              >
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {section.label}
                  <span className="text-xs font-normal normal-case tracking-normal text-[#3C5E95]/60">
                    {" · "}
                    {section.ptName}
                  </span>
                </h2>
                <p className="text-sm text-gray-500 mt-1 mb-4 max-w-2xl">
                  {section.description}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  const descParts = cardDesc.includes(" — ")
                    ? cardDesc.split(" — ", 2)
                    : [null, cardDesc];
                  const ptIntro = descParts[0];
                  const descRest = descParts[1] ?? cardDesc;

                  return (
                    <Link
                      key={cat.id}
                      href={`/vocabulary/${cat.id}`}
                      className={`group ${CATEGORY_TINT[cat.id] ?? "bg-white"} border border-gray-200 rounded-lg p-4 md:p-5 hover:border-[#3C5E95]/30 hover:shadow-sm transition-all duration-200`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold text-gray-900 flex-1 min-w-0">
                          {cat.title}
                        </h3>
                        <span className="text-sm text-gray-400 whitespace-nowrap">
                          {wordCount} word{wordCount !== 1 ? "s" : ""}
                          {showMatchNote && ` · ${matchCount} match${matchCount !== 1 ? "es" : ""}`}
                        </span>
                      </div>
                      <p className="text-sm text-[#3C5E95]/70 font-medium mt-0.5">
                        {CATEGORY_PT_TITLE[cat.id] ?? ""}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {ptIntro != null ? (
                          <>
                            <em>{ptIntro}</em>
                            {" — "}
                            {descRest}
                          </>
                        ) : (
                          cardDesc
                        )}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {categoriesBySection.length === 0 && (
            <p className="text-sm text-gray-500 py-8">
              No categories match your filter.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
