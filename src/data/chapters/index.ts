import type { ChapterContent } from "../chapter-types";
import { A1_01 } from "./a1-01";

const CHAPTERS: Record<string, ChapterContent> = {
  "a1-01": A1_01,
};

export function getChapterContent(lessonId: string): ChapterContent | null {
  return CHAPTERS[lessonId] ?? null;
}
