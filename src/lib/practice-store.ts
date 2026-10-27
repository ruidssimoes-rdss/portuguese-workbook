/**
 * Chapter practice state on this device: localStorage "aula-practice".
 * Same pattern as aula-course-read and aula-course-tests. No account sync.
 * Every write happens straight away, so closing the rail or reloading never loses the place.
 */

import type { Verdict } from "@/lib/practice-check";
import type { PracticeItem } from "@/lib/practice";

const KEY = "aula-practice";
const MISSED_CAP = 40;
const SEEN_CAP = 200;

export interface PracticeAnswer {
  id: string;
  given: string;
  verdict: Verdict;
}

export interface PracticeSession {
  items: string[];
  index: number;
  answers: PracticeAnswer[];
  plays: number;
  kind: "set" | "more";
  /** Construir tile order per item, shuffled once and kept for resume. */
  tiles?: Record<string, string[]>;
}

interface LessonPractice {
  session: PracticeSession | null;
  missed: string[];
  seen: { id: string; at: string }[];
}

type PracticeStore = Record<string, LessonPractice>;

function read(): PracticeStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as PracticeStore) : {};
  } catch {
    return {};
  }
}

function write(store: PracticeStore) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* storage full or blocked: the session still runs in memory */
  }
}

function entry(store: PracticeStore, lessonId: string): LessonPractice {
  const cur = store[lessonId];
  const next: LessonPractice = {
    session: cur?.session ?? null,
    missed: Array.isArray(cur?.missed) ? cur.missed : [],
    seen: Array.isArray(cur?.seen) ? cur.seen : [],
  };
  store[lessonId] = next;
  return next;
}

export function loadSession(lessonId: string): PracticeSession | null {
  const session = read()[lessonId]?.session;
  if (!session || !Array.isArray(session.items) || session.items.length === 0) return null;
  return session;
}

export function saveSession(lessonId: string, session: PracticeSession) {
  const store = read();
  entry(store, lessonId).session = session;
  write(store);
}

export function clearSession(lessonId: string) {
  const store = read();
  entry(store, lessonId).session = null;
  write(store);
}

/** Appends the answer to the session (advances nothing). Wrong and slip go to the item's own lesson's missed list; correct takes it off. */
export function recordAnswer(lessonId: string, item: PracticeItem, given: string, verdict: Verdict) {
  const store = read();
  const own = entry(store, lessonId);
  if (own.session && !own.session.answers.some((answer) => answer.id === item.id)) {
    own.session.answers = [...own.session.answers, { id: item.id, given, verdict }];
  }
  const home = entry(store, item.lessonId);
  const rest = home.missed.filter((id) => id !== item.id);
  home.missed = verdict === "correct" ? rest : [item.id, ...rest].slice(0, MISSED_CAP);
  write(store);
}

export function missedIds(lessonId: string): string[] {
  return read()[lessonId]?.missed ?? [];
}

/** Oldest first. */
export function seenIds(lessonId: string): string[] {
  return (read()[lessonId]?.seen ?? []).map((row) => row.id);
}

export function markSeen(lessonId: string, ids: string[]) {
  const store = read();
  const own = entry(store, lessonId);
  const at = new Date().toISOString();
  const fresh = new Set(ids);
  own.seen = [...own.seen.filter((row) => !fresh.has(row.id)), ...ids.map((id) => ({ id, at }))].slice(-SEEN_CAP);
  write(store);
}
