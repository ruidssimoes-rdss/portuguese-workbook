"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageHeader,
  FilterBar,
  ListContainer,
  ListRow,
  BadgePill,
  CountLabel,
} from "@/components/primitives";

import vocabData from "@/data/vocab.json";

// ─── Constants ──────────────────────────────────────────────────────────────

const cefrOptions = ["All", "A1", "A2", "B1"];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function VocabularyDetailPage() {
  const params = useParams();
  const slug = params.category as string;
  const category = vocabData.categories.find((c) => c.id === slug);

  const [cefr, setCefr] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!category) return [];
    return category.words.filter((word) => {
      if (cefr !== "All" && word.cefr !== cefr) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          word.portuguese.toLowerCase().includes(q) ||
          word.english.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [category, cefr, search]);

  if (!category) {
    return (
      <PageShell>
        <PageHeader
          title="Category not found"
          subtitle="This vocabulary category doesn't exist."
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Breadcrumb */}
      <div className="text-[12px] text-[#9B9DA3] mb-5 flex items-center gap-1">
        <Link
          href="/vocabulary"
          className="hover:text-[#6C6B71] transition-colors"
        >
          Vocabulary
        </Link>
        <ChevronRight size={12} />
        <span className="text-[#6C6B71]">{category.title}</span>
      </div>

      <PageHeader
        title={category.title}
        subtitle={`${category.words.length} words — ${category.description}`}
      />

      <FilterBar
        filterOptions={cefrOptions}
        filterValue={cefr}
        onFilterChange={setCefr}
        searchPlaceholder="Search words..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <ListContainer>
        {filtered.map((word) => (
          <ListRow key={word.portuguese}>
            <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-3">
              <div>
                <span className="text-[14px] font-medium text-[#111111]">
                  {word.portuguese}
                </span>
                {word.gender && (
                  <span className="text-[11px] text-[#9B9DA3] ml-1.5 italic">
                    ({word.gender})
                  </span>
                )}
              </div>
              <span className="text-[13px] text-[#6C6B71]">
                {word.english}
              </span>
              <BadgePill level={word.cefr} />
            </div>
          </ListRow>
        ))}
      </ListContainer>

      <CountLabel
        showing={filtered.length}
        total={category.words.length}
        noun="words"
      />
    </PageShell>
  );
}
