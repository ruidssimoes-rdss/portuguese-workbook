"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronRight, Lock } from "lucide-react";
import type { CurriculumLesson } from "@/data/curriculum-types";
import { isChapterDone } from "@/lib/course-path";
import { LevelTag, Track } from "@/components/aula";

export const COURSE_LEVELS = [
  {
    key: "a1" as const,
    level: "A1" as const,
    name: "Iniciação",
    can: ["Apresentar-te e cumprimentar", "Pedir um café e pagar", "Dizer as horas, os dias, os números"],
    exam: null as string | null,
  },
  {
    key: "a2" as const,
    level: "A2" as const,
    name: "Sobreviver no dia a dia",
    can: ["Falar do que fizeste ontem e de como era", "Ir ao médico, à farmácia, às compras", "Escrever uma mensagem curta a um vizinho"],
    exam: "CIPLE · o exame oficial de A2",
  },
  {
    key: "b1" as const,
    level: "B1" as const,
    name: "Conversar à vontade",
    can: ["Contar uma história com princípio, meio e fim", "Dar a tua opinião e justificá-la", "Tratar de assuntos nas Finanças ou no banco"],
    exam: "DEPLE · o exame oficial de B1",
  },
];

export interface CourseLevelStat {
  key: (typeof COURSE_LEVELS)[number]["key"];
  unlocked: boolean;
  readiness: number;
  mastered: number;
  totalItems: number;
}

interface Band {
  id: string;
  level: "A1" | "A2" | "B1" | null;
  name: string;
  lessons: CurriculumLesson[];
}

/** Main A1, A2, and B1 blocks, then anything numbered after them, in course order. */
export function courseBands(lessons: CurriculumLesson[]): Band[] {
  const ordered = [...lessons].sort((a, b) => a.number - b.number || a.id.localeCompare(b.id));
  const used = new Set<string>();
  const take = (pred: (lesson: CurriculumLesson) => boolean) => {
    const list = ordered.filter((lesson) => !used.has(lesson.id) && pred(lesson));
    for (const lesson of list) used.add(lesson.id);
    return list;
  };
  const bands: Band[] = [
    { id: "A1", level: "A1", name: "Iniciação", lessons: take((lesson) => lesson.cefrLevel === "A1" && lesson.number <= 18) },
    { id: "A2", level: "A2", name: "Sobreviver no dia a dia", lessons: take((lesson) => lesson.cefrLevel === "A2" && lesson.number <= 34) },
    { id: "B1", level: "B1", name: "Conversar à vontade", lessons: take((lesson) => lesson.cefrLevel === "B1" && lesson.number <= 44) },
  ];
  const extra = ordered.filter((lesson) => !used.has(lesson.id));
  if (extra.length > 0) bands.push({ id: "extra", level: null, name: "Capítulos extra", lessons: extra });
  return bands.filter((band) => band.lessons.length > 0);
}

function doneCount(lessons: CurriculumLesson[], read: Set<string>, practiced: Set<string>) {
  return lessons.filter((lesson) => isChapterDone(lesson.id, practiced, read)).length;
}

function summary(lessons: CurriculumLesson[]) {
  const head = lessons.slice(0, 4).map((lesson) => lesson.titlePt);
  return lessons.length > 4 ? `${head.join(", ")}…` : head.join(", ");
}

function curriculumCounts(lessons: CurriculumLesson[]) {
  const words = new Set<string>();
  const topics = new Set<string>();
  for (const lesson of lessons) {
    for (const word of lesson.stages.vocabulary.words) words.add(`${word.categoryId}:${word.portuguese}`);
    for (const topic of lesson.stages.grammar.topics) topics.add(topic);
  }
  return { words: words.size, topics: topics.size, chapters: lessons.length };
}

