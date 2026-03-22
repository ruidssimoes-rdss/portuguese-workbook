/**
 * Learning Engine — Lesson Adapter
 *
 * Transforms a GeneratedLesson (from the learning engine) into the exact
 * Lesson shape the existing exercise engine expects. This lets us feed
 * dynamically generated content into the unchanged exercise pipeline.
 *
 * OLD FLOW: curriculum.ts → resolve-lessons.ts → Lesson → exercise-generator
 * NEW FLOW: lesson-generator.ts → lesson-adapter.ts → Lesson → exercise-generator
 */

import type { Lesson, LessonStage, VocabItem, VerbItem, GrammarItem, PracticeItem as LessonPracticeItem } from "@/data/lessons";
import type { GeneratedLesson, PracticeItem } from "./lesson-generator";
import type { ReviewSession } from "./review-generator";
import type { PoolVocabItem, PoolVerbItem, PoolGrammarItem } from "./content-pool";
import type { CEFRLevel } from "./mastery-tracker";

// ─── Adapt Generated Lesson → Lesson ────────────────────

/**
 * Convert a GeneratedLesson into the Lesson shape that
 * generateLessonExercises() expects.
 */
export function adaptGeneratedLesson(generated: GeneratedLesson): {
  lesson: Lesson;
  practiceItems: PracticeItem[];
} {
  const stages: LessonStage[] = [];
  const lessonId = generated.id;

  // ── Vocabulary stage ──
  const vocabItems = generated.learn.vocab.map(adaptVocab);
  if (vocabItems.length > 0) {
    stages.push({
      id: `${lessonId}-vocab`,
      type: "vocabulary",
      title: "Vocabulary",
      ptTitle: "Vocabulário",
      description: "Tap each card to reveal the English meaning.",
      items: vocabItems,
    });
  }

  // ── Verb stages (one per verb, each tense as separate VerbItem) ──
  const verbItems = generated.learn.verbs.flatMap(adaptVerb);
  for (let i = 0; i < verbItems.length; i++) {
    const v = verbItems[i];
    stages.push({
      id: `${lessonId}-verb-${i}`,
      type: "verb",
      title: `Verb: ${v.verb}`,
      ptTitle: `Verbo: ${v.verb}`,
      description: `Conjugation of '${v.verb}' (${v.verbTranslation}).`,
      verbs: [v],
    });
  }

  // ── Grammar stages ──
  const grammarItems = generated.learn.grammar.map(adaptGrammar);
  for (const g of grammarItems) {
    stages.push({
      id: `${lessonId}-grammar-${g.topicSlug}`,
      type: "grammar",
      title: g.topicTitle,
      ptTitle: g.topicTitle,
      description: "Review the rule and examples.",
      grammarItems: [g],
    });
  }

  // ── Practice stage (generated from vocab/verb examples) ──
  const practiceItems = generatePracticeFromContent(generated);
  if (practiceItems.length > 0) {
    stages.push({
      id: `${lessonId}-practice`,
      type: "practice",
      title: "Quick Practice",
      ptTitle: "Prática Rápida",
      description: "Fill in the missing word.",
      practiceItems,
    });
  }

  const lesson: Lesson = {
    id: lessonId,
    title: buildTitle(generated),
    ptTitle: buildTitlePt(generated),
    description: buildDescription(generated),
    cefr: generated.cefr,
    estimatedMinutes: 20,
    order: 0, // dynamic lessons don't have a fixed order
    stages,
  };

  // Collect all practice items for mastery tracking
  const allPracticeItems = [
    ...generated.practice.newContentItems,
    ...generated.practice.reviewItems,
    ...generated.practice.spotCheckItems,
    ...generated.practice.carryForwardItems,
  ];

  return { lesson, practiceItems: allPracticeItems };
}

/**
 * Convert a ReviewSession into the Lesson shape.
 * Skips learn phase — all items go straight to practice.
 */
