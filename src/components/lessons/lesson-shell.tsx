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
          className="inline-flex items-center gap-1 text-[13px] font-medium text-[#6C6B71] hover:text-[#111111] transition-colors mb-3"
        >
          <span>&larr;</span> Lições
        </Link>

        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-medium text-[#111111]">
              {lessonTitle}
            </h1>
            <p className="text-[13px] font-medium text-[#6C6B71] italic">
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
            <div className="h-1 bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[#185FA5] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${sectionProgress}%` }}
              />
            </div>
            {progressLabel && (
              <p className="text-[12px] text-[#9B9DA3]">{progressLabel}</p>
            )}
          </>
        )}
      </div>

      <div className="border-[0.5px] border-[rgba(0,0,0,0.06)] mb-6" />

      {/* Content */}
      <div className="max-w-2xl mx-auto pb-16">{children}</div>
    </main>
  );
}
