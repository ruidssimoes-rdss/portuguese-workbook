"use client";

import { type ReactNode } from "react";

interface SlideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Optional content to show in header next to close (e.g. "Saved" label) */
  headerExtra?: ReactNode;
  /** Accessibility label for the dialog */
  ariaLabel?: string;
}

export function SlideDrawer({
  isOpen,
  onClose,
  title,
  children,
  headerExtra,
  ariaLabel = "Drawer",
}: SlideDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/30 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-[420px] bg-[var(--bg-card)] shadow-xl flex flex-col max-h-full animate-slide-in-right"
        role="dialog"
        aria-label={ariaLabel}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-primary)] shrink-0">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
          <div className="flex items-center gap-2">
            {headerExtra}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-[12px] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-primary)] transition-colors"
              aria-label="Fechar"
            >
              Fechar
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
      </div>
    </div>
  );
}
