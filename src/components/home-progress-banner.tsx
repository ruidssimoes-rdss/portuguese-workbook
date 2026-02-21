"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { getProgress } from "@/lib/progress-service";
import type { UserProgress } from "@/types/levels";
import { PROGRESS_STORAGE_KEY } from "@/types/levels";

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
    const sections = [
      { key: "conjugations" as const, label: "Conjugations", level: progress.conjugations.currentLevel },
      { key: "vocabulary" as const, label: "Vocabulary", level: progress.vocabulary.currentLevel },
      { key: "grammar" as const, label: "Grammar", level: progress.grammar.currentLevel },
    ];
    return (
      <>
        <div className="space-y-2">
          {sections.map((s) => (
            <div key={s.key} className="flex items-center justify-between text-[13px]">
              <span className="text-[#374151] font-medium capitalize">{s.label}</span>
              <span className="text-[#9CA3AF]">{s.level}</span>
            </div>
          ))}
        </div>
        <Link
          href="/dashboard"
          className="text-[13px] font-medium text-[#3C5E95] hover:text-[#2E4A75] mt-3 inline-block transition-colors"
        >
          View full progress →
        </Link>
      </>
    );
  }

  return (
    <>
      <p className="text-[14px] text-[#374151] mb-1">
        Track your learning progress
      </p>
      <p className="text-[13px] text-[#9CA3AF] mb-4">
        Take placement tests in conjugations, vocabulary, and grammar to see where you stand.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center px-4 py-2.5 bg-[#111827] text-white text-[13px] font-medium rounded-[10px] hover:bg-[#1F2937] transition-colors duration-200"
      >
        Go to Dashboard →
      </Link>
    </>
  );
}
