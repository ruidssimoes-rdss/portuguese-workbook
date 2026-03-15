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
          passed ? "bg-[#F0FDF4] border-2 border-[#D1FAE5]" : "bg-[#FEF3C7] border-2 border-[#FCD34D]"
        }`}>
          {passed ? (
            <svg className="w-8 h-8 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-[#92400E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          )}
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          {passed ? "Lição Completa!" : "Ainda não"}
        </h2>
        {showEnglish && (
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{passed ? "Lesson Complete!" : "Not quite yet"}</p>
        )}
        {!passed && (
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">
            Precisas de 80% para passar.
            {showEnglish && <span className="text-[var(--text-muted)] ml-1">You need 80% to pass.</span>}
          </p>
        )}
      </div>

      {/* Accuracy */}
      <p className="text-[22px] font-bold text-[var(--text-primary)] mb-1">{displayAccuracy}%</p>
      <p className="text-[13px] text-[var(--text-muted)] mb-6">
        {totalCorrect} / {totalQuestions}
        {showEnglish && " correct"}
      </p>

      {/* Per-section breakdown */}
      <div className={`max-w-md mx-auto mb-6 transition-opacity duration-300 ${showBreakdown ? "opacity-100" : "opacity-0"}`}>
        <div className="border border-[var(--border-primary)] rounded-[12px] overflow-hidden bg-[var(--bg-card)]">
          {sectionResults.map((sr, i) => {
            const pct = sr.totalQuestions > 0 ? Math.round((sr.totalCorrect / sr.totalQuestions) * 100) : 0;
            return (
              <div key={sr.sectionKey} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-[var(--border-light)]" : ""}`}>
                <span className="text-[13px] text-[var(--text-primary)] font-medium flex-1 text-left">{sr.sectionName}</span>
                <span className="text-[13px] text-[var(--text-secondary)] w-12 text-right">{sr.totalCorrect}/{sr.totalQuestions}</span>
                <div className="w-20 h-1.5 bg-[var(--border-light)] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct >= 80 ? "bg-[#059669]" : pct >= 50 ? "bg-[#F59E0B]" : "bg-[#DC2626]"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-3 px-4 py-3 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
            <span className="text-[13px] text-[var(--text-primary)] font-bold flex-1 text-left">Total</span>
            <span className="text-[13px] text-[var(--text-primary)] font-bold w-12 text-right">{totalCorrect}/{totalQuestions}</span>
            <span className="text-[13px] font-bold w-20 text-right">{accuracy}%</span>
          </div>
        </div>

        {/* Level progress */}
        <p className="text-[13px] text-[var(--text-secondary)] mt-3">
          Progresso {levelProgress.level}: {levelProgress.completed}/{levelProgress.total} lições
        </p>
        {examUnlocked && (
          <p className="text-[14px] font-semibold text-[#059669] mt-2">Exame desbloqueado!</p>
        )}
      </div>

      {/* Wrong answers (collapsible) */}
      <div className={`transition-opacity duration-300 ${showWrong ? "opacity-100" : "opacity-0"}`}>
        {wrongAnswers.length > 0 && (
          <div className="text-left max-w-md mx-auto mb-8">
            <button
              type="button"
              onClick={() => setWrongExpanded((e) => !e)}
              className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-2 hover:text-[var(--text-secondary)] transition-colors"
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
                  <div key={i} className="border border-[#FEE2E2] rounded-[10px] p-3 bg-[#FEF2F2]">
                    <p className="text-[12px] text-[var(--text-secondary)]">{w.question}</p>
                    <p className="text-[13px] mt-1">
                      <span className="text-[#DC2626] line-through">{w.userAnswer || "(vazio)"}</span>
                      {" → "}
                      <span className="text-[#059669] font-semibold">{w.correctAnswer}</span>
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
        <div className="mb-6 p-4 rounded-[12px] border border-[#FEE2E2] bg-[#FEF2F2] text-center max-w-md mx-auto">
          <p className="text-[14px] font-medium text-[#DC2626] mb-2">
            Erro ao guardar o progresso.
          </p>
          <button type="button" onClick={onRetrySave} disabled={isSaving}
            className="px-5 py-2 bg-[#DC2626] text-white text-[13px] font-semibold rounded-lg hover:bg-[#B91C1C] transition-colors disabled:opacity-60"
          >
            {isSaving ? "A guardar..." : "Tentar guardar novamente"}
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className={`flex flex-wrap items-center justify-center gap-4 transition-opacity duration-300 ${showButtons ? "opacity-100" : "opacity-0"}`}>
        {passed && onNextLesson && (
          <button type="button" disabled={isSaving || saveError} onClick={onNextLesson}
            className="px-8 py-3 bg-[var(--text-primary)] text-white text-[15px] font-semibold rounded-[12px] hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? "A guardar..." : "Próxima lição"}
            {showEnglish && <span className="block text-[11px] font-normal opacity-75">{isSaving ? "Saving..." : "Next lesson"}</span>}
          </button>
        )}
        {!passed && (
          <button type="button" disabled={isSaving} onClick={onRetryExercises}
            className="px-8 py-3 bg-[var(--text-primary)] text-white text-[15px] font-semibold rounded-[12px] hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? "A guardar..." : "Tentar novamente"}
            {showEnglish && <span className="block text-[11px] font-normal opacity-75">{isSaving ? "Saving..." : "Try again"}</span>}
          </button>
        )}
        <button type="button" disabled={isSaving} onClick={onRetryFull}
          className="px-6 py-2.5 border border-[var(--border-primary)] rounded-[12px] text-[14px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-60"
        >
          {passed ? "Rever lição" : "Rever primeiro"}
          {showEnglish && <span className="block text-[11px] font-normal opacity-75">{passed ? "Review lesson" : "Review first"}</span>}
        </button>
        <button type="button" disabled={isSaving} onClick={onBackToLessons}
          className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-60"
        >
          Voltar às lições
        </button>
      </div>
    </div>
  );
}
