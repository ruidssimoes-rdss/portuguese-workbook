"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import type { CurriculumLesson } from "@/data/curriculum-types";
import type { ChapterContent } from "@/data/chapter-types";
import { buildChapterTest, PASS_MARK, TEST_LENGTH, type TestQuestion } from "@/lib/chapter-test";
import { chapterSectionTitles } from "@/lib/chapter-sections";
import { chapterLabel, chapterPlace } from "@/lib/chapter-nav";
import { loadCourseLessons, practicedIds, reconcileResume, saveTestResult } from "@/lib/course-path";
import { Choice } from "@/components/learn/kit";
import { ChapterCallout } from "@/components/chapter/chapter-callout";
import { TestBar, TEST_SECONDARY } from "./test-bar";

const PRIMARY =
  "inline-flex h-7 items-center justify-center rounded-lg bg-aula-accent px-3 text-[12.5px] font-medium text-white transition-colors hover:bg-aula-accent-hover disabled:cursor-not-allowed disabled:opacity-40";
const EYEBROW = "text-[11px] font-medium text-aula-text-3";

type Phase = "start" | "question" | "result";

function Misses({ misses, lessonId, titles }: { misses: { q: TestQuestion; picked: number }[]; lessonId: string; titles: string[] }) {
  if (misses.length === 0) return <p className="text-[13px] text-aula-text-2">No misses.</p>;
  return (
    <div className="flex flex-col gap-1.5">
      <p className={EYEBROW}>What you missed</p>
      {misses.map(({ q, picked }) => (
        <div key={q.id} className="grid grid-cols-1 gap-1 rounded-lg bg-aula-canvas px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-3">
          <div className="min-w-0">
            <p className="text-[13px] text-aula-text">
              {q.prompt}
              {q.promptPt ? ` ${q.promptPt}` : ""}
            </p>
            <p className="text-[12px] text-aula-text-2">
              Your answer: {q.options[picked]} · Answer: {q.options[q.correctIndex]}
            </p>
          </div>
          <Link href={`/lessons/${lessonId}#section-${q.section}`} className="text-[12px] text-aula-text-3 hover:text-aula-text-2">
            §{q.section} {titles[q.section - 1]}
          </Link>
        </div>
      ))}
    </div>
  );
}

