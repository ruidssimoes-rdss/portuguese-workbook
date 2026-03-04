"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { lessons, getLessonItemCount } from "@/data/lessons";
import { getAllLessonProgress } from "@/lib/lesson-progress";
import { useAuth } from "@/components/auth-provider";

export function LessonPreview() {
  const { user, loading: authLoading } = useAuth();
  const [progressMap, setProgressMap] = useState<
    Record<string, { completed: number; total: number }>
  >({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoaded(true);
      return;
    }
    getAllLessonProgress().then((data) => {
      setProgressMap(data);
      setLoaded(true);
    });
  }, [user]);

  if (authLoading || !loaded) return null;

  const sorted = [...lessons].sort((a, b) => a.order - b.order);

  const activeLesson =
    sorted.find((l) => {
      const prog = progressMap[l.id];
      if (!prog) return true;
      return prog.completed < getLessonItemCount(l);
    }) ?? sorted[0];

  if (!activeLesson) return null;

  const prog = progressMap[activeLesson.id];
  const completedCount = prog?.completed ?? 0;
  const totalItems = getLessonItemCount(activeLesson);
  const allComplete = completedCount >= totalItems && totalItems > 0;
  const hasStarted = completedCount > 0;
  const pct = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  return (
    <div className="mt-6">
      <Link href={`/lessons/${activeLesson.id}`} className="block group">
        <div
          className="relative overflow-hidden rounded-2xl border border-[#003399]/15 p-8 transition-all duration-300 hover:shadow-xl"
          style={{
            background: "linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)",
          }}
        >
          <span
            className="absolute bottom-0 right-6 text-[120px] font-black leading-none select-none pointer-events-none"
            style={{ color: "rgba(0,51,153,0.04)" }}
          >
            {activeLesson.cefr}
          </span>
          <div className="relative flex items-start justify-between mb-2">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#003399]">
                {allComplete
                  ? "All Lessons Complete"
                  : hasStarted
                    ? "Continue Learning"
                    : "Start Learning"}
              </p>
              <p className="text-3xl font-bold text-text tracking-tight mt-3">
                {activeLesson.title}
              </p>
              <p className="text-base text-text-secondary italic mt-1">
                {activeLesson.ptTitle}
              </p>
            </div>
            <span className="shrink-0 bg-[#003399] text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {activeLesson.cefr}
            </span>
          </div>
          <div className="relative flex items-center gap-2 mt-4 flex-wrap">
            <span className="text-xs text-text-muted bg-white border border-border rounded-full px-3 py-1">
              ~{activeLesson.estimatedMinutes} min
            </span>
            <span className="text-xs text-text-muted bg-white border border-border rounded-full px-3 py-1">
              {activeLesson.stages.length} stages
            </span>
          </div>
          <div className="relative mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium text-text-secondary">Progresso</span>
              <span className="text-xs font-semibold text-[#003399]">
                {completedCount} / {totalItems}
              </span>
            </div>
            <div className="h-2 bg-white/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#003399] rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
