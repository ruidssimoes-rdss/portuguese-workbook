import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WordNote } from "@/components/vocabulary/word-note";
import { europeanNote, getWord } from "@/lib/library";
import { getLearner, wordState } from "@/lib/shell/learner";

type Params = Promise<{ category: string; word: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category, word: slug } = await params;
  const word = getWord(category, slug);
  return { title: word ? `${word.title} — Aula` : "Aula" };
}

export default async function WordPage({ params }: { params: Params }) {
  const { category, word: slug } = await params;
  const word = getWord(category, slug);
  if (!word) notFound();

  const learner = await getLearner();
  const record = learner?.byKey.get(`vocab:${word.portuguese}`);

  return (
    <WordNote
      word={word}
      state={wordState(learner, word)}
      nextReviewAt={record?.next_review_at ?? null}
      europeanNote={europeanNote(word)}
    />
  );
}