export function ChapterTestRunner({
  lesson,
  content,
  read,
  ready,
}: {
  lesson: CurriculumLesson;
  content: ChapterContent | null;
  read: boolean;
  ready: boolean;
}) {
  const place = chapterPlace(lesson);
  const titles = useMemo(() => chapterSectionTitles(lesson, content), [lesson, content]);
  const [phase, setPhase] = useState<Phase>("start");
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<(number | null)[]>([]);
  const [hint, setHint] = useState(false);

  const begin = useCallback(() => {
    // Built on the client only, so the shuffle never differs between server and browser.
    const next = buildChapterTest(lesson, content);
    setQuestions(next);
    setPicked(next.map(() => null));
    setIndex(0);
    setHint(false);
    setPhase("question");
  }, [lesson, content]);

  const current = questions[index];
  const choose = useCallback(
    (i: number) => setPicked((prev) => prev.map((value, at) => (at === index ? i : value))),
    [index],
  );
  const advance = useCallback(() => {
    if (picked[index] == null) return;
    setHint(false);
    if (index + 1 >= questions.length) setPhase("result");
    else setIndex(index + 1);
  }, [index, picked, questions.length]);

  useEffect(() => {
    if (phase !== "question") return;
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key >= "1" && e.key <= "4") choose(Number(e.key) - 1);
      else if (e.key === "Enter") advance();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, choose, advance]);

  const score = questions.reduce((sum, q, i) => sum + (picked[i] === q.correctIndex ? 1 : 0), 0);
  const passed = score >= PASS_MARK;
  const misses = questions.flatMap((q, i) => (picked[i] !== q.correctIndex ? [{ q, picked: picked[i] ?? 0 }] : []));

  const saved = useRef<string | null>(null);
  useEffect(() => {
    if (phase !== "result") {
      saved.current = null;
      return;
    }
    const key = questions.map((q) => q.id + q.options.join()).join("|");
    if (saved.current === key) return;
    saved.current = key;
    saveTestResult(lesson.id, score, PASS_MARK);
    if (score >= PASS_MARK) {
      void loadCourseLessons().then((lessons) => reconcileResume(lessons, practicedIds()));
    }
  }, [phase, lesson.id, score, questions]);

  const nextLabel = place.nextInLevel ? `${place.level}.${place.index + 1} ${place.nextInLevel.titlePt}` : null;
  const focus = (() => {
    const counts = new Map<number, number>();
    for (const miss of misses) counts.set(miss.q.section, (counts.get(miss.q.section) ?? 0) + 1);
    let best: number | null = null;
    for (const [section, count] of counts) {
      if (best == null || count > (counts.get(best) ?? 0) || (count === (counts.get(best) ?? 0) && section < best)) best = section;
    }
    return best == null ? null : { section: best, count: counts.get(best) ?? 0 };
  })();

  return (
    <div className="min-h-dvh bg-aula-canvas">
      <TestBar title={`${place.label} · ${lesson.titlePt}`} lessonId={lesson.id} />
      <div className="mx-auto mt-6 mb-10 w-[calc(100%-32px)] max-w-[720px] rounded-xl border border-aula-line bg-white p-5 sm:w-full sm:p-8">
        {phase === "start" && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <p className={EYEBROW}>Teste do capítulo · {place.label}</p>
              <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-aula-text">{lesson.titlePt}</h1>
              <p className="text-[13px] text-aula-text-2">
                Checks the must-knows from Antes do teste. {nextLabel ? `Pass it to unlock ${nextLabel}.` : `Pass it to finish ${place.level}.`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["Questions", String(TEST_LENGTH)],
                ["Time", "about 6 min"],
                ["Pass with", String(PASS_MARK)],
                ["Hints", "free"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[10px] bg-aula-canvas px-3 py-2.5">
                  <p className="text-[11px] text-aula-text-3">{label}</p>
                  <p className="text-[14px] font-semibold text-aula-text">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <p className={EYEBROW}>What it covers</p>
              {(content ? content.mustKnow : titles.slice(0, Math.max(0, titles.length - 1)).filter((title) => title !== "Cultura")).map((line) => (
                <p key={line} className="text-[13px] text-aula-text-2">
                  {line}
                </p>
              ))}
            </div>
            <p className="text-[12px] text-aula-text-3">One sitting. Leaving midway restarts the test.</p>
            {ready && !read && <p className="text-[12px] text-aula-text-3">Read the chapter to the end to unlock the test.</p>}
            <div className="flex justify-end gap-2">
              <Link href={`/lessons/${lesson.id}`} className={TEST_SECONDARY}>
                Voltar ao capítulo
              </Link>
              <button type="button" onClick={begin} disabled={!read} title={!read ? "Read the chapter first" : undefined} className={PRIMARY}>
                Começar o teste
              </button>
            </div>
          </div>
        )}

        {phase === "question" && current && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <p className="text-[12px] font-medium text-aula-text-3">
                Pergunta {index + 1} de {questions.length}
              </p>
              <div className="h-1.5 overflow-hidden rounded-[3px] bg-aula-line">
                <div className="h-full rounded-[3px] bg-aula-accent" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[15px] font-medium text-aula-text">{current.prompt}</p>
              {current.promptPt && <p className="text-[18px] font-semibold text-aula-text">{current.promptPt}</p>}
            </div>
            <div className="flex flex-col gap-2">
              {current.options.map((option, i) => (
                <Choice key={`${current.id}-${i}`} n={i + 1} label={option} selected={picked[index] === i} onClick={() => choose(i)} />
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={() => setHint((open) => !open)} className="self-start text-[12.5px] text-aula-accent">
                {hint ? "Ocultar dica" : "Ver dica"}
              </button>
              {hint && <ChapterCallout tone="note" title="Dica" body={current.hint} />}
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={advance} disabled={picked[index] == null} className={PRIMARY}>
                {index + 1 >= questions.length ? "Ver resultado" : "Seguinte"}
              </button>
            </div>
          </div>
        )}

        {phase === "result" && passed && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="text-[28px] font-semibold text-aula-text">{score} of {questions.length}</p>
              <p className="flex items-center gap-1.5 text-[15px] font-semibold text-[#1F7A68]">
                <Check size={16} strokeWidth={2} aria-hidden />
                Passaste
              </p>
            </div>
            <div className="flex flex-col gap-1 rounded-[10px] border border-[#D3DAEB] bg-aula-accent-faint p-3.5">
              <p className="text-[14px] font-semibold text-aula-text">{nextLabel ?? `${place.level} done.`}</p>
              {nextLabel && <p className="text-[12px] text-aula-text-2">Open now.</p>}
            </div>
            <Misses misses={misses} lessonId={lesson.id} titles={titles} />
            <div className="flex justify-end gap-2">
              <Link href={`/lessons/${lesson.id}`} className={TEST_SECONDARY}>
                Rever o capítulo
              </Link>
              <Link href={place.next ? `/lessons/${place.next.id}` : "/lessons"} className={PRIMARY}>
                {place.next ? `Continuar para ${chapterLabel(place.next)}` : "Curso"}
              </Link>
            </div>
          </div>
        )}

        {phase === "result" && !passed && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="text-[28px] font-semibold text-aula-text">{score} of {questions.length}</p>
              <p className="text-[15px] font-medium text-aula-text-2">Ainda não · you need {PASS_MARK}</p>
            </div>
            {focus && (
              <div className="flex flex-col gap-1 rounded-[10px] bg-aula-canvas p-3.5">
                <p className={EYEBROW}>Foco</p>
                <Link href={`/lessons/${lesson.id}#section-${focus.section}`} className="text-[14px] font-semibold text-aula-text">
                  §{focus.section} {titles[focus.section - 1]}
                </Link>
                <p className="text-[12px] text-aula-text-2">
                  {focus.count} of your {misses.length} misses came from here.
                </p>
              </div>
            )}
            <Misses misses={misses} lessonId={lesson.id} titles={titles} />
            <div className="flex justify-end gap-2">
              <Link href={`/lessons/${lesson.id}?praticar=1`} className={TEST_SECONDARY}>
                Praticar primeiro
              </Link>
              <button type="button" onClick={begin} className={PRIMARY}>
                Tentar outra vez
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
