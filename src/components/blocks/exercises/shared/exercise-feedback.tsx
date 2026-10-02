"use client";

import { useEffect } from "react";
import type { AnswerResult } from "@/types/blocks";

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
        className={`max-w-[640px] mx-auto px-6 py-5 rounded-t-lg ${
          result.correct
            ? "bg-[#E1F2ED] border-[0.5px] border-[rgba(15,110,86,0.2)] text-[#1F7A68]"
            : "bg-[#fef2f2] border-[0.5px] border-[rgba(220,38,38,0.2)] text-[#dc2626]"
        }`}
      >
        {/* Milestone */}
        {milestone && (
          <p className="text-[14px] font-medium text-[#1B2B61] mb-3 fade-in">
            {milestone}
          </p>
        )}

        {/* Result header */}
        <div className="flex items-start gap-3">
          {result.correct ? (
            <span className="w-7 h-7 rounded-full bg-[#1F7A68] text-white flex items-center justify-center shrink-0 success-pulse">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          ) : (
            <span className="w-7 h-7 rounded-full bg-[#dc2626] text-white flex items-center justify-center shrink-0">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2L10 10M10 2L2 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-[16px] font-medium ${result.correct ? "text-[#1F7A68]" : "text-[#dc2626]"}`}>
              {result.correct ? "Correct!" : "Not quite"}
            </p>

            {result.correct && (
              <p className="text-[14px] text-[#1F7A68] mt-0.5">
                {result.userAnswer}
              </p>
            )}

            {!result.correct && (
              <>
                <p className="text-[14px] text-[#dc2626] line-through mt-0.5">
                  {result.userAnswer}
                </p>
                <p className="text-[14px] font-medium text-[#1F1F1F] mt-0.5">
                  {result.expectedAnswer}
                </p>
              </>
            )}
          </div>
        </div>

        {/* AI Explanation */}
        {(explanation || explanationLoading) && (
          <div className="border-t border-[0.5px] border-[#E6E6E4] mt-3 pt-3">
            {explanationLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-[#E6E6E4] rounded w-3/4" />
                <div className="h-3 bg-[#E6E6E4] rounded w-1/2" />
              </div>
            ) : (
              <>
                <p className="text-[13px] text-[#6B6B69] leading-relaxed">{explanation}</p>
                {tip && (
                  <p className="text-[12px] text-[#98988F] italic mt-1">{tip}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Continue button */}
        <button
          className="bg-[#1B2B61] text-white text-[14px] font-medium rounded-lg px-5 py-2.5 hover:bg-[#1B2B61]/90 transition-all duration-150 ease-out w-full py-3 mt-4"
          onClick={(e) => { e.stopPropagation(); onContinue(); }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
