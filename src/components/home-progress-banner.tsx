"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { getProgress } from "@/lib/progress-service";
import type { UserProgress } from "@/types/levels";
import { PROGRESS_STORAGE_KEY } from "@/types/levels";

const SECTION_COLORS = {
  conjugations: "#3D6B9E",
  vocabulary: "#5B4FA0",
  grammar: "#4B5563",
} as const;

const SECTION_LABELS = {
  conjugations: "Conjugations",
  vocabulary: "Vocabulary",
  grammar: "Grammar",
} as const;

export function HomeProgressBanner() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);

  const refreshProgress = async () => {
    const p = await getProgress(user?.id);
    setProgress(p);
  };

  useEffect(() => {
    refreshProgress();
  }, [user?.id]);

  useEffect(() => {
    const onFocus = () => refreshProgress();
    const onStorage = (e: StorageEvent) => {
      if (e.key === PROGRESS_STORAGE_KEY && !user) refreshProgress();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, [user]);

  if (progress === null) return null;

  const hasAnyTest =
    progress.conjugations.totalTestsTaken > 0 ||
    progress.vocabulary.totalTestsTaken > 0 ||
    progress.grammar.totalTestsTaken > 0;

  if (hasAnyTest) {
    return (
      <section className="pb-8">
        <Link
          href="/dashboard"
          className="flex flex-wrap items-center justify-between gap-4 border border-border rounded-xl p-4 bg-white hover:border-[#ccc] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-text-3"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-[13px] text-text-3 font-medium">O teu progresso:</span>
            <span className="flex items-center gap-2">
              <span
                className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: SECTION_COLORS.conjugations }}
              >
                {progress.conjugations.currentLevel}
              </span>
              <span className="text-[13px] text-text-2">{SECTION_LABELS.conjugations}</span>
            </span>
            <span className="flex items-center gap-2">
              <span
                className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: SECTION_COLORS.vocabulary }}
              >
                {progress.vocabulary.currentLevel}
              </span>
              <span className="text-[13px] text-text-2">{SECTION_LABELS.vocabulary}</span>
            </span>
            <span className="flex items-center gap-2">
              <span
                className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: SECTION_COLORS.grammar }}
              >
                {progress.grammar.currentLevel}
              </span>
              <span className="text-[13px] text-text-2">{SECTION_LABELS.grammar}</span>
            </span>
          </div>
          <span className="text-[13px] font-medium text-text-2 hover:text-text transition-colors duration-150">
            Ver Progresso e Testes →
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
        Começa a tua jornada em português
        <span className="inline-block animate-arrow-pulse">→</span>
      </Link>
    </section>
  );
}
