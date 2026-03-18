"use client";

import type { SessionResults, ExerciseDifficulty } from "@/types/blocks";
import { patterns } from "@/lib/design-tokens";

interface DifficultyChange {
  from: ExerciseDifficulty;
  to: ExerciseDifficulty;
  atIndex: number;
}

interface SessionNarrativeProps {
  results: SessionResults;
  difficultyChanges?: DifficultyChange[];
  initialDifficulty?: ExerciseDifficulty;
  className?: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m} min ${s} sec` : `${s} sec`;
}

export function SessionNarrative({
  results,
  difficultyChanges = [],
  initialDifficulty,
  className,
}: SessionNarrativeProps) {
  const totalCorrect = results.answers.filter((a) => a.correct).length;
  const totalWrong = results.answers.filter((a) => !a.correct).length;

  // Group wrong answers to identify weak areas
  const wrongByType = new Map<string, number>();
  for (const a of results.answers.filter((r) => !r.correct)) {
    const key = a.expectedAnswer.length > 20 ? "Sentences" : a.expectedAnswer;
    wrongByType.set(key, (wrongByType.get(key) ?? 0) + 1);
  }

  // Strengths: areas with high accuracy (no wrong answers in a streak)
  const strengths: string[] = [];
  if (totalCorrect >= 3) strengths.push(`${totalCorrect} correct answers`);
  if (results.accuracy >= 80) strengths.push("Strong overall accuracy");
  if (totalWrong === 0) strengths.push("Perfect session!");

  // Review areas
  const reviewAreas: string[] = [];
  for (const [key, count] of wrongByType) {
    if (count >= 2) reviewAreas.push(`"${key}" \u2014 ${count} mistakes`);
  }
  if (reviewAreas.length === 0 && totalWrong > 0) {
    reviewAreas.push(`${totalWrong} ${totalWrong === 1 ? "answer" : "answers"} to review`);
  }

  // Difficulty narrative
  const diffNarrative = difficultyChanges.length > 0
    ? `Difficulty adjusted ${difficultyChanges.length} time${difficultyChanges.length > 1 ? "s" : ""} during the session`
    : initialDifficulty
      ? `Stayed at ${initialDifficulty} level throughout`
      : null;

  return (
    <div className={`${patterns.card.base} p-8 ${className ?? ""}`}>
      <h3 className="text-[18px] font-bold text-[#111827]">Session Summary</h3>
      <p className="text-[13px] text-[#9CA3AF] italic mt-0.5">Resumo da sessão</p>

      {/* Stats */}
      <div className="flex gap-6 mt-6">
        <div className={`${patterns.card.base} flex-1 text-center py-4`}>
          <p className={`text-[28px] font-bold ${results.passed ? "text-[#003399]" : "text-[#6B7280]"}`}>
            {results.accuracy}%
          </p>
          <p className="text-[13px] text-[#6B7280]">Accuracy</p>
        </div>
        <div className={`${patterns.card.base} flex-1 text-center py-4`}>
          <p className="text-[28px] font-bold text-[#111827]">{totalCorrect}/{results.answers.length}</p>
          <p className="text-[13px] text-[#6B7280]">Correct</p>
        </div>
        <div className={`${patterns.card.base} flex-1 text-center py-4`}>
          <p className="text-[28px] font-bold text-[#111827]">{formatTime(results.timeSpentSeconds)}</p>
          <p className="text-[13px] text-[#6B7280]">Time</p>
        </div>
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-600 mb-2">
            What went well
          </p>
          <ul className="space-y-1">
            {strengths.map((s, i) => (
              <li key={i} className="text-[14px] text-emerald-700">· {s}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Review areas */}
      {reviewAreas.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-600 mb-2">
            What to review
          </p>
          <ul className="space-y-1">
            {reviewAreas.map((r, i) => (
              <li key={i} className="text-[14px] text-amber-700">· {r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Difficulty changes */}
      {diffNarrative && (
        <p className="text-[13px] text-[#6B7280] mt-5">{diffNarrative}</p>
      )}

      {/* Focus recommendation */}
      {reviewAreas.length > 0 && (
        <div className="bg-[#FAFAFA] rounded-lg p-4 mt-5">
          <p className="text-[14px] text-[#374151]">
            Focus next time on the areas above — they&apos;ll come back in your next session.
          </p>
        </div>
      )}
    </div>
  );
}
