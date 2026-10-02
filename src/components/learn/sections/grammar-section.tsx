"use client";

import { useState } from "react";
import type { SectionResult } from "@/lib/exercise-types";
import { Item, Prompt, Choice, choiceResult, Feedback, SectionFooter, type Mark } from "../kit";

interface GrammarQuestion {
  id: string;
  type: "true-false" | "mc";
  statement?: string;
  statementPt?: string;
  isTrue?: boolean;
  explanation?: string;
  question?: string;
  questionEnglish?: string;
  options?: string[];
  correctIndex?: number;
}

interface Props {
  sectionIndex: number;
  totalSections: number;
  showEnglish: boolean;
  questions: GrammarQuestion[];
  onComplete: (result: SectionResult) => void;
}

const TF = ["Verdadeiro", "Falso"];

export function GrammarSectionNew({ sectionIndex, totalSections, showEnglish, questions, onComplete }: Props) {
  // For true/false, index 0 = true, 1 = false.
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Record<string, boolean> | null>(null);

  const rightIndex = (q: GrammarQuestion) => (q.type === "true-false" ? (q.isTrue ? 0 : 1) : q.correctIndex);
  const optionsOf = (q: GrammarQuestion) => (q.type === "true-false" ? TF : (q.options ?? []));
  const remaining = questions.filter((q) => picks[q.id] === undefined).length;

  function verify() {
    if (remaining > 0) return;
    setResults(Object.fromEntries(questions.map((q) => [q.id, picks[q.id] === rightIndex(q)])));
  }

  function finish() {
    const ans = questions.map((q) => ({
      questionId: q.id,
      correct: results?.[q.id] ?? false,
      userAnswer: optionsOf(q)[picks[q.id] ?? 0] ?? "",
      correctAnswer: optionsOf(q)[rightIndex(q) ?? 0] ?? "",
    }));
    onComplete({ sectionKey: "grammar", sectionName: "Gramática", answers: ans, totalCorrect: ans.filter((a) => a.correct).length, totalQuestions: ans.length });
  }

  return (
    <div>
      <div className="divide-y divide-[#EFEFED]">
        {questions.map((q, i) => {
          const ok = results?.[q.id];
          const mark: Mark = results ? (ok ? "correct" : "wrong") : "idle";
          const opts = optionsOf(q);
          return (
            <Item key={q.id} n={i + 1} mark={mark}>
              {q.type === "true-false" ? (
                <>
                  <p className="mb-1 text-[11px] text-[#98988F]">Verdadeiro ou falso?</p>
                  <div className="mb-2.5 rounded-[10px] bg-[#F7F7F6] px-3.5 py-2.5 text-[14px] leading-relaxed text-[#1F1F1F]">{q.statement}</div>
                </>
              ) : (
                <Prompt sub={showEnglish ? q.questionEnglish : undefined}>{q.question}</Prompt>
              )}
              <div className={`grid gap-1.5 ${q.type === "true-false" ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
                {opts.map((opt, oi) => (
                  <Choice
                    key={oi}
                    n={oi + 1}
                    label={opt}
                    selected={picks[q.id] === oi}
                    result={choiceResult(oi, picks[q.id], rightIndex(q), !!results)}
                    disabled={!!results}
                    onClick={() => setPicks((p) => ({ ...p, [q.id]: oi }))}
                  />
                ))}
              </div>
              {results && q.explanation && (
                <Feedback tone={ok ? "correct" : "wrong"} title={ok ? "Certo" : "Quase"}>
                  {q.explanation}
                </Feedback>
              )}
            </Item>
          );
        })}
      </div>
      <SectionFooter
        checked={!!results} ready={remaining === 0} remaining={remaining}
        correct={Object.values(results ?? {}).filter(Boolean).length} total={questions.length}
        isLast={sectionIndex === totalSections - 1} onCheck={verify} onNext={finish}
      />
    </div>
  );
}
