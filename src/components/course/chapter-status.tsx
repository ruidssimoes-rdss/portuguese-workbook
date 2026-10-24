"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import type { CurriculumLesson } from "@/data/curriculum-types";
import { useAuth } from "@/components/auth-provider";
import { markChapterRead, reconcileResume } from "@/lib/course-path";
import { chapterDone, useCourseSnapshot } from "./use-course";

function Step({ done, title, detail }: { done: boolean; title: string; detail: string }) {
  return (
    <div className="flex items-start gap-item">
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
          done ? "border-[#1F7A68] bg-[#1F7A68] text-white" : "border-[#C5CDE0] bg-white text-transparent"
        }`}
        aria-hidden
      >
        <Check size={10} strokeWidth={2.5} />
      </span>
      <div className="min-w-0">
        <p className={`text-[13px] font-medium ${done ? "text-[#1F7A68]" : "text-aula-text"}`}>{title}</p>
        <p className="text-[12.5px] leading-relaxed text-[#5A5A57]">{detail}</p>
      </div>
    </div>
  );
}

/** Reading + practice. Both are required before the course moves on. */
export function ChapterStatus({ lesson }: { lesson: CurriculumLesson }) {
  const course = useCourseSnapshot();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const read = course.read.has(lesson.id);
  const practiced = course.practiced.has(lesson.id);
  const done = chapterDone(lesson.id, course);
  const next = course.lessons.find((item) => item.number > lesson.number && !chapterDone(item.id, course));
  const offPath = Boolean(course.viewingId && course.resume && course.viewingId !== course.resume.id && course.viewingId === lesson.id);

  function markRead() {
    setBusy(true);
    markChapterRead(lesson.id);
    reconcileResume(course.lessons, course.practiced);
    setBusy(false);
  }

  return (
    <div className="mt-section rounded-[10px] border border-aula-line bg-white px-pad py-pad">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#5A5A57]">Para concluir</p>
      <p className="mt-heading text-[12.5px] leading-relaxed text-[#5A5A57]">
        Finish both steps. The course then continues at the next chapter. Looking around does not.
      </p>
      <div className="mt-card flex flex-col gap-paragraph">
        <Step
          done={read}
          title={read ? "Leitura feita" : "1 · Ler o capítulo"}
          detail={read ? "You marked this chapter as read." : "Read the page, then mark it. This does not skip ahead by itself."}
        />
        <Step
          done={practiced}
          title={practiced ? "Prática feita" : "2 · Praticar"}
          detail={
            practiced
              ? "You passed the exercises at 80%."
              : user
                ? "Open the exercises and score at least 80%."
                : "Sign in to save the exercises. Reading stays on this device."
          }
        />
      </div>
      <div className="mt-card flex flex-wrap items-center gap-item">
        {!read && (
          <button
            type="button"
            onClick={markRead}
            disabled={busy || !course.ready}
            className="inline-flex h-8 items-center rounded-lg border border-aula-border bg-white px-3 text-[12.5px] font-medium text-aula-text transition-colors hover:bg-aula-sunken disabled:opacity-40"
          >
            Marcar como lido
          </button>
        )}
        {done && next && (
          <Link href={`/lessons/${next.id}`} className="text-[12.5px] font-medium text-[#1F7A68]">
            Capítulo concluído · Continuar
          </Link>
        )}
        {done && !next && <span className="text-[12.5px] font-medium text-[#1F7A68]">Capítulo concluído</span>}
      </div>
      {offPath && course.resume && (
        <p className="mt-heading text-[12.5px] leading-relaxed text-[#5A5A57]">
          You are browsing. Your course still continues at{" "}
          <Link href={`/lessons/${course.resume.id}`} className="font-medium text-aula-accent">
            {course.resume.titlePt}
          </Link>
          .
        </p>
      )}
    </div>
  );
}
