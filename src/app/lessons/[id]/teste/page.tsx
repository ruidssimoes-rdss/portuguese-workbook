/*
 * /lessons/[id]/teste: the chapter test. It takes over the canvas (no PageShell,
 * no sidebar, no rail). The attempt lives in memory; results are saved on the
 * result screen only.
 */
"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { useCourseSnapshot } from "@/components/course/use-course";
import { ChapterTestRunner } from "@/components/test/chapter-test-runner";
import { getChapterContent } from "@/data/chapters";
import { getCurriculumLesson } from "@/data/resolve-lessons";
import { setViewingId } from "@/lib/course-path";

function TestPage({ id }: { id: string }) {
  const router = useRouter();
  const lesson = getCurriculumLesson(id);
  const course = useCourseSnapshot();

  useEffect(() => {
    if (!lesson) router.replace("/lessons");
    else setViewingId(id);
  }, [lesson, id, router]);

  if (!lesson) return null;
  return <ChapterTestRunner lesson={lesson} content={getChapterContent(id)} read={course.read.has(id)} ready={course.ready} />;
}

export default function ChapterTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRoute>
      <TestPage id={id} />
    </ProtectedRoute>
  );
}
