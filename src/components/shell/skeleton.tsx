/** A static placeholder block. Give it the exact size of what it stands in for. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block rounded-xs bg-surface-hover ${className}`} />;
}
