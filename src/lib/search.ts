import vocabData from "@/data/vocab.json";
import verbData from "@/data/verbs.json";
import grammarData from "@/data/grammar.json";
import sayingsData from "@/data/sayings.json";
import falseFriendsData from "@/data/false-friends.json";
import etiquetteData from "@/data/etiquette.json";
import regionalData from "@/data/regional.json";
import type { VocabData } from "@/types/vocab";
import type { VerbDataSet, VerbData, Conjugation } from "@/types";
import type { GrammarData } from "@/types/grammar";
import type { SayingsData } from "@/types/saying";
import type { FalseFriendsData, EtiquetteData, RegionalData } from "@/types/culture";

export interface SearchResult {
  type: "vocabulary" | "verb" | "conjugation" | "grammar" | "saying" | "false_friend" | "etiquette" | "regional";
  title: string;
  subtitle: string;
  category?: string;
  pronunciation?: string;
  href: string;
  matchField: string;
  meta?: {
    categoryId?: string;
    categoryTitle?: string;
    categoryTitlePt?: string;
    tense?: string;
    conjugation?: string;
    example?: string;
    exampleTranslation?: string;
    summary?: string;
  };
}

export interface DetectedIntent {
  type:
    | "translation"
    | "definition"
    | "conjugation"
    | "tense"
    | "comparison"
    | "grammar"
    | "none";
  extractedQuery: string;
  tense?: string;
  comparisonTerms?: string[];
}

export type SmartResultCard =
  | {
      type: "translation";
      query: string;
      primary: SearchResult;
    }
  | {
      type: "definition";
      query: string;
      primary: SearchResult;
    }
  | {
      type: "conjugation";
      infinitive: string;
      english: string;
      group: string;
      cefr: string;
      href: string;
      presentPreview: string;
    }
  | {
      type: "tense";
      infinitive: string;
      tense: string;
      tenseLabel: string;
      href: string;
      conjugations: string[];
    }
  | {
      type: "conjugation_multi";
      query: string;
      verbs: Array<{
        infinitive: string;
        english: string;
        group: string;
        cefr: string;
        href: string;
        presentPreview: string;
      }>;
    }
  | {
      type: "tense_multi";
      query: string;
      tense: string;
      tenseLabel: string;
      verbs: Array<{
        infinitive: string;
        href: string;
        conjugations: string[];
      }>;
    }
  | {
      type: "comparison";
      topic: SearchResult;
    }
  | {
      type: "grammar";
      topic: SearchResult;
    };

export interface SearchOutput {
  intent: DetectedIntent;
  smartCard: SmartResultCard | null;
  results: SearchResult[];
}

const vocab = vocabData as unknown as VocabData;
const verbs = verbData as unknown as VerbDataSet;
const grammar = grammarData as unknown as GrammarData;
const sayings = (sayingsData as unknown as SayingsData).sayings;
const falseFriends = (falseFriendsData as unknown as FalseFriendsData).falseFriends;
const etiquetteTips = (etiquetteData as unknown as EtiquetteData).tips;
const regionalExpressions = (regionalData as unknown as RegionalData).expressions;

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

export function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const MIN_QUERY_LENGTH = 2;

/** Filler phrases to strip from conjugation/tense extracted query (case-insensitive) */
const VERB_QUERY_FILLERS = [
  /^\s*the\s+verb\s+/i,
  /^\s*the\s+word\s+/i,
  /^\s*verb\s+/i,
  /^\s*o\s+verbo\s+/i,
  /^\s*a\s+palavra\s+/i,
];

function cleanVerbQuery(extracted: string): string {
  let s = extracted.trim();
  for (const re of VERB_QUERY_FILLERS) {
    s = s.replace(re, "").trim();
  }
  return s;
}

