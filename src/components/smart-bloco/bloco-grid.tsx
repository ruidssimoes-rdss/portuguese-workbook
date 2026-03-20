import type { ReactNode } from "react";

interface BlocoGridProps {
  children: ReactNode;
  className?: string;
}

export function BlocoGrid({ children, className = "" }: BlocoGridProps) {
  return (
    <div
      className={`grid gap-[20px] ${className}`}
      style={{
        gridTemplateColumns:
          "repeat(auto-fill, minmax(min(100%, 340px), 1fr))",
      }}
    >
      {children}
    </div>
  );
}
