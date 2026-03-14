/*
 * LESSON SAVE FLOW TRACE
 * ──────────────────────
 * 1. User finishes last practice question → clicks "Continue →" → goNext() increments currentStage past totalStages → isSummary = true
 * 2. ResultsStage renders. Accuracy & passed are computed from stageProgress (verb + practice scores).
 * 3. useEffect on mount → doSave() → calls saveLessonAttempt(lesson.id, accuracy, passed, wrongItems)
 * 4. saveLessonAttempt():
 *    a. Gets user via supabase.auth.getUser() — returns false if no user
 *    b. Looks up existing row via .maybeSingle() for attempts/best_score
 *    c. Upserts into user_lesson_progress (onConflict: user_id,lesson_id)
 *    d. Returns true on success, false on any error
 * 5. If ok: onSaveComplete() → clearLessonSession(id), then side-effects (calendar, streak, goals)
 *    If !ok: setSaveError(true) → error banner with retry button shown to user
 * 6. "Próxima lição" (disabled when saveError) → router.push(`/lessons/${nextLessonId}`)
 * 7. Lessons page loads → getLessonProgressMap() → reads user_lesson_progress → builds progressMap
 * 8. getLessonState() checks progressMap[lesson.id]?.completed to determine lock/complete states
 */
"use client";

