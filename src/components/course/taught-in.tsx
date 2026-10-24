"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { lessonBacklinks } from "@/lib/book/catalog";
import { encodeCard, FICHA_PARAM, type CardRef } from "@/lib/book/types";
import { COURSE_EVENT, getResumeId, getViewingId, loadCourseLessons } from "@/lib/course-path";

function hrefWithCard(href: string, target: CardRef): string {
  return `${href}?${FICHA_PARAM}=${encodeURIComponent(encodeCard(target))}`;
}

/**
 * Lesson chapters that teach this card, earliest first.
 * Following one opens that chapter and keeps the card. It does not write the resume pointer.
 */
export function TaughtIn({ target, limit = 4 }: { target: CardRef; limit?: number }) {
  const lessons = lessonBacklinks(target).slice(0, limit);
  const [place, setPlace] = useState<{ resume: string | null; viewing: string | null; title: string | null }>({
    resume: null,
    viewing: null,
    title: null,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const resume = getResumeId();
      const viewing = getViewingId();
      let title: string | null = null;
      if (resume && resume !== viewing) {
        const all = await loadCourseLessons();
        const lesson = all.find((item) => item.id === resume);
        title = lesson ? `Lição ${lesson.number} · ${lesson.titlePt}` : resume;
      }
      if (!cancelled) setPlace({ resume, viewing, title });
    }
    load().catch(() => {});
    const bump = () => {
      load().catch(() => {});
    };
    window.addEventListener(COURSE_EVENT, bump);
    return () => {
      cancelled = true;
      window.removeEventListener(COURSE_EVENT, bump);
    };
  }, []);

  if (lessons.length === 0) return null;
  const showReturn = Boolean(place.resume && place.viewing && place.resume !== place.viewing);

  return (
    <section className="mt-card">
      <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#5A5A57]">Aparece em</h3>
      <p className="mt-heading text-[12.5px] leading-relaxed text-[#5A5A57]">
        Taught in these chapters. Opening one leaves your place in the course where it was.
      </p>
      <ul className="mt-heading flex flex-col gap-item">
        {lessons.map((item) => (
          <li key={item.sourceKey}>
            <Link
              href={item.href ? hrefWithCard(item.href, target) : "#"}
              className="block rounded-[10px] border border-aula-line px-3 py-2 transition-colors hover:bg-aula-sunken"
            >
              <span className="flex items-baseline gap-item">
                <span className="min-w-0 truncate text-[13px] font-medium text-aula-text">{item.title}</span>
                <span className="ml-auto shrink-0 text-[11px] text-[#5A5A57]">{item.kicker}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {showReturn && place.resume && (
        <Link href={`/lessons/${place.resume}`} className="mt-heading inline-flex text-[12.5px] font-medium text-aula-accent">
          Voltar ao curso{place.title ? ` · ${place.title}` : ""}
        </Link>
      )}
    </section>
  );
}
