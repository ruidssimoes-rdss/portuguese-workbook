"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { cefrPillClass } from "@/lib/cefr";
import { lessons } from "@/data/lessons";
import { getAllLessonProgress } from "@/lib/lesson-progress";

function ProgressBar({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 mt-3">
      <div className="flex-1 h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#111827] rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[13px] font-medium text-[#9CA3AF] shrink-0">
        {completed}/{total}
      </span>
    </div>
  );
}

export default function LessonsPage() {
  const [progressMap, setProgressMap] = useState<
    Record<string, { completed: number; total: number }>
  >({});

  useEffect(() => {
    getAllLessonProgress().then(setProgressMap);
  }, []);

  const sorted = [...lessons].sort((a, b) => a.order - b.order);

  return (
    <>
      <Topbar />
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
        <div className="py-5">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-[#111827]">Lessons</h1>
            <span className="text-[13px] font-medium text-[#9CA3AF] italic">
              Lições
            </span>
          </div>
          <p className="mt-1 text-[13px] text-[#9CA3AF]">
            {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"} · A1
          </p>
          <div className="border-t border-[#F3F4F6] mt-4 mb-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
          {sorted.map((lesson) => {
            const prog = progressMap[lesson.id];
            const completed = prog?.completed ?? 0;
            const total = lesson.items.length;

            return (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.id}`}
                className="block group"
              >
                <div className="border border-[#E5E7EB] rounded-xl p-5 bg-white hover:border-[#D1D5DB] hover:shadow-sm transition-all duration-200 h-full flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
                      Lesson {lesson.order}
                    </p>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-[3px] rounded-full shrink-0 ${cefrPillClass(lesson.cefr)}`}
                    >
                      {lesson.cefr}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-semibold tracking-tight text-[#111827] mt-2">
                    {lesson.title}
                  </h3>
                  <p className="text-[13px] text-[#6B7280] italic mt-0.5">
                    {lesson.ptTitle}
                  </p>
                  <p className="text-[12px] text-[#9CA3AF] mt-2 line-clamp-2">
                    {lesson.description}
                  </p>
                  <div className="mt-auto pt-3">
                    <p className="text-[12px] text-[#9CA3AF]">
                      ~{lesson.estimatedMinutes} min · {total} items
                    </p>
                    <ProgressBar completed={completed} total={total} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {lessons.length <= 1 && (
          <p className="text-[13px] text-[#9CA3AF] pb-16">
            More lessons coming soon.
          </p>
        )}
      </main>
    </>
  );
}
