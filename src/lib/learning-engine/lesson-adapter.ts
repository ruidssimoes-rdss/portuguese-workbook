/**
 * Learning Engine — Lesson Adapter
 *
 * Transforms a GeneratedLesson (from the learning engine) into the exact
 * Lesson shape the exercise engine expects.
 *
 * Two outputs:
 *   lesson        — new content, shown in the learn phase and then exercised
 *   exerciseOnly  — review / spot-check / carry-forward content, exercised
 *                   but never shown in the learn phase
 *
 * CRITICAL: Verb handling groups all persons for a given verb+tense into
 * ONE conjugation drill stage. Never flatten into individual rows.
 */

import type { Lesson, LessonStage, VocabItem, VerbItem, GrammarItem } from "@/data/lessons";
import type { ExerciseOnlyContent, AttributedPracticeItem, ContentRef } from "@/lib/exercise-types";
import type { GeneratedLesson, PracticeItem } from "./lesson-generator";
import type { ReviewSession } from "./review-generator";
import type { PoolVocabItem, PoolVerbItem, PoolGrammarItem } from "./content-pool";
import type { CEFRLevel } from "./mastery-tracker";

// ─── CEFR tense allowlists ─────────────────────────────

const TENSE_CEFR_LEVELS: Record<string, string[]> = {
  A1: ["A1"],
  A2: ["A1", "A2"],
  B1: ["A1", "A2", "B1"],
};

const MAX_TENSES_PER_VERB: Record<string, number> = {
  A1: 1,
  A2: 2,
  B1: 2,
};

const MAX_VERBS: Record<string, number> = {
  A1: 4,
  A2: 3,
  B1: 3,
};

const PERSON_TO_PRONOUN: Record<string, string> = {
  "eu (I)": "eu",
  "tu (you singular)": "tu",
  "ele/ela/você (he/she/you formal)": "ele/ela",
  "nós (we)": "nós",
  "eles/elas/vocês (they/you plural formal)": "eles/elas",
};

// ─── Types ──────────────────────────────────────────────

export interface AdaptedLesson {
  lesson: Lesson;
  /** Every pool item this session can test (new + review + spot-check + carry-forward) */
  practiceItems: PracticeItem[];
  /** Content exercised but never shown in the learn phase */
  exerciseOnly: ExerciseOnlyContent;
}

export interface AdaptOptions {
  /**
   * The user's real lesson number (completed lessons + 1). Drives
   * getDifficulty — foundation / building / consolidating.
   */
  order?: number;
}

// ─── Adapt Generated Lesson → Lesson ────────────────────

export function adaptGeneratedLesson(
  generated: GeneratedLesson,
  options: AdaptOptions = {}
): AdaptedLesson {
  const stages: LessonStage[] = [];
  const lessonId = generated.id;
  const cefr = generated.cefr;

  // ── Vocabulary: ONE stage with all words ──
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

  // ── Verbs: ONE stage per verb+tense, CEFR-filtered, capped ──
  const verbItems = adaptVerbsGrouped(generated.learn.verbs, cefr);
  stages.push(...verbItemsToStages(verbItems, lessonId));

  // ── Grammar: ONE stage per topic ──
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

  // ── Practice: ONE stage with fill-in-blank sentences from new vocab ──
  const practiceItems = buildPracticeSentences(generated.learn.vocab, lessonId, "practice");
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
    title: "Your next lesson",
    ptTitle: "Your next lesson",
    description: `${generated.totalItems} items · ${generated.cefr} level`,
    cefr,
    estimatedMinutes: 20,
    order: options.order ?? 1,
    stages,
  };

  // ── Review / spot-check / carry-forward: exercises only, never learn phase ──
  const reviewPool = [
    ...generated.practice.reviewItems,
    ...generated.practice.spotCheckItems,
    ...generated.practice.carryForwardItems,
  ];
  const exerciseOnly = practiceItemsToExerciseContent(reviewPool, cefr, lessonId);

  const allPracticeItems = [...generated.practice.newContentItems, ...reviewPool];

  return { lesson, practiceItems: allPracticeItems, exerciseOnly };
}

// ─── Review Session Adapter ─────────────────────────────

/**
 * A review session has no learn phase at all: every item is exercised
 * directly. The lesson shell is empty; all content is exercise-only.
 */
export function adaptReviewSession(
  review: ReviewSession,
  options: AdaptOptions = {}
): AdaptedLesson {
  const lessonId = review.id;

  const allPracticeItems: PracticeItem[] = review.items.map((item) => ({
    contentType: item.contentType,
    contentId: item.contentId,
    contentCefr: item.contentCefr,
    contentCategory: item.contentCategory,
    isHighFrequency: item.isHighFrequency,
    data: item.data,
  }));

  // Reviews span levels — use the A2 tense allowlist for broad coverage
  const exerciseOnly = practiceItemsToExerciseContent(allPracticeItems, "A2", lessonId);

  const lesson: Lesson = {
    id: lessonId,
    title: "Review Session",
    ptTitle: "Review Session",
    description: `${review.totalItems} items to review`,
    cefr: "A1",
    estimatedMinutes: 15,
    order: options.order ?? 1,
    stages: [],
  };

  return { lesson, practiceItems: allPracticeItems, exerciseOnly };
}

