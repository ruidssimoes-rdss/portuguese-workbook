import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/primitives";
import { WordBrowser, type Word, type WordGroup } from "@/components/vocabulary/word-browser";
import vocabData from "@/data/vocab.json";
import { getWordGroups } from "@/data/vocab-groups";

export function generateStaticParams() {
  return vocabData.categories.map((c) => ({ category: c.id }));
}

function toWord(w: (typeof vocabData.categories)[number]["words"][number]): Word {
  return {
    portuguese: w.portuguese,
    english: w.english,
    cefr: w.cefr,
    gender: w.gender || null,
    pronunciation: "pronunciation" in w ? (w.pronunciation ?? "") : "",
  };
}

export default async function VocabularyDetailPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = vocabData.categories.find((c) => c.id === slug);

  if (!category) {
    return (
      <PageShell>
        <PageHeader title="Category not found" subtitle="This vocabulary category doesn't exist." />
      </PageShell>
    );
  }

  const words = category.words.map(toWord);
  const rawGroups = getWordGroups(slug, category.words);
  const groups: WordGroup[] | null = rawGroups
    ? rawGroups.map((g) => ({ label: g.label, labelPt: g.labelPt, words: g.words.map(toWord) }))
    : null;

  return (
    <PageShell>
      <div className="text-[12px] text-[#9B9DA3] mb-5 flex items-center gap-1">
        <Link href="/vocabulary" className="hover:text-[#6C6B71] transition-colors">
          Vocabulary
        </Link>
        <ChevronRight size={12} />
        <span className="text-[#6C6B71]">{category.title}</span>
      </div>

      <PageHeader
        title={category.title}
        subtitle={`${category.words.length} words — ${category.description}`}
      />

      <Suspense fallback={null}>
        <WordBrowser words={words} groups={groups} storageKey="vocab-view" />
      </Suspense>
    </PageShell>
  );
}
