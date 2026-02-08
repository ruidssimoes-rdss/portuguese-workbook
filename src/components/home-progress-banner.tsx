"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProgress } from "@/lib/progress";
import type { UserProgress } from "@/types/levels";

const SECTION_COLORS = {
  conjugations: "#3B82F6",
  vocabulary: "#22C55E",
  grammar: "#F59E0B",
} as const;

export function HomeProgressBanner() {
  const [progress, setProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
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
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-text-2 hover:text-text transition-colors"
        >
          <span>Your level:</span>
          <span className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: SECTION_COLORS.conjugations }}
            />
            Conjugations {progress.conjugations.level}
          </span>
          <span className="text-text-3">·</span>
          <span className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: SECTION_COLORS.vocabulary }}
            />
            Vocabulary {progress.vocabulary.level}
          </span>
          <span className="text-text-3">·</span>
          <span className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: SECTION_COLORS.grammar }}
            />
            Grammar {progress.grammar.level}
          </span>
          <span className="text-text-3 ml-1">→</span>
        </Link>
      </section>
    );
  }

  return (
    <section className="pb-8">
      <Link
        href="/dashboard"
        className="text-[13px] text-text-2 hover:text-text transition-colors inline-flex items-center gap-1"
      >
        Take a placement test to find your level
        <span>→</span>
      </Link>
    </section>
  );
}
