"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { CEFRBadge } from "@/components/ui/badge";
import { lessons, getLessonItemCount } from "@/data/lessons";
import { getAllLessonProgress } from "@/lib/lesson-progress";
import { useAuth } from "@/components/auth-provider";
import { ProgressBar } from "@/components/ui/progress-bar";

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

  return (
    <div className="mt-6">
      <Link href={`/lessons/${activeLesson.id}`} className="block group">
        <Card interactive>
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF] mb-2">
                {allComplete
                  ? "All Lessons Complete"
                  : hasStarted
                    ? "Continue Learning"
                    : "Start Learning"}
              </p>
              <p className="text-[18px] font-semibold text-[#111827]">
                {activeLesson.title}
              </p>
              <p className="text-[13px] font-medium text-[#6B7280] italic mt-0.5">
                {activeLesson.ptTitle}
              </p>
            </div>
            <CEFRBadge level={activeLesson.cefr} className="shrink-0" />
          </div>
          <p className="text-[13px] font-medium text-[#9CA3AF] mt-2">
            ~{activeLesson.estimatedMinutes} min · {activeLesson.stages.length}{" "}
            stages
          </p>
          <ProgressBar completed={completedCount} total={totalItems} className="mt-3" />
        </Card>
      </Link>
    </div>
  );
}
