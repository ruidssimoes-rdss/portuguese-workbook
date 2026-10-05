import { notFound } from "next/navigation";
import { WordPanel } from "@/components/vocabulary/word-panel";
import { getCategory, getWord, lessonsTeaching } from "@/lib/library";
import { previewSession } from "@/lib/shell/session-preview";
import { getLearner, wordState } from "@/lib/shell/learner";
import { attemptsFor, confusionsFor, loadWrongItems } from "@/lib/shell/attempts";

export default async function WordPanelSlot({ params }: { params: Promise<{ category: string; word: string }> }) {
  const { category, word: slug } = await params;
  const word = getWord(category, slug);
  if (!word) notFound();

  const learner = await getLearner();
  const record = learner?.byKey.get(`vocab:${word.portuguese}`) ?? null;
  const session = previewSession(learner, { category: word.categoryId });
  const items = learner ? await loadWrongItems(learner.supabase, learner.user.id) : [];

  return (
    <WordPanel
      word={word}
      state={wordState(learner, word)}
      record={record}
      practiceHref={session.total > 0 ? session.startHref : "/learn"}
      attempts={attemptsFor(items, word)}
      confusions={confusionsFor(items, word)}
      lessons={lessonsTeaching(word)}
      categoryCount={getCategory(word.categoryId)?.words.length ?? 0}
    />
  );
}
