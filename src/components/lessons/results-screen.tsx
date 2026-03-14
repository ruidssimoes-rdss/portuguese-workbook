"use client";

interface WrongAnswer {
  question: string;
  userAnswer: string;
  correctAnswer: string;
}

interface ResultsScreenProps {
  passed: boolean;
  accuracy: number;
  practiceScore: { correct: number; total: number };
  applyScore: { correct: number; total: number };
  wrongAnswers: WrongAnswer[];
  levelProgress: { completed: number; total: number; level: string };
  onNextLesson: (() => void) | null;
  onRetryPractice: () => void;
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
  practiceScore,
  applyScore,
  wrongAnswers,
  levelProgress,
  onNextLesson,
  onRetryPractice,
  onRetryFull,
  onBackToLessons,
  isSaving,
  saveError,
  onRetrySave,
  examUnlocked,
  showEnglish,
}: ResultsScreenProps) {
  const practiceAccuracy = practiceScore.total > 0
    ? Math.round((practiceScore.correct / practiceScore.total) * 100)
    : 0;
  const applyAccuracy = applyScore.total > 0
    ? Math.round((applyScore.correct / applyScore.total) * 100)
    : 0;
  const totalCorrect = practiceScore.correct + applyScore.correct;
  const totalItems = practiceScore.total + applyScore.total;

  if (passed) {
    return (
      <div className="text-center py-8">
        {/* Success icon */}
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-[#F0FDF4] border-2 border-[#D1FAE5] flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-[#059669]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Lição Completa!
          </h2>
          {showEnglish && <p className="text-[14px] text-[var(--text-muted)] mt-1">Lesson Complete!</p>}
        </div>

        {/* Accuracy */}
        <p className="text-[18px] font-semibold text-[var(--text-primary)] mb-1">
          Precisão: {accuracy}%
        </p>
        {showEnglish && <p className="text-[12px] text-[var(--text-muted)] mb-6">Accuracy: {accuracy}%</p>}
        {!showEnglish && <div className="mb-5" />}

        {/* Score breakdown */}
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[12px] p-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1">
              Praticar
            </p>
            <p className="text-[18px] font-bold text-[var(--text-primary)]">
              {practiceScore.correct}/{practiceScore.total}
            </p>
            <p className="text-[12px] text-[var(--text-muted)]">{practiceAccuracy}%</p>
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[12px] p-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1">
              Aplicar
            </p>
            <p className="text-[18px] font-bold text-[var(--text-primary)]">
              {applyScore.correct}/{applyScore.total}
            </p>
            <p className="text-[12px] text-[var(--text-muted)]">{applyAccuracy}%</p>
          </div>
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[12px] p-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1">
              Total
            </p>
            <p className="text-[18px] font-bold text-[var(--text-primary)]">
              {totalCorrect}/{totalItems}
            </p>
            <p className="text-[12px] text-[var(--text-muted)]">{accuracy}%</p>
          </div>
        </div>

        {/* Level progress */}
        <p className="text-[13px] text-[var(--text-secondary)] mb-2">
          Progresso {levelProgress.level}: {levelProgress.completed}/{levelProgress.total} lições
        </p>

        {/* Exam unlock */}
        {examUnlocked && (
          <p className="text-[14px] font-semibold text-[#059669] mb-6">
            Exame desbloqueado!
          </p>
        )}

        {/* Wrong answers */}
        {wrongAnswers.length > 0 && (
          <div className="text-left max-w-lg mx-auto mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1">
              Respostas erradas
            </p>
            {showEnglish && <p className="text-[11px] text-[var(--text-muted)] mb-3">Wrong answers</p>}
            {!showEnglish && <div className="mb-2" />}
            <div className="space-y-2">
              {wrongAnswers.map((w, i) => (
                <div
                  key={i}
                  className="border border-[#FEE2E2] rounded-[12px] p-3 bg-[#FEF2F2]"
                >
                  <p className="text-[13px] text-[var(--text-secondary)]">{w.question}</p>
                  <p className="text-[13px] mt-1">
                    <span className="text-[#DC2626] line-through">{w.userAnswer || "(vazio)"}</span>
                    {" → "}
                    <span className="text-[#059669] font-semibold">{w.correctAnswer}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save error */}
        {saveError && (
          <div className="mb-6 p-4 rounded-[12px] border border-[#FEE2E2] bg-[#FEF2F2] text-center">
            <p className="text-[14px] font-medium text-[#DC2626] mb-2">
              Erro ao guardar o progresso. O teu resultado pode não ter sido guardado.
            </p>
            <button
              type="button"
              onClick={onRetrySave}
              disabled={isSaving}
              className="px-5 py-2 bg-[#DC2626] text-white text-[13px] font-semibold rounded-lg hover:bg-[#B91C1C] transition-colors disabled:opacity-60"
            >
              {isSaving ? "A guardar..." : "Tentar guardar novamente"}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {onNextLesson && (
            <button
              type="button"
              disabled={isSaving || saveError}
              onClick={onNextLesson}
              className="px-8 py-3 bg-[var(--text-primary)] text-white text-[15px] font-semibold rounded-[12px] hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? "A guardar..." : "Próxima lição"}
              {showEnglish && <span className="block text-[11px] font-normal opacity-75">{isSaving ? "Saving..." : "Next lesson"}</span>}
            </button>
          )}
          <button
            type="button"
            disabled={isSaving}
            onClick={onRetryFull}
            className="px-6 py-2.5 border border-[var(--border-primary)] rounded-[12px] text-[14px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Rever lição
            {showEnglish && <span className="block text-[11px] font-normal opacity-75">Review lesson</span>}
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={onBackToLessons}
            className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Voltar às lições
          </button>
        </div>
      </div>
    );
  }

  // Failed
  return (
    <div className="text-center py-8">
      <div className="mb-6">
        <div className="w-16 h-16 rounded-full bg-[#FEF3C7] border-2 border-[#FCD34D] flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl" aria-hidden>
            <svg className="w-8 h-8 text-[#92400E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </span>
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Ainda não</h2>
        {showEnglish && <p className="text-[13px] text-[var(--text-muted)] mt-0.5">Not quite yet</p>}
        <p className="text-[13px] text-[var(--text-secondary)] mt-1">
          Precisas de 80% para passar.
        </p>
        {showEnglish && <p className="text-[12px] text-[var(--text-muted)]">You need 80% to pass.</p>}
      </div>

      <p className="text-[18px] font-semibold text-[var(--text-primary)] mb-1">
        Precisão: {accuracy}%
      </p>
      {showEnglish && <p className="text-[12px] text-[var(--text-muted)] mb-6">Accuracy: {accuracy}%</p>}
      {!showEnglish && <div className="mb-5" />}

      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-6">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[12px] p-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1">
            Praticar
          </p>
          <p className="text-[18px] font-bold text-[var(--text-primary)]">
            {practiceScore.correct}/{practiceScore.total}
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[12px] p-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1">
            Aplicar
          </p>
          <p className="text-[18px] font-bold text-[var(--text-primary)]">
            {applyScore.correct}/{applyScore.total}
          </p>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[12px] p-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-1">
            Total
          </p>
          <p className="text-[18px] font-bold text-[var(--text-primary)]">
            {totalCorrect}/{totalItems}
          </p>
        </div>
      </div>

      {/* Wrong answers */}
      {wrongAnswers.length > 0 && (
        <div className="text-left max-w-lg mx-auto mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)] mb-3">
            Respostas erradas
          </p>
          <div className="space-y-2">
            {wrongAnswers.map((w, i) => (
              <div
                key={i}
                className="border border-[#FEE2E2] rounded-[12px] p-3 bg-[#FEF2F2]"
              >
                <p className="text-[13px] text-[var(--text-secondary)]">{w.question}</p>
                <p className="text-[13px] mt-1">
                  <span className="text-[#DC2626] line-through">{w.userAnswer || "(vazio)"}</span>
                  {" → "}
                  <span className="text-[#059669] font-semibold">{w.correctAnswer}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save error */}
      {saveError && (
        <div className="mb-6 p-4 rounded-[12px] border border-[#FEE2E2] bg-[#FEF2F2] text-center">
          <p className="text-[14px] font-medium text-[#DC2626] mb-2">
            Erro ao guardar o progresso.
          </p>
          <button
            type="button"
            onClick={onRetrySave}
            disabled={isSaving}
            className="px-5 py-2 bg-[#DC2626] text-white text-[13px] font-semibold rounded-lg hover:bg-[#B91C1C] transition-colors disabled:opacity-60"
          >
            {isSaving ? "A guardar..." : "Tentar guardar novamente"}
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          disabled={isSaving}
          onClick={onRetryPractice}
          className="px-8 py-3 bg-[var(--text-primary)] text-white text-[15px] font-semibold rounded-[12px] hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? "A guardar..." : "Tentar novamente"}
          {showEnglish && <span className="block text-[11px] font-normal opacity-75">{isSaving ? "Saving..." : "Try again"}</span>}
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={onRetryFull}
          className="px-6 py-2.5 border border-[var(--border-primary)] rounded-[12px] text-[14px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Rever primeiro
          {showEnglish && <span className="block text-[11px] font-normal opacity-75">Review first</span>}
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={onBackToLessons}
          className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Voltar às lições
        </button>
      </div>
    </div>
  );
}
