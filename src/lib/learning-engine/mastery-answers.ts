/**
 * Learning Engine — Mastery Answers (pure).
 *
 * Turns per-question section results into one mastery answer per pool item.
 * An item asked more than once in a session counts once, and is correct
 * only if every attempt was correct. Items that were never asked are not
 * included — being shown in the learn phase is not evidence of knowledge.
 */

import type { GeneratedLesson } from "@/lib/exercise-generator";
import type { SectionResult } from "@/lib/exercise-types";
import type { MasteryAnswer, CEFRLevel } from "./mastery-tracker";
import type { SessionPracticeItem } from "./session-payload";

export function buildMasteryAnswers(
  generated: Pick<GeneratedLesson, "sections">,
  sectionResults: SectionResult[],
  practiceItems: SessionPracticeItem[],
  fallbackCefr: CEFRLevel
): MasteryAnswer[] {
  const meta = new Map(practiceItems.map((p) => [`${p.contentType}:${p.contentId}`, p]));
  const agg = new Map<
    string,
    { contentType: MasteryAnswer["contentType"]; contentId: string; correct: boolean }
  >();

  for (const sr of sectionResults) {
    const section = generated.sections.find((s) => s.key === sr.sectionKey);
    if (!section) continue;
    for (const a of sr.answers) {
      const ref = section.attribution[a.questionId];
      if (!ref) continue;
      const key = `${ref.contentType}:${ref.contentId}`;
      const prev = agg.get(key);
      agg.set(key, {
        contentType: ref.contentType,
        contentId: ref.contentId,
        correct: (prev ? prev.correct : true) && a.correct,
      });
    }
  }

  return [...agg.entries()].map(([key, v]) => {
    const item = meta.get(key);
    return {
      contentType: v.contentType,
      contentId: v.contentId,
      contentCefr: item?.contentCefr ?? fallbackCefr,
      contentCategory: item?.contentCategory,
      wasCorrect: v.correct,
    };
  });
}
