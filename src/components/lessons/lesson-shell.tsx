"use client";

import Link from "next/link";
import { CEFRBadge } from "@/components/ui/badge";
import { NoteContextActions } from "@/components/notes/note-context-actions";
import { ContentCalendarInfo } from "@/components/calendar/content-calendar-info";

type Round = "intro" | "learn" | "practice" | "apply" | "results";

interface LessonShellProps {
  lessonId: string;
  lessonTitle: string;
  lessonTitlePt: string;
  cefr: string;
  currentRound: Round;
  skippedLearn?: boolean;
  roundProgress: number;
  progressLabel: string;
  children: React.ReactNode;
}

const ROUND_ORDER: Round[] = ["learn", "practice", "apply"];
const ROUND_LABELS: Record<string, string> = {
  learn: "Aprender",
  practice: "Praticar",
  apply: "Aplicar",
};

export function LessonShell({
  lessonId,
  lessonTitle,
  lessonTitlePt,
  cefr,
  currentRound,
  skippedLearn,
  roundProgress,
  progressLabel,
  children,
}: LessonShellProps) {
  const roundIndex = ROUND_ORDER.indexOf(currentRound);
  const showRoundNav = currentRound !== "results" && currentRound !== "intro";

  return (
    <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
      {/* Header */}
      <div className="py-5">
        <Link
          href="/lessons"
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-3"
        >
          <span>&larr;</span> Lições
        </Link>

        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {lessonTitle}
            </h1>
            <p className="text-[13px] font-medium text-[var(--text-secondary)] italic">
              {lessonTitlePt}
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap shrink-0">
            <NoteContextActions
              contextType="lesson"
              contextId={lessonId}
              contextLabel={lessonTitle}
            />
            <ContentCalendarInfo contentType="lesson" contentId={lessonId} />
            <CEFRBadge level={cefr} />
          </div>
        </div>

        {showRoundNav && (
          <>
            {/* Round indicator */}
            <div className="flex items-center gap-6 mb-3">
              {ROUND_ORDER.map((round, i) => {
                const isSkipped = round === "learn" && skippedLearn;
                const isCurrent = round === currentRound;
                const isComplete = !isSkipped && i < roundIndex;

                return (
                  <div key={round} className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isCurrent
                          ? "bg-[#003399]"
                          : isComplete
                            ? "bg-[#059669]"
                            : isSkipped
                              ? "bg-[var(--border-primary)]"
                              : "bg-[var(--border-primary)]"
                      }`}
                    />
                    <span
                      className={`text-[13px] font-medium ${
                        isCurrent
                          ? "text-[var(--text-primary)]"
                          : isComplete
                            ? "text-[#059669]"
                            : isSkipped
                              ? "text-[var(--text-muted)] line-through"
                              : "text-[var(--text-muted)]"
                      }`}
                    >
                      {ROUND_LABELS[round]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-[var(--border-light)] rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[var(--text-primary)] rounded-full transition-all duration-500"
                style={{ width: `${roundProgress}%` }}
              />
            </div>

            {/* Counter */}
            <p className="text-[12px] text-[var(--text-muted)]">{progressLabel}</p>
          </>
        )}
      </div>

      <div className="border-t border-[var(--border-light)] mb-6" />

      {/* Content */}
      <div className="pb-16">{children}</div>
    </main>
  );
}
