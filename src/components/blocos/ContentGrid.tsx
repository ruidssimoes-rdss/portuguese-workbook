import type { ReactNode } from "react";

interface ContentGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

/**
 * Responsive grid for Zone C content blocks.
 * Default: 1 col → 2 col → 3 col → 4 col across breakpoints.
 * Override with `columns` prop to cap max columns.
 */
export function ContentGrid({ children, columns, className }: ContentGridProps) {
  const gridClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
        ? "grid-cols-1 md:grid-cols-2"
        : columns === 3
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div className={`grid gap-6 ${gridClass} ${className ?? ""}`}>
      {children}
    </div>
  );
}
