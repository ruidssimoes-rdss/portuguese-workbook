import type { ElisioAbout } from "@/lib/book/types";

export type ElisioKind = "section" | "grammar" | "word" | "verb" | "culture";

export interface ElisioContext {
  /** Lesson id, e.g. "a1-01". */
  currentId: string;
  /** How far the learner has got: the later of viewing and resume in course order. */
  frontierId: string;
  /** All lesson ids in course order (from loadCourseLessons, passed in). */
  order: string[];
  /** Set when opened from a passage or card. */
  about?: ElisioAbout;
}

/** `section: null` is a chapter link without a §. */
export interface ElisioSource {
  lessonId: string;
  section: number | null;
}

export interface ElisioTag {
  text: string;
  tone: "in" | "later" | "library";
  note?: string;
}

export interface ElisioAnswer {
  kind: ElisioKind;
  id: string;
  title: string;
  /** English, max 240 chars, cut at a word with … */
  explanation: string;
  example: { pt: string; en?: string } | null;
  tag: ElisioTag;
  link: { href: string; label: string };
  score: number;
}

export type ElisioResult = { type: "answer"; answer: ElisioAnswer } | { type: "none"; closest: ElisioAnswer[] }; // closest: 0 to 3
