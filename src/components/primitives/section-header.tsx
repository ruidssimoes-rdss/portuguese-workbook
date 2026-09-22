import { type ReactNode } from "react";

interface SectionHeaderProps {
  children: ReactNode;
  className?: string;
}

export function SectionHeader({ children, className }: SectionHeaderProps) {
  return (
    <h2
      className={`text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted${className ? ` ${className}` : ""}`}
    >
      {children}
    </h2>
  );
}
