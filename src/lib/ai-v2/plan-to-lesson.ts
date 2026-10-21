/**
 * Plan-to-Lesson — resolves an AISessionPlan (content keys only, never
 * Portuguese text) into the Lesson shape the player and the exercise
 * generator already consume. The client then runs generateLessonExercises
 * on it, which fills the same 8 section types every lesson uses.
 */

import type { AISessionPlan } from "./types";
import type { Lesson, LessonStage, VocabItem, PracticeItem } from "@/data/curriculum-types";
import { getVocabItems, getVocabItemsByWords, getVerbItems, getGrammarItems, getCultureItems } from "./content-index";

function levelFromDifficulty(d: AISessionPlan["difficulty"]): Lesson["cefr"] {
  if (d === "foundation") return "A1";
  if (d === "developing") return "A2";
  return "B1";
}

/** Blank the headword out of its example sentence, when the example contains it. */
function practiceFromVocab(v: VocabItem, index: number, lessonId: string): PracticeItem | null {
  const word = v.word.split(" / ")[0].split(" (")[0].trim();
  if (!word || !v.example.pt || !v.example.pt.includes(word)) return null;
  return {
    id: `${lessonId}-practice-${index}`,
    sentence: v.example.pt.replace(word, "___"),
    answer: word,
    fullSentence: v.example.pt,
    translation: v.example.en,
    acceptedAnswers: [word],
  };
}

export function planToLesson(plan: AISessionPlan): Lesson {
  const id = `ai-session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const cefr = levelFromDifficulty(plan.difficulty);
  const stages: LessonStage[] = [];

  const vocab = new Map<string, VocabItem>();
  for (const area of plan.focusAreas) {
    if (area.type !== "vocabulary") continue;
    const items = area.vocabWords?.length
      ? getVocabItemsByWords(area.vocabWords)
      : getVocabItems(area.vocabCategories ?? [], area.vocabCefr, area.vocabCount ?? 5);
    for (const item of items) vocab.set(item.id, item);
  }
  const vocabItems = [...vocab.values()];
  if (vocabItems.length > 0) {
    stages.push({
      id: `${id}-vocab`,
      type: "vocabulary",
      title: "Vocabulary",
      ptTitle: "Vocabulário",
      description: "Tap each card to reveal the English meaning.",
      items: vocabItems,
    });
  }

  for (const area of plan.focusAreas) {
    if (area.type !== "verbs") continue;
    for (const verb of getVerbItems(area.verbSlugs ?? [], area.verbTenses ?? ["Present"])) {
      stages.push({
        id: `${id}-verb-${verb.verbSlug}-${verb.tense}`,
        type: "verb",
        title: `Verb: ${verb.verb}`,
        ptTitle: `Verbo: ${verb.verb}`,
        description: `Conjugation of '${verb.verb}' (${verb.verbTranslation}).`,
        verbs: [verb],
      });
    }
  }

  for (const area of plan.focusAreas) {
    if (area.type !== "grammar") continue;
    for (const g of getGrammarItems(area.grammarTopicSlugs ?? [])) {
      stages.push({
        id: `${id}-grammar-${g.topicSlug}`,
        type: "grammar",
        title: g.topicTitle,
        ptTitle: g.topicTitle,
        description: "Review the rule and examples.",
        grammarItems: [g],
      });
    }
  }

  const cultureCount = plan.focusAreas.filter((a) => a.type === "culture").reduce((n, a) => n + (a.cultureCount ?? 3), 0);
  if (cultureCount > 0) {
    stages.push({
      id: `${id}-culture`,
      type: "culture",
      title: "Culture",
      ptTitle: "Cultura",
      description: "A saying, a tip or a false friend.",
      cultureItems: getCultureItems(cultureCount),
    });
  }

  const practiceItems = vocabItems
    .map((v, i) => practiceFromVocab(v, i, id))
    .filter((p): p is PracticeItem => p !== null)
    .slice(0, 8);
  if (practiceItems.length > 0) {
    stages.push({
      id: `${id}-practice`,
      type: "practice",
      title: "Quick Practice",
      ptTitle: "Prática Rápida",
      description: "Fill in the missing word.",
      practiceItems,
    });
  }

  return {
    id,
    title: plan.sessionTitle,
    ptTitle: plan.sessionTitlePt,
    description: `${plan.difficulty} session · ${plan.focusAreas.length} focus areas`,
    cefr,
    estimatedMinutes: plan.estimatedMinutes,
    order: 0,
    stages,
  };
}
