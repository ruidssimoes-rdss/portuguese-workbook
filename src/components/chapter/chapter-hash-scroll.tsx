"use client";

import { useEffect } from "react";

/** Opens the chapter at #section-n (from a test miss) once the body has rendered. */
export function ChapterHashScroll() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!/^#section-\d+$/.test(hash)) return;
    const started = performance.now();
    let frame = 0;
    function tryScroll() {
      const scroller = Array.from(document.querySelectorAll<HTMLElement>("#aula-scroll")).find((el) => el.getBoundingClientRect().width > 0);
      const target = scroller?.querySelector<HTMLElement>(hash);
      if (target) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
      if (performance.now() - started < 2000) frame = requestAnimationFrame(tryScroll);
    }
    tryScroll();
    return () => cancelAnimationFrame(frame);
  }, []);
  return null;
}
