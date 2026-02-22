"use client";

import { useState, useCallback, use } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
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
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
          {q.stimulusContext}
        </p>
      )}

      {/* Stimulus card */}
      <div className="border border-[#E5E7EB] rounded-xl p-5 bg-[#FAFAFA]">
        <p className="text-[15px] text-[#111827] leading-relaxed whitespace-pre-line">
          {q.stimulus}
        </p>
      </div>

      {/* Instruction */}
      <p className="text-[13px] text-[#9CA3AF] italic">{q.instructionEn}</p>

      {/* Question */}
      <p className="text-[15px] font-semibold text-[#111827]">{q.question}</p>
      {q.questionEn && (
        <p className="text-[13px] text-[#6B7280] -mt-2">{q.questionEn}</p>
      )}

      {/* Options */}
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let optClass =
            "border border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:shadow-sm cursor-pointer";

          if (submitted) {
            if (i === q.correctIndex) {
              optClass = "border-2 border-[#059669] bg-[#F0FDF4]";
            } else if (i === answer && i !== q.correctIndex) {
              optClass = "border-2 border-[#DC2626] bg-[#FEF2F2]";
            } else {
              optClass = "border border-[#F3F4F6] bg-[#FAFAFA] opacity-50";
            }
          }

          return (
            <button
              key={i}
              onClick={() => !submitted && onAnswer(i)}
              disabled={submitted}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${optClass}`}
            >
              <span
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-[12px] font-semibold ${
                  submitted && i === q.correctIndex
                    ? "border-[#059669] bg-[#059669] text-white"
                    : submitted && i === answer
                      ? "border-[#DC2626] bg-[#DC2626] text-white"
                      : "border-[#D1D5DB] text-[#9CA3AF]"
                }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span
                className={`text-[14px] ${submitted && i === q.correctIndex ? "font-semibold text-[#059669]" : submitted && i === answer ? "font-semibold text-[#DC2626]" : "text-[#374151]"}`}
              >
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      {/* Explanation after answering */}
      {submitted && (
        <div
          className={`p-4 rounded-xl border ${answer === q.correctIndex ? "bg-[#F0FDF4] border-[#D1FAE5]" : "bg-[#FEF2F2] border-[#FEE2E2]"}`}
        >
          <p
            className={`text-[13px] font-semibold mb-1 ${answer === q.correctIndex ? "text-[#059669]" : "text-[#DC2626]"}`}
          >
            {answer === q.correctIndex ? "Correto!" : "Incorreto"}
          </p>
          <p className="text-[13px] text-[#374151]">{q.explanation}</p>
          <p className="text-[12px] text-[#9CA3AF] mt-1 italic">
            {q.explanationEn}
          </p>
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
      <p className="text-[13px] text-[#9CA3AF] italic">{q.instructionEn}</p>
      <p className="text-[15px] font-semibold text-[#111827]">
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
              className={`flex items-center gap-4 border rounded-xl p-4 transition-all ${
                isCorrect
                  ? "border-[#059669] bg-[#F0FDF4]"
                  : isWrong
                    ? "border-[#DC2626] bg-[#FEF2F2]"
                    : "border-[#E5E7EB] bg-white"
              }`}
            >
              <p className="text-[14px] font-medium text-[#111827] flex-1 min-w-0">
                {pair.left}
              </p>
              <select
                value={selected}
                onChange={(e) => onAnswer(i, e.target.value)}
                disabled={submitted}
                className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-[13px] text-[#374151] bg-white min-w-[180px] focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-1 disabled:opacity-60"
              >
                <option value="">Selecione...</option>
                {rightOptions.map((opt, j) => (
                  <option key={j} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {submitted && isWrong && (
                <span className="text-[12px] text-[#059669] font-medium shrink-0">
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
          className="w-full py-2.5 bg-[#111827] text-white text-[13px] font-semibold rounded-lg hover:bg-[#374151] transition-colors cursor-pointer"
        >
          Verificar respostas
        </button>
      )}

      {submitted && (
        <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#F3F4F6]">
          <p className="text-[13px] font-semibold text-[#111827]">
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
      <p className="text-[13px] text-[#9CA3AF] italic">{task.instructionEn}</p>

      {/* Scenario card */}
      <div className="border border-[#E5E7EB] rounded-xl p-5 bg-[#FAFAFA]">
        <p className="text-[15px] font-semibold text-[#111827]">
          {task.scenario}
        </p>
        <p className="text-[13px] text-[#6B7280] mt-1">{task.scenarioEn}</p>
      </div>

      {/* Hints */}
      {task.hints && task.hints.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
            Indicações
          </p>
          <ul className="space-y-1">
            {task.hints.map((hint, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#D1D5DB] mt-0.5">·</span>
                <span className="text-[13px] text-[#6B7280]">
                  {hint}
                  {task.hintsEn?.[i] && (
                    <span className="text-[#9CA3AF]">
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
          className="w-full border border-[#E5E7EB] rounded-xl p-4 text-[14px] text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-1 resize-y disabled:opacity-60 disabled:bg-[#FAFAFA]"
          placeholder="Escreva a sua resposta aqui..."
        />
        <div className="flex items-center justify-between mt-1">
          <p
            className={`text-[12px] font-medium ${
              wc === 0
                ? "text-[#9CA3AF]"
                : meetsMin
                  ? "text-[#059669]"
                  : "text-[#DC2626]"
            }`}
          >
            {wc} {wc === 1 ? "palavra" : "palavras"}
          </p>
          <p className="text-[12px] text-[#9CA3AF]">
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
              ? "bg-[#111827] text-white hover:bg-[#374151]"
              : "bg-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed"
          }`}
        >
          Submeter resposta
        </button>
      )}

      {/* After submission: show sample response */}
      {submitted && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#F3F4F6]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-2">
              Resposta modelo
            </p>
            <p className="text-[13px] text-[#374151] leading-relaxed">
              {task.sampleResponse}
            </p>
            <p className="text-[12px] text-[#9CA3AF] mt-2 italic">
              {task.sampleResponseEn}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-[#F0FDF4] border border-[#D1FAE5]">
            <p className="text-[13px] text-[#059669] font-medium">
              {countKeyPhraseMatches(response, task.keyPhrases)} /{" "}
              {task.keyPhrases.length} key elements found ·{" "}
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
      <p className="text-[13px] text-[#9CA3AF] italic">{q.instructionEn}</p>

      {/* Audio player */}
      {!ttsUnavailable ? (
        <div className="border border-[#E5E7EB] rounded-xl p-5 bg-[#FAFAFA] flex items-center justify-between">
          <button
            onClick={handlePlay}
            disabled={!canPlay}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
              canPlay
                ? "bg-[#111827] text-white hover:bg-[#374151]"
                : "bg-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed"
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
          <span className="text-[12px] font-medium text-[#9CA3AF]">
            {playCount} / {q.playLimit} reproduções
          </span>
        </div>
      ) : (
        <div className="border border-[#FEE2E2] rounded-xl p-5 bg-[#FEF2F2]">
          <p className="text-[13px] font-medium text-[#DC2626] mb-2">
            Audio not available on this device. Transcript shown instead:
          </p>
          <p className="text-[14px] text-[#374151] italic leading-relaxed">
            &ldquo;{q.audioText}&rdquo;
          </p>
        </div>
      )}

      {/* Question + options (always visible after at least 1 play, or if TTS unavailable) */}
      {(playCount > 0 || ttsUnavailable) && (
        <>
          <p className="text-[15px] font-semibold text-[#111827]">
            {q.question}
          </p>
          {q.questionEn && (
            <p className="text-[13px] text-[#6B7280] -mt-2">{q.questionEn}</p>
          )}

          <div className="space-y-2">
            {q.options.map((opt, i) => {
              let optClass =
                "border border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:shadow-sm cursor-pointer";

              if (submitted) {
                if (i === q.correctIndex) {
                  optClass = "border-2 border-[#059669] bg-[#F0FDF4]";
                } else if (i === answer && i !== q.correctIndex) {
                  optClass = "border-2 border-[#DC2626] bg-[#FEF2F2]";
                } else {
                  optClass =
                    "border border-[#F3F4F6] bg-[#FAFAFA] opacity-50";
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => !submitted && onAnswer(i)}
                  disabled={submitted}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${optClass}`}
                >
                  <span
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-[12px] font-semibold ${
                      submitted && i === q.correctIndex
                        ? "border-[#059669] bg-[#059669] text-white"
                        : submitted && i === answer
                          ? "border-[#DC2626] bg-[#DC2626] text-white"
                          : "border-[#D1D5DB] text-[#9CA3AF]"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span
                    className={`text-[14px] ${submitted && i === q.correctIndex ? "font-semibold text-[#059669]" : submitted && i === answer ? "font-semibold text-[#DC2626]" : "text-[#374151]"}`}
                  >
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          {submitted && (
            <div
              className={`p-4 rounded-xl border ${answer === q.correctIndex ? "bg-[#F0FDF4] border-[#D1FAE5]" : "bg-[#FEF2F2] border-[#FEE2E2]"}`}
            >
              <p
                className={`text-[13px] font-semibold mb-1 ${answer === q.correctIndex ? "text-[#059669]" : "text-[#DC2626]"}`}
              >
                {answer === q.correctIndex ? "Correto!" : "Incorreto"}
              </p>
              <p className="text-[13px] text-[#374151]">{q.explanation}</p>
              <p className="text-[12px] text-[#9CA3AF] mt-1 italic">
                {q.explanationEn}
              </p>
              {/* Show transcript after answering */}
              <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-1">
                  Transcrição
                </p>
                <p className="text-[13px] text-[#374151] italic">
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
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
        {partLabels[sp.part] ?? `Parte ${sp.part}`}
      </p>

      {/* Instruction */}
      <p className="text-[13px] text-[#6B7280] italic">{sp.instructionEn}</p>

      {/* Examiner prompt — speech bubble */}
      <div className="relative border border-[#E5E7EB] rounded-xl p-5 bg-[#FAFAFA]">
        <div className="flex items-start gap-3">
          <PronunciationButton text={sp.prompt} size="sm" variant="muted" className="shrink-0 mt-0.5" />
          <div>
            <p className="text-[15px] font-semibold text-[#111827] leading-relaxed">
              &ldquo;{sp.prompt}&rdquo;
            </p>
            <p className="text-[13px] text-[#9CA3AF] mt-1 italic">
              {sp.promptEn}
            </p>
          </div>
        </div>
      </div>

      {/* Guidance checklist */}
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
          Orientação
        </p>
        <ul className="space-y-1">
          {sp.guidance.map((g, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[#D1D5DB] mt-0.5">·</span>
              <span className="text-[13px] text-[#9CA3AF]">
                {g}
                {sp.guidanceEn[i] && (
                  <span className="text-[#D1D5DB]">
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
          className="w-full border border-[#E5E7EB] rounded-xl p-4 text-[14px] text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#111827] focus:ring-offset-1 resize-y disabled:opacity-60 disabled:bg-[#FAFAFA]"
          placeholder="Escreva a sua resposta aqui..."
        />
        <div className="flex items-center justify-between mt-1">
          <p
            className={`text-[12px] font-medium ${
              wc === 0
                ? "text-[#9CA3AF]"
                : meetsMin
                  ? "text-[#059669]"
                  : "text-[#DC2626]"
            }`}
          >
            {wc} {wc === 1 ? "palavra" : "palavras"}
          </p>
          <p className="text-[12px] text-[#9CA3AF]">
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
              ? "bg-[#111827] text-white hover:bg-[#374151]"
              : "bg-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed"
          }`}
        >
          Submeter resposta
        </button>
      )}

      {/* After submission: show comparison */}
      {submitted && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-[#F9FAFB] border border-[#F3F4F6]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-2">
              Resposta modelo
            </p>
            <p className="text-[13px] text-[#374151] leading-relaxed">
              {sp.sampleResponse}
            </p>
            <p className="text-[12px] text-[#9CA3AF] mt-2 italic">
              {sp.sampleResponseEn}
            </p>
          </div>

          {/* Key elements check */}
          <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#F3F4F6]">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-2">
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
                        ? "bg-[#F0FDF4] text-[#059669] border border-[#D1FAE5]"
                        : "bg-[#F3F4F6] text-[#9CA3AF] border border-[#E5E7EB]"
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

          <div className="p-3 rounded-lg bg-[#F0FDF4] border border-[#D1FAE5]">
            <p className="text-[13px] text-[#059669] font-medium">
              {countKeyPhraseMatches(response, sp.keyElements)} /{" "}
              {sp.keyElements.length} key elements found ·{" "}
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

  const tierStyles: Record<string, string> = {
    "muito-bom": "from-amber-50 to-yellow-50 border-amber-200",
    bom: "from-blue-50 to-sky-50 border-blue-200",
    suficiente: "from-emerald-50 to-green-50 border-emerald-200",
    "not-yet": "from-gray-50 to-slate-50 border-gray-200",
  };

  const tierText: Record<string, string> = {
    "muito-bom": "text-amber-700",
    bom: "text-blue-700",
    suficiente: "text-emerald-700",
    "not-yet": "text-[#6B7280]",
  };

  return (
    <div className="py-8">
      {/* Main classification card */}
      <div
        className={`border-2 rounded-2xl p-8 bg-gradient-to-br text-center mb-8 ${tierStyles[classification.tier]}`}
      >
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3">
          Resultado Final
        </p>
        <p className="text-[48px] font-bold text-[#111827]">
          {Math.round(finalPct)}%
        </p>
        <p className={`text-[24px] font-bold mt-1 ${tierText[classification.tier]}`}>
          {classification.labelPt}
        </p>
        {classification.tier === "not-yet" && (
          <p className="text-[13px] text-[#6B7280] mt-3 max-w-md mx-auto">
            Keep practising — you&apos;re building a strong foundation. Review the areas below and try again when you&apos;re ready.
          </p>
        )}
      </div>

      {/* Per-section breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border border-[#E5E7EB] rounded-xl p-5 bg-white">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-2">
            Leitura e Escrita
          </p>
          <p className="text-[18px] font-semibold text-[#111827]">
            {Math.round(rwPoints)} / {rwTotal} pts
          </p>
          <p className="text-[13px] text-[#6B7280] mt-1">
            {Math.round(rwPct)}% · peso {Math.round(rwSection.weight * 100)}%
          </p>
        </div>
        <div className="border border-[#E5E7EB] rounded-xl p-5 bg-white">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-2">
            Compreensão Oral
          </p>
          <p className="text-[18px] font-semibold text-[#111827]">
            {Math.round(liPoints)} / {liTotal} pts
          </p>
          <p className="text-[13px] text-[#6B7280] mt-1">
            {Math.round(liPct)}% · peso {Math.round(liSection.weight * 100)}%
          </p>
        </div>
        <div className="border border-[#E5E7EB] rounded-xl p-5 bg-white">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-2">
            Produção Oral
          </p>
          <p className="text-[18px] font-semibold text-[#111827]">
            {Math.round(spPoints)} / {spTotal} pts
          </p>
          <p className="text-[13px] text-[#6B7280] mt-1">
            {Math.round(spPct)}% · peso {Math.round(spSection.weight * 100)}%
          </p>
        </div>
      </div>

      {/* Scoring formula */}
      <div className="border border-[#E5E7EB] rounded-xl p-4 bg-[#FAFAFA] mb-8">
        <p className="text-[12px] text-[#9CA3AF] text-center font-mono">
          ({Math.round(rwPct)}% x 0.45) + ({Math.round(liPct)}% x 0.30) + (
          {Math.round(spPct)}% x 0.25) = {Math.round(finalPct)}%
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3">
        {!saved ? (
          <button
            onClick={onSave}
            disabled={saving}
            className="px-8 py-3 bg-[#111827] text-white text-[15px] font-semibold rounded-xl hover:bg-[#374151] transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? "A guardar..." : "Concluir Exame"}
          </button>
        ) : (
          <p className="text-[15px] font-semibold text-[#059669]">
            Resultado guardado!
          </p>
        )}
        <Link
          href="/exams"
          className="text-[13px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
        >
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
      <>
        <Topbar />
        <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-16">
          <p className="text-[13px] text-[#9CA3AF]">Exam not found.</p>
          <Link
            href="/exams"
            className="text-[13px] font-medium text-[#3C5E95] hover:underline mt-2 inline-block"
          >
            Back to Exams
          </Link>
        </main>
      </>
    );
  }

  if (!exam.available) {
    return (
      <>
        <Topbar />
        <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-16 text-center">
          <p className="text-[18px] font-semibold text-[#111827]">
            Em breve
          </p>
          <p className="text-[13px] text-[#9CA3AF] mt-1">
            This exam is not available yet.
          </p>
          <Link
            href="/exams"
            className="text-[13px] font-medium text-[#3C5E95] hover:underline mt-4 inline-block"
          >
            Back to Exams
          </Link>
        </main>
      </>
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
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setShowSummary(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
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

    setSaving(false);
    setSaved(true);
  };

  // ─── Exam Start Screen ───
  if (!started) {
    return (
      <>
        <Topbar />
        <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="py-5">
            <Link
              href="/exams"
              className="inline-flex items-center gap-1 text-[13px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors mb-3"
            >
              <span>←</span> Exames
            </Link>
            <h1 className="text-2xl font-bold text-[#111827]">
              {exam.titlePt}
            </h1>
            <p className="text-[13px] font-medium text-[#6B7280] italic">
              {exam.title}
            </p>
            <p className="text-[12px] text-[#9CA3AF] mt-1">{exam.monthPt}</p>
          </div>

          <div className="border-t border-[#F3F4F6] mb-6" />

          <p className="text-[13px] text-[#6B7280] mb-6 leading-relaxed">
            {exam.descriptionPt}
          </p>

          {/* Section overview */}
          <div className="space-y-3 mb-8">
            {exam.sections.map((sec, i) => (
              <div
                key={sec.id}
                className="border border-[#E5E7EB] rounded-xl p-4 bg-white flex items-center justify-between"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
                    Secção {i + 1}
                  </p>
                  <p className="text-[15px] font-semibold text-[#111827] mt-1">
                    {sec.title}
                  </p>
                  <p className="text-[13px] text-[#6B7280] italic">
                    {sec.titleEn}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-semibold text-[#111827]">
                    {Math.round(sec.weight * 100)}%
                  </p>
                  <p className="text-[12px] text-[#9CA3AF]">
                    {sec.timeMinutes} min
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[12px] text-[#9CA3AF] mb-6">
            You can pause and return to this exam at any time. Your progress
            will be saved when you complete the exam.
          </p>

          <button
            onClick={() => setStarted(true)}
            className="px-8 py-3 bg-[#111827] text-white text-[15px] font-semibold rounded-xl hover:bg-[#374151] transition-colors cursor-pointer"
          >
            Iniciar Exame
          </button>

          <div className="mb-16" />
        </main>
      </>
    );
  }

  // ─── Summary Screen ───
  if (showSummary) {
    return (
      <>
        <Topbar />
        <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
          <div className="py-5">
            <h1 className="text-2xl font-bold text-[#111827]">
              {exam.titlePt}
            </h1>
            <p className="text-[13px] font-medium text-[#6B7280] italic">
              Resultado
            </p>
          </div>
          <div className="border-t border-[#F3F4F6] mb-6" />
          <SummaryScreen
            exam={exam}
            sectionStates={sectionStates}
            onSave={handleSave}
            saving={saving}
            saved={saved}
          />
          <div className="mb-16" />
        </main>
      </>
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
    <>
      <Topbar />
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
        {/* Header */}
        <div className="py-5">
          <Link
            href="/exams"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors mb-3"
          >
            <span>←</span> Exames
          </Link>

          <h1 className="text-2xl font-bold text-[#111827]">
            {exam.titlePt}
          </h1>

          {/* Section tabs */}
          <div className="flex items-center gap-1 mt-4">
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
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all ${
                    isActive
                      ? "bg-[#111827] text-white"
                      : isCompleted
                        ? "bg-[#F0FDF4] text-[#059669] border border-[#D1FAE5]"
                        : isLocked
                          ? "bg-[#F9FAFB] text-[#D1D5DB] cursor-not-allowed"
                          : "bg-[#F9FAFB] text-[#6B7280] hover:bg-[#F3F4F6] cursor-pointer"
                  }`}
                >
                  {isCompleted && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {isLocked && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">{sec.titleEn}</span>
                  <span className="sm:hidden">S{i + 1}</span>
                </button>
              );
            })}
          </div>

          {/* Progress within section */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 h-1 bg-[#F3F4F6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#111827] rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[12px] font-medium text-[#9CA3AF] shrink-0">
              {currentQuestion + 1} / {itemCount}
            </span>
          </div>
        </div>

        <div className="border-t border-[#F3F4F6] mb-6" />

        {/* Current item */}
        <div className="pb-8">
          {renderCurrentItem()}
        </div>

        {/* Navigation footer */}
        <div className="flex items-center justify-between py-6 border-t border-[#F3F4F6] mb-8">
          <button
            onClick={() => {
              if (currentQuestion > 0) {
                setCurrentQuestion((prev) => prev - 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            disabled={currentQuestion === 0}
            className={`text-[13px] font-medium transition-colors cursor-pointer ${
              currentQuestion === 0
                ? "text-[#D1D5DB] cursor-not-allowed"
                : "text-[#6B7280] hover:text-[#111827]"
            }`}
          >
            ← Anterior
          </button>

          {currentQuestion < itemCount - 1 ? (
            <button
              onClick={() => {
                setCurrentQuestion((prev) => prev + 1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-5 py-2 bg-[#111827] text-white text-[13px] font-semibold rounded-lg hover:bg-[#374151] transition-colors cursor-pointer"
            >
              Seguinte →
            </button>
          ) : (
            <button
              onClick={completeSection}
              className="px-5 py-2 bg-[#111827] text-white text-[13px] font-semibold rounded-lg hover:bg-[#374151] transition-colors cursor-pointer"
            >
              {currentSection < 2
                ? "Secção seguinte →"
                : "Ver resultado →"}
            </button>
          )}
        </div>
      </main>
    </>
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
