import type { ContentGridProps } from "@/types/blocks";

const GRID_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

const GAP_SIZE: Record<string, string> = {
  tight: "gap-2",
  normal: "gap-4",
  loose: "gap-6",
};

export function ContentGrid({
  columns = 3,
  gap = "normal",
  className,
  children,
}: ContentGridProps & { children?: React.ReactNode }) {
  return (
    <div className={`grid ${GRID_COLS[columns]} ${GAP_SIZE[gap]} ${className ?? ""}`}>
      {children}
    </div>
  );
}
