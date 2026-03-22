"use client";

import Link from "next/link";
import type { SectionResult } from "@/lib/exercise-types";

interface LearnResultsProps {
  passed: boolean;
  accuracy: number;
  sectionResults: SectionResult[];
  onRetry: () => void;
}

export function LearnResults({ passed, accuracy, sectionResults, onRetry }: LearnResultsProps) {
  const displayAccuracy = Math.round(accuracy);
  const totalCorrect = sectionResults.reduce((s, r) => s + r.totalCorrect, 0);
  const totalQuestions = sectionResults.reduce((s, r) => s + r.totalQuestions, 0);

  const wrongAnswers = sectionResults.flatMap((sr) =>
    sr.answers.filter((a) => !a.correct).map((a) => ({
      section: sr.sectionName,
      userAnswer: a.userAnswer,
      correctAnswer: a.correctAnswer,
    }))
  );

  return (
    <div className="max-w-md mx-auto text-center py-12">
      {/* Score */}
      <div className="text-[48px] font-medium text-[#111111] tracking-[-0.02em]">
        {displayAccuracy}%
      </div>

      {/* Pass / fail */}
      {passed ? (
        <div className="mt-2">
          <p className="text-[16px] font-medium text-[#0F6E56]">Lesson complete!</p>
          <p className="text-[13px] text-[#9B9DA3] italic mt-1">Lição completa</p>
        </div>
      ) : (
        <div className="mt-2">
          <p className="text-[16px] font-medium text-[#854F0B]">Not quite yet</p>
          <p className="text-[13px] text-[#9B9DA3] italic mt-1">Ainda não — tenta outra vez</p>
        </div>
      )}

      {/* Section breakdown */}
      <div className="mt-6 space-y-1.5 text-left">
        {sectionResults.map((sr, i) => {
          const pct = sr.totalQuestions > 0 ? sr.totalCorrect / sr.totalQuestions : 0;
          return (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-2.5 border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg"
            >
              <span className="text-[13px] text-[#111111]">{sr.sectionName}</span>
              <span
                className={`text-[13px] font-medium ${pct >= 0.8 ? "text-[#0F6E56]" : "text-[#854F0B]"}`}
              >
                {sr.totalCorrect}/{sr.totalQuestions}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#6C6B71]">Total correct</span>
          <span className={`text-[14px] font-medium ${passed ? "text-[#0F6E56]" : "text-[#854F0B]"}`}>
            {totalCorrect} / {totalQuestions}
          </span>
        </div>
      </div>

      {/* Wrong answers */}
      {wrongAnswers.length > 0 && (
        <div className="mt-4 text-left">
          <p className="text-[10px] text-[#9B9DA3] uppercase tracking-[0.05em] mb-2">
            Needs practice
          </p>
          <div className="space-y-1.5">
            {wrongAnswers.slice(0, 8).map((w, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#fef2f2] rounded-lg">
                <span className="text-[13px] text-[#dc2626] truncate mr-2">
                  {w.correctAnswer}
                </span>
                <span className="text-[12px] text-[#9B9DA3] shrink-0">
                  {w.section}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="mt-8 space-y-2">
        {passed ? (
          <Link
            href="/lessons"
            className="block w-full py-3.5 text-[14px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] transition-colors text-center"
          >
            Continue learning →
          </Link>
        ) : (
          <button
            type="button"
            onClick={onRetry}
            className="w-full py-3.5 text-[14px] font-medium text-white bg-[#111111] rounded-lg hover:bg-[#333] transition-colors cursor-pointer"
          >
            Try again
          </button>
        )}
        <Link
          href="/lessons"
          className="block w-full py-3.5 text-[14px] font-medium text-[#6C6B71] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg hover:border-[rgba(0,0,0,0.12)] transition-colors text-center"
        >
          Back to lessons
        </Link>
      </div>
    </div>
  );
}