export function adaptReviewSession(review: ReviewSession): {
  lesson: Lesson;
  practiceItems: PracticeItem[];
} {
  const stages: LessonStage[] = [];
  const lessonId = review.id;

  // Extract content by type
  const vocabItems = review.items
    .filter((i) => i.contentType === "vocab")
    .map((i) => adaptVocab(i.data as PoolVocabItem));

  const verbItems = review.items
    .filter((i) => i.contentType === "verb")
    .flatMap((i) => adaptVerb(i.data as PoolVerbItem));

  const grammarItems = review.items
    .filter((i) => i.contentType === "grammar")
    .map((i) => adaptGrammar(i.data as PoolGrammarItem));

  // Build stages for the exercise engine
  if (vocabItems.length > 0) {
    stages.push({
      id: `${lessonId}-vocab`,
      type: "vocabulary",
      title: "Review: Vocabulary",
      ptTitle: "Revisão: Vocabulário",
      description: "Words due for review.",
      items: vocabItems,
    });
  }

  for (let i = 0; i < verbItems.length; i++) {
    const v = verbItems[i];
    stages.push({
      id: `${lessonId}-verb-${i}`,
      type: "verb",
      title: `Review: ${v.verb}`,
      ptTitle: `Revisão: ${v.verb}`,
      description: `Conjugation review.`,
      verbs: [v],
    });
  }

  for (const g of grammarItems) {
    stages.push({
      id: `${lessonId}-grammar-${g.topicSlug}`,
      type: "grammar",
      title: `Review: ${g.topicTitle}`,
      ptTitle: `Revisão: ${g.topicTitle}`,
      description: "Grammar review.",
      grammarItems: [g],
    });
  }

  // Build practice from review items
  const practiceFromVocab = vocabItems
    .filter((v) => v.example.pt && v.word)
    .map((v, i) => buildPracticeFromVocab(v, i, lessonId));
  if (practiceFromVocab.length > 0) {
    stages.push({
      id: `${lessonId}-practice`,
      type: "practice",
      title: "Review Practice",
      ptTitle: "Prática de Revisão",
      description: "Fill in the missing word.",
      practiceItems: practiceFromVocab,
    });
  }

  const lesson: Lesson = {
    id: lessonId,
    title: "Review Session",
    ptTitle: "Sessão de Revisão",
    description: `${review.totalItems} items to review`,
    cefr: "A1", // mixed levels, but exercise engine needs a value
    estimatedMinutes: 15,
    order: 0,
    stages,
  };

  // Map review items to PracticeItem shape for mastery tracking
  const allPracticeItems: PracticeItem[] = review.items.map((item) => ({
    contentType: item.contentType,
    contentId: item.contentId,
    contentCefr: item.contentCefr,
    contentCategory: item.contentCategory,
    isHighFrequency: item.isHighFrequency,
    data: item.data,
  }));

  return { lesson, practiceItems: allPracticeItems };
}

// ─── Content Converters ─────────────────────────────────

/** PoolVocabItem → VocabItem (what the exercise engine expects) */
function adaptVocab(pool: PoolVocabItem): VocabItem {
  return {
    id: `vocab-${pool.category}-${pool.portuguese.replace(/\s/g, "-")}`,
    word: pool.portuguese,
    translation: pool.english,
    pronunciation: pool.pronunciation ? `/${pool.pronunciation}/` : "",
    example: { pt: pool.example, en: pool.exampleTranslation },
  };
}

