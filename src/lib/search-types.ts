/**
 * Search — shared types (client-safe, no data imports).
 * The search itself runs on the server: see src/lib/search.ts and
 * the /api/search route handler.
 */

export type SearchResultType =
  | "vocabulary"
  | "verb"
  | "grammar"
  | "saying"
  | "false_friend"
  | "etiquette"
  | "regional";

export interface SearchResult {
  type: SearchResultType;
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
    example?: string;
    exampleTranslation?: string;
    summary?: string;
    cefr?: string;
  };
}

export interface DetectedIntent {
  type: "translation" | "definition" | "conjugation" | "tense" | "comparison" | "grammar" | "none";
  extractedQuery: string;
  tense?: string;
  comparisonTerms?: string[];
}

export interface VerbCardEntry {
  infinitive: string;
  english: string;
  group: string;
  cefr: string;
  href: string;
}

export type SmartResultCard =
  | { type: "translation"; query: string; primary: SearchResult }
  | { type: "definition"; query: string; primary: SearchResult }
  | ({ type: "conjugation" } & VerbCardEntry)
  | ({ type: "tense"; tense: string; tenseLabel: string } & VerbCardEntry)
  | { type: "conjugation_multi"; query: string; verbs: VerbCardEntry[] }
  | { type: "tense_multi"; query: string; tense: string; tenseLabel: string; verbs: VerbCardEntry[] }
  | { type: "comparison"; topic: SearchResult }
  | { type: "grammar"; topic: SearchResult };

export interface SearchOutput {
  intent: DetectedIntent;
  smartCard: SmartResultCard | null;
  results: SearchResult[];
}
