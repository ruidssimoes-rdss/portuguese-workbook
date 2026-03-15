"use client";

import Link from "next/link";
import { CEFRBadge } from "@/components/ui/badge";
import { NoteContextActions } from "@/components/notes/note-context-actions";
import { ContentCalendarInfo } from "@/components/calendar/content-calendar-info";

type LessonState = "intro" | "learn" | "sections" | "results";

interface LessonShellProps {
  lessonId: string;
  lessonTitle: string;
  lessonTitlePt: string;
  cefr: string;
  currentState: LessonState;
  sectionProgress?: number;
  progressLabel?: string;
  children: React.ReactNode;
}

export function LessonShell({
  lessonId,
  lessonTitle,
  lessonTitlePt,
  cefr,
  currentState,
  sectionProgress,
  progressLabel,
  children,
}: LessonShellProps) {
  const showProgress = currentState === "sections" || currentState === "learn";

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
            <NoteContextActions contextType="lesson" contextId={lessonId} contextLabel={lessonTitle} />
            <ContentCalendarInfo contentType="lesson" contentId={lessonId} />
            <CEFRBadge level={cefr} />
          </div>
        </div>

        {showProgress && sectionProgress !== undefined && (
          <>
            <div className="h-1 bg-[var(--border-light)] rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[#003399] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${sectionProgress}%` }}
              />
            </div>
            {progressLabel && (
              <p className="text-[12px] text-[var(--text-muted)]">{progressLabel}</p>
            )}
          </>
        )}
      </div>

      <div className="border-t border-[var(--border-light)] mb-6" />

      {/* Content */}
      <div className="max-w-2xl mx-auto pb-16">{children}</div>
    </main>
  );
}
