"use client";

import { useState, useEffect } from "react";
import type { SectionResult } from "@/lib/exercise-types";

interface WrongAnswer {
  question: string;
  userAnswer: string;
  correctAnswer: string;
}

interface ResultsScreenProps {
  passed: boolean;
  accuracy: number;
  sectionResults: SectionResult[];
  wrongAnswers: WrongAnswer[];
  levelProgress: { completed: number; total: number; level: string };
  onNextLesson: (() => void) | null;
  onRetryExercises: () => void;
  onRetryFull: () => void;
  onBackToLessons: () => void;
  isSaving: boolean;
  saveError: boolean;
  onRetrySave: () => void;
  examUnlocked: string | null;
  showEnglish?: boolean;
}

export function ResultsScreen({
  passed,
  accuracy,
  sectionResults,
  wrongAnswers,
  levelProgress,
  onNextLesson,
  onRetryExercises,
  onRetryFull,
  onBackToLessons,
  isSaving,
  saveError,
  onRetrySave,
  examUnlocked,
  showEnglish,
}: ResultsScreenProps) {
  const totalCorrect = sectionResults.reduce((s, r) => s + r.totalCorrect, 0);
  const totalQuestions = sectionResults.reduce((s, r) => s + r.totalQuestions, 0);

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [displayAccuracy, setDisplayAccuracy] = useState(0);
  const [wrongExpanded, setWrongExpanded] = useState(!passed);

  useEffect(() => {
    const target = accuracy;
    const duration = 800;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayAccuracy(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    const t1 = setTimeout(() => setShowBreakdown(true), 300);
    const t2 = setTimeout(() => setShowWrong(true), 600);
    const t3 = setTimeout(() => setShowButtons(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [accuracy]);

  return (
    <div className="text-center py-8">
      {/* Icon */}
      <div className="mb-6">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          passed ? "bg-[#E1F5EE] border-[0.5px] border-[rgba(0,0,0,0.06)]" : "bg-[#FAEEDA] border-[0.5px] border-[rgba(0,0,0,0.06)]"
        }`}>
          {passed ? (
            <svg className="w-8 h-8 text-[#0F6E56]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-[#854F0B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          )}
        </div>
        <h2 className="text-2xl font-medium text-[#111111]">
          {passed ? "Lição Completa!" : "Ainda não"}
        </h2>
        {showEnglish && (
          <p className="text-[13px] text-[#9B9DA3] mt-0.5">{passed ? "Lesson Complete!" : "Not quite yet"}</p>
        )}
        {!passed && (
          <p className="text-[13px] text-[#6C6B71] mt-1">
            Precisas de 80% para passar.
            {showEnglish && <span className="text-[#9B9DA3] ml-1">You need 80% to pass.</span>}
          </p>
        )}
      </div>

      {/* Accuracy */}
      <p className="text-[28px] font-medium text-[#111111] mb-1">{displayAccuracy}%</p>
      <p className="text-[13px] text-[#9B9DA3] mb-6">
        {totalCorrect} / {totalQuestions}
        {showEnglish && " correct"}
      </p>

      {/* Per-section breakdown */}
      <div className={`max-w-md mx-auto mb-6 transition-opacity duration-300 ${showBreakdown ? "opacity-100" : "opacity-0"}`}>
        <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg overflow-hidden bg-white">
          {sectionResults.map((sr, i) => {
            const pct = sr.totalQuestions > 0 ? Math.round((sr.totalCorrect / sr.totalQuestions) * 100) : 0;
            return (
              <div key={sr.sectionKey} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-[rgba(0,0,0,0.06)]" : ""}`}>
                <span className="text-[13px] text-[#111111] font-medium flex-1 text-left">{sr.sectionName}</span>
                <span className="text-[13px] text-[#6C6B71] w-12 text-right">{sr.totalCorrect}/{sr.totalQuestions}</span>
                <div className="w-20 h-1.5 bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct >= 80 ? "bg-[#0F6E56]" : pct >= 50 ? "bg-[#854F0B]" : "bg-[#dc2626]"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-3 px-4 py-3 border-t border-[rgba(0,0,0,0.06)] bg-[#F7F7F5]">
            <span className="text-[13px] text-[#111111] font-medium flex-1 text-left">Total</span>
            <span className="text-[13px] text-[#111111] font-medium w-12 text-right">{totalCorrect}/{totalQuestions}</span>
            <span className="text-[13px] font-medium w-20 text-right">{accuracy}%</span>
          </div>
        </div>

        {/* Level progress */}
        <p className="text-[13px] text-[#6C6B71] mt-3">
          Progresso {levelProgress.level}: {levelProgress.completed}/{levelProgress.total} lições
        </p>
        {examUnlocked && (
          <p className="text-[14px] font-medium text-[#0F6E56] mt-2">Exame desbloqueado!</p>
        )}
      </div>

      {/* Wrong answers (collapsible) */}
      <div className={`transition-opacity duration-300 ${showWrong ? "opacity-100" : "opacity-0"}`}>
        {wrongAnswers.length > 0 && (
          <div className="text-left max-w-md mx-auto mb-8">
            <button
              type="button"
              onClick={() => setWrongExpanded((e) => !e)}
              className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.08em] text-[#9B9DA3] mb-2 hover:text-[#6C6B71] transition-colors"
            >
              <svg className={`w-3 h-3 transition-transform ${wrongExpanded ? "rotate-90" : ""}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Respostas erradas ({wrongAnswers.length})
              {showEnglish && <span className="font-normal normal-case tracking-normal ml-1">Wrong answers</span>}
            </button>
            {wrongExpanded && (
              <div className="space-y-2">
                {wrongAnswers.map((w, i) => (
                  <div key={i} className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-3 bg-[#fef2f2]">
                    <p className="text-[12px] text-[#6C6B71]">{w.question}</p>
                    <p className="text-[13px] mt-1">
                      <span className="text-[#dc2626] line-through">{w.userAnswer || "(vazio)"}</span>
                      {" → "}
                      <span className="text-[#0F6E56] font-medium">{w.correctAnswer}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save error */}
      {saveError && (
        <div className="mb-6 p-4 rounded-lg border-[0.5px] border-[rgba(0,0,0,0.06)] bg-[#fef2f2] text-center max-w-md mx-auto">
          <p className="text-[14px] font-medium text-[#dc2626] mb-2">
            Erro ao guardar o progresso.
          </p>
          <button type="button" onClick={onRetrySave} disabled={isSaving}
            className="px-4 py-2 bg-[#dc2626] text-white text-[13px] font-medium rounded-lg hover:bg-[#b91c1c] transition-colors disabled:opacity-60"
          >
            {isSaving ? "A guardar..." : "Tentar guardar novamente"}
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className={`flex flex-wrap items-center justify-center gap-4 transition-opacity duration-300 ${showButtons ? "opacity-100" : "opacity-0"}`}>
        {passed && onNextLesson && (
          <button type="button" disabled={isSaving || saveError} onClick={onNextLesson}
            className="px-4 py-2 bg-[#111111] text-white text-[13px] font-medium rounded-lg hover:bg-[#333] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? "A guardar..." : "Próxima lição"}
            {showEnglish && <span className="block text-[11px] font-normal opacity-75">{isSaving ? "Saving..." : "Next lesson"}</span>}
          </button>
        )}
        {!passed && (
          <button type="button" disabled={isSaving} onClick={onRetryExercises}
            className="px-4 py-2 bg-[#111111] text-white text-[13px] font-medium rounded-lg hover:bg-[#333] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? "A guardar..." : "Tentar novamente"}
            {showEnglish && <span className="block text-[11px] font-normal opacity-75">{isSaving ? "Saving..." : "Try again"}</span>}
          </button>
        )}
        <button type="button" disabled={isSaving} onClick={onRetryFull}
          className="px-4 py-2 border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg text-[13px] font-medium text-[#6C6B71] hover:border-[rgba(0,0,0,0.12)] transition-colors disabled:opacity-60"
        >
          {passed ? "Rever lição" : "Rever primeiro"}
          {showEnglish && <span className="block text-[11px] font-normal opacity-75">{passed ? "Review lesson" : "Review first"}</span>}
        </button>
        <button type="button" disabled={isSaving} onClick={onBackToLessons}
          className="text-[13px] font-medium text-[#6C6B71] hover:text-[#111111] transition-colors disabled:opacity-60"
        >
          Voltar às lições
        </button>
      </div>
    </div>
  );
}
