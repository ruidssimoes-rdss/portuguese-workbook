"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { createPlannedEvent } from "@/lib/calendar-service";

const STUDY_LOG_COLOR = "#6B7280";

interface StudyLogButtonProps {
  contextTitle: string;
  contextType: string;
}

export function StudyLogButton({ contextTitle, contextType }: StudyLogButtonProps) {
  const { user, loading: authLoading } = useAuth();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [logged, setLogged] = useState(false);
  const [saving, setSaving] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!popoverOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popoverOpen]);

  const title = `Studied: ${contextTitle} (${contextType})`;

  const handleLog = async () => {
    setSaving(true);
    try {
      await createPlannedEvent({
        title,
        eventDate: new Date().toISOString().slice(0, 10),
        allDay: true,
        color: STUDY_LOG_COLOR,
      });
      setPopoverOpen(false);
      setLogged(true);
      setTimeout(() => setLogged(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="relative inline-flex" ref={popoverRef}>
      <button
        type="button"
        onClick={() => !logged && setPopoverOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#003399] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v4M10 18h4" />
        </svg>
        {logged ? "Logged!" : "Log study"}
      </button>
      {logged && (
        <span className="ml-1 inline-flex items-center text-xs text-green-600" aria-hidden>
          <svg className="w-3.5 h-3.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
      )}
      {popoverOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-lg border border-gray-200 bg-white shadow-lg p-4">
          <p className="text-xs font-medium text-gray-500 mb-1">Log to calendar</p>
          <p className="text-sm font-medium text-gray-900 mb-3 line-clamp-2">{title}</p>
          <button
            type="button"
            onClick={handleLog}
            disabled={saving}
            className="w-full py-2 text-sm font-medium text-white bg-[#003399] rounded-lg hover:bg-[#002266] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Log"}
          </button>
        </div>
      )}
    </div>
  );
}
