"use client";

/**
 * Lições index pieces: the next-lesson card and the per-level lesson list.
 */

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw, Check, ChevronDown, ChevronRight } from "lucide-react";
import type { CurriculumLesson } from "@/data/curriculum-types";
import { Label, LevelTag } from "@/components/aula";

/**
 * The next adaptive session (/learn), titled by what it will teach first. The
 * review figure counts only items already seen that are due; unseen items are
 * new and are never counted here. Coral appears only for genuinely overdue ones.
 */
export function NextLessonCard({
  level,
  levelName,
  topic,
  reviews,
}: {
  level: string;
  levelName: string;
  topic: { titlePt: string; title: string } | null;
  reviews: { due: number; overdue: number };
}) {
  return (
    <div className="rounded-xl border border-aula-border bg-white p-[18px]">
      <Label className="mb-2">Próxima lição · {level}</Label>
      <p className="text-[15px] font-semibold tracking-[-0.01em] text-aula-text">{topic ? topic.titlePt : `Nível ${level}: ${levelName}`}</p>
      <p className="mt-0.5 text-[12px] text-aula-text-3">{topic ? topic.title : "Revisão e prática do teu nível"}</p>
      <p className="mt-2 text-[12px] leading-relaxed text-aula-text-2">
        {topic ? "Começa por esta regra. A lição junta palavras e verbos novos às revisões do que já viste." : "Já viste todos os tópicos de gramática deste nível. A lição junta palavras e verbos novos às revisões."}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link href="/learn" className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-aula-accent px-3.5 text-[12px] font-medium text-white transition-colors hover:bg-aula-accent-hover">
          Começar <ArrowRight size={13} strokeWidth={1.5} />
        </Link>
        {reviews.due > 0 && (
          <Link href="/learn?mode=review" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-aula-border bg-white px-3.5 text-[12px] font-medium text-aula-text transition-colors hover:border-aula-text-4">
            <RotateCcw size={13} strokeWidth={1.5} /> Rever {reviews.due}
            {reviews.overdue > 0 ? <span className="font-normal text-aula-overdue">· {reviews.overdue} em atraso</span> : <span className="font-normal text-aula-text-3">· hoje</span>}
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Every curriculum lesson, grouped by level, current level open. Completion is
 * stored per lesson id in user_lesson_progress, so «Concluída» is real; the
 * first lesson not yet completed (in curriculum order) is «Seguinte».
 */
export function LessonList({ lessons, completed, currentLevel }: { lessons: CurriculumLesson[]; completed: Set<string>; currentLevel: string }) {
  const [open, setOpen] = useState<Set<string>>(new Set([currentLevel]));
  const ordered = [...lessons].sort((a, b) => a.number - b.number);
  const nextId = ordered.find((l) => !completed.has(l.id))?.id;

  return (
    <div className="mt-6">
      <Label className="mb-2 px-2">Todas as lições</Label>
      <p className="mb-heading px-2 text-[12.5px] leading-relaxed text-[#5A5A57]">
        Every chapter, in order. Seguinte is where Continuar takes you. Opening another chapter does not change that.
      </p>
      {(["A1", "A2", "B1"] as const).map((lv) => {
        const list = ordered.filter((l) => l.cefrLevel === lv);
        if (list.length === 0) return null;
        const done = list.filter((l) => completed.has(l.id)).length;
        const isOpen = open.has(lv);
        return (
          <section key={lv} className="mb-3">
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() =>
                setOpen((prev) => {
                  const next = new Set(prev);
                  if (next.has(lv)) next.delete(lv);
                  else next.add(lv);
                  return next;
                })
              }
              className="flex w-full items-center gap-2.5 rounded-[10px] px-2 py-1.5 text-left transition-colors hover:bg-aula-sunken"
            >
              {isOpen ? <ChevronDown size={14} strokeWidth={1.5} className="text-aula-text-3" /> : <ChevronRight size={14} strokeWidth={1.5} className="text-aula-text-3" />}
              <LevelTag level={lv} />
              <span className="text-[11px] text-aula-text-3">
                {list.length} lições · {done} concluídas
              </span>
            </button>
            {isOpen &&
              list.map((l) => {
                const isDone = completed.has(l.id);
                const isNext = l.id === nextId;
                return (
                  <Link
                    key={l.id}
                    href={`/lessons/${l.id}`}
                    className="flex min-h-[44px] items-center gap-4 rounded-[10px] px-3 py-2 transition-colors hover:bg-aula-sunken"
                  >
                    <span className="w-6 shrink-0 text-right text-[11px] text-aula-text-3">{l.number}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] text-aula-text">{l.titlePt}</div>
                      <div className="truncate text-[11px] text-aula-text-3">{l.title}</div>
                    </div>
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1F7A68]">
                        <Check size={12} strokeWidth={1.5} /> Concluída
                      </span>
                    ) : isNext ? (
                      <span className="text-[11px] font-medium text-aula-accent">Seguinte</span>
                    ) : null}
                  </Link>
                );
              })}
          </section>
        );
      })}
    </div>
  );
}
