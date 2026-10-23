"use client";

import type { CurriculumLesson } from "@/data/curriculum-types";
import { lessonBundle } from "@/lib/book/elisio";
import { AskChapter, AskPassage } from "./ask";
import { useBook } from "./book-context";
import { Callout, Examples, Kicker } from "./ui";
import { CardChip, LinkedText } from "./linked-text";

function SectionTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="mt-section font-sans text-[13px] font-medium leading-relaxed tracking-[-0.011em] text-aula-text">
      <span className="mr-2 tabular-nums text-[#5A5A57]">{n}</span>
      {children}
    </h2>
  );
}

export function lessonListenLines(lesson: CurriculumLesson): string[] {
  return [lesson.titlePt, lesson.descriptionPt].filter(Boolean);
}

/**
 * A curriculum lesson read as a chapter. Practice opens in the dock.
 */
export function LessonChapter({ lesson }: { lesson: CurriculumLesson }) {
  const book = useBook();
  const practicing = book.practice?.kind === "lesson";
  const { words, verbs, topics, notes } = lessonBundle(lesson);
  const aboutLesson = { about: "lesson" as const, id: lesson.id };

  let n = 0;

  return (
    <article className="mx-auto max-w-[640px]">
      <Kicker>
        Lição {lesson.number} · {lesson.cefrLevel} · 20 min
      </Kicker>
      <h1 className="mt-heading text-[22px] font-semibold tracking-[-0.02em] text-aula-text">{lesson.titlePt}</h1>
      <AskPassage about={{ ...aboutLesson, part: "intro" }}>
        <div>
          <p className="mt-heading text-[13px] leading-relaxed text-[#5A5A57]">{lesson.description}</p>
          {lesson.descriptionPt && (
            <p className="mt-paragraph text-[13px] leading-relaxed text-aula-text">
              <LinkedText text={lesson.descriptionPt} />
            </p>
          )}
        </div>
      </AskPassage>

      {words.length > 0 && (
        <div className="mt-paragraph flex flex-wrap items-baseline gap-x-paragraph gap-y-item text-[12.5px]">
          <span className="text-[#5A5A57]">Palavras</span>
          {words.map((word) => (
            <CardChip key={word.category + word.portuguese} refCard={word.ref}>
              {word.portuguese}
            </CardChip>
          ))}
        </div>
      )}

      {words.length > 0 && (
        <AskPassage about={{ ...aboutLesson, part: "vocab" }}>
        <section>
          <SectionTitle n={++n}>Vocabulário</SectionTitle>
          <p className="mt-heading text-[13px] leading-relaxed text-[#5A5A57]">
            As palavras desta lição. Abre uma para ver o significado, o áudio e onde mais aparece.
          </p>
          <Examples
            className="mt-heading"
            rows={words.filter((word) => word.example).map((word) => ({ pt: word.example!, en: word.exampleTranslation || word.english }))}
          />
        </section>
        </AskPassage>
      )}

      {verbs.length > 0 && (
        <section>
          <SectionTitle n={++n}>Verbos</SectionTitle>
          <div className="mt-heading flex flex-col gap-paragraph">
            {verbs.map((verb) => {
              const rows = verb.rows("Present");
              const sample = [rows[0], rows[2]].filter(Boolean);
              return (
                <AskPassage key={verb.id} about={{ ...aboutLesson, part: `verb/${verb.id}` }}>
                <div>
                  <p className="text-[13px] leading-relaxed text-aula-text">
                    <CardChip refCard={{ kind: "verb", id: verb.id }}>{verb.id}</CardChip>
                    <span className="text-[#5A5A57]"> · {verb.english}</span>
                  </p>
                  <Examples rows={sample.map((row) => ({ pt: row.example, en: row.english }))} />
                </div>
                </AskPassage>
              );
            })}
          </div>
        </section>
      )}

      {topics.map((topic) => {
        const rule = topic.rules[0];
        return (
          <AskPassage key={topic.id} about={{ ...aboutLesson, part: `topic/${topic.id}` }}>
          <section>
            <SectionTitle n={++n}>
              <CardChip refCard={topic.ref}>{topic.titlePt}</CardChip>
            </SectionTitle>
            {topic.summary && (
              <p className="mt-heading text-[13px] leading-relaxed text-aula-text">
                <LinkedText text={topic.summary} />
              </p>
            )}
            {rule && <Examples className="mt-heading" rows={rule.examples.slice(0, 2)} />}
          </section>
          </AskPassage>
        );
      })}

      {notes.length > 0 && (
        <section>
          <SectionTitle n={++n}>Cultura</SectionTitle>
          <div className="mt-heading flex flex-col gap-paragraph">
            {notes.map((note, i) => (
              <AskPassage key={`${note.title}-${i}`} about={{ ...aboutLesson, part: `culture/${i}` }}>
              <Callout
                label={<CardChip refCard={note.ref}>{note.title}</CardChip>}
              >
                {note.subtitle && <p className="mb-heading text-[#5A5A57]">{note.subtitle}</p>}
                {note.blocks.slice(0, 2).map((block, i) => (
                  <p key={i} className={i > 0 ? "mt-heading" : ""}>
                    {block.label && <span className="font-medium">{block.label}. </span>}
                    <LinkedText text={block.text} />
                  </p>
                ))}
                {note.example && (
                  <p className="mt-heading font-medium">
                    <LinkedText text={note.example.pt} />
                  </p>
                )}
              </Callout>
              </AskPassage>
            ))}
          </div>
        </section>
      )}

      <div className="mt-section flex flex-wrap items-center gap-paragraph">
        <button
          type="button"
          aria-pressed={practicing}
          onClick={() => book.openPractice({ kind: "lesson" })}
          className="tablet-target inline-flex h-9 items-center rounded-lg bg-aula-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
        >
          Praticar esta lição
        </button>
        <AskChapter tall about={aboutLesson} />
        <span className="text-[12.5px] text-[#5A5A57]">Os exercícios abrem neste capítulo.</span>
      </div>
    </article>
  );
}
