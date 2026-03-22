"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SessionShellProps, SessionResults } from "@/types/blocks";
import { cefrClasses } from "@/lib/design-system/tokens";
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
      <div className="max-w-[800px] mx-auto px-6 md:px-10 lg:px-16">
        <div className="py-8">
          <p className="text-[16px] font-medium text-[#111111] text-center mb-1">
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
                className="border-[0.5px] border-[rgba(0,0,0,0.06)] text-[#6C6B71] text-[14px] font-normal rounded-lg px-5 py-2.5 hover:bg-[#F7F7F5] hover:border-[rgba(0,0,0,0.12)] transition-all duration-150 ease-out bg-white h-10 px-6"
              >
                Retry
              </button>
            )}
            <button
              onClick={() => router.push("/lessons")}
              className="bg-[#111111] text-white text-[14px] font-medium rounded-lg px-5 py-2.5 hover:bg-[#111111]/90 transition-all duration-150 ease-out h-10 px-6"
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
      <div className="max-w-[800px] mx-auto px-6 md:px-10 lg:px-16 flex items-center justify-between py-3">
        <button
          onClick={() => router.push("/lessons")}
          className="text-[14px] font-normal text-[#9B9DA3] hover:text-[#6C6B71] hover:bg-[#F7F7F5] transition-all duration-150 ease-out"
        >
          &larr; Back
        </button>
        <div className="text-center">
          <p className="text-[16px] font-medium text-[#111111]">{lessonTitle}</p>
          <p className="text-[12px] text-[#9B9DA3] italic">{lessonTitlePt}</p>
        </div>
        <span className={`text-[12px] font-normal px-2.5 py-1 rounded-full whitespace-nowrap ${cefrClasses(cefr).text} ${cefrClasses(cefr).bg}`}>
          {cefr}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[rgba(0,0,0,0.06)]">
        <div
          className="h-1.5 bg-[#185FA5] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage pills */}
      <div className="max-w-[800px] mx-auto px-6 md:px-10 lg:px-16 py-3 overflow-x-auto">
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
                    ? "px-4 py-2 rounded-full text-[13px] font-medium border border-[#111111] bg-[#111111] text-white cursor-pointer transition-all duration-150 ease-out"
                    : "px-4 py-2 rounded-full text-[13px] font-normal border-[0.5px] border-[rgba(0,0,0,0.06)] text-[#9B9DA3] hover:border-[rgba(0,0,0,0.12)] hover:text-[#6C6B71] transition-all duration-150 ease-out cursor-pointer bg-white"
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
      <div className="max-w-[800px] mx-auto px-6 md:px-10 lg:px-16 py-6">
        {children}
      </div>

      {/* Navigation */}
      <div className="max-w-[800px] mx-auto px-6 md:px-10 lg:px-16 flex justify-between py-4">
        <button
          onClick={() => onStageChange(Math.max(0, currentStageIndex - 1))}
          disabled={currentStageIndex === 0}
          className={`border-[0.5px] border-[rgba(0,0,0,0.06)] text-[#6C6B71] text-[14px] font-normal rounded-lg px-5 py-2.5 hover:bg-[#F7F7F5] hover:border-[rgba(0,0,0,0.12)] transition-all duration-150 ease-out bg-white h-10 px-5 ${
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
          className="bg-[#111111] text-white text-[14px] font-medium rounded-lg px-5 py-2.5 hover:bg-[#111111]/90 transition-all duration-150 ease-out h-10 px-5"
        >
          {isLast ? "See Results" : "Next"}
        </button>
      </div>
    </div>
  );
}
