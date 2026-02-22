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
      className={`px-3 py-1.5 rounded-full text-sm font-medium border cursor-pointer transition-all duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[#3C5E95] focus-visible:ring-offset-2 ${
        active
          ? "border-[#111827] bg-[#111827] text-white"
          : "border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#111827] bg-white"
      }${className ? ` ${className}` : ""}`}
    >
      {children}
    </button>
  );
}