// ─── Practice items → exercise-only content ─────────────

function practiceItemsToExerciseContent(
  items: PracticeItem[],
  cefr: CEFRLevel,
  lessonId: string
): ExerciseOnlyContent {
  const vocabPool = items
    .filter((i) => i.contentType === "vocab")
    .map((i) => i.data as PoolVocabItem);
  const verbPool = items
    .filter((i) => i.contentType === "verb")
    .map((i) => i.data as PoolVerbItem);
  const grammarPool = items
    .filter((i) => i.contentType === "grammar")
    .map((i) => i.data as PoolGrammarItem);

  return {
    vocabItems: vocabPool.map(adaptVocab),
    verbItems: adaptVerbsGrouped(verbPool, cefr),
    grammarItems: grammarPool.map(adaptGrammar),
    practiceItems: buildPracticeSentences(vocabPool, lessonId, "review-practice"),
  };
}

// ─── Verb grouping (the critical fix) ───────────────────

/**
 * Convert PoolVerbItems into grouped VerbItems.
 * Each VerbItem = one verb + one tense, with ALL persons as a single drill.
 *
 * Filters tenses by CEFR level, caps tenses per verb and total verbs.
 */
function adaptVerbsGrouped(verbs: PoolVerbItem[], cefr: CEFRLevel): VerbItem[] {
  const allowedCEFRs = TENSE_CEFR_LEVELS[cefr] || ["A1"];
  const maxTenses = MAX_TENSES_PER_VERB[cefr] || 1;
  const maxVerbs = MAX_VERBS[cefr] || 4;

  const selectedVerbs = verbs.slice(0, maxVerbs);
  const items: VerbItem[] = [];

  for (const pool of selectedVerbs) {
    // Group conjugations by tense, filtering to allowed CEFR levels
    const byTense = new Map<string, Array<{ pronoun: string; form: string }>>();

    for (const c of pool.conjugations) {
      // Access the CEFR (Tense) field that exists at runtime
      const tenseCefr = (c as Record<string, string>)["CEFR (Tense)"];
      if (!tenseCefr || !allowedCEFRs.includes(tenseCefr)) continue;

      const tense = c.Tense;
      if (!byTense.has(tense)) byTense.set(tense, []);
      byTense.get(tense)!.push({
        pronoun: PERSON_TO_PRONOUN[c.Person] ?? c.Person.split(" ")[0],
        form: c.Conjugation,
      });
    }

    const tenseEntries = [...byTense.entries()].slice(0, maxTenses);

    for (const [tense, conjugations] of tenseEntries) {
      const slug = pool.key.toLowerCase();
      items.push({
        id: `verb-${slug}-${tense}`,
        verb: slug,
        verbTranslation: pool.english,
        tense,
        conjugations,
        verbSlug: slug,
      });
    }
  }

  return items;
}

function verbItemsToStages(items: VerbItem[], lessonId: string): LessonStage[] {
  return items.map((verbItem) => ({
    id: `${lessonId}-verb-${verbItem.verbSlug}-${verbItem.tense}`,
    type: "verb" as const,
    title: `Verb: ${verbItem.verbSlug}`,
    ptTitle: `Verbo: ${verbItem.verbSlug}`,
    description: `Conjugation of '${verbItem.verbSlug}' (${verbItem.verbTranslation}).`,
    verbs: [verbItem],
  }));
}

// ─── Content Converters ─────────────────────────────────

function adaptVocab(pool: PoolVocabItem): VocabItem {
  return {
    id: `vocab-${pool.category}-${pool.portuguese.replace(/\s/g, "-")}`,
    word: pool.portuguese,
    translation: pool.english,
    pronunciation: pool.pronunciation ? `/${pool.pronunciation}/` : "",
    example: { pt: pool.example ?? "", en: pool.exampleTranslation ?? "" },
  };
}

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
 * Fill-in-the-blank sentences from vocab example sentences. Each sentence
 * carries a contentRef so an answer can be attributed to the vocab word.
 */
function buildPracticeSentences(
  vocab: PoolVocabItem[],
  lessonId: string,
  idPrefix: string
): AttributedPracticeItem[] {
  const sentences: AttributedPracticeItem[] = [];

  for (const v of vocab) {
    if (!v.example || !v.exampleTranslation) continue;
    const word = v.portuguese.split(" / ")[0].split(" (")[0].trim();
    if (!word || !v.example.includes(word)) continue;
    const contentRef: ContentRef = { contentType: "vocab", contentId: v.portuguese };
    sentences.push({
      id: `${lessonId}-${idPrefix}-${sentences.length}`,
      sentence: v.example.replace(word, "___"),
      answer: word,
      fullSentence: v.example,
      translation: v.exampleTranslation ?? "",
      acceptedAnswers: [word],
      contentRef,
    });
  }

  return shuffleArray(sentences).slice(0, 8);
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
