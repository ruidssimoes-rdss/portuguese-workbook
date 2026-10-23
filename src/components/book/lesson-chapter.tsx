"use client";

import Link from "next/link";
import type { CurriculumLesson } from "@/data/curriculum-types";
import { cultureOf, findWord, getGrammar, getVerb, type WordEntry } from "@/lib/book/catalog";
import { Callout, Examples, Kicker } from "./ui";
import { CardChip, LinkedText } from "./linked-text";

function SectionTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="mt-9 font-sans text-[13px] font-medium leading-relaxed tracking-[-0.011em] text-aula-text">
      <span className="mr-2 tabular-nums text-[#5A5A57]">{n}</span>
      {children}
    </h2>
  );
}

export function lessonListenLines(lesson: CurriculumLesson): string[] {
  return [lesson.titlePt, lesson.descriptionPt].filter(Boolean);
}

/**
 * A curriculum lesson read as a chapter. The prose is the lesson's own
 * description, examples and notes — practice stays a separate step.
 */
export function LessonChapter({ lesson, signedIn }: { lesson: CurriculumLesson; signedIn: boolean }) {
  const words = lesson.stages.vocabulary.words
    .map((ref) => findWord(ref.categoryId, ref.portuguese))
    .filter((word): word is WordEntry => Boolean(word));
  const verbs = lesson.stages.verbs.verbs
    .map((ref) => getVerb(ref.verbKey.toLowerCase()))
    .filter((verb): verb is NonNullable<ReturnType<typeof getVerb>> => Boolean(verb));
  const topics = lesson.stages.grammar.topics
    .map((id) => getGrammar(id))
    .filter((topic): topic is NonNullable<ReturnType<typeof getGrammar>> => Boolean(topic));
  const notes = lesson.stages.culture.items
    .map((item) => (item.type === "slang" ? null : cultureOf(item.type, item.id)))
    .filter((note): note is NonNullable<ReturnType<typeof cultureOf>> => Boolean(note));

  let n = 0;

  return (
    <article className="mx-auto max-w-[640px]">
      <Kicker>
        Lição {lesson.number} · {lesson.cefrLevel} · 20 min
      </Kicker>
      <h1 className="mt-1.5 text-[22px] font-semibold tracking-[-0.02em] text-aula-text">{lesson.titlePt}</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-[#5A5A57]">{lesson.description}</p>
      {lesson.descriptionPt && (
        <p className="mt-1.5 text-[13px] leading-relaxed text-aula-text">
          <LinkedText text={lesson.descriptionPt} />
        </p>
      )}

      {words.length > 0 && (
        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[12.5px]">
          <span className="text-[#5A5A57]">Palavras</span>
          {words.map((word) => (
            <CardChip key={word.category + word.portuguese} refCard={word.ref}>
              {word.portuguese}
            </CardChip>
          ))}
        </div>
      )}

      {words.length > 0 && (
        <section>
          <SectionTitle n={++n}>Vocabulário</SectionTitle>
          <p className="mt-2 text-[13px] leading-relaxed text-[#5A5A57]">
            As palavras desta lição. Abre uma para ver o significado, o áudio e onde mais aparece.
          </p>
          <Examples
            rows={words.filter((word) => word.example).map((word) => ({ pt: word.example!, en: word.exampleTranslation || word.english }))}
          />
        </section>
      )}

      {verbs.length > 0 && (
        <section>
          <SectionTitle n={++n}>Verbos</SectionTitle>
          <div className="mt-3 flex flex-col gap-5">
            {verbs.map((verb) => {
              const rows = verb.rows("Present");
              const sample = [rows[0], rows[2]].filter(Boolean);
              return (
                <div key={verb.id}>
                  <p className="text-[13px] leading-relaxed text-aula-text">
                    <CardChip refCard={{ kind: "verb", id: verb.id }}>{verb.id}</CardChip>
                    <span className="text-[#5A5A57]"> · {verb.english}</span>
                  </p>
                  <Examples rows={sample.map((row) => ({ pt: row.example, en: row.english }))} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {topics.map((topic) => {
        const rule = topic.rules[0];
        return (
          <section key={topic.id}>
            <SectionTitle n={++n}>
              <CardChip refCard={topic.ref}>{topic.titlePt}</CardChip>
            </SectionTitle>
            {topic.summary && (
              <p className="mt-2 text-[13px] leading-relaxed text-aula-text">
                <LinkedText text={topic.summary} />
              </p>
            )}
            {rule && <Examples rows={rule.examples.slice(0, 2)} />}
          </section>
        );
      })}

      {notes.length > 0 && (
        <section>
          <SectionTitle n={++n}>Cultura</SectionTitle>
          <div className="mt-3 flex flex-col gap-3">
            {notes.map((note) => (
              <Callout
                key={note.title}
                label={<CardChip refCard={note.ref}>{note.title}</CardChip>}
              >
                {note.subtitle && <p className="mb-1.5 text-[#5A5A57]">{note.subtitle}</p>}
                {note.blocks.slice(0, 2).map((block, i) => (
                  <p key={i} className={i > 0 ? "mt-1.5" : ""}>
                    {block.label && <span className="font-medium">{block.label}. </span>}
                    <LinkedText text={block.text} />
                  </p>
                ))}
                {note.example && (
                  <p className="mt-1.5 font-medium">
                    <LinkedText text={note.example.pt} />
                  </p>
                )}
              </Callout>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-3">
        {signedIn ? (
          <Link
            href={`/lessons/${lesson.id}?praticar=1`}
            className="inline-flex h-9 items-center rounded-lg bg-aula-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
          >
            Praticar esta lição
          </Link>
        ) : (
          <Link
            href={`/auth/login?next=${encodeURIComponent(`/lessons/${lesson.id}?praticar=1`)}`}
            className="inline-flex h-9 items-center rounded-lg bg-aula-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
          >
            Entra para praticar
          </Link>
        )}
        <span className="text-[12.5px] text-[#5A5A57]">A prática é a mesma lição de sempre, com exercícios.</span>
      </div>
    </article>
  );
}
