"use client";

import { type ReactNode } from "react";

interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}

export function FilterPill({ active, onClick, children, className }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border cursor-pointer transition-all duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent] focus-visible:ring-offset-2 ${
        active
          ? "border-text bg-text text-bg"
          : "border-border text-text-secondary hover:border-[#D1D5DB] hover:text-text transition-colors bg-bg"
      }${className ? ` ${className}` : ""}`}
    >
      {children}
    </button>
  );
}
