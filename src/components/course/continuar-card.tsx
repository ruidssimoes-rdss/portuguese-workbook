"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCourseSnapshot } from "./use-course";

/** Resume entry. Always the next unfinished chapter, never the one opened from search. */
export function ContinuarCard() {
  const course = useCourseSnapshot();
  const lesson = course.resume ?? (course.finished ? course.lessons.at(-1) ?? null : course.lessons[0] ?? null);
  const index = lesson ? course.lessons.findIndex((item) => item.id === lesson.id) + 1 : 0;

  return (
    <div className="rounded-xl border border-[#D3DAEB] bg-aula-accent-faint p-[18px]">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#5A5A57]">Continuar</p>
      <h2 className="mt-heading text-[15px] font-semibold tracking-[-0.01em] text-aula-text">
        {lesson ? lesson.titlePt : "O curso"}
      </h2>
      <p className="mt-heading text-[12.5px] leading-relaxed text-[#5A5A57]">
        {lesson
          ? `${lesson.title}. Start here and go chapter by chapter, A1 then A2 then B1. Searching a word does not move this place.`
          : "One course, from the first chapter. Searching a word does not move your place."}
      </p>
      {lesson && (
        <p className="mt-heading text-[12px] text-[#5A5A57]">
          {course.finished ? "Curso concluído" : `Capítulo ${index} de ${course.lessons.length}`}
          {" · "}
          {lesson.cefrLevel}
          {" · "}
          read the chapter, then pass the exercises at 80%
        </p>
      )}
      <div className="mt-card">
        <Link
          href={lesson ? `/lessons/${lesson.id}` : "/lessons"}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-aula-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
        >
          Continuar <ArrowRight size={14} strokeWidth={1.5} />
        </Link>
      </div>
    </div>
  );
}
