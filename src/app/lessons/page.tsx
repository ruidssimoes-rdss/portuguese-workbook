"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Lock, Check, ChevronRight, ChevronDown } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getResolvedLessons } from "@/data/resolve-lessons";
import {
  getLessonProgressMap,
  type LessonAttemptResult,
} from "@/lib/lesson-progress";
import { TutorTabV2 } from "@/components/lessons/tutor-tab";
import { PageShell } from "@/components/layout/page-shell";
import {
  PageHeader,
  SectionLabel,
  BadgePill,
  CardShell,
  SegmentedFilter,
} from "@/components/primitives";

// ─── Data ───────────────────────────────────────────────────────────────────

const lessons = getResolvedLessons();
const A1_LESSONS = lessons.filter((l) => l.cefr === "A1");
const A2_LESSONS = lessons.filter((l) => l.cefr === "A2");
const B1_LESSONS = lessons.filter((l) => l.cefr === "B1");
const A1_TOTAL = A1_LESSONS.length;
const A2_TOTAL = A2_LESSONS.length;
const B1_TOTAL = B1_LESSONS.length;

// ─── Lesson state logic (preserved exactly) ─────────────────────────────────

type LessonCardState = "completed" | "current" | "attempted" | "locked";

function getLessonState(
  lesson: (typeof lessons)[0],
  progressMap: Record<string, LessonAttemptResult>,
  sortedLessons: typeof lessons
): LessonCardState {
  const progress = progressMap[lesson.id];
  if (progress?.completed) return "completed";

  const prevLesson = sortedLessons.find((l) => l.order === lesson.order - 1);
  const prevCompleted = !prevLesson || progressMap[prevLesson.id]?.completed;
  if (!prevCompleted) return "locked";

  if (progress && progress.attempts > 0) return "attempted";
  return "current";
}

// ─── How lessons work accordion ─────────────────────────────────────────────

const LESSON_SECTIONS = [
  { namePt: "Vocabulário", nameEn: "Vocabulary", descPt: "Traduz palavras novas", descEn: "Translate new words" },
  { namePt: "Conjugação", nameEn: "Conjugation", descPt: "Conjuga verbos no tempo correto", descEn: "Conjugate verbs in the correct tense" },
  { namePt: "Gramática", nameEn: "Grammar", descPt: "Testa regras gramaticais", descEn: "Test grammar rules" },
  { namePt: "Completa as frases", nameEn: "Complete the sentences", descPt: "Preenche os espaços em branco", descEn: "Fill in the blanks" },
  { namePt: "Tradução", nameEn: "Translation", descPt: "Traduz frases do inglês para português", descEn: "Translate sentences from English to Portuguese" },
  { namePt: "Constrói a frase", nameEn: "Build the sentence", descPt: "Ordena palavras para formar frases", descEn: "Order words to form sentences" },
  { namePt: "Texto com lacunas", nameEn: "Text with gaps", descPt: "Completa um parágrafo com um banco de palavras", descEn: "Complete a paragraph with a word bank" },
  { namePt: "Corrige os erros", nameEn: "Correct the errors", descPt: "Encontra e corrige erros em frases", descEn: "Find and fix errors in sentences" },
];

function LessonInfoSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[#F7F7F5] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg px-4 py-3.5 hover:border-[rgba(0,0,0,0.12)] transition-colors cursor-pointer"
      >
        <div>
          <p className="text-[13px] font-medium text-[#111111] text-left">
            Como funcionam as lições
          </p>
          <p className="text-[11px] text-[#9B9DA3] text-left">
            How do lessons work
          </p>
        </div>
        <ChevronDown
          size={16}
          className={`text-[#9B9DA3] transition-transform duration-150 shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="mt-2 bg-[#F7F7F5] border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg px-4 py-4 space-y-3">
          <div className="space-y-2.5">
            {LESSON_SECTIONS.map((s, i) => (
              <div key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#E6F1FB] text-[#185FA5] text-[11px] font-medium flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[12px] font-medium text-[#111111]">
                    {s.namePt} — {s.descPt}
                  </p>
                  <p className="text-[11px] text-[#9B9DA3]">
                    {s.nameEn} — {s.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t-[0.5px] border-[rgba(0,0,0,0.06)] pt-3 space-y-1.5">
            <p className="text-[12px] text-[#6C6B71]">
              Precisas de 80% para passar cada lição.
              <span className="block text-[11px] text-[#9B9DA3]">You need 80% to pass each lesson.</span>
            </p>
            <p className="text-[12px] text-[#6C6B71]">
              As lições são sequenciais — completa cada uma para desbloquear a seguinte.
              <span className="block text-[11px] text-[#9B9DA3]">Lessons are sequential — complete each one to unlock the next.</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Lesson card renderer ───────────────────────────────────────────────────

function LessonCard({
  lesson,
  state,
  progress,
  levelLocked,
  lockMessage,
}: {
  lesson: (typeof lessons)[0];
  state: LessonCardState;
  progress: LessonAttemptResult | undefined;
  levelLocked: boolean;
  lockMessage: string;
}) {
  const isLocked = state === "locked" || levelLocked;

  if (isLocked) {
    return (
      <CardShell className="opacity-50">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-[#F7F7F5] flex items-center justify-center flex-shrink-0">
            <Lock size={12} className="text-[#9B9DA3]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] text-[#9B9DA3]">Lesson {lesson.order}</div>
            <div className="text-[14px] font-medium text-[#9B9DA3]">{lesson.title}</div>
            <div className="text-[12px] text-[#9B9DA3] mt-0.5">{lesson.ptTitle}</div>
          </div>
        </div>
      </CardShell>
    );
  }

  if (state === "completed") {
    return (
      <Link href={`/lessons/${lesson.id}`} className="block">
        <CardShell interactive>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
              <Check size={12} className="text-[#0F6E56]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] text-[#9B9DA3]">Lesson {lesson.order}</div>
              <div className="text-[14px] font-medium text-[#111111]">{lesson.title}</div>
              <div className="text-[12px] text-[#9B9DA3] mt-0.5">{lesson.ptTitle}</div>
            </div>
            {progress && (
              <span className="text-[12px] text-[#0F6E56] font-medium flex-shrink-0">
                {Math.round(progress.accuracy_score)}%
              </span>
            )}
          </div>
        </CardShell>
      </Link>
    );
  }

  if (state === "attempted") {
    return (
      <Link href={`/lessons/${lesson.id}`} className="block">
        <CardShell interactive>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-[#FAEEDA] flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-medium text-[#854F0B]">!</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] text-[#9B9DA3]">Lesson {lesson.order}</div>
              <div className="text-[14px] font-medium text-[#111111]">{lesson.title}</div>
              <div className="text-[12px] text-[#9B9DA3] mt-0.5">
                {lesson.ptTitle} · Best: {progress ? Math.round(progress.best_score) : 0}%
              </div>
            </div>
            <span className="text-[12px] text-[#854F0B] font-medium flex-shrink-0">Retry</span>
          </div>
        </CardShell>
      </Link>
    );
  }

  // current
  return (
    <Link href={`/lessons/${lesson.id}`} className="block">
      <CardShell interactive className="border-[1px] border-[#185FA5]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-[#E6F1FB] flex items-center justify-center flex-shrink-0">
            <ChevronRight size={12} className="text-[#185FA5]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] text-[#9B9DA3]">Lesson {lesson.order}</div>
            <div className="text-[14px] font-medium text-[#111111]">{lesson.title}</div>
            <div className="text-[12px] text-[#9B9DA3] mt-0.5">{lesson.ptTitle}</div>
          </div>
          <span className="text-[12px] text-[#185FA5] font-medium flex-shrink-0">Start</span>
        </div>
      </CardShell>
    </Link>
  );
}

// ─── CEFR Section ───────────────────────────────────────────────────────────

function CefrSection({
  label,
  lessons: sectionLessons,
  completed,
  total,
  unlocked,
  lockMessage,
  progressMap,
  sorted,
}: {
  label: string;
  lessons: typeof A1_LESSONS;
  completed: number;
  total: number;
  unlocked: boolean;
  lockMessage: string;
  progressMap: Record<string, LessonAttemptResult>;
  sorted: typeof lessons;
}) {
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>{label}</SectionLabel>
        <span className="text-[12px] text-[#9B9DA3]">
          {completed}/{total} complete
        </span>
      </div>

      <div className="h-1.5 bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-[#185FA5] rounded-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {!unlocked && (
        <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-6 text-center opacity-60">
          <Lock size={20} className="text-[#9B9DA3] mx-auto mb-2" />
          <div className="text-[13px] text-[#9B9DA3]">{lockMessage}</div>
        </div>
      )}

      {unlocked && (
        <div className="space-y-2">
          {sectionLessons.map((lesson) => {
            const state = getLessonState(lesson, progressMap, sorted);
            const progress = progressMap[lesson.id];
            return (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                state={state}
                progress={progress}
                levelLocked={false}
                lockMessage=""
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function LessonsPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("Curriculum");
  const [progressMap, setProgressMap] = useState<
    Record<string, LessonAttemptResult>
  >({});

  useEffect(() => {
    getLessonProgressMap()
      .then((map) => {
        setProgressMap(map);
      })
      .catch((err) => {
        console.error("[LESSONS PAGE] Lesson progress fetch failed:", err);
      });
  }, []);

  const sorted = [...lessons].sort((a, b) => a.order - b.order);
  const a1Completed = A1_LESSONS.filter(
    (l) => progressMap[l.id]?.completed
  ).length;
  const a2Completed = A2_LESSONS.filter(
    (l) => progressMap[l.id]?.completed
  ).length;
  const b1Completed = B1_LESSONS.filter(
    (l) => progressMap[l.id]?.completed
  ).length;
  const a2Unlocked = A1_TOTAL > 0 && a1Completed >= A1_TOTAL;
  const b1Unlocked = A2_TOTAL > 0 && a2Completed >= A2_TOTAL;
  const totalCompleted = a1Completed + a2Completed + b1Completed;

  const isLoggedIn = !authLoading && !!user;

  return (
    <PageShell>
      <PageHeader
        title="Lições"
        subtitle={`44 lessons · A1 to B1 · ${totalCompleted} completed`}
      />

      {/* Tab switcher */}
      <div className="mb-6">
        <SegmentedFilter
          options={["Curriculum", "Professor Elísio"]}
          value={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Tutor tab */}
      {activeTab === "Professor Elísio" && <TutorTabV2 />}

      {/* Curriculum tab */}
      {activeTab === "Curriculum" && (
        <>
          <LessonInfoSection />

          {/* A1 */}
          <CefrSection
            label={`A1 — Beginner · ${A1_TOTAL} lessons`}
            lessons={sorted.filter((l) => l.cefr === "A1")}
            completed={a1Completed}
            total={A1_TOTAL}
            unlocked={true}
            lockMessage=""
            progressMap={progressMap}
            sorted={sorted}
          />

          {/* A2 */}
          <CefrSection
            label={`A2 — Elementary · ${A2_TOTAL} lessons`}
            lessons={sorted.filter((l) => l.cefr === "A2")}
            completed={a2Completed}
            total={A2_TOTAL}
            unlocked={a2Unlocked}
            lockMessage="Complete all A1 lessons to unlock"
            progressMap={progressMap}
            sorted={sorted}
          />

          {/* B1 */}
          <CefrSection
            label={`B1 — Intermediate · ${B1_TOTAL} lessons`}
            lessons={sorted.filter((l) => l.cefr === "B1")}
            completed={b1Completed}
            total={B1_TOTAL}
            unlocked={b1Unlocked}
            lockMessage="Complete all A2 lessons to unlock"
            progressMap={progressMap}
            sorted={sorted}
          />

          {/* Auth CTA */}
          {!isLoggedIn && (
            <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] rounded-lg p-8 text-center">
              <p className="text-[14px] font-medium text-[#111111]">
                Sign in to save your progress
              </p>
              <p className="text-[12px] text-[#9B9DA3] mt-1">
                Inicia sessão para guardar o teu progresso
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-4 py-2 bg-[#111111] text-white rounded-lg text-[13px] font-medium hover:bg-[#333] transition-colors mt-4"
              >
                Entrar
              </Link>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
