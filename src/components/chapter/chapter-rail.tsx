"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Lock } from "lucide-react";
import type { CurriculumLesson } from "@/data/curriculum-types";
import type { ChapterContent } from "@/data/chapter-types";
import { chapterPlace } from "@/lib/chapter-nav";
import { useChapterProgress } from "@/lib/chapter-progress";
import { AskChapter } from "@/components/book/ask";
import { useBook } from "@/components/book/book-context";
import { PlayButton } from "@/components/book/play-button";
import { useCourseSnapshot } from "@/components/course/use-course";
import { ElisioAvatar } from "./elisio-avatar";

const EYEBROW = "text-[11px] font-medium text-aula-text-3";
const SECONDARY =
  "inline-flex h-7 items-center justify-center gap-1.5 rounded-lg border border-aula-border bg-white px-3 text-[12.5px] font-medium text-aula-text transition-colors hover:bg-aula-sunken";

function StepCard({ label, locked, done, fill, sub, disabledTitle }: { label: string; locked?: boolean; done?: boolean; fill: number; sub: string; disabledTitle?: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[10px] border border-aula-line px-3 py-2.5" aria-disabled={disabledTitle ? true : undefined} title={disabledTitle}>
      <p className="flex items-center gap-1.5 text-[13px] font-medium text-aula-text">
        {done && <Check size={12} strokeWidth={2} className="text-[#1F7A68]" aria-hidden />}
        {locked && <Lock size={12} strokeWidth={1.5} className="text-aula-text-3" aria-hidden />}
        {label}
      </p>
      <div className="h-1.5 overflow-hidden rounded-[3px] bg-aula-line">
        <div className="h-full rounded-[3px] bg-aula-accent" style={{ width: `${Math.round(Math.max(0, Math.min(1, fill)) * 100)}%` }} />
      </div>
      <p className="text-[12px] text-aula-text-2">{sub}</p>
    </div>
  );
}

