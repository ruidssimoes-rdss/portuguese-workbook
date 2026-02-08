import { type ReactNode } from "react";

const variants = {
  green: "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]",
  brown: "bg-[#fef7ed] text-[#9a3412] border-[#fdba74]",
  purple: "bg-[#ececfb] text-[#6366f1] border-[#6366f1]",
  blue: "bg-[#eff6ff] text-[#1d4ed8] border-[#93c5fd]",
  yellow: "bg-[#fefce8] text-[#a16207] border-[#fde047]",
  pink: "bg-[#fdf2f8] text-[#be185d] border-[#f9a8d4]",
  orange: "bg-[#fff7ed] text-[#c2410c] border-[#fdba74]",
  gray: "bg-[#f4f4f5] text-[#52525b] border-[#d4d4d8]",
  red: "bg-[#fef2f2] text-[#dc2626] border-[#fca5a5]",
  black: "bg-[#f5f5f5] text-[#171717] border-[#a3a3a3]",
} as const;

type BadgeVariant = keyof typeof variants;

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({
  children,
  variant = "gray",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold px-3 py-[3px] rounded-xl border whitespace-nowrap leading-[15px] tracking-[0.11px] ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// Convenience maps for data → variant
export const groupVariant: Record<string, BadgeVariant> = {
  Irregular: "orange",
  "Regular -AR": "green",
  "Regular -ER": "blue",
  "Regular -IR": "purple",
};

export const cefrVariant: Record<string, BadgeVariant> = {
  A1: "green",
  A2: "blue",
  B1: "yellow",
  B2: "pink",
};

export const priorityVariant: Record<string, BadgeVariant> = {
  Essential: "red",
  Core: "blue",
  Useful: "gray",
};

export const tenseVariant: Record<string, BadgeVariant> = {
  Present: "green",
  Preterite: "brown",
  Imperfect: "purple",
  Future: "blue",
  Conditional: "yellow",
  "Present Subjunctive": "pink",
};
