import vocabData from "@/data/vocab.json";
import verbData from "@/data/verbs.json";
import grammarData from "@/data/grammar.json";
import type { VocabData } from "@/types/vocab";
import type { VerbDataSet } from "@/types";
import type { GrammarData } from "@/types/grammar";

export interface SearchResult {
  type: "vocabulary" | "verb" | "conjugation" | "grammar";
  title: string;
  subtitle: string;
  category?: string;
  pronunciation?: string;
  href: string;
  matchField: string;
  meta?: { categoryId?: string; tense?: string; conjugation?: string };
}

const vocab = vocabData as unknown as VocabData;
const verbs = verbData as unknown as VerbDataSet;
const grammar = grammarData as unknown as GrammarData;

export function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const MIN_QUERY_LENGTH = 2;

/** Priority: 1 exact PT, 2 starts-with PT, 3 exact EN, 4 verb infinitive, 5 conjugation, 6 grammar title, 7 contains */
function scoreVocabulary(queryNorm: string, ptNorm: string, enNorm: string): number {
  if (ptNorm === queryNorm) return 1000;
  if (ptNorm.startsWith(queryNorm)) return 800;
  if (enNorm === queryNorm) return 600;
  if (enNorm.startsWith(queryNorm)) return 550;
  if (ptNorm.includes(queryNorm) || enNorm.includes(queryNorm)) return 200;
  return 0;
}

function scoreVerbInfinitive(queryNorm: string, infNorm: string, enNorm: string): number {
  if (infNorm === queryNorm) return 500;
  if (infNorm.startsWith(queryNorm)) return 480;
  if (enNorm.includes(queryNorm)) return 300;
  return 0;
}

function scoreConjugation(queryNorm: string, conjNorm: string): number {
  if (conjNorm === queryNorm) return 400;
  if (conjNorm.startsWith(queryNorm)) return 380;
  if (conjNorm.includes(queryNorm)) return 250;
  return 0;
}

function scoreGrammar(queryNorm: string, titleNorm: string, titlePtNorm: string): number {
  if (titleNorm === queryNorm || titlePtNorm === queryNorm) return 300;
  if (titleNorm.startsWith(queryNorm) || titlePtNorm.startsWith(queryNorm)) return 280;
  if (titleNorm.includes(queryNorm) || titlePtNorm.includes(queryNorm)) return 150;
  return 0;
}

let cachedIndexBuilt = false;

function ensureDataLoaded(): void {
  if (cachedIndexBuilt) return;
  cachedIndexBuilt = true;
}

export function search(query: string): SearchResult[] {
  const q = query.trim();
  if (q.length < MIN_QUERY_LENGTH) return [];

  ensureDataLoaded();
  const queryNorm = normalizeForSearch(q);
  const results: Array<{ result: SearchResult; score: number }> = [];
  const seen = new Set<string>();

  function dedupeKey(type: string, href: string, title: string): string {
    return `${type}:${href}:${normalizeForSearch(title)}`;
  }

  // Vocabulary
  for (const cat of vocab.categories) {
    for (const w of cat.words) {
      const ptNorm = normalizeForSearch(w.portuguese);
      const enNorm = normalizeForSearch(w.english);
      const score = scoreVocabulary(queryNorm, ptNorm, enNorm);
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
          matchField: ptNorm === queryNorm ? "portuguese" : enNorm === queryNorm ? "english" : "portuguese",
          meta: { categoryId: cat.id },
        },
      });
    }
  }

  // Verbs (infinitive)
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

    // Conjugations
    for (const c of v.conjugations) {
      const conjNorm = normalizeForSearch(c.Conjugation);
      const score = scoreConjugation(queryNorm, conjNorm);
      if (score === 0) continue;
      const personShort = c.Person.split(" (")[0].trim();
      const href = `/conjugations/${infinitive.toLowerCase()}?tense=${encodeURIComponent(c.Tense)}&highlight=${encodeURIComponent(c.Conjugation)}`;
      const key = dedupeKey("conjugation", href, c.Conjugation + c.Tense);
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({
        score,
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

  // Grammar
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
      },
    });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 50).map((r) => r.result);
}
