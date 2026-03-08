"use client";

import { useEffect, useState } from "react";
import { getContentCalendarInfo, type ContentCalendarInfoResult } from "@/lib/calendar-service";

const MESES_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

function formatPortugueseDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return `${date.getDate()} de ${MESES_PT[date.getMonth()]}`;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

export interface ContentCalendarInfoProps {
  contentType: "lesson" | "grammar" | "verb" | "vocabulary";
  contentId: string;
}

export function ContentCalendarInfo({ contentType, contentId }: ContentCalendarInfoProps) {
  const [info, setInfo] = useState<ContentCalendarInfoResult | null>(null);

  useEffect(() => {
    getContentCalendarInfo(contentType, contentId).then(setInfo);
  }, [contentType, contentId]);

  if (!info) return null;

  if (info.completedDate) {
    return (
      <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#16A34A]">
        <CheckIcon className="w-3.5 h-3.5 shrink-0" />
        Concluído a {formatPortugueseDate(info.completedDate)}
      </span>
    );
  }

  if (info.scheduledDate) {
    const label = contentType === "lesson" ? "Agendado para" : "Revisão agendada para";
    return (
      <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#0EA5E9]">
        <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
        {label} {formatPortugueseDate(info.scheduledDate)}
      </span>
    );
  }

  if (info.lastReviewDate) {
    return (
      <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#9CA3AF]">
        Última revisão: {formatPortugueseDate(info.lastReviewDate)}
      </span>
    );
  }

  return null;
}
