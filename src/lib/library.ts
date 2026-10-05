/**
 * The reference library as the shell sees it: vocabulary categories and
 * words with stable slugs, grammar topics, verbs, culture sections.
 * Server-only — reads src/data.
 */

import "server-only";

import vocabData from "@/data/vocab.json";
import grammarData from "@/data/grammar.json";
import verbData from "@/data/verbs.json";
import sayingsData from "@/data/sayings.json";
import falseFriendsData from "@/data/false-friends.json";
import etiquetteData from "@/data/etiquette.json";
import regionalData from "@/data/regional.json";
import { A1_LESSONS, A2_LESSONS, B1_LESSONS, EXTRA_LESSONS } from "@/data/curriculum";
import type { VocabData, VocabWord } from "@/types/vocab";
import type { GrammarData } from "@/types/grammar";
import type { VerbDataSet } from "@/types";
import type { ReviewScope } from "@/lib/learning-engine/review-selector";
import type { VocabReviewScope } from "@/lib/learning-engine/session-payload";
import type { ExplorerTree } from "@/lib/shell/types";

const vocab = vocabData as unknown as VocabData;
const grammar = grammarData as unknown as GrammarData;
const verbs = verbData as unknown as VerbDataSet;

// ─── Slugs ──────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Vocabulary ─────────────────────────────────────────

export interface LibraryWord extends VocabWord {
  slug: string;
  categoryId: string;
  categoryTitle: string;
  href: string;
  /** Display form: article + word for nouns ("a saudade") */
  title: string;
}

export interface LibraryCategory {
  id: string;
  title: string;
  description: string;
  href: string;
  words: LibraryWord[];
}

export const REVIEW_FOLDER_HREF = "/vocabulary/a-rever";

function displayTitle(w: VocabWord): string {
  if (w.gender === "f") return `a ${w.portuguese}`;
  if (w.gender === "m") return `o ${w.portuguese}`;
  return w.portuguese;
}

const categories: LibraryCategory[] = vocab.categories.map((c) => {
  const used = new Map<string, number>();
  const href = `/vocabulary/${c.id}`;
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    href,
    words: c.words.map((w) => {
      const base = slugify(w.portuguese) || "palavra";
      const n = (used.get(base) ?? 0) + 1;
      used.set(base, n);
      const slug = n === 1 ? base : `${base}-${n}`;
      return {
        ...w,
        slug,
        categoryId: c.id,
        categoryTitle: c.title,
        href: `${href}/${slug}`,
        title: displayTitle(w),
      };
    }),
  };
});

const categoryById = new Map(categories.map((c) => [c.id, c]));

/** Every word, keyed by its mastery content id (the Portuguese form). First category wins. */
const wordByContentId = new Map<string, LibraryWord>();
for (const c of categories) {
  for (const w of c.words) {
    if (!wordByContentId.has(w.portuguese)) wordByContentId.set(w.portuguese, w);
  }
}

const normalizedWord = new Map<string, LibraryWord>();
for (const w of wordByContentId.values()) {
  const key = normalizeAnswer(w.portuguese);
  if (!normalizedWord.has(key)) normalizedWord.set(key, w);
}

export function getCategories(): LibraryCategory[] {
  return categories;
}

export function getCategory(id: string): LibraryCategory | undefined {
  return categoryById.get(id);
}

export function getWord(categoryId: string, slug: string): LibraryWord | undefined {
  return categoryById.get(categoryId)?.words.find((w) => w.slug === slug);
}

export function getWordByContentId(contentId: string): LibraryWord | undefined {
  return wordByContentId.get(contentId);
}

/** Look a typed answer up as a vocabulary word, ignoring case, accents, articles and punctuation. */
export function findWordByAnswer(answer: string): LibraryWord | undefined {
  return normalizedWord.get(normalizeAnswer(answer));
}

export function normalizeAnswer(text: string): string {
  return slugify(text.replace(/^\s*(o|a|os|as)\s+/i, ""));
}

