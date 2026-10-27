"use client";

import { useEffect, useState } from "react";
import type { CurriculumLesson } from "@/data/curriculum-types";
import { useAuth } from "@/components/auth-provider";
import {
  COURSE_EVENT,
  ensureReadSeed,
  ensureTestSeed,
  getViewingId,
  isChapterDone,
  loadCourseLessons,
  passedIds,
  practicedIds,
  readIds,
  reconcileResume,
  syncPracticed,
} from "@/lib/course-path";

export interface CourseSnapshot {
  ready: boolean;
  lessons: CurriculumLesson[];
  practiced: Set<string>;
  passed: Set<string>;
  read: Set<string>;
  resume: CurriculumLesson | null;
  viewingId: string | null;
  finished: boolean;
}

const EMPTY: CourseSnapshot = {
  ready: false,
  lessons: [],
  practiced: new Set(),
  passed: new Set(),
  read: new Set(),
  resume: null,
  viewingId: null,
  finished: false,
};

export function useCourseSnapshot(): CourseSnapshot {
  const { user, loading: authLoading } = useAuth();
  const [snap, setSnap] = useState<CourseSnapshot>(EMPTY);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    window.addEventListener(COURSE_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(COURSE_EVENT, bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    async function load() {
      const lessons = await loadCourseLessons();
      let practiced = practicedIds();
      if (user) {
        try {
          const { getLessonProgressMap } = await import("@/lib/lesson-progress");
          const map = await getLessonProgressMap();
          const ids = Object.entries(map)
            .filter(([, row]) => row.completed)
            .map(([id]) => id);
          ensureReadSeed(ids);
          syncPracticed(ids);
          practiced = new Set(ids);
        } catch {
          ensureReadSeed(practiced);
        }
      } else {
        ensureReadSeed([]);
      }
      if (cancelled) return;
      ensureTestSeed(readIds());
      const read = readIds();
      const passed = passedIds();
      const resume = reconcileResume(lessons, practiced);
      setSnap({
        ready: true,
        lessons,
        practiced,
        passed,
        read,
        resume,
        viewingId: getViewingId(),
        finished: resume == null && lessons.length > 0,
      });
    }

    load().catch(() => {
      if (!cancelled) setSnap((prev) => ({ ...prev, ready: true }));
    });
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, tick]);

  return snap;
}

export function chapterDone(id: string, snap: CourseSnapshot): boolean {
  return isChapterDone(id, snap.practiced, snap.read, snap.passed);
}
