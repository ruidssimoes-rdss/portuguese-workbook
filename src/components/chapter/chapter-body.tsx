"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { CurriculumLesson } from "@/data/curriculum-types";
import type { ChapterBlock, ChapterContent } from "@/data/chapter-types";
import { vocabKey } from "@/data/resolve-lessons";
import { lessonBundle } from "@/lib/book/elisio";
import { chapterPlace } from "@/lib/chapter-nav";
import { useBook } from "@/components/book/book-context";
import { genericSections } from "@/lib/chapter-sections";
import { ChapterCallout } from "./chapter-callout";
import { ChapterHashScroll } from "./chapter-hash-scroll";
import { ChapterReadTracker } from "./chapter-read-tracker";
import { ChapterTable, type TableRow } from "./chapter-table";

type Bundle = ReturnType<typeof lessonBundle>;

/** `ele/ela/você (he/she/you formal)` becomes `ele / ela / você`. */
function personLabel(person: string): string {
  return person.replace(/\s*\([^)]*\)/g, "").replace(/\s*\/\s*/g, " / ").trim();
}

function ellipsis(text: string): string {
  return text.replace(/\.\.\./g, "…");
}

function ConjugationTable({ bundle, verbKey, tense }: { bundle: Bundle; verbKey: string; tense: string }) {
  const verb = bundle.verbs.find((item) => item.id === verbKey.toLowerCase());
  const rows: TableRow[] = (verb?.rows(tense) ?? []).map((row) => ({
    audio: row.example,
    c1: personLabel(row.person),
    c2: row.form,
    c3: row.pronunciation ?? "",
    c4: row.example,
  }));
  return <ChapterTable layout="conjugation" rows={rows} />;
}

function Block({ block, bundle }: { block: ChapterBlock; bundle: Bundle }) {
  const book = useBook();
  switch (block.type) {
    case "vocab": {
      const rows: TableRow[] = [];
      for (const row of block.rows) {
        if (row.kind === "row") {
          rows.push({ audio: row.pt, c1: row.pt, c2: row.phonetics, c3: row.en, c4: row.example });
          continue;
        }
        const word = bundle.words.find((item) => item.category === row.categoryId && vocabKey(item.portuguese) === vocabKey(row.portuguese));
        if (!word) continue;
        rows.push({
          audio: word.portuguese,
          c1: ellipsis(word.portuguese),
          c2: word.pronunciation ?? "",
          c3: word.english,
          c4: word.example ?? "",
          onOpen: () => book.openCard(word.ref),
        });
      }
      return <ChapterTable layout="vocab" header={block.header} rows={rows} />;
    }
    case "conjugation":
      return (
        <div className={`grid grid-cols-1 gap-[18px] ${block.items.length > 1 ? "xl:grid-cols-2" : ""}`}>
          {block.items.map((item) => (
            <div key={item.verbKey + item.tense} className="flex min-w-0 flex-col gap-2">
              <p className="text-[13px] font-medium text-aula-text">{item.label}</p>
              <ConjugationTable bundle={bundle} verbKey={item.verbKey} tense={item.tense} />
            </div>
          ))}
        </div>
      );
    case "dialogue":
      return (
        <ChapterTable
          layout="dialogue"
          rows={block.lines.map((line) => ({ audio: line.pt, c1: line.n, c2: line.pt, c3: line.phonetics, c4: line.en }))}
        />
      );
    case "note":
      return <ChapterCallout tone="note" title={block.title} body={block.body} />;
    case "text":
      return <p className="text-[13px] leading-relaxed text-aula-text-2">{block.body}</p>;
  }
}

function SectionHeading({ n, title, grammarTopic }: { n: number; title: string; grammarTopic?: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <h2 className="text-[16px] font-semibold text-aula-text">
        §{n} {title}
      </h2>
      <span className="flex-1" />
      {grammarTopic && (
        <Link href={`/grammar/${grammarTopic}`} className="text-[12px] text-aula-text-3 transition-colors hover:text-aula-text-2">
          Abrir em Gramática
        </Link>
      )}
    </div>
  );
}

export function ChapterBody({ lesson, content }: { lesson: CurriculumLesson; content: ChapterContent | null }) {
  const bundle = useMemo(() => lessonBundle(lesson), [lesson]);
  const place = chapterPlace(lesson);
  const sections = content ? content.sections : genericSections(lesson, bundle);
  const culturaIntro = content ? content.culturaIntro : "Etiquette and culture for this chapter.";
  const mustKnow = content ? content.mustKnow.join(" · ") : lesson.description;

  let n = 0;
  return (
    <article className="flex flex-col gap-[18px] pt-2 pb-10">
      <ChapterReadTracker lesson={lesson} />
      <ChapterHashScroll />
      <div className="flex flex-col gap-1">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-aula-text">{lesson.titlePt}</h1>
        <p className="text-[13px] text-aula-text-2">
          Level {place.level} · Chapter {place.index} of {place.count} · {lesson.description}
        </p>
      </div>

      {sections.map((section) => {
        const num = ++n;
        return (
        <section key={section.title} id={`section-${num}`} data-chapter-section={num} data-title={section.title} className="flex scroll-mt-4 flex-col gap-[18px]">
          <SectionHeading n={num} title={section.title} grammarTopic={section.grammarTopic} />
          {section.blocks.map((block, i) => (
            <Block key={i} block={block} bundle={bundle} />
          ))}
        </section>
        );
      })}

      {bundle.notes.length > 0 && (
        <section id={`section-${n + 1}`} data-chapter-section={n + 1} data-title="Cultura" className="flex scroll-mt-4 flex-col gap-[18px]">
          <SectionHeading n={++n} title="Cultura" />
          <p className="text-[13px] text-aula-text-2">{culturaIntro}</p>
          {bundle.notes.map((note, i) => (
            <ChapterCallout key={`${note.title}-${i}`} tone="cultura" title={note.title} body={note.blocks[0]?.text ?? ""} />
          ))}
        </section>
      )}

      <section id={`section-${n + 1}`} data-chapter-section={n + 1} data-title="Antes do teste" className="flex scroll-mt-4 flex-col gap-[18px]">
        <SectionHeading n={++n} title="Antes do teste" />
        <p className="text-[13px] text-aula-text-2">Must-know: {mustKnow}</p>
        <p className="text-[13px] text-aula-text-2">
          Teste: 12 questions, pass with 10.{" "}
          <Link href={`/lessons/${lesson.id}/teste`} className="font-medium text-aula-accent">
            Fazer o teste
          </Link>
        </p>
        <p className="text-[13px] text-aula-text-2">
          Then →{" "}
          {place.nextInLevel ? (
            <Link href={`/lessons/${place.nextInLevel.id}`} className="font-medium text-aula-accent">
              {place.level}.{place.index + 1} {place.nextInLevel.titlePt}
            </Link>
          ) : (
            <Link href="/lessons" className="font-medium text-aula-accent">
              Curso
            </Link>
          )}
        </p>
      </section>
    </article>
  );
}