function CourseSpine({
  lessons,
  resume,
  read,
  practiced,
}: {
  lessons: CurriculumLesson[];
  resume: CurriculumLesson | null;
  read: Set<string>;
  practiced: Set<string>;
}) {
  const bands = courseBands(lessons);
  const resumeBandId = bands.find((band) => band.lessons.some((lesson) => lesson.id === resume?.id))?.id ?? null;
  const [trackedResume, setTrackedResume] = useState<string | null>(resumeBandId);
  const [open, setOpen] = useState<Set<string>>(() => new Set(resumeBandId ? [resumeBandId] : []));

  if (trackedResume !== resumeBandId) {
    setTrackedResume(resumeBandId);
    if (resumeBandId) {
      setOpen((prev) => {
        if (prev.has(resumeBandId)) return prev;
        const next = new Set(prev);
        next.add(resumeBandId);
        return next;
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {bands.map((band) => {
        const total = band.lessons.length;
        const done = doneCount(band.lessons, read, practiced);
        const isCurrent = Boolean(resume && band.lessons.some((lesson) => lesson.id === resume.id));
        const isOpen = open.has(band.id);
        const later = Boolean(resume && band.lessons[0] && band.lessons[0].number > resume.number && !isCurrent);
        const status =
          done === total
            ? `${done} de ${total} · concluído · done`
            : isCurrent
              ? `${done > 0 ? `${done} ${done === 1 ? "feito" : "feitos"} · ` : ""}em curso · in progress`
              : later
                ? `${total} capítulos · a seguir · later`
                : `${done} de ${total}`;

        return (
          <section key={band.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() =>
                setOpen((prev) => {
                  const next = new Set(prev);
                  if (next.has(band.id)) next.delete(band.id);
                  else next.add(band.id);
                  return next;
                })
              }
              className="flex w-full items-center gap-3 rounded-[10px] px-2 py-2 text-left transition-colors hover:bg-aula-sunken"
            >
              {isOpen ? (
                <ChevronDown size={16} strokeWidth={1.5} className="shrink-0 text-[#5A5A57]" />
              ) : (
                <ChevronRight size={16} strokeWidth={1.5} className="shrink-0 text-[#5A5A57]" />
              )}
              {band.level ? (
                <LevelTag level={band.level} />
              ) : (
                <span className="inline-flex h-[18px] items-center rounded-[5px] bg-aula-sunken px-1.5 text-[10.5px] font-medium text-aula-text-2">
                  Mais
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-aula-text">{band.name}</span>
                <span className="mt-1 block text-[12px] text-[#5A5A57]">{status}</span>
              </span>
            </button>
            {!isOpen && (
              <p className="mt-heading px-2 pl-9 text-[12.5px] leading-relaxed text-[#5A5A57]">{summary(band.lessons)}</p>
            )}
            {isOpen && (
              <div className="mt-heading flex flex-col gap-item">
                {band.lessons.map((lesson) => {
                  const complete = isChapterDone(lesson.id, practiced, read);
                  const isResume = lesson.id === resume?.id;
                  const readDone = read.has(lesson.id);
                  return (
                    <Link
                      key={lesson.id}
                      href={`/lessons/${lesson.id}`}
                      aria-current={isResume ? "step" : undefined}
                      className={`flex items-center gap-4 rounded-[10px] px-3 py-2 transition-colors ${
                        isResume ? "border border-[#1B2B61] bg-[#F3F5FA]" : "border border-transparent hover:bg-aula-sunken"
                      }`}
                    >
                      <span className={`w-7 shrink-0 text-right text-[12px] tabular-nums ${isResume ? "font-medium text-[#1B2B61]" : "text-[#5A5A57]"}`}>
                        {lesson.number}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-aula-text">{lesson.titlePt}</span>
                        <span className="mt-heading block truncate text-[12px] leading-snug text-[#5A5A57]">{lesson.title}</span>
                        {isResume && readDone && !complete && (
                          <span className="mt-heading flex items-center gap-2">
                            <span className="h-1 w-16 overflow-hidden rounded-full bg-[#E6E6E4]">
                              <span className="block h-full w-1/2 rounded-full bg-[#1B2B61]" />
                            </span>
                            <span className="text-[12px] text-[#5A5A57]">1 de 2 · leitura feita</span>
                          </span>
                        )}
                      </span>
                      {complete ? (
                        <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-[#1F7A68]">
                          <Check size={12} strokeWidth={1.5} /> feita
                        </span>
                      ) : isResume ? (
                        <span className="inline-flex h-8 shrink-0 items-center rounded-lg bg-[#1B2B61] px-3 text-[12.5px] font-medium text-white">
                          Continuar
                        </span>
                      ) : (
                        <span className="shrink-0 text-[12px] text-[#98988F]">~20 min</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function LevelOverview({
  lessons,
  resume,
  read,
  practiced,
  levels,
}: {
  lessons: CurriculumLesson[];
  resume: CurriculumLesson | null;
  read: Set<string>;
  practiced: Set<string>;
  levels: CourseLevelStat[] | null;
}) {
  const bands = courseBands(lessons);
  const extra = bands.find((band) => band.id === "extra");

  return (
    <section className="mt-section border-t border-aula-line pt-section">
      <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-aula-text">O teu percurso</h2>
      <p className="mt-heading text-[12.5px] leading-relaxed text-[#5A5A57]">Your path · A1 → A2 → B1. Continuar follows chapter order.</p>
      <div className="mt-card flex flex-col gap-item">
        {COURSE_LEVELS.map((level, index) => {
          const band = bands.find((item) => item.id === level.level);
          const list = band?.lessons ?? [];
          const finished = list.length > 0 && doneCount(list, read, practiced) === list.length;
          const here = Boolean(resume && list.some((lesson) => lesson.id === resume.id));
          const stat = levels?.find((item) => item.key === level.key) ?? null;
          const locked = Boolean(stat && !stat.unlocked && !here && !finished);
          const pct = stat ? Math.round(stat.readiness * 100) : list.length ? Math.round((doneCount(list, read, practiced) / list.length) * 100) : 0;
          const counts = curriculumCounts(list);
          const prev = COURSE_LEVELS[index - 1]?.level;
          const status = finished
            ? "Concluído"
            : here
              ? `Estás aqui · ${pct}%`
              : locked
                ? `Abre quando terminares ${prev ?? "o nível anterior"}`
                : "A seguir";

          return (
            <article
              key={level.key}
              className={`rounded-xl border p-pad ${here ? "border-[#D3DAEB] bg-[#F3F5FA]" : "border-aula-border bg-white"} ${locked ? "opacity-70" : ""}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] text-[12px] font-semibold ${
                    finished ? "bg-[#E1F2ED] text-[#1F7A68]" : here ? "bg-[#1B2B61] text-white" : "bg-aula-sunken text-aula-text-3"
                  }`}
                >
                  {level.level}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-[13px] font-medium text-aula-text">{level.name}</h3>
                    <span className={`ml-auto shrink-0 text-[12px] ${here ? "text-[#1B2B61]" : "text-[#5A5A57]"}`}>
                      {locked ? (
                        <span className="inline-flex items-center gap-1">
                          <Lock size={11} strokeWidth={1.5} /> {status}
                        </span>
                      ) : (
                        status
                      )}
                    </span>
                  </div>
                  <p className="mt-heading text-[12px] text-[#5A5A57]">No fim deste nível consegues:</p>
                  <ul className="mt-item flex flex-col gap-item">
                    {level.can.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-aula-text">
                        <Check size={12} strokeWidth={1.5} className={`mt-0.5 shrink-0 ${finished || here ? "text-[#1F7A68]" : "text-[#98988F]"}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {(here || finished) && list.length > 0 && (
                    <div className="mt-card">
                      <Track value={pct / 100} />
                    </div>
                  )}
                  <p className="mt-heading text-[12px] text-[#5A5A57]">
                    {counts.words} palavras · {counts.topics} tópicos de gramática · {counts.chapters} capítulos
                  </p>
                  {level.exam && <p className="mt-heading text-[12px] font-medium text-[#1B2B61]">{level.exam}</p>}
                  {stat && stat.totalItems > 0 && (
                    <p className="mt-heading text-[12px] text-[#5A5A57]">
                      {stat.mastered} de {stat.totalItems} itens dominados neste nível
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {extra && extra.lessons.length > 0 && (
        <p className="mt-heading text-[12.5px] leading-relaxed text-[#5A5A57]">
          {extra.lessons.length} capítulos extra seguem o B1, na mesma ordem. Continuar não os salta.
        </p>
      )}
      <div className="mt-section grid gap-item min-[1100px]:grid-cols-3">
        {[
          { n: "1", title: "Aprender", en: "Learn", body: "Cada capítulo traz palavras novas, com um exemplo de Portugal." },
          { n: "2", title: "Rever", en: "Review", body: "O que já viste volta no momento certo. Erras, volta mais cedo." },
          { n: "3", title: "Dominar", en: "Master", body: "Acertas várias vezes seguidas e o intervalo cresce." },
        ].map((step) => (
          <div key={step.n} className="rounded-[10px] border border-aula-border bg-white p-pad">
            <p className="text-[12px] font-medium text-[#1B2B61]">
              {step.n} · {step.title}
            </p>
            <p className="mt-1 text-[12px] text-[#5A5A57]">{step.en}</p>
            <p className="mt-heading text-[12.5px] leading-relaxed text-aula-text">{step.body}</p>
          </div>
        ))}
      </div>
      <p className="mt-heading text-[12.5px] leading-relaxed text-[#5A5A57]">
        Passas a prática com 80%. O nível seguinte abre por volta dos 75%.
      </p>
    </section>
  );
}

/** Desktop and iPad course page. Phone keeps the previous lessons index. */
export function CourseDesktop({
  lessons,
  resume,
  read,
  practiced,
  finished,
  signedIn,
  levels,
}: {
  lessons: CurriculumLesson[];
  resume: CurriculumLesson | null;
  read: Set<string>;
  practiced: Set<string>;
  finished: boolean;
  signedIn: boolean;
  levels: CourseLevelStat[] | null;
}) {
  const done = doneCount(lessons, read, practiced);

  return (
    <div className="mx-auto max-w-[680px]">
      <header className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-aula-text">Curso</h1>
        <p className="mt-heading text-[13px] text-[#5A5A57]">Course · your path through the book</p>
        <p className="mt-paragraph text-[13px] leading-relaxed text-aula-text-2">
          Um percurso A1 → A2 → B1 · {lessons.length} capítulos · {done} feitos · ~20 min cada
        </p>
        {finished && <p className="mt-heading text-[12.5px] font-medium text-[#1F7A68]">Curso concluído</p>}
      </header>
      <CourseSpine lessons={lessons} resume={resume} read={read} practiced={practiced} />
      {!signedIn && (
        <div className="mt-section">
          <p className="text-[12.5px] leading-relaxed text-aula-text">
            Podes ler já. Entra quando quiseres guardar a prática. O teu lugar fica neste aparelho.{" "}
            <Link href="/auth/login" className="font-medium text-[#1B2B61]">
              Entrar
            </Link>
          </p>
          <p className="mt-heading text-[12.5px] leading-relaxed text-[#5A5A57]">
            You can read now. Sign in to save the exercises. Your place stays on this device.
          </p>
        </div>
      )}
      <LevelOverview lessons={lessons} resume={resume} read={read} practiced={practiced} levels={levels} />
    </div>
  );
}
