import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FolderIndex, sortForIndex } from "@/components/vocabulary/folder-index";
import { formatCount } from "@/lib/format";
import { getCategory } from "@/lib/library";
import { getLearner, wordState } from "@/lib/shell/learner";

type Params = Promise<{ category: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category } = await params;
  return { title: `${getCategory(category)?.title ?? "Vocabulário"} — Aula` };
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { category: id } = await params;
  const category = getCategory(id);
  if (!category) notFound();

  const learner = await getLearner();
  const now = new Date();
  const rows = sortForIndex(category.words.map((word) => ({ word, state: wordState(learner, word, now) })));
  const overdue = rows.filter((r) => r.state.state === "overdue").length;
  const due = rows.filter((r) => r.state.due).length;

  const summary = [
    `${formatCount(category.words.length)} palavras`,
    due > 0 ? `${formatCount(due)} devidas` : null,
    overdue > 0 ? `${formatCount(overdue)} em atraso` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return <FolderIndex title={category.title} summary={summary} rows={rows} emptyText="Esta categoria está vazia." />;
}
