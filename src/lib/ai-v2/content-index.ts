/**
 * Content Index — in-memory index of all available content from JSON data files.
 * Built once, cached. Used by the AI planner to know what's available
 * and by the plan-to-blocks adapter to resolve content IDs to real data.
 */

import vocabData from "@/data/vocab.json";
import verbsData from "@/data/verbs.json";
import grammarData from "@/data/grammar.json";
import sayingsData from "@/data/sayings.json";
import etiquetteData from "@/data/etiquette.json";
import falseFriendsData from "@/data/false-friends.json";

import type { VocabItem, VerbItem, GrammarItem, CultureItem } from "@/data/lessons";

// ── Typed casts ────────────────────────────────────────────

const vocab = vocabData as {
  categories: Array<{
    id: string;
    title: string;
    words: Array<{
      portuguese: string;
      english: string;
      cefr: string;
      gender?: string | null;
      pronunciation: string;
      example: string;
      exampleTranslation: string;
    }>;
  }>;
};

const verbs = verbsData as {
  order: string[];
  verbs: Record<
    string,
    {
      meta: { english: string; group: string; cefr: string };
      conjugations: Array<{ Person: string; Tense: string; Conjugation: string }>;
    }
  >;
};

const grammar = grammarData as unknown as {
  topics: Record<
    string,
    {
      id: string;
      title: string;
      titlePt: string;
      cefr: string;
      intro: string;
      rules: Array<{
        rule: string;
        rulePt: string;
        examples: Array<{ pt: string; en: string }>;
      }>;
      tips?: string[];
      tipsPt?: string[];
      questions?: Array<Record<string, unknown>>;
    }
  >;
};

const sayings = sayingsData as {
  sayings: Array<{ id: string; portuguese: string; meaning: string; literal: string; usage: string }>;
};

const etiquette = etiquetteData as {
  tips: Array<{ id: string; titlePt: string; description: string; doThis: string; avoidThis: string }>;
};

const falseFriends = falseFriendsData as {
  falseFriends: Array<{ id: string; portuguese: string; actualMeaning: string; looksLike: string; tip: string }>;
};

const PERSON_TO_PRONOUN: Record<string, string> = {
  "eu (I)": "eu",
  "tu (you singular)": "tu",
  "ele/ela/você (he/she/you formal)": "ele/ela",
  "nós (we)": "nós",
  "eles/elas/vocês (they/you plural formal)": "eles/elas",
};

// ── Inventory type ────────────────────────────────────────

export interface ContentInventory {
  vocab: {
    categories: string[];
    categoriesByCefr: Record<string, string[]>;
    totalWords: number;
  };
  verbs: {
    slugs: string[];
    tenses: string[];
    slugsByCefr: Record<string, string[]>;
    totalVerbs: number;
  };
  grammar: {
    topicSlugs: string[];
    topicsByCefr: Record<string, string[]>;
    totalTopics: number;
  };
  culture: {
    totalItems: number;
  };
}

// ── Cached inventory ──────────────────────────────────────

let _inventory: ContentInventory | null = null;

export function getContentInventory(): ContentInventory {
  if (_inventory) return _inventory;

  // Vocab
  const vocabCategories = vocab.categories.map((c) => c.id);
  const vocabByCefr: Record<string, string[]> = { A1: [], A2: [], B1: [] };
  for (const cat of vocab.categories) {
    const cefrs = new Set(cat.words.map((w) => w.cefr));
    for (const c of cefrs) {
      if (vocabByCefr[c]) vocabByCefr[c].push(cat.id);
    }
  }
  // Deduplicate
  for (const k of Object.keys(vocabByCefr)) {
    vocabByCefr[k] = [...new Set(vocabByCefr[k])];
  }

  // Verbs
  const verbSlugs: string[] = [];
  const verbsByCefr: Record<string, string[]> = { A1: [], A2: [], B1: [] };
  const tenseSet = new Set<string>();
  for (const key of verbs.order) {
    const v = verbs.verbs[key];
    if (!v) continue;
    const slug = key.toLowerCase();
    verbSlugs.push(slug);
    const cefr = v.meta.cefr || "A1";
    if (verbsByCefr[cefr]) verbsByCefr[cefr].push(slug);
    for (const c of v.conjugations) tenseSet.add(c.Tense);
  }

  // Grammar
  const topicSlugs: string[] = [];
  const topicsByCefr: Record<string, string[]> = { A1: [], A2: [], B1: [] };
  for (const [slug, t] of Object.entries(grammar.topics)) {
    topicSlugs.push(slug);
    const cefr = t.cefr || "A1";
    if (topicsByCefr[cefr]) topicsByCefr[cefr].push(slug);
  }

  // Culture
  const totalCulture = (sayings.sayings?.length ?? 0) +
    (etiquette.tips?.length ?? 0) +
    (falseFriends.falseFriends?.length ?? 0);

  _inventory = {
    vocab: {
      categories: vocabCategories,
      categoriesByCefr: vocabByCefr,
      totalWords: vocab.categories.reduce((s, c) => s + c.words.length, 0),
    },
    verbs: {
      slugs: verbSlugs,
      tenses: [...tenseSet],
      slugsByCefr: verbsByCefr,
      totalVerbs: verbSlugs.length,
    },
    grammar: {
      topicSlugs,
      topicsByCefr,
      totalTopics: topicSlugs.length,
    },
    culture: { totalItems: totalCulture },
  };

  return _inventory;
}

