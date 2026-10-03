"use client";

import { useState, useCallback, use } from "react";
import Link from "next/link";
import { PageShell, Crumbs } from "@/components/layout/page-shell";
import { Choice, choiceResult } from "@/components/learn/kit";
import { LevelTag, Track } from "@/components/aula";
import { ProtectedRoute } from "@/components/protected-route";
import { PronunciationButton } from "@/components/pronunciation-button";
import {
  getExam,
  countWords,
  countKeyPhraseMatches,
  scoreWrittenResponse,
  getClassification,
  type MockExam,
  type MultipleChoiceQuestion,
  type MatchingQuestion,
  type WritingTask,
  type ListeningQuestion,
  type SpeakingPrompt,
} from "@/data/exams";
import { saveExamResult } from "@/lib/exam-progress";
import { logExamAttempt } from "@/lib/calendar-service";

/* ═══════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════ */

type Answers = Record<string, unknown>;

interface SectionState {
  answers: Answers;
  completed: boolean;
}

/* ═══════════════════════════════════════════════════
   TTS Helper
   ═══════════════════════════════════════════════════ */

const SHORT_TITLE: Record<string, string> = {
  "reading-writing": "Leitura e escrita",
  listening: "Compreensão do oral",
  speaking: "Produção oral",
};

function useTTS() {
  const speak = useCallback(
    (text: string, speed: "slow" | "normal" = "normal") => {
      if (typeof window === "undefined" || !window.speechSynthesis) return false;
      const syn = window.speechSynthesis;
      syn.cancel();
      const voices = syn.getVoices();
      const voice =
        voices.find((v) => v.lang.startsWith("pt-PT")) ??
        voices.find((v) => v.lang.startsWith("pt")) ??
        null;
      if (!voice) return false;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "pt-PT";
      u.rate = speed === "slow" ? 0.85 : 1.0;
      u.pitch = 1;
      u.voice = voice;
      syn.speak(u);
      return true;
    },
    []
  );

  const isAvailable =
    typeof window !== "undefined" && !!window.speechSynthesis;

  return { speak, isAvailable };
}

/* ═══════════════════════════════════════════════════
   Section 1: Reading & Writing Components
   ═══════════════════════════════════════════════════ */

function MCQuestion({
  q,
  answer,
  onAnswer,
}: {
  q: MultipleChoiceQuestion;
  answer: number | undefined;
  onAnswer: (idx: number) => void;
}) {
  const submitted = answer !== undefined;

  return (
    <div className="space-y-4">
      {/* Context label */}
      {q.stimulusContext && (
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3">
          {q.stimulusContext}
        </p>
      )}

      {/* Stimulus card */}
      <div className="rounded-[10px] bg-aula-sunken p-4">
        <p className="text-[15px] text-aula-text leading-relaxed whitespace-pre-line">
          {q.stimulus}
        </p>
      </div>

      {/* Instruction */}
      <p className="text-[12px] text-aula-text-3">{q.instructionEn}</p>

      {/* Question */}
      <p className="text-[14px] font-medium text-aula-text">{q.question}</p>
      {q.questionEn && (
        <p className="text-[13px] text-aula-text-2 -mt-2">{q.questionEn}</p>
      )}

      {/* Options */}
      <div className="grid grid-cols-1 gap-1.5">
            {q.options.map((opt, i) => (
              <Choice
                key={i}
                n={i + 1}
                label={opt}
                selected={answer === i}
                result={choiceResult(i, answer, q.correctIndex, submitted)}
                disabled={submitted}
                onClick={() => !submitted && onAnswer(i)}
              />
            ))}
          </div>

      {/* Explanation after answering */}
      {submitted && (
        <div className={`rounded-[10px] border px-3.5 py-2.5 ${answer === q.correctIndex ? "border-[#1F7A68] bg-[#E1F2ED]" : "border-[#B94A32] bg-[#FBE9E4]"}`}>
          <p className={`text-[12px] font-semibold ${answer === q.correctIndex ? "text-[#1F7A68]" : "text-[#B94A32]"}`}>
            {answer === q.correctIndex ? "Certo" : "Quase"}
          </p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-aula-text">{q.explanation}</p>
          {q.explanationEn && <p className="mt-0.5 text-[11.5px] text-aula-text-3">{q.explanationEn}</p>}
        </div>
      )}
    </div>
  );
}

