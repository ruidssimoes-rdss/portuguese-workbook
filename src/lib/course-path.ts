/**
 * One course path over the curriculum that already exists.
 *
 * Resume (aula-course-resume) is the next chapter that is not finished.
 * Viewing (aula-course-viewing) is whichever chapter is open.
 * Opening a chapter from search writes viewing only.
 *
 * A chapter is finished when its reading is marked and its practice has passed.
 * Both live on this device. Practice also stays in user_lesson_progress.
 * Marking a card reviewed does not call into this module.
 */

import type { CurriculumLesson } from "@/data/curriculum-types";

export const COURSE_EVENT = "aula-course";

const READ_KEY = "aula-course-read";
const RESUME_KEY = "aula-course-resume";
const VIEW_KEY = "aula-course-viewing";
const PRACTICE_KEY = "aula-course-practiced";
const SEEDED_KEY = "aula-course-read-seeded";

function canStore(): boolean {
  return typeof window !== "undefined";
}

function readList(key: string): string[] {
  if (!canStore()) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeList(key: string, ids: Iterable<string>) {
  if (!canStore()) return;
  try {
    localStorage.setItem(key, JSON.stringify([...ids]));
  } catch {
    /* quota — the in-memory set for this tick still updates the UI */
  }
}

function emit() {
  if (!canStore()) return;
  window.dispatchEvent(new Event(COURSE_EVENT));
}

export function readIds(): Set<string> {
  return new Set(readList(READ_KEY));
}

export function practicedIds(): Set<string> {
  return new Set(readList(PRACTICE_KEY));
}

export function getResumeId(): string | null {
  if (!canStore()) return null;
  try {
    return localStorage.getItem(RESUME_KEY);
  } catch {
    return null;
  }
}

export function getViewingId(): string | null {
  if (!canStore()) return null;
  try {
    return localStorage.getItem(VIEW_KEY);
  } catch {
    return null;
  }
}

/** Currently open chapter. Does not move the course resume pointer. */
export function setViewingId(id: string) {
  if (!canStore()) return;
  try {
    if (localStorage.getItem(VIEW_KEY) === id) return;
    localStorage.setItem(VIEW_KEY, id);
  } catch {
    return;
  }
  emit();
}

export function markChapterRead(id: string) {
  const ids = readIds();
  if (ids.has(id)) return;
  ids.add(id);
  writeList(READ_KEY, ids);
  emit();
}

/**
 * Chapters already passed before this device started tracking reading
 * count as read, so nobody is sent back to chapter 1.
 */
export function ensureReadSeed(serverCompleted: Iterable<string>) {
  if (!canStore()) return;
  try {
    if (localStorage.getItem(SEEDED_KEY)) return;
    const ids = readIds();
    for (const id of serverCompleted) ids.add(id);
    writeList(READ_KEY, ids);
    localStorage.setItem(SEEDED_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function syncPracticed(ids: Iterable<string>) {
  writeList(PRACTICE_KEY, ids);
}

export function rememberPractice(id: string) {
  const ids = practicedIds();
  if (ids.has(id)) return;
  ids.add(id);
  writeList(PRACTICE_KEY, ids);
}

export function orderLessons(lessons: CurriculumLesson[]): CurriculumLesson[] {
  return [...lessons].sort((a, b) => a.number - b.number || a.id.localeCompare(b.id));
}

export function isChapterDone(id: string, practiced: Set<string>, read: Set<string>): boolean {
  // Practice never gates (locked 25 Oct). Brief 4 adds the chapter test.
  return read.has(id);
}

export function nextIncomplete(
  lessons: CurriculumLesson[],
  practiced: Set<string>,
  read: Set<string>,
): CurriculumLesson | null {
  return orderLessons(lessons).find((lesson) => !isChapterDone(lesson.id, practiced, read)) ?? null;
}

/** Writes resume only from completion, never from the chapter being viewed. */
export function reconcileResume(lessons: CurriculumLesson[], practiced: Set<string>): CurriculumLesson | null {
  const ordered = orderLessons(lessons);
  const next = nextIncomplete(ordered, practiced, readIds());
  const id = next?.id ?? ordered.at(-1)?.id ?? null;
  if (id && canStore()) {
    try {
      if (localStorage.getItem(RESUME_KEY) !== id) {
        localStorage.setItem(RESUME_KEY, id);
        emit();
      }
    } catch {
      /* ignore */
    }
  }
  return next;
}

export async function loadCourseLessons(): Promise<CurriculumLesson[]> {
  const data = await import("@/data/curriculum");
  return orderLessons([...data.A1_LESSONS, ...data.A2_LESSONS, ...data.B1_LESSONS, ...data.EXTRA_LESSONS]);
}

/** After a passing practice save. Does not mark the chapter read. */
export async function notePracticeSaved(lessonId: string): Promise<void> {
  rememberPractice(lessonId);
  try {
    const { getLessonProgressMap } = await import("@/lib/lesson-progress");
    const map = await getLessonProgressMap();
    const ids = Object.entries(map)
      .filter(([, row]) => row.completed)
      .map(([id]) => id);
    if (!ids.includes(lessonId)) ids.push(lessonId);
    syncPracticed(ids);
  } catch {
    /* rememberPractice already kept this pass on the device */
  }
  const lessons = await loadCourseLessons();
  reconcileResume(lessons, practicedIds());
  emit();
}
