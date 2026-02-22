"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { getAllExams } from "@/data/exams";
import { getAllExamResults, type ExamResult } from "@/lib/exam-progress";

const exams = getAllExams();

function DifficultyDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-1" title={`Difficulty ${level}/3`}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${
            i <= level ? "bg-[#111827]" : "bg-[#E5E7EB]"
          }`}
        />
      ))}
    </div>
  );
}

function ClassificationBadge({
  classification,
  score,
}: {
  classification: string;
  score: number;
}) {
  const styles: Record<string, string> = {
    "Muito Bom": "text-amber-700 bg-amber-50 border-amber-200",
    Bom: "text-blue-700 bg-blue-50 border-blue-200",
    Suficiente: "text-emerald-700 bg-emerald-50 border-emerald-200",
    "Not yet": "text-[#6B7280] bg-[#F9FAFB] border-[#E5E7EB]",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${styles[classification] ?? styles["Not yet"]}`}
    >
      <span>{Math.round(score)}%</span>
      <span>·</span>
      <span>{classification}</span>
    </div>
  );
}

export default function ExamsPage() {
  const [results, setResults] = useState<Record<string, ExamResult>>({});

  useEffect(() => {
    getAllExamResults().then(setResults).catch(() => {});
  }, []);

  return (
    <>
      <Topbar />
      <main className="max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10">
        <div className="py-5">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-[#111827]">
              CIPLE Mock Exams
            </h1>
            <span className="text-[13px] font-medium text-[#9CA3AF] italic">
              Exames de Preparação CIPLE
            </span>
          </div>
          <p className="mt-1 text-[13px] text-[#9CA3AF]">
            Monthly mock exams to prepare for the CIPLE A2 certification. New
            exams released each month.
          </p>
          <div className="border-t border-[#F3F4F6] mt-4 mb-6" />
        </div>

        {/* CIPLE format info banner */}
        <div className="border border-[#E5E7EB] rounded-xl p-5 bg-[#FAFAFA] mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted mb-2">
            About the CIPLE A2 Exam
          </p>
          <p className="text-[13px] text-[#6B7280] leading-relaxed">
            Each mock exam simulates the full CIPLE A2 format with 3 sections:
            Reading & Writing (45%), Listening (30%), and Speaking (25%).
            Scores are classified as{" "}
            <span className="font-semibold text-[#111827]">Suficiente</span>{" "}
            (55%),{" "}
            <span className="font-semibold text-[#111827]">Bom</span>{" "}
            (70%), or{" "}
            <span className="font-semibold text-[#111827]">Muito Bom</span>{" "}
            (85%).
          </p>
        </div>

        {/* Exam grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-16">
          {exams.map((exam) => {
            const result = results[exam.id];
            const isAvailable = exam.available;

            if (!isAvailable) {
              return (
                <div
                  key={exam.id}
                  className="border border-[#F3F4F6] rounded-xl p-5 bg-[#FAFAFA] opacity-60 h-full flex flex-col"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#D1D5DB]">
                      {exam.monthPt}
                    </p>
                    <DifficultyDots level={exam.difficulty} />
                  </div>
                  <h3 className="text-[15px] font-semibold text-[#D1D5DB] mt-2">
                    {exam.titlePt}
                  </h3>
                  <div className="flex items-center gap-2 mt-auto pt-4">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#D1D5DB"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span className="text-[12px] font-medium text-[#D1D5DB]">
                      Em breve
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={exam.id}
                href={`/exams/${exam.id}`}
                className="block group"
              >
                <div className="border border-[#E5E7EB] rounded-xl p-5 bg-white hover:border-[#D1D5DB] hover:shadow-sm transition-all duration-200 h-full flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9CA3AF]">
                      {exam.monthPt}
                    </p>
                    <DifficultyDots level={exam.difficulty} />
                  </div>
                  <h3 className="text-[15px] font-semibold tracking-tight text-[#111827] mt-2">
                    {exam.titlePt}
                  </h3>
                  <p className="text-[13px] text-[#6B7280] italic mt-0.5">
                    {exam.title}
                  </p>
                  <p className="text-[12px] text-[#9CA3AF] mt-2 line-clamp-2">
                    {exam.descriptionPt}
                  </p>
                  <div className="mt-auto pt-3">
                    <p className="text-[12px] text-[#9CA3AF]">
                      3 secções · ~{exam.sections.reduce((s, sec) => s + sec.timeMinutes, 0)} min
                    </p>
                    {result ? (
                      <div className="mt-2">
                        <ClassificationBadge
                          classification={result.classification}
                          score={result.overallScore}
                        />
                      </div>
                    ) : (
                      <div className="mt-2">
                        <span className="text-[12px] font-medium text-[#3C5E95]">
                          Iniciar exame →
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </>
  );
}
