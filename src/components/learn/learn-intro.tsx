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
    level === "A1" ? "text-[#0F6E56] bg-[#E1F5EE]" :
    level === "A2" ? "text-[#185FA5] bg-[#E6F1FB]" :
    "text-[#854F0B] bg-[#FAEEDA]";
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
        className="text-[13px] text-[#9B9DA3] hover:text-[#6C6B71] transition-colors"
      >
        ← Back to lessons
      </Link>

      {/* Title */}
      <h1 className="text-[22px] font-medium text-[#111111] tracking-[-0.02em] mt-6">
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
              className="flex-1 border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg py-4 px-2 text-center"
            >
              <div className="text-[24px] font-medium text-[#111111]">{s.value}</div>
              <div className="text-[11px] text-[#9B9DA3] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Meta */}
      <p className="text-[12px] text-[#9B9DA3] mt-4">
        {sectionCount} exercises · 80% to pass
      </p>

      {/* Buttons */}
      <div className="mt-6 space-y-2">
        <button
          type="button"
          onClick={onStartExercises}
          className="w-full py-3.5 text-[14px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] transition-colors cursor-pointer"
        >
          {isReview ? "Start review →" : "Start exercises →"}
        </button>
        {!isReview && learnItems.length > 0 && (
          <button
            type="button"
            onClick={onReviewFirst}
            className="w-full py-3.5 text-[14px] font-medium text-[#6C6B71] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg hover:border-[rgba(0,0,0,0.12)] transition-colors cursor-pointer"
          >
            Review material first
          </button>
        )}
      </div>
    </div>
  );
}
