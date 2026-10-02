"use client";

import { type ReactNode } from "react";
import { X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex justify-end p-2">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} aria-hidden />
      <div
        className="animate-slide-in-right relative flex max-h-full w-full max-w-[440px] flex-col overflow-hidden rounded-2xl border border-aula-border bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
        role="dialog"
        aria-label={ariaLabel}
      >
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-aula-line px-4">
          <h2 className="flex-1 truncate text-[13px] font-medium text-aula-text">{title}</h2>
          {headerExtra}
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-aula-text-3 transition-colors hover:bg-aula-sunken hover:text-aula-text"
            aria-label="Fechar"
          >
            <X size={15} strokeWidth={1.5} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
