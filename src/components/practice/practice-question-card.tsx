"use client";

import { type ReactNode } from "react";

interface PracticeQuestionCardProps {
  children: ReactNode;
  className?: string;
}

export function PracticeQuestionCard({ children, className = "" }: PracticeQuestionCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-lg mx-auto animate-fade-in-up ${className}`}
    >
      {children}
    </div>
  );
}
