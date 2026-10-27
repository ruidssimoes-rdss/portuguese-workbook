/**
 * Chapter practice: the item pool for a chapter and the plan for one session.
 * Pure: no React, no window, no audio. The audit imports this file.
 *
 * A chapter file with `practice` gives the written pool. Every other chapter
 * gets a pool generated from its library references (no Traduzir: a reply in
 * the right register cannot be generated from the library).
 */

import type { CurriculumLesson } from "@/data/curriculum-types";
import type { ChapterContent, PracticeItemType } from "@/data/chapter-types";
import { A1_LESSONS, A2_LESSONS, B1_LESSONS, EXTRA_LESSONS } from "@/data/curriculum";
import { getChapterContent } from "@/data/chapters";
import vocabData from "@/data/vocab.json";
import verbsData from "@/data/verbs.json";
import { lessonBundle } from "@/lib/book/elisio";
import { chapterSectionTitles } from "@/lib/chapter-sections";
import { checkPractice, normalizeAnswer } from "@/lib/practice-check";

export interface PracticeItem {
  id: string;
  lessonId: string;
  type: PracticeItemType;
  section: number;
  prompt?: string;
  context?: string;
  line?: string;
  text?: string;
  translation?: string;
  /** Correct tiles then distractors. Not shuffled here. */
  tiles?: string[];
  answer: string;
  accept: string[];
  why: string;
}

export const SESSION_LENGTH = 30;
export const MORE_LENGTH = 10;
export const PRACTICE_TYPES: PracticeItemType[] = ["escrever", "ouvir", "construir", "traduzir"];

const WRITTEN_MIX: Record<PracticeItemType, number> = { escrever: 40, ouvir: 25, construir: 15, traduzir: 20 };
const GENERATED_MIX: Record<PracticeItemType, number> = { escrever: 55, ouvir: 25, construir: 20, traduzir: 0 };

const COURSE: CurriculumLesson[] = [...A1_LESSONS, ...A2_LESSONS, ...B1_LESSONS, ...EXTRA_LESSONS];

// ─── Library strings (Ouvir only plays these) ───

type VocabFile = { categories: { words: { portuguese: string; english: string; example?: string; exampleTranslation?: string }[] }[] };
type VerbsFile = { verbs: Record<string, { conjugations: { "Example Sentence"?: string; "English Translation"?: string }[] }> };

let library: Map<string, string> | null = null;

/** Every vocab word, vocab example and verb example sentence, with its English. */
export function libraryStrings(): Map<string, string> {
  if (library) return library;
  const map = new Map<string, string>();
  const add = (pt: string | undefined, en: string | undefined) => {
    if (!pt || !en || map.has(pt)) return;
    map.set(pt, en);
  };
  for (const cat of (vocabData as VocabFile).categories) {
    for (const word of cat.words) add(word.example, word.exampleTranslation);
  }
  for (const verb of Object.values((verbsData as unknown as VerbsFile).verbs)) {
    for (const row of verb.conjugations ?? []) add(row["Example Sentence"], row["English Translation"]);
  }
  for (const cat of (vocabData as VocabFile).categories) {
    for (const word of cat.words) add(word.portuguese, word.english);
  }
  library = map;
  return map;
}

// ─── Pools ───

type Draft = Omit<PracticeItem, "id" | "lessonId">;

function slug(text: string): string {
  return normalizeAnswer(text).replace(/ /g, "-");
}

function withIds(lessonId: string, drafts: Draft[]): PracticeItem[] {
  const used = new Map<string, number>();
  return drafts.map((draft) => {
    const base = `${lessonId}:${draft.type}:${slug(draft.type === "ouvir" ? (draft.text ?? draft.answer) : draft.answer)}`;
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    return { ...draft, id: n === 1 ? base : `${base}-${n}`, lessonId };
  });
}

function sansArticle(text: string): string | null {
  const m = text.match(/^(o|a|os|as|um|uma)\s+(.+)$/i);
  return m ? m[2] : null;
}

function firstPronoun(person: string): string {
  return person.replace(/\s*\([^)]*\)/g, "").split("/")[0].trim();
}

const PRONOUNS = new Set(["eu", "tu", "ele", "ela", "nós", "vós", "eles", "elas", "você", "vocês", "me", "te", "se", "nos", "lhe", "lhes"]);

