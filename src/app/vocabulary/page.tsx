"use client";

import { useMemo, useState } from "react";
import vocabData from "@/data/vocab.json";
import type { VocabData, VocabCategory } from "@/types/vocab";
import { PageLayout, IntroBlock, FilterBlock, ContentGrid } from "@/components/blocos";
import { SmartBloco } from "@/components/smart-bloco";
import { BlocoGrid } from "@/components/smart-bloco/bloco-grid";

const data = vocabData as unknown as VocabData;

const CEFR_LEVELS = ["All", "A1", "A2", "B1"] as const;
type CefrFilter = (typeof CEFR_LEVELS)[number];

const CATEGORY_ORDER = [
  "greetings-expressions", "numbers-time", "colours-weather", "food-drink",
  "home-rooms", "family-daily-routine", "shopping-money", "travel-directions",
  "work-education", "health-body", "nature-animals", "emotions-personality",
  "colloquial-slang", "technology-internet", "clothing-appearance",
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
  "greetings-expressions": "Olá, bom dia, obrigado — essential phrases for every interaction.",
  "numbers-time": "Um, dois, três — counting, telling time, and days of the week.",
  "colours-weather": "Azul, vermelho, sol, chuva — describe colours and the weather.",
  "food-drink": "Café, pão, água — restaurants, groceries, and cooking.",
  "home-rooms": "Cozinha, quarto, sala — rooms, furniture, and household items.",
  "family-daily-routine": "Mãe, pai, irmão — family, relationships, and everyday routines.",
  "shopping-money": "Preço, troco, recibo — shops, payments, and transactions.",
  "travel-directions": "Esquerda, direita, hotel — transport, navigation, and getting around.",
  "work-education": "Escritório, escola, reunião — professions, workplace, and studies.",
  "health-body": "Cabeça, médico, farmácia — body parts, symptoms, and healthcare.",
  "nature-animals": "Árvore, cão, praia — animals, plants, and the natural world.",
  "emotions-personality": "Feliz, triste, simpático — feelings, moods, and character traits.",
  "colloquial-slang": "Fixe, giro, bué — informal expressions and everyday slang.",
  "technology-internet": "Telemóvel, ecrã, palavra-passe — devices, apps, and digital life.",
  "clothing-appearance": "Camisa, sapatos, vestido — clothing, style, and describing how people look.",
};

function categoryLevelCount(cat: VocabCategory, level: "A1" | "A2" | "B1") {
  return cat.words.filter((w) => w.cefr === level).length;
}

const totalWords = data.categories.reduce((s, c) => s + c.words.length, 0);

export default function VocabularyPage() {
  const [cefrFilter, setCefrFilter] = useState<CefrFilter>("All");
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    let cats = CATEGORY_ORDER
      .map((id) => data.categories.find((c) => c.id === id))
      .filter((c): c is VocabCategory => c != null);

    if (cefrFilter !== "All") {
      cats = cats.filter((c) => categoryLevelCount(c, cefrFilter as "A1" | "A2" | "B1") > 0);
    }
    if (q) {
      cats = cats.filter((c) => {
        const ptTitle = (CATEGORY_PT_TITLE[c.id] ?? "").toLowerCase();
        const desc = (CATEGORY_DESCRIPTION[c.id] ?? c.description).toLowerCase();
        return c.title.toLowerCase().includes(q) || ptTitle.includes(q) || desc.includes(q) ||
          c.words.some((w) => w.portuguese.toLowerCase().includes(q) || w.english.toLowerCase().includes(q));
      });
    }
    return cats;
  }, [cefrFilter, search]);

  return (
    <PageLayout>
      <IntroBlock
        title="Vocabulary"
        subtitle="Vocabulário"
        description="Browse European Portuguese words organized by category and CEFR level."
        pills={[
          { label: `${totalWords} words` },
          { label: `${data.categories.length} categories` },
        ]}
      />
      <FilterBlock
        pills={{
          options: CEFR_LEVELS.map((l) => ({ label: l, value: l })),
          value: cefrFilter,
          onChange: (v) => setCefrFilter(v as CefrFilter),
        }}
        search={{ value: search, onChange: setSearch, placeholder: "Search categories..." }}
        count={{ showing: filteredCategories.length, total: data.categories.length }}
      />
      <BlocoGrid>
        {filteredCategories.map((cat) => {
          const wordCount = cefrFilter === "All" ? cat.words.length : categoryLevelCount(cat, cefrFilter as "A1" | "A2" | "B1");
          return (
            <SmartBloco
              key={cat.id}
              title={cat.title}
              subtitle={CATEGORY_PT_TITLE[cat.id]}
              description={CATEGORY_DESCRIPTION[cat.id] ?? cat.description}
              footer={{ wordCount }}
              href={`/vocabulary/${cat.id}`}
            />
          );
        })}
        {filteredCategories.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-[14px] text-[#9CA3AF]">No categories match your filter.</p>
          </div>
        )}
      </BlocoGrid>
    </PageLayout>
  );
}