/** Filler words to strip from translation intent query (e.g. "im hungry" → "hungry") */
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

  // Comparison: "X vs Y", "difference between X and Y", "diferença entre X e Y"
  const vsMatch = lower.match(/\b(.+?)\s+(?:vs\.?|versus)\s+(.+?)$/);
  if (vsMatch)
    return {
      type: "comparison",
      extractedQuery: q,
      comparisonTerms: [vsMatch[1].trim(), vsMatch[2].trim()],
    };
  const diffMatch = lower.match(/\b(?:difference\s+between|diferen[cç]a\s+entre)\s+(.+?)\s+(?:and|e)\s+(.+?)$/i);
  if (diffMatch)
    return {
      type: "comparison",
      extractedQuery: q,
      comparisonTerms: [diffMatch[1].trim(), diffMatch[2].trim()],
    };

  // Tense: "past tense of X", "pretérito de X", etc.
  for (const { pattern, tense } of TENSE_PATTERNS) {
    if (!pattern.test(lower)) continue;
    const ofMatch = lower.match(/\b(?:of|de)\s+(.+?)\s*$/i);
    const term = ofMatch ? ofMatch[1].trim() : lower.replace(pattern, "").replace(/\b(?:of|de)\s*$/i, "").trim();
    const cleaned = cleanVerbQuery(term);
    if (cleaned.length >= 2)
      return { type: "tense", extractedQuery: cleaned, tense };
  }

  // Conjugation: "conjugate X", "conjugação de X"
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

  // Translation: "how do you say X", "X in portuguese", "como se diz X"
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

  // Definition: "what does X mean", "what is X", "o que significa X"
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

