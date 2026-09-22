/**
 * Search — server only.
 *
 * Builds a lightweight index once at module load: word, meaning, type and
 * slug per entry (plus a little display metadata). No conjugation tables —
 * verbs are indexed by infinitive and meaning only. Served by /api/search.
 */

import "server-only";

import vocabData from "@/data/vocab.json";
import verbData from "@/data/verbs.json";
import grammarData from "@/data/grammar.json";
import sayingsData from "@/data/sayings.json";
import falseFriendsData from "@/data/false-friends.json";
import etiquetteData from "@/data/etiquette.json";
import regionalData from "@/data/regional.json";
import type { VocabData } from "@/types/vocab";
import type { VerbDataSet } from "@/types";
import type { GrammarData } from "@/types/grammar";
import type { SayingsData } from "@/types/saying";
import type { FalseFriendsData, EtiquetteData, RegionalData } from "@/types/culture";
import type {
  DetectedIntent,
  SearchOutput,
  SearchResult,
  SmartResultCard,
  VerbCardEntry,
} from "./search-types";

export type { DetectedIntent, SearchOutput, SearchResult, SmartResultCard } from "./search-types";

// ─── Normalisation ──────────────────────────────────────

export function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const MIN_QUERY_LENGTH = 2;

// ─── Index ──────────────────────────────────────────────

interface IndexEntry {
  result: SearchResult;
  /** normalised primary text (Portuguese word / infinitive / title) */
  primary: string;
  /** normalised secondary text (meaning / English) */
  secondary: string;
  /** other normalised text worth matching (literal, usage, description…) */
  extra: string[];
  /** verb-only: metadata for smart cards */
  verb?: VerbCardEntry;
}

const CATEGORY_PT_TITLE: Record<string, string> = {
  "greetings-expressions": "Cumprimentos e Expressões",
  "numbers-time": "Números e Tempo",
  "colours-weather": "Cores e Clima",
  "food-drink": "Comida e Bebida",
  "home-rooms": "Casa e Divisões",
  "family-daily-routine": "Família e Rotina Diária",
  "shopping-money": "Compras e Dinheiro",
  "travel-directions": "Viagens e Direções",
  "work-education": "Trabalho e Educação",
  "health-body": "Saúde e Corpo",
  "nature-animals": "Natureza e Animais",
  "emotions-personality": "Emoções e Personalidade",
  "colloquial-slang": "Coloquial e Calão",
  "technology-internet": "Tecnologia e Internet",
  "clothing-appearance": "Roupa e Aparência",
};

