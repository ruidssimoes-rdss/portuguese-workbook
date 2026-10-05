import { notFound } from "next/navigation";
import { SessionPanel } from "@/components/vocabulary/session-panel";
import { getCategory } from "@/lib/library";
import { getLearner } from "@/lib/shell/learner";
import { previewSession } from "@/lib/shell/session-preview";

export default async function CategoryPanel({ params }: { params: Promise<{ category: string }> }) {
  const { category: id } = await params;
  const category = getCategory(id);
  if (!category) notFound();
  const learner = await getLearner();
  return <SessionPanel title={category.title} session={previewSession(learner, { category: category.id })} />;
}