function CanDo({ items, reached, read }: { items: { text: string; section: number }[]; reached: number; read: boolean }) {
  function go(section: number) {
    const el = document.getElementById(`section-${section}`);
    if (!el) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
  }
  return (
    <div className="flex flex-col gap-1">
      <p className={EYEBROW}>By the end you can</p>
      {items.map((item) => {
        const done = read || reached > item.section;
        return (
          <button key={item.text} type="button" onClick={() => go(item.section)} className="flex w-full items-center gap-2.5 rounded-lg px-1 py-[7px] text-left hover:bg-aula-canvas">
            <span
              className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${done ? "bg-[#1F7A68] text-white" : "border-[1.5px] border-aula-border"}`}
              aria-hidden
            >
              {done && <Check size={10} strokeWidth={2.5} />}
            </span>
            <span className={`flex-1 text-[13px] ${done ? "text-aula-text-2" : "text-aula-text"}`}>{item.text}</span>
            <span className="text-[11px] tabular-nums text-aula-text-3">§{item.section}</span>
          </button>
        );
      })}
    </div>
  );
}

function Drill({ drills }: { drills: { prompt: string; answer: string; phonetics: string }[] }) {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const drill = drills[i];
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-[#D3DAEB] bg-aula-accent-faint p-3.5" aria-live="polite">
      <div className="flex items-center justify-between">
        <p className={EYEBROW}>Say it out loud</p>
        <p className="text-[11px] tabular-nums text-aula-text-3">
          {i + 1} / {drills.length}
        </p>
      </div>
      <p className="text-[15px] font-medium text-aula-text">{drill.prompt}</p>
      <div className="flex min-h-[52px] items-center rounded-[10px] bg-white px-3 py-2.5">
        {shown ? (
          <div className="flex items-center gap-2">
            <PlayButton text={drill.answer} variant="plain" />
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-aula-accent">{drill.answer}</p>
              <p className="text-[12px] text-aula-text-3">/{drill.phonetics}/</p>
            </div>
          </div>
        ) : (
          <p className="w-full text-center text-[12px] text-aula-text-3">Say it first, then check.</p>
        )}
      </div>
      <div className="flex gap-2">
        {!shown && (
          <button type="button" onClick={() => setShown(true)} className={`${SECONDARY} flex-1`}>
            Mostrar resposta
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setI((cur) => (cur + 1) % drills.length);
            setShown(false);
          }}
          className={SECONDARY}
        >
          Seguinte <ArrowRight size={12} strokeWidth={1.5} aria-hidden />
        </button>
      </div>
    </div>
  );
}

/** The dock's default state: where you are in the chapter, what you can do, and the way on. */
export function ChapterRail({ lesson, content }: { lesson: CurriculumLesson; content: ChapterContent | null }) {
  const book = useBook();
  const course = useCourseSnapshot();
  const place = chapterPlace(lesson);
  const progress = useChapterProgress(lesson.id);
  const read = course.read.has(lesson.id);
  const { total } = progress;
  const reached = read ? total : progress.reached;
  const rail = content?.rail;

  const left = total > 0 ? Math.max(1, Math.round((25 * (total - reached)) / total)) : 25;
  const readSub = read ? `Done · ${total} sections` : `§${Math.max(reached, 1)} of ${total} · about ${left} min left`;
  const nextChapter = place.nextInLevel ? `${place.level}.${place.index + 1} ${place.nextInLevel.titlePt}` : "Curso";
  const hint = !read && reached < total ? `Next: §${reached + 1} ${progress.titles[reached] ?? ""}` : `Next: ${nextChapter}`;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4">
        <div className="flex flex-col gap-1">
          <p className={EYEBROW}>
            {place.label} · Chapter {place.index} of {place.count}
          </p>
          <div className="flex items-center gap-2">
            <p className="min-w-0 text-[15px] font-semibold text-aula-text">{lesson.titlePt}</p>
            <span className="inline-flex h-[18px] shrink-0 items-center rounded-[5px] bg-[#E7F2EF] px-1.5 text-[10.5px] font-semibold text-[#1F7A68]">{lesson.cefrLevel}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <StepCard label="Ler" done={read} fill={read ? 1 : total > 0 ? reached / total : 0} sub={readSub} />
          <StepCard
            label="Teste"
            locked={!read}
            fill={0}
            sub="12 questions · pass with 10"
            disabledTitle={read ? "The chapter test arrives soon" : undefined}
          />
        </div>

        {rail && <CanDo items={rail.canDo} reached={reached} read={read} />}
        {rail && <Drill drills={rail.drills} />}

        {rail && (
          <div className="flex flex-col gap-1.5">
            <p className={EYEBROW}>Etiquette</p>
            {rail.etiquette.map((row) => (
              <div key={row.label} className="grid grid-cols-[92px_minmax(0,1fr)] gap-2.5 rounded-lg bg-aula-canvas px-2.5 py-2">
                <p className="text-[12.5px] font-medium text-aula-text">{row.label}</p>
                <p className="text-[12.5px] text-aula-text-2">{row.text}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-start gap-2.5">
          <ElisioAvatar size={32} />
          <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-[4px_12px_12px_12px] bg-aula-canvas px-3 py-2.5">
            <p className="text-[11px] text-aula-text-3">Elísio</p>
            {rail && <p className="text-[13px] text-aula-text">{rail.elisioTip}</p>}
            <AskChapter variant="field" about={{ about: "lesson", id: lesson.id }} />
          </div>
        </div>
      </div>

      <div className="h-px w-full shrink-0 bg-aula-line" />
      <div className="flex shrink-0 items-center gap-2 px-4 py-3">
        <p className="min-w-0 flex-1 truncate text-[11.5px] text-aula-text-3">{hint}</p>
        <button type="button" onClick={() => book.openPractice({ kind: "lesson" })} className={SECONDARY}>
          Praticar
        </button>
        <Link
          href={place.next ? `/lessons/${place.next.id}` : "/lessons"}
          className="inline-flex h-7 items-center rounded-lg bg-aula-accent px-3 text-[12px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
        >
          Continuar
        </Link>
      </div>
    </div>
  );
}