function buildIndex(): IndexEntry[] {
  const vocab = vocabData as unknown as VocabData;
  const verbs = verbData as unknown as VerbDataSet;
  const grammar = grammarData as unknown as GrammarData;
  const sayings = (sayingsData as unknown as SayingsData).sayings;
  const falseFriends = (falseFriendsData as unknown as FalseFriendsData).falseFriends;
  const etiquetteTips = (etiquetteData as unknown as EtiquetteData).tips;
  const regionalExpressions = (regionalData as unknown as RegionalData).expressions;

  const entries: IndexEntry[] = [];

  for (const cat of vocab.categories) {
    for (const w of cat.words) {
      entries.push({
        primary: normalizeForSearch(w.portuguese),
        secondary: normalizeForSearch(w.english),
        extra: [],
        result: {
          type: "vocabulary",
          title: w.portuguese,
          subtitle: w.english,
          category: cat.id,
          pronunciation: w.pronunciation,
          href: `/vocabulary/${cat.id}?highlight=${encodeURIComponent(w.portuguese)}`,
          matchField: "portuguese",
          meta: {
            categoryId: cat.id,
            categoryTitle: cat.title,
            categoryTitlePt: CATEGORY_PT_TITLE[cat.id],
            example: w.example,
            exampleTranslation: w.exampleTranslation,
          },
        },
      });
    }
  }

  for (const infinitive of verbs.order) {
    const v = verbs.verbs[infinitive];
    if (!v) continue;
    const href = `/conjugations/${infinitive.toLowerCase()}`;
    entries.push({
      primary: normalizeForSearch(infinitive),
      secondary: normalizeForSearch(v.meta.english),
      extra: [],
      verb: { infinitive, english: v.meta.english, group: v.meta.group, cefr: v.meta.cefr, href },
      result: {
        type: "verb",
        title: infinitive,
        subtitle: `${v.meta.english} (${v.meta.group})`,
        category: v.meta.group,
        href,
        matchField: "infinitive",
        meta: { cefr: v.meta.cefr },
      },
    });
  }

  for (const id of Object.keys(grammar.topics)) {
    const t = grammar.topics[id];
    entries.push({
      primary: normalizeForSearch(t.title),
      secondary: normalizeForSearch(t.titlePt),
      extra: [],
      result: {
        type: "grammar",
        title: t.title,
        subtitle: t.titlePt,
        href: `/grammar/${id}`,
        matchField: "title",
        meta: { summary: t.summary, cefr: t.cefr },
      },
    });
  }

  for (const s of sayings) {
    entries.push({
      primary: normalizeForSearch(s.portuguese),
      secondary: normalizeForSearch(s.meaning),
      extra: [normalizeForSearch(s.literal), normalizeForSearch(s.usage)],
      result: {
        type: "saying",
        title: s.portuguese.length > 60 ? s.portuguese.slice(0, 57) + "..." : s.portuguese,
        subtitle: s.meaning.length > 80 ? s.meaning.slice(0, 77) + "..." : s.meaning,
        href: `/culture?tab=sayings&highlight=${encodeURIComponent(s.id)}`,
        matchField: "portuguese",
        meta: { summary: s.meaning },
      },
    });
  }

  for (const f of falseFriends) {
    entries.push({
      primary: normalizeForSearch(f.portuguese),
      secondary: normalizeForSearch(f.actualMeaning),
      extra: [normalizeForSearch(f.looksLike)],
      result: {
        type: "false_friend",
        title: f.portuguese,
        subtitle: f.actualMeaning,
        pronunciation: f.pronunciation,
        href: `/culture?tab=false-friends&highlight=${encodeURIComponent(f.id)}`,
        matchField: "portuguese",
        meta: { summary: f.tip },
      },
    });
  }

  for (const e of etiquetteTips) {
    entries.push({
      primary: normalizeForSearch(e.title),
      secondary: normalizeForSearch(e.titlePt),
      extra: [normalizeForSearch(e.description)],
      result: {
        type: "etiquette",
        title: e.title,
        subtitle: e.titlePt,
        href: `/culture?tab=etiquette&highlight=${encodeURIComponent(e.id)}`,
        matchField: "title",
        meta: { summary: e.description },
      },
    });
  }

  for (const r of regionalExpressions) {
    entries.push({
      primary: normalizeForSearch(r.expression),
      secondary: normalizeForSearch(r.meaning),
      extra: [normalizeForSearch(r.standardAlternative)],
      result: {
        type: "regional",
        title: r.expression,
        subtitle: r.meaning,
        pronunciation: r.pronunciation,
        href: `/culture?tab=regional&highlight=${encodeURIComponent(r.id)}`,
        matchField: "expression",
        meta: { summary: r.standardAlternative },
      },
    });
  }

  return entries;
}

const INDEX: IndexEntry[] = buildIndex();
const GRAMMAR_BY_ID = new Map<string, IndexEntry>(
  INDEX.filter((e) => e.result.type === "grammar").map((e) => [e.result.href.replace("/grammar/", ""), e])
);

// ─── Intent detection ───────────────────────────────────

