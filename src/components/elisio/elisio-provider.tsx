"use client";

/**
 * One Elísio for the whole app. Lives in the root layout so the thread survives page changes.
 * The thread is kept in sessionStorage (questions and their chapter only; answers are recomputed).
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { COURSE_EVENT, getResumeId, getViewingId, loadCourseLessons } from "@/lib/course-path";
import type { ElisioAbout } from "@/lib/book/types";
import type { ElisioContext } from "@/lib/elisio/types";

const THREAD_KEY = "aula-elisio-thread";
const THREAD_CAP = 30;
export const ELISIO_PARAM = "elisio";

export interface ElisioEntry {
  id: string;
  question: string;
  currentId: string;
  at: string;
}

export interface ElisioApi {
  open: boolean;
  /** Null until the course order has loaded. */
  context: ElisioContext | null;
  thread: ElisioEntry[];
  openElisio: (about?: ElisioAbout) => void;
  closeElisio: () => void;
  ask: (question: string) => void;
}

function readThread(): ElisioEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(THREAD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { entries?: ElisioEntry[] };
    return Array.isArray(parsed.entries) ? parsed.entries.filter((e) => e && typeof e.question === "string") : [];
  } catch {
    return [];
  }
}

function writeThread(entries: ElisioEntry[]) {
  try {
    sessionStorage.setItem(THREAD_KEY, JSON.stringify({ entries }));
  } catch {
    /* the thread still shows for this page */
  }
}

/** Current chapter: the one being viewed, else the resume point, else A1.1. Frontier: the later of viewing and resume. */
function buildContext(order: string[], about?: ElisioAbout): ElisioContext {
  const viewing = getViewingId();
  const resume = getResumeId();
  const currentId = viewing ?? resume ?? "a1-01";
  const at = (id: string | null) => (id ? order.indexOf(id) : -1);
  const frontierId = at(resume) > at(viewing) ? (resume as string) : currentId;
  return { currentId, frontierId, order, ...(about ? { about } : {}) };
}

const ElisioCtx = createContext<ElisioApi | null>(null);

export function ElisioProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [about, setAbout] = useState<ElisioAbout | undefined>(undefined);
  const [thread, setThread] = useState<ElisioEntry[]>(readThread);
  const [order, setOrder] = useState<string[] | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void loadCourseLessons().then((lessons) => {
      if (!cancelled) setOrder(lessons.map((lesson) => lesson.id));
    });
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener(COURSE_EVENT, bump);
    // ?elisio=1 opens the rail (the old tutor page redirects here), then leaves the URL.
    const frame = requestAnimationFrame(() => {
      const url = new URL(window.location.href);
      if (url.searchParams.get(ELISIO_PARAM) !== "1") return;
      url.searchParams.delete(ELISIO_PARAM);
      const search = url.searchParams.toString();
      window.history.replaceState(window.history.state, "", `${url.pathname}${search ? `?${search}` : ""}${url.hash}`);
      setOpen(true);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.removeEventListener(COURSE_EVENT, bump);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      setOpen(false);
      setAbout(undefined);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const context = useMemo(() => {
    void version; // re-read viewing and resume when the course changes
    return order ? buildContext(order, open ? about : undefined) : null;
  }, [order, about, open, version]);

  const openElisio = useCallback((next?: ElisioAbout) => {
    setAbout(next);
    setOpen(true);
    setVersion((v) => v + 1);
  }, []);

  const closeElisio = useCallback(() => {
    setOpen(false);
    setAbout(undefined);
  }, []);

  const ask = useCallback((question: string) => {
    const text = question.trim().slice(0, 300);
    if (text.length < 2) return;
    const currentId = getViewingId() ?? getResumeId() ?? "a1-01";
    setThread((cur) => {
      const next = [...cur, { id: `${Date.now().toString(36)}-${cur.length}`, question: text, currentId, at: new Date().toISOString() }].slice(-THREAD_CAP);
      writeThread(next);
      return next;
    });
  }, []);

  const api = useMemo<ElisioApi>(() => ({ open, context, thread, openElisio, closeElisio, ask }), [open, context, thread, openElisio, closeElisio, ask]);
  return <ElisioCtx.Provider value={api}>{children}</ElisioCtx.Provider>;
}

const FALLBACK: ElisioApi = { open: false, context: null, thread: [], openElisio: () => {}, closeElisio: () => {}, ask: () => {} };

export function useElisio(): ElisioApi {
  return useContext(ElisioCtx) ?? FALLBACK;
}
