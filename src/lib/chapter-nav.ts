import { A1_LESSONS, A2_LESSONS, B1_LESSONS } from "@/data/curriculum";
import type { CurriculumLesson } from "@/data/curriculum-types";

const COURSE: CurriculumLesson[] = [...A1_LESSONS, ...A2_LESSONS, ...B1_LESSONS];

export interface ChapterPlace {
  /** "A1" */
  level: string;
  /** 1-based position inside the level */
  index: number;
  /** chapters in the level */
  count: number;
  /** "A1.1" */
  label: string;
  /** Next chapter in the same level, or null on the last one. */
  nextInLevel: CurriculumLesson | null;
  /** Next chapter in course order across levels, or null after the last. */
  next: CurriculumLesson | null;
}

export function chapterLabel(lesson: CurriculumLesson): string {
  const same = COURSE.filter((item) => item.cefrLevel === lesson.cefrLevel);
  return `${lesson.cefrLevel}.${same.findIndex((item) => item.id === lesson.id) + 1}`;
}

export function chapterPlace(lesson: CurriculumLesson): ChapterPlace {
  const same = COURSE.filter((item) => item.cefrLevel === lesson.cefrLevel);
  const at = same.findIndex((item) => item.id === lesson.id);
  const all = COURSE.findIndex((item) => item.id === lesson.id);
  return {
    level: lesson.cefrLevel,
    index: at + 1,
    count: same.length,
    label: `${lesson.cefrLevel}.${at + 1}`,
    nextInLevel: at >= 0 ? (same[at + 1] ?? null) : null,
    next: all >= 0 ? (COURSE[all + 1] ?? null) : null,
  };
}
