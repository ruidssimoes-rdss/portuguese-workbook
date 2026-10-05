import type { Metadata } from "next";
import { FolderIndex } from "@/components/vocabulary/folder-index";
import { formatCount } from "@/lib/format";
import { dueWords, getLearner } from "@/lib/shell/learner";

export const metadata: Metadata = { title: "A rever — Aula" };

export default async function ReviewFolderPage() {
  const learner = await getLearner();
  const rows = learner ? dueWords(learner).map(({ word, state }) => ({ word, state })) : [];
  const overdue = rows.filter((r) => r.state.state === "overdue").length;

  const summary = [
    `${formatCount(rows.length)} ${rows.length === 1 ? "palavra devida" : "palavras devidas"}`,
    overdue > 0 ? `${formatCount(overdue)} em atraso` : null,
    rows.length > 1 ? "ordenadas por atraso" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <FolderIndex
      title="A rever"
      summary={summary}
      rows={rows}
      emptyText="Nenhuma palavra devida. As palavras aparecem aqui quando chega a hora de as rever."
    />
  );
}
