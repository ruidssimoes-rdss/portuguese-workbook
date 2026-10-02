"use client";

/**
 * Lesson intro: what's in this lesson, how long it takes, how you pass.
 */

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import type { GeneratedLesson } from "@/lib/exercise-generator";
import { LevelTag } from "@/components/aula";

interface LearnIntroProps {
  lessonTitle: string;
  lessonTitlePt: string;
  cefr: string;
  isReview: boolean;
  generated: GeneratedLesson;
  onStartExercises: () => void;
  onReviewFirst: () => void;
}

export function LearnIntro({ cefr, isReview, generated, onStartExercises, onReviewFirst }: LearnIntroProps) {
  const learnItems = generated.learnItems ?? [];
  const count = (t: string) => learnItems.filter((i) => i.type === t).length;
  const news = [
    { n: count("vocab"), one: "palavra nova", many: "palavras novas" },
    { n: count("verb"), one: "verbo", many: "verbos" },
    { n: count("grammar"), one: "regra", many: "regras" },
    { n: count("culture"), one: "nota de cultura", many: "notas de cultura" },
  ].filter((x) => x.n > 0);
  const questions = generated.sections.reduce((n, s) => n + s.totalQuestions, 0);
  const minutes = Math.max(5, Math.round(questions * 0.5));

  return (
    <div className="mx-auto max-w-[620px] pt-6">
      <div className="mb-4 flex items-center gap-2 text-[12px]">
        <Link href="/lessons" className="text-aula-text-3 transition-colors hover:text-aula-text">
          Lições
        </Link>
        <span className="text-aula-text-4">/</span>
        <span className="text-aula-text-2">{isReview ? "Revisão" : `Lição ${cefr}`}</span>
      </div>

      <div className="flex items-center gap-2">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-aula-text">{isReview ? "Hora de rever" : "A tua próxima lição"}</h1>
        {cefr && cefr !== "mixed" && <LevelTag level={cefr} />}
      </div>
      <p className="mt-1.5 text-[13px] text-aula-text-2">
        {isReview
          ? "O que estava quase a fugir-te. Acertas e volta mais tarde; erras e volta mais cedo."
          : "Feita para ti a partir do que já sabes e do que te falta."}
      </p>

      <div className="mt-7 rounded-xl border border-aula-border bg-white">
        {news.length > 0 && (
          <div className="border-b border-aula-line px-5 py-4">
            <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3">Novo nesta lição</p>
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {news.map((x) => (
                <span key={x.one} className="text-[13px] text-aula-text">
                  <span className="font-semibold">{x.n}</span> {x.n === 1 ? x.one : x.many}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="px-5 py-4">
          <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3">Exercícios</p>
          {generated.sections.map((s, i) => (
            <div key={i} className="flex h-8 items-center gap-3 text-[13px]">
              <span className="w-4 text-[11px] text-aula-text-4">{i + 1}</span>
              <span className="flex-1 text-aula-text">{s.namePt}</span>
              <span className="text-[11.5px] text-aula-text-3">{s.totalQuestions}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 rounded-b-xl bg-aula-sunken px-5 py-3 text-[12px] text-aula-text-2">
          <span>~{minutes} min</span>
          <span className="text-aula-text-4">·</span>
          <span>{questions} perguntas</span>
          <span className="text-aula-text-4">·</span>
          <span>
            passas com <span className="font-medium text-aula-text">80%</span>
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onStartExercises}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-aula-accent px-5 text-[13px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
        >
          {isReview ? "Começar revisão" : "Começar"} <ArrowRight size={14} strokeWidth={1.5} />
        </button>
        {!isReview && learnItems.length > 0 && (
          <button
            type="button"
            onClick={onReviewFirst}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-aula-border bg-white px-4 text-[13px] font-medium text-aula-text transition-colors hover:border-aula-text-4"
          >
            <BookOpen size={14} strokeWidth={1.5} /> Ver a matéria primeiro
          </button>
        )}
      </div>
    </div>
  );
}
