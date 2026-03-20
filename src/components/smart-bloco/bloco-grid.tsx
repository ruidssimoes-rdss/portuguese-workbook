import type { ReactNode } from "react";

interface BlocoGridProps {
  children: ReactNode;
  className?: string;
  /** Fixed column count (overrides auto-fill) */
  columns?: number;
  /** Minimum card width for auto-fill (default: 280px) */
  minWidth?: number;
}

export function BlocoGrid({ children, className = "", columns, minWidth = 280 }: BlocoGridProps) {
  const gridTemplateColumns = columns
    ? `repeat(${columns}, 1fr)`
    : `repeat(auto-fill, minmax(min(100%, ${minWidth}px), 1fr))`;

  return (
    <div
      className={`grid gap-[20px] ${className}`}
      style={{ gridTemplateColumns }}
    >
      {children}
    </div>
  );
}