function MatchingQuestionUI({
  q,
  answers,
  onAnswer,
}: {
  q: MatchingQuestion;
  answers: Record<string, string>;
  onAnswer: (leftIdx: number, rightValue: string) => void;
}) {
  const allAnswered = q.pairs.every(
    (_, i) => answers[`match-${i}`] !== undefined && answers[`match-${i}`] !== ""
  );
  const [submitted, setSubmitted] = useState(false);

  const rightOptions = q.pairs.map((p) => p.right);

  return (
    <div className="space-y-4">
      <p className="text-[12px] text-aula-text-3">{q.instructionEn}</p>
      <p className="text-[14px] font-medium text-aula-text">
        {q.instruction}
      </p>

      <div className="space-y-3">
        {q.pairs.map((pair, i) => {
          const selected = answers[`match-${i}`] ?? "";
          const isCorrect = submitted && selected === pair.right;
          const isWrong = submitted && selected !== pair.right;

          return (
            <div
              key={i}
              className={`flex items-center gap-4 border rounded-[10px] p-4 transition-all ${
                isCorrect
                  ? "border-[#1F7A68] bg-[#E1F2ED]"
                  : isWrong
                    ? "border-[#B94A32] bg-[#FBE9E4]"
                    : "border-aula-border bg-white"
              }`}
            >
              <p className="text-[14px] font-medium text-aula-text flex-1 min-w-0">
                {pair.left}
              </p>
              <select
                value={selected}
                onChange={(e) => onAnswer(i, e.target.value)}
                disabled={submitted}
                className="border border-aula-border rounded-lg px-3 py-2 text-[13px] text-aula-text bg-white min-w-[180px] outline-none focus:border-aula-accent disabled:opacity-60"
              >
                <option value="">Escolhe…</option>
                {rightOptions.map((opt, j) => (
                  <option key={j} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {submitted && isWrong && (
                <span className="text-[12px] text-[#1F7A68] font-medium shrink-0">
                  {pair.right}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {allAnswered && !submitted && (
        <button
          onClick={() => setSubmitted(true)}
          className="h-10 w-full rounded-lg bg-aula-accent text-[13px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
        >
          Verificar respostas
        </button>
      )}

      {submitted && (
        <div className="p-4 rounded-[10px] bg-aula-sunken border border-aula-line">
          <p className="text-[13px] font-semibold text-aula-text">
            {q.pairs.filter((p, i) => answers[`match-${i}`] === p.right).length}{" "}
            / {q.pairs.length} corretas
          </p>
        </div>
      )}
    </div>
  );
}

function WritingTaskUI({
  task,
  response,
  onResponse,
  submitted,
  onSubmit,
}: {
  task: WritingTask;
  response: string;
  onResponse: (text: string) => void;
  submitted: boolean;
  onSubmit: () => void;
}) {
  const wc = countWords(response);
  const meetsMin = wc >= task.minWords;

  return (
    <div className="space-y-4">
      <p className="text-[12px] text-aula-text-3">{task.instructionEn}</p>

      {/* Scenario card */}
      <div className="rounded-[10px] bg-aula-sunken p-4">
        <p className="text-[14px] font-medium text-aula-text">
          {task.scenario}
        </p>
        <p className="text-[13px] text-aula-text-2 mt-1">{task.scenarioEn}</p>
      </div>

      {/* Hints */}
      {task.hints && task.hints.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3">
            Indicações
          </p>
          <ul className="space-y-1">
            {task.hints.map((hint, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-aula-text-4 mt-0.5">·</span>
                <span className="text-[13px] text-aula-text-2">
                  {hint}
                  {task.hintsEn?.[i] && (
                    <span className="text-aula-text-3">
                      {" "}
                      — {task.hintsEn[i]}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Textarea */}
      <div>
        <textarea
          value={response}
          onChange={(e) => onResponse(e.target.value)}
          disabled={submitted}
          rows={6}
          className="w-full border border-aula-border rounded-[10px] p-4 text-[14px] text-aula-text bg-white outline-none focus:border-aula-accent resize-y disabled:opacity-60 disabled:bg-aula-sunken"
          placeholder="Escreve aqui a tua resposta…"
        />
        <div className="flex items-center justify-between mt-1">
          <p
            className={`text-[12px] font-medium ${
              wc === 0
                ? "text-aula-text-3"
                : meetsMin
                  ? "text-[#1F7A68]"
                  : "text-[#B94A32]"
            }`}
          >
            {wc} {wc === 1 ? "palavra" : "palavras"}
          </p>
          <p className="text-[12px] text-aula-text-3">
            {task.minWords}–{task.maxWords} palavras
          </p>
        </div>
      </div>

      {!submitted && (
        <button
          onClick={onSubmit}
          disabled={!meetsMin}
          className={`w-full py-2.5 text-[13px] font-semibold rounded-lg transition-colors cursor-pointer ${
            meetsMin
              ? "bg-aula-accent text-white hover:bg-aula-accent-hover"
              : "bg-aula-selected text-aula-text-4 cursor-not-allowed"
          }`}
        >
          Submeter resposta
        </button>
      )}

      {/* After submission: show sample response */}
      {submitted && (
        <div className="space-y-3">
          <div className="p-4 rounded-[10px] bg-aula-sunken border border-aula-line">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3 mb-2">
              Resposta modelo
            </p>
            <p className="text-[13px] text-aula-text leading-relaxed">
              {task.sampleResponse}
            </p>
            <p className="text-[12px] text-aula-text-3 mt-2 italic">
              {task.sampleResponseEn}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#E1F2ED] border border-[#BFE3D8]">
            <p className="text-[13px] text-[#1F7A68] font-medium">
              {countKeyPhraseMatches(response, task.keyPhrases)} /{" "}
              {task.keyPhrases.length} elementos-chave ·{" "}
              {scoreWrittenResponse(
                response,
                task.minWords,
                task.keyPhrases,
                task.points
              )}{" "}
              / {task.points} pts
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Section 2: Listening Components
   ═══════════════════════════════════════════════════ */

function ListeningQuestionUI({
  q,
  answer,
  onAnswer,
  playCount,
  onPlay,
}: {
  q: ListeningQuestion;
  answer: number | undefined;
  onAnswer: (idx: number) => void;
  playCount: number;
  onPlay: () => void;
}) {
  const submitted = answer !== undefined;
  const canPlay = playCount < q.playLimit;
  const tts = useTTS();
  const [ttsUnavailable, setTtsUnavailable] = useState(false);

  const handlePlay = () => {
    if (!canPlay) return;
    const success = tts.speak(q.audioText, q.audioSpeed ?? "normal");
    if (!success) {
      setTtsUnavailable(true);
    }
    onPlay();
  };

  return (
    <div className="space-y-4">
      <p className="text-[12px] text-aula-text-3">{q.instructionEn}</p>

      {/* Audio player */}
      {!ttsUnavailable ? (
        <div className="rounded-[10px] bg-aula-sunken p-4 flex items-center justify-between">
          <button
            onClick={handlePlay}
            disabled={!canPlay}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
              canPlay
                ? "bg-aula-accent text-white hover:bg-aula-accent-hover"
                : "bg-aula-selected text-aula-text-4 cursor-not-allowed"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
            {playCount === 0 ? "Ouvir áudio" : "Ouvir novamente"}
          </button>
          <span className="text-[12px] font-medium text-aula-text-3">
            {playCount} / {q.playLimit} reproduções
          </span>
        </div>
      ) : (
        <div className="border border-[#FBE9E4] rounded-[10px] p-5 bg-[#FBE9E4]">
          <p className="text-[13px] font-medium text-[#B94A32] mb-2">
            O áudio não está disponível neste dispositivo. Aqui está a transcrição:
          </p>
          <p className="text-[14px] text-aula-text italic leading-relaxed">
            &ldquo;{q.audioText}&rdquo;
          </p>
        </div>
      )}

      {/* Question + options (always visible after at least 1 play, or if TTS unavailable) */}
      {(playCount > 0 || ttsUnavailable) && (
        <>
          <p className="text-[14px] font-medium text-aula-text">
            {q.question}
          </p>
          {q.questionEn && (
            <p className="text-[13px] text-aula-text-2 -mt-2">{q.questionEn}</p>
          )}

          <div className="grid grid-cols-1 gap-1.5">
            {q.options.map((opt, i) => (
              <Choice
                key={i}
                n={i + 1}
                label={opt}
                selected={answer === i}
                result={choiceResult(i, answer, q.correctIndex, submitted)}
                disabled={submitted}
                onClick={() => !submitted && onAnswer(i)}
              />
            ))}
          </div>

          {submitted && (
            <div className={`rounded-[10px] border px-3.5 py-2.5 ${answer === q.correctIndex ? "border-[#1F7A68] bg-[#E1F2ED]" : "border-[#B94A32] bg-[#FBE9E4]"}`}>
          <p className={`text-[12px] font-semibold ${answer === q.correctIndex ? "text-[#1F7A68]" : "text-[#B94A32]"}`}>
            {answer === q.correctIndex ? "Certo" : "Quase"}
          </p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-aula-text">{q.explanation}</p>
          {q.explanationEn && <p className="mt-0.5 text-[11.5px] text-aula-text-3">{q.explanationEn}</p>}
              {/* Show transcript after answering */}
              <div className="mt-3 pt-3 border-t border-aula-border">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3 mb-1">
                  Transcrição
                </p>
                <p className="text-[13px] text-aula-text italic">
                  &ldquo;{q.audioText}&rdquo;
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Section 3: Speaking Components
   ═══════════════════════════════════════════════════ */

function SpeakingPromptUI({
  prompt: sp,
  response,
  onResponse,
  submitted,
  onSubmit,
}: {
  prompt: SpeakingPrompt;
  response: string;
  onResponse: (text: string) => void;
  submitted: boolean;
  onSubmit: () => void;
}) {
  const wc = countWords(response);
  const meetsMin = wc >= sp.minWords;

  const partLabels: Record<number, string> = {
    1: "Parte 1 · Identificação Pessoal",
    2: "Parte 2 · Simulação",
    3: "Parte 3 · Conversa sobre um Tema",
  };

  return (
    <div className="space-y-4">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3">
        {partLabels[sp.part] ?? `Parte ${sp.part}`}
      </p>

      {/* Instruction */}
      <p className="text-[13px] text-aula-text-2 italic">{sp.instructionEn}</p>

      {/* Examiner prompt — speech bubble */}
      <div className="relative rounded-[10px] bg-aula-sunken p-4">
        <div className="flex items-start gap-3">
          <PronunciationButton text={sp.prompt} size="sm" variant="muted" className="shrink-0 mt-0.5" />
          <div>
            <p className="text-[14px] font-medium text-aula-text leading-relaxed">
              &ldquo;{sp.prompt}&rdquo;
            </p>
            <p className="text-[13px] text-aula-text-3 mt-1 italic">
              {sp.promptEn}
            </p>
          </div>
        </div>
      </div>

      {/* Guidance checklist */}
      <div className="space-y-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3">
          Orientação
        </p>
        <ul className="space-y-1">
          {sp.guidance.map((g, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-aula-text-4 mt-0.5">·</span>
              <span className="text-[13px] text-aula-text-3">
                {g}
                {sp.guidanceEn[i] && (
                  <span className="text-aula-text-4">
                    {" "}
                    — {sp.guidanceEn[i]}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Textarea */}
      <div>
        <textarea
          value={response}
          onChange={(e) => onResponse(e.target.value)}
          disabled={submitted}
          rows={5}
          className="w-full border border-aula-border rounded-[10px] p-4 text-[14px] text-aula-text bg-white outline-none focus:border-aula-accent resize-y disabled:opacity-60 disabled:bg-aula-sunken"
          placeholder="Escreve aqui a tua resposta…"
        />
        <div className="flex items-center justify-between mt-1">
          <p
            className={`text-[12px] font-medium ${
              wc === 0
                ? "text-aula-text-3"
                : meetsMin
                  ? "text-[#1F7A68]"
                  : "text-[#B94A32]"
            }`}
          >
            {wc} {wc === 1 ? "palavra" : "palavras"}
          </p>
          <p className="text-[12px] text-aula-text-3">
            min. {sp.minWords} palavras
          </p>
        </div>
      </div>

      {!submitted && (
        <button
          onClick={onSubmit}
          disabled={!meetsMin}
          className={`w-full py-2.5 text-[13px] font-semibold rounded-lg transition-colors cursor-pointer ${
            meetsMin
              ? "bg-aula-accent text-white hover:bg-aula-accent-hover"
              : "bg-aula-selected text-aula-text-4 cursor-not-allowed"
          }`}
        >
          Submeter resposta
        </button>
      )}

      {/* After submission: show comparison */}
      {submitted && (
        <div className="space-y-3">
          <div className="p-4 rounded-[10px] bg-aula-sunken border border-aula-line">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3 mb-2">
              Resposta modelo
            </p>
            <p className="text-[13px] text-aula-text leading-relaxed">
              {sp.sampleResponse}
            </p>
            <p className="text-[12px] text-aula-text-3 mt-2 italic">
              {sp.sampleResponseEn}
            </p>
          </div>

          {/* Key elements check */}
          <div className="p-3 rounded-lg bg-aula-sunken border border-aula-line">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3 mb-2">
              Elementos-chave
            </p>
            <div className="flex flex-wrap gap-2">
              {sp.keyElements.map((el, i) => {
                const found = el.split("|").some((alt) =>
                  response
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .includes(
                      alt
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                    )
                );
                return (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium ${
                      found
                        ? "bg-[#E1F2ED] text-[#1F7A68] border border-[#BFE3D8]"
                        : "bg-aula-selected text-aula-text-3 border border-aula-border"
                    }`}
                  >
                    {found ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    )}
                    {el.split("|")[0]}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#E1F2ED] border border-[#BFE3D8]">
            <p className="text-[13px] text-[#1F7A68] font-medium">
              {countKeyPhraseMatches(response, sp.keyElements)} /{" "}
              {sp.keyElements.length} elementos-chave ·{" "}
              {scoreWrittenResponse(
                response,
                sp.minWords,
                sp.keyElements,
                sp.points
              )}{" "}
              / {sp.points} pts
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Summary Screen
   ═══════════════════════════════════════════════════ */

function SummaryScreen({
  exam,
  sectionStates,
  onSave,
  saving,
  saved,
}: {
  exam: MockExam;
  sectionStates: SectionState[];
  onSave: () => void;
  saving: boolean;
  saved: boolean;
}) {
  // Calculate scores
  const rwSection = exam.sections[0];
  const liSection = exam.sections[1];
  const spSection = exam.sections[2];
  const rwAnswers = sectionStates[0].answers;
  const liAnswers = sectionStates[1].answers;
  const spAnswers = sectionStates[2].answers;

  // Reading & Writing score
  let rwPoints = 0;
  let rwTotal = 0;
  rwSection.parts.reading.forEach((q) => {
    rwTotal += q.points;
    if (q.type === "multiple-choice") {
      const a = rwAnswers[q.id] as number | undefined;
      if (a === q.correctIndex) rwPoints += q.points;
    } else if (q.type === "matching") {
      const perPair = q.points / q.pairs.length;
      q.pairs.forEach((pair, i) => {
        if (rwAnswers[`${q.id}-match-${i}`] === pair.right) {
          rwPoints += perPair;
        }
      });
    }
  });
  rwSection.parts.writing.forEach((t) => {
    rwTotal += t.points;
    const text = (rwAnswers[t.id] as string) ?? "";
    rwPoints += scoreWrittenResponse(text, t.minWords, t.keyPhrases, t.points);
  });

  // Listening score
  let liPoints = 0;
  let liTotal = 0;
  liSection.questions.forEach((q) => {
    liTotal += q.points;
    const a = liAnswers[q.id] as number | undefined;
    if (a === q.correctIndex) liPoints += q.points;
  });

  // Speaking score
  let spPoints = 0;
  let spTotal = 0;
  spSection.prompts.forEach((p) => {
    spTotal += p.points;
    const text = (spAnswers[p.id] as string) ?? "";
    spPoints += scoreWrittenResponse(text, p.minWords, p.keyElements, p.points);
  });

  const rwPct = rwTotal > 0 ? (rwPoints / rwTotal) * 100 : 0;
  const liPct = liTotal > 0 ? (liPoints / liTotal) * 100 : 0;
  const spPct = spTotal > 0 ? (spPoints / spTotal) * 100 : 0;

  const finalPct =
    rwPct * rwSection.weight +
    liPct * liSection.weight +
    spPct * spSection.weight;

  const classification = getClassification(finalPct);

  const passed = classification.tier !== "not-yet";
  const rows = [
    { label: SHORT_TITLE["reading-writing"], pts: rwPoints, total: rwTotal, pct: rwPct, w: rwSection.weight },
    { label: SHORT_TITLE.listening, pts: liPoints, total: liTotal, pct: liPct, w: liSection.weight },
    { label: SHORT_TITLE.speaking, pts: spPoints, total: spTotal, pct: spPct, w: spSection.weight },
  ];

  return (
    <div className="pb-4">
      <div className="rounded-xl border border-aula-border bg-white p-6">
        <div className="flex items-end gap-4">
          <span className={`text-[44px] font-semibold leading-none tracking-[-0.03em] ${passed ? "text-[#1F7A68]" : "text-aula-text"}`}>{Math.round(finalPct)}%</span>
          <div className="pb-1">
            <p className={`text-[15px] font-semibold ${passed ? "text-[#1F7A68]" : "text-[#5B45B8]"}`}>{classification.labelPt}</p>
            <p className="text-[12px] text-aula-text-2">{passed ? "Passavas no CIPLE com esta nota." : "Precisas de 55% para Suficiente."}</p>
          </div>
        </div>
        <div className="relative mt-5">
          <Track value={finalPct / 100} tone={passed ? "accent" : "learning"} />
          {[55, 70, 85].map((m) => (
            <span key={m} className="absolute top-[-3px] h-[10px] w-px bg-aula-text-3" style={{ left: `${m}%` }} title={`${m}%`} />
          ))}
        </div>
        <div className="mt-1.5 flex justify-end gap-4 text-[10.5px] text-aula-text-3">
          <span>55 Suficiente</span>
          <span>70 Bom</span>
          <span>85 Muito Bom</span>
        </div>

        <div className="mt-6">
          <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3">Por parte</p>
          {rows.map((r) => (
            <div key={r.label} className="flex h-10 items-center gap-4 text-[13px]">
              <span className="flex-1 text-aula-text">
                {r.label} <span className="text-[11px] text-aula-text-3">· vale {Math.round(r.w * 100)}%</span>
              </span>
              <div className="w-[120px]">
                <Track value={r.pct / 100} tone={r.pct >= 55 ? "accent" : "learning"} />
              </div>
              <span className="w-[86px] text-right text-[12px] text-aula-text-2">
                {Math.round(r.pts)} / {r.total} pts
              </span>
            </div>
          ))}
        </div>

        {!passed && (
          <p className="mt-4 rounded-[10px] bg-aula-sunken px-4 py-3 text-[12.5px] leading-relaxed text-aula-text-2">
            Continua a praticar. Revê as partes com a nota mais baixa e volta a tentar quando te sentires pronto.
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {!saved ? (
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex h-10 items-center rounded-lg bg-aula-accent px-5 text-[13px] font-medium text-white transition-colors hover:bg-aula-accent-hover disabled:opacity-50"
          >
            {saving ? "A guardar…" : "Guardar resultado"}
          </button>
        ) : (
          <span className="inline-flex h-10 items-center text-[13px] font-medium text-[#1F7A68]">✓ Resultado guardado</span>
        )}
        <Link href="/exams" className="inline-flex h-10 items-center rounded-lg border border-aula-border bg-white px-4 text-[13px] font-medium text-aula-text transition-colors hover:border-aula-text-4">
          Voltar aos exames
        </Link>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Main Exam Flow
   ═══════════════════════════════════════════════════ */

function ExamContent({ id }: { id: string }) {
  const exam = getExam(id);
  const [started, setStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [sectionStates, setSectionStates] = useState<SectionState[]>([
    { answers: {}, completed: false },
    { answers: {}, completed: false },
    { answers: {}, completed: false },
  ]);
  const [showSummary, setShowSummary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Listening play counts
  const [playCounts, setPlayCounts] = useState<Record<string, number>>({});

  if (!exam) {
    return (
      <PageShell header={<Crumbs items={[{ label: "Exames", href: "/exams" }, { label: "Exame" }]} />}>
        <div className="mx-auto max-w-[760px]">
          <p className="text-[13px] text-aula-text-3">Exame não encontrado.</p>
          <Link
            href="/exams"
            className="mt-2 inline-block text-[13px] font-medium text-aula-accent"
          >
            Voltar aos exames
          </Link>
        </div>
      </PageShell>
    );
  }

  if (!exam.available) {
    return (
      <PageShell header={<Crumbs items={[{ label: "Exames", href: "/exams" }, { label: exam.titlePt }]} />}>
        <div className="mx-auto max-w-[760px]">
          <p className="text-[18px] font-semibold text-aula-text">
            Em breve
          </p>
          <p className="text-[13px] text-aula-text-3 mt-1">
            Este exame ainda não está disponível.
          </p>
          <Link
            href="/exams"
            className="mt-4 inline-block text-[13px] font-medium text-aula-accent"
          >
            Voltar aos exames
          </Link>
        </div>
      </PageShell>
    );
  }

  const setAnswer = (sectionIdx: number, key: string, value: unknown) => {
    setSectionStates((prev) => {
      const next = [...prev];
      next[sectionIdx] = {
        ...next[sectionIdx],
        answers: { ...next[sectionIdx].answers, [key]: value },
      };
      return next;
    });
  };

  // Get items for current section
  const getItemCount = (sectionIdx: number): number => {
    const sec = exam.sections[sectionIdx];
    if (sec.type === "reading-writing") {
      return sec.parts.reading.length + sec.parts.writing.length;
    } else if (sec.type === "listening") {
      return sec.questions.length;
    } else {
      return sec.prompts.length;
    }
  };

  const itemCount = getItemCount(currentSection);

  const completeSection = () => {
    setSectionStates((prev) => {
      const next = [...prev];
      next[currentSection] = { ...next[currentSection], completed: true };
      return next;
    });
    if (currentSection < 2) {
      setCurrentSection((prev) => prev + 1);
      setCurrentQuestion(0);
      (document.getElementById("aula-scroll") ?? window).scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setShowSummary(true);
      (document.getElementById("aula-scroll") ?? window).scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const rwSection = exam.sections[0];
    const liSection = exam.sections[1];
    const spSection = exam.sections[2];

    let rwPoints = 0, rwTotal = 0;
    rwSection.parts.reading.forEach((q) => {
      rwTotal += q.points;
      if (q.type === "multiple-choice") {
        if (sectionStates[0].answers[q.id] === q.correctIndex) rwPoints += q.points;
      } else if (q.type === "matching") {
        const perPair = q.points / q.pairs.length;
        q.pairs.forEach((pair, i) => {
          if (sectionStates[0].answers[`${q.id}-match-${i}`] === pair.right) rwPoints += perPair;
        });
      }
    });
    rwSection.parts.writing.forEach((t) => {
      rwTotal += t.points;
      rwPoints += scoreWrittenResponse((sectionStates[0].answers[t.id] as string) ?? "", t.minWords, t.keyPhrases, t.points);
    });

    let liPoints = 0, liTotal = 0;
    liSection.questions.forEach((q) => {
      liTotal += q.points;
      if (sectionStates[1].answers[q.id] === q.correctIndex) liPoints += q.points;
    });

    let spPoints = 0, spTotal = 0;
    spSection.prompts.forEach((p) => {
      spTotal += p.points;
      spPoints += scoreWrittenResponse((sectionStates[2].answers[p.id] as string) ?? "", p.minWords, p.keyElements, p.points);
    });

    const rwPct = rwTotal > 0 ? (rwPoints / rwTotal) * 100 : 0;
    const liPct = liTotal > 0 ? (liPoints / liTotal) * 100 : 0;
    const spPct = spTotal > 0 ? (spPoints / spTotal) * 100 : 0;
    const finalPct = rwPct * rwSection.weight + liPct * liSection.weight + spPct * spSection.weight;
    const classification = getClassification(finalPct);

    await saveExamResult(exam.id, {
      overallScore: finalPct,
      classification: classification.labelPt,
      sectionScores: [
        { sectionId: rwSection.id, sectionType: "reading-writing", pointsEarned: rwPoints, pointsTotal: rwTotal, percentage: rwPct },
        { sectionId: liSection.id, sectionType: "listening", pointsEarned: liPoints, pointsTotal: liTotal, percentage: liPct },
        { sectionId: spSection.id, sectionType: "speaking", pointsEarned: spPoints, pointsTotal: spTotal, percentage: spPct },
      ],
      answers: Object.fromEntries(
        sectionStates.flatMap((s, i) =>
          Object.entries(s.answers).map(([k, v]) => [`s${i}-${k}`, v])
        )
      ),
    });

    const examTitle = exam.titlePt ? `${exam.titlePt} (${exam.title})` : exam.title;
    const passed = classification.tier !== "not-yet";
    logExamAttempt(exam.id, examTitle, finalPct, passed).catch(() => {});

    setSaving(false);
    setSaved(true);
  };

  // ─── Exam Start Screen ───
  if (!started) {
    return (
      <PageShell header={<Crumbs items={[{ label: "Exames", href: "/exams" }, { label: exam.titlePt }]} />}>
        <div className="mx-auto max-w-[760px]">
          <div className="mb-6 pt-1">
            <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3">Exame simulado · {exam.monthPt}</p>
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-aula-text">{exam.titlePt}</h1>
              <LevelTag level="A2" />
            </div>
            <p className="mt-1.5 text-[13px] leading-relaxed text-aula-text-2">{exam.descriptionPt}</p>
          </div>

          {/* Section overview */}
          <div className="mb-6 divide-y divide-aula-line rounded-[10px] border border-aula-border bg-white">
            {exam.sections.map((sec, i) => (
              <div key={sec.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3">
                    Secção {i + 1}
                  </p>
                  <p className="text-[14px] font-medium text-aula-text mt-1">
                    {sec.title}
                  </p>
                  <p className="text-[13px] text-aula-text-2 italic">
                    {sec.titleEn}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-semibold text-aula-text">
                    {Math.round(sec.weight * 100)}%
                  </p>
                  <p className="text-[12px] text-aula-text-3">
                    {sec.timeMinutes} min
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="mb-5 text-[12px] leading-relaxed text-aula-text-3">
            Faz as três partes por ordem. O resultado só fica guardado quando acabares o exame.
          </p>

          <button
            onClick={() => setStarted(true)}
            className="inline-flex h-10 items-center rounded-lg bg-aula-accent px-5 text-[13px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
          >
            Começar o exame →
          </button>

          <div className="mb-16" />
        </div>
      </PageShell>
    );
  }

  // ─── Summary Screen ───
  if (showSummary) {
    return (
      <PageShell header={<Crumbs items={[{ label: "Exames", href: "/exams" }, { label: exam.titlePt }]} />}>
        <div className="mx-auto max-w-[760px]">
          <div className="mb-4 pt-1">
            <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-aula-text-3">Resultado</p>
            <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-aula-text">{exam.titlePt}</h1>
          </div>
          <SummaryScreen
            exam={exam}
            sectionStates={sectionStates}
            onSave={handleSave}
            saving={saving}
            saved={saved}
          />
          <div className="mb-16" />
        </div>
      </PageShell>
    );
  }

  // ─── Section Flow ───
  const renderCurrentItem = () => {
    const sec = exam.sections[currentSection];

    if (sec.type === "reading-writing") {
      const allItems = [
        ...sec.parts.reading,
        ...sec.parts.writing,
      ];
      const item = allItems[currentQuestion];
      if (!item) return null;

      if (item.type === "multiple-choice") {
        const q = item as MultipleChoiceQuestion;
        return (
          <MCQuestion
            key={q.id}
            q={q}
            answer={sectionStates[0].answers[q.id] as number | undefined}
            onAnswer={(idx) => setAnswer(0, q.id, idx)}
          />
        );
      } else if (item.type === "matching") {
        const q = item as MatchingQuestion;
        const matchAnswers: Record<string, string> = {};
        q.pairs.forEach((_, i) => {
          const val = sectionStates[0].answers[`${q.id}-match-${i}`];
          if (typeof val === "string") matchAnswers[`match-${i}`] = val;
        });
        return (
          <MatchingQuestionUI
            key={q.id}
            q={q}
            answers={matchAnswers}
            onAnswer={(leftIdx, rightValue) =>
              setAnswer(0, `${q.id}-match-${leftIdx}`, rightValue)
            }
          />
        );
      } else if (item.type === "writing") {
        const t = item as WritingTask;
        const resp = (sectionStates[0].answers[t.id] as string) ?? "";
        const isSubmitted = sectionStates[0].answers[`${t.id}-submitted`] === true;
        return (
          <WritingTaskUI
            key={t.id}
            task={t}
            response={resp}
            onResponse={(text) => setAnswer(0, t.id, text)}
            submitted={isSubmitted}
            onSubmit={() => setAnswer(0, `${t.id}-submitted`, true)}
          />
        );
      }
    } else if (sec.type === "listening") {
      const q = sec.questions[currentQuestion];
      if (!q) return null;
      return (
        <ListeningQuestionUI
          key={q.id}
          q={q}
          answer={sectionStates[1].answers[q.id] as number | undefined}
          onAnswer={(idx) => setAnswer(1, q.id, idx)}
          playCount={playCounts[q.id] ?? 0}
          onPlay={() =>
            setPlayCounts((prev) => ({
              ...prev,
              [q.id]: (prev[q.id] ?? 0) + 1,
            }))
          }
        />
      );
    } else if (sec.type === "speaking") {
      const p = sec.prompts[currentQuestion];
      if (!p) return null;
      const resp = (sectionStates[2].answers[p.id] as string) ?? "";
      const isSubmitted = sectionStates[2].answers[`${p.id}-submitted`] === true;
      return (
        <SpeakingPromptUI
          key={p.id}
          prompt={p}
          response={resp}
          onResponse={(text) => setAnswer(2, p.id, text)}
          submitted={isSubmitted}
          onSubmit={() => setAnswer(2, `${p.id}-submitted`, true)}
        />
      );
    }

    return null;
  };

  const progressPct = itemCount > 0 ? ((currentQuestion + 1) / itemCount) * 100 : 0;

  return (
    <PageShell header={<Crumbs items={[{ label: "Exames", href: "/exams" }, { label: exam.titlePt }]} />}>
        <div className="mx-auto max-w-[760px]">
        {/* Header: section steps + progress */}
        <div className="mb-6 pt-1">
          <div className="inline-flex max-w-full flex-wrap gap-0.5 rounded-lg bg-aula-sunken p-[3px]">
            {exam.sections.map((sec, i) => {
              const isActive = i === currentSection;
              const isCompleted = sectionStates[i].completed;
              const isLocked = i > currentSection && !sectionStates[i - 1]?.completed;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    if (!isLocked) {
                      setCurrentSection(i);
                      setCurrentQuestion(0);
                    }
                  }}
                  disabled={isLocked}
                  className={`inline-flex h-[28px] items-center gap-1.5 rounded-md border px-3 text-[12px] transition-colors ${
                    isActive
                      ? "border-aula-line bg-white font-medium text-aula-text shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
                      : isCompleted
                        ? "border-transparent text-[#1F7A68]"
                        : isLocked
                          ? "cursor-not-allowed border-transparent text-aula-text-4"
                          : "border-transparent text-aula-text-2 hover:text-aula-text"
                  }`}
                >
                  <span className="text-[10.5px] opacity-70">{i + 1}</span>
                  {SHORT_TITLE[sec.type] ?? sec.title}
                  {isCompleted && <span aria-hidden>✓</span>}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-aula-line">
              <div className="h-full rounded-full bg-aula-accent transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="shrink-0 text-[11.5px] text-aula-text-3">
              {currentQuestion + 1} de {itemCount}
            </span>
          </div>
        </div>

        {/* Current item */}
        <div className="rounded-[10px] border border-aula-border bg-white p-6">{renderCurrentItem()}</div>

        {/* Navigation footer */}
        <div className="mb-10 mt-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (currentQuestion > 0) {
                setCurrentQuestion((prev) => prev - 1);
                (document.getElementById("aula-scroll") ?? window).scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            disabled={currentQuestion === 0}
            className="inline-flex h-9 items-center rounded-lg px-3 text-[13px] font-medium text-aula-text-2 transition-colors hover:bg-aula-sunken disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Anterior
          </button>

          {currentQuestion < itemCount - 1 ? (
            <button
              onClick={() => {
                setCurrentQuestion((prev) => prev + 1);
                (document.getElementById("aula-scroll") ?? window).scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex h-9 items-center rounded-lg bg-aula-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
            >
              Seguinte →
            </button>
          ) : (
            <button
              onClick={completeSection}
              className="inline-flex h-9 items-center rounded-lg bg-aula-accent px-4 text-[13px] font-medium text-white transition-colors hover:bg-aula-accent-hover"
            >
              {currentSection < 2
                ? "Secção seguinte →"
                : "Ver resultado →"}
            </button>
          )}
        </div>
      </div>
      </PageShell>
  );
}

/* ═══════════════════════════════════════════════════
   Page Wrapper
   ═══════════════════════════════════════════════════ */

export default function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <ProtectedRoute>
      <ExamContent id={id} />
    </ProtectedRoute>
  );
}
