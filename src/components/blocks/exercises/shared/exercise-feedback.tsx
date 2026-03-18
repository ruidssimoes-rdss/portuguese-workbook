"use client";

import { useEffect } from "react";
import type { AnswerResult } from "@/types/blocks";
import { patterns } from "@/lib/design-tokens";

interface ExerciseFeedbackProps {
  result: AnswerResult;
  onContinue: () => void;
  explanation?: string | null;
  tip?: string | null;
  explanationLoading?: boolean;
  milestone?: string | null;
  className?: string;
}

export function ExerciseFeedback({
  result,
  onContinue,
  explanation,
  tip,
  explanationLoading,
  milestone,
  className,
}: ExerciseFeedbackProps) {
  // Auto-advance on correct after 2s (only if no explanation loading)
  useEffect(() => {
    if (result.correct && !explanationLoading) {
      const timer = setTimeout(onContinue, 2000);
      return () => clearTimeout(timer);
    }
  }, [result.correct, explanationLoading, onContinue]);

  // Keyboard: Enter/Space to continue
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onContinue();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onContinue]);

  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-40 feedback-enter ${className ?? ""}`}
      onClick={onContinue}
      role="button"
      tabIndex={0}
    >
      <div
        className={`max-w-[640px] mx-auto px-6 py-5 rounded-t-xl shadow-lg ${
          result.correct
            ? "bg-emerald-50 border-t-[3px] border-t-emerald-500"
            : "bg-red-50 border-t-[3px] border-t-red-400"
        }`}
      >
        {/* Milestone */}
        {milestone && (
          <p className="text-[14px] font-medium text-[#003399] mb-3 fade-in">
            {milestone}
          </p>
        )}

        {/* Result header */}
        <div className="flex items-start gap-3">
          {result.correct ? (
            <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 success-pulse">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          ) : (
            <span className="w-7 h-7 rounded-full bg-red-400 text-white flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2L10 10M10 2L2 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-[16px] font-semibold ${result.correct ? "text-emerald-700" : "text-red-700"}`}>
              {result.correct ? "Correct!" : "Not quite"}
            </p>

            {result.correct && (
              <p className="text-[14px] text-emerald-600 mt-0.5">
                {result.userAnswer}
              </p>
            )}

            {!result.correct && (
              <>
                <p className="text-[14px] text-red-600 line-through mt-0.5">
                  {result.userAnswer}
                </p>
                <p className="text-[14px] font-medium text-[#111827] mt-0.5">
                  {result.expectedAnswer}
                </p>
              </>
            )}
          </div>
        </div>

        {/* AI Explanation */}
        {(explanation || explanationLoading) && (
          <div className="border-t border-[#E5E7EB] mt-3 pt-3">
            {explanationLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-[#E5E7EB] rounded w-3/4" />
                <div className="h-3 bg-[#E5E7EB] rounded w-1/2" />
              </div>
            ) : (
              <>
                <p className="text-[13px] text-[#374151] leading-relaxed">{explanation}</p>
                {tip && (
                  <p className="text-[12px] text-[#6B7280] italic mt-1">{tip}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Continue button */}
        <button
          className={`${patterns.button.primary} w-full py-3 mt-4`}
          onClick={(e) => { e.stopPropagation(); onContinue(); }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
