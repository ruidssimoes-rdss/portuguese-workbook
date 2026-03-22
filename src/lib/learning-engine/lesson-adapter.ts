/**
 * Learning Engine — Lesson Adapter
 *
 * Transforms a GeneratedLesson (from the learning engine) into the exact
 * Lesson shape the existing exercise engine expects.
 *
 * CRITICAL: Verb handling groups all persons for a given verb+tense into
 * ONE conjugation drill stage. Never flatten into individual rows.
 */

import type { Lesson, LessonStage, VocabItem, VerbItem, GrammarItem, PracticeItem as LessonPracticeItem } from "@/data/lessons";
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

// ─── Adapt Generated Lesson → Lesson ────────────────────

export function adaptGeneratedLesson(generated: GeneratedLesson): {
  lesson: Lesson;
  practiceItems: PracticeItem[];
} {
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
  const verbStages = adaptVerbsGrouped(generated.learn.verbs, cefr, lessonId);
  stages.push(...verbStages);

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

  // ── Practice: ONE stage with fill-in-blank sentences ──
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
    cefr,
    estimatedMinutes: 20,
    order: 0,
    stages,
  };

  const allPracticeItems = [
    ...generated.practice.newContentItems,
    ...generated.practice.reviewItems,
    ...generated.practice.spotCheckItems,
    ...generated.practice.carryForwardItems,
  ];

  return { lesson, practiceItems: allPracticeItems };
}

// ─── Verb grouping (the critical fix) ───────────────────

/**
 * Convert PoolVerbItems into grouped verb stages.
 * Each stage = one verb + one tense, with ALL persons as a single drill.
 *
 * Filters tenses by CEFR level, caps tenses per verb and total verbs.
 */
function adaptVerbsGrouped(
  verbs: PoolVerbItem[],
  cefr: CEFRLevel,
  lessonId: string
): LessonStage[] {
  const allowedCEFRs = TENSE_CEFR_LEVELS[cefr] || ["A1"];
  const maxTenses = MAX_TENSES_PER_VERB[cefr] || 1;
  const maxVerbs = MAX_VERBS[cefr] || 4;

  // Cap number of verbs
  const selectedVerbs = verbs.slice(0, maxVerbs);
  const stages: LessonStage[] = [];

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

    // Cap tenses per verb
    const tenseEntries = [...byTense.entries()].slice(0, maxTenses);

    for (const [tense, conjugations] of tenseEntries) {
      const slug = pool.key.toLowerCase();
      const verbItem: VerbItem = {
        id: `verb-${slug}-${tense}`,
        verb: slug,
        verbTranslation: pool.english,
        tense,
        conjugations,
        verbSlug: slug,
      };

      stages.push({
        id: `${lessonId}-verb-${slug}-${tense}`,
        type: "verb",
        title: `Verb: ${slug}`,
        ptTitle: `Verbo: ${slug}`,
        description: `Conjugation of '${slug}' (${pool.english}).`,
        verbs: [verbItem],
      });
    }
  }

  return stages;
}

// ─── Review Session Adapter ─────────────────────────────

export function adaptReviewSession(review: ReviewSession): {
  lesson: Lesson;
  practiceItems: PracticeItem[];
} {
  const stages: LessonStage[] = [];
  const lessonId = review.id;

  // Vocab: one stage
  const vocabItems = review.items
    .filter((i) => i.contentType === "vocab")
    .map((i) => adaptVocab(i.data as PoolVocabItem));
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

  // Verbs: grouped by verb+tense (use A2 allowlist for reviews — broad coverage)
  const verbPools = review.items
    .filter((i) => i.contentType === "verb")
    .map((i) => i.data as PoolVerbItem);
  const verbStages = adaptVerbsGrouped(verbPools, "A2", lessonId);
  stages.push(...verbStages);

  // Grammar
  const grammarItems = review.items
    .filter((i) => i.contentType === "grammar")
    .map((i) => adaptGrammar(i.data as PoolGrammarItem));
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

  // Practice from vocab examples
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
    ptTitle: "Review Session",
    description: `${review.totalItems} items to review`,
    cefr: "A1",
    estimatedMinutes: 15,
    order: 0,
    stages,
  };

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

function generatePracticeFromContent(generated: GeneratedLesson): LessonPracticeItem[] {
  const sentences: LessonPracticeItem[] = [];
  const lessonId = generated.id;

  for (const v of generated.learn.vocab) {
    if (!v.example || !v.exampleTranslation) continue;
    const item = buildPracticeFromPoolVocab(v, sentences.length, lessonId);
    if (item) sentences.push(item);
  }

  return shuffleArray(sentences).slice(0, 8);
}

function buildPracticeFromPoolVocab(
  v: PoolVocabItem, index: number, lessonId: string
): LessonPracticeItem | null {
  const word = v.portuguese.split(" / ")[0].split(" (")[0].trim();
  if (!v.example || !v.example.includes(word)) return null;
  return {
    id: `${lessonId}-practice-${index}`,
    sentence: v.example.replace(word, "___"),
    answer: word,
    fullSentence: v.example,
    translation: v.exampleTranslation ?? "",
    acceptedAnswers: [word],
  };
}

function buildPracticeFromVocab(
  v: VocabItem, index: number, lessonId: string
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
  return `Your next lesson`;
}

function buildTitlePt(g: GeneratedLesson): string {
  return `Your next lesson`;
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
