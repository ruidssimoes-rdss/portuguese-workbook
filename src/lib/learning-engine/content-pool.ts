/**
 * Learning Engine — Content Pool
 *
 * Typed access to all content (vocab, verbs, grammar) from JSON data files,
 * filterable by CEFR level. Built once as singletons on import.
 */

import vocabData from "@/data/vocab.json";
import verbData from "@/data/verbs.json";
import grammarData from "@/data/grammar.json";

// ─── Types ──────────────────────────────────────────────

export interface PoolVocabItem {
  portuguese: string;
  english: string;
  cefr: string;
  gender: string | null;
  category: string;
  categoryTitle: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
}

export interface PoolVerbItem {
  key: string; // UPPERCASE key (e.g., "FALAR")
  english: string;
  cefr: string;
  group: string;
  pronunciation: string;
  conjugations: Array<{
    Person: string;
    Tense: string;
    Conjugation: string;
  }>;
}

export interface PoolGrammarItem {
  id: string;
  title: string;
  titlePt: string;
  cefr: string;
  summary: string;
  rules: Array<{
    rule: string;
    rulePt: string;
    examples: Array<{ pt: string; en: string }>;
  }>;
  questions: Array<{
    question: string;
    answer: string;
    options?: string[];
  }>;
  tips: Array<{ tip: string; tipPt: string }>;
}

// ─── Typed Data Access ──────────────────────────────────

type VocabCategory = (typeof vocabData)["categories"][number];
type VocabWord = VocabCategory["words"][number];
type VerbEntry = (typeof verbData)["verbs"][keyof typeof verbData.verbs];

// ─── Build Content Pool ─────────────────────────────────

function buildVocabPool(): PoolVocabItem[] {
  const items: PoolVocabItem[] = [];
  for (const cat of vocabData.categories) {
    for (const w of cat.words) {
      items.push({
        portuguese: w.portuguese,
        english: w.english,
        cefr: w.cefr,
        gender: w.gender || null,
        category: cat.id,
        categoryTitle: cat.title,
        pronunciation: "pronunciation" in w ? (w.pronunciation ?? "") : "",
        example: w.example,
        exampleTranslation: w.exampleTranslation,
      });
    }
  }
  return items;
}

function buildVerbPool(): PoolVerbItem[] {
  return verbData.order.map((key) => {
    const verb = verbData.verbs[key as keyof typeof verbData.verbs] as VerbEntry;
    const meta = verb.meta as {
      english: string;
      cefr: string;
      group: string;
      pronunciation: string;
    };
    return {
      key,
      english: meta.english,
      cefr: meta.cefr,
      group: meta.group,
      pronunciation: meta.pronunciation,
      conjugations: (verb as { conjugations: PoolVerbItem["conjugations"] }).conjugations,
    };
  });
}

function buildGrammarPool(): PoolGrammarItem[] {
  const topics = grammarData.topics as unknown as Record<
    string,
    Record<string, unknown>
  >;

  return Object.values(topics).map((t) => ({
    id: t.id as string,
    title: t.title as string,
    titlePt: (t.titlePt as string) ?? (t.title as string),
    cefr: t.cefr as string,
    summary: (t.summary as string) ?? "",
    rules: (t.rules as PoolGrammarItem["rules"]) || [],
    questions: (t.questions as PoolGrammarItem["questions"]) || [],
    tips: (t.tips as PoolGrammarItem["tips"]) || [],
  }));
}

// Singleton pools (built once on import)
const VOCAB_POOL = buildVocabPool();
const VERB_POOL = buildVerbPool();
const GRAMMAR_POOL = buildGrammarPool();

// ─── Public API ─────────────────────────────────────────

export function getVocabPool(cefr?: string): PoolVocabItem[] {
  if (!cefr) return VOCAB_POOL;
  return VOCAB_POOL.filter((v) => v.cefr === cefr);
}

export function getVerbPool(cefr?: string): PoolVerbItem[] {
  if (!cefr) return VERB_POOL;
  return VERB_POOL.filter((v) => v.cefr === cefr);
}

export function getGrammarPool(cefr?: string): PoolGrammarItem[] {
  if (!cefr) return GRAMMAR_POOL;
  return GRAMMAR_POOL.filter((g) => g.cefr === cefr);
}

/**
 * Get content totals per CEFR level (for readiness calculation)
 */
export function getContentTotals(cefr: string): {
  vocab: number;
  verbs: number;
  grammar: number;
} {
  return {
    vocab: getVocabPool(cefr).length,
    verbs: getVerbPool(cefr).length,
    grammar: getGrammarPool(cefr).length,
  };
}

/**
 * Get all content totals by CEFR level
 */
export function getAllContentTotals(): Record<
  string,
  { vocab: number; verbs: number; grammar: number }
> {
  return {
    A1: getContentTotals("A1"),
    A2: getContentTotals("A2"),
    B1: getContentTotals("B1"),
  };
}

// ─── High-Frequency Items ───────────────────────────────

// Top words/verbs in European Portuguese — get shorter spaced repetition intervals
const HIGH_FREQUENCY_VOCAB = new Set([
  "ser",
  "estar",
  "ter",
  "ir",
  "fazer",
  "poder",
  "querer",
  "dever",
  "dar",
  "dizer",
  "ver",
  "saber",
  "vir",
  "pôr",
  "falar",
  "sim",
  "não",
  "muito",
  "mais",
  "como",
  "onde",
  "quando",
  "bom",
  "mau",
  "grande",
  "pequeno",
  "novo",
  "velho",
  "água",
  "casa",
  "dia",
  "tempo",
  "ano",
  "vez",
  "homem",
  "mulher",
  "obrigado",
  "obrigada",
  "por favor",
  "desculpe",
]);

const HIGH_FREQUENCY_VERBS = new Set([
  "SER",
  "ESTAR",
  "TER",
  "IR",
  "FAZER",
  "PODER",
  "QUERER",
  "DEVER",
  "DAR",
  "DIZER",
  "VER",
  "SABER",
  "VIR",
  "PÔR",
  "FALAR",
  "COMER",
  "BEBER",
  "DORMIR",
  "TRABALHAR",
  "GOSTAR",
  "PRECISAR",
  "FICAR",
  "CHEGAR",
  "COMEÇAR",
  "ACABAR",
  "ABRIR",
  "FECHAR",
]);

export function isHighFrequency(
  contentType: string,
  contentId: string
): boolean {
  if (contentType === "vocab")
    return HIGH_FREQUENCY_VOCAB.has(contentId.toLowerCase());
  if (contentType === "verb")
    return HIGH_FREQUENCY_VERBS.has(contentId.toUpperCase());
  return false; // Grammar topics don't have frequency ranking
}
