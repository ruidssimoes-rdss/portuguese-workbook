"use client";

import { useState, useEffect } from "react";
import type { ExercisePhase } from "./exercise-state";

interface ExerciseChromeProps {
  currentIndex: number;
  totalCount: number;
  phase?: ExercisePhase;
  onSkip?: () => void;
  children: React.ReactNode;
}

export function ExerciseChrome({
  currentIndex,
  totalCount,
  phase = "active",
  onSkip,
  children,
}: ExerciseChromeProps) {
  const progress = totalCount > 0 ? ((currentIndex + 1) / totalCount) * 100 : 0;
  const [showSkip, setShowSkip] = useState(false);

  // Show skip button after 5s of inactivity
  useEffect(() => {
    setShowSkip(false);
    if (!onSkip) return;
    const timer = setTimeout(() => setShowSkip(true), 5000);
    return () => clearTimeout(timer);
  }, [currentIndex, onSkip]);

  const transitionClass =
    phase === "transitioning" ? "exercise-exit" :
    phase === "active" ? "exercise-enter" : "";

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px] text-[#9CA3AF]" key={currentIndex}>
          <span className="fade-in">{currentIndex + 1}</span> of {totalCount}
        </span>
        {onSkip && showSkip && (
          <button
            onClick={onSkip}
            className="text-[13px] text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer fade-in"
          >
            Skip
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-[#F3F4F6] mb-6 overflow-hidden">
        <div
          className="h-1 rounded-full bg-[#003399] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content area with transitions */}
      <div className="relative min-h-[200px] overflow-hidden">
        <div key={currentIndex} className={transitionClass}>
          {children}
        </div>
      </div>
    </div>
  );
}
