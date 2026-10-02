"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { SectionResult } from "@/lib/exercise-types";
import { Item, AnswerInput, AccentNote, SectionFooter, type Mark } from "../kit";

interface ErrorSentence { id: string; incorrectSentence: string; correctSentence: string; acceptedAnswers?: string[]; hintEnglish?: string; }

interface Props {
  sectionIndex: number; totalSections: number; showEnglish: boolean;
  sentences: ErrorSentence[]; onComplete: (result: SectionResult) => void;
}

export function ErrorCorrectionSectionNew({ sectionIndex, totalSections, showEnglish, sentences, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, { correct: boolean; accentHint?: string }> | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { const t = setTimeout(() => refs.current[0]?.focus(), 100); return () => clearTimeout(t); }, []);

  const remaining = sentences.filter((s) => !(answers[s.id] ?? "").trim()).length;

  function verify() {
    if (remaining > 0) return;
    const r: NonNullable<typeof results> = {};
    for (const s of sentences) {
      const chk = checkAnswer((answers[s.id] ?? "").trim(), s.correctSentence, s.acceptedAnswers);
      r[s.id] = { correct: chk.correct, accentHint: chk.accentHint };
    }
    setResults(r);
  }

  function finish() {
    const ans = sentences.map((s) => ({
      questionId: s.id, correct: results?.[s.id]?.correct ?? false,
      userAnswer: (answers[s.id] ?? "").trim(), correctAnswer: s.correctSentence,
      accentHint: results?.[s.id]?.accentHint,
    }));
    onComplete({ sectionKey: "error-correction", sectionName: "Corrige os erros", answers: ans, totalCorrect: ans.filter((a) => a.correct).length, totalQuestions: ans.length });
  }

  return (
    <div>
      <div className="divide-y divide-[#EFEFED]">
        {sentences.map((s, i) => {
          const r = results?.[s.id];
          const mark: Mark = !r ? "idle" : r.correct ? "correct" : "wrong";
          return (
            <Item key={s.id} n={i + 1} mark={mark}>
              <div className="mb-2.5 rounded-[10px] bg-[#F7F7F6] px-3.5 py-2.5">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#98988F]">Tem um erro</p>
                <p className="mt-0.5 text-[14px] text-[#1F1F1F]">{s.incorrectSentence}</p>
                {showEnglish && s.hintEnglish && <p className="mt-0.5 text-[12px] text-[#98988F]">{s.hintEnglish}</p>}
              </div>
              <AnswerInput
                ref={(el) => { refs.current[i] = el; }}
                value={answers[s.id] ?? ""}
                onChange={(v) => setAnswers((p) => ({ ...p, [s.id]: v }))}
                mark={mark}
                correct={s.correctSentence}
                placeholder="Escreve a frase corrigida…"
                onEnter={() => (i < sentences.length - 1 ? refs.current[i + 1]?.focus() : verify())}
              />
              {r?.correct && <AccentNote hint={r.accentHint} />}
            </Item>
          );
        })}
      </div>
      <SectionFooter
        checked={!!results} ready={remaining === 0} remaining={remaining}
        correct={Object.values(results ?? {}).filter((r) => r.correct).length} total={sentences.length}
        isLast={sectionIndex === totalSections - 1} onCheck={verify} onNext={finish}
      />
    </div>
  );
}
