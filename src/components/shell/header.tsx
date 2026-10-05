"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Top of the note area: history arrows, then the page's breadcrumb and actions (from the @header slot). */
export function Header({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <header className="flex h-header shrink-0 items-center gap-3 pr-5 pl-5">
      <div className="flex items-center gap-0.5">
        <HistoryButton label="Voltar (⌘[)" onClick={() => router.back()}>
          <ChevronLeft aria-hidden className="size-4" strokeWidth={1.75} />
        </HistoryButton>
        <HistoryButton label="Avançar (⌘])" onClick={() => router.forward()}>
          <ChevronRight aria-hidden className="size-4" strokeWidth={1.75} />
        </HistoryButton>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">{children}</div>
    </header>
  );
}

function HistoryButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-6 items-center justify-center rounded-row text-text-quaternary transition-colors hover:bg-surface-hover hover:text-text-primary"
    >
      {children}
    </button>
  );
}