import { useState, use, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { ProtectedRoute } from "@/components/protected-route";
import { PronunciationButton } from "@/components/pronunciation-button";
import { CEFRBadge } from "@/components/ui/badge";
import { NoteContextActions } from "@/components/notes/note-context-actions";
import { ContentCalendarInfo } from "@/components/calendar/content-calendar-info";
import {
  getResolvedLesson,
  getCurriculumLesson,
  getResolvedLessons,
} from "@/data/resolve-lessons";
import { MOCK_EXAM_UNLOCKS } from "@/data/curriculum";
import type {
  LessonStage,
  VocabItem,
  PracticeItem,
  Lesson,
} from "@/data/lessons";
import {
  saveLessonAttempt,
  getLessonProgressMap,
  type WrongItem,
} from "@/lib/lesson-progress";
import { logLessonCompletion } from "@/lib/calendar-service";
import { updateStreak } from "@/lib/streak-service";
import { updateGoalProgress } from "@/lib/goals-service";
import { checkAnswer } from "@/lib/accent-utils";
import grammarData from "@/data/grammar.json";
import type { GrammarData, GrammarQuestion } from "@/types/grammar";

const grammarDB = grammarData as unknown as GrammarData;

/* ─── Shared types ─── */

type StageProgressMap = Record<string, Record<string, unknown>>;

/* ─── Lesson session (sessionStorage) ─── */

const SESSION_KEY_PREFIX = "aula-pt-lesson-";

interface LessonSessionState {
  currentStage: number;
  stageProgress: StageProgressMap;
}

function getLessonSessionKey(lessonId: string): string {
  return `${SESSION_KEY_PREFIX}${lessonId}`;
}

function saveLessonSession(lessonId: string, state: LessonSessionState): void {
  try {
    sessionStorage.setItem(getLessonSessionKey(lessonId), JSON.stringify(state));
  } catch {
    // sessionStorage may be full or unavailable
  }
}

function restoreLessonSession(lessonId: string): LessonSessionState | null {
  try {
    const raw = sessionStorage.getItem(getLessonSessionKey(lessonId));
    if (raw) return JSON.parse(raw) as LessonSessionState;
  } catch {
    // ignore
  }
  return null;
}

function clearLessonSession(lessonId: string): void {
  try {
    sessionStorage.removeItem(getLessonSessionKey(lessonId));
  } catch {
    // ignore
  }
}

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

/* ─── STAGE: Vocabulary (preview → multiple choice quiz) ─── */

/** Shuffle array (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function VocabStage({
  stage,
  onProgress,
}: {
  stage: LessonStage;
  onProgress: (itemId: string, data: unknown) => void;
}) {
  const items = stage.items ?? [];
  const [phase, setPhase] = useState<"preview" | "quiz">("preview");
  const [previewIndex, setPreviewIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});

  const currentPreviewItem = items[previewIndex];
  const currentQuizItem = items[quizIndex];

  // Generate multiple choice options for quiz item
  const quizOptions = (() => {
    if (!currentQuizItem) return [];
    const distractors = items
      .filter((it) => it.id !== currentQuizItem.id)
      .map((it) => it.word);
    const shuffled = shuffle(distractors).slice(0, 3);
    return shuffle([currentQuizItem.word, ...shuffled]);
  })();

  const allQuizzed = Object.keys(quizResults).length === items.length;
  const quizCorrectCount = Object.values(quizResults).filter(Boolean).length;

  if (phase === "preview") {
    return (
      <div>
        <StageHeader stage={stage} />
        <p className="text-[13px] text-[#9CA3AF] mb-4">
          Palavra {previewIndex + 1} de {items.length}
        </p>
        {currentPreviewItem && (
          <div
            onClick={() => setFlipped((f) => !f)}
            className="border border-[#E5E7EB] rounded-xl p-6 bg-[#FAFAFA] hover:border-[#D1D5DB] hover:shadow-sm cursor-pointer transition-all min-h-[180px] flex flex-col justify-center"
          >
            {!flipped ? (
              <div className="text-center">
                <p className="text-[18px] font-semibold text-[#111827]">{currentPreviewItem.word}</p>
                <p className="text-[13px] text-[#9CA3AF] mt-1">{currentPreviewItem.pronunciation}</p>
                <p className="text-[12px] text-[#D1D5DB] mt-4">Toca para revelar</p>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[18px] font-semibold text-[#111827]">{currentPreviewItem.word}</p>
                  <PronunciationButton text={currentPreviewItem.word} size="sm" variant="muted" />
                </div>
                <p className="text-[15px] text-[#6B7280]">{currentPreviewItem.translation}</p>
                <p className="text-[13px] text-[#9CA3AF] mt-1">{currentPreviewItem.pronunciation}</p>
                <div className="mt-3 px-3 py-2 bg-[#F9FAFB] rounded-lg">
                  <p className="text-[13px] font-medium text-[#111827] italic">&ldquo;{currentPreviewItem.example.pt}&rdquo;</p>
                  <p className="text-[12px] text-[#9CA3AF] mt-0.5">{currentPreviewItem.example.en}</p>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => { setPreviewIndex((i) => i - 1); setFlipped(false); }}
            disabled={previewIndex === 0}
            className={`text-[13px] font-medium transition-colors ${previewIndex === 0 ? "text-[#D1D5DB]" : "text-[#6B7280] hover:text-[#111827] cursor-pointer"}`}
          >
            ← Anterior
          </button>
          {previewIndex < items.length - 1 ? (
            <button
              onClick={() => { setPreviewIndex((i) => i + 1); setFlipped(false); }}
              className="px-5 py-2 bg-[#111827] text-white text-[13px] font-semibold rounded-lg hover:bg-[#374151] transition-colors cursor-pointer"
            >
              Seguinte →
            </button>
          ) : (
            <button
              onClick={() => setPhase("quiz")}
              className="px-5 py-2 bg-[#003399] text-white text-[13px] font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
            >
              Iniciar teste
            </button>
          )}
        </div>
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {items.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === previewIndex ? "bg-[#111827] w-4" : i < previewIndex ? "bg-[#111827] w-2" : "bg-[#E5E7EB] w-2"}`} />
          ))}
        </div>
      </div>
    );
  }

  // Quiz phase
  return (
    <div>
      <StageHeader stage={stage} />
      <p className="text-[13px] text-[#9CA3AF] mb-4">
        Pergunta {Math.min(quizIndex + 1, items.length)} de {items.length}
      </p>

      {currentQuizItem && !allQuizzed && (
        <div className="border border-[#E5E7EB] rounded-xl p-6 bg-white">
          <p className="text-[13px] text-[#9CA3AF] mb-2">Qual é a tradução em português?</p>
          <p className="text-[20px] font-semibold text-[#111827] mb-6">&ldquo;{currentQuizItem.translation}&rdquo;</p>

          <div className="grid grid-cols-2 gap-3">
            {quizOptions.map((option) => {
              const isSelected = selected === option;
              const isCorrectOption = option === currentQuizItem.word;
              const showResult = selected !== null;

              let btnClass = "border border-[#E5E7EB] bg-[#FAFAFA] hover:border-[#D1D5DB] hover:shadow-sm cursor-pointer";
              if (showResult && isCorrectOption) {
                btnClass = "border-2 border-[#059669] bg-[#F0FDF4]";
              } else if (showResult && isSelected && !isCorrectOption) {
                btnClass = "border-2 border-[#DC2626] bg-[#FEF2F2]";
              } else if (showResult) {
                btnClass = "border border-[#E5E7EB] bg-white opacity-60";
              }

              return (
                <button
                  key={option}
                  type="button"
                  disabled={selected !== null}
                  onClick={() => {
                    setSelected(option);
                    const isCorrect = option === currentQuizItem.word;
                    setQuizResults((prev) => ({ ...prev, [currentQuizItem.id]: isCorrect }));
                    onProgress(currentQuizItem.id, { correct: isCorrect, answer: option });
                  }}
                  className={`rounded-xl p-4 text-[15px] font-medium text-[#111827] text-left transition-all ${btnClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className="mt-4">
              <div className={`p-4 rounded-xl ${selected === currentQuizItem.word ? "bg-[#F0FDF4] border border-[#D1FAE5]" : "bg-[#FEF2F2] border border-[#FEE2E2]"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[15px] font-semibold text-[#111827]">{currentQuizItem.word}</p>
                    <p className="text-[13px] text-[#6B7280]">{currentQuizItem.pronunciation}</p>
                  </div>
                  <PronunciationButton text={currentQuizItem.word} size="sm" variant="muted" />
                </div>
                <div className="mt-2 px-3 py-2 bg-white/60 rounded-lg">
                  <p className="text-[13px] font-medium text-[#111827] italic">&ldquo;{currentQuizItem.example.pt}&rdquo;</p>
                  <p className="text-[12px] text-[#9CA3AF] mt-0.5">{currentQuizItem.example.en}</p>
                </div>
              </div>
              {quizIndex < items.length - 1 && (
                <button
                  onClick={() => { setQuizIndex((i) => i + 1); setSelected(null); }}
                  className="mt-4 w-full py-2.5 bg-[#111827] text-white text-[13px] font-semibold rounded-lg hover:bg-[#374151] transition-colors cursor-pointer"
                >
                  Seguinte →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {allQuizzed && (
        <div className="mt-6 p-4 bg-[#F9FAFB] rounded-xl border border-[#F3F4F6] text-center">
          <p className="text-[15px] font-semibold text-[#111827]">
            {quizCorrectCount} / {items.length} corretas
          </p>
          <p className="text-[13px] text-[#6B7280] mt-1">
            {quizCorrectCount === items.length ? "Perfeito!" : "Continua a praticar."}
          </p>
        </div>
      )}

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={`h-2 rounded-full transition-all ${
              i === quizIndex && !allQuizzed
                ? "bg-[#111827] w-4"
                : quizResults[item.id] !== undefined
                  ? quizResults[item.id]
                    ? "bg-[#059669] w-2"
                    : "bg-[#DC2626] w-2"
                  : "bg-[#E5E7EB] w-2"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

const TENSE_LABELS: Record<string, string> = {
  Present: "Presente",
  Preterite: "Pretérito Perfeito",
  Imperfect: "Pretérito Imperfeito",
  Future: "Futuro",
  Conditional: "Condicional",
  "Present Subjunctive": "Presente do Conjuntivo",
};

/* ─── STAGE: Verb drill (type-to-answer) ─── */

type ConjRow = { verbItem: import("@/data/lessons").VerbItem; pronoun: string; form: string };

function VerbStage({
  stage,
  onProgress,
}: {
  stage: LessonStage;
  onProgress: (itemId: string, data: unknown) => void;
}) {
  const verbs = stage.verbs ?? [];
  const firstVerb = verbs[0];
  if (!firstVerb) return null;

  // Flatten conjugations from all tenses; interleave by pronoun (all tenses for eu, then tu, etc.)
  const rows: ConjRow[] = [];
  const pronouns = firstVerb.conjugations.map((c) => c.pronoun);
  for (const pronoun of pronouns) {
    for (const verbItem of verbs) {
      const conj = verbItem.conjugations.find((c) => c.pronoun === pronoun);
      if (conj) rows.push({ verbItem, pronoun, form: conj.form });
    }
  }

  const progressKey = (row: ConjRow) => `${row.verbItem.id}-${row.pronoun}`;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [correct, setCorrect] = useState<Record<string, boolean>>({});
  const [accentHints, setAccentHints] = useState<Record<string, string>>({});

  const handleSubmit = (row: ConjRow) => {
    const key = progressKey(row);
    const userAnswer = (answers[key] || "").trim();
    const result = checkAnswer(userAnswer, row.form);
    setSubmitted((prev) => ({ ...prev, [key]: true }));
    setCorrect((prev) => ({ ...prev, [key]: result.correct }));
    if (result.accentHint) {
      setAccentHints((prev) => ({ ...prev, [key]: result.accentHint! }));
    }
    onProgress(key, { correct: result.correct, answer: userAnswer });
  };

  const allSubmitted = rows.every((r) => submitted[progressKey(r)]);
  const correctCount = rows.filter((r) => correct[progressKey(r)]).length;
  const hasAnswers = Object.keys(answers).some((k) => answers[k]?.trim());

  return (
    <div>
      <StageHeader stage={stage} />
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <PronunciationButton text={firstVerb.verb} size="sm" variant="muted" />
          <h3 className="text-[18px] font-semibold text-[#111827]">
            {firstVerb.verb}
          </h3>
          <span className="text-[13px] text-[#6B7280]">
            — {firstVerb.verbTranslation}
          </span>
        </div>
        {verbs.length > 1 && (
          <p className="text-[13px] text-[#9CA3AF] mt-1">
            {verbs.map((v) => TENSE_LABELS[v.tense] ?? v.tense).join(" · ")}
          </p>
        )}
      </div>

      <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white">
        {rows.map((row, i) => {
          const key = progressKey(row);
          const tenseLabel = TENSE_LABELS[row.verbItem.tense] ?? row.verbItem.tense;
          return (
            <div
              key={key}
              className={`flex items-center gap-4 px-5 py-4 ${i > 0 ? "border-t border-[#F3F4F6]" : ""} ${
                submitted[key]
                  ? correct[key]
                    ? "bg-[#F0FDF4]"
                    : "bg-[#FEF2F2]"
                  : ""
              }`}
            >
              <span className="text-[15px] font-medium text-[#9CA3AF] w-20 shrink-0">
                {row.pronoun}
              </span>
              <span className="text-[12px] text-[#9CA3AF] w-28 shrink-0">
                {tenseLabel}
              </span>
              {!submitted[key] ? (
                <input
                  type="text"
                  value={answers[key] || ""}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit(row);
                  }}
                  onBlur={() => {
                    if (answers[key]?.trim()) handleSubmit(row);
                  }}
                  placeholder="Conjugação..."
                  className="flex-1 text-[15px] font-semibold text-[#111827] bg-transparent border-b border-[#E5E7EB] focus:border-[#111827] outline-none py-1 placeholder:text-[#D1D5DB] placeholder:font-normal transition-colors"
                  autoComplete="off"
                  spellCheck={false}
                />
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    {correct[key] ? (
                      <div>
                        <span className="text-[15px] font-semibold text-[#059669]">
                          {row.form}
                        </span>
                        {accentHints[key] && (
                          <p className="text-[12px] text-[#6B7280] mt-0.5">
                            Atenção ao acento: <span className="font-semibold text-[#111827]">{accentHints[key]}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span className="text-[15px] font-semibold text-[#DC2626] line-through mr-2">
                          {answers[key]}
                        </span>
                        <span className="text-[15px] font-semibold text-[#059669]">
                          {row.form}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-[13px] font-medium">
                    {correct[key] ? (
                      <svg className="w-4 h-4 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-4 h-4 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!allSubmitted && hasAnswers && (
        <button
          onClick={() => {
            rows.forEach((row) => {
              const key = progressKey(row);
              if (!submitted[key] && answers[key]?.trim()) handleSubmit(row);
            });
          }}
          className="mt-4 w-full py-2.5 bg-[#111827] text-white text-[13px] font-semibold rounded-lg hover:bg-[#374151] transition-colors cursor-pointer"
        >
          Verificar respostas
        </button>
      )}

      {allSubmitted && (
        <div className="mt-6 p-4 bg-[#F9FAFB] rounded-xl border border-[#F3F4F6] flex items-center justify-between">
          <div>
            <p className="text-[15px] font-semibold text-[#111827]">
              {correctCount} / {rows.length} corretas
            </p>
            <p className="text-[13px] text-[#6B7280] mt-0.5">
              {correctCount === rows.length
                ? "Perfeito!"
                : "Continua a praticar."}
            </p>
          </div>
          <Link
            href={`/conjugations/${firstVerb.verbSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] font-medium text-[#003399] hover:underline"
          >
            Ver todos os tempos →
          </Link>
        </div>
      )}
    </div>
  );
}

/* ─── STAGE: Grammar (rule + examples + comprehension quiz) ─── */

function GrammarStage({
  stage,
  onProgress,
}: {
  stage: LessonStage;
  onProgress: (itemId: string, data: unknown) => void;
}) {
  const grammar = stage.grammarItems?.[0];
  if (!grammar) return null;

  const [phase, setPhase] = useState<"learn" | "quiz">("learn");
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const allRevealed = grammar.examples.every((_, i) => revealed[i]);

  // Comprehension questions from grammar.json
  const topicQuestions: GrammarQuestion[] = grammarDB.topics[grammar.topicSlug]?.questions ?? [];
  const questions = topicQuestions.slice(0, 3);
  const hasQuestions = questions.length > 0;

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizResults, setQuizResults] = useState<Record<number, boolean>>({});

  const currentQ = questions[quizIndex];
  const allAnswered = Object.keys(quizResults).length === questions.length;
  const quizCorrectCount = Object.values(quizResults).filter(Boolean).length;

  if (phase === "learn") {
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
          Exemplos
        </p>
        <div className="space-y-3">
          {grammar.examples.map((ex, i) => (
            <div
              key={i}
              onClick={() => {
                if (!revealed[i]) {
                  setRevealed((prev) => ({ ...prev, [i]: true }));
                }
              }}
              className={`border rounded-xl p-4 transition-all duration-200 ${
                revealed[i]
                  ? "border-[#E5E7EB] bg-white"
                  : "border-[#E5E7EB] bg-[#FAFAFA] cursor-pointer hover:border-[#D1D5DB] hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <PronunciationButton text={ex.pt} size="sm" variant="muted" />
                <p className="text-[15px] font-semibold text-[#111827]">{ex.pt}</p>
              </div>
              {revealed[i] ? (
                <p className="text-[13px] font-medium text-[#6B7280] mt-2 ml-10">{ex.en}</p>
              ) : (
                <p className="text-[12px] text-[#D1D5DB] mt-2 ml-10">Toca para revelar</p>
              )}
            </div>
          ))}
        </div>

        {allRevealed && (
          <div className="mt-6 flex items-center justify-between">
            <Link
              href={`/grammar/${grammar.topicSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-medium text-[#003399] hover:underline"
            >
              Aprofundar: {grammar.topicTitle} →
            </Link>
            {hasQuestions && (
              <button
                onClick={() => setPhase("quiz")}
                className="px-5 py-2 bg-[#003399] text-white text-[13px] font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                Testar compreensão
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Quiz phase
  return (
    <div>
      <StageHeader stage={stage} />
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-4">
        Compreensão — Pergunta {Math.min(quizIndex + 1, questions.length)} de {questions.length}
      </p>

      {currentQ && !allAnswered && (
        <div className="border border-[#E5E7EB] rounded-xl p-6 bg-white">
          <p className="text-[16px] font-semibold text-[#111827] mb-1">{currentQ.questionText}</p>
          <p className="text-[13px] text-[#6B7280] italic mb-5">{currentQ.questionTextPt}</p>

          <div className="space-y-2">
            {currentQ.options.map((option, oi) => {
              const isSelected = selectedOption === oi;
              const isCorrectOption = oi === currentQ.correctIndex;
              const showResult = selectedOption !== null;

              let btnClass = "border border-[#E5E7EB] bg-[#FAFAFA] hover:border-[#D1D5DB] cursor-pointer";
              if (showResult && isCorrectOption) {
                btnClass = "border-2 border-[#059669] bg-[#F0FDF4]";
              } else if (showResult && isSelected && !isCorrectOption) {
                btnClass = "border-2 border-[#DC2626] bg-[#FEF2F2]";
              } else if (showResult) {
                btnClass = "border border-[#E5E7EB] bg-white opacity-60";
              }

              return (
                <button
                  key={oi}
                  type="button"
                  disabled={selectedOption !== null}
                  onClick={() => {
                    setSelectedOption(oi);
                    const isCorrect = oi === currentQ.correctIndex;
                    setQuizResults((prev) => ({ ...prev, [quizIndex]: isCorrect }));
                    onProgress(`grammar-q-${quizIndex}`, { correct: isCorrect, answer: option });
                  }}
                  className={`w-full rounded-xl p-3 text-[14px] font-medium text-[#111827] text-left transition-all ${btnClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <div className="mt-4 p-3 bg-[#F9FAFB] rounded-lg border border-[#F3F4F6]">
              <p className="text-[13px] text-[#6B7280]">{currentQ.explanation}</p>
              {currentQ.exampleSentence && (
                <p className="text-[13px] font-medium text-[#111827] mt-1 italic">{currentQ.exampleSentence}</p>
              )}
              {currentQ.exampleTranslation && (
                <p className="text-[12px] text-[#9CA3AF] mt-0.5">{currentQ.exampleTranslation}</p>
              )}
              {quizIndex < questions.length - 1 && (
                <button
                  onClick={() => { setQuizIndex((i) => i + 1); setSelectedOption(null); }}
                  className="mt-3 px-5 py-2 bg-[#111827] text-white text-[13px] font-semibold rounded-lg hover:bg-[#374151] transition-colors cursor-pointer"
                >
                  Seguinte →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {allAnswered && (
        <div className="mt-6 p-4 bg-[#F9FAFB] rounded-xl border border-[#F3F4F6] text-center">
          <p className="text-[15px] font-semibold text-[#111827]">
            {quizCorrectCount} / {questions.length} corretas
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── STAGE: Culture (multiple choice meaning guess) ─── */

function CultureStage({
  stage,
  onProgress,
}: {
  stage: LessonStage;
  onProgress: (itemId: string, data: unknown) => void;
}) {
  const cultureItems = stage.cultureItems ?? [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const currentItem = cultureItems[currentIdx];
  const allDone = Object.keys(results).length === cultureItems.length;

  // Generate distractors: meanings from other culture items, plus the literal translation
  const getOptions = (item: typeof cultureItems[0]) => {
    const otherMeanings = cultureItems
      .filter((c) => c.id !== item.id)
      .map((c) => c.meaning);
    const distractors: string[] = [];
    // Use literal translation as one distractor if different from meaning
    if (item.literal && item.literal !== item.meaning) {
      distractors.push(item.literal);
    }
    // Fill from other culture items
    for (const m of shuffle(otherMeanings)) {
      if (distractors.length >= 2) break;
      if (m !== item.meaning && !distractors.includes(m)) distractors.push(m);
    }
    // If still not enough, add a generic option
    while (distractors.length < 2) {
      distractors.push(distractors.length === 0 ? "Uma expressão comum em Portugal" : "Uma saudação formal");
    }
    return shuffle([item.meaning, ...distractors.slice(0, 2)]);
  };

  const options = currentItem ? getOptions(currentItem) : [];

  return (
    <div>
      <StageHeader stage={stage} />
      <p className="text-[13px] text-[#9CA3AF] mb-4">
        {Math.min(currentIdx + 1, cultureItems.length)} de {cultureItems.length}
      </p>

      {currentItem && !allDone && (
        <div className="border border-[#E5E7EB] rounded-xl p-6 bg-white">
          <div className="flex items-start gap-3 mb-6">
            <PronunciationButton
              text={currentItem.expression}
              size="sm"
              variant="muted"
              className="shrink-0 mt-0.5"
            />
            <p className="text-[18px] font-semibold text-[#111827] italic leading-relaxed">
              &ldquo;{currentItem.expression}&rdquo;
            </p>
          </div>

          <p className="text-[13px] text-[#9CA3AF] mb-4">O que achas que significa?</p>

          <div className="space-y-2">
            {options.map((option) => {
              const isSelected = selected === option;
              const isCorrectOption = option === currentItem.meaning;
              const showResult = selected !== null;

              let btnClass = "border border-[#E5E7EB] bg-[#FAFAFA] hover:border-[#D1D5DB] cursor-pointer";
              if (showResult && isCorrectOption) {
                btnClass = "border-2 border-[#059669] bg-[#F0FDF4]";
              } else if (showResult && isSelected && !isCorrectOption) {
                btnClass = "border-2 border-[#DC2626] bg-[#FEF2F2]";
              } else if (showResult) {
                btnClass = "border border-[#E5E7EB] bg-white opacity-60";
              }

              return (
                <button
                  key={option}
                  type="button"
                  disabled={selected !== null}
                  onClick={() => {
                    setSelected(option);
                    const isCorrect = option === currentItem.meaning;
                    setResults((prev) => ({ ...prev, [currentItem.id]: isCorrect }));
                    onProgress(currentItem.id, { correct: isCorrect, answer: option });
                  }}
                  className={`w-full rounded-xl p-4 text-[14px] font-medium text-[#111827] text-left transition-all ${btnClass}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className="mt-4 space-y-3">
              <div className="px-4 py-3 bg-[#F9FAFB] rounded-lg">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-1">Significado</p>
                <p className="text-[14px] font-medium text-[#111827]">{currentItem.meaning}</p>
              </div>
              {currentItem.literal && (
                <div className="px-4 py-3 bg-[#F9FAFB] rounded-lg">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-1">Literal</p>
                  <p className="text-[13px] text-[#6B7280]">{currentItem.literal}</p>
                </div>
              )}
              <div className="px-4 py-3 bg-[#F9FAFB] rounded-lg">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-1">Quando usar</p>
                <p className="text-[13px] text-[#6B7280]">{currentItem.tip}</p>
              </div>
              {currentIdx < cultureItems.length - 1 && (
                <button
                  onClick={() => { setCurrentIdx((i) => i + 1); setSelected(null); }}
                  className="w-full mt-2 py-2.5 bg-[#111827] text-white text-[13px] font-semibold rounded-lg hover:bg-[#374151] transition-colors cursor-pointer"
                >
                  Seguinte →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {allDone && (
        <div className="mt-6 p-4 bg-[#F9FAFB] rounded-xl border border-[#F3F4F6] text-center">
          <p className="text-[15px] font-semibold text-[#111827]">
            {Object.values(results).filter(Boolean).length} / {cultureItems.length} corretas
          </p>
        </div>
      )}
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
  const [practiceAccentHints, setPracticeAccentHints] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentItem = items[currentIndex];
  const allDone = items.every((item) => submitted[item.id]);
  const correctCount = Object.values(correct).filter(Boolean).length;

  const handleCheck = (item: PracticeItem) => {
    const userAnswer = (answers[item.id] || "").trim();
    const result = checkAnswer(userAnswer, item.answer, item.acceptedAnswers);
    setSubmitted((prev) => ({ ...prev, [item.id]: true }));
    setCorrect((prev) => ({ ...prev, [item.id]: result.correct }));
    if (result.accentHint) {
      setPracticeAccentHints((prev) => ({ ...prev, [item.id]: result.accentHint! }));
    }
    onProgress(item.id, { correct: result.correct, answer: userAnswer });
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
                {correct[currentItem.id] ? "Correto!" : "Não é bem"}
              </p>
              <p className="text-[15px] font-semibold text-[#111827] mb-1">
                {currentItem.fullSentence}
              </p>
              <p className="text-[13px] text-[#6B7280]">
                {currentItem.translation}
              </p>
              {correct[currentItem.id] && practiceAccentHints[currentItem.id] && (
                <p className="text-[12px] text-[#6B7280] mt-2">
                  Atenção ao acento: <span className="font-semibold text-[#111827]">{practiceAccentHints[currentItem.id]}</span>
                </p>
              )}
              {!correct[currentItem.id] && (
                <p className="text-[13px] text-[#9CA3AF] mt-2">
                  A resposta era:{" "}
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

/* ─── STAGE: Results (pass/fail, scoring, save) ─── */

function ResultsStage({
  lesson,
  curriculumLesson,
  stageProgress,
  nextLessonId,
  onTryAgain,
  onSaveComplete,
}: {
  lesson: Lesson;
  curriculumLesson: { scoring: { passingScore: number } } | undefined;
  stageProgress: StageProgressMap;
  nextLessonId: string | null;
  onTryAgain: () => void;
  onSaveComplete?: () => void;
}) {
  const router = useRouter();
  const passingScore = curriculumLesson?.scoring.passingScore ?? 60;

  // ── Vocab scoring ──
  const vocabStage = lesson.stages.find((s) => s.type === "vocabulary");
  const vocabItems = vocabStage?.items ?? [];
  let vocabCorrect = 0;
  let vocabTotal = vocabItems.length;
  vocabItems.forEach((item) => {
    const p = (stageProgress[vocabStage?.id ?? ""] ?? {})[item.id] as { correct?: boolean } | undefined;
    if (p?.correct) vocabCorrect++;
  });

  // ── Verb scoring ──
  const verbStages = lesson.stages.filter((s) => s.type === "verb");
  let verbCorrect = 0;
  let verbTotal = 0;
  const wrongItems: WrongItem[] = [];

  verbStages.forEach((stage) => {
    for (const verb of stage.verbs ?? []) {
      verb.conjugations.forEach((c) => {
        verbTotal++;
        const key = `${verb.id}-${c.pronoun}`;
        const p = (stageProgress[stage.id] ?? {})[key] as { correct?: boolean; answer?: string } | undefined;
        if (p?.correct) verbCorrect++;
        else if (p !== undefined)
          wrongItems.push({
            type: "verb",
            verbKey: verb.verb,
            tense: verb.tense,
            pronoun: c.pronoun,
            userAnswer: p.answer ?? "",
            correctAnswer: c.form,
          });
      });
    }
  });

  // ── Grammar comprehension scoring ──
  const grammarStages = lesson.stages.filter((s) => s.type === "grammar");
  let grammarCorrect = 0;
  let grammarTotal = 0;
  grammarStages.forEach((stage) => {
    const topicSlug = stage.grammarItems?.[0]?.topicSlug;
    if (!topicSlug) return;
    const questions = (grammarDB.topics[topicSlug]?.questions ?? []).slice(0, 3);
    grammarTotal += questions.length;
    questions.forEach((_, qi) => {
      const p = (stageProgress[stage.id] ?? {})[`grammar-q-${qi}`] as { correct?: boolean } | undefined;
      if (p?.correct) grammarCorrect++;
    });
  });

  // ── Culture scoring ──
  const cultureStage = lesson.stages.find((s) => s.type === "culture");
  const cultureItems = cultureStage?.cultureItems ?? [];
  let cultureCorrect = 0;
  let cultureTotal = cultureItems.length;
  cultureItems.forEach((item) => {
    const p = (stageProgress[cultureStage?.id ?? ""] ?? {})[item.id] as { correct?: boolean } | undefined;
    if (p?.correct) cultureCorrect++;
  });

  // ── Practice scoring ──
  const practiceStage = lesson.stages.find((s) => s.type === "practice");
  let practiceCorrect = 0;
  const practiceItems = practiceStage?.practiceItems ?? [];
  const practiceStageId = practiceStage?.id ?? "";
  practiceItems.forEach((item) => {
    const p = (stageProgress[practiceStageId] ?? {})[item.id] as { correct?: boolean; answer?: string } | undefined;
    if (p?.correct) practiceCorrect++;
    else if (p !== undefined)
      wrongItems.push({
        type: "practice",
        userAnswer: p.answer ?? "",
        correctAnswer: item.answer,
        sentencePt: item.fullSentence,
        sentenceEn: item.translation,
      });
  });
  const practiceTotal = practiceItems.length;

  // ── Accuracy ──
  const gradedTotal = vocabTotal + verbTotal + grammarTotal + cultureTotal + practiceTotal;
  const gradedCorrect = vocabCorrect + verbCorrect + grammarCorrect + cultureCorrect + practiceCorrect;
  const accuracy = gradedTotal > 0 ? Math.round((gradedCorrect / gradedTotal) * 100) : 0;
  const passed = accuracy >= passingScore;

  const [isSaving, setIsSaving] = useState(true);
  const [saveError, setSaveError] = useState(false);
  const hasSaved = useRef(false);

  const doSave = async () => {
    setIsSaving(true);
    setSaveError(false);
    const title = lesson.ptTitle ? `${lesson.title} (${lesson.ptTitle})` : lesson.title;
    try {
      const ok = await saveLessonAttempt(lesson.id, accuracy, passed, wrongItems);
      if (!ok) {
        console.error("[LESSON SAVE] saveLessonAttempt returned false — save failed");
        setSaveError(true);
        setIsSaving(false);
        return;
      }
      onSaveComplete?.();
      logLessonCompletion(lesson.id, title, accuracy, passed).catch(() => {});
      updateStreak().catch(() => {});
      // Fetch fresh progress AFTER save — this ensures the count includes the just-saved lesson
      const freshMap = await getLessonProgressMap().catch(() => ({}));
      const a1Count = Object.entries(freshMap).filter(([id, p]) => id.startsWith("a1-") && p.completed).length;
      const a2Count = Object.entries(freshMap).filter(([id, p]) => id.startsWith("a2-") && p.completed).length;
      const b1Count = Object.entries(freshMap).filter(([id, p]) => id.startsWith("b1-") && p.completed).length;
      setLevelCounts({ a1: a1Count, a2: a2Count, b1: b1Count, total: a1Count + a2Count + b1Count });

      if (passed) {
        if (lesson.cefr === "A1") updateGoalProgress("lessons_a1", a1Count).catch(() => {});
        if (lesson.cefr === "A2") updateGoalProgress("lessons_a2", a2Count).catch(() => {});
        if (lesson.cefr === "B1") updateGoalProgress("lessons_b1", b1Count).catch(() => {});
      }
    } catch (e) {
      console.error("[LESSON SAVE] Exception during save:", e);
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (hasSaved.current) return;
    hasSaved.current = true;
    doSave();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- save once on mount
  }, []);

  const [levelCounts, setLevelCounts] = useState<{ a1: number; a2: number; b1: number; total: number } | null>(null);

  const unlockedExamId =
    levelCounts != null
      ? Object.entries(MOCK_EXAM_UNLOCKS).find(
          ([, config]) => config.lessonsRequired === levelCounts.total
        )?.[0] ?? null
      : null;
  const unlockedExamNum = unlockedExamId ? parseInt(unlockedExamId.replace("exam-", ""), 10) : null;

  if (passed) {
    return (
      <div className="text-center py-8">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-[#F0FDF4] border-2 border-[#D1FAE5] flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#111827]">Lesson Complete!</h2>
          <p className="text-[13px] font-medium text-[#6B7280] italic mt-1">Lição Completa!</p>
        </div>
        <p className="text-[18px] font-semibold text-[#111827] mb-6">Accuracy: {accuracy}%</p>
        <div className="flex flex-wrap justify-center gap-4 mb-6 text-[13px] text-[#6B7280]">
          {vocabTotal > 0 && <span>Vocabulário: {vocabCorrect}/{vocabTotal}</span>}
          {verbTotal > 0 && <span>Verbos: {verbCorrect}/{verbTotal}</span>}
          {grammarTotal > 0 && <span>Gramática: {grammarCorrect}/{grammarTotal}</span>}
          {cultureTotal > 0 && <span>Cultura: {cultureCorrect}/{cultureTotal}</span>}
          {practiceTotal > 0 && <span>Prática: {practiceCorrect}/{practiceTotal}</span>}
        </div>
        {levelCounts != null && (
          <p className="text-[13px] text-[#6B7280] mb-2">
            {lesson.cefr === "A1" && `A1: ${levelCounts.a1} / 18 · `}
            {lesson.cefr === "A2" && `A2: ${levelCounts.a2} / 16 · `}
            {lesson.cefr === "B1" && `B1: ${levelCounts.b1} / 10 · `}
            Total: {levelCounts.total} lições
          </p>
        )}
        {lesson.id === "a2-16" && (
          <p className="text-[14px] font-semibold text-[#059669] mb-2">
            A2 completo! Concluíste o nível A2.
          </p>
        )}
        {lesson.id === "b1-10" && (
          <p className="text-[14px] font-semibold text-[#059669] mb-2">
            B1 completo! Parabéns — concluíste o currículo Aula PT.
          </p>
        )}
        {unlockedExamNum != null && (
          <p className="text-[14px] font-semibold text-[#059669] mb-8">
            Exame {unlockedExamNum} desbloqueado!
          </p>
        )}
        {saveError && (
          <div className="mb-6 p-4 rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] text-center">
            <p className="text-[14px] font-medium text-[#DC2626] mb-2">
              Erro ao guardar o progresso. O teu resultado pode não ter sido guardado.
            </p>
            <button
              type="button"
              onClick={() => { hasSaved.current = false; doSave(); }}
              disabled={isSaving}
              className="px-5 py-2 bg-[#DC2626] text-white text-[13px] font-semibold rounded-lg hover:bg-[#B91C1C] transition-colors disabled:opacity-60"
            >
              {isSaving ? "A guardar..." : "Tentar guardar novamente"}
            </button>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {nextLessonId && (
            <button
              type="button"
              disabled={isSaving || saveError}
              onClick={() => !isSaving && !saveError && router.push(`/lessons/${nextLessonId}`)}
              className="px-8 py-3 bg-[#111827] text-white text-[15px] font-semibold rounded-xl hover:bg-[#374151] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? "A guardar..." : "Próxima lição"}
            </button>
          )}
          <button
            type="button"
            disabled={isSaving}
            onClick={() => !isSaving && router.push(`/lessons/${lesson.id}`)}
            className="px-6 py-2.5 border border-[#E5E7EB] rounded-xl text-[14px] font-medium text-[#6B7280] hover:bg-[#F9FAFB] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Rever lição
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => !isSaving && router.push("/lessons")}
            className="text-[13px] font-medium text-[#6B7280] hover:text-[#111827] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Voltar às lições
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className="mb-6">
        <div className="w-16 h-16 rounded-full bg-[#FEF3C7] border-2 border-[#FCD34D] flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl" aria-hidden>📚</span>
        </div>
        <h2 className="text-2xl font-bold text-[#111827]">Not quite yet</h2>
        <p className="text-[13px] font-medium text-[#6B7280] italic mt-1">Ainda não</p>
      </div>
      <p className="text-[18px] font-semibold text-[#111827] mb-6">Accuracy: {accuracy}%</p>
      <p className="text-[13px] text-[#6B7280] mb-6">You need {passingScore}% to pass. Review your mistakes below and try again.</p>

      {wrongItems.length > 0 && (
        <div className="text-left max-w-2xl mx-auto mb-8 space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF]">Wrong answers</p>
          {wrongItems.map((item, i) => (
            <div key={i} className="border border-[#FEE2E2] rounded-xl p-4 bg-[#FEF2F2]">
              {item.type === "verb" && (
                <>
                  <p className="text-[13px] text-[#6B7280]">
                    Verb: {item.verbKey} · {item.tense} · {item.pronoun}
                  </p>
                  <p className="mt-1">
                    <span className="text-[#DC2626] line-through">{item.userAnswer || "(empty)"}</span>
                    {" → "}
                    <span className="text-[#059669] font-semibold">{item.correctAnswer}</span>
                  </p>
                </>
              )}
              {item.type === "practice" && (
                <>
                  <p className="text-[13px] text-[#111827] font-medium">{item.sentencePt}</p>
                  <p className="text-[12px] text-[#6B7280] mt-0.5">{item.sentenceEn}</p>
                  <p className="mt-1">
                    <span className="text-[#DC2626] line-through">{item.userAnswer || "(empty)"}</span>
                    {" → "}
                    <span className="text-[#059669] font-semibold">{item.correctAnswer}</span>
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {saveError && (
        <div className="mb-6 p-4 rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] text-center">
          <p className="text-[14px] font-medium text-[#DC2626] mb-2">
            Erro ao guardar o progresso.
          </p>
          <button
            type="button"
            onClick={() => { hasSaved.current = false; doSave(); }}
            disabled={isSaving}
            className="px-5 py-2 bg-[#DC2626] text-white text-[13px] font-semibold rounded-lg hover:bg-[#B91C1C] transition-colors disabled:opacity-60"
          >
            {isSaving ? "A guardar..." : "Tentar guardar novamente"}
          </button>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={onTryAgain}
          disabled={isSaving}
          className="px-8 py-3 bg-[#111827] text-white text-[15px] font-semibold rounded-xl hover:bg-[#374151] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? "A guardar..." : "Tentar novamente"}
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => !isSaving && router.push("/lessons")}
          className="px-6 py-2.5 border border-[#E5E7EB] rounded-xl text-[14px] font-medium text-[#6B7280] hover:bg-[#F9FAFB] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Voltar às lições
        </button>
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
  const lesson = getResolvedLesson(id);
  const curriculumLesson = getCurriculumLesson(id);
  const [currentStage, setCurrentStage] = useState(0);
  const [stageProgress, setStageProgress] = useState<StageProgressMap>({});
  const [progressMap, setProgressMap] = useState<Record<string, { completed?: boolean }> | null>(null);
  const [savedSession, setSavedSession] = useState<LessonSessionState | null>(null);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);

  useEffect(() => {
    getLessonProgressMap().then((map) => {
      setProgressMap(map);
      const session = restoreLessonSession(id);
      setSavedSession(session);
      if (session && !map[id]?.completed) setShowRestorePrompt(true);
      else if (session && map[id]?.completed) clearLessonSession(id);
    });
  }, [id]);

  useEffect(() => {
    if (!lesson || showRestorePrompt) return;
    saveLessonSession(id, { currentStage, stageProgress });
  }, [id, lesson, currentStage, stageProgress, showRestorePrompt]);

  const handleRestoreSession = () => {
    if (savedSession) {
      setCurrentStage(savedSession.currentStage);
      setStageProgress(savedSession.stageProgress);
    }
    setShowRestorePrompt(false);
  };

  const handleStartFresh = () => {
    clearLessonSession(id);
    setSavedSession(null);
    setShowRestorePrompt(false);
  };

  const handleSaveComplete = () => {
    clearLessonSession(id);
  };

  const sortedLessons = getResolvedLessons().sort((a, b) => a.order - b.order);
  const nextLesson = lesson ? sortedLessons.find((l) => l.order === lesson.order + 1) : null;
  const nextLessonId = nextLesson?.id ?? null;

  if (!lesson) {
    return (
      <>
        <Topbar />
        <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 py-16">
          <p className="text-[13px] text-[#9CA3AF]">Lesson not found.</p>
          <Link
            href="/lessons"
            className="text-[13px] font-medium text-[#003399] hover:underline mt-2 inline-block"
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

  const handleTryAgain = () => {
    setCurrentStage(0);
    setStageProgress({});
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            <div className="flex items-center gap-4 flex-wrap shrink-0">
              <NoteContextActions
                contextType="lesson"
                contextId={lesson.id}
                contextLabel={lesson.title}
              />
              <ContentCalendarInfo contentType="lesson" contentId={lesson.id} />
              <CEFRBadge level={lesson.cefr} />
            </div>
          </div>

          {!showRestorePrompt && (
            <>
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
            </>
          )}
        </div>

        <div className="border-t border-[#F3F4F6] mb-6" />

        {/* Restore session prompt */}
        {showRestorePrompt && (
          <div className="mb-6 p-6 rounded-xl border border-[var(--border-primary,#E5E7EB)] bg-[var(--bg-card,white)] text-center">
            <p className="text-[15px] font-medium text-[var(--text-primary,#111827)] mb-4">
              Tens progresso guardado nesta lição.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleRestoreSession}
                className="px-5 py-2.5 bg-[#003399] text-white text-[14px] font-medium rounded-xl hover:opacity-90 transition-opacity"
              >
                Continuar de onde parei
              </button>
              <button
                type="button"
                onClick={handleStartFresh}
                className="px-5 py-2.5 text-[14px] font-medium text-[var(--text-secondary,#6B7280)] hover:text-[var(--text-primary,#111827)] transition-colors"
              >
                Começar de novo
              </button>
            </div>
          </div>
        )}

        {/* Stage content */}
        <div className="pb-16">
          {showRestorePrompt ? null : isSummary ? (
            <ResultsStage
              lesson={lesson}
              curriculumLesson={curriculumLesson}
              stageProgress={stageProgress}
              nextLessonId={nextLessonId}
              onTryAgain={handleTryAgain}
              onSaveComplete={handleSaveComplete}
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
          {!isSummary && (
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
