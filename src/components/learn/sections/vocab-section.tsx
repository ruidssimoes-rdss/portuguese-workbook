"use client";

import { useState, useRef, useEffect } from "react";
import { checkAnswer } from "@/lib/accent-utils";
import type { SectionResult } from "@/lib/exercise-types";
import { AudioButton } from "@/components/primitives";
import { Item, AnswerInput, Choice, choiceResult, AccentNote, SectionFooter, type Mark } from "../kit";

interface VocabQuestion {
  id: string;
  type: "type-answer" | "mc";
  portugueseWord: string;
  englishWord: string;
  pronunciation?: string;
  acceptedAnswers?: string[];
  options?: string[];
  correctIndex?: number;
}

interface Props {
  sectionIndex: number;
  totalSections: number;
  showEnglish: boolean;
  questions: VocabQuestion[];
  onComplete: (result: SectionResult) => void;
}

export function VocabSectionNew({ sectionIndex, totalSections, questions, onComplete }: Props) {
  const [typed, setTyped] = useState<Record<string, string>>({});
  const [picks, setPicks] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Record<string, { correct: boolean; accentHint?: string }> | null>(null);
  const refs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const first = questions.find((q) => q.type === "type-answer");
    const t = setTimeout(() => first && refs.current[first.id]?.focus(), 100);
    return () => clearTimeout(t);
  }, [questions]);

  const answered = (q: VocabQuestion) => (q.type === "mc" ? picks[q.id] !== undefined : !!(typed[q.id] ?? "").trim());
  const remaining = questions.filter((q) => !answered(q)).length;

  function verify() {
    if (remaining > 0) return;
    const r: NonNullable<typeof results> = {};
    for (const q of questions) {
      if (q.type === "mc") r[q.id] = { correct: picks[q.id] === q.correctIndex };
      else {
        const chk = checkAnswer((typed[q.id] ?? "").trim(), q.englishWord, q.acceptedAnswers);
        r[q.id] = { correct: chk.correct, accentHint: chk.accentHint };
      }
    }
    setResults(r);
  }

  function finish() {
    const answers = questions.map((q) => ({
      questionId: q.id,
      correct: results?.[q.id]?.correct ?? false,
      userAnswer: q.type === "mc" ? (q.options?.[picks[q.id] ?? 0] ?? "") : (typed[q.id] ?? "").trim(),
      correctAnswer: q.type === "mc" ? (q.options?.[q.correctIndex ?? 0] ?? "") : q.englishWord,
      accentHint: results?.[q.id]?.accentHint,
    }));
    onComplete({ sectionKey: "vocab", sectionName: "Vocabulário", answers, totalCorrect: answers.filter((a) => a.correct).length, totalQuestions: answers.length });
  }

  function focusNextTyped(after: number) {
    const next = questions.slice(after + 1).find((q) => q.type === "type-answer");
    if (next) refs.current[next.id]?.focus();
    else verify();
  }

  return (
    <div>
      <div className="divide-y divide-[#EFEFED]">
        {questions.map((q, i) => {
          const r = results?.[q.id];
          const mark: Mark = !r ? "idle" : r.correct ? "correct" : "wrong";
          return (
            <Item key={q.id} n={i + 1} mark={mark}>
              <div className="mb-2.5 flex items-center gap-1.5">
                <span className="text-[17px] font-semibold tracking-[-0.01em] text-[#1F1F1F]">{q.portugueseWord}</span>
                <AudioButton text={q.portugueseWord} />
                {q.pronunciation && <span className="text-[12px] text-[#98988F]">/{q.pronunciation.replace(/^\/|\/$/g, "")}/</span>}
              </div>
              {q.type === "mc" && q.options ? (
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {q.options.map((opt, oi) => (
                    <Choice
                      key={oi}
                      n={oi + 1}
                      label={opt}
                      selected={picks[q.id] === oi}
                      result={choiceResult(oi, picks[q.id], q.correctIndex, !!results)}
                      disabled={!!results}
                      onClick={() => setPicks((p) => ({ ...p, [q.id]: oi }))}
                    />
                  ))}
                </div>
              ) : (
                <>
                  <AnswerInput
                    ref={(el) => { refs.current[q.id] = el; }}
                    value={typed[q.id] ?? ""}
                    onChange={(v) => setTyped((p) => ({ ...p, [q.id]: v }))}
                    mark={mark}
                    correct={q.englishWord}
                    placeholder="O que quer dizer?"
                    onEnter={() => focusNextTyped(i)}
                  />
                  {r?.correct && <AccentNote hint={r.accentHint} />}
                </>
              )}
            </Item>
          );
        })}
      </div>
      <SectionFooter
        checked={!!results} ready={remaining === 0} remaining={remaining}
        correct={Object.values(results ?? {}).filter((r) => r.correct).length} total={questions.length}
        isLast={sectionIndex === totalSections - 1} onCheck={verify} onNext={finish}
      />
    </div>
  );
}
