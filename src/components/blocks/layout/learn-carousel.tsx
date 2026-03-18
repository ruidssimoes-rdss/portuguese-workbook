"use client";

import { useState, useEffect, useCallback } from "react";
import type { LearnCarouselProps } from "@/types/blocks";
import { patterns } from "@/lib/design-tokens";

export function LearnCarousel({
  items,
  onComplete,
  className,
  children,
}: LearnCarouselProps & { children?: (index: number) => React.ReactNode }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewedItems, setViewedItems] = useState<Set<number>>(new Set([0]));
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const total = items.length;
  const allViewed = viewedItems.size >= total;
  const isLast = currentIndex === total - 1;

  // Mark current item as viewed
  useEffect(() => {
    setViewedItems((prev) => new Set([...prev, currentIndex]));
  }, [currentIndex]);

  const goNext = useCallback(() => {
    if (isLast && allViewed) {
      onComplete();
      return;
    }
    if (currentIndex < total - 1) {
      setDirection("forward");
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, total, isLast, allViewed, onComplete]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection("backward");
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Enter" && isLast && allViewed) onComplete();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev, isLast, allViewed, onComplete]);

  // Touch swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);

  return (
    <div
      className={className}
      onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStart === null) return;
        const diff = e.changedTouches[0].clientX - touchStart;
        if (diff > 50) goPrev();
        else if (diff < -50) goNext();
        setTouchStart(null);
      }}
    >
      {/* Counter */}
      <div className="flex justify-end mb-3">
        <span className="text-[13px] text-[#9CA3AF]">
          {currentIndex + 1} of {total}
        </span>
      </div>

      {/* Content area with slide animation */}
      <div className="overflow-hidden">
        <div
          key={currentIndex}
          className="transition-all duration-200 ease-out"
          style={{
            animation: `${direction === "forward" ? "slideInRight" : "slideInLeft"} 200ms ease-out`,
          }}
        >
          {children ? children(currentIndex) : null}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className={`${patterns.button.secondary} h-10 px-5 ${
            currentIndex === 0 ? "opacity-40 cursor-not-allowed" : ""
          }`}
        >
          Previous
        </button>
        <button
          onClick={goNext}
          disabled={isLast && !allViewed}
          className={`${patterns.button.primary} h-10 px-5 ${
            isLast && !allViewed ? "opacity-40 cursor-not-allowed" : ""
          }`}
          title={isLast && !allViewed ? "View all items first" : undefined}
        >
          {isLast ? "Start Practice" : "Next"}
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-4">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-150 ${
              i === currentIndex
                ? "bg-[#111827]"
                : viewedItems.has(i)
                  ? "bg-[#111827] opacity-40"
                  : "bg-[#E5E7EB]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
