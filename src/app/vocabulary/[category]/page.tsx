"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import vocabData from "@/data/vocab.json";
import type { VocabData, VocabWord } from "@/types/vocab";
import { PageLayout, IntroBlock, FilterBlock, ContentGrid, SmartBlock } from "@/components/blocos";
import type { SmartBlockBadge } from "@/components/blocos";

const data = vocabData as unknown as VocabData;

const CEFR_LEVELS = ["All", "A1", "A2", "B1"] as const;

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

function cefrColor(level: string): SmartBlockBadge["color"] {
  if (level === "A1") return "emerald";
  if (level === "A2") return "blue";
  return "amber";
}

export default function VocabCategoryPage() {
  const params = useParams();
  const slug = params.category as string;
  const category = data.categories.find((c) => c.id === slug);

  const [cefrFilter, setCefrFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!category) return [];
    const q = search.toLowerCase();
    return category.words.filter((w: VocabWord) => {
      if (cefrFilter !== "All" && w.cefr !== cefrFilter) return false;
      if (q && !w.portuguese.toLowerCase().includes(q) && !w.english.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [category, cefrFilter, search]);

  if (!category) {
    return (
      <PageLayout>
        <IntroBlock title="Category not found" backLink={{ label: "Vocabulary", href: "/vocabulary" }} />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <IntroBlock
        title={category.title}
        subtitle={CATEGORY_PT_TITLE[category.id]}
        backLink={{ label: "Vocabulary", href: "/vocabulary" }}
        pills={[{ label: `${category.words.length} words` }]}
      />
      <FilterBlock
        pills={{
          options: CEFR_LEVELS.map((l) => ({ label: l, value: l })),
          value: cefrFilter,
          onChange: setCefrFilter,
        }}
        search={{ value: search, onChange: setSearch, placeholder: "Search words..." }}
        count={{ showing: filtered.length, total: category.words.length }}
      />
      <ContentGrid>
        {filtered.map((w: VocabWord, i: number) => (
          <SmartBlock
            key={`${w.portuguese}-${i}`}
            title={w.portuguese}
            subtitle={w.english}
            pronunciation={w.pronunciation ? `/${w.pronunciation}/` : undefined}
            pronunciationButton
            pronunciationText={w.portuguese}
            badges={[
              { label: w.cefr, color: cefrColor(w.cefr) },
              ...(w.gender ? [{ label: w.gender, color: "neutral" as const }] : []),
            ]}
            example={w.example ? { pt: w.example, en: w.exampleTranslation || "" } : undefined}
            highlightId={w.portuguese}
          />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16">
            <p className="text-[14px] text-[#9CA3AF]">No words match your filter.</p>
          </div>
        )}
      </ContentGrid>
    </PageLayout>
  );
}