/** PoolVerbItem → VerbItem[] (one per tense with conjugations) */
function adaptVerb(pool: PoolVerbItem): VerbItem[] {
  // Group conjugations by tense
  const byTense = new Map<string, Array<{ pronoun: string; form: string }>>();

  const PERSON_TO_PRONOUN: Record<string, string> = {
    "eu (I)": "eu",
    "tu (you singular)": "tu",
    "ele/ela/você (he/she/you formal)": "ele/ela",
    "nós (we)": "nós",
    "eles/elas/vocês (they/you plural formal)": "eles/elas",
  };

  for (const c of pool.conjugations) {
    const tense = c.Tense;
    if (!byTense.has(tense)) byTense.set(tense, []);
    byTense.get(tense)!.push({
      pronoun: PERSON_TO_PRONOUN[c.Person] ?? c.Person.split(" ")[0],
      form: c.Conjugation,
    });
  }

  const slug = pool.key.toLowerCase();
  const items: VerbItem[] = [];

  for (const [tense, conjugations] of byTense) {
    items.push({
      id: `verb-${slug}-${tense}`,
      verb: slug,
      verbTranslation: pool.english,
      tense,
      conjugations,
      verbSlug: slug,
    });
  }

  return items;
}

/** PoolGrammarItem → GrammarItem (what the exercise engine expects) */
function adaptGrammar(pool: PoolGrammarItem): GrammarItem {
  const firstRule = pool.rules[0];
  return {
    id: `grammar-${pool.id}`,
    rule: firstRule?.rule ?? pool.summary?.slice(0, 200) ?? "",
    rulePt: firstRule?.rulePt ?? "",
    examples: firstRule?.examples ?? [],
    topicSlug: pool.id,
    topicTitle: pool.title,
  };
}

// ─── Practice Sentence Generation ───────────────────────

/**
 * Auto-generate fill-in-the-blank practice sentences from vocab examples.
 */
function generatePracticeFromContent(
  generated: GeneratedLesson
): LessonPracticeItem[] {
  const sentences: LessonPracticeItem[] = [];
  const lessonId = generated.id;

  // From vocab example sentences
  for (const v of generated.learn.vocab) {
    if (!v.example || !v.exampleTranslation) continue;
    const item = buildPracticeFromPoolVocab(v, sentences.length, lessonId);
    if (item) sentences.push(item);
  }

  // Cap at 8 practice sentences
  return shuffleArray(sentences).slice(0, 8);
}

function buildPracticeFromPoolVocab(
  v: PoolVocabItem,
  index: number,
  lessonId: string
): LessonPracticeItem | null {
  const word = v.portuguese.split(" / ")[0].split(" (")[0].trim();
  if (!v.example.includes(word)) return null;

  return {
    id: `${lessonId}-practice-${index}`,
    sentence: v.example.replace(word, "___"),
    answer: word,
    fullSentence: v.example,
    translation: v.exampleTranslation,
    acceptedAnswers: [word],
  };
}

function buildPracticeFromVocab(
  v: VocabItem,
  index: number,
  lessonId: string
): LessonPracticeItem {
  const word = v.word.split(" / ")[0].split(" (")[0].trim();
  const hasBlanked = v.example.pt.includes(word);

  return {
    id: `${lessonId}-practice-${index}`,
    sentence: hasBlanked ? v.example.pt.replace(word, "___") : `___ ${v.example.pt}`,
    answer: word,
    fullSentence: v.example.pt,
    translation: v.example.en,
    acceptedAnswers: [word],
  };
}

// ─── Title Helpers ──────────────────────────────────────

function buildTitle(g: GeneratedLesson): string {
  const parts: string[] = [];
  if (g.newCount > 0) parts.push(`${g.newCount} new`);
  if (g.reviewCount > 0) parts.push(`${g.reviewCount} review`);
  if (g.spotCheckCount > 0) parts.push(`${g.spotCheckCount} spot-check`);
  return `Practice: ${parts.join(" · ")}`;
}

function buildTitlePt(g: GeneratedLesson): string {
  const parts: string[] = [];
  if (g.newCount > 0) parts.push(`${g.newCount} novos`);
  if (g.reviewCount > 0) parts.push(`${g.reviewCount} revisão`);
  if (g.spotCheckCount > 0) parts.push(`${g.spotCheckCount} verificação`);
  return `Prática: ${parts.join(" · ")}`;
}

function buildDescription(g: GeneratedLesson): string {
  return `${g.totalItems} items · ${g.cefr} level`;
}

// ─── Utility ────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
