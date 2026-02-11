export interface VocabWord {
  portuguese: string;
  english: string;
  cefr: "A1" | "A2" | "B1";
  gender: "m" | "f" | null;
  example: string;
  exampleTranslation: string;
  /** Simplified phonetic transcription (e.g. bah-KAH-noo) */
  pronunciation?: string;
  /** Optional related words with short meanings */
  relatedWords?: Array<{ word: string; meaning: string }>;
  /** Optional pro tip for learners */
  proTip?: string;
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
