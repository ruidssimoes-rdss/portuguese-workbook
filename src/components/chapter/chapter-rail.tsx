"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { CurriculumLesson } from "@/data/curriculum-types";
import type { ChapterContent } from "@/data/chapter-types";
import { chapterPlace } from "@/lib/chapter-nav";
import { AskChapter } from "@/components/book/ask";
import { useBook } from "@/components/book/book-context";
import { ChapterStatus } from "@/components/course/chapter-status";

function GreyCard({ label, lines }: { label: string; lines: string[] }) {
  return (
    <div className="flex flex-col gap-2 rounded-[10px] bg-aula-canvas p-3">
      <p className="text-[11px] font-medium text-aula-text-3">{label}</p>
      {lines.map((line) => (
        <p key={line} className="text-[13px] leading-relaxed text-aula-text-2">
          {line}
        </p>
      ))}
    </div>
  );
}

/** The dock's default state: where this chapter sits, how to use it, and the way on. */
export function ChapterRail({ lesson, content }: { lesson: CurriculumLesson; content: ChapterContent | null }) {
  const book = useBook();
  const place = chapterPlace(lesson);
  const before = place.nextInLevel ? `before ${place.level}.${place.index + 1} ${place.nextInLevel.titlePt}` : `last chapter of ${place.level}`;
  const rail = content?.rail;
  const howToUse = rail
    ? rail.howToUse
    : [
        "Play the audio at the start of each row, then read the example aloud before you scroll on.",
        "Treat the tables as drills, not a word list to memorise: listen, echo, then use the sentence.",
        "When a word feels opaque, open it for a snapshot. Come back here for the why, how and when of the chapter.",
      ];
  const cards: ReactNode[] = [<GreyCard key="how" label="How to use this chapter" lines={howToUse} />];
  if (rail) {
    cards.push(
      <GreyCard key="why" label="Why · how · when" lines={rail.whyHowWhen} />,
      <GreyCard key="cult" label="Cultura · short etiquette" lines={rail.etiquette} />,
      <GreyCard key="say" label="Say it out loud" lines={rail.sayItOutLoud} />,
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-3">
      <p className="text-[11px] text-aula-text-3">Helper · {place.label} Capítulo</p>

      <div className="flex flex-col gap-1.5 rounded-[10px] bg-aula-accent-faint p-3">
        <p className="text-[15px] font-semibold text-aula-text">{lesson.titlePt}</p>
        <p className="text-[12px] text-aula-text-3">
          Level {place.level} · Chapter {place.index} of {place.count} · {before}
        </p>
        <p className="mt-1 text-[11px] font-medium text-aula-text-3">What you leave with</p>
        <p className="text-[13px] leading-relaxed text-aula-text-2">{rail ? rail.leaveWith : lesson.description}</p>
      </div>

      <div className="flex flex-col gap-2">{cards}</div>

      {rail && (
        <div className="flex flex-col gap-1 rounded-[10px] border border-[#D3DAEB] bg-aula-accent-faint p-3">
          <p className="text-[11px] font-medium text-aula-accent">Dica · Elísio</p>
          <p className="text-[13px] leading-relaxed text-aula-text-2">{rail.elisioTip}</p>
        </div>
      )}

      <ChapterStatus lesson={lesson} />

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
        <Link
          href={place.next ? `/lessons/${place.next.id}` : "/lessons"}
          className="inline-flex h-7 items-center rounded-lg bg-aula-accent px-3 text-[12px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
        >
          Continuar
        </Link>
        <button
          type="button"
          onClick={() => book.openPractice({ kind: "lesson" })}
          className="inline-flex h-7 items-center rounded-lg border border-aula-border bg-white px-3 text-[12px] font-medium text-aula-text transition-colors hover:bg-aula-sunken"
        >
          Praticar
        </button>
        <AskChapter about={{ about: "lesson", id: lesson.id }} />
      </div>
    </div>
  );
}