const TENSE_PATTERNS: { pattern: RegExp; tense: string; label: string }[] = [
  { pattern: /\b(past\s+tense|preterite|pret[eé]rito|passado)\b/i, tense: "Preterite", label: "Pretérito Perfeito" },
  { pattern: /\b(present\s+tense|presente)\b/i, tense: "Present", label: "Presente" },
  { pattern: /\b(future|futuro)\b/i, tense: "Future", label: "Futuro" },
  { pattern: /\b(imperative|imperativo)\b/i, tense: "Imperative", label: "Imperativo" },
  { pattern: /\b(imperfect|imperfeito)\b/i, tense: "Imperfect", label: "Imperfeito" },
  { pattern: /\b(conditional|condicional)\b/i, tense: "Conditional", label: "Condicional" },
  { pattern: /\b(subjunctive|conjuntivo)\b/i, tense: "Present Subjunctive", label: "Presente do Conjuntivo" },
];

const COMPARISON_GRAMMAR_IDS: Record<string, string> = {
  "ser estar": "ser-vs-estar",
  "estar ser": "ser-vs-estar",
  "por para": "prepositions",
  "para por": "prepositions",
};

const VERB_TENSES = ["Present", "Preterite", "Imperfect", "Future", "Conditional", "Present Subjunctive"];

const VERB_QUERY_FILLERS = [/^\s*the\s+verb\s+/i, /^\s*the\s+word\s+/i, /^\s*verb\s+/i, /^\s*o\s+verbo\s+/i, /^\s*a\s+palavra\s+/i];

function cleanVerbQuery(extracted: string): string {
  let s = extracted.trim();
  for (const re of VERB_QUERY_FILLERS) s = s.replace(re, "").trim();
  return s;
}

const TRANSLATION_FILLERS = new Set([
  "im", "i'm", "i", "am", "its", "it's", "it", "is", "the", "a", "an", "some",
  "very", "really", "so", "to", "be", "are", "do", "does", "my", "your",
  "how", "say", "in", "portuguese", "word", "phrase", "me", "please",
]);

