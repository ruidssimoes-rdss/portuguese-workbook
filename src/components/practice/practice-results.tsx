"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface MistakeItem {
  id: string;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  wasCorrect: boolean;
}

interface PracticeResultsProps {
  title: string;
  subtitle: string;
  score: number;
  total: number;
  timeMs: number;
  mistakes: MistakeItem[];
  onTryAgain: () => void;
  onNew: () => void;
  tryAgainLabel: string;
  newLabel: string;
  backHref: string;
  backLabel: string;
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export function PracticeResults({
  title,
  subtitle,
  score,
  total,
  timeMs,
  mistakes,
  onTryAgain,
  onNew,
  tryAgainLabel,
  newLabel,
  backHref,
  backLabel,
}: PracticeResultsProps) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / total) * circumference;
  const [mounted, setMounted] = useState(false);
  const svgRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="max-w-xl mx-auto text-center animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-[#6B7280] mt-0.5">{subtitle}</p>
      <p className="text-4xl font-bold text-gray-900 mt-6">
        {score} / {total} correct
      </p>
      <p className="text-2xl font-semibold text-gray-600 mt-1">{pct}%</p>

      <div className="inline-flex items-center justify-center w-32 h-32 mt-6 relative">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#EBF2FA"
            strokeWidth="8"
          />
          <circle
            ref={svgRef}
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#111827"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={mounted ? strokeDashoffset : circumference}
            style={{
              transition: "stroke-dashoffset 1s ease-out",
            }}
          />
        </svg>
      </div>

      <p className="text-sm text-gray-500 mt-4">Time: {formatTime(timeMs)}</p>

      {mistakes.length > 0 && (
        <div className="mt-8 text-left border-t border-gray-100 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Mistakes to review
          </p>
          <ul className="space-y-0">
            {mistakes.map((m) => (
              <li
                key={m.id}
                className="py-3 border-b border-gray-50 last:border-0 text-sm"
              >
                <p className="font-medium text-gray-900">{m.prompt}</p>
                <p className="mt-1 text-gray-500">
                  Your answer: <span className="text-red-600">{m.userAnswer || "(blank)"}</span>
                  {!m.wasCorrect && (
                    <>
                      {" "}
                      Correct: <span className="text-emerald-600 font-medium">{m.correctAnswer}</span>
                    </>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <button
          type="button"
          onClick={onTryAgain}
          className="border border-[#111827] text-[#111827] hover:bg-[#F3F4F6] rounded-xl px-6 py-3 text-sm font-medium transition-colors duration-200"
        >
          {tryAgainLabel}
        </button>
        <button
          type="button"
          onClick={onNew}
          className="bg-[#111827] hover:bg-[#1F2937] text-white rounded-xl px-6 py-3 text-sm font-medium transition-colors duration-200"
        >
          {newLabel}
        </button>
      </div>

      <Link
        href={backHref}
        className="text-sm text-gray-400 hover:text-gray-600 mt-4 inline-block"
      >
        {backLabel}
      </Link>
    </div>
  );
}
