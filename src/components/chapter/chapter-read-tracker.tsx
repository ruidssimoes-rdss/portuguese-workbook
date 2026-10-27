"use client";

import { useEffect, useRef } from "react";
import type { CurriculumLesson } from "@/data/curriculum-types";
import { useChapterProgress } from "@/lib/chapter-progress";
import { markChapterRead, reconcileResume } from "@/lib/course-path";
import { useCourseSnapshot } from "@/components/course/use-course";

/** Marks the chapter read once the reader has seen all of it. Mounts at every breakpoint, unlike the rail. */
export function ChapterReadTracker({ lesson }: { lesson: CurriculumLesson }) {
  const course = useCourseSnapshot();
  const progress = useChapterProgress(lesson.id);
  const read = course.read.has(lesson.id);
  const marked = useRef(false);
  const { total, liveReached } = progress;

  useEffect(() => {
    if (marked.current || read || !course.ready || total === 0 || liveReached < total) return;
    marked.current = true;
    markChapterRead(lesson.id);
    reconcileResume(course.lessons, course.practiced);
  }, [read, course.ready, course.lessons, course.practiced, total, liveReached, lesson.id]);

  return null;
}