function cleanTranslationQuery(extracted: string): string {
  const lower = extracted.trim().toLowerCase().replace(/['']/g, "'");
  const tokens = lower.split(/\s+/).filter((t) => t.length > 0);
  const meaningful = tokens.filter((t) => {
    const w = t.replace(/^["']|["']$/g, "");
    return w.length >= 2 && !TRANSLATION_FILLERS.has(w);
  });
  return meaningful.join(" ").trim() || lower;
}

function extractPhrase(query: string, prefixes: RegExp[]): string {
  const raw = query.trim().toLowerCase();
  for (const re of prefixes) {
    const m = raw.match(re);
    if (m && m[1]) return m[1].trim().replace(/^["']|["']$/g, "");
  }
  return raw;
}

export function detectIntent(query: string): DetectedIntent {
  const q = query.trim();
  const lower = q.toLowerCase();
  if (!q) return { type: "none", extractedQuery: q };

  const vsMatch = lower.match(/\b(.+?)\s+(?:vs\.?|versus)\s+(.+?)$/);
  if (vsMatch) return { type: "comparison", extractedQuery: q, comparisonTerms: [vsMatch[1].trim(), vsMatch[2].trim()] };
  const diffMatch = lower.match(/\b(?:difference\s+between|diferen[cç]a\s+entre)\s+(.+?)\s+(?:and|e)\s+(.+?)$/i);
  if (diffMatch) return { type: "comparison", extractedQuery: q, comparisonTerms: [diffMatch[1].trim(), diffMatch[2].trim()] };

  for (const { pattern, tense } of TENSE_PATTERNS) {
    if (!pattern.test(lower)) continue;
    const ofMatch = lower.match(/\b(?:of|de)\s+(.+?)\s*$/i);
    const term = ofMatch ? ofMatch[1].trim() : lower.replace(pattern, "").replace(/\b(?:of|de)\s*$/i, "").trim();
    const cleaned = cleanVerbQuery(term);
    if (cleaned.length >= 2) return { type: "tense", extractedQuery: cleaned, tense };
  }

  if (/\b(?:conjugate|conjugation\s+of|how\s+to\s+conjugate)\s+(.+?)$/i.test(lower) ||
      /\bconjugar\s+(.+?)$/i.test(lower) ||
      /\bconjuga[cç][aã]o\s+de\s+(.+?)$/i.test(lower)) {
    const term = extractPhrase(q, [
      /(?:conjugate|conjugation\s+of|how\s+to\s+conjugate)\s+(.+?)$/i,
      /conjugar\s+(.+?)$/i,
      /conjuga[cç][aã]o\s+de\s+(.+?)$/i,
    ]);
    const cleaned = cleanVerbQuery(term);
    if (cleaned.length >= 2) return { type: "conjugation", extractedQuery: cleaned };
  }

  if (/\b(?:how\s+do\s+you\s+say|how\s+to\s+say)\s+(.+?)$/i.test(lower) ||
      /\bwhat\s+is\s+(.+?)\s+in\s+portuguese\s*$/i.test(lower) ||
      /\b(.+?)\s+in\s+portuguese\s*$/i.test(lower) ||
      /\bcomo\s+se\s+diz\s+(.+?)$/i.test(lower) ||
      /\bcomo\s+[eé]\s+(.+?)\s+em\s+portugu[eê]s\s*$/i.test(lower)) {
    const term = extractPhrase(q, [
      /(?:how\s+do\s+you\s+say|how\s+to\s+say)\s+(.+?)$/i,
      /what\s+is\s+(.+?)\s+in\s+portuguese\s*$/i,
      /^(.+?)\s+in\s+portuguese\s*$/i,
      /como\s+se\s+diz\s+(.+?)$/i,
      /como\s+[eé]\s+(.+?)\s+em\s+portugu[eê]s\s*$/i,
    ]);
    if (term.length >= 2) return { type: "translation", extractedQuery: term };
  }

  if (/\bwhat\s+does\s+(.+?)\s+mean\s*$/i.test(lower) ||
      /\bmeaning\s+of\s+(.+?)$/i.test(lower) ||
      /\bwhat\s+is\s+(.+?)\s*$/i.test(lower) ||
      /\bo\s+que\s+significa\s+(.+?)$/i.test(lower) ||
      /\bo\s+que\s+[eé]\s+(.+?)$/i.test(lower)) {
    const term = extractPhrase(q, [
      /what\s+does\s+(.+?)\s+mean\s*$/i,
      /meaning\s+of\s+(.+?)$/i,
      /what\s+is\s+(.+?)\s*$/i,
      /o\s+que\s+significa\s+(.+?)$/i,
      /o\s+que\s+[eé]\s+(.+?)$/i,
    ]);
    if (term.length >= 2) return { type: "definition", extractedQuery: term };
  }

  return { type: "none", extractedQuery: q };
}

// ─── Scoring ────────────────────────────────────────────

interface SearchOptions {
  vocabByEnglish?: boolean;
  vocabByPortuguese?: boolean;
  verbOnly?: boolean;
  grammarOnly?: boolean;
}

function scoreEntry(e: IndexEntry, q: string, opts: SearchOptions): number {
  const { primary, secondary, extra } = e;
  switch (e.result.type) {
    case "vocabulary": {
      if (opts.vocabByEnglish) {
        if (primary === q) return 0;
        return secondary === q ? 600 : secondary.startsWith(q) || secondary.includes(q) ? 550 : 0;
      }
      if (opts.vocabByPortuguese) {
        if (secondary === q) return 0;
        return primary === q ? 1000 : primary.startsWith(q) || primary.includes(q) ? 800 : 0;
      }
      if (primary === q) return 1000;
      if (primary.startsWith(q)) return 800;
      if (secondary === q) return 600;
      if (secondary.startsWith(q)) return 550;
      if (primary.includes(q) || secondary.includes(q)) return 200;
      return 0;
    }
    case "verb":
      if (primary === q) return 500;
      if (primary.startsWith(q)) return 480;
      if (secondary.includes(q)) return 300;
      return 0;
    case "grammar":
      if (primary === q || secondary === q) return 300;
      if (primary.startsWith(q) || secondary.startsWith(q)) return 280;
      if (primary.includes(q) || secondary.includes(q)) return 150;
      return 0;
    case "saying": {
      const [literal, usage] = extra;
      if (primary === q || primary.startsWith(q)) return 350;
      if (literal === q || literal.startsWith(q)) return 320;
      if (secondary.includes(q)) return 280;
      if (usage.includes(q)) return 250;
      if (primary.includes(q) || literal.includes(q)) return 150;
      return 0;
    }
    case "false_friend":
      if (primary.includes(q)) return 300;
      if (extra[0].includes(q) || secondary.includes(q)) return 200;
      return 0;
    case "etiquette":
      if (primary.includes(q)) return 280;
      if (secondary.includes(q) || extra[0].includes(q)) return 200;
      return 0;
    case "regional":
      if (primary.includes(q)) return 300;
      if (secondary.includes(q) || extra[0].includes(q)) return 200;
      return 0;
  }
}

function runTextSearch(queryNorm: string, opts: SearchOptions = {}): Array<{ result: SearchResult; score: number }> {
  if (!queryNorm) return [];
  const out: Array<{ result: SearchResult; score: number }> = [];
  for (const e of INDEX) {
    const t = e.result.type;
    if (opts.verbOnly && t !== "verb") continue;
    if (opts.grammarOnly && t !== "grammar") continue;
    const score = scoreEntry(e, queryNorm, opts);
    if (score > 0) {
      const result = t === "vocabulary" ? { ...e.result, matchField: e.primary === queryNorm ? "portuguese" : "english" } : e.result;
      out.push({ result, score });
    }
  }
  out.sort((a, b) => b.score - a.score);
  return out;
}

function findVerbsByQuery(term: string): VerbCardEntry[] {
  const norm = normalizeForSearch(term);
  const out: VerbCardEntry[] = [];
  for (const e of INDEX) {
    if (!e.verb) continue;
    const inf = e.primary;
    const en = e.secondary;
    const matchInfinitive = inf === norm || inf.startsWith(norm) || norm.startsWith(inf);
    const matchEnglish = en === norm || en.startsWith(norm) || norm.startsWith(en) || en.includes(norm) || norm.includes(en);
    if (matchInfinitive || matchEnglish) out.push(e.verb);
  }
  return out;
}

function buildSmartCard(intent: DetectedIntent, textResults: Array<{ result: SearchResult; score: number }>): SmartResultCard | null {
  const extractedNorm = normalizeForSearch(intent.extractedQuery);

  if (intent.type === "translation") {
    const primary = textResults
      .map((r) => r.result)
      .find((r) => r.type === "vocabulary" && normalizeForSearch(r.subtitle).includes(extractedNorm));
    if (primary) return { type: "translation", query: intent.extractedQuery, primary };
  }

  if (intent.type === "definition") {
    const primary = textResults
      .map((r) => r.result)
      .find((r) => r.type === "vocabulary" && normalizeForSearch(r.title).includes(extractedNorm));
    if (primary) return { type: "definition", query: intent.extractedQuery, primary };
  }

  if (intent.type === "conjugation") {
    const matches = findVerbsByQuery(intent.extractedQuery);
    if (matches.length === 0) return null;
    if (matches.length === 1) return { type: "conjugation", ...matches[0] };
    return { type: "conjugation_multi", query: intent.extractedQuery, verbs: matches };
  }

  if (intent.type === "tense" && intent.tense) {
    if (!VERB_TENSES.includes(intent.tense)) return null;
    const matches = findVerbsByQuery(intent.extractedQuery);
    if (matches.length === 0) return null;
    const tenseLabel = TENSE_PATTERNS.find((p) => p.tense === intent.tense)?.label ?? intent.tense;
    const withTense = matches.map((v) => ({ ...v, href: `${v.href}?tense=${encodeURIComponent(intent.tense!)}` }));
    if (withTense.length === 1) return { type: "tense", tense: intent.tense, tenseLabel, ...withTense[0] };
    return { type: "tense_multi", query: intent.extractedQuery, tense: intent.tense, tenseLabel, verbs: withTense };
  }

  if (intent.type === "comparison" && intent.comparisonTerms && intent.comparisonTerms.length >= 2) {
    const a = normalizeForSearch(intent.comparisonTerms[0]);
    const b = normalizeForSearch(intent.comparisonTerms[1]);
    const topicId = COMPARISON_GRAMMAR_IDS[`${a} ${b}`] || COMPARISON_GRAMMAR_IDS[`${b} ${a}`];
    const entry = topicId ? GRAMMAR_BY_ID.get(topicId) : undefined;
    if (entry) return { type: "comparison", topic: entry.result };
  }

  if (intent.type === "grammar") {
    const topic = textResults.map((r) => r.result).find((r) => r.type === "grammar");
    if (topic) return { type: "grammar", topic };
  }

  return null;
}

// ─── Public API ─────────────────────────────────────────

export function search(query: string): SearchOutput {
  const q = query.trim();
  const intent = detectIntent(q);
  const extractedNorm = normalizeForSearch(intent.extractedQuery);

  if (q.length < MIN_QUERY_LENGTH && intent.type === "none") {
    return { intent, smartCard: null, results: [] };
  }

  const runNormal = () =>
    runTextSearch(extractedNorm.length >= MIN_QUERY_LENGTH ? extractedNorm : q.length >= MIN_QUERY_LENGTH ? normalizeForSearch(q) : "");

  if (intent.type === "none") {
    return { intent, smartCard: null, results: runNormal().slice(0, 50).map((r) => r.result) };
  }

  let targeted: Array<{ result: SearchResult; score: number }> = [];
  const opts: SearchOptions = {};

  if (intent.type === "translation") {
    opts.vocabByEnglish = true;
    const cleanedRaw = cleanTranslationQuery(intent.extractedQuery);
    const cleanedNorm = normalizeForSearch(cleanedRaw);
    targeted = runTextSearch(cleanedNorm.length >= MIN_QUERY_LENGTH ? cleanedNorm : extractedNorm, opts);
    if (targeted.length === 0 && cleanedRaw.includes(" ")) {
      const seenHref = new Set<string>();
      for (const word of cleanedRaw.split(/\s+/).filter((w) => w.length >= MIN_QUERY_LENGTH)) {
        for (const r of runTextSearch(normalizeForSearch(word), opts)) {
          if (!seenHref.has(r.result.href)) {
            seenHref.add(r.result.href);
            targeted.push(r);
          }
        }
      }
      targeted.sort((a, b) => b.score - a.score);
    }
  } else if (intent.type === "definition") {
    opts.vocabByPortuguese = true;
    targeted = runTextSearch(extractedNorm, opts);
  } else if (intent.type === "conjugation" || intent.type === "tense") {
    opts.verbOnly = true;
    targeted = runTextSearch(extractedNorm, opts);
  } else {
    opts.grammarOnly = true;
    targeted = runTextSearch(extractedNorm, opts);
  }

  const smartCard = buildSmartCard(intent, targeted);

  const dedupeHref = new Set<string>();
  if (smartCard) {
    if (smartCard.type === "translation" || smartCard.type === "definition") dedupeHref.add(smartCard.primary.href);
    else if (smartCard.type === "conjugation" || smartCard.type === "tense") dedupeHref.add(smartCard.href);
    else if (smartCard.type === "conjugation_multi" || smartCard.type === "tense_multi") smartCard.verbs.forEach((v) => dedupeHref.add(v.href));
    else dedupeHref.add(smartCard.topic.href);
  }

  const combined = [...targeted];
  const seenKeys = new Set(targeted.map((r) => r.result.href + r.result.title));
  for (const r of runNormal()) {
    if (dedupeHref.has(r.result.href)) continue;
    const key = r.result.href + r.result.title;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    combined.push(r);
  }
  combined.sort((a, b) => b.score - a.score);

  return { intent, smartCard, results: combined.slice(0, 50).map((r) => r.result) };
}
