"use client";

import { useMemo, useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import vocabData from "@/data/vocab.json";
import type { VocabData, VocabCategory } from "@/types/vocab";
import Link from "next/link";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { FilterPill } from "@/components/ui/filter-pill";
import { SearchInput } from "@/components/ui/search-input";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { EmptyState } from "@/components/ui/empty-state";

const data = vocabData as unknown as VocabData;

const CEFR_LEVELS = ["All", "A1", "A2", "B1"] as const;
type CefrFilter = (typeof CEFR_LEVELS)[number];

/** Flat ordering: Essentials → Daily Life → World & Self */
const CATEGORY_ORDER = [
  "greetings-expressions",
  "numbers-time",
  "colours-weather",
  "food-drink",
  "home-rooms",
  "family-daily-routine",
  "shopping-money",
  "travel-directions",
  "work-education",
  "health-body",
  "nature-animals",
  "emotions-personality",
  "colloquial-slang",
  "technology-internet",
  "clothing-appearance",
];

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
  "technology-internet":
    "Telemóvel, ecrã, palavra-passe — devices, apps, and digital life.",
  "clothing-appearance":
    "Camisa, sapatos, vestido — clothing, style, and describing how people look.",
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

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();

    // Get all categories in the defined order
    let cats = CATEGORY_ORDER
      .map((id) => data.categories.find((c) => c.id === id))
      .filter((c): c is VocabCategory => c != null);

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

    return cats;
  }, [cefrFilter, search]);

  const displayTotalWords =
    cefrFilter === "All"
      ? levelCounts.total
      : levelCounts[cefrFilter.toLowerCase() as "a1" | "a2" | "b1"];

  return (
    <>
      <Topbar />
      <PageContainer>
        <div className="py-5">
          <PageHeader
            title="Vocabulary"
            titlePt="Vocabulário"
            subtitle={<>{displayTotalWords.toLocaleString()} words · {filteredCategories.length} categories · A1–B1</>}
          />
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <div className="flex items-center gap-1.5">
              {CEFR_LEVELS.map((level) => (
                <FilterPill
                  key={level}
                  active={cefrFilter === level}
                  onClick={() => setCefrFilter(level)}
                >
                  {level}
                </FilterPill>
              ))}
            </div>
            <div className="w-full sm:w-auto sm:ml-auto">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search categories..."
              />
            </div>
          </div>
          <Divider className="mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
          {filteredCategories.map((cat) => {
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
                className="block group"
              >
                <Card interactive className="h-full">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="text-[15px] font-semibold text-text">
                      {cat.title}
                    </h3>
                    <span className="text-[12px] text-text-muted whitespace-nowrap">
                      {wordCount} word{wordCount !== 1 ? "s" : ""}
                      {showMatchNote && ` · ${matchCount} match${matchCount !== 1 ? "es" : ""}`}
                    </span>
                  </div>
                  <span className="text-[13px] text-[#6B7280] font-medium">
                    {CATEGORY_PT_TITLE[cat.id] ?? ""}
                  </span>
                  <p className="text-[13px] text-text-muted mt-3 leading-relaxed italic">
                    {cardDesc}
                  </p>
                </Card>
              </Link>
            );
          })}

          {filteredCategories.length === 0 && (
            <EmptyState message="No categories match your filter." className="col-span-full" />
          )}
        </div>
      </PageContainer>
    </>
  );
}