export const vocabTotal = categories.reduce((n, c) => n + c.words.length, 0);

// ─── Where a word appears ───────────────────────────────

export interface WordLesson {
  id: string;
  number: number;
  title: string;
  cefr: string;
}

const lessonsByWord = new Map<string, WordLesson[]>();
for (const l of [...A1_LESSONS, ...A2_LESSONS, ...B1_LESSONS, ...EXTRA_LESSONS]) {
  for (const w of l.stages.vocabulary.words) {
    const key = `${w.categoryId}|${w.portuguese}`;
    const list = lessonsByWord.get(key) ?? [];
    list.push({ id: l.id, number: l.number, title: l.titlePt || l.title, cefr: l.cefrLevel });
    lessonsByWord.set(key, list);
  }
}

export function lessonsTeaching(word: LibraryWord): WordLesson[] {
  return lessonsByWord.get(`${word.categoryId}|${word.portuguese}`) ?? [];
}

const EUROPEAN_NOTE = /\b(Portugal|Portuguese people|Portugu[eê]s europeu|European Portuguese|Brazil|Brazilian|Lisbon|Porto)\b/i;

/** The word's pro tip, when it is specifically about European Portuguese usage. */
export function europeanNote(word: VocabWord): string | null {
  return word.proTip && EUROPEAN_NOTE.test(word.proTip) ? word.proTip : null;
}

// ─── Grammar, verbs, culture ────────────────────────────

export interface LibraryLeaf {
  id: string;
  label: string;
  href: string;
  meta?: string;
}

export function getGrammarTopics(): LibraryLeaf[] {
  return Object.values(grammar.topics).map((t) => ({
    id: t.id,
    label: t.titlePt || t.title,
    href: `/grammar/${t.id}`,
    meta: t.cefr,
  }));
}

export function getVerbs(): LibraryLeaf[] {
  return verbs.order.map((key) => ({
    id: key,
    label: key.toLowerCase(),
    href: `/conjugations/${key.toLowerCase()}`,
    meta: verbs.verbs[key]?.meta?.cefr,
  }));
}

export const CULTURE_SECTIONS = [
  { tab: "Sayings", label: "Ditados", count: sayingsData.sayings.length },
  { tab: "False friends", label: "Falsos amigos", count: falseFriendsData.falseFriends.length },
  { tab: "Etiquette", label: "Etiqueta", count: etiquetteData.tips.length },
  { tab: "Regional", label: "Regional", count: regionalData.expressions.length },
] as const;

export function getCultureSections(): (LibraryLeaf & { count: number })[] {
  return CULTURE_SECTIONS.map((s) => ({
    id: s.tab,
    label: s.label,
    href: `/culture?tab=${encodeURIComponent(s.tab)}`,
    count: s.count,
  }));
}

// ─── Explorer tree (static part) ────────────────────────

export function getLibraryTree(): ExplorerTree {
  return {
    vocab: {
      total: vocabTotal,
      categories: categories.map((c) => ({ id: c.id, title: c.title, href: c.href, count: c.words.length })),
    },
    grammar: Object.keys(grammar.topics).length,
    verbs: verbs.order.length,
    culture: CULTURE_SECTIONS.reduce((n, s) => n + s.count, 0),
  };
}

// ─── Review scope ───────────────────────────────────────

/** Turn a vocabulary review request into the selector's scope. */
export function resolveVocabScope(scope: VocabReviewScope): ReviewScope {
  const category = scope.category ? categoryById.get(scope.category) : undefined;
  return {
    contentType: "vocab",
    contentIds: category ? category.words.map((w) => w.portuguese) : undefined,
    overdueOnly: scope.overdueOnly || undefined,
  };
}

export function reviewHref(scope: VocabReviewScope): string {
  const params = new URLSearchParams({ mode: "review", scope: "vocab" });
  if (scope.category) params.set("category", scope.category);
  if (scope.overdueOnly) params.set("overdue", "1");
  return `/learn?${params.toString()}`;
}
