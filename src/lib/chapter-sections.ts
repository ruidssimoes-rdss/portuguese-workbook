import type { CurriculumLesson } from "@/data/curriculum-types";
import type { ChapterBlock, ChapterContent, ChapterSection } from "@/data/chapter-types";
import { lessonBundle } from "@/lib/book/elisio";

export type Bundle = ReturnType<typeof lessonBundle>;

function capital(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Sections for a chapter that has no file of its own yet, built from its library references. */
export function genericSections(lesson: CurriculumLesson, bundle: Bundle): ChapterSection[] {
  const sections: ChapterSection[] = [];
  if (bundle.words.length > 0) {
    sections.push({
      title: "Vocabulário",
      blocks: [
        {
          type: "vocab",
          rows: bundle.words.map((word) => ({ kind: "word" as const, categoryId: word.category, portuguese: word.portuguese })),
        },
      ],
    });
  }
  const refs = lesson.stages.verbs.verbs;
  if (bundle.verbs.length > 0) {
    sections.push({
      title: "Verbos (presente)",
      blocks: bundle.verbs.map((verb) => {
        const ref = refs.find((item) => item.verbKey.toLowerCase() === verb.id);
        return {
          type: "conjugation" as const,
          items: [{ label: `${capital(verb.id)}: ${verb.english}`, verbKey: verb.id.toUpperCase(), tense: ref?.tenses[0] ?? "Present" }],
        };
      }),
    });
  }
  for (const topic of bundle.topics) {
    const blocks: ChapterBlock[] = [];
    if (topic.summary) blocks.push({ type: "text", body: topic.summary });
    const examples = topic.rules[0]?.examples ?? [];
    if (examples.length > 0) {
      blocks.push({ type: "dialogue", lines: examples.map((ex, i) => ({ n: String(i + 1), pt: ex.pt, phonetics: "", en: ex.en })) });
    }
    sections.push({ title: topic.titlePt, grammarTopic: topic.id, blocks });
  }
  return sections;
}

/** The rendered § titles in order: content (or generic) sections, Cultura when it has notes, then Antes do teste. titles[n - 1] is §n. */
export function chapterSectionTitles(lesson: CurriculumLesson, content: ChapterContent | null): string[] {
  const bundle = lessonBundle(lesson);
  const sections = content ? content.sections : genericSections(lesson, bundle);
  const titles = sections.map((section) => section.title);
  if (bundle.notes.length > 0) titles.push("Cultura");
  titles.push("Antes do teste");
  return titles;
}
