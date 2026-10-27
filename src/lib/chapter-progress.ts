"use client";

import { useEffect, useState } from "react";

export interface ChapterProgress {
  total: number;
  reached: number;
  titles: string[];
}

/** The visible chapter scroller. The page can briefly hold a hidden twin, so take the one that has size. */
function findScroller(): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>("#aula-scroll"));
  return all.find((el) => el.getBoundingClientRect().width > 0 && el.querySelector("[data-chapter-section]")) ?? null;
}

const KEY = (lessonId: string) => `aula:chapter-reached:${lessonId}`;

function readStored(lessonId: string): number {
  try {
    const n = Number(localStorage.getItem(KEY(lessonId)));
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch {
    return 0;
  }
}

function writeStored(lessonId: string, value: number) {
  try {
    localStorage.setItem(KEY(lessonId), String(value));
  } catch {
    /* works without storage */
  }
}

/**
 * How far down the chapter the reader has scrolled, counted in sections.
 * Watches #aula-scroll and the sections marked data-chapter-section.
 * `reached` never goes down (kept in localStorage). `liveReached` is what this page has
 * measured itself, so a restored value alone never counts as reading.
 */
export function useChapterProgress(lessonId: string): ChapterProgress & { live: boolean; liveReached: number } {
  const [state, setState] = useState<ChapterProgress & { live: boolean; liveReached: number }>({ total: 0, reached: 0, titles: [], live: false, liveReached: 0 });

  useEffect(() => {
    let frame = 0;
    let observed: HTMLElement | null = null;
    let best = readStored(lessonId);

    function measure() {
      frame = 0;
      const scroller = findScroller();
      if (!scroller) return;
      if (scroller !== observed) {
        observer.disconnect();
        observer.observe(scroller, { childList: true, subtree: true });
        observed = scroller;
      }
      const sections = Array.from(scroller.querySelectorAll<HTMLElement>("[data-chapter-section]"));
      const total = sections.length;
      if (total === 0) return;
      const titles = sections.map((el) => el.dataset.title ?? "");
      const line = scroller.getBoundingClientRect().top + scroller.clientHeight * 0.35;
      let reached = sections.filter((el) => el.getBoundingClientRect().top <= line).length;
      if (scroller.scrollHeight <= scroller.clientHeight + 4) {
        // The chapter fits on screen: nothing to scroll, so it has been seen.
        reached = total;
      } else if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4) {
        reached = total;
      }
      if (reached > best) {
        best = Math.min(reached, total);
        writeStored(lessonId, best);
      }
      setState((prev) => {
        const next = Math.min(Math.max(prev.reached, best, reached), total);
        const same = prev.total === total && prev.reached === next && prev.liveReached === reached && prev.live && prev.titles.join("|") === titles.join("|");
        return same ? prev : { total, reached: next, titles, live: true, liveReached: reached };
      });
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    // scroll does not bubble, so listen in the capture phase and measure whichever scroller moved
    document.addEventListener("scroll", schedule, { passive: true, capture: true });
    window.addEventListener("resize", schedule);
    const observer = new MutationObserver(schedule);
    // until a scroller with sections exists, watch the body for it to appear
    observer.observe(document.body, { childList: true, subtree: true });
    schedule();

    return () => {
      document.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [lessonId]);

  return state;
}
