"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { ProtectedRoute } from "@/components/protected-route";
import { PronunciationButton } from "@/components/pronunciation-button";
import { cefrPillClass } from "@/lib/cefr";
import { lessons } from "@/data/lessons";
import type {
  LessonStage,
  VocabItem,
  PracticeItem,
} from "@/data/lessons";
import { completeLessonFull } from "@/lib/lesson-progress";

/* ─── Shared types ─── */

type StageProgressMap = Record<string, Record<string, unknown>>;

/* ─── Helper: render sentence with inline input ─── */

function SentenceWithInput({
  sentence,
  value,
  onChange,
  onSubmit,
}: {
  sentence: string;
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
}) {
  const blankMatch = sentence.match(/_+/);
  if (!blankMatch) return <span>{sentence}</span>;
  const idx = sentence.indexOf(blankMatch[0]);
  const before = sentence.substring(0, idx);
  const after = sentence.substring(idx + blankMatch[0].length);
  return (
    <>
      <span>{before}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) onSubmit();
        }}
        className="inline-block w-28 border-b-2 border-[#111827] text-center text-[18px] font-semibold text-[#111827] bg-transparent outline-none mx-1"
        autoFocus
        autoComplete="off"
        spellCheck={false}
      />
      <span>{after}</span>
    </>
  );
}

/* ─── STAGE: Vocabulary (flip cards) ─── */

function VocabStage({
  stage,
  onProgress,
}: {
  stage: LessonStage;
  onProgress: (itemId: string, data: unknown) => void;
}) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [known, setKnown] = useState<Record<string, boolean | null>>({});

  const items = stage.items ?? [];
  const allAssessed = items.every(
    (item) => known[item.id] !== undefined && known[item.id] !== null
  );

  return (
    <div>
      <StageHeader stage={stage} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <VocabCard
            key={item.id}
            item={item}
            isFlipped={!!flipped[item.id]}
            assessment={known[item.id] ?? null}
            onFlip={() =>
              setFlipped((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
            }
            onAssess={(val) => {
              setKnown((prev) => ({ ...prev, [item.id]: val }));
              onProgress(item.id, { known: val });
            }}
          />
        ))}
      </div>
      {allAssessed && (
        <div className="mt-6 p-4 bg-[#F9FAFB] rounded-xl border border-[#F3F4F6] text-center">
          <p className="text-[15px] font-semibold text-[#111827]">
            {Object.values(known).filter((v) => v === true).length} /{" "}
            {items.length} known
          </p>
          <p className="text-[13px] text-[#6B7280] mt-1">
            {Object.values(known).filter((v) => v === false).length > 0
              ? `${Object.values(known).filter((v) => v === false).length} marked for review`
              : "Everything looks solid!"}
          </p>
        </div>
      )}
    </div>
  );
}