// ── Content lookup functions ──────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Get N random vocab items from specific categories, optionally filtered by CEFR */
export function getVocabItems(
  categories: string[],
  cefr?: string,
  count: number = 5,
): VocabItem[] {
  const items: VocabItem[] = [];

  for (const catId of categories) {
    const cat = vocab.categories.find((c) => c.id === catId);
    if (!cat) continue;

    const words = cefr
      ? cat.words.filter((w) => w.cefr === cefr)
      : cat.words;

    for (const w of words) {
      items.push({
        id: `vocab-${catId}-${w.portuguese.replace(/\s/g, "-")}`,
        word: w.portuguese,
        translation: w.english,
        pronunciation: `/${w.pronunciation}/`,
        example: { pt: w.example, en: w.exampleTranslation },
      });
    }
  }

  return shuffle(items).slice(0, count);
}

/** Get verb data by slug and tenses */
export function getVerbItems(slugs: string[], tenses: string[]): VerbItem[] {
  const items: VerbItem[] = [];

  for (const slug of slugs) {
    const key = slug.toUpperCase();
    const v = verbs.verbs[key];
    if (!v) continue;

    for (const tense of tenses) {
      const conjugations = v.conjugations
        .filter((c) => c.Tense === tense)
        .map((c) => ({
          pronoun: PERSON_TO_PRONOUN[c.Person] ?? c.Person.split(" ")[0],
          form: c.Conjugation,
        }));

      if (conjugations.length > 0) {
        items.push({
          id: `verb-${slug}-${tense}`,
          verb: slug,
          verbTranslation: v.meta.english,
          tense,
          conjugations,
          verbSlug: slug,
        });
      }
    }
  }

  return items;
}

/** Get grammar data by topic slug */
export function getGrammarItems(topicSlugs: string[]): GrammarItem[] {
  const items: GrammarItem[] = [];

  for (const slug of topicSlugs) {
    const t = grammar.topics[slug];
    if (!t) continue;

    const firstRule = t.rules?.[0];
    items.push({
      id: `grammar-${slug}`,
      rule: firstRule?.rule ?? t.intro?.slice(0, 200) ?? "",
      rulePt: firstRule?.rulePt ?? "",
      examples: firstRule?.examples ?? [],
      topicSlug: t.id,
      topicTitle: t.title,
    });
  }

  return items;
}

/** Get random culture items */
export function getCultureItems(count: number = 3): CultureItem[] {
  const all: CultureItem[] = [];

  for (const s of sayings.sayings ?? []) {
    all.push({
      id: `culture-${s.id}`,
      expression: s.portuguese,
      meaning: s.meaning,
      literal: s.literal,
      tip: s.usage,
    });
  }

  for (const e of etiquette.tips ?? []) {
    all.push({
      id: `culture-${e.id}`,
      expression: e.titlePt,
      meaning: e.description,
      literal: "",
      tip: `${e.doThis} ${e.avoidThis}`,
    });
  }

  for (const f of falseFriends.falseFriends ?? []) {
    all.push({
      id: `culture-${f.id}`,
      expression: f.portuguese,
      meaning: f.actualMeaning,
      literal: `${f.looksLike} \u2260 ${f.actualMeaning}`,
      tip: f.tip,
    });
  }

  return shuffle(all).slice(0, count);
}

/** Get grammar topic questions (for exercise generation) */
export function getGrammarQuestions(topicSlug: string) {
  return grammar.topics[topicSlug]?.questions ?? [];
}

/** Get full grammar topic data */
export function getGrammarTopicData(topicSlug: string) {
  return grammar.topics[topicSlug] ?? null;
}
