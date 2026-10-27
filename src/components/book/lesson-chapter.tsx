"use client";

import type { CurriculumLesson } from "@/data/curriculum-types";
import { getChapterContent } from "@/data/chapters";
import { ChapterBody } from "@/components/chapter/chapter-body";

export function lessonListenLines(lesson: CurriculumLesson): string[] {
  return [lesson.titlePt, lesson.descriptionPt].filter(Boolean);
}

/** A curriculum lesson read as a chapter. Practice opens in the dock. */
export function LessonChapter({ lesson }: { lesson: CurriculumLesson }) {
  return <ChapterBody lesson={lesson} content={getChapterContent(lesson.id)} />;
}
