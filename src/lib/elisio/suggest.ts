/** Starter questions for the empty rail. Every one must resolve to an answer (checked in the audit). */

import { getChapterContent } from "@/data/chapters";
import { getGrammar } from "@/lib/book/catalog";
import { lessonBundle } from "@/lib/book/elisio";
import { courseLesson } from "./index";
import type { ElisioContext } from "./types";

function headword(portuguese: string): string {
  return portuguese.split(/\s*\/\s*/)[0].replace(/\.\.\.|…/g, "").trim();
}

export function suggestionsFor(ctx: ElisioContext): string[] {
  const out: string[] = [];
  const about = ctx.about;
  if (about?.about === "verb") out.push(`conjugate ${about.id}`);
  else if (about?.about === "word") out.push(`what does ${headword(about.word)} mean`);
  else if (about?.about === "grammar") {
    const topic = getGrammar(about.id);
    if (topic) out.push(topic.title);
  }

  const lesson = courseLesson(ctx.currentId);
  if (lesson) {
    const content = getChapterContent(lesson.id);
    const note = content?.sections.flatMap((section) => section.blocks).find((block) => block.type === "note");
    if (note && note.type === "note") out.push(note.title);
    const topicId = lesson.stages.grammar.topics[0];
    const topic = topicId ? getGrammar(topicId) : null;
    if (topic) out.push(topic.title);
    const bundle = lessonBundle(lesson);
    if (bundle.verbs[0]) out.push(`conjugate ${bundle.verbs[0].id}`);
    if (bundle.words[0]) out.push(`what does ${headword(bundle.words[0].portuguese)} mean`);
  }

  const seen = new Set<string>();
  return out.filter((q) => {
    const key = q.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 4);
}
