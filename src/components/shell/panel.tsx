/** The right-hand zone. Rendered by a page's @panel slot; absent when a page has none. */
export function Panel({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <aside
      aria-label={label}
      className="h-full w-panel shrink-0 overflow-y-auto border-l border-border-subtle bg-surface-side px-[18px] pt-[18px] pb-8"
    >
      {children}
    </aside>
  );
}
