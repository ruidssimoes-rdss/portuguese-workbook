export function SectionLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-label font-medium uppercase text-text-quaternary ${className}`}>{children}</p>
  );
}
