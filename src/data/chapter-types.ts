export type VocabRow =
  | { kind: "word"; categoryId: string; portuguese: string } // library word, must be in the lesson's vocabulary refs
  | { kind: "row"; pt: string; phonetics: string; en: string; example: string }; // chapter-only row

export type ChapterBlock =
  | { type: "vocab"; header?: string; rows: VocabRow[] } // header overrides the "PT" column label (e.g. "Pronome")
  | { type: "conjugation"; items: { label: string; verbKey: string; tense: string }[] } // 1 item = full width, 2 = side by side
  | { type: "dialogue"; lines: { n: string; pt: string; phonetics: string; en: string }[] }
  | { type: "note"; title: string; body: string } // Callout Tone=Note
  | { type: "text"; body: string };

export interface ChapterSection {
  title: string; // rendered as "§n <title>"
  grammarTopic?: string; // grammar.json id; adds a quiet "Abrir em Gramática" link
  blocks: ChapterBlock[];
}

export interface ChapterRailContent {
  canDo: { text: string; section: number }[]; // section = the rendered § number (content sections come first, so §n = sections[n-1])
  drills: { prompt: string; answer: string; phonetics: string }[]; // phonetics without slashes; the UI adds them
  etiquette: { label: string; text: string }[];
  elisioTip: string;
}

export interface ChapterContent {
  lessonId: string;
  sections: ChapterSection[];
  culturaIntro: string;
  mustKnow: string[];
  rail: ChapterRailContent;
}
