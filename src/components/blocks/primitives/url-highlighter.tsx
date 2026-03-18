"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";

interface UseUrlHighlightOptions {
  paramName?: string;
  scrollDelay?: number;
  highlightDuration?: number;
}

export function useUrlHighlight(options: UseUrlHighlightOptions = {}) {
  const { paramName = "highlight", scrollDelay = 100, highlightDuration = 2000 } = options;
  const searchParams = useSearchParams();
  const highlightValue = searchParams.get(paramName);

  const [activeId, setActiveId] = useState<string | null>(null);
  const refs = useRef<Map<string, React.RefObject<HTMLElement>>>(new Map());

  useEffect(() => {
    if (!highlightValue) return;
    const decoded = decodeURIComponent(highlightValue);
    setActiveId(decoded);

    const scrollTimer = setTimeout(() => {
      const ref = refs.current.get(decoded);
      ref?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      // Also try direct ID-based scroll
      document.getElementById(decoded)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, scrollDelay);

    const fadeTimer = setTimeout(() => setActiveId(null), highlightDuration);

    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(fadeTimer);
    };
  }, [highlightValue, scrollDelay, highlightDuration]);

  const isHighlighted = useCallback((id: string) => activeId === id, [activeId]);

  const registerRef = useCallback((id: string, ref: React.RefObject<HTMLElement>) => {
    refs.current.set(id, ref);
  }, []);

  const highlightClass = "url-highlight";

  return { highlightId: activeId, isHighlighted, highlightClass, registerRef };
}
