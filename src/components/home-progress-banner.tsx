"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProgress } from "@/lib/progress";
import type { UserProgress } from "@/types/levels";
import { PROGRESS_STORAGE_KEY } from "@/types/levels";

const SECTION_COLORS = {
  conjugations: "#3B82F6",
  vocabulary: "#22C55E",
  grammar: "#F59E0B",
} as const;

const SECTION_LABELS = {
  conjugations: "Conjugations",
  vocabulary: "Vocabulary",
  grammar: "Grammar",
} as const;

export function HomeProgressBanner() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  const refreshProgress = () => setProgress(getProgress());

  useEffect(() => {
    refreshProgress();
  }, []);

  useEffect(() => {
    const onFocus = () => refreshProgress();
    const onStorage = (e: StorageEvent) => {
      if (e.key === PROGRESS_STORAGE_KEY) refreshProgress();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (progress === null) return null;

  const hasAnyTest =
    progress.conjugations.completedAt ||
    progress.vocabulary.completedAt ||
    progress.grammar.completedAt;

  if (hasAnyTest) {
    return (
      <section className="pb-8">
        <Link
          href="/dashboard"
          className="flex flex-wrap items-center justify-between gap-4 border border-border rounded-xl p-4 bg-white hover:border-[#ccc] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-text-3"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-[13px] text-text-3 font-medium">Your level:</span>
            <span className="flex items-center gap-2">
              <span
                className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: SECTION_COLORS.conjugations }}
              >
                {progress.conjugations.level}
              </span>
              <span className="text-[13px] text-text-2">{SECTION_LABELS.conjugations}</span>
            </span>
            <span className="flex items-center gap-2">
              <span
                className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: SECTION_COLORS.vocabulary }}
              >
                {progress.vocabulary.level}
              </span>
              <span className="text-[13px] text-text-2">{SECTION_LABELS.vocabulary}</span>
            </span>
            <span className="flex items-center gap-2">
              <span
                className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: SECTION_COLORS.grammar }}
              >
                {progress.grammar.level}
              </span>
              <span className="text-[13px] text-text-2">{SECTION_LABELS.grammar}</span>
            </span>
          </div>
          <span className="text-[13px] font-medium text-text-2 hover:text-text transition-colors duration-150">
            View Dashboard →
          </span>
        </Link>
      </section>
    );
  }

  return (
    <section className="pb-8">
      <Link
        href="/dashboard"
        className="text-[13px] text-text-2 hover:text-text transition-colors duration-150 inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-text-3 rounded"
      >
        Discover your Portuguese level
        <span className="inline-block animate-arrow-pulse">→</span>
      </Link>
    </section>
  );
}