function runTextSearch(
  queryNorm: string,
  options: {
    vocabByEnglish?: boolean;
    vocabByPortuguese?: boolean;
    verbOnly?: boolean;
    grammarOnly?: boolean;
  } = {}
): Array<{ result: SearchResult; score: number }> {
  const results: Array<{ result: SearchResult; score: number }> = [];
  const seen = new Set<string>();

  function dedupeKey(type: string, href: string, title: string): string {
    return `${type}:${href}:${normalizeForSearch(title)}`;
  }

  function scoreVocabulary(q: string, ptNorm: string, enNorm: string): number {
    if (ptNorm === q) return 1000;
    if (ptNorm.startsWith(q)) return 800;
    if (enNorm === q) return 600;
    if (enNorm.startsWith(q)) return 550;
    if (ptNorm.includes(q) || enNorm.includes(q)) return 200;
    return 0;
  }

  function scoreVerbInfinitive(q: string, infNorm: string, enNorm: string): number {
    if (infNorm === q) return 500;
    if (infNorm.startsWith(q)) return 480;
    if (enNorm.includes(q)) return 300;
    return 0;
  }

  function scoreConjugation(q: string, conjNorm: string): number {
    if (conjNorm === q) return 400;
    if (conjNorm.startsWith(q)) return 380;
    if (conjNorm.includes(q)) return 250;
    return 0;
  }

  function scoreGrammar(q: string, titleNorm: string, titlePtNorm: string): number {
    if (titleNorm === q || titlePtNorm === q) return 300;
    if (titleNorm.startsWith(q) || titlePtNorm.startsWith(q)) return 280;
    if (titleNorm.includes(q) || titlePtNorm.includes(q)) return 150;
    return 0;
  }

  function scoreSaying(
    q: string,
    ptNorm: string,
    literalNorm: string,
    meaningNorm: string,
    usageNorm: string
  ): number {
    if (ptNorm === q || ptNorm.startsWith(q)) return 350;
    if (literalNorm === q || literalNorm.startsWith(q)) return 320;
    if (meaningNorm.includes(q) || meaningNorm.startsWith(q)) return 280;
    if (usageNorm.includes(q) || usageNorm.startsWith(q)) return 250;
    if (ptNorm.includes(q) || literalNorm.includes(q) || meaningNorm.includes(q) || usageNorm.includes(q)) return 150;
    return 0;
  }

  const vocabOnlyEnglish = options.vocabByEnglish === true;
  const vocabOnlyPortuguese = options.vocabByPortuguese === true;

  if (!options.verbOnly && !options.grammarOnly) {
    for (const cat of vocab.categories) {
      for (const w of cat.words) {
        const ptNorm = normalizeForSearch(w.portuguese);
        const enNorm = normalizeForSearch(w.english);
        if (vocabOnlyEnglish && ptNorm === queryNorm) continue;
        if (vocabOnlyPortuguese && enNorm === queryNorm) continue;
        let score = scoreVocabulary(queryNorm, ptNorm, enNorm);
        if (vocabOnlyEnglish) score = enNorm.includes(queryNorm) || enNorm.startsWith(queryNorm) ? (enNorm === queryNorm ? 600 : 550) : 0;
        if (vocabOnlyPortuguese) score = ptNorm.includes(queryNorm) || ptNorm.startsWith(queryNorm) ? (ptNorm === queryNorm ? 1000 : 800) : 0;
        if (score === 0) continue;
        const href = `/vocabulary/${cat.id}?highlight=${encodeURIComponent(w.portuguese)}`;
        const key = dedupeKey("vocabulary", href, w.portuguese);
        if (seen.has(key)) continue;
        seen.add(key);
        results.push({
          score,
          result: {
            type: "vocabulary",
            title: w.portuguese,
            subtitle: w.english,
            category: cat.id,
            pronunciation: w.pronunciation,
            href,
            matchField: ptNorm === queryNorm ? "portuguese" : "english",
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
  }

  if (!options.grammarOnly) {
    for (const infinitive of verbs.order) {
      const v = verbs.verbs[infinitive];
      if (!v) continue;
      const infNorm = normalizeForSearch(infinitive);
      const enNorm = normalizeForSearch(v.meta.english);
      const score = scoreVerbInfinitive(queryNorm, infNorm, enNorm);
      if (score > 0) {
        const href = `/conjugations/${infinitive.toLowerCase()}`;
        const key = dedupeKey("verb", href, infinitive);
        if (!seen.has(key)) {
          seen.add(key);
          results.push({
            score,
            result: {
              type: "verb",
              title: infinitive,
              subtitle: `${v.meta.english} (${v.meta.group})`,
              category: v.meta.group,
              href,
              matchField: "infinitive",
            },
          });
        }
      }
      if (!options.verbOnly) {
        for (const c of v.conjugations) {
          const conjNorm = normalizeForSearch(c.Conjugation);
          const scoreC = scoreConjugation(queryNorm, conjNorm);
          if (scoreC === 0) continue;
          const personShort = c.Person.split(" (")[0].trim();
          const href = `/conjugations/${infinitive.toLowerCase()}?tense=${encodeURIComponent(c.Tense)}&highlight=${encodeURIComponent(c.Conjugation)}`;
          const key = dedupeKey("conjugation", href, c.Conjugation + c.Tense);
          if (seen.has(key)) continue;
          seen.add(key);
          results.push({
            score: scoreC,
            result: {
              type: "conjugation",
              title: c.Conjugation,
              subtitle: `${infinitive} · ${c.Tense} · ${personShort}`,
              category: v.meta.group,
              href,
              matchField: "conjugation",
              meta: { tense: c.Tense, conjugation: c.Conjugation },
            },
          });
        }
      }
    }
  }

  if (!options.verbOnly) {
    for (const id of Object.keys(grammar.topics)) {
      const t = grammar.topics[id];
      const titleNorm = normalizeForSearch(t.title);
      const titlePtNorm = normalizeForSearch(t.titlePt);
      const score = scoreGrammar(queryNorm, titleNorm, titlePtNorm);
      if (score === 0) continue;
      const href = `/grammar/${id}`;
      const key = dedupeKey("grammar", href, t.title);
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({
        score,
        result: {
          type: "grammar",
          title: t.title,
          subtitle: t.titlePt,
          href,
          matchField: "title",
          meta: { summary: t.summary },
        },
      });
    }
  }

  if (!options.verbOnly && !options.grammarOnly) {
    for (const s of sayings) {
      const ptNorm = normalizeForSearch(s.portuguese);
      const literalNorm = normalizeForSearch(s.literal);
      const meaningNorm = normalizeForSearch(s.meaning);
      const usageNorm = normalizeForSearch(s.usage);
      const score = scoreSaying(queryNorm, ptNorm, literalNorm, meaningNorm, usageNorm);
      if (score === 0) continue;
      const href = `/culture?tab=sayings&highlight=${encodeURIComponent(s.id)}`;
      const key = dedupeKey("saying", href, s.id);
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({
        score,
        result: {
          type: "saying",
          title: s.portuguese.length > 60 ? s.portuguese.slice(0, 57) + "..." : s.portuguese,
          subtitle: s.meaning.length > 80 ? s.meaning.slice(0, 77) + "..." : s.meaning,
          href,
          matchField: "portuguese",
          meta: { summary: s.meaning },
        },
      });
    }

    for (const f of falseFriends) {
      const ptNorm = normalizeForSearch(f.portuguese);
      const looksNorm = normalizeForSearch(f.looksLike);
      const actualNorm = normalizeForSearch(f.actualMeaning);
      const score =
        ptNorm.includes(queryNorm) || ptNorm.startsWith(queryNorm) ? 300 :
        looksNorm.includes(queryNorm) || actualNorm.includes(queryNorm) ? 200 : 0;
      if (score === 0) continue;
      const href = `/culture?tab=false-friends&highlight=${encodeURIComponent(f.id)}`;
      const key = dedupeKey("false_friend", href, f.id);
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({
        score,
        result: {
          type: "false_friend",
          title: f.portuguese,
          subtitle: f.actualMeaning,
          pronunciation: f.pronunciation,
          href,
          matchField: "portuguese",
          meta: { summary: f.tip },
        },
      });
    }

    for (const e of etiquetteTips) {
      const titleNorm = normalizeForSearch(e.title);
      const titlePtNorm = normalizeForSearch(e.titlePt);
      const descNorm = normalizeForSearch(e.description);
      const score =
        titleNorm.includes(queryNorm) || titleNorm.startsWith(queryNorm) ? 280 :
        titlePtNorm.includes(queryNorm) || descNorm.includes(queryNorm) ? 200 : 0;
      if (score === 0) continue;
      const href = `/culture?tab=etiquette&highlight=${encodeURIComponent(e.id)}`;
      const key = dedupeKey("etiquette", href, e.id);
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({
        score,
        result: {
          type: "etiquette",
          title: e.title,
          subtitle: e.titlePt,
          href,
          matchField: "title",
          meta: { summary: e.description },
        },
      });
    }

    for (const r of regionalExpressions) {
      const exprNorm = normalizeForSearch(r.expression);
      const meaningNorm = normalizeForSearch(r.meaning);
      const standardNorm = normalizeForSearch(r.standardAlternative);
      const score =
        exprNorm.includes(queryNorm) || exprNorm.startsWith(queryNorm) ? 300 :
        meaningNorm.includes(queryNorm) || standardNorm.includes(queryNorm) ? 200 : 0;
      if (score === 0) continue;
      const href = `/culture?tab=regional&highlight=${encodeURIComponent(r.id)}`;
      const key = dedupeKey("regional", href, r.id);
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({
        score,
        result: {
          type: "regional",
          title: r.expression,
          subtitle: r.meaning,
          pronunciation: r.pronunciation,
          href,
          matchField: "expression",
          meta: { summary: r.standardAlternative },
        },
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

/** Match verbs by Portuguese infinitive or English translation; returns all matches (e.g. "to be" → SER, ESTAR). */
function findVerbsByQuery(term: string): Array<{ infinitive: string; data: VerbData }> {
  const norm = normalizeForSearch(term);
  const out: Array<{ infinitive: string; data: VerbData }> = [];
  for (const inf of verbs.order) {
    const v = verbs.verbs[inf];
    if (!v) continue;
    const infNorm = normalizeForSearch(inf);
    const enNorm = normalizeForSearch(v.meta.english);
    const matchInfinitive = infNorm === norm || infNorm.startsWith(norm) || norm.startsWith(infNorm);
    const matchEnglish =
      enNorm === norm ||
      enNorm.startsWith(norm) ||
      norm.startsWith(enNorm) ||
      enNorm.includes(norm) ||
      norm.includes(enNorm);
    if (matchInfinitive || matchEnglish) out.push({ infinitive: inf, data: v });
  }
  return out;
}

function getPresentConjugations(conjugations: Conjugation[]): string {
  const present = conjugations.filter((c) => c.Tense === "Present");
  const byPerson: Record<string, string> = {};
  for (const c of present) {
    const p = c.Person.toLowerCase();
    if (p.startsWith("eu ")) byPerson.eu = c.Conjugation;
    else if (p.startsWith("tu ")) byPerson.tu = c.Conjugation;
    else if (p.includes("ele") || p.includes("ela") || p.includes("você")) byPerson.ele = c.Conjugation;
    else if (p.startsWith("nós")) byPerson.nós = c.Conjugation;
    else if (p.startsWith("eles")) byPerson.eles = c.Conjugation;
  }
  const order = ["eu", "tu", "ele", "nós", "eles"];
  return order.map((k) => byPerson[k]).filter(Boolean).join(" · ");
}

function getConjugationsForTense(conjugations: Conjugation[], tense: string): string[] {
  const rows = conjugations.filter((c) => c.Tense === tense);
  return rows.map((r) => r.Conjugation);
}

function buildSmartCard(
  intent: DetectedIntent,
  textResults: Array<{ result: SearchResult; score: number }>
): SmartResultCard | null {
  const extractedNorm = normalizeForSearch(intent.extractedQuery);
  if (intent.type === "translation") {
    const vocabResults = textResults
      .filter((r) => r.result.type === "vocabulary")
      .map((r) => r.result)
      .filter((r) => {
        const enNorm = normalizeForSearch(r.subtitle);
        return enNorm.includes(extractedNorm) || enNorm.startsWith(extractedNorm) || enNorm === extractedNorm;
      });
    const primary = vocabResults[0];
    if (primary) return { type: "translation", query: intent.extractedQuery, primary };
  }

  if (intent.type === "definition") {
    const vocabResults = textResults
      .filter((r) => r.result.type === "vocabulary")
      .map((r) => r.result)
      .filter((r) => {
        const ptNorm = normalizeForSearch(r.title);
        return ptNorm.includes(extractedNorm) || ptNorm.startsWith(extractedNorm) || ptNorm === extractedNorm;
      });
    const primary = vocabResults[0];
    if (primary) return { type: "definition", query: intent.extractedQuery, primary };
  }

  if (intent.type === "conjugation") {
    const matches = findVerbsByQuery(intent.extractedQuery);
    if (matches.length === 0) return null;
    if (matches.length === 1) {
      const { infinitive, data } = matches[0];
      const presentPreview = getPresentConjugations(data.conjugations);
      return {
        type: "conjugation",
        infinitive,
        english: data.meta.english,
        group: data.meta.group,
        cefr: data.meta.cefr,
        href: `/conjugations/${infinitive.toLowerCase()}`,
        presentPreview,
      };
    }
    return {
      type: "conjugation_multi",
      query: intent.extractedQuery,
      verbs: matches.map(({ infinitive, data }) => ({
        infinitive,
        english: data.meta.english,
        group: data.meta.group,
        cefr: data.meta.cefr,
        href: `/conjugations/${infinitive.toLowerCase()}`,
        presentPreview: getPresentConjugations(data.conjugations),
      })),
    };
  }

  if (intent.type === "tense" && intent.tense) {
    if (!VERB_TENSES.includes(intent.tense)) return null;
    const matches = findVerbsByQuery(intent.extractedQuery);
    if (matches.length === 0) return null;
    const tenseConfig = TENSE_PATTERNS.find((p) => p.tense === intent.tense);
    const tenseLabel = tenseConfig?.label ?? intent.tense ?? "";
    if (matches.length === 1) {
      const { infinitive, data } = matches[0];
      const conjugations = getConjugationsForTense(data.conjugations, intent.tense);
      return {
        type: "tense",
        infinitive,
        tense: intent.tense,
        tenseLabel,
        href: `/conjugations/${infinitive.toLowerCase()}?tense=${encodeURIComponent(intent.tense)}`,
        conjugations,
      };
    }
    return {
      type: "tense_multi",
      query: intent.extractedQuery,
      tense: intent.tense,
      tenseLabel,
      verbs: matches.map(({ infinitive, data }) => ({
        infinitive,
        href: `/conjugations/${infinitive.toLowerCase()}?tense=${encodeURIComponent(intent.tense!)}`,
        conjugations: getConjugationsForTense(data.conjugations, intent.tense!),
      })),
    };
  }

  if (intent.type === "comparison" && intent.comparisonTerms && intent.comparisonTerms.length >= 2) {
    const a = normalizeForSearch(intent.comparisonTerms[0]);
    const b = normalizeForSearch(intent.comparisonTerms[1]);
    const key = `${a} ${b}`;
    const altKey = `${b} ${a}`;
    const topicId = COMPARISON_GRAMMAR_IDS[key] || COMPARISON_GRAMMAR_IDS[altKey];
    if (topicId && grammar.topics[topicId]) {
      const t = grammar.topics[topicId];
      return {
        type: "comparison",
        topic: {
          type: "grammar",
          title: t.title,
          subtitle: t.titlePt,
          href: `/grammar/${topicId}`,
          matchField: "title",
          meta: { summary: t.summary },
        },
      };
    }
  }

  if (intent.type === "grammar") {
    const grammarResults = textResults.filter((r) => r.result.type === "grammar").map((r) => r.result);
    if (grammarResults[0])
      return { type: "grammar", topic: grammarResults[0] };
  }

  return null;
}

let cachedIndexBuilt = false;
function ensureDataLoaded(): void {
  if (cachedIndexBuilt) return;
  cachedIndexBuilt = true;
}

export function search(query: string): SearchOutput {
  const q = query.trim();
  ensureDataLoaded();

  const intent = detectIntent(q);
  const extractedNorm = normalizeForSearch(intent.extractedQuery);

  if (q.length < MIN_QUERY_LENGTH && intent.type === "none") {
    return { intent, smartCard: null, results: [] };
  }

  const runNormal = () => {
    return runTextSearch(extractedNorm.length >= MIN_QUERY_LENGTH ? extractedNorm : q.length >= MIN_QUERY_LENGTH ? normalizeForSearch(q) : "");
  };

  if (intent.type === "none") {
    const textResults = runNormal();
    return {
      intent,
      smartCard: null,
      results: textResults.slice(0, 50).map((r) => r.result),
    };
  }

  let targetedResults: Array<{ result: SearchResult; score: number }> = [];
  const opts: { vocabByEnglish?: boolean; vocabByPortuguese?: boolean; verbOnly?: boolean; grammarOnly?: boolean } = {};

  if (intent.type === "translation") {
    opts.vocabByEnglish = true;
    const cleanedRaw = cleanTranslationQuery(intent.extractedQuery);
    const cleanedNorm = normalizeForSearch(cleanedRaw);
    targetedResults = runTextSearch(cleanedNorm.length >= MIN_QUERY_LENGTH ? cleanedNorm : extractedNorm, opts);
    if (targetedResults.length === 0 && cleanedRaw.includes(" ")) {
      const words = cleanedRaw.split(/\s+/).filter((w) => w.length >= MIN_QUERY_LENGTH);
      const seenHref = new Set<string>();
      for (const word of words) {
        const wordNorm = normalizeForSearch(word);
        if (!wordNorm) continue;
        const wordResults = runTextSearch(wordNorm, opts);
        for (const r of wordResults) {
          if (!seenHref.has(r.result.href)) {
            seenHref.add(r.result.href);
            targetedResults.push(r);
          }
        }
      }
      targetedResults.sort((a, b) => b.score - a.score);
    }
  } else if (intent.type === "definition") {
    opts.vocabByPortuguese = true;
    targetedResults = runTextSearch(extractedNorm, opts);
  } else if (intent.type === "conjugation" || intent.type === "tense") {
    opts.verbOnly = true;
    targetedResults = runTextSearch(extractedNorm, opts);
  } else if (intent.type === "comparison") {
    opts.grammarOnly = true;
    targetedResults = runTextSearch(extractedNorm, opts);
  } else {
    opts.grammarOnly = true;
    targetedResults = runTextSearch(extractedNorm, opts);
  }

  const smartCard = buildSmartCard(intent, targetedResults);

  const normalResults = runNormal();
  const dedupeHref = new Set<string>();
  if (smartCard) {
    if (smartCard.type === "translation" || smartCard.type === "definition")
      dedupeHref.add(smartCard.primary.href);
    else if (smartCard.type === "conjugation" || smartCard.type === "tense")
      dedupeHref.add(smartCard.href);
    else if (smartCard.type === "conjugation_multi")
      smartCard.verbs.forEach((v) => dedupeHref.add(v.href));
    else if (smartCard.type === "tense_multi")
      smartCard.verbs.forEach((v) => dedupeHref.add(v.href));
    else if (smartCard.type === "comparison" || smartCard.type === "grammar")
      dedupeHref.add(smartCard.topic.href);
  }
  const merged = normalResults.filter((r) => !dedupeHref.has(r.result.href));
  const combined = [...targetedResults];
  const seenKeys = new Set(targetedResults.map((r) => r.result.href + r.result.title));
  for (const r of merged) {
    if (seenKeys.has(r.result.href + r.result.title)) continue;
    seenKeys.add(r.result.href + r.result.title);
    combined.push(r);
  }
  combined.sort((a, b) => b.score - a.score);
  const results = combined.slice(0, 50).map((r) => r.result);

  return { intent, smartCard, results };
}
