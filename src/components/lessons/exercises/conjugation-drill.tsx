"use client";

import { useState } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { ExerciseResult } from "@/lib/exercise-generator";

interface ConjugationDrillProps {
  instruction: string;
  verb: string;
  tense: string;
  persons: Array<{ pronoun: string; correctForm: string }>;
  onComplete: (results: ExerciseResult[]) => void;
}

export function ConjugationDrill({
  instruction,
  verb,
  tense,
  persons,
  onComplete,
}: ConjugationDrillProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, ExerciseResult>>({});

  const handleSubmit = () => {
    if (submitted) return;
    setSubmitted(true);

    const newResults: Record<string, ExerciseResult> = {};
    const resultArray: ExerciseResult[] = [];

    for (const person of persons) {
      const userAnswer = (answers[person.pronoun] || "").trim();
      const check = checkAnswer(userAnswer, person.correctForm);
      const result: ExerciseResult = {
        correct: check.correct,
        exactMatch: check.exactMatch,
        accentHint: check.accentHint,
        userAnswer,
        correctAnswer: person.correctForm,
      };
      newResults[person.pronoun] = result;
      resultArray.push(result);
    }

    setResults(newResults);
    setTimeout(() => onComplete(resultArray), 2500);
  };

  const hasAnswers = Object.values(answers).some((a) => a.trim());
  const correctCount = Object.values(results).filter((r) => r.correct).length;

  return (
    <div>
      <p className="text-[13px] font-medium text-[var(--text-muted)] uppercase tracking-[0.08em] mb-2">
        {instruction}
      </p>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">{verb}</h3>
        <span className="text-[13px] text-[var(--text-muted)]">{tense}</span>
      </div>

      <div className="border border-[var(--border-primary)] rounded-[12px] overflow-hidden bg-[var(--bg-card)]">
        {persons.map((person, i) => {
          const result = results[person.pronoun];
          return (
            <div
              key={person.pronoun}
              className={`flex items-center gap-4 px-5 py-4 ${
                i > 0 ? "border-t border-[var(--border-light)]" : ""
              } ${
                submitted
                  ? result?.correct
                    ? "bg-[#F0FDF4]"
                    : "bg-[#FEF2F2]"
                  : ""
              }`}
            >
              <span className="text-[15px] font-medium text-[var(--text-muted)] w-20 shrink-0">
                {person.pronoun}
              </span>
              {!submitted ? (
                <input
                  type="text"
                  value={answers[person.pronoun] || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [person.pronoun]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                  }}
                  placeholder="Conjugação..."
                  className="flex-1 text-[15px] font-semibold text-[var(--text-primary)] bg-transparent border-b border-[var(--border-primary)] focus:border-[var(--text-primary)] outline-none py-1 placeholder:text-[var(--text-muted)] placeholder:font-normal transition-colors"
                  autoComplete="off"
                  spellCheck={false}
                />
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    {result?.correct ? (
                      <div>
                        <span className="text-[15px] font-semibold text-[#059669]">
                          {person.correctForm}
                        </span>
                        {result.accentHint && (
                          <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                            Atenção ao acento: <span className="font-semibold text-[var(--text-primary)]">{result.accentHint}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span className="text-[15px] font-semibold text-[#DC2626] line-through mr-2">
                          {result?.userAnswer || "(vazio)"}
                        </span>
                        <span className="text-[15px] font-semibold text-[#059669]">
                          {person.correctForm}
                        </span>
                      </div>
                    )}
                  </div>
                  {result?.correct ? (
                    <svg className="w-4 h-4 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && hasAnswers && (
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-4 w-full py-2.5 bg-[var(--text-primary)] text-white text-[13px] font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        >
          Verificar respostas
        </button>
      )}

      {submitted && (
        <div className="mt-4 p-4 bg-[var(--bg-secondary)] rounded-[12px] border border-[var(--border-light)] text-center">
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">
            {correctCount} / {persons.length} corretas
          </p>
        </div>
      )}
    </div>
  );
}
