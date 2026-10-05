/**
 * PageShell — the note-area column for pages not yet redesigned.
 * The frame itself (explorer, header, panel) comes from the (app) layout.
 */

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[960px] px-10 pt-6 pb-16">
      {children}
    </div>
  );
}