function words(text: string): string[] {
  return text
    .split(/\s+/)
    .map((token) => token.replace(/[.,!?¿¡;:…«»"()]/g, ""))
    .filter(Boolean);
}

function writtenPool(lesson: CurriculumLesson, content: ChapterContent): PracticeItem[] {
  const lib = libraryStrings();
  const drafts: Draft[] = (content.practice ?? []).map((item) => {
    switch (item.type) {
      case "escrever":
        return { type: "escrever", section: item.section, prompt: item.prompt, answer: item.answer, accept: item.accept ?? [], why: item.why };
      case "ouvir":
        return { type: "ouvir", section: item.section, text: item.text, translation: lib.get(item.text), answer: item.text, accept: [], why: item.why };
      case "construir":
        return {
          type: "construir",
          section: item.section,
          prompt: item.prompt,
          tiles: [...item.tiles, ...item.distractors],
          answer: item.answer,
          accept: item.accept ?? [],
          why: item.why,
        };
      case "traduzir":
        return { type: "traduzir", section: item.section, context: item.context, line: item.line, answer: item.answer, accept: item.accept ?? [], why: item.why };
    }
  });
  return withIds(lesson.id, drafts);
}

function generatedPool(lesson: CurriculumLesson): PracticeItem[] {
  const bundle = lessonBundle(lesson);
  const titles = chapterSectionTitles(lesson, null);
  const sectionOf = (title: string | undefined) => (title && titles.includes(title) ? titles.indexOf(title) + 1 : 1);
  const vocabSection = sectionOf("Vocabulário");
  const verbSection = sectionOf("Verbos (presente)");
  const gapSection = bundle.topics[0] ? sectionOf(bundle.topics[0].titlePt) : vocabSection;
  const lib = libraryStrings();
  const drafts: Draft[] = [];

  // Escrever · word
  const glossCount = new Map<string, number>();
  for (const word of bundle.words) {
    const key = word.english.trim().toLowerCase();
    glossCount.set(key, (glossCount.get(key) ?? 0) + 1);
  }
  for (const word of bundle.words) {
    if (/\.\.\.|…/.test(word.portuguese)) continue;
    if ((glossCount.get(word.english.trim().toLowerCase()) ?? 0) > 1) continue;
    const forms = new Set<string>();
    const halves = word.portuguese.includes("/") ? word.portuguese.split(/\s*\/\s*/).filter(Boolean) : [];
    for (const half of halves) forms.add(half);
    for (const form of [word.portuguese, ...halves]) {
      const bare = sansArticle(form);
      if (bare) forms.add(bare);
    }
    forms.delete(word.portuguese);
    drafts.push({
      type: "escrever",
      section: vocabSection,
      prompt: word.english,
      answer: word.portuguese,
      // The old lists were accent-tolerant; practice is strict, so accent-only variants are slips, not alternatives.
      accept: [...forms].filter((form) => checkPractice(form, word.portuguese).verdict === "wrong"),
      why: word.example ? `Example: ${word.example}` : `${word.portuguese}: ${word.english}.`,
    });
  }

  // Escrever · verb form
  const refs = lesson.stages.verbs.verbs;
  const examples: { pt: string; section: number }[] = [];
  for (const verb of bundle.verbs) {
    const tense = refs.find((ref) => ref.verbKey.toLowerCase() === verb.id)?.tenses[0] ?? "Present";
    const rows = verb.rows(tense);
    for (const row of rows) {
      const form = row.form.trim();
      if (rows.some((other) => other !== row && other.form.trim().toLowerCase() === form.toLowerCase())) continue;
      const pronoun = firstPronoun(row.person);
      drafts.push({
        type: "escrever",
        section: verbSection,
        prompt: `${verb.id} (${verb.english}) · ${pronoun}`,
        answer: form,
        accept: [],
        why: `${pronoun} ${form}. ${row.example ?? ""}`.trim(),
      });
    }
    for (const row of rows) if (row.example) examples.push({ pt: row.example, section: verbSection });
  }

  // Escrever · gap
  for (const sentence of lesson.stages.practice.sentences) {
    drafts.push({
      type: "escrever",
      section: gapSection,
      prompt: `${sentence.sentenceEn} · ${sentence.sentencePt}`,
      answer: sentence.correctAnswer,
      // The old lists were accent-tolerant; practice is strict, so accent-only variants are slips, not alternatives.
      accept: (sentence.acceptedAnswers ?? []).filter((form) => checkPractice(form, sentence.correctAnswer).verdict === "wrong"),
      why: sentence.sentencePt.replace(/___/g, sentence.correctAnswer),
    });
  }

  // Ouvir and Construir from the library example sentences
  const sentences: { pt: string; en: string; section: number }[] = [];
  const seen = new Set<string>();
  const wordExamples = bundle.words.filter((word) => word.example).map((word) => ({ pt: word.example as string, section: vocabSection }));
  for (const example of [...wordExamples, ...examples]) {
    const en = lib.get(example.pt);
    if (!en || seen.has(example.pt)) continue;
    seen.add(example.pt);
    sentences.push({ pt: example.pt, en, section: example.section });
  }
  for (const sentence of sentences) {
    const n = words(sentence.pt).length;
    if (n >= 2 && n <= 9) {
      drafts.push({ type: "ouvir", section: sentence.section, text: sentence.pt, translation: sentence.en, answer: sentence.pt, accept: [], why: sentence.en });
    }
  }
  sentences.forEach((sentence, i) => {
    const tiles = words(sentence.pt);
    if (tiles.length < 3 || tiles.length > 8) return;
    const own = new Set(tiles.map(normalizeAnswer));
    const distractors: string[] = [];
    for (let k = 1; k < sentences.length && distractors.length < 2; k++) {
      const other = sentences[(i + k) % sentences.length];
      for (const word of words(other.pt)) {
        const key = normalizeAnswer(word);
        // Pronouns and short function words could form a valid sentence of their own, so they never act as traps.
        if (key.length < 3 || PRONOUNS.has(key) || own.has(key) || distractors.some((d) => normalizeAnswer(d) === key)) continue;
        distractors.push(word);
        break;
      }
    }
    if (distractors.length < 2) return;
    drafts.push({
      type: "construir",
      section: sentence.section,
      prompt: sentence.en,
      tiles: [...tiles, ...distractors],
      answer: sentence.pt,
      accept: [],
      why: sentence.en,
    });
  });

  return withIds(lesson.id, drafts);
}

const poolCache = new Map<string, PracticeItem[]>();

/** The chapter's written pool, or the pool generated from its library refs. */
export function chapterPool(lesson: CurriculumLesson, content: ChapterContent | null): PracticeItem[] {
  const written = Boolean(content?.practice?.length);
  const key = `${lesson.id}:${written ? "w" : "g"}`;
  const cached = poolCache.get(key);
  if (cached) return cached;
  const pool = written && content ? writtenPool(lesson, content) : generatedPool(lesson);
  poolCache.set(key, pool);
  return pool;
}

function lessonById(id: string): CurriculumLesson | undefined {
  return COURSE.find((lesson) => lesson.id === id);
}

/** Looks an item up by its id prefix. Null when the id no longer resolves. */
export function resolveItem(id: string): PracticeItem | null {
  const lessonId = id.split(":")[0];
  const lesson = lessonById(lessonId);
  if (!lesson) return null;
  return chapterPool(lesson, getChapterContent(lessonId)).find((item) => item.id === id) ?? null;
}

/** Item counts by type, for the audit. */
export function practicePools(lesson: CurriculumLesson): Record<PracticeItemType, number> {
  const counts: Record<PracticeItemType, number> = { escrever: 0, ouvir: 0, construir: 0, traduzir: 0 };
  for (const item of chapterPool(lesson, getChapterContent(lesson.id))) counts[item.type]++;
  return counts;
}

/** Earlier chapters of the same level, in course order. `ordered` is the course order (orderLessons). A1.1 gives []. */
export function reviewPool(lesson: CurriculumLesson, ordered: CurriculumLesson[]): PracticeItem[] {
  const at = ordered.findIndex((item) => item.id === lesson.id);
  if (at <= 0) return [];
  return ordered
    .slice(0, at)
    .filter((item) => item.cefrLevel === lesson.cefrLevel)
    .flatMap((item) => chapterPool(item, getChapterContent(item.id)));
}

// ─── Session plan ───

function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Largest remainder: counts that add up to `total`, in proportion to `weights`. */
export function mixCounts(weights: Record<PracticeItemType, number>, total: number): Record<PracticeItemType, number> {
  const sum = PRACTICE_TYPES.reduce((acc, type) => acc + weights[type], 0) || 1;
  const raw = PRACTICE_TYPES.map((type) => ({ type, exact: (weights[type] * total) / sum }));
  const counts = Object.fromEntries(raw.map(({ type, exact }) => [type, Math.floor(exact)])) as Record<PracticeItemType, number>;
  let left = total - PRACTICE_TYPES.reduce((acc, type) => acc + counts[type], 0);
  const order = [...raw].sort((a, b) => b.exact - Math.floor(b.exact) - (a.exact - Math.floor(a.exact)) || PRACTICE_TYPES.indexOf(a.type) - PRACTICE_TYPES.indexOf(b.type));
  for (const { type } of order) {
    if (left <= 0) break;
    if (weights[type] === 0) continue;
    counts[type]++;
    left--;
  }
  return counts;
}

export function isWritten(lesson: CurriculumLesson): boolean {
  return Boolean(getChapterContent(lesson.id)?.practice?.length);
}

export function planSession(args: {
  lesson: CurriculumLesson;
  pool: PracticeItem[];
  review: PracticeItem[];
  missed: string[];
  seen: string[];
  length: number;
  rand?: () => number;
}): PracticeItem[] {
  const { lesson, pool, review, missed, seen, length } = args;
  const rand = args.rand ?? Math.random;
  const mix = isWritten(lesson) ? WRITTEN_MIX : GENERATED_MIX;

  let reviewSlots = review.length > 0 ? Math.round(length * 0.2) : 0;
  let chapterSlots = length - reviewSlots;
  if (pool.length < 20 && length >= SESSION_LENGTH) chapterSlots = pool.length;
  chapterSlots = Math.min(chapterSlots, pool.length);
  reviewSlots = Math.min(reviewSlots, review.length);

  const chosen: PracticeItem[] = [];
  const answers = new Set<string>();
  const ids = new Set<string>();
  const take = (item: PracticeItem): boolean => {
    const key = normalizeAnswer(item.answer);
    if (ids.has(item.id) || answers.has(key)) return false;
    ids.add(item.id);
    answers.add(key);
    chosen.push(item);
    return true;
  };

  const missedRank = new Map(missed.map((id, i) => [id, i]));
  const seenRank = new Map<string, number>();
  seen.forEach((id, i) => seenRank.set(id, i)); // later index = seen more recently
  const ordered = (items: PracticeItem[]) => {
    const fromMissed = items.filter((item) => missedRank.has(item.id)).sort((a, b) => (missedRank.get(a.id) ?? 0) - (missedRank.get(b.id) ?? 0));
    const rest = items.filter((item) => !missedRank.has(item.id));
    const unseen = shuffle(rest.filter((item) => !seenRank.has(item.id)), rand);
    const old = rest.filter((item) => seenRank.has(item.id)).sort((a, b) => (seenRank.get(a.id) ?? 0) - (seenRank.get(b.id) ?? 0));
    return [...fromMissed, ...unseen, ...old];
  };

  // Chapter part
  const quota = mixCounts(mix, chapterSlots);
  const queues = Object.fromEntries(PRACTICE_TYPES.map((type) => [type, ordered(pool.filter((item) => item.type === type))])) as Record<PracticeItemType, PracticeItem[]>;
  const fill = (type: PracticeItemType, want: number): number => {
    let got = 0;
    const queue = queues[type];
    while (got < want && queue.length > 0) {
      if (take(queue.shift() as PracticeItem)) got++;
    }
    return got;
  };
  let short = 0;
  for (const type of PRACTICE_TYPES) short += quota[type] - fill(type, quota[type]);
  for (const type of PRACTICE_TYPES) {
    if (short <= 0) break;
    short -= fill(type, short);
  }

  // Review part: earlier chapters' missed first, then random
  const reviewMissed = review.filter((item) => missedRank.has(item.id)).sort((a, b) => (missedRank.get(a.id) ?? 0) - (missedRank.get(b.id) ?? 0));
  const reviewRest = shuffle(review.filter((item) => !missedRank.has(item.id)), rand);
  let reviewGot = 0;
  for (const item of [...reviewMissed, ...reviewRest]) {
    if (reviewGot >= reviewSlots) break;
    if (take(item)) reviewGot++;
  }

  // Missed items lead; everything else is shuffled so review spreads through the set.
  const lead = shuffle(chosen.filter((item) => missedRank.has(item.id)), rand);
  const body = shuffle(chosen.filter((item) => !missedRank.has(item.id)), rand);
  const out = [...lead, ...body];
  // No run of 3 of the same type: swap the third with the next item of another type.
  for (let i = Math.max(2, lead.length); i < out.length; i++) {
    if (out[i].type !== out[i - 1].type || out[i].type !== out[i - 2].type) continue;
    const j = out.findIndex((item, k) => k > i && item.type !== out[i].type);
    if (j < 0) break;
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
