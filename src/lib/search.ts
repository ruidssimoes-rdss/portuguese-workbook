import vocabData from "@/data/vocab.json";
import verbData from "@/data/verbs.json";
import grammarData from "@/data/grammar.json";
import type { VocabData } from "@/types/vocab";
import type { VerbDataSet, VerbData, Conjugation } from "@/types";
import type { GrammarData } from "@/types/grammar";

export interface SearchResult {
  type: "vocabulary" | "verb" | "conjugation" | "grammar";
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
    const ofMatch = lower.match(/\b(?:of|de)\s+(\w+(?:\s+\w+)*)\s*$/i);
    const term = ofMatch ? ofMatch[1].trim() : lower.replace(pattern, "").replace(/\b(?:of|de)\s*$/i, "").trim();
    if (term.length >= 2)
      return { type: "tense", extractedQuery: term, tense };
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
    if (term.length >= 2) return { type: "conjugation", extractedQuery: term };
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

  results.sort((a, b) => b.score - a.score);
  return results;
}

function findVerbByInfinitive(term: string): { infinitive: string; data: VerbData } | null {
  const norm = normalizeForSearch(term);
  for (const inf of verbs.order) {
    if (normalizeForSearch(inf) === norm || normalizeForSearch(inf).startsWith(norm))
      return { infinitive: inf, data: verbs.verbs[inf] };
  }
  return null;
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
    const verbInfo = findVerbByInfinitive(intent.extractedQuery);
    if (verbInfo) {
      const presentPreview = getPresentConjugations(verbInfo.data.conjugations);
      return {
        type: "conjugation",
        infinitive: verbInfo.infinitive,
        english: verbInfo.data.meta.english,
        group: verbInfo.data.meta.group,
        cefr: verbInfo.data.meta.cefr,
        href: `/conjugations/${verbInfo.infinitive.toLowerCase()}`,
        presentPreview,
      };
    }
  }

  if (intent.type === "tense" && intent.tense) {
    const verbInfo = findVerbByInfinitive(intent.extractedQuery);
    if (verbInfo && VERB_TENSES.includes(intent.tense)) {
      const conjugations = getConjugationsForTense(verbInfo.data.conjugations, intent.tense);
      const tenseConfig = TENSE_PATTERNS.find((p) => p.tense === intent.tense);
      const href = `/conjugations/${verbInfo.infinitive.toLowerCase()}?tense=${encodeURIComponent(intent.tense)}`;
      return {
        type: "tense",
        infinitive: verbInfo.infinitive,
        tense: intent.tense,
        tenseLabel: tenseConfig?.label ?? intent.tense,
        href,
        conjugations,
      };
    }
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
    targetedResults = runTextSearch(extractedNorm, opts);
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
