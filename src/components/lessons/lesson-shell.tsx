"use client";

import Link from "next/link";
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

function CEFRPill({ level }: { level: string }) {
  const colors =
    level === "A1" ? "text-[#0F6E56] bg-[#E1F5EE]" :
    level === "A2" ? "text-[#185FA5] bg-[#E6F1FB]" :
    "text-[#854F0B] bg-[#FAEEDA]";
  return <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${colors}`}>{level}</span>;
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
  const isIntro = currentState === "intro";

  return (
    <div>
      {/* Top bar — always visible */}
      <div className="flex items-center justify-between py-4">
        <Link
          href="/lessons"
          className="text-[13px] text-[#9B9DA3] hover:text-[#6C6B71] transition-colors"
        >
          ← Lições
        </Link>
        <div className="flex items-center gap-3">
          {currentState === "results" && (
            <>
              <NoteContextActions contextType="lesson" contextId={lessonId} contextLabel={lessonTitle} />
              <ContentCalendarInfo contentType="lesson" contentId={lessonId} />
            </>
          )}
          {showProgress && (
            <span className="text-[13px] text-[#6C6B71] font-medium">{lessonTitle}</span>
          )}
          <CEFRPill level={cefr} />
        </div>
      </div>

      {/* Progress bar — learn/sections only */}
      {showProgress && sectionProgress !== undefined && (
        <div className="mb-4">
          <div className="h-1.5 bg-[rgba(0,0,0,0.06)] rounded-full overflow-hidden mb-1.5">
            <div
              className="h-1.5 bg-[#185FA5] rounded-full transition-all duration-300"
              style={{ width: `${sectionProgress}%` }}
            />
          </div>
          {progressLabel && (
            <p className="text-[10px] text-[#9B9DA3] uppercase tracking-[0.05em]">{progressLabel}</p>
          )}
        </div>
      )}

      {/* Content */}
      <div className="max-w-2xl mx-auto pb-8">{children}</div>
    </div>
  );
}
