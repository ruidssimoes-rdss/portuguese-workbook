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
      <div className="text-[48px] font-medium text-[#1F1F1F] tracking-[-0.02em]">
        {displayAccuracy}%
      </div>

      {/* Pass / fail */}
      {passed ? (
        <div className="mt-2">
          <p className="text-[16px] font-medium text-[#1F7A68]">Lesson complete!</p>
          <p className="text-[13px] text-[#98988F] italic mt-1">Lição completa</p>
        </div>
      ) : (
        <div className="mt-2">
          <p className="text-[16px] font-medium text-[#5B45B8]">Not quite yet</p>
          <p className="text-[13px] text-[#98988F] italic mt-1">Ainda não — tenta outra vez</p>
        </div>
      )}

      {/* Section breakdown */}
      <div className="mt-6 space-y-1.5 text-left">
        {sectionResults.map((sr, i) => {
          const pct = sr.totalQuestions > 0 ? sr.totalCorrect / sr.totalQuestions : 0;
          return (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-2.5 border-[0.5px] border-[#E6E6E4] rounded-lg"
            >
              <span className="text-[13px] text-[#1F1F1F]">{sr.sectionName}</span>
              <span
                className={`text-[13px] font-medium ${pct >= 0.8 ? "text-[#1F7A68]" : "text-[#5B45B8]"}`}
              >
                {sr.totalCorrect}/{sr.totalQuestions}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 border-[0.5px] border-[#E6E6E4] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#6B6B69]">Respostas certas</span>
          <span className={`text-[14px] font-medium ${passed ? "text-[#1F7A68]" : "text-[#5B45B8]"}`}>
            {totalCorrect} / {totalQuestions}
          </span>
        </div>
      </div>

      {/* Wrong answers */}
      {wrongAnswers.length > 0 && (
        <div className="mt-4 text-left">
          <p className="text-[10px] text-[#98988F] uppercase tracking-[0.05em] mb-2">
            Precisa de prática
          </p>
          <div className="space-y-1.5">
            {wrongAnswers.slice(0, 8).map((w, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#FBE9E4] rounded-lg">
                <span className="text-[13px] text-[#B94A32] truncate mr-2">
                  {w.correctAnswer}
                </span>
                <span className="text-[12px] text-[#98988F] shrink-0">
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
            className="block w-full py-3.5 text-[14px] font-medium text-white bg-[#1B2B61] rounded-lg hover:bg-[#14214C] transition-colors text-center"
          >
            Continuar a aprender →
          </Link>
        ) : (
          <button
            type="button"
            onClick={onRetry}
            className="w-full py-3.5 text-[14px] font-medium text-white bg-[#1B2B61] rounded-lg hover:bg-[#14214C] transition-colors cursor-pointer"
          >
            Tentar outra vez
          </button>
        )}
        <Link
          href="/lessons"
          className="block w-full py-3.5 text-[14px] font-medium text-[#6B6B69] border-[0.5px] border-[#E6E6E4] rounded-lg hover:border-[#CFCFCB] transition-colors text-center"
        >
          Voltar às lições
        </Link>
      </div>
    </div>
  );
}
