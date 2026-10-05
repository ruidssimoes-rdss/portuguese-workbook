import { PageShell } from "@/components/layout/page-shell";
import { PageHeader } from "@/components/primitives";
import { CategoryBrowser, type CategoryCard } from "@/components/vocabulary/category-browser";
import vocabData from "@/data/vocab.json";

export default function VocabularyPage() {
  const categories: CategoryCard[] = vocabData.categories.map((cat) => {
    const cefrCounts: Record<string, number> = {};
    for (const w of cat.words) cefrCounts[w.cefr] = (cefrCounts[w.cefr] || 0) + 1;
    return {
      id: cat.id,
      title: cat.title,
      description: cat.description,
      cefrCounts,
      words: cat.words.map((w) => ({ portuguese: w.portuguese, english: w.english, cefr: w.cefr })),
    };
  });
  const totalWords = categories.reduce((s, c) => s + c.words.length, 0);

  return (
    <PageShell>
      <PageHeader
        title="Vocabulário"
        subtitle={`${totalWords} words across ${categories.length} categories`}
      />
      <CategoryBrowser categories={categories} />
    </PageShell>
  );
}
