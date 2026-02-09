export interface VocabWord {
  portuguese: string;
  english: string;
  cefr: "A1" | "A2" | "B1";
  gender: "m" | "f" | null;
  example: string;
  exampleTranslation: string;
  /** Simplified phonetic transcription (e.g. bah-KAH-noo) */
  pronunciation?: string;
}

export interface VocabCategory {
  id: string;
  title: string;
  description: string;
  words: VocabWord[];
}

export interface VocabData {
  categories: VocabCategory[];
}