function VocabCard({
  item,
  isFlipped,
  assessment,
  onFlip,
  onAssess,
}: {
  item: VocabItem;
  isFlipped: boolean;
  assessment: boolean | null;
  onFlip: () => void;
  onAssess: (known: boolean) => void;
}) {
  return (
    <div
      onClick={onFlip}
      className={`border rounded-xl p-5 cursor-pointer transition-all duration-300 min-h-[160px] flex flex-col justify-between ${
        assessment === true
          ? "border-[#D1FAE5] bg-[#F0FDF4]"
          : assessment === false
            ? "border-[#FEE2E2] bg-[#FEF2F2]"
            : isFlipped
              ? "border-[#E5E7EB] bg-white"
              : "border-[#E5E7EB] bg-[#FAFAFA] hover:border-[#D1D5DB] hover:shadow-sm"
      }`}
    >
      {!isFlipped ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <p className="text-[18px] font-semibold text-[#111827]">
            {item.word}
          </p>
          <p className="text-[13px] text-[#9CA3AF] mt-1">
            {item.pronunciation}
          </p>
          <p className="text-[12px] text-[#D1D5DB] mt-4">Tap to reveal</p>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between mb-2">
            <p className="text-[18px] font-semibold text-[#111827]">
              {item.word}
            </p>
            <PronunciationButton text={item.word} size="sm" />
          </div>
          <p className="text-[15px] text-[#6B7280]">{item.translation}</p>
          <p className="text-[13px] text-[#9CA3AF] mt-1">
            {item.pronunciation}
          </p>
          <div className="mt-3 px-3 py-2 bg-[#F9FAFB] rounded-lg">
            <p className="text-[13px] font-medium text-[#111827] italic">
              &ldquo;{item.example.pt}&rdquo;
            </p>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5">
              {item.example.en}
            </p>
          </div>
          {assessment === null ? (
            <div
              className="flex gap-2 mt-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onAssess(true)}
                className="flex-1 py-2 text-[13px] font-semibold text-[#059669] border border-[#D1FAE5] rounded-lg hover:bg-[#F0FDF4] transition-colors cursor-pointer"
              >
                I knew this
              </button>
              <button
                onClick={() => onAssess(false)}
                className="flex-1 py-2 text-[13px] font-semibold text-[#DC2626] border border-[#FEE2E2] rounded-lg hover:bg-[#FEF2F2] transition-colors cursor-pointer"
              >
                Review again
              </button>
            </div>
          ) : (
            <div className="mt-4 text-center">
              <p className="text-[12px] font-medium text-[#9CA3AF]">
                {assessment
                  ? "Known"
                  : "Marked for review"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── STAGE: Verb drill (type-to-answer) ─── */

function VerbStage({
  stage,
  onProgress,
}: {
  stage: LessonStage;
  onProgress: (itemId: string, data: unknown) => void;
}) {
  const verb = stage.verbs?.[0];
  if (!verb) return null;

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [correct, setCorrect] = useState<Record<string, boolean>>({});

  const handleSubmit = (pronoun: string, correctForm: string) => {
    const userAnswer = (answers[pronoun] || "").trim().toLowerCase();
    const isCorrect = userAnswer === correctForm.toLowerCase();
    setSubmitted((prev) => ({ ...prev, [pronoun]: true }));
    setCorrect((prev) => ({ ...prev, [pronoun]: isCorrect }));
    onProgress(`${verb.id}-${pronoun}`, {
      correct: isCorrect,
      answer: userAnswer,
    });
  };

  const allSubmitted = verb.conjugations.every((c) => submitted[c.pronoun]);
  const correctCount = Object.values(correct).filter(Boolean).length;
  const hasAnswers = Object.keys(answers).some((k) => answers[k]?.trim());

  return (
    <div>
      <StageHeader stage={stage} />
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <PronunciationButton text={verb.verb} size="sm" />
          <h3 className="text-[18px] font-semibold text-[#111827]">
            {verb.verb}
          </h3>
          <span className="text-[13px] text-[#6B7280]">
            — {verb.verbTranslation}
          </span>
        </div>
        <p className="text-[13px] text-[#9CA3AF] mt-1">
          Tense: {verb.tense}
        </p>
      </div>

      <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white">
        {verb.conjugations.map((conj, i) => (
          <div
            key={conj.pronoun}
            className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? "border-t border-[#F3F4F6]" : ""} ${
              submitted[conj.pronoun]
                ? correct[conj.pronoun]
                  ? "bg-[#F0FDF4]"
                  : "bg-[#FEF2F2]"
                : ""
            }`}
          >
            <span className="text-[15px] font-medium text-[#9CA3AF] w-20 shrink-0">
              {conj.pronoun}
            </span>
            {!submitted[conj.pronoun] ? (
              <input
                type="text"
                value={answers[conj.pronoun] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [conj.pronoun]: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    handleSubmit(conj.pronoun, conj.form);
                }}
                onBlur={() => {
                  if (answers[conj.pronoun]?.trim())
                    handleSubmit(conj.pronoun, conj.form);
                }}
                placeholder="Type conjugation..."
                className="flex-1 text-[15px] font-semibold text-[#111827] bg-transparent border-b border-[#E5E7EB] focus:border-[#111827] outline-none py-1 placeholder:text-[#D1D5DB] placeholder:font-normal transition-colors"
                autoComplete="off"
                spellCheck={false}
              />
            ) : (
              <div className="flex-1 flex items-center justify-between">
                <div>
                  {correct[conj.pronoun] ? (
                    <span className="text-[15px] font-semibold text-[#059669]">
                      {conj.form}
                    </span>
                  ) : (
                    <div>
                      <span className="text-[15px] font-semibold text-[#DC2626] line-through mr-2">
                        {answers[conj.pronoun]}
                      </span>
                      <span className="text-[15px] font-semibold text-[#059669]">
                        {conj.form}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-[13px] font-medium">
                  {correct[conj.pronoun] ? (
                    <svg className="w-4 h-4 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-4 h-4 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  )}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {!allSubmitted && hasAnswers && (
        <button
          onClick={() => {
            verb.conjugations.forEach((conj) => {
              if (!submitted[conj.pronoun] && answers[conj.pronoun]?.trim()) {
                handleSubmit(conj.pronoun, conj.form);
              }
            });
          }}
          className="mt-4 w-full py-2.5 bg-[#111827] text-white text-[13px] font-semibold rounded-lg hover:bg-[#374151] transition-colors cursor-pointer"
        >
          Check answers
        </button>
      )}

      {allSubmitted && (
        <div className="mt-6 p-4 bg-[#F9FAFB] rounded-xl border border-[#F3F4F6] flex items-center justify-between">
          <div>
            <p className="text-[15px] font-semibold text-[#111827]">
              {correctCount} / {verb.conjugations.length} correct
            </p>
            <p className="text-[13px] text-[#6B7280] mt-0.5">
              {correctCount === verb.conjugations.length
                ? "Perfect!"
                : "Keep practising — you'll get there."}
            </p>
          </div>
          <Link
            href={`/conjugations/${verb.verbSlug}`}
            className="text-[13px] font-medium text-[#3C5E95] hover:underline"
          >
            View all tenses →
          </Link>
        </div>
      )}
    </div>
  );
}

/* ─── STAGE: Grammar (progressive reveal) ─── */

function GrammarStage({
  stage,
  onProgress,
}: {
  stage: LessonStage;
  onProgress: (itemId: string, data: unknown) => void;
}) {
  const grammar = stage.grammarItems?.[0];
  if (!grammar) return null;

  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const allRevealed = grammar.examples.every((_, i) => revealed[i]);

  return (
    <div>
      <StageHeader stage={stage} />

      <div className="border border-[#E5E7EB] rounded-xl p-5 bg-white mb-6">
        <p className="text-[15px] font-semibold text-[#111827]">
          {grammar.rule}
        </p>
        <p className="text-[13px] font-medium text-[#6B7280] italic mt-1">
          {grammar.rulePt}
        </p>
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3">
        Translate these
      </p>
      <div className="space-y-3">
        {grammar.examples.map((ex, i) => (
          <div
            key={i}
            onClick={() => {
              if (!revealed[i]) {
                setRevealed((prev) => ({ ...prev, [i]: true }));
                onProgress(`grammar-example-${i}`, { revealed: true });
              }
            }}
            className={`border rounded-xl p-4 transition-all duration-200 ${
              revealed[i]
                ? "border-[#E5E7EB] bg-white"
                : "border-[#E5E7EB] bg-[#FAFAFA] cursor-pointer hover:border-[#D1D5DB] hover:shadow-sm"
            }`}
          >
            <div className="flex items-center gap-3">
              <PronunciationButton text={ex.pt} size="sm" />
              <p className="text-[15px] font-semibold text-[#111827]">
                {ex.pt}
              </p>
            </div>
            {revealed[i] ? (
              <p className="text-[13px] font-medium text-[#6B7280] mt-2 ml-10">
                {ex.en}
              </p>
            ) : (
              <p className="text-[12px] text-[#D1D5DB] mt-2 ml-10">
                Tap to reveal translation
              </p>
            )}
          </div>
        ))}
      </div>

      {allRevealed && (
        <div className="mt-6 text-center">
          <Link
            href={`/grammar/${grammar.topicSlug}`}
            className="text-[13px] font-medium text-[#3C5E95] hover:underline"
          >
            Deep dive: {grammar.topicTitle} →
          </Link>
        </div>
      )}
    </div>
  );
}

/* ─── STAGE: Culture (guess before reveal) ─── */

function CultureStage({
  stage,
  onProgress,
}: {
  stage: LessonStage;
  onProgress: (itemId: string, data: unknown) => void;
}) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  return (
    <div>
      <StageHeader stage={stage} />
      <div className="space-y-6">
        {stage.cultureItems?.map((item) => (
          <div
            key={item.id}
            className="border border-[#E5E7EB] rounded-xl p-6 bg-white"
          >
            <div className="flex items-start gap-3 mb-4">
              <PronunciationButton
                text={item.expression}
                size="sm"
                className="shrink-0 mt-0.5"
              />
              <p className="text-[18px] font-semibold text-[#111827] italic leading-relaxed">
                &ldquo;{item.expression}&rdquo;
              </p>
            </div>

            {!revealed[item.id] ? (
              <div className="text-center py-4">
                <p className="text-[13px] text-[#9CA3AF] mb-4">
                  Can you guess the meaning?
                </p>
                <button
                  onClick={() => {
                    setRevealed((prev) => ({
                      ...prev,
                      [item.id]: true,
                    }));
                    onProgress(item.id, { revealed: true });
                  }}
                  className="px-5 py-2 border border-[#E5E7EB] rounded-lg text-[13px] font-semibold text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#111827] transition-colors cursor-pointer"
                >
                  Reveal meaning
                </button>
              </div>
            ) : (
              <div className="space-y-3 mt-2">
                <p className="text-[15px] font-semibold text-[#111827]">
                  {item.meaning}
                </p>
                <div className="px-4 py-3 bg-[#F9FAFB] rounded-lg">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-1">
                    Literal
                  </p>
                  <p className="text-[13px] text-[#6B7280]">{item.literal}</p>
                </div>
                <div className="px-4 py-3 bg-[#F9FAFB] rounded-lg">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-1">
                    When to use
                  </p>
                  <p className="text-[13px] text-[#6B7280]">{item.tip}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── STAGE: Practice (fill-in-the-blank) ─── */

function PracticeStage({
  stage,
  onProgress,
}: {
  stage: LessonStage;
  onProgress: (itemId: string, data: unknown) => void;
}) {
  const items = stage.practiceItems ?? [];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [correct, setCorrect] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentItem = items[currentIndex];
  const allDone = items.every((item) => submitted[item.id]);
  const correctCount = Object.values(correct).filter(Boolean).length;

  const handleCheck = (item: PracticeItem) => {
    const userAnswer = (answers[item.id] || "").trim();
    const isCorrect = item.acceptedAnswers.some(
      (accepted) => accepted.toLowerCase() === userAnswer.toLowerCase()
    );
    setSubmitted((prev) => ({ ...prev, [item.id]: true }));
    setCorrect((prev) => ({ ...prev, [item.id]: isCorrect }));
    onProgress(item.id, { correct: isCorrect, answer: userAnswer });
  };

  return (
    <div>
      <StageHeader stage={stage} />
      <p className="text-[13px] text-[#9CA3AF] mb-4">
        {currentIndex + 1} / {items.length}
      </p>

      {currentItem && (
        <div className="border border-[#E5E7EB] rounded-xl p-6 bg-white">
          {!submitted[currentItem.id] ? (
            <div>
              <div className="text-center mb-6">
                <p className="text-[18px] font-semibold text-[#111827] leading-relaxed">
                  <SentenceWithInput
                    sentence={currentItem.sentence}
                    value={answers[currentItem.id] || ""}
                    onChange={(val) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [currentItem.id]: val,
                      }))
                    }
                    onSubmit={() => handleCheck(currentItem)}
                  />
                </p>
              </div>
              <p className="text-[13px] text-[#9CA3AF] text-center mb-6">
                {currentItem.translation}
              </p>
              <button
                onClick={() => handleCheck(currentItem)}
                disabled={!(answers[currentItem.id] || "").trim()}
                className={`w-full py-2.5 text-[13px] font-semibold rounded-lg transition-colors cursor-pointer ${
                  (answers[currentItem.id] || "").trim()
                    ? "bg-[#111827] text-white hover:bg-[#374151]"
                    : "bg-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed"
                }`}
              >
                Check
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p
                className={`text-[18px] font-semibold mb-2 ${correct[currentItem.id] ? "text-[#059669]" : "text-[#DC2626]"}`}
              >
                {correct[currentItem.id] ? "Correct!" : "Not quite"}
              </p>
              <p className="text-[15px] font-semibold text-[#111827] mb-1">
                {currentItem.fullSentence}
              </p>
              <p className="text-[13px] text-[#6B7280]">
                {currentItem.translation}
              </p>
              {!correct[currentItem.id] && (
                <p className="text-[13px] text-[#9CA3AF] mt-2">
                  The answer was:{" "}
                  <span className="font-semibold text-[#111827]">
                    {currentItem.answer}
                  </span>
                </p>
              )}
              {currentIndex < items.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((prev) => prev + 1)}
                  className="mt-4 px-5 py-2 bg-[#111827] text-white text-[13px] font-semibold rounded-lg hover:bg-[#374151] transition-colors cursor-pointer"
                >
                  Next →
                </button>
              ) : (
                <div className="mt-4 p-4 bg-[#F9FAFB] rounded-xl">
                  <p className="text-[15px] font-semibold text-[#111827]">
                    {correctCount} / {items.length} correct
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`h-2 rounded-full transition-all ${
              i === currentIndex
                ? "bg-[#111827] w-4"
                : submitted[item.id]
                  ? correct[item.id]
                    ? "bg-[#059669] w-2"
                    : "bg-[#DC2626] w-2"
                  : "bg-[#E5E7EB] w-2"
            }`}
          />
        ))}
      </div>

      {allDone && (
        <div className="mt-6 p-4 bg-[#F9FAFB] rounded-xl border border-[#F3F4F6] text-center">
          <p className="text-[15px] font-semibold text-[#111827]">
            Practice complete — {correctCount} / {items.length} correct
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── STAGE: Summary / Completion ─── */

function SummaryStage({
  lesson,
  stageProgress,
  onComplete,
  completing,
}: {
  lesson: (typeof lessons)[0];
  stageProgress: StageProgressMap;
  onComplete: () => void;
  completing: boolean;
}) {
  // Vocab stats
  const vocabStage = lesson.stages.find((s) => s.type === "vocabulary");
  const totalVocab = vocabStage?.items?.length ?? 0;
  const vocabProgress = stageProgress[vocabStage?.id ?? ""] ?? {};
  const vocabKnown = Object.values(vocabProgress).filter(
    (v) => (v as { known?: boolean })?.known === true
  ).length;
  const vocabToReview = totalVocab - vocabKnown;

  // Verb stats
  const verbStage = lesson.stages.find((s) => s.type === "verb");
  const totalVerb = verbStage?.verbs?.[0]?.conjugations.length ?? 0;
  const verbProgress = stageProgress[verbStage?.id ?? ""] ?? {};
  const verbCorrect = Object.values(verbProgress).filter(
    (v) => (v as { correct?: boolean })?.correct === true
  ).length;

  // Practice stats
  const practiceStage = lesson.stages.find((s) => s.type === "practice");
  const totalPractice = practiceStage?.practiceItems?.length ?? 0;
  const practiceProgress = stageProgress[practiceStage?.id ?? ""] ?? {};
  const practiceCorrect = Object.values(practiceProgress).filter(
    (v) => (v as { correct?: boolean })?.correct === true
  ).length;

  // Items to review
  const reviewItems: string[] = [];
  if (vocabStage?.items) {
    vocabStage.items.forEach((item) => {
      const p = vocabProgress[item.id] as { known?: boolean } | undefined;
      if (p?.known === false) reviewItems.push(item.word);
    });
  }

  return (
    <div className="text-center py-8">
      <div className="mb-8">
        <div className="w-16 h-16 rounded-full bg-[#F0FDF4] border-2 border-[#D1FAE5] flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-[#059669]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#111827]">Lesson Complete</h2>
        <p className="text-[13px] font-medium text-[#6B7280] italic mt-1">
          Lição Completa
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
        <div className="border border-[#E5E7EB] rounded-xl p-4 bg-white">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-2">
            Vocabulary
          </p>
          <p className="text-[18px] font-semibold text-[#111827]">
            {vocabKnown} / {totalVocab} known
          </p>
          <p className="text-[13px] text-[#6B7280] mt-1">
            {vocabToReview > 0 ? `${vocabToReview} to review` : "All known!"}
          </p>
        </div>
        <div className="border border-[#E5E7EB] rounded-xl p-4 bg-white">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-2">
            Verb Drill
          </p>
          <p className="text-[18px] font-semibold text-[#111827]">
            {verbCorrect} / {totalVerb} correct
          </p>
        </div>
        <div className="border border-[#E5E7EB] rounded-xl p-4 bg-white">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-2">
            Practice
          </p>
          <p className="text-[18px] font-semibold text-[#111827]">
            {practiceCorrect} / {totalPractice} correct
          </p>
        </div>
      </div>

      {reviewItems.length > 0 && (
        <div className="mb-8 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-3">
            Review These
          </p>
          <div className="flex flex-wrap gap-2">
            {reviewItems.map((item) => (
              <span
                key={item}
                className="px-3 py-1.5 bg-[#FEF2F2] border border-[#FEE2E2] rounded-lg text-[13px] font-medium text-[#DC2626]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onComplete}
          disabled={completing}
          className="px-8 py-3 bg-[#111827] text-white text-[15px] font-semibold rounded-xl hover:bg-[#374151] transition-colors cursor-pointer disabled:opacity-50"
        >
          {completing ? "Saving..." : "Complete Lesson"}
        </button>
        <Link
          href="/lessons"
          className="text-[13px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          Back to all lessons
        </Link>
      </div>
    </div>
  );
}

/* ─── Shared: Stage header ─── */

function StageHeader({ stage }: { stage: LessonStage }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-2">
        {stage.title}
      </p>
      <h2 className="text-[18px] font-semibold text-[#111827]">
        {stage.ptTitle}
      </h2>
      <p className="text-[13px] font-medium text-[#6B7280] mt-1">
        {stage.description}
      </p>
    </div>
  );
}

/* ─── Main lesson content ─── */

function LessonContent({ id }: { id: string }) {
  const lesson = lessons.find((l) => l.id === id);
  const [currentStage, setCurrentStage] = useState(0);
  const [stageProgress, setStageProgress] = useState<StageProgressMap>({});
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!lesson) {
    return (
      <>
        <Topbar />
        <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-16">
          <p className="text-[13px] text-[#9CA3AF]">Lesson not found.</p>
          <Link
            href="/lessons"
            className="text-[13px] font-medium text-[#3C5E95] hover:underline mt-2 inline-block"
          >
            Back to Lessons
          </Link>
        </main>
      </>
    );
  }

  const totalStages = lesson.stages.length; // +1 for summary is handled by index
  const isSummary = currentStage >= totalStages;
  const currentStageData = isSummary ? null : lesson.stages[currentStage];

  const handleProgress = (stageId: string, itemId: string, data: unknown) => {
    setStageProgress((prev) => ({
      ...prev,
      [stageId]: {
        ...(prev[stageId] ?? {}),
        [itemId]: data,
      },
    }));
  };

  const goNext = () => {
    if (currentStage <= totalStages) {
      setCurrentStage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goPrev = () => {
    if (currentStage > 0) {
      setCurrentStage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    // Collect all item IDs across stages
    const itemIds: string[] = [];
    lesson.stages.forEach((stage) => {
      stage.items?.forEach((item) => itemIds.push(`${stage.id}:${item.id}`));
      stage.verbs?.forEach((v) =>
        v.conjugations.forEach((c) =>
          itemIds.push(`${stage.id}:${v.id}-${c.pronoun}`)
        )
      );
      stage.grammarItems?.forEach((g) =>
        g.examples.forEach((_, i) =>
          itemIds.push(`${stage.id}:grammar-example-${i}`)
        )
      );
      stage.cultureItems?.forEach((c) =>
        itemIds.push(`${stage.id}:${c.id}`)
      );
      stage.practiceItems?.forEach((p) =>
        itemIds.push(`${stage.id}:${p.id}`)
      );
    });
    await completeLessonFull(lesson.id, itemIds);
    setCompleting(false);
    setCompleted(true);
  };

  const progressPct = isSummary
    ? 100
    : (currentStage / totalStages) * 100;

  return (
    <>
      <Topbar />
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
        {/* Header */}
        <div className="py-5">
          <Link
            href="/lessons"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors mb-3"
          >
            <span>←</span> Lessons
          </Link>

          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#111827]">
                {lesson.title}
              </h1>
              <p className="text-[13px] font-medium text-[#6B7280] italic">
                {lesson.ptTitle}
              </p>
            </div>
            <span
              className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full shrink-0 ${cefrPillClass(lesson.cefr)}`}
            >
              {lesson.cefr}
            </span>
          </div>

          {/* Stage dots */}
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              {lesson.stages.map((stage, i) => (
                <button
                  key={stage.id}
                  onClick={() => setCurrentStage(i)}
                  className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                    i === currentStage
                      ? "bg-[#111827] w-6"
                      : i < currentStage
                        ? "bg-[#111827] w-2"
                        : "bg-[#E5E7EB] w-2"
                  }`}
                  aria-label={`Go to stage ${i + 1}: ${stage.title}`}
                />
              ))}
              {/* Summary dot */}
              <button
                onClick={() => setCurrentStage(totalStages)}
                className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                  isSummary
                    ? "bg-[#111827] w-6"
                    : "bg-[#E5E7EB] w-2"
                }`}
                aria-label="Go to summary"
              />
            </div>
            <span className="text-[13px] font-medium text-[#9CA3AF]">
              {isSummary
                ? "Summary"
                : `Stage ${currentStage + 1} of ${totalStages + 1}`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#111827] rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="border-t border-[#F3F4F6] mb-6" />

        {/* Stage content */}
        <div className="pb-16">
          {isSummary ? (
            <SummaryStage
              lesson={lesson}
              stageProgress={stageProgress}
              onComplete={handleComplete}
              completing={completing}
            />
          ) : currentStageData?.type === "vocabulary" ? (
            <VocabStage
              stage={currentStageData}
              onProgress={(itemId, data) =>
                handleProgress(currentStageData.id, itemId, data)
              }
            />
          ) : currentStageData?.type === "verb" ? (
            <VerbStage
              stage={currentStageData}
              onProgress={(itemId, data) =>
                handleProgress(currentStageData.id, itemId, data)
              }
            />
          ) : currentStageData?.type === "grammar" ? (
            <GrammarStage
              stage={currentStageData}
              onProgress={(itemId, data) =>
                handleProgress(currentStageData.id, itemId, data)
              }
            />
          ) : currentStageData?.type === "culture" ? (
            <CultureStage
              stage={currentStageData}
              onProgress={(itemId, data) =>
                handleProgress(currentStageData.id, itemId, data)
              }
            />
          ) : currentStageData?.type === "practice" ? (
            <PracticeStage
              stage={currentStageData}
              onProgress={(itemId, data) =>
                handleProgress(currentStageData.id, itemId, data)
              }
            />
          ) : null}

          {/* Navigation footer */}
          {!completed && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#F3F4F6]">
              <button
                onClick={goPrev}
                disabled={currentStage === 0}
                className={`text-[13px] font-medium transition-colors cursor-pointer ${
                  currentStage === 0
                    ? "text-[#D1D5DB] cursor-not-allowed"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                ← Previous
              </button>

              {!isSummary && (
                <button
                  onClick={goNext}
                  className="px-5 py-2 bg-[#111827] text-white text-[13px] font-semibold rounded-lg hover:bg-[#374151] transition-colors cursor-pointer"
                >
                  Continue →
                </button>
              )}
            </div>
          )}

          {completed && (
            <div className="mt-8 pt-6 border-t border-[#F3F4F6] text-center">
              <p className="text-[15px] font-semibold text-[#059669] mb-2">
                Progress saved!
              </p>
              <Link
                href="/lessons"
                className="text-[13px] font-medium text-[#3C5E95] hover:underline"
              >
                Back to all lessons →
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

/* ─── Page wrapper ─── */

export default function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <ProtectedRoute>
      <LessonContent id={id} />
    </ProtectedRoute>
  );
}
