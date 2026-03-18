"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SessionShellProps, SessionResults } from "@/types/blocks";
import { patterns, spacing } from "@/lib/design-tokens";
import { cefrBadgeClasses } from "@/lib/design-tokens";
import { SessionNarrative } from "./session-narrative";

export function SessionShell({
  lessonTitle,
  lessonTitlePt,
  cefr,
  stages,
  currentStageIndex,
  onStageChange,
  onComplete,
  children,
}: SessionShellProps) {
  const router = useRouter();
  const [stageCompletion, setStageCompletion] = useState<Set<number>>(new Set());
  const [results, setResults] = useState<SessionResults | null>(null);

  const progress = stages.length > 0 ? ((currentStageIndex + 1) / stages.length) * 100 : 0;
  const isLast = currentStageIndex === stages.length - 1;

  function markStageComplete(index: number) {
    setStageCompletion((prev) => new Set([...prev, index]));
  }

  function handleComplete(sessionResults: SessionResults) {
    setResults(sessionResults);
    onComplete(sessionResults);
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m} min ${s} sec` : `${s} sec`;
  }

  // Results view
  if (results) {
    return (
      <div className={spacing.pageNarrow}>
        <div className="py-8">
          <p className="text-[16px] font-semibold text-[#111827] text-center mb-1">
            {results.passed ? "Passed!" : "Not yet \u2014 keep going!"}
          </p>

          <SessionNarrative
            results={results}
            className="mt-4"
          />

          <div className="mt-8 flex justify-center gap-3">
            {!results.passed && (
              <button
                onClick={() => {
                  setResults(null);
                  onStageChange(0);
                }}
                className={`${patterns.button.secondary} h-10 px-6`}
              >
                Retry
              </button>
            )}
            <button
              onClick={() => router.push("/lessons")}
              className={`${patterns.button.primary} h-10 px-6`}
            >
              {results.passed ? "Continue" : "Back to Lessons"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className={`${spacing.pageNarrow} flex items-center justify-between py-3`}>
        <button
          onClick={() => router.push("/lessons")}
          className={patterns.button.ghost}
        >
          &larr; Back
        </button>
        <div className="text-center">
          <p className="text-[16px] font-semibold text-[#111827]">{lessonTitle}</p>
          <p className="text-[12px] text-[#9CA3AF] italic">{lessonTitlePt}</p>
        </div>
        <span className={`${patterns.badge} ${cefrBadgeClasses(cefr)}`}>
          {cefr}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[#F3F4F6]">
        <div
          className="h-1 bg-[#003399] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage pills */}
      <div className={`${spacing.pageNarrow} py-3 overflow-x-auto`}>
        <div className="flex gap-2" style={{ scrollbarWidth: "none" }}>
          {stages.map((stage, i) => {
            const isCompleted = stageCompletion.has(i);
            const isCurrent = i === currentStageIndex;
            const isFuture = i > currentStageIndex && !isCompleted;

            return (
              <button
                key={stage.id}
                onClick={() => {
                  if (isCompleted || isCurrent) onStageChange(i);
                }}
                disabled={isFuture}
                className={`shrink-0 ${
                  isCurrent
                    ? patterns.pill.active
                    : patterns.pill.inactive
                } ${isFuture ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {isCompleted && !isCurrent ? "\u2713 " : ""}
                {stage.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className={`${spacing.pageNarrow} py-6`}>
        {children}
      </div>

      {/* Navigation */}
      <div className={`${spacing.pageNarrow} flex justify-between py-4`}>
        <button
          onClick={() => onStageChange(Math.max(0, currentStageIndex - 1))}
          disabled={currentStageIndex === 0}
          className={`${patterns.button.secondary} h-10 px-5 ${
            currentStageIndex === 0 ? "opacity-40 cursor-not-allowed" : ""
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => {
            markStageComplete(currentStageIndex);
            if (isLast) {
              // Parent should call handleComplete via onComplete
            } else {
              onStageChange(currentStageIndex + 1);
            }
          }}
          className={`${patterns.button.primary} h-10 px-5`}
        >
          {isLast ? "See Results" : "Next"}
        </button>
      </div>
    </div>
  );
}
