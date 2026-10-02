"use client";

import Link from "next/link";
import type { GeneratedLesson } from "@/lib/exercise-generator";

interface LearnIntroProps {
  lessonTitle: string;
  lessonTitlePt: string;
  cefr: string;
  isReview: boolean;
  generated: GeneratedLesson;
  onStartExercises: () => void;
  onReviewFirst: () => void;
}

function CEFRPill({ level }: { level: string }) {
  const c =
    level === "A1" ? "text-[#1F7A68] bg-[#E1F2ED]" :
    level === "A2" ? "text-[#1B2B61] bg-[#E8ECF6]" :
    "text-[#5B45B8] bg-[#ECE8F8]";
  return <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${c}`}>{level}</span>;
}

export function LearnIntro({
  lessonTitle,
  lessonTitlePt,
  cefr,
  isReview,
  generated,
  onStartExercises,
  onReviewFirst,
}: LearnIntroProps) {
  const learnItems = generated.learnItems ?? [];
  const vocabCount = learnItems.filter((i) => i.type === "vocab").length;
  const verbCount = learnItems.filter((i) => i.type === "verb").length;
  const grammarCount = learnItems.filter((i) => i.type === "grammar").length;
  const cultureCount = learnItems.filter((i) => i.type === "culture").length;
  const sectionCount = generated.sections.length;

  const stats = [
    { value: vocabCount, label: "words" },
    { value: verbCount, label: "verbs" },
    { value: grammarCount, label: "topics" },
    { value: cultureCount, label: "culture" },
  ].filter((s) => s.value > 0);

  return (
    <div className="max-w-md mx-auto text-center py-12">
      {/* Back */}
      <Link
        href="/lessons"
        className="text-[13px] text-[#98988F] hover:text-[#6B6B69] transition-colors"
      >
        ← Back to lessons
      </Link>

      {/* Title */}
      <h1 className="text-[22px] font-medium text-[#1F1F1F] tracking-[-0.02em] mt-6">
        {isReview ? "Review session" : "Your next lesson"}
      </h1>

      {/* CEFR badge */}
      {cefr && cefr !== "mixed" && (
        <div className="mt-3">
          <CEFRPill level={cefr} />
        </div>
      )}

      {/* Stat boxes */}
      {stats.length > 0 && (
        <div className="flex gap-3 mt-6">
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex-1 border-[0.5px] border-[#E6E6E4] rounded-lg py-4 px-2 text-center"
            >
              <div className="text-[24px] font-medium text-[#1F1F1F]">{s.value}</div>
              <div className="text-[11px] text-[#98988F] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Meta */}
      <p className="text-[12px] text-[#98988F] mt-4">
        {sectionCount} exercises · 80% to pass
      </p>

      {/* Buttons */}
      <div className="mt-6 space-y-2">
        <button
          type="button"
          onClick={onStartExercises}
          className="w-full py-3.5 text-[14px] font-medium text-white bg-[#1B2B61] rounded-lg hover:bg-[#14214C] transition-colors cursor-pointer"
        >
          {isReview ? "Start review →" : "Start exercises →"}
        </button>
        {!isReview && learnItems.length > 0 && (
          <button
            type="button"
            onClick={onReviewFirst}
            className="w-full py-3.5 text-[14px] font-medium text-[#6B6B69] border-[0.5px] border-[#E6E6E4] rounded-lg hover:border-[#CFCFCB] transition-colors cursor-pointer"
          >
            Review material first
          </button>
        )}
      </div>
    </div>
  );
}
